export const setAuth = (token: string, user: unknown) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    clearAuth();
    return null;
  }
};

export const getAuthenticatedUserId = (): number | null => {
  const user = getUser();
  return typeof user?.id === "number" ? user.id : null;
};

// Where each role lands after logging in through /login.
export const getHomePath = (user: any): string | null => {
  const role = String(
    typeof user?.role === "string" ? user.role : user?.role?.name ?? ""
  ).trim().toLowerCase();

  switch (role) {
    case "admin":
      return "/admin-dashboard";
    case "secretary":
      return "/secretary-dashboard";
    case "customer":
      return "/customer-vehicles";
    case "mechanic":
    case "washer":
      return "/my-jobs";
    default:
      return null;
  }
};
