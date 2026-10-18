import { apiRequest } from "./apiClient";

// make "?status=pending&department=HR" from an object, skipping empty values
function buildQuery(values) {
  const params = new URLSearchParams();
  for (const key in values) {
    if (values[key]) {
      params.append(key, values[key]);
    }
  }
  const query = params.toString();
  if (query) {
    return "?" + query;
  }
  return "";
}

// employee applies for leave
export async function applyLeave(data) {
  return apiRequest("/leaves", "POST", data);
}

// employee's own leaves (status is optional)
export async function getMyLeaves(status) {
  return apiRequest("/leaves/my" + buildQuery({ status: status }));
}

// employee's leave balance for this year
export async function getMyBalance() {
  return apiRequest("/leaves/my/balance");
}

// one leave with full details
export async function getLeaveById(id) {
  return apiRequest("/leaves/" + id);
}

// employee cancels a pending leave
export async function cancelLeave(id) {
  return apiRequest("/leaves/" + id + "/cancel", "PATCH");
}

// admin gets all leaves (status and department are optional)
export async function getAllLeaves(status, department) {
  return apiRequest("/leaves" + buildQuery({ status: status, department: department }));
}

// admin approves or rejects a leave, data = { status, adminRemarks }
export async function reviewLeave(id, data) {
  return apiRequest("/leaves/" + id + "/review", "PATCH", data);
}
