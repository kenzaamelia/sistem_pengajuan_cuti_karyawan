// Backend (Carbon) mengirim tanggal dalam format ISO lengkap dengan jam,
// misal "2026-09-14T00:00:00.000000Z". Helper ini merapikannya untuk tampilan.

// "2026-09-14T00:00:00.000000Z" -> "14 September 2026"
export function formatTanggal(tanggal) {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC', // tanggal cuti tidak perlu geser zona waktu
    });
}

// "2026-09-14T00:00:00.000000Z" -> "14 Sep 2026" (versi ringkas, untuk tabel sempit)
export function formatTanggalSingkat(tanggal) {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

// "2026-09-14T00:00:00.000000Z" -> "2026-09-14" (untuk value <input type="date">)
export function formatTanggalInput(tanggal) {
    if (!tanggal) return '';

    return tanggal.slice(0, 10);
}

// "2026-09-14T10:30:00.000000Z" -> "14 September 2026, 10:30"
export function formatTanggalWaktu(tanggal) {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}