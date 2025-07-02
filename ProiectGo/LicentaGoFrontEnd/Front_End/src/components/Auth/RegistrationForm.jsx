import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Grid,
  Autocomplete,
  Alert,
  MenuItem,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import eOncoHub from "../../assets/images/eOncoHub.png";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, resetRegisterState } from "../../redux/slices/registerSlice";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e91e63",
    },
  },
});

const hospitals = ["SPITALUL CLINIC “DR. VICTOR BABES”"];

const judNames = [
  "Alba",
  "Arad",
  "Argeș",
  "Bacău",
  "Bihor",
  "Bistrița-Năsăud",
  "Botoșani",
  "Brașov",
  "Brăila",
  "București",
  "Buzău",
  "Caraș-Severin",
  "Călărași",
  "Cluj",
  "Constanța",
  "Covasna",
  "Dâmbovița",
  "Dolj",
  "Galați",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomița",
  "IASI",
  "Ilfov",
  "Maramureș",
  "Mehedinți",
  "Mureș",
  "Neamț",
  "Olt",
  "Prahova",
  "Satu Mare",
  "Sălaj",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timiș",
  "Tulcea",
  "Vaslui",
  "Vâlcea",
  "Vrancea",
];

const sexOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

const extractBirthDateFromCNP = (cnp) => {
  if (!/^\d{13}$/.test(cnp)) return null;
  const centuryCode = parseInt(cnp[0]);
  const year = parseInt(cnp.slice(1, 3));
  const month = parseInt(cnp.slice(3, 5));
  const day = parseInt(cnp.slice(5, 7));

  let century;
  if (centuryCode === 1 || centuryCode === 2) century = 1900;
  else if (centuryCode === 3 || centuryCode === 4) century = 1800;
  else if (centuryCode === 5 || centuryCode === 6) century = 2000;
  else return null;

  const fullYear = century + year;

  const date = new Date(Date.UTC(fullYear, month - 1, day));
  return date.toISOString().split("T")[0]; // Format yyyy-mm-dd
};

