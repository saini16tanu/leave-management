// count leave days from start to end (both included), Sundays are not counted
// only for showing a preview, the backend does the real check
function countDays(from, to) {
  const current = new Date(from);
  const end = new Date(to);
  let count = 0;

  while (current <= end) {
    // getUTCDay() is 0 for Sunday
    if (current.getUTCDay() !== 0) {
      count++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return count;
}

export default countDays;
