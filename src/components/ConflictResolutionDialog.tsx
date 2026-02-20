import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import { Close, Warning } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useResolveConflictMutation } from "@/api/tasks";
import type { ITask, IUpdateTaskPayload } from "@/api/tasks/types";
import { getClientId } from "@/utils/clientId";
import axios from "@/api/index";

export interface ConflictData {
    taskId: string;
    localPayload: IUpdateTaskPayload;
    staleTask: Partial<ITask>;
    serverTask?: ITask;
}

interface ConflictResolutionDialogProps {
    open: boolean;
    onClose: () => void;
    conflictData: ConflictData;
}

type CompareField = {
    key: string;
    label: string;
    local: string;
    server: string;
    differs: boolean;
};

const getField = (obj: object, key: string): unknown =>
    (obj as Record<string, unknown>)[key];

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (Array.isArray(value)) {
        if (value.length === 0) return "None";
        if (typeof value[0] === "object" && value[0] !== null && "name" in value[0]) {
            return value.map((v) => v.name).join(", ");
        }
        return value.join(", ");
    }
    return String(value);
};

const FIELD_LABELS: Record<string, string> = {
    title: "Title",
    description: "Description",
    status: "Status",
    priority: "Priority",
    dueDate: "Due Date",
    tags: "Tags",
};

