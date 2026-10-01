import { useEffect, useState } from "react";
import { api } from "../services/api";

type TrafficLog = {
    id: number;
    shortlink_code: string;
    landing_page_name: string | null;
    landing_page_url: string | null;
    ip_hash: string | null;
    user_agent: string | null;
    referer: string | null;
    device: string | null;
    country: string | null;
    created_at: string;
};

type TrafficSummary = {
    total_clicks: number;
    unique_visitors: number;
    mobile_visitors: number;
    desktop_visitors: number;
    tablet_visitors: number;
};

function Traffic() {
    const [traffic, setTraffic] = useState<TrafficLog[]>([]);
    const [summary, setSummary] =
        useState<TrafficSummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadTraffic() {
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

            setSummary(summaryResponse.data);
            setTraffic(trafficResponse.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load traffic data"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTraffic();
    }, []);

    function formatDate(date: string) {
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    function shortenText(
        value: string | null,
        length = 45
    ) {
        if (!value) {
            return "-";
        }

        if (value.length <= length) {
            return value;
        }

        return `${value.substring(0, length)}...`;
    }

    function getDeviceClass(device: string | null) {
        if (!device) {
            return "unknown";
        }

        return device.toLowerCase();
    }

    const totalDevices =
        summary
            ? summary.mobile_visitors +
              summary.desktop_visitors +
              summary.tablet_visitors
            : 0;

    function getPercentage(value: number) {
        if (!totalDevices) {
            return 0;
        }

        return Math.round(
            (value / totalDevices) * 100
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Traffic Analytics</h1>
                    <p>
                        Monitor shortlink clicks and visitor
                        traffic.
                    </p>
                </div>

                <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={loadTraffic}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {loading && !summary ? (
                <div className="content-card">
                    <div className="empty-state">
                        Loading traffic analytics...
                    </div>
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">
                                Total Clicks
                            </div>

                            <div className="stat-value">
                                {summary?.total_clicks ?? 0}
                            </div>

                            <div className="stat-description">
                                All recorded clicks
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                Unique Visitors
                            </div>

                            <div className="stat-value">
                                {summary?.unique_visitors ?? 0}
                            </div>

                            <div className="stat-description">
                                Based on hashed IP
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                Mobile
                            </div>

                            <div className="stat-value">
                                {summary?.mobile_visitors ?? 0}
                            </div>

                            <div className="stat-description">
                                {getPercentage(
                                    summary?.mobile_visitors ??
                                        0
                                )}
                                % of detected devices
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                Desktop
                            </div>

                            <div className="stat-value">
                                {summary?.desktop_visitors ?? 0}
                            </div>

                            <div className="stat-description">
                                {getPercentage(
                                    summary?.desktop_visitors ??
                                        0
                                )}
                                % of detected devices
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                Tablet
                            </div>

                            <div className="stat-value">
                                {summary?.tablet_visitors ?? 0}
                            </div>

                            <div className="stat-description">
                                {getPercentage(
                                    summary?.tablet_visitors ??
                                        0
                                )}
                                % of detected devices
                            </div>
                        </div>
                    </div>

                    <div className="analytics-grid">
                        <div className="content-card">
                            <div className="card-header">
                                <div>
                                    <h2>
                                        Device Breakdown
                                    </h2>

                                    <p>
                                        Traffic by detected
                                        device type.
                                    </p>
                                </div>
                            </div>

                            <div className="device-breakdown">
                                <div className="device-row">
                                    <div className="device-info">
                                        <span className="device-dot mobile" />
                                        <span>Mobile</span>
                                    </div>

                                    <strong>
                                        {summary?.mobile_visitors ??
                                            0}
                                    </strong>

                                    <span className="device-percentage">
                                        {getPercentage(
                                            summary?.mobile_visitors ??
                                                0
                                        )}
                                        %
                                    </span>
                                </div>

                                <div className="device-progress">
                                    <div
                                        className="device-progress-bar"
                                        style={{
                                            width: `${getPercentage(
                                                summary?.mobile_visitors ??
                                                    0
                                            )}%`,
                                        }}
                                    />
                                </div>

                                <div className="device-row">
                                    <div className="device-info">
                                        <span className="device-dot desktop" />
                                        <span>Desktop</span>
                                    </div>

                                    <strong>
                                        {summary?.desktop_visitors ??
                                            0}
                                    </strong>

                                    <span className="device-percentage">
                                        {getPercentage(
                                            summary?.desktop_visitors ??
                                                0
                                        )}
                                        %
                                    </span>
                                </div>

                                <div className="device-progress">
                                    <div
                                        className="device-progress-bar"
                                        style={{
                                            width: `${getPercentage(
                                                summary?.desktop_visitors ??
                                                    0
                                            )}%`,
                                        }}
                                    />
                                </div>

                                <div className="device-row">
                                    <div className="device-info">
                                        <span className="device-dot tablet" />
                                        <span>Tablet</span>
                                    </div>

                                    <strong>
                                        {summary?.tablet_visitors ??
                                            0}
                                    </strong>

                                    <span className="device-percentage">
                                        {getPercentage(
                                            summary?.tablet_visitors ??
                                                0
                                        )}
                                        %
                                    </span>
                                </div>

                                <div className="device-progress">
                                    <div
                                        className="device-progress-bar"
                                        style={{
                                            width: `${getPercentage(
                                                summary?.tablet_visitors ??
                                                    0
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="content-card">
                            <div className="card-header">
                                <div>
                                    <h2>
                                        Traffic Overview
                                    </h2>

                                    <p>
                                        Current recorded traffic
                                        statistics.
                                    </p>
                                </div>
                            </div>

                            <div className="traffic-overview">
                                <div className="overview-item">
                                    <span>
                                        Total clicks
                                    </span>

                                    <strong>
                                        {summary?.total_clicks ??
                                            0}
                                    </strong>
                                </div>

                                <div className="overview-item">
                                    <span>
                                        Unique visitors
                                    </span>

                                    <strong>
                                        {summary?.unique_visitors ??
                                            0}
                                    </strong>
                                </div>

                                <div className="overview-item">
                                    <span>
                                        Recorded traffic
                                    </span>

                                    <strong>
                                        {traffic.length}
                                    </strong>
                                </div>

                                <div className="overview-item">
                                    <span>
                                        Detected devices
                                    </span>

                                    <strong>
                                        {totalDevices}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="content-card">
                        <div className="card-header">
                            <div>
                                <h2>
                                    Recent Traffic
                                </h2>

                                <p>
                                    Latest recorded shortlink
                                    visits.
                                </p>
                            </div>
                        </div>

                        {traffic.length === 0 ? (
                            <div className="empty-state">
                                No traffic recorded yet.
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Shortlink</th>
                                            <th>
                                                Landing Page
                                            </th>
                                            <th>Device</th>
                                            <th>Referer</th>
                                            <th>Visitor</th>
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
                                                        <span className="time-cell">
                                                            {formatDate(
                                                                item.created_at
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong className="traffic-shortlink">
                                                            /
                                                            {
                                                                item.shortlink_code
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <div className="traffic-landing">
                                                            <strong>
                                                                {item.landing_page_name ||
                                                                    "Original URL"}
                                                            </strong>

                                                            {item.landing_page_url && (
                                                                <span
                                                                    title={
                                                                        item.landing_page_url
                                                                    }
                                                                >
                                                                    {shortenText(
                                                                        item.landing_page_url,
                                                                        40
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`device-badge ${getDeviceClass(
                                                                item.device
                                                            )}`}
                                                        >
                                                            {item.device ||
                                                                "unknown"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className="referer-cell"
                                                            title={
                                                                item.referer ||
                                                                ""
                                                            }
                                                        >
                                                            {shortenText(
                                                                item.referer,
                                                                40
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className="ip-hash-cell"
                                                            title={
                                                                item.ip_hash ||
                                                                ""
                                                            }
                                                        >
                                                            {shortenText(
                                                                item.ip_hash,
                                                                16
                                                            )}
                                                        </span>
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

export default Traffic;