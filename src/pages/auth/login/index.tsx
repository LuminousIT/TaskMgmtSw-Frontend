import { Box, Button, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link } from "react-router";

type LoginFormData = {
    email: string;
    password: string;
    rememberMe: boolean;
};

const LoginPage = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit: SubmitHandler<LoginFormData> = (data) => {
        console.log("Login form data:", data);
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
                    type="password"
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
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
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
