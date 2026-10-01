import { useEffect, useState } from "react";
import { api } from "../services/api";
import { SHORTLINK_BASE_URL } from "../config";

type Shortlink = {
    id: number;
    code: string;
    original_url: string;
    status: "active" | "inactive";
};

type LandingPage = {
    id: number;
    name: string;
    url: string;
    status: "active" | "inactive";
};

type RouteItem = {
    id: number;
    shortlink_id: number;
    shortlink_code: string;
    original_url: string;
    landing_page_id: number;
    landing_page_name: string;
    landing_page_url: string;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
};

function Routes() {
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
    const [landingPages, setLandingPages] = useState<LandingPage[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState({
        shortlink_id: "",
        landing_page_id: "",
        status: "active",
    });

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [
                routesResponse,
                shortlinksResponse,
                landingPagesResponse,
            ] = await Promise.all([
                api.routes(),
                api.shortlinks(),
                api.landingPages(),
            ]);

            setRoutes(routesResponse.data);
            setShortlinks(shortlinksResponse.data);
            setLandingPages(landingPagesResponse.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load route data"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function resetForm() {
        setForm({
            shortlink_id: "",
            landing_page_id: "",
            status: "active",
        });

        setEditingId(null);
    }

    function showSuccess(message: string) {
        setSuccess(message);

        setTimeout(() => {
            setSuccess("");
        }, 3000);
    }

    function startEdit(route: RouteItem) {
        setEditingId(route.id);

        setForm({
            shortlink_id: String(route.shortlink_id),
            landing_page_id: String(route.landing_page_id),
            status: route.status,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!form.shortlink_id) {
            setError("Please select a shortlink.");
            return;
        }

        if (!form.landing_page_id) {
            setError("Please select a landing page.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            if (editingId) {
                await api.updateRoute(editingId, {
                    landing_page_id: Number(
                        form.landing_page_id
                    ),
                    status: form.status,
                });

                showSuccess(
                    "Route updated successfully."
                );
            } else {
                await api.createRoute({
                    shortlink_id: Number(
                        form.shortlink_id
                    ),
                    landing_page_id: Number(
                        form.landing_page_id
                    ),
                    status: form.status,
                });

                showSuccess(
                    "Route created successfully."
                );
            }

            resetForm();

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save route"
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(route: RouteItem) {
        try {
            setError("");

            const newStatus =
                route.status === "active"
                    ? "inactive"
                    : "active";

            await api.updateRoute(route.id, {
                status: newStatus,
            });

            showSuccess(
                `Route ${
                    newStatus === "active"
                        ? "activated"
                        : "deactivated"
                }.`
            );

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update route"
            );
        }
    }

    async function deleteRoute(route: RouteItem) {
        const confirmed = window.confirm(
            `Delete route "${route.shortlink_code} → ${route.landing_page_name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.deleteRoute(route.id);

            showSuccess(
                "Route deleted successfully."
            );

            if (editingId === route.id) {
                resetForm();
            }

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete route"
            );
        }
    }

    function getShortlinkUrl(code: string) {
        return `${SHORTLINK_BASE_URL}/${code}`;
    }

    async function copyShortlink(code: string) {
        try {
            await navigator.clipboard.writeText(
                getShortlinkUrl(code)
            );

            showSuccess(
                "Shortlink URL copied."
            );
        } catch {
            setError("Failed to copy shortlink.");
        }
    }

    const availableLandingPages =
        landingPages.filter(
            (page) => page.status === "active"
        );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Routes</h1>

                    <p>
                        Connect shortlinks with their
                        landing page destinations.
                    </p>
                </div>
            </div>

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="content-card form-card">
                <div className="card-header">
                    <div>
                        <h2>
                            {editingId
                                ? "Edit Route"
                                : "Create Route"}
                        </h2>

                        <p>
                            {editingId
                                ? "Update the landing page destination for this shortlink."
                                : "Connect a shortlink to an active landing page."}
                        </p>
                    </div>

                    {editingId && (
                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={resetForm}
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="route-shortlink">
                                Shortlink
                            </label>

                            <select
                                id="route-shortlink"
                                value={form.shortlink_id}
                                disabled={Boolean(
                                    editingId
                                )}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        shortlink_id:
                                            event.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Select shortlink
                                </option>

                                {shortlinks
                                    .filter(
                                        (shortlink) =>
                                            shortlink.status ===
                                                "active" ||
                                            String(
                                                shortlink.id
                                            ) ===
                                                form.shortlink_id
                                    )
                                    .map((shortlink) => (
                                        <option
                                            key={
                                                shortlink.id
                                            }
                                            value={
                                                shortlink.id
                                            }
                                        >
                                            /
                                            {
                                                shortlink.code
                                            }
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="route-landing-page">
                                Landing Page
                            </label>

                            <select
                                id="route-landing-page"
                                value={
                                    form.landing_page_id
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        landing_page_id:
                                            event.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    Select landing page
                                </option>

                                {availableLandingPages.map(
                                    (page) => (
                                        <option
                                            key={page.id}
                                            value={page.id}
                                        >
                                            {page.name} —{" "}
                                            {page.url}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="route-status">
                                Status
                            </label>

                            <select
                                id="route-status"
                                value={form.status}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        status: event.target.value,
                                    })
                                }
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    {availableLandingPages.length ===
                        0 && (
                        <div className="route-warning">
                            No active landing pages available.
                            Create or activate a landing page
                            first.
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={
                                saving ||
                                availableLandingPages.length ===
                                    0
                            }
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Route"
                                    : "Create Route"}
                        </button>

                        {editingId && (
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={resetForm}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <div>
                        <h2>Route List</h2>

                        <p>
                            {routes.length} route
                            {routes.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={loadData}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state">
                        Loading routes...
                    </div>
                ) : routes.length === 0 ? (
                    <div className="empty-state">
                        No routes configured.
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Shortlink</th>
                                    <th>Original URL</th>
                                    <th>Landing Page</th>
                                    <th>Destination</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {routes.map((route) => (
                                    <tr key={route.id}>
                                        <td>
                                            <div className="route-shortlink">
                                                <strong>
                                                    /
                                                    {
                                                        route.shortlink_code
                                                    }
                                                </strong>

                                                <button
                                                    className="icon-btn"
                                                    type="button"
                                                    title="Copy short URL"
                                                    onClick={() =>
                                                        copyShortlink(
                                                            route.shortlink_code
                                                        )
                                                    }
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className="url-cell"
                                                title={
                                                    route.original_url
                                                }
                                            >
                                                {
                                                    route.original_url
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    route.landing_page_name
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className="url-cell"
                                                title={
                                                    route.landing_page_url
                                                }
                                            >
                                                {
                                                    route.landing_page_url
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className={`status-badge ${route.status}`}
                                                type="button"
                                                onClick={() =>
                                                    toggleStatus(
                                                        route
                                                    )
                                                }
                                                title="Toggle status"
                                            >
                                                {
                                                    route.status
                                                }
                                            </button>
                                        </td>

                                        <td>
                                            {new Date(
                                                route.created_at
                                            ).toLocaleDateString(
                                                "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                }
                                            )}
                                        </td>

                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-small btn-secondary"
                                                    type="button"
                                                    onClick={() =>
                                                        startEdit(
                                                            route
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn btn-small btn-danger"
                                                    type="button"
                                                    onClick={() =>
                                                        deleteRoute(
                                                            route
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Routes;