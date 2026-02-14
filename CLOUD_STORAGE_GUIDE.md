# Cloud Storage Feature - MEMORY App

## 🎉 Fitur Baru: Cloud Storage Persisten

Anda sekarang dapat menambahkan **foto dan video** yang akan **tetap tersimpan** bahkan setelah browser di-reload!

---

## 📋 Cara Kerja

### Teknologi yang Digunakan
- **IndexedDB**: Menyimpan file/blob secara persisten di browser
- **localStorage**: Menyimpan metadata (informasi) tentang file
- **Cloud Status Indicator**: Menampilkan status penyimpanan file

### Proses Penyimpanan

```
Pengguna Upload File
        ↓
    File disimpan ke IndexedDB (berisi file/blob)
        ↓
    Metadata disimpan ke localStorage
        ↓
    Cloud Status muncul (Menyimpan... → Tersimpan ✓)
        ↓
    File siap ditampilkan di Gallery
```

---

## 🚀 Cara Menggunakan

### 1. **Login** (Opsional untuk menambah/menghapus)
   - Klik tombol "Login" di header
   - Masukkan nomor telepon dan password

### 2. **Pilih Tahun**
   - Scroll slider tahun di bagian "Pilih Tahun"
   - Klik tahun yang diinginkan

### 3. **Tambah Foto/Video**
   - Klik tombol **"+"** di tahun yang dipilih
   - Pilih foto atau video dari perangkat
   - Tunggu indikator penyimpanan menunjukkan "✓ Tersimpan"

### 4. **Lihat Koleksi**
   - Foto/video akan otomatis muncul di gallery
   - Koleksi akan tetap ada meski browser di-reload

---

## 🌐 Fitur Cloud Status

Indikator status akan muncul di **kanan bawah** layar:

| Status | Ikon | Warna | Makna |
|--------|------|-------|-------|
| **Saving** | ☁️ | Biru | File sedang disimpan ke cloud |
| **Success** | ✓ | Hijau | File berhasil disimpan |
| **Error** | ⚠️ | Merah | Gagal menyimpan file |

---

## 💾 Kapasitas & Limitations

- **Kapasitas**: Tergantung quota IndexedDB browser (biasanya 50MB - 100MB)
- **Browser Support**: Semua browser modern (Chrome, Firefox, Safari, Edge)
- **Data Persistence**: Tetap tersimpan sampai cache browser dihapus

---

## 🔧 Fitur Teknis

### Hook: `useMediaStorage()`
```typescript
const {
  yearData,           // Data tahun dan media
  addMedia,           // Function: tambah file
  removeMedia,        // Function: hapus file
  getMediaByYear,     // Function: ambil file by tahun
  getAllMedia,        // Function: ambil semua file
  isLoading,          // Boolean: sedang loading
  years,              // Array: daftar tahun
  cloudStatus         // String: 'idle' | 'saving' | 'success' | 'error'
} = useMediaStorage();
```

### Database: IndexedDB
- **DB Name**: `MemoryAppDB`
- **Store Name**: `mediaFiles`
- **Key**: Media ID (unique)
- **Data**: File/Blob

### Metadata: localStorage
- **Key**: `memory_metadata`
- **Data**: Array of metadata objects berisi:
  - `id`: Unique identifier
  - `filename`: Nama file
  - `type`: 'photo' atau 'video'
  - `year`: Tahun
  - `createdAt`: Timestamp ISO
  - `mimeType`: Tipe MIME file

---

## 🛠️ Struktur File

```
src/
├── hooks/
│   └── useMediaStorage.ts    ← Cloud storage logic
├── components/
│   └── CloudStatus.tsx       ← Status indicator UI
└── App.tsx                   ← Main app dengan cloud status
```

---

## ⚙️ Konfigurasi

Anda dapat mengatur behavior penyimpanan di `useMediaStorage.ts`:

```typescript
// Database configuration
const DB_NAME = 'MemoryAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'mediaFiles';

// Metadata key
const METADATA_KEY = 'memory_metadata';

// Status timeout (dalam milliseconds)
setTimeout(() => setCloudStatus('idle'), 2000);  // Success: 2 detik
setTimeout(() => setCloudStatus('idle'), 3000);  // Error: 3 detik
```

---

## 🐛 Troubleshooting

### File tidak tersimpan?
1. Cek browser console untuk error messages
2. Pastikan quota IndexedDB tidak penuh
3. Coba clear cache browser dan upload ulang

### Media tidak muncul setelah reload?
1. Pastikan file berhasil tersimpan (lihat cloud status ✓)
2. Cek IndexedDB di DevTools (F12 → Application → IndexedDB)
3. Cek localStorage key `memory_metadata` tidak kosong

### Bagaimana menghapus data?
- Data akan otomatis terhapus jika:
  - User menghapus sesuai konten
  - Browser cache dihapus
  - IndexedDB quota reset

---

## 📚 Referensi

- [IndexedDB MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [localStorage MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Blob URL MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)

---

**Fitur ini memastikan kenangan Anda tetap aman & tersimpan! ❤️**
