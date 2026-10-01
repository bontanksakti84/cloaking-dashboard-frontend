import { useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Shortlinks from "./pages/Shortlinks";
import LandingPages from "./pages/LandingPages";
import Routes from "./pages/Routes";
import Policies from "./pages/Policies";
import Traffic from "./pages/Traffic";

function App() {
    const [activePage, setActivePage] =
        useState("dashboard");

    function renderPage() {
        switch (activePage) {
            case "shortlinks":
                return <Shortlinks />;

            case "landing-pages":
                return <LandingPages />;

            case "routes":
                return <Routes />;

            case "policies":
                return <Policies />;

            case "traffic":
                return <Traffic />;

            case "dashboard":
            default:
                return <Dashboard />;
        }
    }

    return (
        <div className="app-layout">
            <Sidebar
                activePage={
                    activePage
                }
                onNavigate={
                    setActivePage
                }
            />

            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;