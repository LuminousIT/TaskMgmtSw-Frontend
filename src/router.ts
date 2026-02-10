import { createBrowserRouter } from "react-router";
import { UnProtectedLayout } from "./layout";
import { LoginPage, RegisterPage } from "./pages/auth";

const router = createBrowserRouter([
    {
        path: "/",
        Component: UnProtectedLayout,
        children: [
            { path: "/", Component: LoginPage },
            { path: "/login", Component: LoginPage },
            { path: "/register", Component: RegisterPage },
        ]
    }
])

export default router;