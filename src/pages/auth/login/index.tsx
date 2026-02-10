import { Box, Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { ILoginPayload } from "@/api/auth/types";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoginPending } = useAuth()
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ILoginPayload>({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit: SubmitHandler<ILoginPayload> = (data) => {
        console.log("Login form data:", data);
        login(data, () => {
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
                Login
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                            value: 6,
                            message: "Password must be at least 6 characters",
                        },
                    })}
                    slotProps={{
                        input: {
                            "endAdornment": (
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            )
                        }
                    }}
                />
                <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Remember me"
                            sx={{ width: "100%", mt: 1 }}
                        />
                    )}
                />
                <Button loading={isLoginPending} disabled={isLoginPending} type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Login
                </Button>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default LoginPage;
