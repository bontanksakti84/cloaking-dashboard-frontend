import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const devApiKey =
        env.VITE_DEV_API_KEY || "";

    console.log(
        `[VITE] DEV API KEY loaded: ${
            devApiKey ? "YES" : "NO"
        }`
    );

    return {
        plugins: [react()],

        server: {
            host: "localhost",
            port: 5173,

            proxy: {
                "/api": {
                    target: "http://localhost:4000",
                    changeOrigin: true,
                    secure: false,

                    configure: (proxy) => {
                        proxy.on(
                            "proxyReq",
                            (proxyReq) => {
                                if (!devApiKey) {
                                    console.error(
                                        "[VITE] DEV API KEY is empty"
                                    );
                                    return;
                                }

                                proxyReq.setHeader(
                                    "x-api-key",
                                    devApiKey
                                );

                                console.log(
                                    "[VITE] API key injected into proxy request"
                                );
                            }
                        );
                    },
                },
            },
        },
    };
});