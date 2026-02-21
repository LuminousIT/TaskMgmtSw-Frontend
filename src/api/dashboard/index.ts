import { useQuery } from "@tanstack/react-query";
import axios from "../index";
import type { CustomUseQueryOptions } from "../types";
import type { IDashboardResponse } from "./types";
import { GET_DASHBOARD } from "./constants";

const getDashboardRequest = async (): Promise<IDashboardResponse> =>
    (await axios.get("/api/v1/dashboard")).data;

export const useGetDashboardQuery = (
    options?: CustomUseQueryOptions<IDashboardResponse>
) => {
    return useQuery({
        ...options,
        queryKey: [GET_DASHBOARD],
        queryFn: getDashboardRequest,
    });
};
