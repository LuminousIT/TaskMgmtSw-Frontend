import { useAuth } from "@/pages/auth/hooks/useAuth";
import { Navigate } from "react-router";


interface GuestGuardProps {
    children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
}