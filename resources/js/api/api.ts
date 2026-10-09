import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
  },
});

// Request Interceptor

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error("Unauthorized.");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          break;

        case 403:
          console.error("Forbidden.");
          break;

        case 404:
          console.error("Resource not found.");
          break;

        case 422:
          console.error("Validation error.");
          break;

        case 500:
          console.error("Internal server error.");
          break;

        default:
          console.error(
            error.response.data?.message || "An unexpected error occurred.",
          );
      }
    } else if (error.request) {
      console.error("Unable to connect to the server.");
    } else {
      console.error(error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
