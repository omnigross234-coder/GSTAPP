// Check if user is logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user  = localStorage.getItem("user");
  return !!token && !!user;
};

// Get current user
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check if admin
export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};