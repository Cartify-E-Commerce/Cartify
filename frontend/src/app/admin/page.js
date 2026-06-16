'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert, showConfirm } from '../api';

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    async function loadAdminData() {
      try {
        const userRes = await api.me();
        if (!userRes.user || userRes.user.role !== 'Admin') {
          router.push('/shop');
          return;
        }
        setAdminUser(userRes.user);

        const data = await api.getAdminDashboard();
        setStats({
          totalBuyers: data.totalBuyers,
          totalSellers: data.totalSellers,
          totalProducts: data.totalProducts,
          totalTransactions: data.totalTransactions,
          totalRevenue: data.totalRevenue,
        });
        setUsers(data.users || []);
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message || 'Gagal memuat data admin.');
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
    } catch (err) {
      await showAlert('Gagal', 'Gagal logout: ' + err.message, 'error');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      const res = await api.blockUserByAdmin(userId);
      await showAlert('Berhasil', res.message || 'User berhasil diblokir', 'success');
    } catch (err) {
      await showAlert('Gagal', 'Gagal memblokir user: ' + err.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!(await showConfirm('Hapus User', 'Apakah Anda yakin ingin menghapus user ini secara permanen?'))) return;
    try {
      const res = await api.deleteUserByAdmin(userId);
      await showAlert('Berhasil', res.message || 'User berhasil dihapus', 'success');
      setUsers(users.filter(u => u.userId !== userId));
      // Refresh stats
      const data = await api.getAdminDashboard();
      setStats(prev => ({
        ...prev,
        totalBuyers: data.totalBuyers,
        totalSellers: data.totalSellers,
      }));
    } catch (err) {
      await showAlert('Gagal', 'Gagal menghapus user: ' + err.message, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!(await showConfirm('Hapus Produk', 'Apakah Anda yakin ingin menghapus produk ini dari sistem?'))) return;
    try {
      const res = await api.deleteProductByAdmin(productId);
      await showAlert('Berhasil', res.message || 'Produk berhasil dihapus', 'success');
      setProducts(products.filter(p => p.productId !== productId));
      setStats(prev => ({
        ...prev,
        totalProducts: prev.totalProducts - 1,
      }));
    } catch (err) {
      await showAlert('Gagal', 'Gagal menghapus produk: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide">Memuat data admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-md">
        <div className="glass-panel border border-outline-variant/30 rounded-3xl p-8 shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-error shadow-sm animate-bounce" style={{ color: '#ba1a1a', backgroundColor: '#ffdad6' }}>
            <span className="material-symbols-outlined text-3xl font-bold">gpp_maybe</span>
          </div>
          <h3 className="font-display-lg text-headline-sm font-extrabold text-on-surface mb-2">Akses Admin Dibatasi</h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            {error.toLowerCase().includes('masuk') || error.toLowerCase().includes('session') ? 'Anda harus masuk/login sebagai Admin terlebih dahulu untuk mengakses dashboard ini.' : error}
          </p>
          <Link href="/login" className="w-full py-3 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-md flex justify-center items-center gap-2" style={{ backgroundColor: '#00aa5b' }}>
            <span className="material-symbols-outlined text-sm">login</span>
            Masuk ke Akun
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.seller?.shopName?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* SIDEBAR */}
      <div className="sidebar" style={{ zIndex: 10, width: '280px', position: 'fixed', top: 0, bottom: 0, left: 0, backgroundColor: '#ffffff', borderRight: '1px solid #e9ecef', padding: '24px' }}>
        <div className="d-flex align-items-center mb-4 px-2">
          <div className="bg-success text-white rounded-3 d-flex align-items-center justify-content-center me-2 shadow-sm" style={{ width: '40px', height: '40px', backgroundColor: '#00aa5b' }}>
            <i className="fa-solid fa-shield-halved fs-5"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: '#00aa5b', letterSpacing: '-0.5px' }}>Cartify</h4>
            <span className="text-muted fw-semibold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Console</span>
          </div>
        </div>

        <div className="my-4 border-top" style={{ borderColor: '#f1f3f5' }}></div>

        <nav className="nav flex-column gap-2">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`nav-link border-0 text-start bg-transparent py-2.5 px-3 rounded-3 transition-all ${activeMenu === 'dashboard' ? 'active-menu' : 'text-secondary-menu'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500' }}
          >
            <i className="fa-solid fa-chart-simple fs-5"></i> Ringkasan Platform
          </button>
          <button
            onClick={() => setActiveMenu('users')}
            className={`nav-link border-0 text-start bg-transparent py-2.5 px-3 rounded-3 transition-all ${activeMenu === 'users' ? 'active-menu' : 'text-secondary-menu'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500' }}
          >
            <i className="fa-solid fa-users-gear fs-5"></i> Kelola Pengguna
          </button>
          <button
            onClick={() => setActiveMenu('products')}
            className={`nav-link border-0 text-start bg-transparent py-2.5 px-3 rounded-3 transition-all ${activeMenu === 'products' ? 'active-menu' : 'text-secondary-menu'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500' }}
          >
            <i className="fa-solid fa-boxes-packing fs-5"></i> Kelola Produk
          </button>
          
          <div className="my-3 border-top" style={{ borderColor: '#f1f3f5' }}></div>

          <Link
            className="nav-link py-2.5 px-3 rounded-3 text-secondary-menu hover-menu"
            href="/shop"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}
          >
            <i className="fa-solid fa-house fs-5"></i> Kembali ke Beranda
          </Link>
          <a
            className="nav-link py-2.5 px-3 rounded-3 text-danger hover-danger"
            href="#"
            onClick={(e) => { e.preventDefault(); handleLogout(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}
          >
            <i className="fa-solid fa-right-from-bracket fs-5"></i> Keluar Sesi
          </a>
        </nav>
      </div>

      {/* TOP HEADER */}
      <div className="navbar-top d-flex justify-content-end align-items-center sticky-top" style={{ zIndex: 5, marginLeft: '280px', height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #e9ecef', padding: '0 40px' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <p className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>{adminUser?.name}</p>
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill fw-semibold" style={{ fontSize: '10px', padding: '3px 8px' }}>
              Level {adminUser?.adminLevel} Super Admin
            </span>
          </div>
          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '40px', height: '40px', backgroundColor: '#00aa5b', fontSize: '14px' }}>
            SA
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content" style={{ marginLeft: '280px', padding: '40px' }}>
        <div className="mb-4">
          <h3 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>
            {activeMenu === 'dashboard' && 'Ringkasan Platform'}
            {activeMenu === 'users' && 'Manajemen Pengguna'}
            {activeMenu === 'products' && 'Manajemen Produk'}
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            {activeMenu === 'dashboard' && 'Gambaran umum statistik performa transaksi dan data Cartify.'}
            {activeMenu === 'users' && 'Lihat daftar pembeli & penjual, blokir akses, atau hapus akun.'}
            {activeMenu === 'products' && 'Pantau dan moderasi produk yang ditawarkan oleh penjual.'}
          </p>
        </div>

        {/* Dashboard Ringkasan View */}
        {activeMenu === 'dashboard' && stats && (
          <div>
            {/* Stats row */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card-stat p-4 bg-white border border-light-subtle d-flex align-items-center justify-content-between rounded-4 shadow-sm">
                  <div>
                    <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Pembeli</span>
                    <h3 className="fw-bold mb-0 mt-1" style={{ color: '#00aa5b', letterSpacing: '-0.5px' }}>{stats.totalBuyers}</h3>
                    <small className="text-muted" style={{ fontSize: '12px' }}>Pengguna terdaftar</small>
                  </div>
                  <div className="stat-icon d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px', backgroundColor: '#e6f6ef', color: '#00aa5b' }}>
                    <i className="fa-solid fa-users fs-5"></i>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card-stat p-4 bg-white border border-light-subtle d-flex align-items-center justify-content-between rounded-4 shadow-sm">
                  <div>
                    <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Penjual</span>
                    <h3 className="fw-bold mb-0 mt-1 text-primary" style={{ letterSpacing: '-0.5px' }}>{stats.totalSellers}</h3>
                    <small className="text-muted" style={{ fontSize: '12px' }}>Toko aktif bermitra</small>
                  </div>
                  <div className="stat-icon d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px', backgroundColor: '#e6f0fa', color: '#0d6efd' }}>
                    <i className="fa-solid fa-store fs-5"></i>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card-stat p-4 bg-white border border-light-subtle d-flex align-items-center justify-content-between rounded-4 shadow-sm">
                  <div>
                    <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Produk Aktif</span>
                    <h3 className="fw-bold mb-0 mt-1 text-warning" style={{ letterSpacing: '-0.5px' }}>{stats.totalProducts}</h3>
                    <small className="text-muted" style={{ fontSize: '12px' }}>Katalog di platform</small>
                  </div>
                  <div className="stat-icon d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px', backgroundColor: '#fffbeb', color: '#f59e0b' }}>
                    <i className="fa-solid fa-box fs-5"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card-stat p-4 bg-white border border-light-subtle d-flex align-items-center justify-content-between rounded-4 shadow-sm">
                  <div>
                    <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Transaksi Selesai</span>
                    <h3 className="fw-bold mb-0 mt-1 text-secondary" style={{ letterSpacing: '-0.5px' }}>{stats.totalTransactions}</h3>
                    <small className="text-muted" style={{ fontSize: '12px' }}>Pesanan berhasil diproses</small>
                  </div>
                  <div className="stat-icon d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px', backgroundColor: '#f1f3f5', color: '#495057' }}>
                    <i className="fa-solid fa-receipt fs-5"></i>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card-stat p-4 bg-white border border-light-subtle d-flex align-items-center justify-content-between rounded-4 shadow-sm">
                  <div>
                    <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Volume Transaksi</span>
                    <h3 className="fw-bold mb-0 mt-1 text-success" style={{ letterSpacing: '-0.5px' }}>
                      Rp {stats.totalRevenue?.toLocaleString('id-ID')}
                    </h3>
                    <small className="text-muted" style={{ fontSize: '12px' }}>Perputaran nilai uang GMV</small>
                  </div>
                  <div className="stat-icon d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px', backgroundColor: '#e6fdf2', color: '#10b981' }}>
                    <i className="fa-solid fa-coins fs-5"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts Container */}
            <div className="row g-4 mb-4">
              <div className="col-lg-8">
                <div className="card border-0 p-4 shadow-sm bg-white rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Tren Transaksi & Pendapatan</h5>
                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1.5" style={{ fontSize: '11px' }}>Nilai Riil</span>
                  </div>
                  <div className="chart-placeholder border border-light-subtle rounded-3 p-3 bg-light d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '260px' }}>
                    {/* SVG Line Graph */}
                    <svg viewBox="0 0 500 200" width="100%" height="200" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00aa5b" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#00aa5b" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#e9ecef" strokeDasharray="3,3" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="#e9ecef" strokeDasharray="3,3" />
                      <line x1="0" y1="140" x2="500" y2="140" stroke="#e9ecef" strokeDasharray="3,3" />
                      <line x1="0" y1="180" x2="500" y2="180" stroke="#adb5bd" />
                      
                      {/* Trend Path */}
                      <path
                        d="M 10 170 Q 120 120 200 130 T 350 70 T 490 50"
                        fill="none"
                        stroke="#00aa5b"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 170 Q 120 120 200 130 T 350 70 T 490 50 L 490 180 L 10 180 Z"
                        fill="url(#chart-grad)"
                      />

                      {/* Data Nodes */}
                      <circle cx="10" cy="170" r="5" fill="#00aa5b" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="140" cy="122" r="5" fill="#00aa5b" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="270" cy="115" r="5" fill="#00aa5b" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="390" cy="65" r="5" fill="#00aa5b" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="490" cy="50" r="5" fill="#00aa5b" stroke="#ffffff" strokeWidth="2" />

                      {/* Labels */}
                      <text x="10" y="196" fill="#6c757d" fontSize="9" textAnchor="middle">Mgg 1</text>
                      <text x="140" y="196" fill="#6c757d" fontSize="9" textAnchor="middle">Mgg 2</text>
                      <text x="270" y="196" fill="#6c757d" fontSize="9" textAnchor="middle">Mgg 3</text>
                      <text x="390" y="196" fill="#6c757d" fontSize="9" textAnchor="middle">Mgg 4</text>
                      <text x="490" y="196" fill="#6c757d" fontSize="9" textAnchor="end">Hari Ini</text>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card border-0 p-4 shadow-sm bg-white rounded-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Rasio Distribusi</h5>
                    <p className="text-muted small">Pembagian entitas database saat ini.</p>
                  </div>
                  <div className="py-2">
                    {/* SVG Bar Chart for ratio representation */}
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <div className="d-flex justify-content-between text-dark small fw-semibold mb-1">
                          <span>Pembeli</span>
                          <span>{stats.totalBuyers} User</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#e9ecef' }}>
                          <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${(stats.totalBuyers / (stats.totalBuyers + stats.totalSellers || 1)) * 100}%`, backgroundColor: '#00aa5b' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="d-flex justify-content-between text-dark small fw-semibold mb-1">
                          <span>Penjual (Toko)</span>
                          <span>{stats.totalSellers} Toko</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#e9ecef' }}>
                          <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${(stats.totalSellers / (stats.totalBuyers + stats.totalSellers || 1)) * 100}%`, backgroundColor: '#0d6efd' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="d-flex justify-content-between text-dark small fw-semibold mb-1">
                          <span>Rata-rata Produk Per Toko</span>
                          <span>{(stats.totalProducts / (stats.totalSellers || 1)).toFixed(1)} Pcs</span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#e9ecef' }}>
                          <div className="progress-bar rounded-pill" role="progressbar" style={{ width: '60%', backgroundColor: '#f59e0b' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-top" style={{ borderColor: '#f1f3f5' }}>
                    <div className="d-flex align-items-center text-muted small">
                      <i className="fa-solid fa-circle-info text-success me-2"></i>
                      <span>Data diperbarui secara real-time dari API.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* Kelola Pengguna View */}
        {activeMenu === 'users' && (
          <div className="card border-0 p-4 shadow-sm bg-white rounded-4">
            <div className="mb-4">
              <div className="input-group search-group">
                <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#dee2e6' }}><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  style={{ borderColor: '#dee2e6' }}
                  placeholder="Cari pengguna berdasarkan nama, email, atau peran..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle custom-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Alamat</th>
                    <th>Peran</th>
                    <th className="text-center">Aksi Moderasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted py-5"><i className="fa-regular fa-folder-open fs-2 mb-2 d-block opacity-50"></i>Tidak ada pengguna ditemukan.</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.userId}>
                        <td><code style={{ color: '#00aa5b', backgroundColor: '#e6f6ef', padding: '3px 8px', borderRadius: '5px' }}>{u.userId}</code></td>
                        <td className="fw-semibold text-dark">
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-initials d-flex align-items-center justify-content-center text-white fw-bold rounded-circle" style={{ width: '32px', height: '32px', fontSize: '12px', backgroundColor: u.role === 'Admin' ? '#343a40' : u.role === 'Seller' ? '#0d6efd' : '#00aa5b' }}>
                              {u.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>{u.address}</td>
                        <td>
                          <span className={`badge border fw-semibold rounded-pill ${u.role === 'Admin' ? 'bg-dark-subtle text-dark border-dark-subtle' : u.role === 'Seller' ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-success-subtle text-success border-success-subtle'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                            {u.role}
                          </span>
                        </td>
                        <td className="text-center">
                          {u.role !== 'Admin' ? (
                            <div className="d-inline-flex gap-2">
                              <button
                                onClick={() => handleBlockUser(u.userId)}
                                className="btn btn-sm btn-outline-warning fw-bold rounded-pill px-3"
                                style={{ fontSize: '12px' }}
                              >
                                <i className="fa-solid fa-ban me-1"></i> Blokir
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.userId)}
                                className="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3"
                                style={{ fontSize: '12px' }}
                              >
                                <i className="fa-regular fa-trash-can me-1"></i> Hapus
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small fw-semibold"><i className="fa-solid fa-lock me-1"></i> Proteksi Sistem</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kelola Produk View */}
        {activeMenu === 'products' && (
          <div className="card border-0 p-4 shadow-sm bg-white rounded-4">
            <div className="mb-4">
              <div className="input-group search-group">
                <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#dee2e6' }}><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  style={{ borderColor: '#dee2e6' }}
                  placeholder="Cari produk berdasarkan nama, kategori, atau nama toko..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle custom-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Nama Produk</th>
                    <th>Kategori</th>
                    <th>Harga Barang</th>
                    <th>Stok</th>
                    <th>Toko Penjual</th>
                    <th className="text-center">Aksi Moderasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted py-5"><i className="fa-regular fa-folder-open fs-2 mb-2 d-block opacity-50"></i>Tidak ada produk ditemukan.</td></tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.productId}>
                        <td><code style={{ color: '#00aa5b', backgroundColor: '#e6f6ef', padding: '3px 8px', borderRadius: '5px' }}>{p.productId}</code></td>
                        <td className="fw-semibold text-dark">{p.name}</td>
                        <td>
                          <span className="badge bg-light text-secondary border border-light-subtle rounded-pill" style={{ padding: '4px 10px', fontSize: '11px' }}>
                            {p.category}
                          </span>
                        </td>
                        <td className="fw-bold" style={{ color: '#00aa5b' }}>
                          Rp {p.price?.toLocaleString('id-ID')}
                        </td>
                        <td className="fw-semibold" style={{ fontSize: '13px' }}>{p.stock} unit</td>
                        <td className="fw-semibold text-dark">
                          <div className="d-flex align-items-center gap-1.5" style={{ fontSize: '13px' }}>
                            <i className="fa-solid fa-store text-primary me-1"></i>
                            <span>{p.seller?.shopName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDeleteProduct(p.productId)}
                            className="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3"
                            style={{ fontSize: '12px' }}
                          >
                            <i className="fa-regular fa-trash-can me-1"></i> Hapus Produk
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .sidebar .nav-link {
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .text-secondary-menu {
          color: #5c6770 !important;
        }
        .text-secondary-menu:hover {
          background-color: #f8f9fa !important;
          color: #00aa5b !important;
        }
        .active-menu {
          background-color: #e6f6ef !important;
          color: #00aa5b !important;
          border: 1px solid rgba(0, 170, 91, 0.15);
        }
        .hover-danger:hover {
          background-color: #fff5f5 !important;
          color: #dc3545 !important;
        }
        .card-stat {
          transition: all 0.25s ease;
        }
        .card-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
        }
        .search-group .form-control:focus {
          border-color: #00aa5b !important;
          box-shadow: none !important;
        }
        .custom-table {
          border-collapse: separate;
          border-spacing: 0 8px;
        }
        .custom-table thead th {
          border-bottom: 2px solid #f1f3f5;
          color: #5c6770;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          padding: 12px 16px;
        }
        .custom-table tbody tr {
          background-color: #ffffff;
          transition: background-color 0.2s ease;
        }
        .custom-table tbody tr:hover {
          background-color: #fcfdfe;
        }
        .custom-table tbody td {
          padding: 16px;
          border-bottom: 1px solid #f1f3f5;
          font-size: 14px;
        }
        .btn-action-hover {
          transition: all 0.2s ease;
        }
        .btn-action-hover:hover {
          transform: scale(1.03);
        }
      `}</style>
    </div>
  );
}
