import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export const useLoginMutation = () => {
  const { setIsAuthenticated, setAuthError } = useAuth();

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post(
        "http://localhost/auth/login",
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.message === "Login successful") {
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setIsAuthenticated(false);
        setAuthError("Login failed");
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      setAuthError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    },
  });
};
