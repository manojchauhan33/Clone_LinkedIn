// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// const PublicRoute = ({ children }: { children: JSX.Element }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading){
//     return <p>Loading...</p>;
//   }

//   return !isAuthenticated ? children : <Navigate to="/home" replace />;
// };

// export default PublicRoute;

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SkeletonLoader from "../Loaders/SkeletonLoader";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SkeletonLoader />;
  }

  return !isAuthenticated ? children : <Navigate to="/home" replace />;
};

export default PublicRoute;
