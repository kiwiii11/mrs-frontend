import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/api/movies/${id}`).then(setMovie).catch((e) => setError(e.message));
    api(`/api/showtimes?movieId=${id}`).then(setShowtimes).catch((e) => setError(e.message));
  }, [id]);

  // group showtimes by theatre
  const byTheater = {};
  showtimes.forEach((s) => {
    (byTheater[s.theater] ||= []).push(s);
  });

  const fmtDate = (t) =>
    new Date(t).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const fmtTime = (t) =>
    new Date(t).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

  if (error) return <p className="error">{error}</p>;
  if (!movie) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/">← Back to movies</Link>

      <div className="detail">
        {movie.posterUrl && <img className="detail-poster" src={movie.posterUrl} alt={movie.title} />}
        <div>
          <h1>{movie.title}</h1>
          <p className="meta">{movie.genre} • {movie.duration} min</p>
          <div className="badges">
            <span className="rating">⭐ {movie.rating != null ? movie.rating.toFixed(1) : "N/A"}</span>
            {movie.ageLimit && <span className="age">{movie.ageLimit}</span>}
          </div>
          <p>{movie.description}</p>
        </div>
      </div>

      <h2>Showtimes</h2>
      {showtimes.length === 0 && <p>No showtimes available yet.</p>}

      {Object.entries(byTheater).map(([theater, list]) => (
        <div className="theater-block" key={theater}>
          <h3>{theater}</h3>
          <div className="slots">
            {list.map((s) => (
              <Link className="slot" key={s.id} to={`/showtimes/${s.id}`}>
                <strong>{fmtDate(s.startTime)}</strong>
                <span>{fmtTime(s.startTime)}</span>
                <small>₹{s.price}</small>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}