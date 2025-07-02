import React from "react";
import { CircularProgress } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Auth/login";
import SignUp from "./pages/Auth/signup";
import PatientsList from "./pages/Patients_List";
import PatientProfilePage from "./pages/Patients_Profile";
import MedicalProfile from "./pages/Medic_Profile";
import LastInformation from "./components/ConsultationModule/LastInformation";
import NewConsultation from "./components/ConsultationModule/NewConsultation";
import ConsultationHistory from "./components/ConsultationModule/ConsultationHistory";
import EmailConfirmation from "./components/General/EmailConfirmation";

axios.defaults.withCredentials = true;

const queryClient = new QueryClient();

function PrivateRoutes({ children }) {
  const { isLoading, error, data } = useQuery({
    queryKey: ["checkAuth"],
    queryFn: async () => {
      const response = await axios.get("http://localhost/auth/api/check");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching authentication status:", error);
    return <Navigate to="/" />;
  }

  if (data?.isLoggedIn) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<SignUp />} />

            {/* Private Routes */}
            <Route
              path="/patients"
              element={
                <PrivateRoutes>
                  <PatientsList />
                </PrivateRoutes>
              }
            />

            {/* Patient Profile and Subroutes */}
            <Route
              path="/patients/:id"
              element={
                <PrivateRoutes>
                  <PatientProfilePage />
                </PrivateRoutes>
              }
            />
            <Route
              path="/patients/:id/last-information"
              element={
                <PrivateRoutes>
                  <LastInformation />
                </PrivateRoutes>
              }
            />
            <Route
              path="/patients/:id/new-consultation"
              element={
                <PrivateRoutes>
                  <NewConsultation />
                </PrivateRoutes>
              }
            />
            <Route
              path="/patients/:id/consultation-history"
              element={
                <PrivateRoutes>
                  <ConsultationHistory />
                </PrivateRoutes>
              }
            />

            <Route
              path="/medical-profile"
              element={
                <PrivateRoutes>
                  <MedicalProfile />
                </PrivateRoutes>
              }
            />
            <Route path="/confirm" element={<EmailConfirmation />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
