# CSR Impact Management Platform

**CSR Impact Management** adalah aplikasi web profesional untuk mengelola proyek Corporate Social Responsibility (CSR) dan Environmental, Social, and Governance (ESG) sebuah perusahaan.  
Aplikasi ini menyediakan dasbor dampak sosial, manajemen proyek, pelacakan indikator, laporan otomatis, dan integrasi data, dengan sistem role-based access control.

## ✨ Fitur Utama

- **Dasbor Dampak Sosial & ESG**  
  - Visualisasi data dampak sosial (grafik bar, pie, line).
  - Status program dan indikator keberhasilan.
  - Skor ESG otomatis berdasarkan data yang diinput.
  
- **Manajemen Proyek CSR/ESG**  
  - CRUD proyek: nama proyek, lokasi, kategori (Lingkungan/Sosial/Tata Kelola).
  - Penjadwalan kegiatan dan target dampak.

- **Pelacakan Indikator Dampak**  
  - Input metrik dampak (contoh: jumlah penerima manfaat, pengurangan emisi karbon).
  - Kustomisasi indikator sesuai jenis proyek.

- **Formulir Pengumpulan Data**  
  - Admin dan mitra mengisi form berbasis proyek.
  - Dukungan input teks, angka, file upload, dan checkbox.

- **Laporan Otomatis (PDF/Excel)**  
  - Ekspor laporan proyek dan dampak ke PDF atau Excel.
  - Template laporan yang dapat dikustomisasi.

- **Pelacakan KPI dan SDGs**  
  - Hubungkan metrik ke KPI internal dan Tujuan Pembangunan Berkelanjutan (SDGs).

- **Notifikasi & Reminder**  
  - Kirim email atau push notifikasi untuk deadline pelaporan.

- **Role & Akses Pengguna**  
  - Role: Admin, Kontributor Proyek, Reviewer.
  - Akses terbatas sesuai role.

- **Import & Integrasi**  
  - Import data dari file CSV/XLSX.
  - API endpoint untuk integrasi dengan sistem lain.

- **Audit Trail & Log Aktivitas**  
  - Catatan aktivitas pengguna untuk audit compliance.

---

## 🛠️ Teknologi

- **Frontend**:  
  Vite True Script + TailwindCSS + Recharts/Chart.js (visualisasi data)

- **Database**:  
  Supabase (PostgreSQL)

- **Autentikasi**:  
  JWT + Role-based Access Control

- **Ekspor File**:  
  WeasyPrint (PDF) + Pandas (Excel)

- **Notifikasi Email**:  
  SMTP atau integrasi dengan SendGrid / Mailgun

---

## 📁 Struktur Proyek

```
/frontend
  ├── components/
  ├── pages/
  ├── services/
  ├── hooks/
  └── assets/

/backend
  ├── api/
  ├── models/
  ├── schemas/
  ├── routes/
  └── utils/
```

---

## 📚 Contoh Implementasi
- **Komponen: Dashboard Dampak (Grafik)**
```tsx
// components/DashboardCharts.tsx
import { Bar, Pie } from 'recharts';

export default function DashboardCharts({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Bar data={data.barData} />
      <Pie data={data.pieData} />
    </div>
  );
}
```

- **Komponen: Form Input Indikator**
```tsx
// components/ImpactForm.tsx
export default function ImpactForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register("beneficiaries")} placeholder="Jumlah Penerima Manfaat" className="input" />
      <input {...register("carbonReduction")} placeholder="Emisi Karbon Dikurangi" className="input" />
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
  );
}
```

- **Komponen: Tabel Pelaporan Per Proyek**
```tsx
// components/ProjectReportsTable.tsx
export default function ProjectReportsTable({ reports }: { reports: any[] }) {
  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>Proyek</th>
          <th>Indikator</th>
          <th>Nilai</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td>{report.projectName}</td>
            <td>{report.indicator}</td>
            <td>{report.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🚀 Cara Menjalankan Project

### Frontend
```bash
cd csr
npm install
npm run build
npm run dev
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
