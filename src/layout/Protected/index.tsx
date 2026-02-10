import { Box, Container } from "@mui/material";
import React from "react";
import { Outlet } from "react-router";

const ProtectedLayout = () => {
    return (
        <Container  >
            <Box sx={{ p: 2 }}>
                Protected Layout
            </Box>
            <Outlet />
        </Container>
    )
}

export default ProtectedLayout;