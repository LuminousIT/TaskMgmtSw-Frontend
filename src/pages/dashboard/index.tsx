import { Button } from "@mui/material";
import React from "react";
import { useAuth } from "../auth/hooks/useAuth";
import { useNavigate } from "react-router";

const DashboardPage: React.FC = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard!</p>
            <Button variant="contained" color="primary" onClick={() => navigate("/tasks")} >
                View Tasks
            </Button>
            <Button
                onClick={() => logout()}
                variant="contained"
                color="secondary"
            >logout</Button>
        </div>
    )
}

export default DashboardPage;