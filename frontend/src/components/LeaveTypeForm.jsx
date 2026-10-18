import { useState } from "react";
import { Link } from "react-router-dom";

// one form used by both "Add Leave Type" and "Edit Leave Type" pages
function LeaveTypeForm(props) {
  const initialData = props.initialData || {};

  const [form, setForm] = useState({
    name: initialData.name || "",
    yearlyQuota: initialData.yearlyQuota || "",
    description: initialData.description || "",
  });
  const [error, setError] = useState("");

  // update one field of the form
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // simple checks before calling the server
    const quota = Number(form.yearlyQuota);
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!Number.isInteger(quota) || quota < 1 || quota > 60) {
      setError("Yearly quota must be a whole number between 1 and 60");
      return;
    }

    // send the data to the parent page
    props.onSubmit({
      name: form.name.trim(),
      yearlyQuota: quota,
      description: form.description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* our own check first, then the error from the server */}
      {(error || props.serverError) && <div className="error-box">{error || props.serverError}</div>}

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="For example: Casual" />
      </div>

      <div className="form-group">
        <label htmlFor="yearlyQuota">Yearly quota (days)</label>
        <input
          id="yearlyQuota"
          name="yearlyQuota"
          type="number"
          min="1"
          max="60"
          value={form.yearlyQuota}
          onChange={handleChange}
          placeholder="1 to 60"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={form.description}
          onChange={handleChange}
          placeholder="For example: For personal work"
        />
      </div>

      <div className="form-actions">
        <Link to="/admin/leave-types" className="btn btn-secondary">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={props.submitting}>
          {props.submitting ? "Saving..." : props.submitText}
        </button>
      </div>
    </form>
  );
}

export default LeaveTypeForm;
