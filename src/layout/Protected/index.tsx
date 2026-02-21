import { Box, Button, Container, Typography } from "@mui/material";
import { Dashboard, ListAlt } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard sx={{ fontSize: 18 }} /> },
    { label: "Tasks", path: "/tasks", icon: <ListAlt sx={{ fontSize: 18 }} /> },
];

const ProtectedLayout = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <Container>
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    gap: 2,
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                    onClick={() => navigate("/dashboard")}
                    sx={{ cursor: "pointer", mr: 2 }}
                >
                    TMS
                </Typography>

                <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                        return (
                            <Button
                                key={item.path}
                                startIcon={item.icon}
                                onClick={() => navigate(item.path)}
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? "primary.main" : "text.secondary",
                                    backgroundColor: isActive ? "action.selected" : "transparent",
                                    "&:hover": {
                                        backgroundColor: isActive ? "action.selected" : "action.hover",
                                    },
                                }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </Box>

                <ThemeToggle />
            </Box>
            <Outlet />
        </Container>
    );
};

export default ProtectedLayout;
