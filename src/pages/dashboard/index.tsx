import { Button } from "@mui/material";
import React from "react";
import { useAuth } from "../auth/hooks/useAuth";

const DashboardPage: React.FC = () => {
    const { logout } = useAuth()
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard!</p>
            <Button
                onClick={() => logout()}
                variant="contained"
                color="secondary"
            >logout</Button>
        </div>
    )
}

export default DashboardPage;