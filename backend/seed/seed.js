require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");
const User = require("../models/userModel");
const LeaveType = require("../models/leaveTypeModel");
const LeaveRequest = require("../models/leaveRequestModel");
const { getTodayIST, countLeaveDays } = require("../utils/leaveUtils");

// add n days to a date (n can be negative)
const addDays = (date, n) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + n);
  return result;
};

// sample employees (password for all is emp123)
const employees = [
  { name: "Priya Sharma", email: "employee@leave.com", employeeId: "EMP001", department: "Engineering", designation: "Software Engineer", joiningDate: "2022-07-11" },
  { name: "Arjun Mehta", email: "arjun.mehta@leave.com", employeeId: "EMP002", department: "Engineering", designation: "Senior Software Engineer", joiningDate: "2020-08-03" },
  { name: "Sneha Reddy", email: "sneha.reddy@leave.com", employeeId: "EMP003", department: "Engineering", designation: "QA Engineer", joiningDate: "2023-01-16" },
  { name: "Rahul Gupta", email: "rahul.gupta@leave.com", employeeId: "EMP004", department: "Sales", designation: "Sales Executive", joiningDate: "2021-05-10" },
  { name: "Kavya Nair", email: "kavya.nair@leave.com", employeeId: "EMP005", department: "Sales", designation: "Sales Manager", joiningDate: "2020-02-17" },
  { name: "Vikram Singh", email: "vikram.singh@leave.com", employeeId: "EMP006", department: "HR", designation: "HR Executive", joiningDate: "2022-09-05" },
  { name: "Ananya Iyer", email: "ananya.iyer@leave.com", employeeId: "EMP007", department: "Finance", designation: "Accountant", joiningDate: "2021-11-22" },
  { name: "Karan Malhotra", email: "karan.malhotra@leave.com", employeeId: "EMP008", department: "Finance", designation: "Financial Analyst", joiningDate: "2024-03-04" },
  { name: "Neha Joshi", email: "neha.joshi@leave.com", employeeId: "EMP009", department: "Marketing", designation: "Marketing Executive", joiningDate: "2023-06-19" },
  { name: "Aditya Kulkarni", email: "aditya.kulkarni@leave.com", employeeId: "EMP010", department: "Marketing", designation: "Content Writer", joiningDate: "2025-01-06" },
];

// sample leaves: from and to are days counted from today (-2 means 2 days ago)
const sampleLeaves = [
  // approved leaves that include today (shown in "on leave today")
  { emp: "EMP002", type: "Earned", from: -2, to: 3, status: "approved", reason: "Family trip to Jaipur", remarks: "Approved. Enjoy your leave" },
  { emp: "EMP005", type: "Sick", from: -1, to: 1, status: "approved", reason: "Fever and cold", remarks: "Approved. Get well soon" },
  { emp: "EMP007", type: "Casual", from: 0, to: 2, status: "approved", reason: "Sister's wedding", remarks: "Approved. Enjoy your leave" },
  { emp: "EMP009", type: "Earned", from: -3, to: 4, status: "approved", reason: "Vacation in Goa", remarks: "Approved. Enjoy your leave" },

  // approved leaves in the past
  { emp: "EMP001", type: "Casual", from: -40, to: -38, status: "approved", reason: "Cousin's wedding in Delhi", remarks: "Approved. Enjoy your leave" },
  { emp: "EMP001", type: "Sick", from: -20, to: -19, status: "approved", reason: "Fever and cold", remarks: "Approved. Take care" },
  { emp: "EMP004", type: "Sick", from: -30, to: -29, status: "approved", reason: "Doctor appointment", remarks: "Approved" },
  { emp: "EMP006", type: "Earned", from: -50, to: -45, status: "approved", reason: "Moving to a new house", remarks: "Approved. Enjoy your leave" },
  { emp: "EMP008", type: "Casual", from: -15, to: -14, status: "approved", reason: "Bank and property work", remarks: "Approved" },
  { emp: "EMP003", type: "Sick", from: -25, to: -24, status: "approved", reason: "Dental treatment", remarks: "Approved. Take care" },
  { emp: "EMP010", type: "Casual", from: -10, to: -9, status: "approved", reason: "Passport office visit", remarks: "Approved" },

  // pending leaves in the future
  { emp: "EMP001", type: "Earned", from: 10, to: 14, status: "pending", reason: "Family trip to Manali" },
  { emp: "EMP004", type: "Earned", from: 20, to: 24, status: "pending", reason: "Brother's engagement" },
  { emp: "EMP006", type: "Casual", from: 7, to: 8, status: "pending", reason: "Shifting to a new flat" },
  { emp: "EMP010", type: "Sick", from: 5, to: 6, status: "pending", reason: "Health check-up" },
  { emp: "EMP003", type: "Casual", from: 15, to: 16, status: "pending", reason: "Attending a friend's wedding" },

  // rejected leaves
  { emp: "EMP001", type: "Casual", from: -8, to: -7, status: "rejected", reason: "Personal work at home", remarks: "Project deadline this week, please apply later" },
  { emp: "EMP002", type: "Casual", from: 30, to: 33, status: "rejected", reason: "Short trip with friends", remarks: "Team is short of people that week, please choose other dates" },
  { emp: "EMP005", type: "Earned", from: -35, to: -33, status: "rejected", reason: "Family function in Kochi", remarks: "Quarter end sales targets, please apply later" },

  // cancelled leaves (cancelled by the employee)
  { emp: "EMP001", type: "Sick", from: 3, to: 4, status: "cancelled", reason: "Dentist appointment" },
  { emp: "EMP008", type: "Earned", from: 12, to: 16, status: "cancelled", reason: "Trip to Kerala" },
];

