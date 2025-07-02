// AuthContext.js
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const { mutate: login, isLoading: isLoggingIn } = useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post(
        "http://localhost/auth/login",
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.message === "Login successful") {
        setAuthError(null);
        navigate("/patients");
      } else {
        setAuthError("Login failed. Please try again.");
      }
    },
    // AuthContext.js
    onError: (error) => {
      console.error("Login error:", error);
      let errorMessage = "An error occurred during login. Please try again.";
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 401) {
          errorMessage =
            error.response.data.error || "Invalid email or password.";
        } else if (error.response.status >= 500) {
          errorMessage =
            "Server error occurred. Please try again later or contact support.";
        } else {
          errorMessage = error.response.data.error || error.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage =
          "No response from server. Please check your internet connection.";
      }
      setAuthError(errorMessage);
    },
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await axios.post("http://localhost/auth/api/logout");
    },
    onSuccess: () => {
      setAuthError(null);
      navigate("/");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during logout. Please try again.";
      setAuthError(errorMessage);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        authError,
        isLoggingIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
