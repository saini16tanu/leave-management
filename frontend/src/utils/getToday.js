// today's date as "YYYY-MM-DD" (the format used by date inputs)
function getToday() {
  return new Date().toLocaleDateString("en-CA");
}

export default getToday;
