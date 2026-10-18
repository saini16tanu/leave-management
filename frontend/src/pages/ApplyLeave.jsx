import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaveTypes } from "../api/leaveTypeApi";
import { getMyBalance, applyLeave } from "../api/leaveApi";
import countDays from "../utils/countDays";
import getToday from "../utils/getToday";

function ApplyLeave() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState([]);
  const [form, setForm] = useState({ leaveType: "", fromDate: "", toDate: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // today's date, so past dates cannot be picked
  const today = getToday();

  // load leave types and balance together when the page opens
  useEffect(() => {
    async function loadData() {
      try {
        const [typesData, balanceData] = await Promise.all([getLeaveTypes(), getMyBalance()]);
        setLeaveTypes(typesData.leaveTypes);
        setBalance(balanceData.balance);
      } catch (err) {
        setLoadError(err.message);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // find the balance of one leave type
  function getBalance(typeId) {
    return balance.find((item) => item.leaveTypeId === typeId);
  }

  // days that can still be applied = remaining - pending
  function getAvailable(typeId) {
    const item = getBalance(typeId);
    if (!item) {
      return 0;
    }
    return item.remaining - item.pending;
  }

  // update one field of the form
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // preview of total days (only when both dates are filled)
  const datesFilled = form.fromDate && form.toDate;
  const endBeforeStart = datesFilled && form.toDate < form.fromDate;
  const totalDays = datesFilled && !endBeforeStart ? countDays(form.fromDate, form.toDate) : 0;
  const selectedBalance = getBalance(form.leaveType);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // simple checks before calling the server
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason) {
      setError("All fields are required");
      return;
    }
    if (form.reason.trim().length < 5) {
      setError("Reason must be at least 5 characters");
      return;
    }
    if (endBeforeStart) {
      setError("End date cannot be before start date");
      return;
    }

    setSubmitting(true);
    try {
      await applyLeave(form);
      navigate("/my-leaves");
    } catch (err) {
      // show the server message, for example overlap or low balance
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (loadError) {
    return (
      <div className="container narrow">
        <div className="error-box">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h1 className="page-title">Apply Leave</h1>

      <div className="card">
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="leaveType">Leave type</label>
            <select id="leaveType" name="leaveType" value={form.leaveType} onChange={handleChange}>
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name} ({getAvailable(type._id)} days left)
                </option>
              ))}
            </select>
            {selectedBalance && (
              <p className="field-note">
                Available: {getAvailable(form.leaveType)} days | Pending: {selectedBalance.pending} days
              </p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fromDate">From date</label>
              <input id="fromDate" name="fromDate" type="date" min={today} value={form.fromDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="toDate">To date</label>
              <input
                id="toDate"
                name="toDate"
                type="date"
                min={form.fromDate || today}
                value={form.toDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* live preview of the number of days */}
          {datesFilled && (
            <div className={endBeforeStart ? "info-box info-box-error" : "info-box"}>
              {endBeforeStart
                ? "End date cannot be before start date"
                : "Total days: " + totalDays + " (Sundays are not counted)"}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              rows="4"
              value={form.reason}
              onChange={handleChange}
              placeholder="For example: Sister's wedding"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/my-leaves")}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Apply Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeave;
