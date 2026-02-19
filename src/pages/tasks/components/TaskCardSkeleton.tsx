import { Box, Card, CardContent, Skeleton } from "@mui/material";

const TaskCardSkeleton = () => (
    <Card sx={{ borderRadius: 2, height: "100%" }}>
        <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
            </Box>
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="60%" sx={{ mb: 1.5 }} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ mb: 1 }} />
            <Box sx={{ display: "flex", gap: 0.5 }}>
                <Skeleton variant="rounded" width={60} height={22} />
                <Skeleton variant="rounded" width={50} height={22} />
            </Box>
        </CardContent>
    </Card>
);

export default TaskCardSkeleton;
