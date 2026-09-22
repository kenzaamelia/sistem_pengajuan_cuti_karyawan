const LABEL_JENIS_CUTI = {
    cuti_tahunan: 'Cuti Tahunan',
    cuti_panjang: 'Cuti Panjang',
    cuti_bersama: 'Cuti Bersama',
};

export function labelJenisCuti(namaCuti) {
    return LABEL_JENIS_CUTI[namaCuti] ?? namaCuti;
}