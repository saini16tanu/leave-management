import { useParams } from "react-router-dom";

// Add or edit leave type page (full page comes later)
function LeaveTypeForm() {
  const { id } = useParams();

  return (
    <div className="container">
      <h1 className="page-title">{id ? "Edit Leave Type" : "Add Leave Type"}</h1>
      <div className="card empty-state">This page is coming soon.</div>
    </div>
  );
}

export default LeaveTypeForm;
