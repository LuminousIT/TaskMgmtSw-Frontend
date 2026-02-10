import { createTheme } from "@mui/material";

const theme = createTheme({
    colorSchemes: {
        light: {
            palette: {
                mode: "light",
                primary: {
                    main: "#38405F"
                },
                secondary: {
                    main: "#FF0035"
                }
            }
        },
        dark: {
            palette: {
                mode: "dark",
                primary: {
                    main: "#FF8552"
                },
                secondary: {
                    main: "#8B939C"
                }
            }
        }
    }

})

export default theme;