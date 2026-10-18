import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllLeaves, reviewLeave } from "../api/leaveApi";
import StatusBadge from "../components/StatusBadge";
import formatDate from "../utils/formatDate";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const departments = ["Engineering", "Sales", "HR", "Finance", "Marketing"];

function AdminRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // remarks typed for each row, for example { leaveId: "text" }
  const [remarks, setRemarks] = useState({});
  // id of the row that is being saved
  const [savingId, setSavingId] = useState("");
  // increase this number to load the list again
  const [reloadCount, setReloadCount] = useState(0);

  // filters are kept in the url, pending is shown first by default
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "pending";
  const department = searchParams.get("department") || "";

  // load requests when the page opens, a filter changes or after a review
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // "all" means no status filter
        const statusForApi = status === "all" ? "" : status;
        const data = await getAllLeaves(statusForApi, department);
        setLeaves(data.leaves);
        setError("");
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadData();
  }, [status, department, reloadCount]);

  // put the new filters in the url
  function changeFilter(newStatus, newDepartment) {
    setMessage("");
    const params = { status: newStatus };
    if (newDepartment) {
      params.department = newDepartment;
    }
    setSearchParams(params);
  }

  // approve or reject one leave
  async function handleReview(leave, newStatus) {
    const text = (remarks[leave._id] || "").trim();
    setError("");
    setMessage("");

    if (newStatus === "rejected" && !text) {
      setError("Remarks are required when rejecting");
      return;
    }

    setSavingId(leave._id);
    try {
      await reviewLeave(leave._id, { status: newStatus, adminRemarks: text });
      const name = leave.employee ? leave.employee.name : "employee";
      if (newStatus === "approved") {
        setMessage("Leave approved for " + name);
      } else {
        setMessage("Leave rejected for " + name);
      }
      setReloadCount(reloadCount + 1);
    } catch (err) {
      // for example: employee does not have enough balance
      setError(err.message);
    }
    setSavingId("");
  }

  return (
    <div className="container wide">
      <h1 className="page-title">Leave Requests</h1>

      {/* status buttons and department select */}
      <div className="filters-row">
        <div className="filter-bar">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={status === filter.value ? "filter-btn active" : "filter-btn"}
              onClick={() => changeFilter(filter.value, department)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          className="filter-select"
          value={department}
          onChange={(e) => changeFilter(status, e.target.value)}
          aria-label="Department"
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">Loading requests...</div>
      ) : leaves.length === 0 ? (
        <div className="card empty-state">No requests found for this filter.</div>
      ) : (
        <>
          <p className="result-count">
            Showing {leaves.length} {leaves.length === 1 ? "request" : "requests"}
          </p>

          <div className="table-wrapper">
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied on</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="cell-main">{leave.employee ? leave.employee.name : "-"}</div>
                      <div className="cell-sub">{leave.employee ? leave.employee.employeeId : ""}</div>
                    </td>
                    <td>{leave.employee ? leave.employee.department : "-"}</td>
                    <td>{leave.leaveType ? leave.leaveType.name : "-"}</td>
                    <td>{formatDate(leave.fromDate)}</td>
                    <td>{formatDate(leave.toDate)}</td>
                    <td>{leave.days}</td>
                    <td className="wrap-cell">{leave.reason}</td>
                    <td>
                      <StatusBadge status={leave.status} />
                    </td>
                    <td>{formatDate(leave.createdAt)}</td>
                    <td>
                      {leave.status === "pending" ? (
                        // remarks box and buttons only for pending leaves
                        <div className="review-box">
                          <input
                            className="remarks-input"
                            placeholder="Remarks"
                            value={remarks[leave._id] || ""}
                            onChange={(e) => setRemarks({ ...remarks, [leave._id]: e.target.value })}
                          />
                          <div className="table-actions">
                            <button
                              className="btn btn-success btn-small"
                              disabled={savingId === leave._id}
                              onClick={() => handleReview(leave, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              disabled={savingId === leave._id}
                              onClick={() => handleReview(leave, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="cell-sub wrap-cell">{leave.adminRemarks || "-"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminRequests;
