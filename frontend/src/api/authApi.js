import { apiRequest } from "./apiClient";

// create a new employee account
export async function registerUser(data) {
  return apiRequest("/auth/register", "POST", data);
}

// login and get the token and user details
export async function loginUser(data) {
  return apiRequest("/auth/login", "POST", data);
}

// get the logged in user's details
export async function getMe() {
  return apiRequest("/auth/me");
}
