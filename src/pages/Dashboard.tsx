import { useEffect, useState } from "react";

import Header from "../components/Header";
import StatCard from "../components/StatCard";
import { api } from "../services/api";

interface Summary {
    total_clicks: number;
    unique_visitors: number;
    mobile_visitors: number;
    desktop_visitors: number;
    tablet_visitors: number;
}

interface TrafficItem {
    id: number;
    shortlink_code: string;
    landing_page_name: string | null;
    device: string;
    created_at: string;
}

export default function Dashboard() {
    const [summary, setSummary] =
        useState<Summary | null>(null);

    const [traffic, setTraffic] =
        useState<TrafficItem[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            const [
                summaryResponse,
                trafficResponse,
            ] = await Promise.all([
                api.trafficSummary(),
                api.traffic(),
            ]);

            setSummary(
                summaryResponse.data
            );

            setTraffic(
                trafficResponse.data.slice(0, 8)
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Header
                title="Dashboard"
                subtitle="Overview of your shortlink traffic"
            />

            {error && (
                <div className="alert-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading">
                    Loading dashboard...
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        <StatCard
                            title="Total Clicks"
                            value={
                                summary?.total_clicks ?? 0
                            }
                            description="All recorded visits"
                        />

                        <StatCard
                            title="Unique Visitors"
                            value={
                                summary?.unique_visitors ?? 0
                            }
                            description="Unique hashed IPs"
                        />

                        <StatCard
                            title="Mobile"
                            value={
                                summary?.mobile_visitors ?? 0
                            }
                            description="Unique mobile visitors"
                        />

                        <StatCard
                            title="Desktop"
                            value={
                                summary?.desktop_visitors ?? 0
                            }
                            description="Unique desktop visitors"
                        />
                    </div>

                    <div className="content-card">
                        <div className="content-card-header">
                            <div>
                                <h2>
                                    Recent Traffic
                                </h2>

                                <p>
                                    Latest shortlink visits
                                </p>
                            </div>
                        </div>

                        {traffic.length === 0 ? (
                            <div className="empty-state">
                                No traffic recorded yet.
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                Shortlink
                                            </th>

                                            <th>
                                                Landing Page
                                            </th>

                                            <th>
                                                Device
                                            </th>

                                            <th>
                                                Time
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {traffic.map(
                                            (item) => (
                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <td>
                                                        <span className="code-badge">
                                                            /
                                                            {
                                                                item.shortlink_code
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {
                                                            item.landing_page_name
                                                        }
                                                    </td>

                                                    <td>
                                                        <span className="status-badge">
                                                            {
                                                                item.device
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {new Date(
                                                            item.created_at
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
