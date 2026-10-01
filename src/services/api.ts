import { API_BASE_URL } from "../config";

async function request(
    endpoint: string,
    options: RequestInit = {}
) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type":
                    "application/json",
                ...(options.headers || {}),
            },
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data?.message ||
                "Request failed"
        );
    }

    return data;
}

export const api = {
    /* =========================
       SHORTLINKS
       ========================= */

    shortlinks: () =>
        request("/shortlinks"),

    createShortlink: (
        payload: {
            original_url: string;
            code?: string;
            status?: string;
        }
    ) =>
        request("/shortlinks", {
            method: "POST",
            body: JSON.stringify(
                payload
            ),
        }),

    updateShortlink: (
        id: number,
        payload: {
            original_url?: string;
            code?: string;
            status?: string;
        }
    ) =>
        request(
            `/shortlinks/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(
                    payload
                ),
            }
        ),

    deleteShortlink: (
        id: number
    ) =>
        request(
            `/shortlinks/${id}`,
            {
                method: "DELETE",
            }
        ),

    /* =========================
       LANDING PAGES
       ========================= */

    landingPages: () =>
        request(
            "/landing-pages"
        ),

    createLandingPage: (
        payload: {
            name: string;
            url: string;
            description?: string;
            status?: string;
        }
    ) =>
        request(
            "/landing-pages",
            {
                method: "POST",
                body: JSON.stringify(
                    payload
                ),
            }
        ),

    updateLandingPage: (
        id: number,
        payload: {
            name?: string;
            url?: string;
            description?: string;
            status?: string;
        }
    ) =>
        request(
            `/landing-pages/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(
                    payload
                ),
            }
        ),

    deleteLandingPage: (
        id: number
    ) =>
        request(
            `/landing-pages/${id}`,
            {
                method: "DELETE",
            }
        ),

    /* =========================
       ROUTES
       ========================= */

    routes: () =>
        request("/routes"),

    createRoute: (
        payload: {
            shortlink_id: number;
            landing_page_id: number;
            status?: string;
        }
    ) =>
        request("/routes", {
            method: "POST",
            body: JSON.stringify(
                payload
            ),
        }),

    updateRoute: (
        id: number,
        payload: {
            landing_page_id?: number;
            status?: string;
        }
    ) =>
        request(
            `/routes/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(
                    payload
                ),
            }
        ),

    deleteRoute: (
        id: number
    ) =>
        request(
            `/routes/${id}`,
            {
                method: "DELETE",
            }
        ),

    /* =========================
       TRAFFIC
       ========================= */

    traffic: () =>
        request("/traffic"),

    trafficSummary: () =>
        request(
            "/traffic/summary"
        ),

    /* =========================
       POLICIES
       ========================= */

    getPolicy: (
        shortlinkId: number
    ) =>
        request(
            `/policies/${shortlinkId}`
        ),

    savePolicy: (
        shortlinkId: number,
        payload: {
            country_mode:
                | "all"
                | "allowlist"
                | "blocklist";

            allowed_countries: string[];

            blocked_countries: string[];

            device_mode:
                | "all"
                | "mobile"
                | "desktop"
                | "tablet";

            bot_action:
                | "allow"
                | "deny";

            vpn_action:
                | "allow"
                | "fallback";

            proxy_action:
                | "allow"
                | "fallback";

            tor_action:
                | "allow"
                | "fallback";

            datacenter_action:
                | "allow"
                | "fallback";

            fallback_url: string;

            status:
                | "active"
                | "inactive";
        }
    ) =>
        request(
            `/policies/${shortlinkId}`,
            {
                method: "PUT",
                body: JSON.stringify(
                    payload
                ),
            }
        ),

    deletePolicy: (
        shortlinkId: number
    ) =>
        request(
            `/policies/${shortlinkId}`,
            {
                method: "DELETE",
            }
        ),
};