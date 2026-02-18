import { useState } from "react";
import {
    ButtonBase,
    MenuItem,
    MenuList,
    Popover,
    Typography,
} from "@mui/material";

interface PopoverSelectOption {
    value: string;
    label: string;
}

interface PopoverSelectProps {
    icon: React.ReactNode;
    label: string;
    displayValue: string;
    displayColor?: string;
    options?: PopoverSelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    children?: React.ReactNode;
}

const PopoverSelect = ({
    icon,
    label,
    displayValue,
    displayColor = "text.primary",
    options,
    value,
    onChange,
    children,
}: PopoverSelectProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <ButtonBase
                onClick={handleOpen}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    width: "auto",
                    justifyContent: "flex-start",
                    transition: "background-color 0.2s ease",
                    "&:hover": { backgroundColor: "action.hover" },
                }}
            >
                <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                >
                    {icon}
                    {label}
                </Typography>
                <Typography variant="body2" color={displayColor}>
                    {displayValue}
                </Typography>
            </ButtonBase>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                {options ? (
                    <MenuList>
                        {options.map((opt) => (
                            <MenuItem
                                key={opt.value}
                                selected={value === opt.value}
                                onClick={() => {
                                    onChange?.(opt.value);
                                    handleClose();
                                }}
                            >
                                {opt.label}
                            </MenuItem>
                        ))}
                    </MenuList>
                ) : (
                    children
                )}
            </Popover>
        </>
    );
};

export default PopoverSelect;
