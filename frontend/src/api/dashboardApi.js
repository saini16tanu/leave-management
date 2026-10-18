import { apiRequest } from "./apiClient";

// admin dashboard numbers
export async function getDashboard() {
  return apiRequest("/dashboard");
}
