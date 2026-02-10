import { Box } from "@mui/material";
import React from "react";

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Box>
            {children}
        </Box>
    )
}

export default ProtectedLayout;