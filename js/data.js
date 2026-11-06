/* data.js - data dummy (pengganti server/database) */
const dataKatalogBuku = [
  { kode: "BK-001", judul: "Kepemimpinan", penulis: "Hj. Mu'ah, Tri Ifa Indrayani, H. Masram, Muhammad Sulton", kategori: "Manajemen & Bisnis", harga: 85000, stok: 14, gambar: "kepemimpinan.jpg", warna: "#1f3a6e" },
  { kode: "BK-002", judul: "Manajemen Keuangan", penulis: "Erna Chotidjah Suhatmi, SE., M.Ak", kategori: "Manajemen & Bisnis", harga: 120000, stok: 20, gambar: "manajemen_keuangan.jpg", warna: "#e8442a" },
  { kode: "BK-003", judul: "Mikrobiologi Dasar", penulis: "Imam Mishbach, Henderite L. Ohee, dkk.", kategori: "Sains & Kesehatan", harga: 175000, stok: 4, gambar: "mikrobiologi.jpg", warna: "#b8481f" },
  { kode: "BK-004", judul: "Perkembangan Anak Usia Dini", penulis: "Drs. Ahmad Susanto, M.Pd.", kategori: "Pendidikan", harga: 95000, stok: 16, gambar: "paud_perkembangan.jpg", warna: "#1d6fd1" },
  { kode: "BK-005", judul: "Ilmu Komunikasi", penulis: "Nurudin", kategori: "Sosial & Komunikasi", harga: 90000, stok: 9, gambar: "pengantar_komunikasi.jpg", warna: "#f2b134" }
];

const dataUser = [
  { nama: "Admin Toko", email: "admin@tokobuku.id", password: "admin123" },
  { nama: "Budi Santoso", email: "budi@mail.com", password: "budi12345" }
];

/* status: 0 Diproses, 1 Dikemas, 2 Dalam Pengiriman, 3 Terkirim */
const dataTracking = [
  { noDO: "DO-2026-001", pemesan: "Siti Rahma", status: 3, ekspedisi: "JNE", tanggalPesan: "2026-10-27", tanggalKirim: "2026-10-28", jenisPaket: "Reguler", total: 190000, metode: "GoPay",
    items: [{ judul: "Kepemimpinan", qty: 1, harga: 85000 }, { judul: "Ilmu Komunikasi", qty: 1, harga: 90000 }] },
  { noDO: "DO-2026-002", pemesan: "Andi Pratama", status: 2, ekspedisi: "J&T Express", tanggalPesan: "2026-11-02", tanggalKirim: "2026-11-03", jenisPaket: "Express", total: 203000, metode: "DANA",
    items: [{ judul: "Mikrobiologi Dasar", qty: 1, harga: 175000 }] },
  { noDO: "DO-2026-003", pemesan: "Dewi Lestari", status: 1, ekspedisi: "SiCepat", tanggalPesan: "2026-11-04", tanggalKirim: "2026-11-05", jenisPaket: "Reguler", total: 347000, metode: "COD (Bayar di Tempat)",
    items: [{ judul: "Manajemen Keuangan", qty: 2, harga: 120000 }, { judul: "Perkembangan Anak Usia Dini", qty: 1, harga: 95000 }] }
];

const dataEkspedisi = { "JNE": 15000, "J&T Express": 18000, "SiCepat": 12000 };
const langkahPengiriman = ["Pesanan diproses", "Dikemas", "Dalam pengiriman", "Terkirim"];

/* Metode pembayaran */
const dataMetodeBayar = [
  { id: "qris", nama: "QRIS", grup: "QRIS", ket: "Scan dari e-wallet atau m-banking", logo: "qris.svg" },
  { id: "dana", nama: "DANA", grup: "E-Wallet", ket: "Bayar lewat aplikasi DANA", logo: "dana.svg" },
  { id: "gopay", nama: "GoPay", grup: "E-Wallet", ket: "Bayar lewat Gojek", logo: "gopay.svg" },
  { id: "shopeepay", nama: "ShopeePay", grup: "E-Wallet", ket: "Bayar lewat Shopee", logo: "shopeepay.svg" },
  { id: "ovo", nama: "OVO", grup: "E-Wallet", ket: "Bayar lewat aplikasi OVO", logo: "ovo.svg" },
  { id: "bca", nama: "Bank BCA", grup: "Transfer Bank", ket: "Virtual Account BCA", logo: "bca.svg", va: "39041" },
  { id: "mandiri", nama: "Bank Mandiri", grup: "Transfer Bank", ket: "Virtual Account Mandiri", logo: "mandiri.svg", va: "88608" },
  { id: "bri", nama: "Bank BRI", grup: "Transfer Bank", ket: "Virtual Account BRI", logo: "bri.svg", va: "26215" },
  { id: "cod", nama: "COD (Bayar di Tempat)", grup: "Bayar di Tempat", ket: "Bayar tunai ke kurir", logo: "cod.svg" }
];
/* warna merek untuk badge & highlight */
const warnaMetode = { qris: "#d62839", dana: "#118EEA", gopay: "#00AA13", shopeepay: "#EE4D2D", ovo: "#4C2A86", bca: "#0066AE", mandiri: "#003D79", bri: "#00529C", cod: "#6b7a8c" };
