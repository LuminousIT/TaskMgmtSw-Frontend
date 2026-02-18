import { TextField, type TextFieldProps } from "@mui/material";

const InlineTextField = ({ sx, ...props }: TextFieldProps) => {
    return (
        <TextField
            variant="standard"
            fullWidth
            {...props}
            sx={{
                "& .MuiInputBase-root": {
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    transition: "background-color 0.2s ease",
                    backgroundColor: "transparent",
                    "&:hover": {
                        backgroundColor: "action.hover",
                    },
                    "&::before": {
                        borderBottom: "none !important",
                    },
                    "&.Mui-focused": {
                        backgroundColor: "action.hover",
                    },
                },
                "& .MuiInputBase-input::placeholder": {
                    opacity: 0.5,
                },
                ...sx,
            }}
        />
    );
};

export default InlineTextField;
