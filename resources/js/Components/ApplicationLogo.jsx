// Lambang "CutiKu" — kotak gradien biru→hijau dengan huruf C, dipakai di
// sidebar (AuthenticatedLayout) dan halaman tamu (GuestLayout, Welcome).
export default function ApplicationLogo({ className = 'h-10 w-10', ...props }) {
    return (
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
            <defs>
                <linearGradient id="cutiku-logo-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7DD3FC" />
                    <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#cutiku-logo-gradient)" />
            <text
                x="20"
                y="27.5"
                textAnchor="middle"
                fontFamily="Manrope, sans-serif"
                fontWeight="800"
                fontSize="19"
                fill="#0B2A4A"
            >
                C
            </text>
        </svg>
    );
}