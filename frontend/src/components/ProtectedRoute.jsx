import { Navigate } from "react-router-dom";
import getHomePath from "../utils/getHomePath";

// show the page only if the user is logged in and has the right role
function ProtectedRoute(props) {
  if (!props.user) {
    return <Navigate to="/login" replace />;
  }

  // wrong role: send the user to their own home page
  if (!props.roles.includes(props.user.role)) {
    return <Navigate to={getHomePath(props.user)} replace />;
  }

  return props.children;
}

export default ProtectedRoute;
