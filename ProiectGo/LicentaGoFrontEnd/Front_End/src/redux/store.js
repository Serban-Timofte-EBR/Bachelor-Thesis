import { configureStore } from "@reduxjs/toolkit";
import patientsReducer from "./slices/patientsSlice";
import doctorReducer from "./slices/doctorSlice";
import registerSlice from "./slices/registerSlice";
import consultationSlice from "./slices/consultationSlice";

const store = configureStore({
  reducer: {
    patients: patientsReducer,
    doctor: doctorReducer,
    register: registerSlice,
    consultations: consultationSlice,
  },
});

export default store;
