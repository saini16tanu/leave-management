// home page for each role
function getHomePath(user) {
  if (!user) {
    return "/login";
  }
  if (user.role === "admin") {
    return "/admin/dashboard";
  }
  return "/my-leaves";
}

export default getHomePath;
