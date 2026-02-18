import { IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useColorScheme } from "@mui/material/styles";

const ThemeToggle = () => {
    const { mode, setMode } = useColorScheme();

    const toggleMode = () => {
        setMode(mode === "dark" ? "light" : "dark");
    };

    return (
        <IconButton onClick={toggleMode} color="inherit">
            {mode === "dark" ? <LightMode /> : <DarkMode />}
        </IconButton>
    );
};

export default ThemeToggle;
