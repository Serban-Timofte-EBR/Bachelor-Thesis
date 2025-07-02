import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, Button, TextField, Grid, MenuItem, Alert } from "@mui/material";
import { styled } from "@mui/system";

const theme = createTheme({
    palette: {
        primary: {
            main: "#3f51b5",
        },
        secondary: {
            main: "#f50057",
        },
    },
});

const StyledTextField = styled(TextField)(({ theme }) => ({
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
        borderRadius: 8,
    },
    "& .MuiInputLabel-root": {
        color: theme.palette.primary.main,
    },
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.dark,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 12,
    padding: "10px 20px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
    "&:hover": {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const PatientFormUpdate = ({ onSubmit, onCancel, initialValues }) => {
    const [formValues, setFormValues] = useState({
        f_name: initialValues?.f_name || "",
        l_name: initialValues?.l_name || "",
        cnp: initialValues?.cnp || "",
        born_date: initialValues?.born_date?.split("T")[0] || "",
        sex: initialValues?.sex || "M",
        address: initialValues?.address?.address || "",
        loc: initialValues?.address?.loc?.name || "SECTOR 1",
        jud: initialValues?.address?.loc?.jud?.name || "BUCURESTI",
        email: initialValues?.virtual_address?.email || "",
        phone_number: initialValues?.virtual_address?.phone_number || "",
    });

    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        if (initialValues) {
            setFormValues({
                f_name: initialValues.f_name || "",
                l_name: initialValues.l_name || "",
                cnp: initialValues.cnp || "",
                born_date: initialValues.born_date?.split("T")[0] || "",
                sex: initialValues.sex || "M",
                address: initialValues.address?.address || "",
                loc: initialValues.address?.loc?.name || "",
                jud: initialValues.address?.loc?.jud?.name || "",
                email: initialValues.virtual_address?.email || "",
                phone_number: initialValues.virtual_address?.phone_number || "",
            });
        }
    }, [initialValues]);

    const sectorOptions = ["SECTOR 1", "SECTOR 2", "SECTOR 3"];
    const countyOptions = ["BUCURESTI", "ILFOV"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const isoBornDate = new Date(formValues.born_date).toISOString();

        const payload = {
            person: {
                f_name: formValues.f_name,
                l_name: formValues.l_name,
                cnp: formValues.cnp,
                born_date: isoBornDate,
                sex: formValues.sex,
                address: {
                    address: formValues.address,
                    loc: {
                        name: formValues.loc,
                        jud: {
                            name: formValues.jud,
                        },
                    },
                },
                virtual_address: {
                    email: formValues.email,
                    phone_number: formValues.phone_number,
                },
            },
        };

        onSubmit(payload);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "100%", sm: "500px" },
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: 24,
                    p: 4,
                    transition: "all 0.3s ease",
                }}
            >
                {/* Error display */}
                {submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {submitError}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="First Name"
                            name="f_name"
                            value={formValues.f_name}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <StyledTextField
                            label="Last Name"
                            name="l_name"
                            value={formValues.l_name}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <StyledTextField
                            label="CNP"
                            name="cnp"
                            value={formValues.cnp}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <StyledTextField
                            label="Date of Birth"
                            type="date"
                            name="born_date"
                            value={formValues.born_date}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <StyledTextField
                            label="Address"
                            name="address"
                            value={formValues.address}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <StyledTextField
                            select
                            label="Sector"
                            name="loc"
                            value={formValues.loc}
                            onChange={handleChange}
                            fullWidth
                            required
                        >
                            {sectorOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </StyledTextField>
                    </Grid>

                    <Grid item xs={6}>
                        <StyledTextField
                            select
                            label="County"
                            name="jud"
                            value={formValues.jud}
                            onChange={handleChange}
                            fullWidth
                            required
                        >
                            {countyOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </StyledTextField>
                    </Grid>

                    <Grid item xs={12}>
                        <StyledTextField
                            label="Email"
                            name="email"
                            value={formValues.email}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <StyledTextField
                            label="Phone Number"
                            name="phone_number"
                            value={formValues.phone_number}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <StyledButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            Save
                        </StyledButton>
                    </Grid>

                    <Grid item xs={12}>
                        <StyledButton
                            onClick={onCancel}
                            variant="outlined"
                            color="secondary"
                            fullWidth
                        >
                            Cancel
                        </StyledButton>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
};

export default PatientFormUpdate;