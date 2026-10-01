import { useEffect, useState } from "react";
import { api } from "../services/api";

type LandingPage = {
    id: number;
    name: string;
    url: string;
    description: string | null;
    status: "active" | "inactive";
    route_count: number;
    created_at: string;
    updated_at: string;
};

function LandingPages() {
    const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: "",
        url: "",
        description: "",
        status: "active",
    });

    async function loadLandingPages() {
        try {
            setLoading(true);
            setError("");

            const response = await api.landingPages();

            setLandingPages(response.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load landing pages"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLandingPages();
    }, []);

    function resetForm() {
        setForm({
            name: "",
            url: "",
            description: "",
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

    function startEdit(landingPage: LandingPage) {
        setEditingId(landingPage.id);

        setForm({
            name: landingPage.name,
            url: landingPage.url,
            description: landingPage.description || "",
            status: landingPage.status,
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

        if (!form.name.trim()) {
            setError("Landing page name is required.");
            return;
        }

        if (!form.url.trim()) {
            setError("Landing page URL is required.");
            return;
        }

        try {
            const parsedUrl = new URL(form.url);

            if (
                parsedUrl.protocol !== "http:" &&
                parsedUrl.protocol !== "https:"
            ) {
                throw new Error();
            }
        } catch {
            setError("Please enter a valid HTTP/HTTPS URL.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            if (editingId) {
                await api.updateLandingPage(editingId, {
                    name: form.name.trim(),
                    url: form.url.trim(),
                    description: form.description.trim(),
                    status: form.status,
                });

                showSuccess(
                    "Landing page updated successfully."
                );
            } else {
                await api.createLandingPage({
                    name: form.name.trim(),
                    url: form.url.trim(),
                    description: form.description.trim(),
                });

                showSuccess(
                    "Landing page created successfully."
                );
            }

            resetForm();

            await loadLandingPages();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save landing page"
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(
        landingPage: LandingPage
    ) {
        try {
            setError("");

            const newStatus =
                landingPage.status === "active"
                    ? "inactive"
                    : "active";

            await api.updateLandingPage(landingPage.id, {
                status: newStatus,
            });

            showSuccess(
                `Landing page ${
                    newStatus === "active"
                        ? "activated"
                        : "deactivated"
                }.`
            );

            await loadLandingPages();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update status"
            );
        }
    }

    async function deleteLandingPage(
        landingPage: LandingPage
    ) {
        const message =
            landingPage.route_count > 0
                ? `This landing page is currently used by ${landingPage.route_count} route(s).\n\nAre you sure you want to delete it?`
                : `Delete landing page "${landingPage.name}"?`;

        if (!window.confirm(message)) {
            return;
        }

        try {
            setError("");

            await api.deleteLandingPage(
                landingPage.id
            );

            showSuccess(
                "Landing page deleted successfully."
            );

            if (editingId === landingPage.id) {
                resetForm();
            }

            await loadLandingPages();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete landing page"
            );
        }
    }

    async function copyUrl(url: string) {
        try {
            await navigator.clipboard.writeText(url);

            showSuccess("Landing page URL copied.");
        } catch {
            setError("Failed to copy URL.");
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Landing Pages</h1>

                    <p>
                        Manage destination pages used by
                        your shortlink routes.
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
                                ? "Edit Landing Page"
                                : "Create Landing Page"}
                        </h2>

                        <p>
                            {editingId
                                ? "Update landing page configuration."
                                : "Add a new landing page destination."}
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
                            <label htmlFor="landing-name">
                                Name
                            </label>

                            <input
                                id="landing-name"
                                type="text"
                                placeholder="Campaign Landing Page"
                                value={form.name}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        name: event.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="landing-url">
                                URL
                            </label>

                            <input
                                id="landing-url"
                                type="url"
                                placeholder="https://example.com/landing-page"
                                value={form.url}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        url: event.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group form-group-full">
                            <label htmlFor="landing-description">
                                Description
                            </label>

                            <textarea
                                id="landing-description"
                                placeholder="Describe this landing page or campaign..."
                                rows={3}
                                value={form.description}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        description:
                                            event.target.value,
                                    })
                                }
                            />
                        </div>

                        {editingId && (
                            <div className="form-group">
                                <label htmlFor="landing-status">
                                    Status
                                </label>

                                <select
                                    id="landing-status"
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
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Landing Page"
                                    : "Create Landing Page"}
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
                        <h2>Landing Page List</h2>

                        <p>
                            {landingPages.length} landing page
                            {landingPages.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={loadLandingPages}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state">
                        Loading landing pages...
                    </div>
                ) : landingPages.length === 0 ? (
                    <div className="empty-state">
                        No landing pages found.
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>URL</th>
                                    <th>Description</th>
                                    <th>Routes</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {landingPages.map(
                                    (landingPage) => (
                                        <tr
                                            key={
                                                landingPage.id
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        landingPage.name
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="landing-url">
                                                    <span
                                                        title={
                                                            landingPage.url
                                                        }
                                                    >
                                                        {
                                                            landingPage.url
                                                        }
                                                    </span>

                                                    <button
                                                        className="icon-btn"
                                                        type="button"
                                                        title="Copy URL"
                                                        onClick={() =>
                                                            copyUrl(
                                                                landingPage.url
                                                            )
                                                        }
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="description-cell">
                                                    {landingPage.description ||
                                                        "-"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="route-count">
                                                    {
                                                        landingPage.route_count
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className={`status-badge ${landingPage.status}`}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleStatus(
                                                            landingPage
                                                        )
                                                    }
                                                    title="Toggle status"
                                                >
                                                    {
                                                        landingPage.status
                                                    }
                                                </button>
                                            </td>

                                            <td>
                                                {new Date(
                                                    landingPage.created_at
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
                                                                landingPage
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="btn btn-small btn-danger"
                                                        type="button"
                                                        onClick={() =>
                                                            deleteLandingPage(
                                                                landingPage
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LandingPages;