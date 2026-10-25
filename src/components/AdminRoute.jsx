import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div>
      <div className="admin-tabs">
        <Link to="/admin/movies">Manage Movies</Link>
        <Link to="/admin/showtimes">Manage Showtimes</Link>
      </div>
      {children}
    </div>
  );
}