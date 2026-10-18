import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import getHomePath from "../utils/getHomePath";

function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email: email, password: password });
      // save the user in App, then open the home page of the role
      props.onLogin(data.user, data.token);
      navigate(getHomePath(data.user), { replace: true });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="muted">Login to manage your leaves</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@leave.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          New employee? <Link to="/register">Create an account</Link>
        </p>

        {/* test accounts for the demo */}
        <div className="hint-box">
          <strong>Test logins</strong>
          <div>Admin: admin@leave.com / admin123</div>
          <div>Employee: employee@leave.com / emp123</div>
        </div>
      </div>
    </div>
  );
}

export default Login;
