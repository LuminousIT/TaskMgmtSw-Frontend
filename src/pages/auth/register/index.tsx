import React, { useState } from "react";
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from "../hooks/useAuth";

type RegisterFormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
};

const RegisterPage = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const { register: registerUser, isRegisterPending } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<RegisterFormData>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
        console.log("Register form data:", data);
        registerUser(data, () => {
            navigate('/dashboard')
        })
    };

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                padding: 4,
                width: 400,
                textAlign: "center",
            }}
        >
            <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
                Register
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <TextField
                    label="Name"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    {...register("name", {
                        required: "Name is required",
                        minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                        },
                    })}
                />
                <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address",
                        },
                    })}
                />
                <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                        },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                            message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                        },
                    })}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            )
                        }
                    }}
                />
                <TextField
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    error={!!errors.confirmPassword}
                    {...register("confirmPassword", {
                        required: "Confirm Password is required",
                        validate: (value) => {
                            const password = getValues("password");
                            return password === value || "Passwords do not match";
                        },
                    })}
                    helperText={errors.confirmPassword?.message}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            )
                        }
                    }}
                />
                <Button loading={isRegisterPending} disabled={isRegisterPending} type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Register
                    {isRegisterPending && <CircularProgress size={"small"} />}
                </Button>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default RegisterPage;
