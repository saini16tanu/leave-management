import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLeaveTypes, deleteLeaveType } from "../api/leaveTypeApi";

function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // increase this number to load the list again
  const [reloadCount, setReloadCount] = useState(0);

  // load all leave types
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeaveTypes();
        setLeaveTypes(data.leaveTypes);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadData();
  }, [reloadCount]);

  // delete after asking the admin
  async function handleDelete(type) {
    if (!window.confirm("Delete leave type " + type.name + "?")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await deleteLeaveType(type._id);
      setMessage("Leave type " + type.name + " deleted");
      setReloadCount(reloadCount + 1);
    } catch (err) {
      // for example: the type is used in leave requests
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Leave Types</h1>
        <Link to="/admin/leave-types/new" className="btn btn-primary">
          + Add Leave Type
        </Link>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">Loading leave types...</div>
      ) : leaveTypes.length === 0 ? (
        <div className="card empty-state">
          <p>No leave types yet.</p>
          <Link to="/admin/leave-types/new">Add the first leave type</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Yearly Quota (days)</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((type) => (
                <tr key={type._id}>
                  <td>
                    <strong>{type.name}</strong>
                  </td>
                  <td>{type.yearlyQuota}</td>
                  <td className="wrap-cell">{type.description || "-"}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={"/admin/leave-types/" + type._id + "/edit"} className="btn btn-secondary btn-small">
                        Edit
                      </Link>
                      <button className="btn btn-danger btn-small" onClick={() => handleDelete(type)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeaveTypes;
