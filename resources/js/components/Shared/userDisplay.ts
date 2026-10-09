import type { AuthUser } from "../../api/UserManagement/authApi";

export const displayName = (user: AuthUser | null | undefined) => {
    const person = user?.customer ?? user?.staff;
    const full = person ? [person.first_name, person.last_name].filter(Boolean).join(" ") : "";
    return full || user?.username || "User";
};

export const roleColor = (role?: string | null) => {
    switch (String(role ?? "").toLowerCase()) {
        case "admin":
            return "purple";
        case "secretary":
            return "teal";
        case "mechanic":
            return "orange";
        case "washer":
            return "cyan";
        default:
            return "blue";
    }
};
