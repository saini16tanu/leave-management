import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/dashboardApi";
import formatDate from "../utils/formatDate";
import getToday from "../utils/getToday";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load dashboard numbers
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboard();
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="container">
        <div className="error-box">{error || "Could not load the dashboard"}</div>
      </div>
    );
  }

  // biggest department count, used for the bar widths
  let maxCount = 1;
  for (const item of stats.departmentWise) {
    if (item.count > maxCount) {
      maxCount = item.count;
    }
  }

  return (
    <div className="container">
      <h1 className="page-title page-title-tight">Dashboard</h1>
      <p className="muted">Today: {formatDate(getToday())}</p>

      {/* number cards */}
      <div className="grid stats-grid section">
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{stats.totalEmployees}</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value">{stats.pendingCount}</div>
          <Link to="/admin/requests?status=pending" className="stat-link">
            Review now →
          </Link>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{stats.approvedCount}</div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-label">Rejected</div>
          <div className="stat-value">{stats.rejectedCount}</div>
        </div>
        <div className="stat-card stat-grey">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{stats.totalRequests}</div>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* employees on leave today */}
        <div className="card">
          <h2 className="card-title">On Leave Today</h2>
          {stats.onLeaveToday.length === 0 ? (
            <div className="empty-state">No one is on leave today.</div>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.onLeaveToday.map((item) => (
                    <tr key={item.employeeId + item.fromDate}>
                      <td>{item.name}</td>
                      <td>{item.employeeId}</td>
                      <td>{item.department}</td>
                      <td>{item.leaveType}</td>
                      <td>{formatDate(item.fromDate)}</td>
                      <td>{formatDate(item.toDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* simple bar chart made with divs */}
        <div className="card">
          <h2 className="card-title">Department-wise Approved Leaves</h2>
          {stats.departmentWise.length === 0 ? (
            <div className="empty-state">No data yet.</div>
          ) : (
            <div className="bar-chart">
              {stats.departmentWise.map((item) => (
                <div className="bar-row" key={item.department}>
                  <div className="bar-label">{item.department}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: (item.count / maxCount) * 100 + "%" }}></div>
                  </div>
                  <div className="bar-count">{item.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
