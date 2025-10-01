import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading){ 
    return <p>Loading...</p>;
  }

  return !isAuthenticated ? children : <Navigate to="/home" replace />;
};

export default PublicRoute;
