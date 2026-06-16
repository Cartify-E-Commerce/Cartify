'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert, showConfirm } from '../../api';

// Helper to resolve product images locally
function resolveProductImage(name = '', category = '') {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  if (n.includes('laptop')) {
    return '/laptop.png';
  }
  if (n.includes('keyboard') || n.includes('mouse') || n.includes('mechanical')) {
    return '/keyboard.png';
  }
  if (n.includes('kaos') || n.includes('baju') || n.includes('jaket') || n.includes('t-shirt') || n.includes('tshirt') || c.includes('pakaian')) {
    return '/tshirt.png';
  }
  if (n.includes('kripik') || n.includes('singkong') || n.includes('roti') || n.includes('sandwich') || c.includes('makanan')) {
    return '/sandwich.png';
  }
  if (n.includes('phone') || n.includes('hp') || n.includes('smartphone') || n.includes('handphone')) {
    return '/phone.png';
  }
  if (c.includes('elektronik') || c.includes('laptop')) {
    return '/laptop.png';
  }
  if (c.includes('makanan') || c.includes('roti')) {
    return '/sandwich.png';
  }
  if (c.includes('pakaian') || c.includes('baju') || c.includes('jaket')) {
    return '/tshirt.png';
  }
  return '/laptop.png';
}

