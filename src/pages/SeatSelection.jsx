import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const WAITLIST = "/api/waitlist"; // change if your controller uses a different path

export default function SeatSelection() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api(`/api/showtimes/${id}`).then(setShowtime).catch((e) => setError(e.message));
    api(`/api/showtimes/${id}/seats`).then(setSeats).catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const rows = {};
  seats.forEach((s) => (rows[s.rowLabel] ||= []).push(s));
  const rowNames = Object.keys(rows).sort();
  rowNames.forEach((r) => rows[r].sort((a, b) => a.seatNumber - b.seatNumber));

  // booked seats can be selected too, which means "join the waitlist for it"
  const toggle = (seat) =>
    setSelected((prev) =>
      prev.includes(seat.seatId) ? prev.filter((x) => x !== seat.seatId) : [...prev, seat.seatId]
    );

  const hasTaken = seats.some((s) => selected.includes(s.seatId) && !s.available);

  const submit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(hasTaken ? WAITLIST : "/api/reservations", {
        method: "POST",
        body: { showtimeId: Number(id), seatIds: selected },
      });
      navigate("/my-bookings");
    } catch (e) {
      setError(e.message);
      setSelected([]);
      load();
    } finally {
      setBusy(false);
    }
  };

  if (!showtime) return error ? <p className="error">{error}</p> : <p>Loading...</p>;

  const when = new Date(showtime.startTime).toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });
  const total = selected.length * Number(showtime.price);
  const labels = seats
    .filter((s) => selected.includes(s.seatId))
    .map((s) => `${s.rowLabel}${s.seatNumber}`)
    .join(", ");

  const seatClass = (s) => {
    const isSel = selected.includes(s.seatId);
    if (!s.available) return isSel ? "waitlisted" : "booked";
    return isSel ? "selected" : "";
  };

  return (
    <div>
      <Link to={`/movies/${showtime.movieId}`}>← Back to showtimes</Link>
      <h1>{showtime.movieTitle}</h1>
      <p className="meta">{showtime.theater} • {when} • ₹{showtime.price} per seat</p>

      {error && <p className="error">{error}</p>}

      <div className="screen">SCREEN</div>

      <div className="seat-map">
        {rowNames.map((row) => (
          <div className="seat-row" key={row}>
            <span className="row-label">{row}</span>
            {rows[row].map((s) => (
              <button
                key={s.seatId}
                type="button"
                className={"seat " + seatClass(s)}
                onClick={() => toggle(s)}
                title={s.available ? `${s.rowLabel}${s.seatNumber}` : `${s.rowLabel}${s.seatNumber} is booked. Click to join the waitlist`}
              >
                {s.seatNumber}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="legend">
        <span><i className="seat" /> Available</span>
        <span><i className="seat selected" /> Selected</span>
        <span><i className="seat booked" /> Booked</span>
        <span><i className="seat waitlisted" /> Waitlist</span>
      </div>

      {hasTaken && (
        <p className="notice">
          Some of your seats are taken. You'll join the waitlist and be booked automatically
          when <strong>all</strong> the selected seats become free.
        </p>
      )}

      <div className="summary">
        <div>
          {selected.length === 0 ? (
            <span className="meta">Select your seats</span>
          ) : (
            <>
              <strong>{labels}</strong>
              <div className="meta">{selected.length} seat(s) • Total ₹{total}</div>
            </>
          )}
        </div>
        <button className="primary" disabled={selected.length === 0 || busy} onClick={submit}>
          {busy ? "Please wait..." : !user ? "Login to book" : hasTaken ? "Join waitlist" : "Book now"}
        </button>
      </div>
    </div>
  );
}