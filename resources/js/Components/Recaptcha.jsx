import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Script Google reCAPTCHA cuma perlu dimuat sekali per sesi halaman,
// meskipun komponen ini dipasang ulang saat pindah dari Login ke Register.
let scriptPromise = null;

function muatScriptRecaptcha() {
    if (window.grecaptcha?.render) {
        return Promise.resolve();
    }

    if (scriptPromise) {
        return scriptPromise;
    }

    scriptPromise = new Promise((resolve) => {
        // Pakai callback lewat parameter `onload`, BUKAN event onload bawaan
        // elemen <script>. Ini penting karena api.js Google masih melakukan
        // inisialisasi internal secara async setelah file-nya sendiri selesai
        // di-load — kalau langsung pakai grecaptcha.render() begitu tag
        // <script> selesai fetch, sering muncul error "grecaptcha.render is
        // not a function".
        window.__cutikuOnRecaptchaLoad = resolve;

        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?onload=__cutikuOnRecaptchaLoad&render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    });

    return scriptPromise;
}

// Pakai forwardRef supaya form induk bisa memanggil `.reset()` setelah
// submit gagal (mis. password salah) — token captcha reCAPTCHA hanya bisa
// dipakai sekali, jadi wajib direset supaya user bisa mencoba lagi.
const Recaptcha = forwardRef(function Recaptcha({ siteKey, onChange }, ref) {
    const containerRef = useRef(null);
    const widgetId = useRef(null);

    useImperativeHandle(ref, () => ({
        reset: () => {
            if (widgetId.current !== null && window.grecaptcha) {
                window.grecaptcha.reset(widgetId.current);
                onChange('');
            }
        },
    }));

    useEffect(() => {
        if (!siteKey) return;

        let masihTerpasang = true;

        muatScriptRecaptcha().then(() => {
            if (!masihTerpasang || !containerRef.current || widgetId.current !== null) {
                return;
            }

            widgetId.current = window.grecaptcha.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token) => onChange(token),
                'expired-callback': () => onChange(''),
            });
        });

        return () => {
            masihTerpasang = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteKey]);

    if (!siteKey) {
        return (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                CAPTCHA belum dikonfigurasi. Set <code>NOCAPTCHA_SITEKEY</code> &amp;{' '}
                <code>NOCAPTCHA_SECRET</code> di file <code>.env</code>, lalu build ulang frontend.
            </p>
        );
    }

    return <div ref={containerRef} />;
});

export default Recaptcha;