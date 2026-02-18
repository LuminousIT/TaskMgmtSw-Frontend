import { Button } from "@mui/material";
import { useState } from "react";
import CreateTaskModal from "./components/CreateTaskModal";

const Tasks = () => {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Create Task
            </Button>
            <CreateTaskModal open={open} onClose={() => setOpen(false)} />
        </div>
    );
};

export default Tasks;
