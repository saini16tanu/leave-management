import { Link } from "react-router-dom";

// shown for any url that does not exist
function NotFound() {
  return (
    <div className="container">
      <div className="card empty-state">
        <h1>404 - Page not found</h1>
        <p className="muted">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Go back home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
