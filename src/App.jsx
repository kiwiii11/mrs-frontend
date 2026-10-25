import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Movies from "./pages/Movies";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetail from "./pages/MovieDetail";
import SeatSelection from "./pages/SeatSelection";
import MyBookings from "./pages/MyBookings";
import AdminRoute from "./components/AdminRoute";
import ManageMovies from "./pages/ManageMovies";
import ManageShowtimes from "./pages/ManageShowtimes";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="page">
        <Routes>
          <Route path="/" element={<Movies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/showtimes/:id" element={<SeatSelection />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin/movies" element={<AdminRoute><ManageMovies /></AdminRoute>} />
          <Route path="/admin/showtimes" element={<AdminRoute><ManageShowtimes /></AdminRoute>} />
        </Routes>
      </div>
    </>
  );
}