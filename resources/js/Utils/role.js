const LABEL_ROLE = {
    karyawan_pelaksana: 'Karyawan Pelaksana',
    karyawan_pimpinan: 'Karyawan Pimpinan',
    general_manager: 'General Manager',
    sdm: 'SDM',
};

const LABEL_JABATAN = {
    staf: 'Staf',
    asisten_manajer: 'Asisten Manajer',
    manajer: 'Manajer',
};

// Susun label peran yang enak dibaca, mis. "Manajer" atau "General Manager".
// Untuk karyawan_pimpinan, jabatan lebih informatif daripada nama role generik.
export function labelPeran(namaRole, jabatan) {
    if ((namaRole === 'karyawan_pimpinan' || namaRole === 'karyawan_pelaksana') && jabatan) {
        return LABEL_JABATAN[jabatan] ?? LABEL_ROLE[namaRole] ?? namaRole;
    }

    return LABEL_ROLE[namaRole] ?? namaRole ?? '';
}

// Sapaan sesuai jam saat ini, dipakai di header Dashboard.
export function sapaanWaktu() {
    const jam = new Date().getHours();

    if (jam < 10) return 'Selamat pagi';
    if (jam < 15) return 'Selamat siang';
    if (jam < 18) return 'Selamat sore';

    return 'Selamat malam';
}