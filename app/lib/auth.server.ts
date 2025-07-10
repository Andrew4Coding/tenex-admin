import { createAuthClient } from "better-auth/react";
import { ENV } from "./env";

export const getAuthServer = () => {
    const auth_server = createAuthClient({
        baseURL: ENV.BACKEND_URL,
    });

    return auth_server;
};
