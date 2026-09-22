// Ikon SVG sederhana bergaya line-icon (stroke, bukan fill) supaya konsisten
// di seluruh aplikasi tanpa menambah dependency npm baru. Semua menerima
// props standar SVG seperti className.

const base = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export function IconGrid(props) {
    return (
        <svg {...base} {...props}>
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
    );
}

export function IconClipboard(props) {
    return (
        <svg {...base} {...props}>
            <rect x="5.5" y="4" width="13" height="17" rx="2" />
            <path d="M9 4V3.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 3.5V4" />
            <path d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4" />
        </svg>
    );
}

export function IconCheckCircle(props) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M8.5 12.3l2.3 2.3 4.7-4.9" />
        </svg>
    );
}

export function IconBarChart(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4 20V12.5" />
            <path d="M10.5 20V6" />
            <path d="M17 20v-6.5" />
            <path d="M3 20h18" />
        </svg>
    );
}

export function IconCalendar(props) {
    return (
        <svg {...base} {...props}>
            <rect x="4" y="5.5" width="16" height="15" rx="2" />
            <path d="M16 3.5v4M8 3.5v4M4 10.5h16" />
        </svg>
    );
}

export function IconReport(props) {
    return (
        <svg {...base} {...props}>
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M8.5 8h7" />
            <path d="M8.5 12.5l2 1.8 2.2-2.6 2.3 2.3" />
        </svg>
    );
}

export function IconMenu(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

export function IconX(props) {
    return (
        <svg {...base} {...props}>
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

export function IconLogout(props) {
    return (
        <svg {...base} {...props}>
            <path d="M14.5 3.5h3a2 2 0 012 2v13a2 2 0 01-2 2h-3" />
            <path d="M10 16.5l4.5-4.5-4.5-4.5" />
            <path d="M14.5 12H3.5" />
        </svg>
    );
}

export function IconChevronDown(props) {
    return (
        <svg {...base} {...props}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

export function IconArrowRight(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4.5 12h15" />
            <path d="M13 6l6 6-6 6" />
        </svg>
    );
}

export function IconUser(props) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
        </svg>
    );
}

export function IconAlertTriangle(props) {
    return (
        <svg {...base} {...props}>
            <path d="M12 3.5L2.5 20h19L12 3.5z" strokeLinejoin="round" />
            <path d="M12 10v4.5" />
            <circle cx="12" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
    );
}