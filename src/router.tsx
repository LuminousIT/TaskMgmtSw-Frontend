import { createBrowserRouter } from "react-router";
import { ProtectedLayout, UnProtectedLayout } from "./layout";
import { AuthGuard } from "./guards";
import { LoginPage, RegisterPage } from "./pages/auth";
import DashboardPage from "./pages/dashboard";
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
        path: "dashboard",
        Component: ProtectedRoutes,
        children: [
            { index: true, path: "", Component: DashboardPage },


        ]
    }
])

export default router;