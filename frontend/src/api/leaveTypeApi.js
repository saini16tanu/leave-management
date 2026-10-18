import { apiRequest } from "./apiClient";

// get all leave types
export async function getLeaveTypes() {
  return apiRequest("/leave-types");
}

// get one leave type
export async function getLeaveType(id) {
  return apiRequest("/leave-types/" + id);
}

// add a leave type (admin)
export async function createLeaveType(data) {
  return apiRequest("/leave-types", "POST", data);
}

// edit a leave type (admin)
export async function updateLeaveType(id, data) {
  return apiRequest("/leave-types/" + id, "PUT", data);
}

// delete a leave type (admin)
export async function deleteLeaveType(id) {
  return apiRequest("/leave-types/" + id, "DELETE");
}
