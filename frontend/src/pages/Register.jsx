import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

const departments = ["Engineering", "Sales", "HR", "Finance", "Marketing"];

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    designation: "",
    joiningDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // update one field of the form
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // simple checks before calling the server
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.employeeId ||
      !form.department ||
      !form.designation ||
      !form.joiningDate
    ) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(form);
      setSuccess(data.message);
      // go to the login page after 1.5 seconds
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="muted">Register as a new employee</p>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Priya Sharma" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@leave.com" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeId">Employee ID</label>
              <input id="employeeId" name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="EMP011" />
            </div>

            <div className="form-group">
              <label htmlFor="joiningDate">Joining date</label>
              <input id="joiningDate" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select id="department" name="department" value={form.department} onChange={handleChange}>
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation</label>
              <input id="designation" name="designation" value={form.designation} onChange={handleChange} placeholder="Software Engineer" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
