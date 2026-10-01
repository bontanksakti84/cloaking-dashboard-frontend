import {
    BarChart3,
    Link2,
    LayoutDashboard,
    Layers3,
    Route,
    ShieldCheck,
    Settings,
    ExternalLink,
} from "lucide-react";

type SidebarProps = {
    activePage: string;
    onNavigate: (page: string) => void;
};

function Sidebar({
    activePage,
    onNavigate,
}: SidebarProps) {
    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            id: "shortlinks",
            label: "Shortlinks",
            icon: Link2,
        },
        {
            id: "landing-pages",
            label: "Landing Pages",
            icon: Layers3,
        },
        {
            id: "routes",
            label: "Routes",
            icon: Route,
        },
        {
            id: "policies",
            label: "Traffic Policies",
            icon: ShieldCheck,
        },
        {
            id: "traffic",
            label: "Traffic Analytics",
            icon: BarChart3,
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        SL
                    </div>

                    <div className="brand-text">
                        <strong>
                            Shortlink
                        </strong>

                        <span>
                            Management
                        </span>
                    </div>
                </div>

                <div className="sidebar-section">
                    <span className="sidebar-section-title">
                        MAIN MENU
                    </span>

                    <nav className="sidebar-nav">
                        {menuItems.map(
                            ({
                                id,
                                label,
                                icon: Icon,
                            }) => {
                                const active =
                                    activePage ===
                                    id;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        className={
                                            "sidebar-nav-item " +
                                            (active
                                                ? "active"
                                                : "")
                                        }
                                        onClick={() =>
                                            onNavigate(
                                                id
                                            )
                                        }
                                    >
                                        <span className="sidebar-nav-icon">
                                            <Icon
                                                size={
                                                    18
                                                }
                                                strokeWidth={
                                                    1.8
                                                }
                                            />
                                        </span>

                                        <span className="sidebar-nav-label">
                                            {
                                                label
                                            }
                                        </span>

                                        {active && (
                                            <span className="sidebar-active-indicator" />
                                        )}
                                    </button>
                                );
                            }
                        )}
                    </nav>
                </div>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-status">
                    <span className="status-dot" />

                    <div>
                        <strong>
                            System Online
                        </strong>

                        <span>
                            API connected
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="sidebar-footer-item"
                    onClick={() =>
                        window.open(
                            "/",
                            "_blank"
                        )
                    }
                >
                    <Settings
                        size={17}
                        strokeWidth={1.8}
                    />

                    <span>
                        System
                    </span>

                    <ExternalLink
                        size={14}
                        strokeWidth={1.8}
                    />
                </button>

                <div className="sidebar-version">
                    Shortlink Dashboard
                    <span>
                        v1.0.0
                    </span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;