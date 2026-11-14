import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="page-loader"><span className="logo-mark small"><i /></span><p>মানচিত্র খুলছি…</p></div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
