import { useState, useMemo, useCallback } from "react";
import type { IGetTasksParams, TaskStatus, TaskPriority } from "@/api/tasks/types";
import { DEFAULT_PAGE_SIZE } from "../constants";

export interface TaskFiltersState {
    search: string;
    statuses: TaskStatus[];
    priorities: TaskPriority[];
    dueAfter: string;
    dueBefore: string;
    tagIds: string[];
    sortBy: IGetTasksParams["sortBy"];
    sortOrder: "asc" | "desc";
    page: number;
}

const initialFilters: TaskFiltersState = {
    search: "",
    statuses: [],
    priorities: [],
    dueAfter: "",
    dueBefore: "",
    tagIds: [],
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
};

export const useTaskFilters = () => {
    const [filters, setFilters] = useState<TaskFiltersState>(initialFilters);

    const setSearch = useCallback((search: string) =>
        setFilters((prev) => ({ ...prev, search, page: 1 })), []);

    const setStatuses = useCallback((statuses: TaskStatus[]) =>
        setFilters((prev) => ({ ...prev, statuses, page: 1 })), []);

    const setPriorities = useCallback((priorities: TaskPriority[]) =>
        setFilters((prev) => ({ ...prev, priorities, page: 1 })), []);

    const setDueRange = useCallback((dueAfter: string, dueBefore: string) =>
        setFilters((prev) => ({ ...prev, dueAfter, dueBefore, page: 1 })), []);

    const setTagIds = useCallback((tagIds: string[]) =>
        setFilters((prev) => ({ ...prev, tagIds, page: 1 })), []);

    const setSort = useCallback((sortBy: IGetTasksParams["sortBy"], sortOrder: "asc" | "desc") =>
        setFilters((prev) => ({ ...prev, sortBy, sortOrder })), []);

    const setPage = useCallback((page: number) =>
        setFilters((prev) => ({ ...prev, page })), []);

    const clearAll = useCallback(() => setFilters(initialFilters), []);

    const removeFilter = useCallback((type: string, value?: string) => {
        setFilters((prev) => {
            const next = { ...prev, page: 1 };
            switch (type) {
                case "search": next.search = ""; break;
                case "status": next.statuses = prev.statuses.filter((s) => s !== value); break;
                case "priority": next.priorities = prev.priorities.filter((p) => p !== value); break;
                case "dueRange": next.dueAfter = ""; next.dueBefore = ""; break;
                case "tag": next.tagIds = prev.tagIds.filter((id) => id !== value); break;
            }
            return next;
        });
    }, []);

    const apiParams: IGetTasksParams = useMemo(() => {
        const params: IGetTasksParams = {
            page: filters.page,
            limit: DEFAULT_PAGE_SIZE,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
        };
        if (filters.search) params.search = filters.search;
        if (filters.statuses.length === 1) params.status = filters.statuses[0];
        if (filters.priorities.length === 1) params.priority = filters.priorities[0];
        if (filters.dueAfter) params.dueAfter = filters.dueAfter;
        if (filters.dueBefore) params.dueBefore = filters.dueBefore;
        if (filters.tagIds.length) params.tags = filters.tagIds.join(",");
        return params;
    }, [filters]);

    const activeFilterChips = useMemo(() => {
        const chips: { type: string; label: string; value?: string }[] = [];

        if (filters.search) chips.push({ type: "search", label: `Search: "${filters.search}"` });

        filters.statuses.forEach((s) => chips.push({ type: "status", label: `Status: ${s}`, value: s }));
        filters.priorities.forEach((p) => chips.push({ type: "priority", label: `Priority: ${p}`, value: p }));

        if (filters.dueAfter || filters.dueBefore)
            chips.push({ type: "dueRange", label: `Due: ${filters.dueAfter || "..."} – ${filters.dueBefore || "..."}` });

        filters.tagIds.forEach((id) => chips.push({ type: "tag", label: "Tag", value: id }));

        return chips;
    }, [filters]);

    const hasActiveFilters = activeFilterChips.length > 0;

    return {
        filters, apiParams, activeFilterChips, hasActiveFilters,
        setSearch, setStatuses, setPriorities, setDueRange, setTagIds,
        setSort, setPage, clearAll, removeFilter,
    };
};
