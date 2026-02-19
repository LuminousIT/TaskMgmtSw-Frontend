import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";
import ThemeToggle from "@/components/ThemeToggle";

const ProtectedLayout = () => {
    return (
        <Container>
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
                <span>TMS</span>
                <ThemeToggle />
            </Box>
            <Outlet />
        </Container>
    )
}

export default ProtectedLayout;