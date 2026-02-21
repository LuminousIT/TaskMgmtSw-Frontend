import { Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";

interface ProgressBarProps {
    completionRate: number;
    doneCount: number;
    totalTasks: number;
}

const ProgressBar = ({ completionRate, doneCount, totalTasks }: ProgressBarProps) => (
    <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                    Overall Progress
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                    {completionRate}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        backgroundColor: completionRate >= 75
                            ? "#22c55e"
                            : completionRate >= 50
                                ? "#f97316"
                                : "#ef4444",
                    },
                }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {doneCount} of {totalTasks} tasks completed
            </Typography>
        </CardContent>
    </Card>
);

export default ProgressBar;
