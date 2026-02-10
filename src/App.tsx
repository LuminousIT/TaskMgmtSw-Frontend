import { RouterProvider } from "react-router"
import router from "./router"
import ThemeProvider from "./theme"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from "react-toastify"
import { AuthProvider } from "./contexts/AuthContext"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient} >
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer position="top-right" autoClose={2000} closeOnClick />

    </QueryClientProvider>

  )
}

export default App
