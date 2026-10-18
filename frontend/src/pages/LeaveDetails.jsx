import { useParams } from "react-router-dom";

// Leave details page (full page comes later)
function LeaveDetails() {
  const { id } = useParams();

  return (
    <div className="container">
      <h1 className="page-title">Leave Details</h1>
      <div className="card empty-state">Details of leave {id} are coming soon.</div>
    </div>
  );
}

export default LeaveDetails;
