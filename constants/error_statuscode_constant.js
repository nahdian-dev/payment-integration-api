exports.errorStatuscodeConstant = {
    BAD_REQUEST: 400, // Kesalahan sintaks atau format tidak valid
    UNAUTHORIZED: 401, // Client tidak ter-otorisasi / blm mengirimkan informasi otentikasi
    FORBIDDEN: 403, // Tidak ada akses untuk sumber daya tertentu
    NOT_FOUND: 404, // Server tidak menemukan sumber daya yang diminta
    METHOD_NOT_ALLOWED: 405, // Method yang tidak diijinkan
    INTERNAL_SERVER_ERROR: 500, // Kesalahan server, cth: bug atau kondisi lain
    SERVICE_UNAVAILABLE: 503, // Server tidak tersedia / maintenance
    GATEWAY_TIMEOUT: 504 // Server tidak bisa merespon dalam waktu yang ditentukan
};