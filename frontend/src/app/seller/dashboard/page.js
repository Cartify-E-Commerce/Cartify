'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert, showConfirm } from '../../api';

export default function SellerDashboard() {
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  
  // Dashboard statistics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Form product inputs
  const [prodId, setProdId] = useState('');
  const [prodNama, setProdNama] = useState('');
  const [prodKategori, setProdKategori] = useState('Elektronik');
  const [prodHarga, setProdHarga] = useState('');
  const [prodStok, setProdStok] = useState('');
  const [prodInfoKhusus, setProdInfoKhusus] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Profile edit states
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'add_product', 'orders', 'notifications', 'edit_profile'
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editShopName, setEditShopName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  const router = useRouter();

  useEffect(() => {
    loadSellerData();
    const interval = setInterval(loadSellerData, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadSellerData = async () => {
    try {
      const userRes = await api.me();
      if (!userRes.user) {
        router.push('/login');
        return;
      }
      if (userRes.user.role !== 'Seller') {
        await showAlert('Akses Ditolak', 'Halaman ini khusus untuk Akun Toko Seller.', 'error');
        router.push('/shop');
        return;
      }
      setProfile(userRes.user);
      setEditName(userRes.user.name || '');
      setEditAddress(userRes.user.address || '');
      setEditShopName(userRes.user.shopName || '');
      setEditPhoto(userRes.user.profilePhoto || '');

      // Load seller stats, products & orders
      const data = await api.getSellerDashboard();
      setProducts(data.products || []);
      setIncomingOrders(data.incomingOrders || []);
      setTotalRevenue(data.user?.revenue || 0);
      setTotalOrders(data.pesananMasuk || 0);
      setTotalProductsCount(data.totalProducts || 0);
      setUnreadNotifications(data.unreadNotifications || 0);
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data seller.');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.readNotifications(notificationId);
      loadSellerData();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.readNotifications(null);
      loadSellerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    if (await showConfirm('Keluar Akun', 'Apakah Anda yakin ingin keluar?')) {
      try {
        await api.logout();
        router.push('/login');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editName,
        address: editAddress,
        shopName: editShopName,
        profilePhoto: editPhoto,
      };
      const res = await api.updateProfile(payload);
      if (res.status === 'success') {
        await showAlert('Berhasil', 'Profil Toko Anda berhasil diperbarui!', 'success');
        setProfile(res.user);
        setActiveTab('dashboard');
      }
    } catch (err) {
      await showAlert('Gagal', err.message || 'Gagal memperbarui profil toko.', 'error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: prodId,
        nama: prodNama,
        kategori: prodKategori,
        harga: parseFloat(prodHarga),
        stok: parseInt(prodStok),
      };

      // Map dynamic properties based on category
      if (prodKategori === 'Elektronik') {
        payload.brand = 'Generic';
        payload.warrantyMonths = parseInt(prodInfoKhusus) || 12;
      } else if (prodKategori === 'Makanan') {
        payload.expiryDate = prodInfoKhusus || '2026-12-31';
        payload.weightGram = 100.0;
      } else {
        payload.size = prodInfoKhusus || 'M';
        payload.material = 'Cotton';
        payload.color = 'Hitam';
      }

      const res = await api.addProduct(payload);
      if (res.status === 'success') {
        await showAlert('Berhasil', 'Produk berhasil ditambahkan!', 'success');
        // Reset form
        setProdId('');
        setProdNama('');
        setProdHarga('');
        setProdStok('');
        setProdInfoKhusus('');
        loadSellerData();
      } else {
        await showAlert('Gagal', 'Gagal menambahkan produk', 'error');
      }
    } catch (err) {
      await showAlert('Gagal', 'Error menambahkan produk: ' + err.message, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!(await showConfirm('Hapus Produk', `Apakah Anda yakin ingin menghapus produk dengan ID ${productId}?`))) return;
    try {
      await api.deleteProduct(productId);
      loadSellerData();
    } catch (err) {
      await showAlert('Gagal', 'Gagal menghapus produk: ' + err.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (transactionId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(transactionId, newStatus);
      if (res.status === 'success') {
        loadSellerData();
      } else {
        await showAlert('Pemberitahuan', res.message, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide">Memuat data seller...</p>
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
          <h3 className="font-display-lg text-headline-sm font-extrabold text-on-surface mb-2">Akses Seller Dibatasi</h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            {error.toLowerCase().includes('masuk') || error.toLowerCase().includes('session') ? 'Anda harus masuk/login sebagai Seller terlebih dahulu untuk mengakses dashboard ini.' : error}
          </p>
          <Link href="/login" className="w-full py-3 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-md flex justify-center items-center gap-2" style={{ backgroundColor: '#00aa5b' }}>
            <span className="material-symbols-outlined text-sm">login</span>
            Masuk ke Akun
          </Link>
        </div>
      </div>
    );
  }

  // Helper placeholder adjust
  const getInfoKhususPlaceholder = () => {
    if (prodKategori === 'Elektronik') return 'Contoh: 12 (Garansi dalam bulan)';
    if (prodKategori === 'Makanan') return 'YYYY-MM-DD (Contoh: 2026-06-05)';
    return 'Contoh: S, M, L, XL (Ukuran Pakaian)';
  };

  const getInfoKhususLabel = () => {
    if (prodKategori === 'Elektronik') return 'Garansi (Bulan)';
    if (prodKategori === 'Makanan') return 'Tanggal Kadaluarsa';
    return 'Ukuran';
  };

  const revenueChartData = [1200000, 1900000, 3000000, 2500000, 4500000, totalRevenue || 3800000];
  const maxRevenue = Math.max(...revenueChartData);

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased bg-gradient-soft pb-12">
      {/* NAVBAR */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#00aa5b]/10 shadow-[0_4px_30px_rgba(0,170,91,0.03)] h-20 flex items-center">
        <nav className="flex justify-between items-center px-lg py-sm max-w-container-max w-full mx-auto">
          <div className="flex items-center gap-sm">
            <Link href="/shop" className="flex items-center gap-2 font-display-lg text-headline-lg select-none font-bold tracking-tight hover:opacity-90 transition-opacity text-[#00aa5b]" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-outlined text-3xl font-bold align-middle" style={{ fontVariationSettings: "'FILL' 1", color: '#00aa5b' }}>shopping_cart</span>
              <span>Cartify <span className="text-on-surface-variant font-medium text-lg ml-1">Seller</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-lg">
            <Link href="/buyer/dashboard" className="px-5 py-2 border-2 rounded-full font-bold text-sm transition-all hover:bg-[#00aa5b] hover:text-white" style={{ borderColor: '#00aa5b', color: '#00aa5b', textDecoration: 'none' }}>
              Beralih ke Buyer
            </Link>

            <div className="h-8 w-px bg-outline-variant/60 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-content-center text-white font-bold text-md shadow-sm" style={{ backgroundColor: '#00aa5b', borderColor: 'rgba(0, 170, 91, 0.2)' }}>
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden md:inline font-bold text-sm text-on-surface">{profile?.shopName || profile?.name}</span>
            </div>
          </div>
        </nav>
      </header>

      {/* BODY CONTENT */}
      <main className="max-w-container-max mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="glass-panel border border-outline-variant/35 rounded-3xl p-6 shadow-lg text-center bg-white">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-content-center text-white font-bold text-2xl shadow-md border-3 border-white" style={{ backgroundColor: '#00aa5b' }}>
                  {profile?.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <h3 className="font-display-lg text-headline-sm font-bold text-on-surface leading-tight">{profile?.shopName || profile?.name}</h3>
              <p className="text-on-surface-variant text-xs font-semibold mb-6">Toko Seller</p>
              
              <hr className="border-outline-variant/30 my-4" />
              
              <nav className="flex flex-col gap-2">
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'overview' ? '#00aa5b' : 'transparent', textDecoration: 'none' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'overview' ? 'text-white-icon' : ''}`}>dashboard</span>
                  Dashboard
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'products' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'products' ? '#00aa5b' : 'transparent', textDecoration: 'none' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('products'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'products' ? 'text-white-icon' : ''}`}>inventory</span>
                  Kelola Produk
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'add_product' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'add_product' ? '#00aa5b' : 'transparent', textDecoration: 'none' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('add_product'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'add_product' ? 'text-white-icon' : ''}`}>add_circle</span>
                  Tambah Produk
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'orders' ? '#00aa5b' : 'transparent', textDecoration: 'none' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'orders' ? 'text-white-icon' : ''}`}>receipt_long</span>
                  Kelola Pesanan
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'notifications' ? '#00aa5b' : 'transparent', textDecoration: 'none' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('notifications'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'notifications' ? 'text-white-icon' : ''}`}>notifications</span>
                  Notifikasi
                  {unreadNotifications > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'notifications' ? 'bg-white text-emerald' : 'bg-red-500 text-white'}`} style={activeTab === 'notifications' ? {color:'#00aa5b', backgroundColor:'#fff'} : {backgroundColor:'#dc3545', color:'#fff'}}>
                      {unreadNotifications}
                    </span>
                  )}
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'edit_profile' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'edit_profile' ? '#00aa5b' : 'transparent', textDecoration: 'none' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('edit_profile'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'edit_profile' ? 'text-white-icon' : ''}`}>store</span>
                  Pengaturan Toko
                </a>
                <hr className="border-outline-variant/30 my-2" />
                <Link className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface" href="/shop" style={{ textDecoration: 'none' }}>
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Kembali ke Beranda
                </Link>
                <a className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-error hover:bg-error/5" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ textDecoration: 'none' }}>
                  <span className="material-symbols-outlined text-lg">power_settings_new</span>
                  Keluar
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Area */}
          <section className="lg:col-span-9 flex flex-col gap-gutter">
            {/* TAB: EDIT PROFILE */}
            {activeTab === 'edit_profile' && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm flex flex-col gap-6">
                <div className="border-b pb-4 mb-2">
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-0">
                    <span className="material-symbols-outlined text-[#00aa5b]">store</span> Pengaturan Toko Saya
                  </h3>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Ubah identitas toko dan alamat untuk kelancaran logistik penjualan</p>
                </div>

                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                  {/* Photo upload */}
                  <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-sm w-full">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 flex items-center justify-center text-white font-bold text-3xl bg-neutral-200 shadow-md flex-shrink-0">
                      {editPhoto ? (
                        <img src={editPhoto} alt="Preview Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left flex-grow">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Logo / Foto Toko</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <label className="px-4 py-2 bg-primary hover:bg-[#008f4c] text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all select-none">
                          Pilih Foto Baru
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                      <small className="text-muted text-[10px] mt-1">Mendukung format PNG, JPG, JPEG.</small>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Lengkap Pemilik</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold" 
                      placeholder="Nama pemilik..." 
                      required 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Toko (Seller)</label>
                    <input 
                      type="text" 
                      value={editShopName} 
                      onChange={(e) => setEditShopName(e.target.value)} 
                      className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold" 
                      placeholder="Nama toko online..." 
                      required 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Alamat Toko / Pengiriman</label>
                    <textarea 
                      value={editAddress} 
                      onChange={(e) => setEditAddress(e.target.value)} 
                      className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold" 
                      rows="3" 
                      placeholder="Alamat toko..." 
                      required
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button type="submit" className="px-6 py-3 bg-[#00aa5b] hover:bg-[#008f4c] text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer">
                      Simpan Profil
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('overview')} 
                      className="px-6 py-3 border border-outline-variant/60 hover:bg-surface-container text-on-surface font-bold text-sm rounded-2xl transition-all cursor-pointer bg-transparent"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'overview' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-display-lg text-headline-sm font-bold text-on-surface leading-tight mb-1">Selamat Datang di Seller Center, {profile?.name}!</h3>
                    <p className="text-on-surface-variant/70 text-xs mb-0">Berikut adalah performa toko online kamu secara real-time.</p>
                  </div>
                  <button onClick={loadSellerData} className="px-4 py-2 border border-[#00aa5b] hover:bg-[#00aa5b]/10 text-[#00aa5b] font-bold text-xs rounded-full transition-all bg-transparent flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">sync</span> Refresh Data
                  </button>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                  <div onClick={() => setActiveTab('overview')} className="bg-white border border-outline-variant/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Total Pendapatan</span>
                      <h3 className="text-headline-md font-bold mt-1 text-[#00aa5b]">Rp {totalRevenue?.toLocaleString('id-ID')}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#00aa5b]/10 text-[#00aa5b] flex items-center justify-content-center">
                      <span className="material-symbols-outlined text-xl">payments</span>
                    </div>
                  </div>

                  <div onClick={() => setActiveTab('orders')} className="bg-white border border-outline-variant/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Transaksi Penjualan</span>
                      <h3 className="text-headline-md font-bold mt-1 text-warning">{totalOrders} Transaksi</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-content-center">
                      <span className="material-symbols-outlined text-xl">local_shipping</span>
                    </div>
                  </div>

                  <div onClick={() => setActiveTab('products')} className="bg-white border border-outline-variant/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Total Produk</span>
                      <h3 className="text-headline-md font-bold mt-1 text-secondary">{totalProductsCount} Item</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#00aa5b]/10 text-[#00aa5b] flex items-center justify-content-center">
                      <span className="material-symbols-outlined text-xl">inventory_2</span>
                    </div>
                  </div>

                  <div onClick={() => setActiveTab('notifications')} className="bg-white border border-outline-variant/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Notifikasi Baru</span>
                      <h3 className="text-headline-md font-bold mt-1 text-primary">{unreadNotifications} Notif</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-content-center">
                      <span className="material-symbols-outlined text-xl">notifications_active</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic HTML Chart Representation */}
                <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm">
                  <h5 className="font-display-lg text-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00aa5b]">analytics</span> Grafik Pendapatan Toko
                  </h5>
                  <div style={{ display: 'flex', height: '220px', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px', borderBottom: '2px solid #cbd5e1' }}>
                    {revenueChartData.map((val, idx) => {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
                      const heightPercent = maxRevenue > 0 ? (val / maxRevenue) * 100 : 0;
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', height: '100%', justifyContext: 'flex-end' }} className="justify-end">
                          <span style={{ fontSize: '11px', color: '#00aa5b', fontWeight: 'bold', marginBottom: '4px' }}>
                            {(val / 1000).toFixed(0)}k
                          </span>
                          <div style={{ height: `${heightPercent * 0.7}%`, width: '100%', backgroundColor: '#00aa5b', borderRadius: '8px 8px 0 0', transition: 'height 0.5s ease-out' }}></div>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '8px' }}>
                            {months[idx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/15">
                  <h5 className="font-display-lg text-headline-sm font-bold text-on-surface mb-0 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00aa5b]">inventory_2</span> Daftar Produk Aktif
                  </h5>
                  <button onClick={() => setActiveTab('add_product')} className="px-5 py-2.5 bg-[#00aa5b] hover:bg-[#008f4c] text-white font-bold text-xs rounded-full shadow-sm transition-all active:scale-95 cursor-pointer">
                    <i className="fa-solid fa-plus-circle me-1"></i> Tambah Produk Baru
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                        <th className="py-3 px-2">ID</th>
                        <th className="py-3 px-2">Produk</th>
                        <th className="py-3 px-2">Kategori</th>
                        <th className="py-3 px-2">Harga</th>
                        <th className="py-3 px-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15 text-sm">
                      {products.length === 0 ? (
                        <tr><td colSpan="5" className="text-center text-muted py-8 font-semibold">Belum ada produk terdaftar.</td></tr>
                      ) : (
                        products.map((p) => (
                          <tr key={p.productId} className="hover:bg-surface-container-lowest/50 transition-colors">
                            <td className="py-4 px-2 font-mono text-xs text-on-surface-variant"><code>{p.productId}</code></td>
                            <td className="py-4 px-2">
                              <div className="font-bold text-on-surface">{p.name}</div>
                              <small className="text-on-surface-variant/60 font-semibold">Stok: {p.stock} | Rating: {p.averageRating?.toFixed(1) || '5.0'}</small>
                            </td>
                            <td className="py-4 px-2"><span className="bg-[#00aa5b]/10 text-[#00aa5b] px-3 py-1 rounded-full text-xs font-bold">{p.category}</span></td>
                            <td className="py-4 px-2 font-bold">Rp {p.price?.toLocaleString('id-ID')}</td>
                            <td className="py-4 px-2 text-center">
                              <button
                                onClick={() => handleDeleteProduct(p.productId)}
                                className="w-8 h-8 rounded-full border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-content-center transition-all mx-auto bg-transparent cursor-pointer"
                                title="Hapus"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
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

            {activeTab === 'add_product' && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm max-w-[640px] mx-auto w-full">
                <div className="border-b pb-4 mb-6">
                  <h5 className="font-display-lg text-headline-sm font-bold text-on-surface mb-0 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00aa5b]">add_circle</span> Tambah Produk Baru
                  </h5>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Masukkan data lengkap untuk mulai memajang produk baru di Cartify</p>
                </div>

                <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">ID Produk</label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                      placeholder="Contoh: E03, M03"
                      value={prodId}
                      onChange={(e) => setProdId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Produk</label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                      placeholder="Nama barang..."
                      value={prodNama}
                      onChange={(e) => setProdNama(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kategori</label>
                    <select
                      className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                      value={prodKategori}
                      onChange={(e) => setProdKategori(e.target.value)}
                      required
                    >
                      <option value="Elektronik">Elektronik</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Pakaian">Pakaian</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Harga (Rupiah)</label>
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                        placeholder="100000"
                        value={prodHarga}
                        onChange={(e) => setProdHarga(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Stok Awal</label>
                      <input
                        type="number"
                        className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                        placeholder="10"
                        value={prodStok}
                        onChange={(e) => setProdStok(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{getInfoKhususLabel()}</label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                      placeholder={getInfoKhususPlaceholder()}
                      value={prodInfoKhusus}
                      onChange={(e) => setProdInfoKhusus(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="submit" className="px-6 py-3 bg-[#00aa5b] hover:bg-[#008f4c] text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 w-full cursor-pointer">
                      Simpan Produk
                    </button>
                    <button type="button" onClick={() => setActiveTab('products')} className="px-6 py-3 border border-outline-variant/60 hover:bg-surface-container text-on-surface font-bold text-sm rounded-2xl transition-all w-full bg-transparent">
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm">
                <h5 className="font-display-lg text-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2 border-b pb-4 border-outline-variant/15">
                  <span className="material-symbols-outlined text-warning">local_shipping</span> Pesanan Masuk (Kelola Transaksi)
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                        <th className="py-3 px-2">ID Transaksi</th>
                        <th className="py-3 px-2">Item</th>
                        <th className="py-3 px-2">Total</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15 text-sm">
                      {incomingOrders.length === 0 ? (
                        <tr><td colSpan="5" className="text-center text-muted py-8 font-semibold">Belum ada pesanan masuk.</td></tr>
                      ) : (
                        incomingOrders.map((o) => {
                          const itemNames = o.itemList?.map(i => `${i.product?.name} (x${i.quantity})`).join(', ');
                          
                          let badgeStyle = 'bg-neutral-100 text-neutral-800';
                          if (o.status === 'PENDING') badgeStyle = 'bg-zinc-800 text-white';
                          else if (o.status === 'PROCESSING') badgeStyle = 'bg-amber-100 text-amber-800';
                          else if (o.status === 'SHIPPED') badgeStyle = 'bg-blue-100 text-blue-800';
                          else if (o.status === 'DELIVERED') badgeStyle = 'bg-emerald-100 text-emerald-800';
                          else if (o.status === 'CANCELLED') badgeStyle = 'bg-red-100 text-red-800';

                          return (
                            <tr key={o.transactionId} className="hover:bg-surface-container-lowest/50 transition-colors">
                              <td className="py-4 px-2 font-mono text-xs text-on-surface-variant"><code>{o.transactionId}</code></td>
                              <td className="py-4 px-2"><div className="text-truncate" style={{ maxWidth: '250px' }} title={itemNames}>{itemNames}</div></td>
                              <td className="py-4 px-2 font-bold text-on-surface">Rp {o.totalAmount?.toLocaleString('id-ID')}</td>
                              <td className="py-4 px-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-uppercase ${badgeStyle}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-center">
                                {o.status === 'PROCESSING' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.transactionId, 'SHIPPED')}
                                    className="px-3 py-1.5 bg-primary hover:bg-[#008f4c] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                                  >
                                    <i className="fa-solid fa-truck-fast me-1"></i> Kirim
                                  </button>
                                )}
                                {o.status === 'SHIPPED' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.transactionId, 'DELIVERED')}
                                    className="px-3 py-1.5 bg-[#00aa5b] hover:bg-[#008f4c] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                                  >
                                    <i className="fa-solid fa-check me-1"></i> Selesaikan
                                  </button>
                                )}
                                {o.status !== 'PROCESSING' && o.status !== 'SHIPPED' && (
                                  <span className="text-on-surface-variant/60 font-semibold text-xs flex items-center justify-content-center gap-1">
                                    <span className="material-symbols-outlined text-xs">task_alt</span> Selesai
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/15">
                  <h5 className="font-display-lg text-headline-sm font-bold text-on-surface mb-0 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">notifications_active</span> Notifikasi Toko
                  </h5>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <button onClick={markAllNotificationsRead} className="px-4 py-2 border border-primary hover:bg-primary/10 text-primary font-bold text-xs rounded-full transition-all bg-transparent cursor-pointer">
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted py-8 font-semibold my-0">Tidak ada notifikasi toko saat ini.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.notificationId} className={`p-4 rounded-2xl border transition-all flex justify-between align-items-start gap-4 ${n.read ? 'bg-neutral-50/70 border-outline-variant/10 opacity-75' : 'bg-white border-[#00aa5b]/20 shadow-sm'}`}>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-neutral-300' : 'bg-[#00aa5b]'}`}></span>
                            <small className="text-muted text-[10px] font-bold">{new Date(n.createdAt).toLocaleString('id-ID')}</small>
                          </div>
                          <p className="mb-0 text-sm font-semibold text-on-surface leading-relaxed">{n.message}</p>
                        </div>
                        {!n.read && (
                          <button 
                            onClick={() => markNotificationRead(n.notificationId)}
                            className="px-3 py-1 border border-[#00aa5b] hover:bg-[#00aa5b]/10 text-[#00aa5b] font-bold text-[10px] rounded-full transition-all bg-transparent flex-shrink-0 cursor-pointer"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
