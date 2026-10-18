import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import getHomePath from "./utils/getHomePath";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import LeaveDetails from "./pages/LeaveDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequests from "./pages/AdminRequests";
import LeaveTypes from "./pages/LeaveTypes";
import LeaveTypeForm from "./pages/LeaveTypeForm";

// read the saved user from localStorage (null if not logged in)
function getSavedUser() {
  const savedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (!savedUser || !token) {
    return null;
  }
  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function App() {
  const [user, setUser] = useState(getSavedUser);
  const navigate = useNavigate();

  // save the token and user after login
  function handleLogin(userData, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  // clear everything and go to the login page
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main">
        <Routes>
          {/* home: send the user to the right page */}
          <Route path="/" element={<Navigate to={getHomePath(user)} replace />} />

          {/* public pages (logged in users go to their home page) */}
          <Route
            path="/login"
            element={user ? <Navigate to={getHomePath(user)} replace /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to={getHomePath(user)} replace /> : <Register />}
          />

          {/* employee pages */}
          <Route
            path="/apply-leave"
            element={
              <ProtectedRoute user={user} roles={["employee"]}>
                <ApplyLeave />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-leaves"
            element={
              <ProtectedRoute user={user} roles={["employee"]}>
                <MyLeaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-leaves/:id"
            element={
              <ProtectedRoute user={user} roles={["employee"]}>
                <LeaveDetails />
              </ProtectedRoute>
            }
          />

          {/* admin pages */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={user} roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute user={user} roles={["admin"]}>
                <AdminRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-types"
            element={
              <ProtectedRoute user={user} roles={["admin"]}>
                <LeaveTypes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-types/new"
            element={
              <ProtectedRoute user={user} roles={["admin"]}>
                <LeaveTypeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-types/:id/edit"
            element={
              <ProtectedRoute user={user} roles={["admin"]}>
                <LeaveTypeForm />
              </ProtectedRoute>
            }
          />

          {/* any other url */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
