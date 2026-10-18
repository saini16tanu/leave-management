import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMyLeaves, getMyBalance, cancelLeave } from "../api/leaveApi";
import StatusBadge from "../components/StatusBadge";
import formatDate from "../utils/formatDate";

const filters = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // increase this number to load the data again
  const [reloadCount, setReloadCount] = useState(0);

  // status filter is kept in the url (?status=pending), so refresh keeps it
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";

  // load leaves and balance when the page opens, the filter changes or after cancel
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [leavesData, balanceData] = await Promise.all([getMyLeaves(status), getMyBalance()]);
        setLeaves(leavesData.leaves);
        setBalance(balanceData.balance);
        setError("");
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadData();
  }, [status, reloadCount]);

  // change the filter in the url
  function handleFilter(value) {
    setMessage("");
    if (value) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  }

  // cancel a pending leave after asking the user
  async function handleCancel(id) {
    if (!window.confirm("Cancel this leave request?")) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await cancelLeave(id);
      setMessage("Leave request cancelled");
      setReloadCount(reloadCount + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">My Leaves</h1>
        <Link to="/apply-leave" className="btn btn-primary">
          + Apply Leave
        </Link>
      </div>

      {/* leave balance cards */}
      {balance.length > 0 && (
        <div className="grid section">
          {balance.map((item) => (
            <div className="stat-card" key={item.leaveTypeId}>
              <div className="stat-label">{item.name} Leave</div>
              <div className="stat-value">
                {item.remaining} <span className="stat-small">of {item.quota} days left</span>
              </div>
              <div className="progress">
                <div className="progress-fill" style={{ width: Math.min(100, (item.used / item.quota) * 100) + "%" }}></div>
              </div>
              <div className="stat-sub">
                Used: {item.used} | Pending: {item.pending}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* status filter buttons */}
      <div className="filter-bar">
        {filters.map((filter) => (
          <button
            key={filter.label}
            className={status === filter.value ? "filter-btn active" : "filter-btn"}
            onClick={() => handleFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      {/* leave history */}
      {loading ? (
        <div className="loading">Loading leaves...</div>
      ) : leaves.length === 0 ? (
        <div className="card empty-state">
          <p>No leave requests found.</p>
          <Link to="/apply-leave">Apply for leave</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Applied on</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.leaveType ? leave.leaveType.name : "-"}</td>
                  <td>{formatDate(leave.fromDate)}</td>
                  <td>{formatDate(leave.toDate)}</td>
                  <td>{leave.days}</td>
                  <td>
                    <StatusBadge status={leave.status} />
                  </td>
                  <td>{formatDate(leave.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={"/my-leaves/" + leave._id} className="btn btn-secondary btn-small">
                        View
                      </Link>
                      {leave.status === "pending" && (
                        <button className="btn btn-danger btn-small" onClick={() => handleCancel(leave._id)}>
                          Cancel
                        </button>
                      )}
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

export default MyLeaves;
