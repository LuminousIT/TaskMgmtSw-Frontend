import React from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import theme from "./theme-setup";
import { CssBaseline } from "@mui/material";

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <MuiThemeProvider theme={theme} >
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    )
}

export default ThemeProvider;