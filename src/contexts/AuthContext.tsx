
import { getUserRequest, useLoginMutation, useRegisterMutation } from "@/api/auth";
import type { IAuthResponse, ILoginPayload, IRegisterPayload, TUser } from "@/api/auth/types";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";


interface IAuthContext {
    login: (payload: ILoginPayload, onSuccess?: (data?: IAuthResponse) => void) => void;
    register: (payload: IRegisterPayload, onSuccess?: (data?: IAuthResponse) => void) => void;
    data: IAuthResponse | null | undefined;
    status: string;
    isLoginPending: boolean;
    isRegisterPending: boolean;
    user: TUser | null;
    loading: boolean;
    logout: () => void;
}

export const AuthContext = createContext<IAuthContext>(
    {} as IAuthContext
)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<TUser | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const { mutate, data, status, isPending: isLoginPending } = useLoginMutation()
    const { mutate: registerMutate, data: registerData, isPending: isRegisterPending } = useRegisterMutation()


    const initAuth = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            if (!token || token === "undefined") {
                setUser(null)
                return
            }

            const result = await getUserRequest()
            setUser(result)

        } catch (error) {
            console.error("Failed to initialize authentication:", error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        initAuth()
    }, [])

    const onLogin = (payload: ILoginPayload, onSuccess?: (data?: IAuthResponse) => void) => {
        mutate(payload, {
            onSuccess: (data) => {
                console.log("Login successful, received data:", data)
                toast.success("Login successful!")
                localStorage.setItem("token", data.accessToken)
                setUser(data.user)
                onSuccess?.(data)
            },
            onError: (error) => {
                console.error("Login failed with error:", error)
                toast.error("Login failed. Please check your credentials and try again.")
            }
        })
    }

    const onRegister = (payload: IRegisterPayload, onSuccess?: (data?: IAuthResponse) => void) => {
        registerMutate(payload, {
            onSuccess: (data) => {
                console.log("Registration successful, logging in with:", data)
                toast.success("Registration successful! Logging you in...")
                localStorage.setItem("token", data.accessToken)
                setUser(data.user)
                onSuccess?.(data)
            },
            onError: (error) => {
                console.error("Registration failed with error:", error)
                toast.error(`Registration failed. ${error.response?.data?.message || "Please try again."}`)
            }
        })
    }

    const onLogout = () => {
        localStorage.removeItem("token")
        setUser(null)
        toast.info("Logged out successfully.")

    }

    return (
        <AuthContext.Provider value={{
            login: onLogin,
            register: onRegister,
            data: data || registerData,
            status,
            isLoginPending,
            isRegisterPending,
            user,
            loading,
            logout: onLogout
        }}>
            {children}
        </AuthContext.Provider>
    )
}