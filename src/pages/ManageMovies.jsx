import { useEffect, useState } from "react";
import { api } from "../api";

const empty = { title: "", genre: "", duration: 150, rating: "", ageLimit: "", posterUrl: "", description: "" };

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => api("/api/movies").then(setMovies).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    const body = {
      title: form.title,
      genre: form.genre,
      description: form.description,
      duration: Number(form.duration),
      rating: form.rating === "" ? null : Number(form.rating),
      ageLimit: form.ageLimit || null,
      posterUrl: form.posterUrl || null,
    };
    try {
      if (editingId) {
        await api(`/api/movies/${editingId}`, { method: "PUT", body });
        setMsg("Movie updated");
      } else {
        await api("/api/movies", { method: "POST", body });
        setMsg("Movie added");
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (m) => {
    setEditingId(m.id);
    setForm({
      title: m.title, genre: m.genre || "", duration: m.duration,
      rating: m.rating ?? "", ageLimit: m.ageLimit || "",
      posterUrl: m.posterUrl || "", description: m.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete "${m.title}"?`)) return;
    setError(""); setMsg("");
    try {
      await api(`/api/movies/${m.id}`, { method: "DELETE" });
      setMsg("Movie deleted");
      load();
    } catch (err) {
      setError("Could not delete. A movie with showtimes or bookings can't be deleted. Delete its showtimes first. (" + err.message + ")");
    }
  };

  return (
    <div>
      <h1>Manage Movies</h1>
      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}

      <form className="admin-form" onSubmit={submit}>
        <h3>{editingId ? "Edit movie" : "Add a movie"}</h3>
        <input placeholder="Title" value={form.title} onChange={set("title")} required />
        <input placeholder="Genre" value={form.genre} onChange={set("genre")} />
        <div className="row">
          <input type="number" min="1" placeholder="Duration (min)" value={form.duration} onChange={set("duration")} required />
          <input type="number" step="0.1" min="0" max="10" placeholder="Rating (0-10)" value={form.rating} onChange={set("rating")} />
          <input placeholder="Age limit (UA 13+)" maxLength={10} value={form.ageLimit} onChange={set("ageLimit")} />
        </div>
        <input placeholder="Poster path (/posters/name.jpg)" value={form.posterUrl} onChange={set("posterUrl")} />
        <textarea rows="3" placeholder="Description" value={form.description} onChange={set("description")} />
        <div className="row">
          <button className="primary" type="submit">{editingId ? "Save changes" : "Add movie"}</button>
          {editingId && (
            <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(empty); }}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {movies.map((m) => (
          <div className="admin-item" key={m.id}>
            <div>
              <strong>{m.title}</strong>
              <div className="meta">{m.genre} • {m.duration} min • ⭐ {m.rating ?? "N/A"} • {m.ageLimit || "-"}</div>
            </div>
            <div className="row">
              <button className="ghost" onClick={() => edit(m)}>Edit</button>
              <button className="danger" onClick={() => remove(m)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}