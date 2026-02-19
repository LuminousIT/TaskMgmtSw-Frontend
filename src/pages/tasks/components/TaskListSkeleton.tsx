import { Skeleton, TableBody, TableCell, TableRow } from "@mui/material";

const TaskListSkeleton = () => (
    <TableBody>
        {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell>
                    <Skeleton variant="rounded" width={80} height={24} />
                </TableCell>
                <TableCell>
                    <Skeleton variant="text" width="70%" height={24} />
                </TableCell>
                <TableCell>
                    <Skeleton variant="rounded" width={70} height={22} />
                </TableCell>
                <TableCell>
                    <Skeleton variant="text" width={80} height={20} />
                </TableCell>
                <TableCell>
                    <Skeleton variant="rounded" width={60} height={22} />
                </TableCell>
                <TableCell>
                    <Skeleton variant="circular" width={24} height={24} />
                </TableCell>
            </TableRow>
        ))}
    </TableBody>
);

export default TaskListSkeleton;
