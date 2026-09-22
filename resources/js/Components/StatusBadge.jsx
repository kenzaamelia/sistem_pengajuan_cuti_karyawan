const STYLE = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    disetujui: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    ditolak: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
    dibatalkan: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
};

const DOT = {
    pending: 'bg-amber-500',
    disetujui: 'bg-emerald-500',
    ditolak: 'bg-red-500',
    dibatalkan: 'bg-slate-400',
};

const LABEL = {
    pending: 'Menunggu',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
    dibatalkan: 'Dibatalkan',
};

export default function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                STYLE[status] ?? 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[status] ?? 'bg-slate-400'}`} />
            {LABEL[status] ?? status}
        </span>
    );
}