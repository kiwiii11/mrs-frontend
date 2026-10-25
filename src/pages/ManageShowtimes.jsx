import { useEffect, useState } from "react";
import { api } from "../api";

const THEATERS = [
  "LA Cinemas - Screen 1", "LA Cinemas - Screen 2",
  "PVR - Screen 1", "PVR - Screen 2",
  "Mega Star - Screen 1", "Mega Star - Screen 2",
  "Sona Mena - Screen 1", "Sona Mena - Screen 2",
];

export default function ManageShowtimes() {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [form, setForm] = useState({ movieId: "", theater: THEATERS[0], startTime: "", price: 200 });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    api("/api/movies").then(setMovies).catch((e) => setError(e.message));
    api("/api/showtimes").then(setShowtimes).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    try {
      await api("/api/showtimes", {
        method: "POST",
        body: {
          movieId: Number(form.movieId),
          theater: form.theater,
          startTime: form.startTime + ":00",
          price: Number(form.price),
        },
      });
      setMsg("Showtime added");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (s) => {
    if (!window.confirm("Delete this showtime?")) return;
    setError(""); setMsg("");
    try {
      await api(`/api/showtimes/${s.id}`, { method: "DELETE" });
      setMsg("Showtime deleted");
      load();
    } catch (err) {
      setError("Could not delete. A showtime that has bookings can't be deleted. (" + err.message + ")");
    }
  };

  const fmt = (t) =>
    new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  const sorted = [...showtimes].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div>
      <h1>Manage Showtimes</h1>
      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}

      <form className="admin-form" onSubmit={submit}>
        <h3>Add a showtime</h3>
        <select value={form.movieId} onChange={set("movieId")} required>
          <option value="">Select movie</option>
          {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <select value={form.theater} onChange={set("theater")}>
          {THEATERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="row">
          <input type="datetime-local" value={form.startTime} onChange={set("startTime")} required />
          <input type="number" min="1" placeholder="Price (₹)" value={form.price} onChange={set("price")} required />
        </div>
        <button className="primary" type="submit">Add showtime</button>
      </form>

      <div className="admin-list">
        {sorted.map((s) => (
          <div className="admin-item" key={s.id}>
            <div>
              <strong>{s.movieTitle}</strong>
              <div className="meta">{s.theater} • {fmt(s.startTime)} • ₹{s.price}</div>
            </div>
            <button className="danger" onClick={() => remove(s)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}