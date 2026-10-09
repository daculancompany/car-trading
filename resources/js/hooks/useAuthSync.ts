import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthSync(loginPath: string) {
  const navigate = useNavigate();

  useEffect(() => {
    // HANDLE CHANGES FROM ANOTHER TAB

    const handleStorageChange = (event: StorageEvent) => {
      // ANOTHER TAB LOGGED OUT

      if (event.key === "token" && event.newValue === null) {
        localStorage.removeItem("user");

        navigate(loginPath, {
          replace: true,
        });

        return;
      }

      if (event.key === "user" && event.newValue === null) {
        localStorage.removeItem("token");

        navigate(loginPath, {
          replace: true,
        });

        return;
      }

      // ANOTHER TAB LOGGED IN
      //
      // IMPORTANT:
      // Do NOT navigate to dashboard here automatically
      // for every route change.
      //
      // The login page itself should handle redirecting
      // to the correct dashboard.
      //
    };

    // LISTEN FOR LOCAL STORAGE CHANGES

    window.addEventListener("storage", handleStorageChange);

    // CLEANUP

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, loginPath]);
}
