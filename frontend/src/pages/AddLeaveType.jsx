import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLeaveType } from "../api/leaveTypeApi";
import LeaveTypeForm from "../components/LeaveTypeForm";

function AddLeaveType() {
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // called by the form with the checked data
  async function handleCreate(formData) {
    setServerError("");
    setSubmitting(true);
    try {
      await createLeaveType(formData);
      navigate("/admin/leave-types");
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="container narrow">
      <h1 className="page-title">Add Leave Type</h1>
      <div className="card">
        <LeaveTypeForm
          submitText="Create Leave Type"
          onSubmit={handleCreate}
          serverError={serverError}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default AddLeaveType;
