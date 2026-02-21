import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router";
import type { IDashboardResponse } from "@/api/dashboard/types";
import { PRIORITY_OPTIONS } from "@/pages/tasks/constants";
import { StatCardSkeleton } from "./StatCard";

interface PriorityBreakdownProps {
    data: IDashboardResponse | undefined;
    isLoading: boolean;
}

const PriorityBreakdown = ({ data, isLoading }: PriorityBreakdownProps) => {
    const navigate = useNavigate();

    return (
        <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                By Priority
            </Typography>
            {isLoading ? (
                <Grid container spacing={1.5}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Grid size={{ xs: 6, sm: 3 }} key={i}>
                            <StatCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : data ? (
                <Grid container spacing={1.5}>
                    {PRIORITY_OPTIONS.map((opt) => (
                        <Grid size={{ xs: 6, sm: 3 }} key={opt.value}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    transition: "box-shadow 0.2s, transform 0.15s",
                                    "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
                                }}
                                onClick={() => navigate(`/tasks?priority=${opt.value}`)}
                            >
                                <CardContent sx={{ textAlign: "center", py: 2, "&:last-child": { pb: 2 } }}>
                                    <CheckCircle sx={{ fontSize: 20, color: opt.color, mb: 0.5 }} />
                                    <Typography variant="h4" fontWeight={700}>
                                        {data.tasksByPriority[opt.value]}
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

export default PriorityBreakdown;
