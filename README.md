# User Management API Auth Cloudinary

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-5.x-blue?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue?style=for-the-badge&logo=postgresql)
![Postman](https://img.shields.io/badge/Postman-tested-orange?style=for-the-badge&logo=postman)

---

## Deskripsi Proyek

User Management API adalah RESTful API berbasis Node.js dan Express.js dengan database PostgreSQL.
API ini menyediakan fitur autentikasi JWT, CRUD data user, upload foto profil ke Cloudinary, serta middleware keamanan seperti Helmet dan CORS.

Tujuan proyek ini adalah:
- Mengimplementasikan autentikasi aman menggunakan JWT.
- Menerapkan sistem CRUD user yang hanya bisa diakses oleh pengguna dengan token.
- Mengunggah dan menyimpan avatar (foto profil) ke Cloudinary.
- Menerapkan praktik keamanan server dasar.
- Menulis dokumentasi API yang terstruktur menggunakan Postman.

---

## Fitur

-   **Autentikasi (Register & Login)**  
    - User dapat membuat akun baru.  
    - Login menghasilkan token JWT untuk mengakses endpoint yang dilindungi.
-   **CRUD Data User (Protected Route)**  
    - Create, Read, Update, Delete hanya bisa dilakukan oleh user dengan token valid.  
-   **Upload File (Avatar)**  
    - Upload foto profil ke **Cloudinary**, dan URL-nya tersimpan di database.  
-   **Keamanan Server**
    - CORS hanya mengizinkan domain tertentu.  
    - Helmet menambah HTTP security headers.

---

## Teknologi yang Digunakan

| Teknologi | Fungsi |
|------------|---------|
| **Express.js** | Framework utama untuk membangun server REST API |
| **PostgreSQL (pg)** | Database utama penyimpanan data user |
| **bcryptjs** | Melakukan hashing password sebelum disimpan |
| **jsonwebtoken (JWT)** | Mengelola autentikasi menggunakan token |
| **multer & streamifier** | Mengatur proses upload file ke Cloudinary |
| **Cloudinary** | Menyimpan file gambar avatar di cloud |
| **dotenv** | Mengelola variabel lingkungan secara aman |
| **helmet & cors** | Middleware keamanan untuk melindungi server |

---

## Persiapan Lingkungan

Pastikan Anda sudah menginstal tools berikut:
-   **Node.js (v18+):** [Download Node.js](https://nodejs.org/)
-   **PostgreSQL (v14+):** [Download PostgreSQL](https://www.postgresql.org/download/)
-   **VS Code:** [Download VS Code](https://code.visualstudio.com/) (atau editor teks pilihan lainnya)
-   **Postman:** [Download Postman](https://www.postman.com/downloads/) (untuk pengujian API)
-   **Git:** [Download Git](https://git-scm.com/downloads)

---

## Instalasi & Menjalankan Server

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan proyek secara lokal:

1.  **Clone repository**
    ```bash
    git clone <URL_REPO_ANDA>
    cd user-management-api

2.  **Instal dependensi Node.js:**
    ```bash
    npm install
    ```
    
3.  **Konfigurasi Environment:**
    *   Buat file `.env` di root proyek dengan menyalin isi dari `.env.example`.
    *   Isi variabel-variabel yang diperlukan, seperti `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
  
4.  **Setup Database:**
    *   Pastikan PostgreSQL server Anda berjalan.
    *   Buat database baru jika belum ada.
    *   Gunakan skema tabel berikut untuk membuat tabel `users`:
        ```sql
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ```
5.  **Jalankan Aplikasi:**
    ```bash
    npm start # atau node index.js
    ```
    Aplikasi akan berjalan di `http://localhost:5000` (atau port yang dikonfigurasi).

---

## Pengujian API Menggunakan Postman

Anda dapat mengimpor koleksi Postman saya untuk menjelajahi dan menguji API ini:

1.  Unduh file koleksi dari ``
2.  Di Postman, klik "Import" dan pilih file JSON yang telah diunduh.
3.  Pastikan untuk mengatur environment variabel Postman jika diperlukan (misalnya, `base_url` ke `http://localhost:5000`).

---

Berikut adalah daftar endpoint utama yang tersedia:

| Method   | Endpoint                     | Deskripsi                                   | Akses             | Contoh Request Body                                                                                  |
| :------- | :--------------------------- | :------------------------------------------ | :---------------- | :--------------------------------------------------------------------------------------------------- |
| `POST`   | `/auth/register`             | Mendaftarkan pengguna baru (user/admin)     | Public            | `{ "username": "newuser", "email": "newuser@example.com", "password": "password123", "role": "user" }` |
| `POST`   | `/auth/login`                | Login pengguna & dapatkan JWT               | Public            | `{ "email": "newuser@example.com", "password": "password123" }`                                      |
| `GET`    | `/users`                     | Menampilkan semua data user                 | Admin (Requires JWT)| -                                                                                                    |
| `GET`    | `/users/:id`                 | Menampilkan user berdasarkan ID             | User Self / Admin (Requires JWT)| -                                                                                                    |
| `PUT`    | `/users/:id`                 | Memperbarui data user                       | User Self / Admin (Requires JWT)| `{ "username": "updated_user", "email": "updated@example.com" }`                                     |
| `DELETE` | `/users/:id`                 | Menghapus user                              | User Self / Admin (Requires JWT)| -                                                                                                    |
| `POST`   | `/users/avatar`              | Mengunggah foto profil (avatar)             | User Self (Requires JWT)| Form-data: `file` (tipe File)                                                                        |

---
