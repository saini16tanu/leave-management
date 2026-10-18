import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeaveById, cancelLeave } from "../api/leaveApi";
import StatusBadge from "../components/StatusBadge";
import formatDate from "../utils/formatDate";

function LeaveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);
  // increase this number to load the leave again
  const [reloadCount, setReloadCount] = useState(0);

  // load the leave when the page opens or after cancel
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeaveById(id);
        setLeave(data.leave);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadData();
  }, [id, reloadCount]);

  // cancel this leave after asking the user
  async function handleCancel() {
    if (!window.confirm("Cancel this leave request?")) {
      return;
    }
    setCancelling(true);
    setError("");
    try {
      await cancelLeave(id);
      setMessage("Leave request cancelled");
      setReloadCount(reloadCount + 1);
    } catch (err) {
      setError(err.message);
    }
    setCancelling(false);
  }

  if (loading) {
    return <div className="loading">Loading leave...</div>;
  }

  // could not load the leave (not found, not allowed, wrong id)
  if (!leave) {
    return (
      <div className="container narrow">
        <div className="error-box">{error || "Leave not found"}</div>
        <button className="btn btn-secondary" onClick={() => navigate("/my-leaves")}>
          Back to My Leaves
        </button>
      </div>
    );
  }

  const isReviewed = leave.status === "approved" || leave.status === "rejected";

  return (
    <div className="container narrow">
      <div className="page-header">
        <h1 className="page-title">Leave Details</h1>
        <StatusBadge status={leave.status} />
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-label">Leave type</div>
            <div className="detail-value">{leave.leaveType ? leave.leaveType.name : "-"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Total days</div>
            <div className="detail-value">{leave.days}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">From</div>
            <div className="detail-value">{formatDate(leave.fromDate)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">To</div>
            <div className="detail-value">{formatDate(leave.toDate)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Applied on</div>
            <div className="detail-value">{formatDate(leave.createdAt)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <StatusBadge status={leave.status} />
            </div>
          </div>
        </div>

        <div className="detail-item detail-full">
          <div className="detail-label">Reason</div>
          <div className="detail-value">{leave.reason}</div>
        </div>

        {/* review details, only after the admin approved or rejected */}
        {isReviewed && (
          <div className="details-grid review-section">
            <div className="detail-item">
              <div className="detail-label">Reviewed by</div>
              <div className="detail-value">{leave.reviewedBy ? leave.reviewedBy.name : "-"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Reviewed on</div>
              <div className="detail-value">{formatDate(leave.reviewedAt)}</div>
            </div>
          </div>
        )}

        {isReviewed && leave.adminRemarks && (
          <div className={"remarks-box remarks-" + leave.status}>
            <div className="detail-label">Admin remarks</div>
            <div>{leave.adminRemarks}</div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/my-leaves")}>
            Back to My Leaves
          </button>
          {leave.status === "pending" && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel Leave"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveDetails;
