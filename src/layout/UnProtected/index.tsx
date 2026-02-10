import { Box, IconButton, useColorScheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { Outlet } from "react-router";

const CenterBox = styled(Box)(({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    height: 'calc(100vh - 64px)',
}))

const UnProtectedLayout: React.FC = () => {
    const { mode, setMode } = useColorScheme();
    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                padding={2}
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Box>
                    logo
                </Box>
                <Box>
                    <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
                        {mode === 'light' ? '🌙' : '☀️'}
                    </IconButton>
                </Box>
            </Box>

            <CenterBox>
                <Outlet />
            </CenterBox>
        </Box>
    )
}

export default UnProtectedLayout;