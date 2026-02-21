import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => (
    <Card
        sx={{
            borderRadius: 2,
            borderLeft: "4px solid",
            borderColor: color,
            height: "100%",
        }}
    >
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, "&:last-child": { pb: 2 } }}>
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${color}18`,
                    color,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                    {value}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

export const StatCardSkeleton = () => (
    <Card sx={{ borderRadius: 2, borderLeft: "4px solid", borderColor: "divider" }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, "&:last-child": { pb: 2 } }}>
            <Skeleton variant="rounded" width={44} height={44} />
            <Box>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={50} height={32} />
            </Box>
        </CardContent>
    </Card>
);

export default StatCard;
