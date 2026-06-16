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
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Editing product states
  const [editingProduct, setEditingProduct] = useState(null); // stores product object when editing
  const [editProdNama, setEditProdNama] = useState('');
  const [editProdHarga, setEditProdHarga] = useState('');
  const [editProdStok, setEditProdStok] = useState('');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdImageUrl, setEditProdImageUrl] = useState('');
  const [editProdInfoKhusus, setEditProdInfoKhusus] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Profile edit states
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'add_product', 'orders', 'notifications', 'edit_profile'
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAddresses, setEditAddresses] = useState([]);
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
      setEditEmail(userRes.user.email || '');
      setEditAddresses(userRes.user.addresses || (userRes.user.address ? [userRes.user.address] : []));
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
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();
    const trimmedPassword = editPassword.trim();
    const trimmedShopName = editShopName.trim();

    if (!trimmedName) {
      await showAlert('Gagal', 'Nama lengkap tidak boleh kosong!', 'error');
      return;
    }
    if (trimmedName.length > 50) {
      await showAlert('Gagal', 'Nama lengkap maksimal 50 karakter!', 'error');
      return;
    }
    if (!/^[a-zA-Z\s'.,]+$/.test(trimmedName)) {
      await showAlert('Gagal', 'Nama lengkap hanya boleh mengandung huruf, spasi, titik, koma, dan petik tunggal!', 'error');
      return;
    }

    if (!trimmedEmail) {
      await showAlert('Gagal', 'Email tidak boleh kosong!', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/.test(trimmedEmail)) {
      await showAlert('Gagal', 'Format email tidak valid!', 'error');
      return;
    }

    if (trimmedPassword) {
      if (trimmedPassword.length < 8 || trimmedPassword.length > 32) {
        await showAlert('Gagal', 'Password harus terdiri dari 8 hingga 32 karakter!', 'error');
        return;
      }
      const hasUpper = /[A-Z]/.test(trimmedPassword);
      const hasLower = /[a-z]/.test(trimmedPassword);
      const hasDigit = /[0-9]/.test(trimmedPassword);
      const hasSpecial = /[@$!%*?&_\-+=*#\/.]/.test(trimmedPassword);
      if (!(hasUpper && hasLower && hasDigit && hasSpecial)) {
        await showAlert('Gagal', 'Password harus mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter spesial!', 'error');
        return;
      }
    }

    const cleanAddresses = editAddresses.map(addr => (addr || '').trim()).filter(addr => addr.length > 0);
    for (const addr of cleanAddresses) {
      if (addr.length > 200) {
        await showAlert('Gagal', 'Setiap alamat maksimal 200 karakter!', 'error');
        return;
      }
      if (/[<>]|javascript:|onclick|onerror|onload|<script/i.test(addr)) {
        await showAlert('Gagal', 'Alamat tidak boleh mengandung karakter HTML/JS berbahaya!', 'error');
        return;
      }
    }

    if (!trimmedShopName) {
      await showAlert('Gagal', 'Nama toko tidak boleh kosong!', 'error');
      return;
    }
    if (trimmedShopName.length > 50) {
      await showAlert('Gagal', 'Nama toko maksimal 50 karakter!', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9\s'.,&-]+$/.test(trimmedShopName)) {
      await showAlert('Gagal', 'Nama toko mengandung karakter tidak valid!', 'error');
      return;
    }

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword || undefined,
        addresses: cleanAddresses,
        shopName: trimmedShopName,
        profilePhoto: editPhoto,
      };
      const res = await api.updateProfile(payload);
      if (res.status === 'success') {
        await showAlert('Berhasil', 'Profil Toko Anda berhasil diperbarui!', 'success');
        setProfile(res.user);
        setEditPassword('');
        setActiveTab('dashboard');
      }
    } catch (err) {
      await showAlert('Gagal', err.message || 'Gagal memperbarui profil toko.', 'error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showAlert('Gagal', 'Ukuran file terlalu besar (maksimal 10MB)!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setEditPhoto(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };


  const handleAddProduct = async (e) => {
    e.preventDefault();
    const trimmedId = prodId.trim();
    const trimmedNama = prodNama.trim();
    const trimmedKategori = prodKategori.trim();

    if (!trimmedId) {
      await showAlert('Gagal', 'ID Produk wajib diisi!', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(trimmedId)) {
      await showAlert('Gagal', 'ID Produk hanya boleh berisi huruf, angka, dan strip (-)!', 'error');
      return;
    }
    if (!trimmedNama) {
      await showAlert('Gagal', 'Nama produk wajib diisi!', 'error');
      return;
    }
    if (trimmedNama.length > 100) {
      await showAlert('Gagal', 'Nama produk maksimal 100 karakter!', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9\s'.,&\(\)/#-]+$/.test(trimmedNama)) {
      await showAlert('Gagal', 'Nama produk mengandung karakter tidak valid!', 'error');
      return;
    }
    if (!trimmedKategori) {
      await showAlert('Gagal', 'Kategori produk wajib diisi!', 'error');
      return;
    }

    const parsedHarga = parseFloat(prodHarga);
    if (isNaN(parsedHarga) || parsedHarga <= 0 || parsedHarga > 999999999) {
      await showAlert('Gagal', 'Harga produk harus di antara Rp1 dan Rp999.999.999!', 'error');
      return;
    }

    const parsedStok = parseInt(prodStok);
    if (isNaN(parsedStok) || parsedStok < 0 || parsedStok > 1000000) {
      await showAlert('Gagal', 'Stok produk harus di antara 0 dan 1.000.000!', 'error');
      return;
    }

    try {
      const payload = {
        id: trimmedId,
        nama: trimmedNama,
        kategori: trimmedKategori,
        harga: parsedHarga,
        stok: parsedStok,
        description: prodDescription || 'Produk berkualitas dari toko kami.',
        imageUrl: prodImageUrl || '',
      };

      // Map dynamic properties based on category
      if (trimmedKategori === 'Elektronik') {
        payload.brand = 'Generic';
        payload.warrantyMonths = parseInt(prodInfoKhusus) || 12;
      } else if (trimmedKategori === 'Makanan') {
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
        setProdDescription('');
        setProdImageUrl('');
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

  const handleSelectEditProduct = (p) => {
    setEditingProduct(p);
    setEditProdNama(p.name || '');
    setEditProdHarga(p.price?.toString() || '');
    setEditProdStok(p.stock?.toString() || '');
    setEditProdDescription(p.description || '');
    setEditProdImageUrl(p.imageUrl || '');
    
    // Map info khusus based on category
    if (p.category === 'Elektronik') {
      setEditProdInfoKhusus(p.warrantyMonths?.toString() || '12');
    } else if (p.category === 'Makanan') {
      setEditProdInfoKhusus(p.expiryDate || '2026-12-31');
    } else {
      setEditProdInfoKhusus(p.size || 'M');
    }
    setActiveTab('edit_product');
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const trimmedNama = editProdNama.trim();
    if (!trimmedNama) {
      await showAlert('Gagal', 'Nama produk wajib diisi!', 'error');
      return;
    }
    if (trimmedNama.length > 100) {
      await showAlert('Gagal', 'Nama produk maksimal 100 karakter!', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9\s'.,&\(\)/#-]+$/.test(trimmedNama)) {
      await showAlert('Gagal', 'Nama produk mengandung karakter tidak valid!', 'error');
      return;
    }

    const parsedHarga = parseFloat(editProdHarga);
    if (isNaN(parsedHarga) || parsedHarga <= 0 || parsedHarga > 999999999) {
      await showAlert('Gagal', 'Harga produk harus di antara Rp1 dan Rp999.999.999!', 'error');
      return;
    }

    const parsedStok = parseInt(editProdStok);
    if (isNaN(parsedStok) || parsedStok < 0 || parsedStok > 1000000) {
      await showAlert('Gagal', 'Stok produk harus di antara 0 dan 1.000.000!', 'error');
      return;
    }

    try {
      const payload = {
        id: editingProduct.productId,
        nama: trimmedNama,
        harga: parsedHarga,
        stok: parsedStok,
        description: editProdDescription || 'Produk berkualitas dari toko kami.',
        imageUrl: editProdImageUrl || '',
      };

      if (editingProduct.category === 'Elektronik') {
        payload.brand = editingProduct.brand || 'Generic';
        payload.warrantyMonths = parseInt(editProdInfoKhusus) || 12;
      } else if (editingProduct.category === 'Makanan') {
        payload.expiryDate = editProdInfoKhusus || '2026-12-31';
        payload.weightGram = editingProduct.weightGram || 100.0;
      } else {
        payload.size = editProdInfoKhusus || 'M';
        payload.material = editingProduct.material || 'Cotton';
        payload.color = editingProduct.color || 'Hitam';
      }

      const res = await api.updateProduct(payload);
      if (res.status === 'success') {
        await showAlert('Berhasil', 'Produk berhasil diperbarui!', 'success');
        setEditingProduct(null);
        setActiveTab('products');
        loadSellerData();
      } else {
        await showAlert('Gagal', 'Gagal memperbarui produk', 'error');
      }
    } catch (err) {
      await showAlert('Gagal', 'Error memperbarui produk: ' + err.message, 'error');
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
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center text-white font-bold text-md shadow-sm" style={{ backgroundColor: '#00aa5b', borderColor: 'rgba(0, 170, 91, 0.2)' }}>
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
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-2xl shadow-md border-3 border-white" style={{ backgroundColor: '#00aa5b' }}>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Akun</label>
                      <input 
                        type="email" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)} 
                        className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold" 
                        placeholder="Email..." 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password Baru</label>
                      <input 
                        type="password" 
                        value={editPassword} 
                        onChange={(e) => setEditPassword(e.target.value)} 
                        className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold" 
                        placeholder="Kosongkan jika tidak diganti..." 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Daftar Alamat Toko / Pengiriman</label>
                      <button
                        type="button"
                        onClick={() => setEditAddresses([...editAddresses, ''])}
                        className="px-3 py-1.5 border border-[#00aa5b] text-[#00aa5b] hover:bg-[#00aa5b]/5 rounded-xl font-bold text-xs transition-all cursor-pointer bg-transparent"
                      >
                        + Tambah Alamat
                      </button>
                    </div>
                    {editAddresses.length === 0 ? (
                      <p className="text-xs text-on-surface-variant/60 italic p-3 bg-surface-container-low rounded-xl">Belum ada alamat. Silakan tambah alamat baru.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {editAddresses.map((addr, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-surface-container-low/50 p-3 rounded-2xl border border-outline-variant/10">
                            <span className="text-xs font-bold text-on-surface-variant/60 w-8 text-center bg-outline-variant/20 py-1 rounded-lg shrink-0">
                              #{idx + 1}
                            </span>
                            <input 
                              type="text"
                              value={addr}
                              onChange={(e) => {
                                const nextList = [...editAddresses];
                                nextList[idx] = e.target.value;
                                setEditAddresses(nextList);
                              }}
                              className="flex-1 p-2.5 border-2 border-outline-variant/20 focus:border-primary rounded-xl outline-none text-sm transition-all bg-white"
                              placeholder={`Alamat Toko Ke-${idx + 1}...`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextList = editAddresses.filter((_, i) => i !== idx);
                                setEditAddresses(nextList);
                              }}
                              className="p-2 border border-danger/30 text-danger hover:bg-danger/5 rounded-xl transition-all cursor-pointer bg-transparent flex items-center justify-center"
                              title="Hapus Alamat"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleSelectEditProduct(p)}
                                  className="w-8 h-8 rounded-full border border-blue-200 text-blue-500 hover:bg-blue-50 flex items-center justify-content-center transition-all bg-transparent cursor-pointer"
                                  title="Edit"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.productId)}
                                  className="w-8 h-8 rounded-full border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-content-center transition-all bg-transparent cursor-pointer"
                                  title="Hapus"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
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
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm w-full">
                <div className="border-b pb-4 mb-6">
                  <h5 className="font-display-lg text-headline-sm font-bold text-on-surface mb-0 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00aa5b]">add_circle</span> Tambah Produk Baru
                  </h5>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Masukkan data lengkap untuk mulai memajang produk baru di Cartify</p>
                </div>

                <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
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
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Deskripsi Produk</label>
                        <textarea
                          className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold h-[116px] resize-none"
                          placeholder="Masukkan deskripsi produk..."
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">URL Gambar Produk</label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                          placeholder="Masukkan URL gambar produk (opsional)..."
                          value={prodImageUrl}
                          onChange={(e) => setProdImageUrl(e.target.value)}
                        />
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
                    </div>
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

            {activeTab === 'edit_product' && editingProduct && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/15 shadow-sm w-full">
                <div className="border-b pb-4 mb-6">
                  <h5 className="font-display-lg text-headline-sm font-bold text-on-surface mb-0 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00aa5b]">edit</span> Edit Produk
                  </h5>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Ubah data produk Anda di bawah ini</p>
                </div>

                <form onSubmit={handleEditProduct} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">ID Produk</label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-outline-variant/60 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed animate-none"
                          value={editingProduct.productId}
                          disabled
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Produk</label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                          placeholder="Nama barang..."
                          value={editProdNama}
                          onChange={(e) => setEditProdNama(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kategori</label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-outline-variant/60 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed animate-none"
                          value={editingProduct.category}
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Harga (Rupiah)</label>
                          <input
                            type="number"
                            className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                            placeholder="100000"
                            value={editProdHarga}
                            onChange={(e) => setEditProdHarga(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Stok</label>
                          <input
                            type="number"
                            className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                            placeholder="10"
                            value={editProdStok}
                            onChange={(e) => setEditProdStok(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Deskripsi Produk</label>
                        <textarea
                          className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold h-[116px] resize-none"
                          placeholder="Masukkan deskripsi lengkap produk..."
                          value={editProdDescription}
                          onChange={(e) => setEditProdDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">URL Gambar Produk</label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                          placeholder="Masukkan URL gambar produk (opsional)..."
                          value={editProdImageUrl}
                          onChange={(e) => setEditProdImageUrl(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          {editingProduct.category === 'Elektronik' ? 'Garansi (Bulan)' : editingProduct.category === 'Makanan' ? 'Tanggal Kadaluarsa' : 'Ukuran'}
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-outline-variant/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all text-sm font-semibold"
                          placeholder={editingProduct.category === 'Elektronik' ? 'Contoh: 12' : editingProduct.category === 'Makanan' ? 'YYYY-MM-DD' : 'Contoh: S, M, L'}
                          value={editProdInfoKhusus}
                          onChange={(e) => setEditProdInfoKhusus(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="submit" className="px-6 py-3 bg-[#00aa5b] hover:bg-[#008f4c] text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 w-full cursor-pointer">
                      Simpan Perubahan
                    </button>
                    <button type="button" onClick={() => { setEditingProduct(null); setActiveTab('products'); }} className="px-6 py-3 border border-outline-variant/60 hover:bg-surface-container text-on-surface font-bold text-sm rounded-2xl transition-all w-full bg-transparent">
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
