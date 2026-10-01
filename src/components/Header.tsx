interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({
    title,
    subtitle,
}: HeaderProps) {
    return (
        <header className="page-header">
            <div>
                <h1>{title}</h1>

                {subtitle && (
                    <p>{subtitle}</p>
                )}
            </div>

            <div className="header-status">
                <span className="status-dot" />
                API Connected
            </div>
        </header>
    );
}