const seedData = async () => {
  try {
    await connectDB();

    // 1. remove old data
    await LeaveRequest.deleteMany({});
    await LeaveType.deleteMany({});
    await User.deleteMany({});
    console.log("Old data cleared");

    // 2. leave types
    const leaveTypes = await LeaveType.insertMany([
      { name: "Casual", yearlyQuota: 12, description: "For personal work" },
      { name: "Sick", yearlyQuota: 10, description: "For illness or medical visits" },
      { name: "Earned", yearlyQuota: 15, description: "Planned holidays and vacations" },
    ]);

    // keep leave types by name, for example typeByName["Casual"]
    const typeByName = {};
    for (const type of leaveTypes) {
      typeByName[type.name] = type;
    }

    // 3. admin user
    const admin = await User.create({
      name: "Rohit Verma",
      email: "admin@leave.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      employeeId: "ADM001",
      department: "HR",
      designation: "HR Manager",
      joiningDate: "2019-04-01",
    });

    // 4. employees, kept by employee ID, for example userByEmpId["EMP001"]
    const userByEmpId = {};
    for (const emp of employees) {
      const user = await User.create({
        ...emp,
        password: await bcrypt.hash("emp123", 10),
        role: "employee",
      });
      userByEmpId[emp.employeeId] = user;
    }

    // 5. build leave requests with real dates
    const today = getTodayIST();
    const thisYear = today.getUTCFullYear();
    const leaves = [];

    for (const item of sampleLeaves) {
      const fromDate = addDays(today, item.from);
      const toDate = addDays(today, item.to);
      const days = countLeaveDays(fromDate, toDate);

      // skip leaves outside this year or with only Sundays
      if (fromDate.getUTCFullYear() !== thisYear || toDate.getUTCFullYear() !== thisYear) {
        console.log("Skipped (not in this year): " + item.emp + " " + item.reason);
        continue;
      }
      if (days === 0) {
        console.log("Skipped (only Sundays): " + item.emp + " " + item.reason);
        continue;
      }

      // applied 7 days before the leave starts, but never in the future
      let appliedAt = addDays(fromDate, -7);
      if (appliedAt > today) {
        appliedAt = addDays(today, -2);
      }

      const leave = {
        employee: userByEmpId[item.emp]._id,
        leaveType: typeByName[item.type]._id,
        fromDate: fromDate,
        toDate: toDate,
        days: days,
        reason: item.reason,
        status: item.status,
        createdAt: appliedAt,
      };

      // approved and rejected leaves were reviewed by the admin
      if (item.status === "approved" || item.status === "rejected") {
        // reviewed 3 days before the leave starts, but never in the future
        let reviewedAt = addDays(fromDate, -3);
        if (reviewedAt > today) {
          reviewedAt = addDays(today, -1);
        }
        leave.adminRemarks = item.remarks;
        leave.reviewedBy = admin._id;
        leave.reviewedAt = reviewedAt;
      }

      leaves.push(leave);
    }

    // 6. check the same rules as the API before saving
    let warningCount = 0;

    for (let i = 0; i < leaves.length; i++) {
      const a = leaves[i];

      // end date must not be before start date
      if (a.toDate < a.fromDate) {
        console.log("Warning: end date before start date -> " + a.reason);
        warningCount++;
      }

      // only pending and approved leaves must not overlap
      if (a.status !== "pending" && a.status !== "approved") {
        continue;
      }
      for (let j = i + 1; j < leaves.length; j++) {
        const b = leaves[j];
        if (b.status !== "pending" && b.status !== "approved") {
          continue;
        }
        const sameEmployee = a.employee.toString() === b.employee.toString();
        if (sameEmployee && a.fromDate <= b.toDate && a.toDate >= b.fromDate) {
          console.log("Warning: overlapping leaves -> " + a.reason + " and " + b.reason);
          warningCount++;
        }
      }
    }

    // approved + pending days must not be more than the yearly quota
    const usedDays = {};
    for (const leave of leaves) {
      if (leave.status === "pending" || leave.status === "approved") {
        const key = leave.employee + "-" + leave.leaveType;
        if (usedDays[key] === undefined) {
          usedDays[key] = 0;
        }
        usedDays[key] = usedDays[key] + leave.days;
      }
    }
    for (const type of leaveTypes) {
      for (const user of Object.values(userByEmpId)) {
        const key = user._id + "-" + type._id;
        if (usedDays[key] > type.yearlyQuota) {
          console.log("Warning: " + user.name + " used more " + type.name + " leave than the quota");
          warningCount++;
        }
      }
    }

    if (warningCount > 0) {
      console.log(warningCount + " warning(s) found. Leave requests were not added.");
      return;
    }

    await LeaveRequest.insertMany(leaves);

    // 7. summary
    console.log(
      "Seed completed: " + (employees.length + 1) + " users (1 admin, " + employees.length + " employees), " +
        leaveTypes.length + " leave types, " + leaves.length + " leave requests"
    );
    console.log("Test logins -> Admin: admin@leave.com / admin123 | Employee: employee@leave.com / emp123");
  } catch (err) {
    console.log("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedData();
