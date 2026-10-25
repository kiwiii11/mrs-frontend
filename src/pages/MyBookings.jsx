import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const WAITLIST = "/api/waitlist";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [info, setInfo] = useState({}); // showtimeId -> { st, map }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [res, wl] = await Promise.all([
        api("/api/reservations/my"),
        api(`${WAITLIST}/my`).catch(() => []),
      ]);
      setBookings([...res].reverse());

      const w = wl.filter((x) => String(x.status).toUpperCase() === "WAITING");
      const details = {};
      await Promise.all(
        [...new Set(w.map((x) => x.showtimeId))].map(async (sid) => {
          const [st, seats] = await Promise.all([
            api(`/api/showtimes/${sid}`),
            api(`/api/showtimes/${sid}/seats`),
          ]);
          const map = {};
          seats.forEach((s) => (map[s.seatId] = `${s.rowLabel}${s.seatNumber}`));
          details[sid] = { st, map };
        })
      );
      setInfo(details);
      setWaiting(w);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    load();
    const timer = setInterval(load, 10000); // so a promoted booking shows up by itself
    return () => clearInterval(timer);
  }, [user]);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setError("");
    try {
      await api(`/api/reservations/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const leaveWaitlist = async (id) => {
    if (!window.confirm("Leave the waitlist for these seats?")) return;
    setError("");
    try {
      await api(`${WAITLIST}/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message);
      load();
    }
  };

  if (!user) {
    return <p>Please <Link to="/login">log in</Link> to see your bookings.</p>;
  }

  const fmt = (t) =>
    new Date(t).toLocaleString("en-IN", {
      weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
    });

  return (
    <div>
      <h1>My Bookings</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      {waiting.length > 0 && (
        <>
          <h2>On the waitlist</h2>
          {waiting.map((w) => {
            const d = info[w.showtimeId];
            return (
              <div className="booking waiting" key={w.id}>
                <div>
                  <h3>{d?.st.movieTitle ?? "Showtime " + w.showtimeId}</h3>
                  {d && <p className="meta">{d.st.theater} • {fmt(d.st.startTime)}</p>}
                  <p>Seats: <strong>{w.seatIds.map((sid) => d?.map[sid] ?? sid).join(", ")}</strong></p>
                  <span className="age">WAITING</span>
                  <p className="meta">You'll be booked automatically when these seats are free.</p>
                </div>
                <button className="danger" onClick={() => leaveWaitlist(w.id)}>Leave waitlist</button>
              </div>
            );
          })}
          <h2>Bookings</h2>
        </>
      )}

      {!loading && bookings.length === 0 && (
        <p>No bookings yet. <Link to="/">Browse movies</Link></p>
      )}

      {bookings.map((b) => {
        const cancelled = String(b.status).toUpperCase().includes("CANCEL");
        return (
          <div className={"booking " + (cancelled ? "cancelled" : "")} key={b.id}>
            <div>
              <h3>{b.movieTitle}</h3>
              <p className="meta">{b.theater} • {fmt(b.startTime)}</p>
              <p>Seats: <strong>{b.seats.join(", ")}</strong></p>
              <span className="age">{b.status}</span>
            </div>
            {!cancelled && (
              <button className="danger" onClick={() => cancel(b.id)}>Cancel</button>
            )}
          </div>
        );
      })}
    </div>
  );
}