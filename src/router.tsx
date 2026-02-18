import { createBrowserRouter } from "react-router";
import { ProtectedLayout, UnProtectedLayout } from "./layout";
import { AuthGuard } from "./guards";
import { LoginPage, RegisterPage } from "./pages/auth";
import DashboardPage from "./pages/dashboard";
import Tasks from "./pages/tasks";
import GuestGuard from "./guards/UnauthGuard";

const ProtectedRoutes = () => (
    <AuthGuard>
        <ProtectedLayout />
    </AuthGuard>
)

const UnProtectedRoutes = () => (
    <GuestGuard>
        <UnProtectedLayout />
    </GuestGuard>
)

const router = createBrowserRouter([
    {
        path: "/",
        Component: UnProtectedRoutes,
        children: [
            { path: "/", Component: LoginPage },
            { path: "/login", Component: LoginPage },
            { path: "/register", Component: RegisterPage },
            { path: "*", Component: LoginPage },
        ],
    },
    {
        path: "",
        Component: ProtectedRoutes,
        children: [
            { index: true, path: "dashboard", Component: DashboardPage },
            { path: "tasks", Component: Tasks },
        ]
    }
])

export default router;