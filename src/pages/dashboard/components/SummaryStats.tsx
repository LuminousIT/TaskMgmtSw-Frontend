import { Grid } from "@mui/material";
import { Assignment, Flag, Schedule, TrendingUp, Warning } from "@mui/icons-material";
import type { IDashboardResponse } from "@/api/dashboard/types";
import StatCard, { StatCardSkeleton } from "./StatCard";

interface SummaryStatsProps {
    data: IDashboardResponse | undefined;
    isLoading: boolean;
}

const SummaryStats = ({ data, isLoading }: SummaryStatsProps) => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
        {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                    <StatCardSkeleton />
                </Grid>
            ))
        ) : data ? (
            <>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard
                        label="Total Tasks"
                        value={data.totalTasks}
                        icon={<Assignment />}
                        color="#3b82f6"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard
                        label="Completion Rate"
                        value={`${data.completionRate}%`}
                        icon={<TrendingUp />}
                        color="#22c55e"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard
                        label="Overdue"
                        value={data.overdue}
                        icon={<Warning />}
                        color="#ef4444"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard
                        label="Due Today"
                        value={data.dueToday}
                        icon={<Schedule />}
                        color="#f97316"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <StatCard
                        label="Due This Week"
                        value={data.dueThisWeek}
                        icon={<Flag />}
                        color="#8b5cf6"
                    />
                </Grid>
            </>
        ) : null}
    </Grid>
);

export default SummaryStats;
