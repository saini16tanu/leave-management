// show a date like "06 Nov 2026"
// timeZone UTC because dates are saved at UTC midnight (so the day does not shift)
function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default formatDate;
