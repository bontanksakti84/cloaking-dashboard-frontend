import {
    ShieldCheck,
    Globe2,
    Smartphone,
    Bot,
    Network,
    Server,
    Radio,
    TriangleAlert,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import { api } from "../services/api";

type Shortlink = {
    id: number;
    code: string;
    original_url: string;
    status: string;
};

type Policy = {
    id?: number;
    shortlink_id?: number;

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
};

const countries = [
    {
        code: "ID",
        name: "Indonesia",
    },
    {
        code: "MY",
        name: "Malaysia",
    },
    {
        code: "SG",
        name: "Singapore",
    },
    {
        code: "TH",
        name: "Thailand",
    },
    {
        code: "PH",
        name: "Philippines",
    },
    {
        code: "VN",
        name: "Vietnam",
    },
    {
        code: "US",
        name: "United States",
    },
    {
        code: "GB",
        name: "United Kingdom",
    },
    {
        code: "AU",
        name: "Australia",
    },
    {
        code: "JP",
        name: "Japan",
    },
    {
        code: "KR",
        name: "South Korea",
    },
    {
        code: "CN",
        name: "China",
    },
    {
        code: "IN",
        name: "India",
    },
    {
        code: "DE",
        name: "Germany",
    },
    {
        code: "FR",
        name: "France",
    },
    {
        code: "NL",
        name: "Netherlands",
    },
];

const defaultPolicy: Policy = {
    country_mode: "all",

    allowed_countries: [],

    blocked_countries: [],

    device_mode: "all",

    bot_action: "deny",

    vpn_action: "allow",

    proxy_action: "allow",

    tor_action: "allow",

    datacenter_action: "allow",

    fallback_url:
        "https://example.com",

    status: "active",
};

function Policies() {
    const [
        shortlinks,
        setShortlinks,
    ] = useState<
        Shortlink[]
    >([]);

    const [
        selectedShortlink,
        setSelectedShortlink,
    ] = useState<number | null>(
        null
    );

    const [
        policy,
        setPolicy,
    ] = useState<Policy>(
        defaultPolicy
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        loadShortlinks();
    }, []);

    async function loadShortlinks() {
        try {
            setLoading(true);
            setError("");

            const result =
                await api.shortlinks();

            const data =
                result?.data ||
                [];

            setShortlinks(data);

            if (
                data.length > 0 &&
                selectedShortlink ===
                    null
            ) {
                setSelectedShortlink(
                    data[0].id
                );
            }
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
        if (
            selectedShortlink
        ) {
            loadPolicy(
                selectedShortlink
            );
        }
    }, [selectedShortlink]);

    async function loadPolicy(
        shortlinkId: number
    ) {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const result =
                await api.getPolicy(
                    shortlinkId
                );

            if (result?.data) {
                setPolicy({
                    ...defaultPolicy,
                    ...result.data,

                    allowed_countries:
                        Array.isArray(
                            result.data
                                .allowed_countries
                        )
                            ? result.data
                                  .allowed_countries
                            : [],

                    blocked_countries:
                        Array.isArray(
                            result.data
                                .blocked_countries
                        )
                            ? result.data
                                  .blocked_countries
                            : [],
                });
            } else {
                setPolicy({
                    ...defaultPolicy,
                });
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load policy"
            );
        } finally {
            setLoading(false);
        }
    }

    function updatePolicy(
        field: keyof Policy,
        value: unknown
    ) {
        setPolicy(
            (current) => ({
                ...current,
                [field]: value,
            })
        );

        setMessage("");
        setError("");
    }

    function toggleCountry(
        countryCode: string
    ) {
        const current =
            policy.country_mode ===
            "blocklist"
                ? policy.blocked_countries
                : policy.allowed_countries;

        const exists =
            current.includes(
                countryCode
            );

        const next = exists
            ? current.filter(
                  (code) =>
                      code !==
                      countryCode
              )
            : [
                  ...current,
                  countryCode,
              ];

        if (
            policy.country_mode ===
            "blocklist"
        ) {
            updatePolicy(
                "blocked_countries",
                next
            );
        } else {
            updatePolicy(
                "allowed_countries",
                next
            );
        }
    }

    function getSelectedCountries() {
        if (
            policy.country_mode ===
            "blocklist"
        ) {
            return policy.blocked_countries;
        }

        return policy.allowed_countries;
    }

    async function savePolicy() {
        if (
            !selectedShortlink
        ) {
            setError(
                "Please select a shortlink"
            );

            return;
        }

        if (
            !policy.fallback_url.trim()
        ) {
            setError(
                "Fallback URL is required"
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.savePolicy(
                selectedShortlink,
                {
                    country_mode:
                        policy.country_mode,

                    allowed_countries:
                        policy.allowed_countries,

                    blocked_countries:
                        policy.blocked_countries,

                    device_mode:
                        policy.device_mode,

                    bot_action:
                        policy.bot_action,

                    vpn_action:
                        policy.vpn_action,

                    proxy_action:
                        policy.proxy_action,

                    tor_action:
                        policy.tor_action,

                    datacenter_action:
                        policy.datacenter_action,

                    fallback_url:
                        policy.fallback_url,

                    status:
                        policy.status,
                }
            );

            setMessage(
                "Policy saved successfully."
            );

            await loadPolicy(
                selectedShortlink
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save policy"
            );
        } finally {
            setSaving(false);
        }
    }

    async function deletePolicy() {
        if (
            !selectedShortlink
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                "Delete this traffic policy?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await api.deletePolicy(
                selectedShortlink
            );

            setPolicy({
                ...defaultPolicy,
            });

            setMessage(
                "Policy deleted successfully."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete policy"
            );
        } finally {
            setSaving(false);
        }
    }

    const selected =
        shortlinks.find(
            (item) =>
                item.id ===
                selectedShortlink
        );

    const selectedCountries =
        getSelectedCountries();

    return (
        <div className="policy-layout">
            <aside className="policy-sidebar">
                <div className="policy-sidebar-header">
                    <div className="policy-sidebar-icon">
                        <ShieldCheck
                            size={20}
                        />
                    </div>

                    <div>
                        <h2>
                            Traffic Policies
                        </h2>

                        <p>
                            Access control
                        </p>
                    </div>
                </div>

                <div className="policy-sidebar-title">
                    SHORTLINKS
                </div>

                <div className="policy-shortlink-list">
                    {loading &&
                    shortlinks.length ===
                        0 ? (
                        <div className="policy-empty">
                            Loading...
                        </div>
                    ) : shortlinks.length ===
                      0 ? (
                        <div className="policy-empty">
                            No shortlinks
                        </div>
                    ) : (
                        shortlinks.map(
                            (shortlink) => (
                                <button
                                    key={
                                        shortlink.id
                                    }
                                    type="button"
                                    className={
                                        "policy-shortlink-item " +
                                        (selectedShortlink ===
                                        shortlink.id
                                            ? "active"
                                            : "")
                                    }
                                    onClick={() =>
                                        setSelectedShortlink(
                                            shortlink.id
                                        )
                                    }
                                >
                                    <span className="policy-shortlink-code">
                                        {
                                            shortlink.code
                                        }
                                    </span>

                                    <span className="policy-shortlink-url">
                                        {
                                            shortlink.original_url
                                        }
                                    </span>
                                </button>
                            )
                        )
                    )}
                </div>
            </aside>

            <section className="policy-content">
                <div className="policy-header">
                    <div>
                        <div className="policy-breadcrumb">
                            Policies
                            <span>
                                /
                            </span>
                            {selected
                                ?.code ||
                                "Select shortlink"}
                        </div>

                        <h1>
                            Traffic Policy
                        </h1>

                        <p>
                            Define which visitors
                            can access the
                            configured destination.
                        </p>
                    </div>

                    <div className="policy-status-wrapper">
                        <span
                            className={
                                "policy-status-badge " +
                                (policy.status ===
                                "active"
                                    ? "active"
                                    : "inactive")
                            }
                        >
                            <span />
                            {policy.status ===
                            "active"
                                ? "Active"
                                : "Inactive"}
                        </span>
                    </div>
                </div>

                {message && (
                    <div className="policy-alert success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="policy-alert error">
                        <TriangleAlert
                            size={17}
                        />

                        {error}
                    </div>
                )}

                <div className="policy-card">
                    <div className="policy-card-header">
                        <div className="policy-card-icon">
                            <Globe2
                                size={19}
                            />
                        </div>

                        <div>
                            <h3>
                                Country Rules
                            </h3>

                            <p>
                                Control access based
                                on visitor country.
                            </p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <label className="form-field">
                            <span>
                                Country Mode
                            </span>

                            <select
                                value={
                                    policy.country_mode
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "country_mode",
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="all">
                                    Allow all countries
                                </option>

                                <option value="allowlist">
                                    Allow selected countries
                                </option>

                                <option value="blocklist">
                                    Block selected countries
                                </option>
                            </select>
                        </label>
                    </div>

                    {policy.country_mode !==
                        "all" && (
                        <div className="country-grid">
                            {countries.map(
                                (
                                    country
                                ) => {
                                    const checked =
                                        selectedCountries.includes(
                                            country.code
                                        );

                                    return (
                                        <label
                                            key={
                                                country.code
                                            }
                                            className={
                                                "country-option " +
                                                (checked
                                                    ? "selected"
                                                    : "")
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    checked
                                                }
                                                onChange={() =>
                                                    toggleCountry(
                                                        country.code
                                                    )
                                                }
                                            />

                                            <span className="country-code">
                                                {
                                                    country.code
                                                }
                                            </span>

                                            <span>
                                                {
                                                    country.name
                                                }
                                            </span>
                                        </label>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>

                <div className="policy-card">
                    <div className="policy-card-header">
                        <div className="policy-card-icon">
                            <Smartphone
                                size={19}
                            />
                        </div>

                        <div>
                            <h3>
                                Device Rules
                            </h3>

                            <p>
                                Restrict access by
                                visitor device.
                            </p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <label className="form-field">
                            <span>
                                Device Mode
                            </span>

                            <select
                                value={
                                    policy.device_mode
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "device_mode",
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="all">
                                    All devices
                                </option>

                                <option value="mobile">
                                    Mobile only
                                </option>

                                <option value="desktop">
                                    Desktop only
                                </option>

                                <option value="tablet">
                                    Tablet only
                                </option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="policy-card">
                    <div className="policy-card-header">
                        <div className="policy-card-icon">
                            <Bot
                                size={19}
                            />
                        </div>

                        <div>
                            <h3>
                                Bot Detection
                            </h3>

                            <p>
                                Control automated
                                requests and crawlers.
                            </p>
                        </div>
                    </div>

                    <div className="policy-rule-row">
                        <div>
                            <strong>
                                Automated traffic
                            </strong>

                            <span>
                                Detect common bots,
                                crawlers and automated
                                clients.
                            </span>
                        </div>

                        <select
                            value={
                                policy.bot_action
                            }
                            onChange={(
                                event
                            ) =>
                                updatePolicy(
                                    "bot_action",
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                            <option value="deny">
                                Fallback
                            </option>

                            <option value="allow">
                                Allow
                            </option>
                        </select>
                    </div>
                </div>

                <div className="policy-card">
                    <div className="policy-card-header">
                        <div className="policy-card-icon">
                            <Network
                                size={19}
                            />
                        </div>

                        <div>
                            <h3>
                                IP Intelligence
                            </h3>

                            <p>
                                Configure handling for
                                VPN, proxy, Tor and
                                datacenter traffic.
                            </p>
                        </div>
                    </div>

                    <div className="ip-intelligence-grid">
                        <div className="ip-rule">
                            <div className="ip-rule-icon">
                                <Network
                                    size={18}
                                />
                            </div>

                            <div className="ip-rule-info">
                                <strong>
                                    VPN
                                </strong>

                                <span>
                                    Active VPN
                                    connections
                                </span>
                            </div>

                            <select
                                value={
                                    policy.vpn_action
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "vpn_action",
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="allow">
                                    Allow
                                </option>

                                <option value="fallback">
                                    Fallback
                                </option>
                            </select>
                        </div>

                        <div className="ip-rule">
                            <div className="ip-rule-icon">
                                <Radio
                                    size={18}
                                />
                            </div>

                            <div className="ip-rule-info">
                                <strong>
                                    Proxy
                                </strong>

                                <span>
                                    Proxy server
                                    traffic
                                </span>
                            </div>

                            <select
                                value={
                                    policy.proxy_action
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "proxy_action",
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="allow">
                                    Allow
                                </option>

                                <option value="fallback">
                                    Fallback
                                </option>
                            </select>
                        </div>

                        <div className="ip-rule">
                            <div className="ip-rule-icon">
                                <ShieldCheck
                                    size={18}
                                />
                            </div>

                            <div className="ip-rule-info">
                                <strong>
                                    Tor
                                </strong>

                                <span>
                                    Tor network
                                    traffic
                                </span>
                            </div>

                            <select
                                value={
                                    policy.tor_action
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "tor_action",
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="allow">
                                    Allow
                                </option>

                                <option value="fallback">
                                    Fallback
                                </option>
                            </select>
                        </div>

                        <div className="ip-rule">
                            <div className="ip-rule-icon">
                                <Server
                                    size={18}
                                />
                            </div>

                            <div className="ip-rule-info">
                                <strong>
                                    Datacenter
                                </strong>

                                <span>
                                    Hosting and
                                    datacenter IPs
                                </span>
                            </div>

                            <select
                                value={
                                    policy.datacenter_action
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "datacenter_action",
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="allow">
                                    Allow
                                </option>

                                <option value="fallback">
                                    Fallback
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="policy-card">
                    <div className="policy-card-header">
                        <div className="policy-card-icon">
                            <Server
                                size={19}
                            />
                        </div>

                        <div>
                            <h3>
                                Fallback
                            </h3>

                            <p>
                                Destination used when
                                traffic does not satisfy
                                the policy.
                            </p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <label className="form-field full-width">
                            <span>
                                Fallback URL
                            </span>

                            <input
                                type="url"
                                value={
                                    policy.fallback_url
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "fallback_url",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="https://example.com"
                            />
                        </label>

                        <label className="form-field">
                            <span>
                                Policy Status
                            </span>

                            <select
                                value={
                                    policy.status
                                }
                                onChange={(
                                    event
                                ) =>
                                    updatePolicy(
                                        "status",
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="policy-actions">
                    <button
                        type="button"
                        className="policy-delete-button"
                        onClick={
                            deletePolicy
                        }
                        disabled={
                            saving ||
                            !selectedShortlink
                        }
                    >
                        Delete Policy
                    </button>

                    <button
                        type="button"
                        className="policy-save-button"
                        onClick={
                            savePolicy
                        }
                        disabled={
                            saving ||
                            !selectedShortlink
                        }
                    >
                        {saving
                            ? "Saving..."
                            : "Save Policy"}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Policies;