// colored label for a leave status, like "Pending" or "Approved"
function StatusBadge(props) {
  const text = props.status.charAt(0).toUpperCase() + props.status.slice(1);

  return <span className={"badge badge-" + props.status}>{text}</span>;
}

export default StatusBadge;