export default function BuyerDashboard() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const prevUnreadCountRef = useRef(0);

  // Sidebar Tabs state: 'orders', 'edit_profile', 'notifications', 'vouchers'
  const [activeTab, setActiveTab] = useState('orders');
  
  // Order Sub-Tabs state: 'ALL', 'UNPAID', 'PACKING', 'SHIPPED', 'COMPLETED', 'CANCELLED'
  const [orderSubTab, setOrderSubTab] = useState('ALL');

  // Profile edit states
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  
  // Become Seller states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeShopName, setUpgradeShopName] = useState('');
  const [upgradeShopCategory, setUpgradeShopCategory] = useState('Elektronik');
  
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const meRes = await api.me();
      if (!meRes.user) {
        router.push('/login');
        return;
      }
      if (meRes.user.role !== 'Buyer' && meRes.user.role !== 'Seller') {
        await showAlert('Akses Ditolak', 'Halaman ini khusus untuk akun Buyer/Seller.', 'error');
        router.push('/shop');
        return;
      }
      setProfile(meRes.user);
      setEditName(meRes.user.name || '');
      setEditAddress(meRes.user.address || '');
      setEditPhoto(meRes.user.profilePhoto || '');

      // Load all dashboard info (orders, notifications, etc.)
      const dashboard = await api.getBuyerDashboard();
      const newNotifications = dashboard.notifications || [];
      setNotifications(newNotifications);
      setOrders(dashboard.orders || []);

      // Check if we have new unread notifications
      const currentUnreadCount = newNotifications.filter(n => !n.read).length;
      if (currentUnreadCount > prevUnreadCountRef.current) {
        const unreadNotifs = newNotifications.filter(n => !n.read);
        const newestNotif = unreadNotifs[0]; // sorted newest first
        if (newestNotif && typeof window !== 'undefined' && window.Swal) {
          window.Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            icon: 'info',
            title: 'Notifikasi Baru',
            text: newestNotif.message,
            background: '#ffffff',
            color: '#191c1e',
            iconColor: '#00aa5b'
          });
        }
      }
      prevUnreadCountRef.current = currentUnreadCount;
    } catch (err) {
      setError(err.message || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
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
        profilePhoto: editPhoto,
      };
      const res = await api.updateProfile(payload);
      if (res.status === 'success') {
        await showAlert('Berhasil', 'Profil Anda berhasil diperbarui!', 'success');
        setProfile(res.user);
      }
    } catch (err) {
      await showAlert('Gagal', err.message || 'Gagal memperbarui profil.', 'error');
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

  const handleBecomeSellerSubmit = async (e) => {
    e.preventDefault();
    if (!upgradeShopName.trim()) {
      await showAlert('Error', 'Nama toko wajib diisi!', 'error');
      return;
    }
    try {
      const res = await api.becomeSeller({ 
        shopName: upgradeShopName,
        shopCategory: upgradeShopCategory 
      });
      if (res.status === 'success') {
        await showAlert('Toko Aktif!', res.message, 'success');
        setShowUpgradeModal(false);
        setUpgradeShopName('');
        loadDashboardData();
      }
    } catch (err) {
      await showAlert('Gagal', err.message || 'Gagal mengaktifkan toko.', 'error');
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.readNotifications(notificationId);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.readNotifications(null);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (transactionId) => {
    if (await showConfirm('Batalkan Pesanan', `Apakah Anda yakin ingin membatalkan pesanan #${transactionId}?`)) {
      try {
        const res = await api.cancelOrder(transactionId);
        if (res.status === 'success') {
          await showAlert('Dibatalkan', 'Pesanan berhasil dibatalkan.', 'success');
          loadDashboardData();
        }
      } catch (err) {
        await showAlert('Gagal', 'Gagal membatalkan pesanan: ' + err.message, 'error');
      }
    }
  };

  const handleCompleteOrder = async (transactionId) => {
    if (await showConfirm('Selesaikan Pesanan', 'Konfirmasi bahwa Anda telah menerima barang dan ingin menyelesaikan transaksi ini?')) {
      try {
        const res = await api.completeOrder(transactionId);
        if (res.status === 'success') {
          await showAlert('Selesai', 'Transaksi diselesaikan. Terima kasih telah berbelanja!', 'success');
          loadDashboardData();
        }
      } catch (err) {
        await showAlert('Gagal', 'Gagal menyelesaikan pesanan: ' + err.message, 'error');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showAlert('Disalin', `Kode voucher "${text}" berhasil disalin ke clipboard!`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide">Memuat data dashboard...</p>
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
          <h3 className="font-display-lg text-headline-sm font-extrabold text-on-surface mb-2">Akses Dibatasi</h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            {error.toLowerCase().includes('masuk') || error.toLowerCase().includes('session') ? 'Anda harus masuk/login terlebih dahulu untuk mengakses halaman dashboard.' : error}
          </p>
          <Link href="/login" className="w-full py-3 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-md flex justify-center items-center gap-2" style={{ backgroundColor: '#00aa5b' }}>
            <span className="material-symbols-outlined text-sm">login</span>
            Masuk ke Akun
          </Link>
        </div>
      </div>
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Filters for order tabs
  const getFilteredOrders = () => {
    switch (orderSubTab) {
      case 'UNPAID':
        return orders.filter(o => o.paymentStatus === 'UNPAID' && o.status !== 'CANCELLED');
      case 'PACKING':
        return orders.filter(o => o.paymentStatus === 'PAID' && (o.status === 'PENDING' || o.status === 'PROCESSING'));
      case 'SHIPPED':
        return orders.filter(o => o.status === 'SHIPPED');
      case 'COMPLETED':
        return orders.filter(o => o.status === 'DELIVERED');
      case 'CANCELLED':
        return orders.filter(o => o.status === 'CANCELLED');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const renderStepTracker = (status) => {
    if (status === 'CANCELLED') {
      return (
        <div className="w-full mt-3 px-3 py-2 bg-danger/5 text-danger rounded-xl text-center font-bold text-xs border border-danger/10">
          <span className="material-symbols-outlined text-xs align-middle mr-1">block</span> Transaksi Dibatalkan (Cancelled)
        </div>
      );
    }

    const steps = [
      { key: 'PENDING', label: 'Dipesan', icon: 'shopping_bag' },
      { key: 'PROCESSING', label: 'Diproses', icon: 'inventory_2' },
      { key: 'SHIPPED', label: 'Dikirim', icon: 'local_shipping' },
      { key: 'DELIVERED', label: 'Selesai', icon: 'task_alt' }
    ];

    const getStatusIndex = (stat) => {
      switch (stat) {
        case 'PENDING': return 0;
        case 'PROCESSING': return 1;
        case 'SHIPPED': return 2;
        case 'DELIVERED': return 3;
        default: return -1;
      }
    };

    const currentIndex = getStatusIndex(status);

    return (
      <div className="w-full mt-4 mb-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-outline-variant/30 rounded z-0" style={{ height: '3px' }}></div>
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#00aa5b] rounded z-0 transition-all duration-500"
            style={{ width: `${currentIndex >= 0 ? (currentIndex / 3) * 88 + 6 : 0}%`, height: '3px' }}
          ></div>

          {steps.map((step, idx) => {
            const isActive = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center flex-1">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-[#00aa5b] border-[#00aa5b] text-white scale-110 shadow-md shadow-[#00aa5b]/30' 
                      : isActive 
                        ? 'bg-[#00aa5b]/10 border-[#00aa5b] text-[#00aa5b]' 
                        : 'bg-white border-outline-variant text-on-surface-variant'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] font-bold ${isCurrent ? 'text-white-icon' : (isActive ? 'text-[#00aa5b]' : '')}`}>
                    {step.icon}
                  </span>
                </div>
                <span className={`text-[9px] mt-2 font-bold tracking-tight text-center ${isActive ? 'text-[#00aa5b]' : 'text-on-surface-variant/70'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased bg-gradient-soft">
      {/* NAVBAR */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#00aa5b]/10 shadow-[0_4px_30px_rgba(0,170,91,0.03)] h-20 flex items-center">
        <nav className="flex justify-between items-center px-lg py-sm max-w-container-max w-full mx-auto">
          <div className="flex items-center gap-sm">
            <Link href="/shop" className="flex items-center gap-2 font-display-lg text-headline-lg select-none font-bold tracking-tight hover:opacity-90 transition-opacity text-[#00aa5b]" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-outlined text-3xl font-bold align-middle" style={{ fontVariationSettings: "'FILL' 1", color: '#00aa5b' }}>shopping_cart</span>
              <span>Cartify</span>
            </Link>
          </div>
          <div className="flex items-center gap-lg">
            {profile?.role === 'Seller' ? (
              <Link href="/seller/dashboard" className="px-5 py-2 border-2 rounded-full font-bold text-sm transition-all hover:bg-[#00aa5b] hover:text-white" style={{ borderColor: '#00aa5b', color: '#00aa5b' }}>
                Beralih ke Seller
              </Link>
            ) : (
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="px-5 py-2 border-2 rounded-full font-bold text-sm transition-all hover:bg-[#00aa5b] hover:text-white bg-transparent cursor-pointer" 
                style={{ borderColor: '#00aa5b', color: '#00aa5b' }}
              >
                Buka Toko Gratis
              </button>
            )}

            <div className="h-8 w-px bg-outline-variant/60 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-content-center text-white font-bold text-md shadow-sm" style={{ backgroundColor: '#00aa5b', borderColor: 'rgba(0, 170, 91, 0.2)' }}>
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden md:inline font-bold text-sm text-on-surface">{profile?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </nav>
      </header>

      {/* BODY CONTENT */}
      <main className="max-w-container-max mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="glass-panel border border-outline-variant/35 rounded-3xl p-6 shadow-lg text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-content-center text-white font-bold text-2xl shadow-md border-3 border-white" style={{ backgroundColor: '#00aa5b' }}>
                  {profile?.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <h3 className="font-display-lg text-headline-sm font-bold text-on-surface leading-tight">{profile?.name}</h3>
              <p className="text-on-surface-variant text-xs font-semibold mb-6">Member Buyer</p>
              
              <hr className="border-outline-variant/30 my-4" />
              
              <nav className="flex flex-col gap-2">
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'edit_profile' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'edit_profile' ? '#00aa5b' : 'transparent' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('edit_profile'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'edit_profile' ? 'text-white-icon' : ''}`}>person</span>
                  Akun Saya
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'orders' ? '#00aa5b' : 'transparent' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'orders' ? 'text-white-icon' : ''}`}>receipt_long</span>
                  Pesanan Saya
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'notifications' ? '#00aa5b' : 'transparent' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('notifications'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'notifications' ? 'text-white-icon' : ''}`}>notifications</span>
                  Notifikasi
                  {unreadNotifsCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'notifications' ? 'bg-white text-emerald' : 'bg-red-500 text-white'}`} style={activeTab === 'notifications' ? {color:'#00aa5b', backgroundColor:'#fff'} : {backgroundColor:'#dc3545', color:'#fff'}}>
                      {unreadNotifsCount}
                    </span>
                  )}
                </a>
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'vouchers' ? 'text-white' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
                  style={{ backgroundColor: activeTab === 'vouchers' ? '#00aa5b' : 'transparent' }} 
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab('vouchers'); }}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === 'vouchers' ? 'text-white-icon' : ''}`}>sell</span>
                  Voucher Saya
                </a>
                <Link className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface" href="/shop">
                  <span className="material-symbols-outlined text-lg">shopping_basket</span>
                  Belanja Lagi
                </Link>
                <a className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-error hover:bg-error/5" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  <span className="material-symbols-outlined text-lg">power_settings_new</span>
                  Keluar
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Area */}
          <section className="lg:col-span-9 flex flex-col gap-gutter">
            
            {/* TAB: EDIT PROFILE / AKUN SAYA */}
            {activeTab === 'edit_profile' && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm flex flex-col gap-6">
                <div className="border-b pb-4 mb-2">
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-0">
                    <span className="material-symbols-outlined text-primary">manage_accounts</span> Pengaturan Akun Saya
                  </h3>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Kelola informasi profil Anda untuk keamanan dan kenyamanan bertransaksi</p>
                </div>
                
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                  {/* Photo Profile Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-sm w-full">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 flex items-center justify-center text-white font-bold text-3xl bg-neutral-200 shadow-md flex-shrink-0">
                      {editPhoto ? (
                        <img src={editPhoto} alt="Preview Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Foto Profil</span>
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
                        {editPhoto && (
                          <button
                            type="button"
                            onClick={() => setEditPhoto('')}
                            className="px-3 py-2 border border-danger/30 text-danger hover:bg-danger/5 rounded-xl text-xs font-bold transition-all bg-transparent cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-on-surface-variant/60 mt-1">Mendukung format PNG, JPG, JPEG.</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider block mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="w-full p-3.5 border-2 border-outline-variant/30 focus:border-primary rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all" 
                      placeholder="Nama lengkap..." 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider block mb-2">Alamat Lengkap</label>
                    <textarea 
                      value={editAddress} 
                      onChange={(e) => setEditAddress(e.target.value)} 
                      className="w-full p-3.5 border-2 border-outline-variant/30 focus:border-primary rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all" 
                      rows="4" 
                      placeholder="Alamat rumah lengkap untuk pengiriman..." 
                    />
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-primary hover:bg-[#008f4c] text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border-0"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: PESANAN SAYA */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col overflow-hidden">
                {/* Shopee-like Top Sub-tabs */}
                <div className="flex border-b overflow-x-auto text-sm font-semibold select-none bg-surface-container-low/40">
                  {[
                    { id: 'ALL', label: 'Semua' },
                    { id: 'UNPAID', label: 'Belum Bayar' },
                    { id: 'PACKING', label: 'Sedang Dikemas' },
                    { id: 'SHIPPED', label: 'Dikirim' },
                    { id: 'COMPLETED', label: 'Selesai' },
                    { id: 'CANCELLED', label: 'Dibatalkan' }
                  ].map((tab) => {
                    const isSelected = orderSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setOrderSubTab(tab.id)}
                        className={`flex-1 min-w-[100px] text-center py-3.5 border-b-2 font-bold transition-all border-transparent bg-transparent outline-none cursor-pointer ${isSelected ? 'text-[#00aa5b]' : 'text-on-surface-variant/80 hover:text-on-surface'}`}
                        style={isSelected ? { borderBottomColor: '#00aa5b' } : {}}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Orders Content */}
                <div className="p-6 flex flex-col gap-4">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 text-on-surface-variant bg-surface-container-low/10 rounded-2xl border border-dashed">
                      <span className="material-symbols-outlined text-5xl opacity-35 mb-2" style={{ color: '#00aa5b' }}>local_shipping</span>
                      <p className="text-sm">Tidak ada transaksi ditemukan untuk filter ini.</p>
                    </div>
                  ) : (
                    filteredOrders.map((o) => {
                      let badgeBg = 'rgba(128, 128, 128, 0.1)';
                      let badgeTextColor = '#555';
                      let statusText = o.status;

                      if (o.paymentStatus === 'UNPAID' && o.status !== 'CANCELLED') {
                        badgeBg = 'rgba(220, 53, 69, 0.05)';
                        badgeTextColor = '#dc3545';
                        statusText = 'Belum Bayar';
                      } else if (o.paymentStatus === 'PAID' && (o.status === 'PENDING' || o.status === 'PROCESSING')) {
                        badgeBg = 'rgba(255, 193, 7, 0.1)';
                        badgeTextColor = '#b28900';
                        statusText = 'Sedang Dikemas';
                      } else if (o.status === 'SHIPPED') {
                        badgeBg = 'rgba(0, 170, 91, 0.1)';
                        badgeTextColor = '#00aa5b';
                        statusText = 'Dikirim';
                      } else if (o.status === 'DELIVERED') {
                        badgeBg = 'rgba(0, 170, 91, 0.15)';
                        badgeTextColor = '#00aa5b';
                        statusText = 'Selesai';
                      } else if (o.status === 'CANCELLED') {
                        badgeBg = 'rgba(220, 53, 69, 0.1)';
                        badgeTextColor = '#dc3545';
                        statusText = 'Dibatalkan';
                      }

                      return (
                        <div key={o.transactionId} className="border border-outline-variant/15 rounded-2xl p-5 shadow-sm bg-white hover:border-[#00aa5b]/20 transition-all flex flex-col gap-4">
                          {/* Order Header */}
                          <div className="flex justify-between items-start flex-wrap gap-2 border-b pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-low" style={{ color: '#00aa5b' }}>
                                <span className="material-symbols-outlined">receipt_long</span>
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-on-surface mb-0.5">ID Pesanan: #{o.transactionId}</h5>
                                <p className="text-[10px] text-on-surface-variant/60">{new Date(o.createdAt).toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-uppercase" style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                              {statusText}
                            </span>
                          </div>

                          {/* Items List inside the Order */}
                          <div className="flex flex-col gap-3">
                            {o.itemList?.map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-center">
                                <img 
                                  src={resolveProductImage(item.product?.name, item.product?.category)} 
                                  alt={item.product?.name} 
                                  className="w-12 h-12 object-cover rounded-xl border" 
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-on-surface truncate mb-0.5">{item.product?.name}</p>
                                  <p className="text-xs text-on-surface-variant/70">Jumlah: {item.quantity}x @ Rp {item.product?.price?.toLocaleString('id-ID')}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Total & Controls */}
                          <div className="flex justify-between items-center flex-wrap gap-2 bg-surface-container-low/40 p-4 rounded-xl border mt-2">
                            <div>
                              <span className="text-[10px] text-on-surface-variant/70 block uppercase tracking-wider">Total Pesanan</span>
                              <span className="text-base font-extrabold" style={{ color: '#00aa5b' }}>Rp {o.totalAmount?.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                              {o.paymentStatus === 'UNPAID' && o.status === 'PENDING' && (
                                <>
                                  <Link href={`/payment?transactionId=${o.transactionId}`} className="px-4 py-2 text-white font-bold rounded-lg text-xs hover:shadow-md transition-all text-decoration-none" style={{ backgroundColor: '#00aa5b' }}>
                                    Bayar Sekarang
                                  </Link>
                                  <button onClick={() => handleCancelOrder(o.transactionId)} className="px-4 py-2 border border-danger/30 text-danger bg-transparent font-bold rounded-lg text-xs hover:bg-danger/5 transition-all cursor-pointer">
                                    Batalkan
                                  </button>
                                </>
                              )}
                              {o.status === 'SHIPPED' && (
                                <button onClick={() => handleCompleteOrder(o.transactionId)} className="px-4 py-2 text-white font-bold rounded-lg text-xs hover:shadow-md transition-all cursor-pointer" style={{ backgroundColor: '#00aa5b' }}>
                                  Selesaikan Pesanan
                                </button>
                              )}
                              {(o.status === 'DELIVERED' || o.status === 'CANCELLED') && (
                                <Link href="/shop" className="px-4 py-2 border border-[#00aa5b]/30 text-[#00aa5b] bg-transparent font-bold rounded-lg text-xs hover:bg-[#00aa5b]/5 transition-all text-decoration-none">
                                  Beli Lagi
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Visual Step Tracker */}
                          {renderStepTracker(o.status)}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: NOTIFIKASI */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b pb-3 mb-2">
                  <h3 className="text-body-lg font-bold text-on-surface flex items-center gap-2 mb-0">
                    <span className="material-symbols-outlined text-[#00aa5b]">notifications</span> Notifikasi Saya
                  </h3>
                  <button onClick={markAllNotificationsRead} className="px-3 py-1.5 rounded hover:bg-surface-container-low text-[#00aa5b] font-bold text-xs border-0 bg-transparent cursor-pointer">
                    Tandai Semua Dibaca
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant/70">
                      <span className="material-symbols-outlined text-4xl opacity-30 mb-2">notifications_off</span>
                      <p className="text-sm">Belum ada notifikasi baru.</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !n.read;
                      return (
                        <div 
                          key={n.notificationId} 
                          className="p-4 rounded-2xl flex justify-between items-center gap-3 transition-all border"
                          style={{ 
                            backgroundColor: isUnread ? 'rgba(0, 170, 91, 0.03)' : '#ffffff',
                            borderColor: isUnread ? 'rgba(0, 170, 91, 0.15)' : 'rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <div className="flex gap-3 items-start text-left">
                            <span className="material-symbols-outlined text-lg mt-0.5" style={{ color: isUnread ? '#00aa5b' : '#888' }}>
                              {isUnread ? 'mail' : 'drafts'}
                            </span>
                            <div>
                              <p className={`text-sm mb-1 leading-snug ${isUnread ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{n.message}</p>
                              <span className="text-[10px] text-on-surface-variant/50">{new Date(n.createdAt).toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                          {isUnread && (
                            <button 
                              onClick={() => markNotificationRead(n.notificationId)} 
                              className="p-1.5 rounded-full hover:bg-white text-on-surface-variant transition-all active:scale-95 border bg-transparent border-outline-variant/30 flex items-center justify-center cursor-pointer"
                              title="Tandai Dibaca"
                            >
                              <span className="material-symbols-outlined text-xs font-bold" style={{ color: '#00aa5b' }}>check</span>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: VOUCHER SAYA */}
            {activeTab === 'vouchers' && (
              <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                <h3 className="text-body-lg font-bold text-on-surface flex items-center gap-2 border-b pb-3 mb-2">
                  <span className="material-symbols-outlined" style={{ color: '#00aa5b' }}>sell</span> Voucher Saya
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { code: 'FREESHIP', name: 'Gratis Ongkos Kirim', desc: 'Potongan biaya pengiriman sampai dengan Rp15.000', expiry: '31 Des 2026', color: '#00aa5b' },
                    { code: 'DISC10', name: 'Diskon Belanja 10%', desc: 'Potongan harga belanja sebesar 10% dari subtotal', expiry: '31 Des 2026', color: '#e07a5f' },
                    { code: 'CARTIFYNEW', name: 'Potongan Spesial Rp50.000', desc: 'Potongan datar Rp50.000 tanpa batas minimum belanja', expiry: '30 Sep 2026', color: '#3d5a80' }
                  ].map((v) => (
                    <div key={v.code} className="border rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all bg-white relative">
                      {/* Left color bar representation of coupon */}
                      <div className="w-4 flex-shrink-0" style={{ backgroundColor: v.color }}></div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-0.5 text-[9px] font-bold text-white rounded uppercase tracking-wider" style={{ backgroundColor: v.color }}>
                              Voucher
                            </span>
                            <span className="text-[10px] text-on-surface-variant/50">S.d {v.expiry}</span>
                          </div>
                          <h4 className="font-bold text-base mb-1 text-on-surface">{v.name}</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed mb-3">{v.desc}</p>
                        </div>
                        <div className="flex justify-between items-center bg-surface-container-low/50 p-2 rounded-xl border">
                          <span className="font-extrabold text-sm uppercase" style={{ color: v.color }}>{v.code}</span>
                          <button 
                            onClick={() => copyToClipboard(v.code)} 
                            className="px-3 py-1 bg-transparent hover:bg-surface-container-low rounded-lg text-xs font-bold transition-all border border-outline-variant cursor-pointer"
                          >
                            Salin Kode
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </section>
        </div>
      </main>

      {/* UPGRADE SELLER MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-2xl max-w-md w-full relative animate-fade-in-up">
            <h3 className="font-display-lg text-headline-sm font-extrabold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ color: '#00aa5b' }}>store</span> Buka Toko Sekarang
            </h3>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              Mulai jualan produk Anda di Cartify. Masukkan nama toko Anda untuk mengaktifkan akun seller Anda secara gratis!
            </p>
            <form onSubmit={handleBecomeSellerSubmit} className="flex flex-col gap-4">
              <div>
                <label className="form-label fw-semibold small text-muted">Nama Toko</label>
                <input 
                  type="text" 
                  value={upgradeShopName} 
                  onChange={(e) => setUpgradeShopName(e.target.value)} 
                  className="form-control form-control-custom" 
                  placeholder="Contoh: Toko Berkah Jaya" 
                  required 
                />
              </div>
              <div>
                <label className="form-label fw-semibold small text-muted">Kategori Utama Toko</label>
                <select 
                  value={upgradeShopCategory} 
                  onChange={(e) => setUpgradeShopCategory(e.target.value)} 
                  className="form-select form-control-custom" 
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ced4da' }}
                  required
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Makanan">Makanan</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="flex-1 py-3 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-md" style={{ backgroundColor: '#00aa5b' }}>
                  Aktifkan Toko
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowUpgradeModal(false); setUpgradeShopName(''); }} 
                  className="px-5 py-3 rounded-2xl border border-outline-variant font-bold text-sm hover:bg-surface-container-low transition-all bg-transparent cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
