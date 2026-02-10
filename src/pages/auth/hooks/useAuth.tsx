// import type { ILoginPayload, IRegisterPayload } from "@/api/auth/types"
// import { useLoginMutation, useRegisterMutation } from "@/api/auth"
// import { toast } from "react-toastify"
// import { useNavigate } from "react-router"

// export const useAuth = () => {
//     const navigate = useNavigate()
//     const { mutate, data, status, isPending: isLoginPending } = useLoginMutation()
//     const { mutate: registerMutate, data: registerData, isPending: isRegisterPending } = useRegisterMutation()

//     const onLogin = (payload: ILoginPayload) => {
//         mutate(payload, {
//             onSuccess: (data) => {
//                 console.log("Login successful, received data:", data)
//                 toast.success("Login successful!")
//                 localStorage.setItem("token", data.accessToken)
//                 navigate('/dashboard')
//             },
//             onError: (error) => {
//                 console.error("Login failed with error:", error)
//                 toast.error("Login failed. Please check your credentials and try again.")
//             }
//         })
//     }

//     const onRegister = (payload: IRegisterPayload) => {
//         registerMutate(payload, {
//             onSuccess: (data) => {
//                 console.log("Registration successful, logging in with:", data)
//                 toast.success("Registration successful! Logging you in...")
//                 localStorage.setItem("token", data.accessToken)
//                 navigate('/dashboard')
//             },
//             onError: (error) => {
//                 console.error("Registration failed with error:", error)
//                 toast.error(`Registration failed. ${error.response?.data?.message || "Please try again."}`)
//             }
//         })
//     }
//     return {
//         login: onLogin,
//         register: onRegister,
//         data: data || registerData,
//         status,
//         isLoginPending,
//         isRegisterPending
//     }
// }

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
    return useContext(AuthContext)
}