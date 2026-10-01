import { useEffect, useState } from "react";
import { api } from "../services/api";
import { SHORTLINK_BASE_URL } from "../config";

type Shortlink = {
    id: number;
    code: string;
    original_url: string;
    status: "active" | "inactive";
    click_count: number;
    created_at: string;
    updated_at: string;
};

function Shortlinks() {
    const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        original_url: "",
        custom_code: "",
    });

    async function loadShortlinks() {
        try {
            setLoading(true);
            setError("");

            const response = await api.shortlinks();

            setShortlinks(response.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load shortlinks"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadShortlinks();
    }, []);

    function showSuccess(message: string) {
        setSuccess(message);

        setTimeout(() => {
            setSuccess("");
        }, 3000);
    }

    function resetForm() {
        setForm({
            original_url: "",
            custom_code: "",
        });
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!form.original_url.trim()) {
            setError("Original URL is required.");
            return;
        }

        try {
            const parsedUrl = new URL(
                form.original_url.trim()
            );

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

        if (form.custom_code.trim()) {
            const validCode = /^[a-zA-Z0-9_-]+$/;

            if (!validCode.test(form.custom_code.trim())) {
                setError(
                    "Custom code can only contain letters, numbers, hyphens, and underscores."
                );
                return;
            }
        }

        try {
            setSaving(true);
            setError("");

            await api.createShortlink({
                original_url: form.original_url.trim(),
                custom_code:
                    form.custom_code.trim() || undefined,
            });

            showSuccess(
                "Shortlink created successfully."
            );

            resetForm();

            await loadShortlinks();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create shortlink"
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(
        shortlink: Shortlink
    ) {
        try {
            setError("");

            const newStatus =
                shortlink.status === "active"
                    ? "inactive"
                    : "active";

            await api.updateShortlink(shortlink.id, {
                status: newStatus,
            });

            showSuccess(
                `Shortlink ${
                    newStatus === "active"
                        ? "activated"
                        : "deactivated"
                }.`
            );

            await loadShortlinks();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update status"
            );
        }
    }

    async function deleteShortlink(
        shortlink: Shortlink
    ) {
        const confirmed = window.confirm(
            `Delete shortlink "${shortlink.code}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.deleteShortlink(shortlink.id);

            showSuccess(
                "Shortlink deleted successfully."
            );

            await loadShortlinks();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete shortlink"
            );
        }
    }

    async function copyShortUrl(
        shortlink: Shortlink
    ) {
        const shortUrl =
            `${SHORTLINK_BASE_URL}/${shortlink.code}`;

        try {
            await navigator.clipboard.writeText(
                shortUrl
            );

            showSuccess(
                "Shortlink URL copied."
            );
        } catch {
            setError("Failed to copy shortlink URL.");
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Shortlinks</h1>

                    <p>
                        Create and manage short URLs
                        for your campaigns.
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
                        <h2>Create Shortlink</h2>

                        <p>
                            Create a short URL that redirects
                            to your destination.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group form-group-full">
                            <label htmlFor="original-url">
                                Original URL
                            </label>

                            <input
                                id="original-url"
                                type="url"
                                placeholder="https://example.com/product"
                                value={form.original_url}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        original_url:
                                            event.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="custom-code">
                                Custom Code
                            </label>

                            <input
                                id="custom-code"
                                type="text"
                                placeholder="promo2026"
                                value={form.custom_code}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        custom_code:
                                            event.target.value,
                                    })
                                }
                            />

                            <small>
                                Leave empty to generate a
                                random code automatically.
                            </small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Creating..."
                                : "Create Shortlink"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <div>
                        <h2>Shortlink List</h2>

                        <p>
                            {shortlinks.length} shortlink
                            {shortlinks.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={loadShortlinks}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state">
                        Loading shortlinks...
                    </div>
                ) : shortlinks.length === 0 ? (
                    <div className="empty-state">
                        No shortlinks found.
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Short URL</th>
                                    <th>Original URL</th>
                                    <th>Clicks</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {shortlinks.map(
                                    (shortlink) => {
                                        const shortUrl =
                                            `${SHORTLINK_BASE_URL}/${shortlink.code}`;

                                        return (
                                            <tr
                                                key={
                                                    shortlink.id
                                                }
                                            >
                                                <td>
                                                    <span className="shortlink-code">
                                                        {
                                                            shortlink.code
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="shortlink-url">
                                                        <a
                                                            href={
                                                                shortUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title={
                                                                shortUrl
                                                            }
                                                        >
                                                            {
                                                                shortUrl
                                                            }
                                                        </a>

                                                        <button
                                                            className="icon-btn"
                                                            type="button"
                                                            title="Copy short URL"
                                                            onClick={() =>
                                                                copyShortUrl(
                                                                    shortlink
                                                                )
                                                            }
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div
                                                        className="url-cell"
                                                        title={
                                                            shortlink.original_url
                                                        }
                                                    >
                                                        {
                                                            shortlink.original_url
                                                        }
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            shortlink.click_count
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    <button
                                                        className={`status-badge ${shortlink.status}`}
                                                        type="button"
                                                        title="Toggle status"
                                                        onClick={() =>
                                                            toggleStatus(
                                                                shortlink
                                                            )
                                                        }
                                                    >
                                                        {
                                                            shortlink.status
                                                        }
                                                    </button>
                                                </td>

                                                <td>
                                                    {new Date(
                                                        shortlink.created_at
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
                                                                copyShortUrl(
                                                                    shortlink
                                                                )
                                                            }
                                                        >
                                                            Copy
                                                        </button>

                                                        <button
                                                            className="btn btn-small btn-danger"
                                                            type="button"
                                                            onClick={() =>
                                                                deleteShortlink(
                                                                    shortlink
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shortlinks;