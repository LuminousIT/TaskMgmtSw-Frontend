import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import type { IDashboardResponse } from "@/api/dashboard/types";
import { STATUS_OPTIONS } from "@/pages/tasks/constants";
import { StatCardSkeleton } from "./StatCard";

interface StatusBreakdownProps {
    data: IDashboardResponse | undefined;
    isLoading: boolean;
}

const StatusBreakdown = ({ data, isLoading }: StatusBreakdownProps) => {
    const navigate = useNavigate();

    return (
        <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                By Status
            </Typography>
            {isLoading ? (
                <Grid container spacing={1.5}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={i}>
                            <StatCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : data ? (
                <Grid container spacing={1.5}>
                    {STATUS_OPTIONS.map((opt) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={opt.value}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    transition: "box-shadow 0.2s, transform 0.15s",
                                    "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
                                }}
                                onClick={() => navigate(`/tasks?status=${opt.value}`)}
                            >
                                <CardContent sx={{ textAlign: "center", py: 2, "&:last-child": { pb: 2 } }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            backgroundColor: opt.color,
                                            mx: "auto",
                                            mb: 1,
                                        }}
                                    />
                                    <Typography variant="h4" fontWeight={700}>
                                        {data.tasksByStatus[opt.value]}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {opt.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : null}
        </Box>
    );
};

export default StatusBreakdown;
