import { Link, NavLink } from "react-router-dom";

// top bar with links (links change with the user's role)
function Navbar(props) {
  const user = props.user;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          LeaveDesk
        </Link>

        <div className="nav-links">
          {/* logged out */}
          {!user && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          {/* employee links */}
          {user && user.role === "employee" && (
            <>
              <NavLink to="/apply-leave">Apply Leave</NavLink>
              <NavLink to="/my-leaves">My Leaves</NavLink>
            </>
          )}

          {/* admin links */}
          {user && user.role === "admin" && (
            <>
              <NavLink to="/admin/dashboard">Dashboard</NavLink>
              <NavLink to="/admin/requests">Requests</NavLink>
              <NavLink to="/admin/leave-types">Leave Types</NavLink>
            </>
          )}
        </div>

        {/* user name, role and logout button */}
        {user && (
          <div className="nav-user">
            <span>Hi, {user.name}</span>
            <span className="role-badge">{user.role}</span>
            <button className="btn btn-secondary btn-small" onClick={props.onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
