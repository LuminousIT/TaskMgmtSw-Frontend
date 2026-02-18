import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";
import ThemeToggle from "@/components/ThemeToggle";

const ProtectedLayout = () => {
    return (
        <Container>
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Protected Layout</span>
                <ThemeToggle />
            </Box>
            <Outlet />
        </Container>
    )
}

export default ProtectedLayout;