import { Box, Typography } from "@mui/material";
import { AssignmentOutlined } from "@mui/icons-material";

const TaskEmptyState = () => (
    <Box sx={{ textAlign: "center", py: 8 }}>
        <AssignmentOutlined sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks yet
        </Typography>
        <Typography variant="body2" color="text.disabled">
            Create your first task to get started
        </Typography>
    </Box>
);

export default TaskEmptyState;
