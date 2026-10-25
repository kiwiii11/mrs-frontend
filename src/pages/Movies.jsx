import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/movies").then(setMovies).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Now Showing</h1>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {movies.map((movie) => (
          <Link className="card" key={movie.id} to={`/movies/${movie.id}`}>
            {movie.posterUrl && (
              <img className="poster" src={movie.posterUrl} alt={movie.title} />
            )}
            <h2>{movie.title}</h2>
            <p className="meta">
              {movie.genre} • {movie.duration} min
            </p>
            <div className="badges">
              <span className="rating">
                ⭐ {movie.rating != null ? movie.rating.toFixed(1) : "N/A"}
              </span>
              {movie.ageLimit && <span className="age">{movie.ageLimit}</span>}
            </div>
            <p className="desc">{movie.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}