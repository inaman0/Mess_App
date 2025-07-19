import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

interface ProtectedRouteProps {
  adminOnly?: boolean;
  userOnly?: boolean;
}

const ProtectedRoute = ({
  adminOnly = false,
  userOnly = false,
}: ProtectedRouteProps) => {
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken: any = jwtDecode(accessToken);
    console.log(decodedToken);
    const username = decodedToken?.preferred_username;

    if (adminOnly && username !== "admin1") {
      return <Navigate to="/" replace />;
    }

    if (userOnly && username === "admin1") {
      return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
