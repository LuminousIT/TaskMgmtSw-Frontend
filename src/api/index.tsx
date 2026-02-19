import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const instance = axios.create()


instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
            const methodsWithBody = ["post", "put", "patch"];
            if (methodsWithBody.includes(config.method?.toLowerCase() ?? "")) {
                config.headers["Content-Type"] = "application/json";
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;