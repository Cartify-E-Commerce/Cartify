'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* NAVBAR TRANSPARAN */}
      <nav className={`navbar navbar-expand-lg navbar-custom ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link href="/" className="navbar-brand navbar-brand-custom">
            <i className="fa-solid fa-cart-shopping me-2"></i>Cartify
          </Link>
          <div className="ms-auto">
            <Link href="/login" className="btn btn-light-custom px-4 py-2 small fw-bold" style={{ fontSize: '14px' }}>
              <i className="fa-solid fa-right-to-bracket me-1"></i>Masuk Akun
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="container">
          <div className="row align-items-center py-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge bg-white text-success px-3 py-2 mb-3 fw-bold rounded-pill shadow-sm" style={{ fontSize: '12px' }}>
                Platform E-Commerce Modern
              </span>
              <h1 className="display-3 fw-bold mb-3 lh-sm">Belanja Mudah, Nyaman, dan Hemat</h1>
              <p className="fs-5 mb-4 opacity-90">
                Cartify menghadirkan pengalaman belanja online terbaik untuk kebutuhan harian Anda. Temukan produk-produk pilihan berkualitas tinggi dari kategori Elektronik, Makanan, hingga Fashion kekinian dengan penawaran menarik.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                <Link href="/shop" className="btn btn-light-custom">
                  <i className="fa-solid fa-bag-shopping me-2"></i>Mulai Berbelanja
                </Link>
                <Link href="/login" className="btn btn-outline-white">
                  <i className="fa-solid fa-store me-2"></i>Gabung sebagai Seller
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block text-center position-relative">
              <div style={{ fontSize: '250px', color: 'rgba(255,255,255,0.15)', animation: 'float 6s ease-in-out infinite' }}>
                <i className="fa-solid fa-shopping-bag"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FITUR UTAMA SECTION */}
      <div className="container my-5 py-5">
        <div className="text-center mb-5 max-width-700 mx-auto">
          <span className="text-success fw-bold text-uppercase" style={{ fontSize: '13px', letterSpacing: '2px' }}>
            Mengapa Cartify?
          </span>
          <h2 className="fw-bold text-dark mt-2">Layanan Terbaik untuk Kepuasan Belanja Anda</h2>
          <p className="text-muted">Nikmati kemudahan transaksi, pengiriman cepat, dan sistem keamanan terjamin di platform kami.</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card-feature">
              <div className="feature-icon"><i class="fa-solid fa-tags"></i></div>
              <h5 className="fw-bold text-dark">Katalog Produk Pilihan</h5>
              <p className="text-muted small">
                Temukan beragam kategori produk pilihan mulai dari Elektronik premium, Fashion kekinian, hingga Makanan lezat yang terkurasi secara profesional.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-feature">
              <div className="feature-icon"><i class="fa-solid fa-truck-fast"></i></div>
              <h5 class="fw-bold text-dark">Pengiriman Cepat & Lacak Instan</h5>
              <p class="text-muted small">
                Dapatkan pembaruan status pesanan secara real-time langsung dari penjual hingga paket Anda mendarat dengan aman di depan pintu rumah.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-feature">
              <div className="feature-icon"><i class="fa-solid fa-shield-halved"></i></div>
              <h5 class="fw-bold text-dark">Pembayaran Aman & Praktis</h5>
              <p class="text-muted small">
                Sistem checkout instan terintegrasi dengan verifikasi otomatis untuk menjamin kelancaran dan keamanan setiap transaksi belanja Anda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIK INTERAKTIF */}
      <div className="bg-light py-5 border-top border-bottom">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="stat-card">
                <div className="stat-number">10k+</div>
                <div className="text-muted small fw-semibold">Pengguna Aktif</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card">
                <div className="stat-number">99%</div>
                <div className="text-muted small fw-semibold">Toko Tepercaya</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card">
                <div className="stat-number">50k+</div>
                <div className="text-muted small fw-semibold">Transaksi Berhasil</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card">
                <div className="stat-number">4.9</div>
                <div className="text-muted small fw-semibold">Rating Kepuasan Pelanggan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-4">
        <div className="container">
          <p className="mb-1 small opacity-75">&copy; 2026 Cartify E-Commerce. Platform Belanja Online Modern.</p>
          <p className="mb-0 small opacity-50">Ryan Maulana Bagus Putra • Solusi Belanja Tepercaya Anda</p>
        </div>
      </footer>

      <style jsx global>{`
        .navbar-custom {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1030;
            background-color: transparent;
            padding: 20px 0;
            transition: all 0.3s ease;
        }
        .navbar-custom.scrolled {
            background-color: white !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            padding: 10px 0;
        }
        .navbar-brand-custom {
            color: white !important;
            font-weight: 800;
            font-size: 1.8rem;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        .navbar-custom.scrolled .navbar-brand-custom {
            color: var(--cartify-green) !important;
        }
        .navbar-custom.scrolled .btn-light-custom {
            background-color: var(--cartify-green) !important;
            color: white !important;
        }
        .btn-light-custom {
            background-color: white !important;
            color: var(--cartify-green) !important;
            font-weight: 700;
            padding: 10px 25px;
            border-radius: 50px;
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
        }
        .btn-light-custom:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            background-color: #f1f1f1 !important;
        }
        .btn-outline-white {
            color: white !important;
            border: 2px solid white !important;
            font-weight: 700;
            padding: 12px 35px;
            border-radius: 50px;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
        }
        .btn-outline-white:hover {
            background-color: white !important;
            color: var(--cartify-green) !important;
            transform: translateY(-3px);
        }
        .hero-section {
            background: linear-gradient(135deg, #00aa5b 0%, #004d29 100%);
            color: white;
            padding: 160px 0 100px 0;
            position: relative;
            clip-path: ellipse(110% 100% at 50% 0%);
        }
        .card-feature {
            background: white;
            border: none;
            border-radius: 16px;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
            height: 100%;
        }
        .card-feature:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.06);
        }
        .feature-icon {
            width: 70px;
            height: 70px;
            border-radius: 20px;
            background-color: rgba(0, 170, 91, 0.08);
            color: var(--cartify-green);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 25px;
        }
        .stat-card {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.02);
            text-align: center;
        }
        .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--cartify-green);
            margin-bottom: 5px;
        }
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
