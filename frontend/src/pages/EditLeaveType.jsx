import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLeaveType, updateLeaveType } from "../api/leaveTypeApi";
import LeaveTypeForm from "../components/LeaveTypeForm";

function EditLeaveType() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // load the old values of this leave type
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeaveType(id);
        setLeaveType(data.leaveType);
      } catch (err) {
        setLoadError(err.message);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  // called by the form with the checked data
  async function handleUpdate(formData) {
    setServerError("");
    setSubmitting(true);
    try {
      await updateLeaveType(id, formData);
      navigate("/admin/leave-types");
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading leave type...</div>;
  }

  // could not load (wrong id or not found)
  if (!leaveType) {
    return (
      <div className="container narrow">
        <div className="error-box">{loadError || "Leave type not found"}</div>
        <Link to="/admin/leave-types" className="btn btn-secondary">
          Back to Leave Types
        </Link>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h1 className="page-title">Edit Leave Type</h1>
      <div className="card">
        {/* same form as the add page, filled with the old values */}
        <LeaveTypeForm
          initialData={leaveType}
          submitText="Update Leave Type"
          onSubmit={handleUpdate}
          serverError={serverError}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default EditLeaveType;
