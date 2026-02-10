import { useAuth } from "@/pages/auth/hooks/useAuth";
import { CircularProgress } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

interface AuthGuardProps {
    children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { loading, user } = useAuth()
    const { pathname } = useLocation();
    const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

    if (loading) {
        return <CircularProgress />;
    }

    if (!user) {
        if (pathname !== requestedLocation) {
            setRequestedLocation(pathname);
        }
        return <Navigate to="/login" />;
    }

    if (requestedLocation && pathname !== requestedLocation) {
        setRequestedLocation(null);
        return <Navigate to={requestedLocation} />;
    }

    return <>{children}</>;
}