const validationSchema = yup.object({
  name: yup.string("Enter your name").required("Name is required"),
  surname: yup.string("Enter your surname").required("Surname is required"),
  email: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
  codParafa: yup
    .string("Enter your Cod Parafa")
    .required("Cod Parafa is required"),
  hospital: yup.string("Select your hospital").required("Hospital is required"),
  cnp: yup
    .string("Enter your CNP")
    .matches(/^\d{13}$/, "CNP must be exactly 13 digits")
    .required("CNP is required"),
  bornDate: yup
    .date("Enter your date of birth")
    .required("Date of birth is required"),
  sex: yup
    .string("Select your sex")
    .oneOf(["M", "F"], "Invalid sex")
    .required("Sex is required"),
  address: yup.string("Enter your address").required("Address is required"),
  locName: yup.string("Enter your city").required("City is required"),
  judName: yup.string("Select your county").required("County is required"),
  phoneNumber: yup
    .string("Enter your phone number")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  password: yup
    .string("Enter your password")
    .min(8, "Password should be of minimum 8 characters length")
    .matches(/[A-Z]/, "Password should contain at least one uppercase letter")
    .matches(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/,
      "Password should contain at leaast one special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.register);

  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedJud, setSelectedJud] = useState("");

  useEffect(() => {
    if (success) {
      dispatch(resetRegisterState());
      navigate("/");
    }
  }, [success, dispatch, navigate]);

  const handleHospitalChange = (event, value) => {
    setSelectedHospital(value);
    formik.setFieldValue("hospital", value);
  };

  const handleJudChange = (event, value) => {
    setSelectedJud(value);
    formik.setFieldValue("judName", value);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      surname: "",
      email: "",
      codParafa: "",
      hospital: "",
      cnp: "",
      bornDate: "",
      sex: "",
      address: "",
      locName: "",
      judName: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const userData = {
        person: {
          f_name: values.name,
          l_name: values.surname,
          cnp: values.cnp,
          born_date: `${values.bornDate}T00:00:00Z`,
          sex: values.sex,
          address: {
            address: values.address,
            loc: {
              name: values.locName,
              jud: {
                name: values.judName,
              },
            },
          },
          virtual_address: {
            email: values.email,
            phone_number: values.phoneNumber,
          },
        },
        parafa: values.codParafa,
        hospital: values.hospital,
        password: values.password,
      };

      dispatch(registerUser(userData));
    },
  });

  useEffect(() => {
    const birthDate = extractBirthDateFromCNP(formik.values.cnp);
    if (birthDate) {
      formik.setFieldValue("bornDate", birthDate);
    }
  }, [formik.values.cnp]);

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            height: "100%",
          }}
        >
          <img
            src={eOncoHub}
            alt="E - OncoHub"
            style={{ marginBottom: 10, width: "180px", height: "auto" }}
          />
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{
              mt: 1,
              width: "100%",
              maxWidth: "500px",
              paddingBottom: "16px",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* First Name */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="First Name"
                  name="name"
                  autoFocus
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
                {/* Last Name */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="surname"
                  label="Last Name"
                  name="surname"
                  value={formik.values.surname}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.surname && Boolean(formik.errors.surname)
                  }
                  helperText={formik.touched.surname && formik.errors.surname}
                />
                {/* Email */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
                {/* Phone Number */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phoneNumber"
                  label="Phone Number"
                  name="phoneNumber"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.phoneNumber &&
                    Boolean(formik.errors.phoneNumber)
                  }
                  helperText={
                    formik.touched.phoneNumber && formik.errors.phoneNumber
                  }
                />
                {/* Cod Parafa */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="codParafa"
                  label="Cod Parafa"
                  name="codParafa"
                  value={formik.values.codParafa}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.codParafa && Boolean(formik.errors.codParafa)
                  }
                  helperText={
                    formik.touched.codParafa && formik.errors.codParafa
                  }
                />
                {/* Hospital */}
                <Autocomplete
                  options={hospitals}
                  value={selectedHospital}
                  onChange={handleHospitalChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Hospital"
                      error={
                        formik.touched.hospital &&
                        Boolean(formik.errors.hospital)
                      }
                      helperText={
                        formik.touched.hospital && formik.errors.hospital
                      }
                      sx={{ mt: 2, mb: 0 }}
                    />
                  )}
                />
                {/* CNP */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="cnp"
                  label="CNP"
                  name="cnp"
                  value={formik.values.cnp}
                  onChange={formik.handleChange}
                  error={formik.touched.cnp && Boolean(formik.errors.cnp)}
                  helperText={formik.touched.cnp && formik.errors.cnp}
                />
                {/* Date of Birth */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="bornDate"
                  label="Date of Birth"
                  name="bornDate"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formik.values.bornDate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.bornDate && Boolean(formik.errors.bornDate)
                  }
                  helperText={formik.touched.bornDate && formik.errors.bornDate}
                />
                {/* Sex */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="sex"
                  label="Sex"
                  name="sex"
                  value={formik.values.sex}
                  onChange={formik.handleChange}
                  error={formik.touched.sex && Boolean(formik.errors.sex)}
                  helperText={formik.touched.sex && formik.errors.sex}
                >
                  {sexOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                {/* Address */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="address"
                  label="Address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.address && Boolean(formik.errors.address)
                  }
                  helperText={formik.touched.address && formik.errors.address}
                />
                {/* City (Loc Name) */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="locName"
                  label="City"
                  name="locName"
                  value={formik.values.locName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.locName && Boolean(formik.errors.locName)
                  }
                  helperText={formik.touched.locName && formik.errors.locName}
                />
                {/* County (Jud Name) */}
                <Autocomplete
                  options={judNames}
                  value={selectedJud}
                  onChange={handleJudChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select County"
                      error={
                        formik.touched.judName && Boolean(formik.errors.judName)
                      }
                      helperText={
                        formik.touched.judName && formik.errors.judName
                      }
                      sx={{ mt: 2, mb: 0 }}
                    />
                  )}
                />
                {/* Password */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
                {/* Confirm Password */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
                  helperText={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, bgcolor: "primary.main" }}
            >
              {loading ? "Registering..." : "Sign Up"}
            </Button>
            <Button size="small" variant="text" onClick={() => navigate("/")}>
              Already have an account? Sign in
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default RegisterForm;
