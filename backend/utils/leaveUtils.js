const LeaveRequest = require("../models/leaveRequestModel");

// turn "YYYY-MM-DD" or a Date into a Date at UTC midnight (so the day never shifts)
const toDateOnly = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// today's date in India (server on Render runs in UTC)
const getTodayIST = () => {
  const todayText = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return toDateOnly(todayText);
};

// count leave days from start to end (both included), Sundays are not counted
const countLeaveDays = (fromDate, toDate) => {
  const current = toDateOnly(fromDate);
  const end = toDateOnly(toDate);
  let count = 0;

  while (current <= end) {
    // getUTCDay() is 0 for Sunday
    if (current.getUTCDay() !== 0) {
      count++;
    }
    // move to the next day
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return count;
};

// total days of an employee's leaves of one type in one year, for the given statuses
const getUsedDays = async (employeeId, leaveTypeId, year, statuses) => {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const startOfNextYear = new Date(Date.UTC(year + 1, 0, 1));

  const leaves = await LeaveRequest.find({
    employee: employeeId,
    leaveType: leaveTypeId,
    status: { $in: statuses },
    fromDate: { $gte: startOfYear, $lt: startOfNextYear },
  });

  let total = 0;
  for (const leave of leaves) {
    total = total + leave.days;
  }
  return total;
};

module.exports = { toDateOnly, getTodayIST, countLeaveDays, getUsedDays };
