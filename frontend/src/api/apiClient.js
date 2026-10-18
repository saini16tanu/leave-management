const API_URL = import.meta.env.VITE_API_URL;

// send a request to the backend and return the JSON data
export async function apiRequest(path, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const options = {
    method: method,
    headers: { "Content-Type": "application/json" },
  };

  // send the token if the user is logged in
  if (token) {
    options.headers.Authorization = "Bearer " + token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  // fetch fails when there is no response (network error or the server is sleeping)
  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch {
    throw new Error("Cannot reach the server. It may be starting up, please wait 30 seconds and try again.");
  }

  // read the JSON data (empty object if the response has no JSON)
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  // token is expired or invalid, so log out and go to the login page
  if (response.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