const ConflictResolutionDialog = ({
    open,
    onClose,
    conflictData,
}: ConflictResolutionDialogProps) => {
    const [serverTask, setServerTask] = useState<ITask | null>(null);
    const [loading, setLoading] = useState(true);
    const [mergeMode, setMergeMode] = useState(false);
    const [mergedFields, setMergedFields] = useState<Record<string, "local" | "server">>({});

    const { mutate: resolveConflict, isPending } = useResolveConflictMutation();

    useEffect(() => {
        if (!open) return;
        setMergeMode(false);
        setMergedFields({});

        if (conflictData.serverTask) {
            setServerTask(conflictData.serverTask);
            setLoading(false);
            return;
        }

        setLoading(true);
        axios
            .get(`/api/v1/tasks/${conflictData.taskId}`)
            .then((res) => setServerTask(res.data.task ?? res.data))
            .catch(() => toast.error("Failed to fetch server version"))
            .finally(() => setLoading(false));
    }, [open, conflictData.taskId, conflictData.serverTask]);

    const compareFields = useMemo<CompareField[]>(() => {
        if (!serverTask) return [];
        const fields: CompareField[] = [];
        const { localPayload, staleTask } = conflictData;

        for (const key of Object.keys(FIELD_LABELS)) {
            const localVal = key in localPayload
                ? getField(localPayload, key)
                : getField(staleTask, key);
            const serverVal = getField(serverTask, key);

            const localStr = formatValue(localVal);
            const serverStr = formatValue(serverVal);

            fields.push({
                key,
                label: FIELD_LABELS[key],
                local: localStr,
                server: serverStr,
                differs: localStr !== serverStr,
            });
        }
        return fields;
    }, [serverTask, conflictData]);

    const hasDifferences = compareFields.some((f) => f.differs);

    const handleResolve = (resolution: "use-local" | "use-remote" | "merge") => {
        const base: Parameters<typeof resolveConflict>[0] = {
            clientId: getClientId(),
            entityType: "task",
            entityId: conflictData.taskId,
            resolution,
            serverVersion: serverTask!,
        };

        if (resolution === "use-local") {
            // Backend accepts tag IDs in the same shape as IUpdateTaskPayload
            base.localVersion = conflictData.localPayload as unknown as Partial<ITask>;
        }

        if (resolution === "merge") {
            const merged: Record<string, unknown> = {};
            for (const field of compareFields) {
                if (!field.differs) continue;
                const source = mergedFields[field.key] ?? "server";
                merged[field.key] = source === "local"
                    ? (field.key in conflictData.localPayload
                        ? getField(conflictData.localPayload, field.key)
                        : getField(conflictData.staleTask, field.key))
                    : getField(serverTask!, field.key);
            }
            // Normalize tags to IDs — serverTask/staleTask have ITag[], backend expects string[]
            if (merged.tags && Array.isArray(merged.tags)) {
                merged.tags = (merged.tags as Array<string | { id: string }>).map((t) =>
                    typeof t === "string" ? t : t.id
                );
            }
            base.mergedData = merged as Partial<ITask>;
        }

        resolveConflict(base, {
            onSuccess: () => {
                toast.success(
                    resolution === "use-local"
                        ? "Your changes were applied"
                        : resolution === "use-remote"
                            ? "Server version kept"
                            : "Merged version saved"
                );
                onClose();
            },
            onError: () => {
                toast.error("Failed to resolve conflict");
            },
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: { sx: { borderRadius: 3 } },
                backdrop: { sx: { backdropFilter: "blur(4px)" } },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 2,
                }}
            >
                <Warning color="warning" />
                <Typography variant="h6" component="span" fontWeight={600} sx={{ flex: 1 }}>
                    Conflict Detected
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
                {loading ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                        Loading server version...
                    </Typography>
                ) : !serverTask ? (
                    <Typography color="error" sx={{ py: 4, textAlign: "center" }}>
                        Could not load the server version. Close and try again.
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                            This task was modified by another client. Compare versions below and choose how to resolve.
                        </Typography>

                        {/* Side-by-side comparison */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 1, alignItems: "center" }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                Field
                            </Typography>
                            <Typography variant="caption" fontWeight={600} color="primary.main">
                                Your Changes
                            </Typography>
                            <Typography variant="caption" fontWeight={600} color="success.main">
                                Server Version
                            </Typography>

                            <Divider sx={{ gridColumn: "1 / -1" }} />

                            {compareFields.map((field) => (
                                <Box key={field.key} sx={{ display: "contents" }}>
                                    <Typography variant="body2" fontWeight={500}>
                                        {field.label}
                                    </Typography>
                                    <Box
                                        onClick={mergeMode && field.differs ? () => setMergedFields((p) => ({ ...p, [field.key]: "local" })) : undefined}
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            backgroundColor: field.differs
                                                ? mergeMode && mergedFields[field.key] === "local"
                                                    ? "primary.main"
                                                    : "rgba(25, 118, 210, 0.08)"
                                                : "transparent",
                                            color: mergeMode && mergedFields[field.key] === "local" ? "#fff" : "text.primary",
                                            cursor: mergeMode && field.differs ? "pointer" : "default",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                            {field.local}
                                        </Typography>
                                    </Box>
                                    <Box
                                        onClick={mergeMode && field.differs ? () => setMergedFields((p) => ({ ...p, [field.key]: "server" })) : undefined}
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            backgroundColor: field.differs
                                                ? mergeMode && (mergedFields[field.key] ?? "server") === "server"
                                                    ? "success.main"
                                                    : "rgba(46, 125, 50, 0.08)"
                                                : "transparent",
                                            color: mergeMode && (mergedFields[field.key] ?? "server") === "server" ? "#fff" : "text.primary",
                                            cursor: mergeMode && field.differs ? "pointer" : "default",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                            {field.server}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        {!hasDifferences && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                No visible field differences — the conflict is likely a version number mismatch only.
                            </Typography>
                        )}

                        {mergeMode && hasDifferences && (
                            <Typography variant="caption" color="text.secondary">
                                Click on a value to select it for the merged result. Server values are selected by default.
                            </Typography>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    gap: 1,
                }}
            >
                <Button onClick={onClose} disabled={isPending}>
                    Cancel
                </Button>
                <Box sx={{ flex: 1 }} />
                {mergeMode ? (
                    <>
                        <Button
                            onClick={() => setMergeMode(false)}
                            disabled={isPending}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            disableElevation
                            onClick={() => handleResolve("merge")}
                            loading={isPending}
                            disabled={isPending || !serverTask}
                            sx={{ borderRadius: 2 }}
                        >
                            Save Merge
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={() => handleResolve("use-remote")}
                            loading={isPending}
                            disabled={isPending || !serverTask}
                            sx={{ borderRadius: 2 }}
                        >
                            Use Server
                        </Button>
                        {hasDifferences && (
                            <Button
                                variant="outlined"
                                onClick={() => setMergeMode(true)}
                                disabled={isPending || !serverTask}
                                sx={{ borderRadius: 2 }}
                            >
                                Merge
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            disableElevation
                            color="primary"
                            onClick={() => handleResolve("use-local")}
                            loading={isPending}
                            disabled={isPending || !serverTask}
                            sx={{ borderRadius: 2 }}
                        >
                            Keep Mine
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ConflictResolutionDialog;
