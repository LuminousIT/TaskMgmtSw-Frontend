const STORAGE_KEY = "tms_client_id";

export const getClientId = (): string => {
    let clientId = localStorage.getItem(STORAGE_KEY);
    if (!clientId) {
        const userAgent = navigator.userAgent || "unknown";
        if (userAgent.length > 50) {
            clientId = `${userAgent.slice(0, 50)}-${crypto.randomUUID()}`;
        } else {
            clientId = `${userAgent}-${crypto.randomUUID()}`;
        }
        localStorage.setItem(STORAGE_KEY, clientId);
    }
    return clientId;
};
