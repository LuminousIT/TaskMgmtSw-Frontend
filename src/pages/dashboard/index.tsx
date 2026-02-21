import { Box, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/hooks/useAuth";
import { useGetDashboardQuery } from "@/api/dashboard";
import SummaryStats from "./components/SummaryStats";
import ProgressBar from "./components/ProgressBar";
import StatusBreakdown from "./components/StatusBreakdown";
import PriorityBreakdown from "./components/PriorityBreakdown";

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, isLoading } = useGetDashboardQuery();

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        Welcome back{user?.name ? `, ${user.name}` : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Here's an overview of your tasks
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    disableElevation
                    onClick={() => navigate("/tasks")}
                    sx={{ borderRadius: 2 }}
                >
                    View Tasks
                </Button>
            </Box>

            <SummaryStats data={data} isLoading={isLoading} />

            {!isLoading && data && (
                <ProgressBar
                    completionRate={data.completionRate}
                    doneCount={data.tasksByStatus.done}
                    totalTasks={data.totalTasks}
                />
            )}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 12 }}>
                    <StatusBreakdown data={data} isLoading={isLoading} />
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                    <PriorityBreakdown data={data} isLoading={isLoading} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
