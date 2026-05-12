// export const validateLogin = (username, password) => {
//   if (!username || !password) {
//     return "All fields are required";
//   }
//   return null;
// };
export const validateLogin = (username, password) => {
  // Trim spaces
  const user = username.trim();
  const pass = password.trim();

  // Empty check
  if (!user || !pass) {
    return "All fields are required";
  }

  // Username rules
  if (user.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (!/^[a-zA-Z0-9_]+$/.test(user)) {
    return "Username can only contain letters, numbers, and underscore";
  }

  // Password rules
  // if (pass.length < 6) {
  //   return "Password must be at least 6 characters";
  // }

  // if (!/[A-Z]/.test(pass)) {
  //   return "Password must contain at least one uppercase letter";
  // }

  // if (!/[0-9]/.test(pass)) {
  //   return "Password must contain at least one number";
  // }

  return null; // valid
};