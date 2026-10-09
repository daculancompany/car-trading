import { Navigate, Outlet } from "react-router-dom";
import type { AuthUser } from "../api/UserManagement/authApi";

interface ProtectedRouteProps {
    allowedRoles?: string[];
    loginPath?: string;
}

export default function ProtectedRoute({
    allowedRoles,
    loginPath = "/login",
}: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // 1. CHECK AUTHENTICATION
    if (!token || !userData) {
        return (
            <Navigate
                to={loginPath}
                replace
            />
        );
    }

    // 2. READ USER
    let currentUser: AuthUser;
    try {
        currentUser = JSON.parse(userData) as AuthUser;
    } catch (error) {
        console.error(
            "Invalid user data in localStorage:",
            error
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return (
            <Navigate
                to={loginPath}
                replace
            />
        );
    }

    // 3. NO ROLE RESTRICTION
    if (
        !allowedRoles ||
        allowedRoles.length === 0
    ) {
        return <Outlet />;
    }

    // 4. GET USER ROLE
    const userRole =
        currentUser?.role?.name?.trim() || "";

    // 5. CHECK ROLE
    const hasAccess = allowedRoles.some(
        (allowedRole) =>
            allowedRole.trim().toLowerCase() ===
            userRole.toLowerCase()
    );

    // 6. ALLOWED
    if (hasAccess) {
        return <Outlet />;
    }

    // 7. WRONG ROLE
    console.warn(
        `Access denied. Role "${userRole}" is not allowed.`
    );
    return (
        <Navigate
            to={loginPath}
            replace
        />
    );
}