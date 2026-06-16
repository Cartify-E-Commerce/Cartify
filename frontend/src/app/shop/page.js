'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, showAlert, showConfirm } from '../api';

export function getProductImage(name = '', category = '') {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  
  // Electronics
  if (n.includes('loq')) {
    return '/loq.png';
  }
  if (n.includes('poco')) {
    return '/pocof9.png';
  }
  if (n.includes('zenbook') || n.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('keychron') || n.includes('keyboard')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('master') || n.includes('mouse')) {
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('monitor')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('sony') || n.includes('headphone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('galaxy') || n.includes('phone') || n.includes('hp')) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('watch') || n.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('brio') || n.includes('webcam') || n.includes('camera')) {
    return 'https://images.unsplash.com/photo-1603539943427-b0882e3c8b41?auto=format&fit=crop&w=600&q=80';
  }

  // Fashion
  if (n.includes('kaos') || n.includes('t-shirt') || n.includes('tshirt')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('jaket') || n.includes('denim')) {
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('hoodie')) {
    return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('chino') || n.includes('celana')) {
    return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('dress')) {
    return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('sneakers') || n.includes('sepatu')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('topi') || n.includes('baseball')) {
    return 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('kemeja') || n.includes('flanel')) {
    return 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80';
  }

  // Food
  if (n.includes('kripik') || n.includes('singkong')) {
    return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('roti') || n.includes('gandum') || n.includes('sourdough')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('cokelat') || n.includes('chocolate') || n.includes('truffle')) {
    return 'https://images.unsplash.com/photo-1548907040-4d42b52125e1?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('kopi') || n.includes('coffee') || n.includes('gayo')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('cookies') || n.includes('cookie')) {
    return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('madu') || n.includes('honey')) {
    return 'https://images.unsplash.com/photo-1587049352846-4a222e784d3e?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('selai') || n.includes('butter') || n.includes('peanut')) {
    return 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('teh') || n.includes('matcha') || n.includes('green tea')) {
    return 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80';
  }

  // Fallbacks by Category
  if (c.includes('elektronik') || c.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80';
  }
  if (c.includes('makanan') || c.includes('roti')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  }
  if (c.includes('pakaian') || c.includes('baju') || c.includes('jaket')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80';
}

function CatalogContent() {
  const [products, setProducts] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('Guest');
  const [userName, setUserName] = useState('');
  
  // Cart Offcanvas State
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);

  const loadShops = async (kategori = '') => {
    try {
      const data = await api.getShops(kategori);
      setShops(data);
    } catch (err) {
      console.error('Failed to load shops', err);
    }
  };

  const handleOpenShopDetail = async (shopId) => {
    setShopLoading(true);
    setShowShopModal(true);
    try {
      const data = await api.getShopDetail(shopId);
      setSelectedShop(data);
    } catch (err) {
      await showAlert('Gagal', 'Gagal memuat detail toko: ' + err.message, 'error');
      setShowShopModal(false);
    } finally {
      setShopLoading(false);
    }
  };

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  const router = useRouter();

  // Load products & session summary
  useEffect(() => {
    loadProducts(selectedKategori, activeSearch);
    loadShops(selectedKategori);
  }, [selectedKategori, activeSearch]);

  useEffect(() => {
    updateDashboardSummary();
    const interval = setInterval(updateDashboardSummary, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async (kategori = '', search = '') => {
    try {
      const data = await api.getProducts(kategori, search);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const updateDashboardSummary = async () => {
    try {
      const userRes = await api.me();
      if (userRes.user) {
        setIsLoggedIn(true);
        setUserRole(userRes.user.role);
        setUserName(userRes.user.name);
        
        if (userRes.user.role === 'Buyer') {
          const dashboardData = await api.getBuyerDashboard();
          setCartCount(dashboardData.cartCount || 0);
          setCartItems(dashboardData.cartItems || []);
          setCartTotal(dashboardData.cartTotal || 0);
          
          const allNotifs = dashboardData.notifications || [];
          setNotifications(allNotifs);
          const unreadNotifs = allNotifs.filter(n => !n.read).length;
          setUnreadNotifications(unreadNotifs);
        } else if (userRes.user.role === 'Seller') {
          const sellerDashboard = await api.getSellerDashboard();
          setNotifications(sellerDashboard.notifications || []);
          setUnreadNotifications(sellerDashboard.unreadNotifications || 0);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole('Guest');
        setUserName('');
        setNotifications([]);
        setUnreadNotifications(0);
      }
    } catch (e) {
      setIsLoggedIn(false);
      setUserRole('Guest');
      setUserName('');
      setNotifications([]);
      setUnreadNotifications(0);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchKeyword);
  };

  const handleLogout = async () => {
    if (await showConfirm('Keluar Akun', 'Apakah Anda yakin ingin keluar akun?')) {
      try {
        await api.logout();
        await showAlert('Keluar', 'Anda telah keluar.', 'success');
        updateDashboardSummary();
        router.push('/login');
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  const markNotificationRead = async (notificationId) => {
    try {
      await api.readNotifications(notificationId);
      updateDashboardSummary();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.readNotifications(null);
      updateDashboardSummary();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenProductDetail = async (productId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const detail = await api.getProductDetail(productId);
      setSelectedProduct(detail);
    } catch (err) {
      await showAlert('Gagal', 'Gagal memuat detail produk: ' + err.message, 'error');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) {
      await showAlert('Peringatan', 'Harap masuk/login terlebih dahulu sebelum berbelanja!', 'warning');
      router.push('/login');
      return;
    }
    try {
      const res = await api.addToCart(productId);
      if (res.status === 'success') {
        updateDashboardSummary();
        setShowCart(true);
      } else {
        await showAlert('Info', res.message, 'info');
      }
    } catch (err) {
      await showAlert('Gagal', 'Gagal menambahkan ke keranjang: ' + err.message, 'error');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await api.removeFromCart(productId);
      updateDashboardSummary();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = () => {
    setShowCart(false);
    router.push('/checkout');
  };

  // Auto slide carousel
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  const slideImages = [
    {
      url: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?auto=format&fit=crop&w=1200&q=80',
      title: 'Teknologi & Inovasi Modern',
      desc: 'Dapatkan laptop, gadget, dan mechanical keyboard berkelas premium dengan penawaran eksklusif.',
    },
    {
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      title: 'Tren Casual & Fashionable',
      desc: 'Pakaian pilihan berbahan katun kombed premium untuk penampilan elegan harian Anda.',
    },
    {
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      title: 'Cita Rasa Kuliner Segar',
      desc: 'Manjakan diri Anda dengan cemilan serta bahan makanan segar berkualitas tinggi pilihan koki.',
    }
  ];

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased bg-gradient-soft">
      {/* NAVBAR */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#00aa5b]/10 shadow-[0_4px_30px_rgba(0,170,91,0.03)]" style={{ borderBottomColor: 'rgba(0, 170, 91, 0.1)' }}>
        <nav className="flex justify-between items-center px-lg py-sm max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-sm">
            <Link href="/shop" className="flex items-center gap-2 font-display-lg text-headline-lg select-none font-bold tracking-tight hover:opacity-90 transition-opacity text-[#00aa5b]" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-outlined text-3xl font-bold align-middle" style={{ fontVariationSettings: "'FILL' 1", color: '#00aa5b' }}>shopping_cart</span>
              <span>Cartify</span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md ml-xl relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#00aa5b' }}>search</span>
            <input
              className="w-full pl-12 pr-4 py-2.5 rounded-full border-2 border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] transition-all outline-none"
              placeholder="Cari laptop, baju casual, makanan lezat..."
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ focusBorderColor: '#00aa5b' }}
            />
          </form>

          {/* Navigation and Profile info */}
          <div className="flex items-center gap-lg">
            
            <div className="flex items-center gap-sm">
              <button onClick={() => setShowCart(true)} className="p-2 text-on-surface transition-all active:scale-90 relative">
                <span className="material-symbols-outlined text-2xl" style={{ color: '#00aa5b' }}>shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 px-2 py-0.5 text-xs font-bold text-white rounded-full scale-90 shadow-[0_2px_8px_rgba(0,170,91,0.3)] animate-pulse" style={{ backgroundColor: '#00aa5b' }}>
                    {cartCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)} 
                  className="relative p-2 rounded-full hover:bg-surface-container-low transition-all text-on-surface flex items-center justify-center border-0 bg-transparent active:scale-95 cursor-pointer"
                  title="Notifikasi"
                >
                  <span className="material-symbols-outlined text-2xl" style={{ color: '#00aa5b' }}>notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-danger text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center animate-pulse" style={{ backgroundColor: '#dc3545', color: '#fff' }}>
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Floating Dropdown */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant/20 py-3 z-[100] animate-fade-in-down" style={{ position: 'absolute', top: '100%', right: 0 }}>
                    <div className="flex justify-between items-center px-4 pb-2 border-b">
                      <h5 className="font-bold text-sm text-on-surface mb-0">Notifikasi</h5>
                      <button onClick={markAllNotificationsRead} className="px-2 py-1 rounded hover:bg-surface-container-low text-[#00aa5b] font-bold text-xs border-0 bg-transparent cursor-pointer">
                        Tandai Semua Dibaca
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto mt-2 px-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-on-surface-variant/70">
                          <span className="material-symbols-outlined text-3xl opacity-30 mb-1">notifications_off</span>
                          <p className="text-xs">Belum ada notifikasi baru.</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const isUnread = !n.read;
                          return (
                            <div 
                              key={n.notificationId} 
                              className="p-3 rounded-xl mb-1 flex justify-between items-center gap-2 transition-all hover:bg-surface-container-low"
                              style={{ 
                                backgroundColor: isUnread ? 'rgba(0, 170, 91, 0.03)' : '#ffffff',
                                border: isUnread ? '1px solid rgba(0, 170, 91, 0.15)' : '1px solid transparent'
                              }}
                            >
                              <div className="flex gap-2 items-start">
                                <span className={`material-symbols-outlined text-md mt-0.5 ${isUnread ? 'text-emerald' : ''}`} style={{ color: isUnread ? '#00aa5b' : '#888' }}>
                                  {isUnread ? 'mail' : 'drafts'}
                                </span>
                                <div className="text-left">
                                  <p className={`text-xs mb-0.5 leading-snug ${isUnread ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{n.message}</p>
                                  <span className="text-[9px] text-on-surface-variant/50">{new Date(n.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>
                              {isUnread && (
                                <button 
                                  onClick={() => markNotificationRead(n.notificationId)} 
                                  className="p-1 rounded-full hover:bg-white text-on-surface-variant transition-all active:scale-95 border bg-transparent border-outline-variant/30 flex items-center justify-center cursor-pointer"
                                  title="Tandai Dibaca"
                                >
                                  <span className="material-symbols-outlined text-[10px] font-bold" style={{ color: '#00aa5b' }}>check</span>
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
  
              <div className="h-8 w-px bg-outline-variant/60 mx-2"></div>
  
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link href={userRole === 'Seller' ? '/seller/dashboard' : userRole === 'Admin' ? '/admin' : '/buyer/dashboard'} className="flex items-center gap-2 hover:opacity-85 transition-all" style={{ textDecoration: 'none' }}>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: '#00aa5b', borderColor: 'rgba(0, 170, 91, 0.2)' }}>
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:inline font-bold text-sm text-on-surface align-middle">{userName ? userName.split(' ')[0] : 'User'}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-1 hover:opacity-85 active:scale-95 transition-all bg-transparent border-0 flex items-center justify-center cursor-pointer">
                    <span className="material-symbols-outlined text-2xl" style={{ color: '#00aa5b' }}>power_settings_new</span>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="px-6 py-2.5 text-on-primary rounded-full font-bold shadow-[0_4px_12px_rgba(0,170,91,0.25)] hover:shadow-[0_6px_18px_rgba(0,170,91,0.35)] active:scale-95 transition-all" style={{ backgroundColor: '#00aa5b' }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* BODY CONTENT */}
      <main className="max-w-container-max mx-auto px-lg">
        {/* Banner Carousel */}
        <section className="mt-lg">
          <div className="relative w-full aspect-[21/9] md:aspect-[2.5/1] overflow-hidden rounded-3xl shadow-2xl bg-surface-container-high border" style={{ borderColor: 'rgba(0, 170, 91, 0.1)' }}>
            <img className="absolute inset-0 w-full h-full object-cover transition-all duration-1000" alt="Banner slide" src={slideImages[currentSlide].url} />
            <div className="absolute inset-0 bg-black/50 z-0"></div>
            <div className="relative h-full flex flex-col justify-center items-start px-xxxl max-w-2xl z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-xs mb-md border border-white/20 tracking-wider">OFFICIAL RETAIL</span>
              <h1 className="font-display-lg text-display-lg text-white font-extrabold tracking-tight mb-md leading-none">{slideImages[currentSlide].title}</h1>
              <p className="font-body-lg text-body-lg text-white/90 mb-xl leading-relaxed">{slideImages[currentSlide].desc}</p>
              <div className="flex gap-md">
                <button onClick={() => setSelectedKategori('')} className="px-xl py-md text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#00aa5b]/30 active:scale-95 transition-all" style={{ backgroundColor: '#00aa5b' }}>Belanja Sekarang</button>
              </div>
            </div>
            
            {/* Carousel dots indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {slideImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-10' : 'w-3 bg-outline-variant/60'}`}
                  style={index === currentSlide ? { backgroundColor: '#00aa5b' } : {}}
                ></button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories section */}
        <section className="mt-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Kategori Pilihan</h2>
            <div className="flex items-center justify-center gap-10 md:gap-16 pb-2">
              {/* Elektronik */}
              <div 
                onClick={() => { setSelectedKategori('Elektronik'); setActiveSearch(''); }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    selectedKategori === 'Elektronik' 
                      ? 'bg-[#00aa5b] shadow-md shadow-[#00aa5b]/20 scale-105' 
                      : 'bg-[#00aa5b]/10 hover:bg-[#00aa5b]/20'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl font-semibold transition-colors ${
                    selectedKategori === 'Elektronik' ? 'text-white-icon' : 'text-[#00aa5b]'
                  }`}>laptop</span>
                </div>
                <span className={`text-xs font-semibold transition-colors ${
                  selectedKategori === 'Elektronik' ? 'text-[#00aa5b]' : 'text-gray-700 group-hover:text-[#00aa5b]'
                }`}>
                  Elektronik
                </span>
              </div>

              {/* Pakaian */}
              <div 
                onClick={() => { setSelectedKategori('Pakaian'); setActiveSearch(''); }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    selectedKategori === 'Pakaian' 
                      ? 'bg-[#00aa5b] shadow-md shadow-[#00aa5b]/20 scale-105' 
                      : 'bg-[#00aa5b]/10 hover:bg-[#00aa5b]/20'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl font-semibold transition-colors ${
                    selectedKategori === 'Pakaian' ? 'text-white-icon' : 'text-[#00aa5b]'
                  }`}>checkroom</span>
                </div>
                <span className={`text-xs font-semibold transition-colors ${
                  selectedKategori === 'Pakaian' ? 'text-[#00aa5b]' : 'text-gray-700 group-hover:text-[#00aa5b]'
                }`}>
                  Pakaian
                </span>
              </div>

              {/* Makanan */}
              <div 
                onClick={() => { setSelectedKategori('Makanan'); setActiveSearch(''); }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    selectedKategori === 'Makanan' 
                      ? 'bg-[#00aa5b] shadow-md shadow-[#00aa5b]/20 scale-105' 
                      : 'bg-[#00aa5b]/10 hover:bg-[#00aa5b]/20'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl font-semibold transition-colors ${
                    selectedKategori === 'Makanan' ? 'text-white-icon' : 'text-[#00aa5b]'
                  }`}>lunch_dining</span>
                </div>
                <span className={`text-xs font-semibold transition-colors ${
                  selectedKategori === 'Makanan' ? 'text-[#00aa5b]' : 'text-gray-700 group-hover:text-[#00aa5b]'
                }`}>
                  Makanan
                </span>
              </div>

              {/* Semua Kategori */}
              <div 
                onClick={() => { setSelectedKategori(''); setActiveSearch(''); }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    !selectedKategori && !activeSearch
                      ? 'bg-[#00aa5b] shadow-md shadow-[#00aa5b]/20 scale-105' 
                      : 'bg-[#00aa5b]/10 hover:bg-[#00aa5b]/20'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl font-semibold transition-colors ${
                    !selectedKategori && !activeSearch ? 'text-white-icon' : 'text-[#00aa5b]'
                  }`}>more_horiz</span>
                </div>
                <span className={`text-xs font-semibold transition-colors ${
                  !selectedKategori && !activeSearch ? 'text-[#00aa5b]' : 'text-gray-700 group-hover:text-[#00aa5b]'
                }`}>
                  Semua Kategori
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid section */}
        <section className="mt-xxxl mb-xxxl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {activeSearch ? `Hasil Pencarian: "${activeSearch}"` : selectedKategori ? selectedKategori : 'Rekomendasi Untukmu'}
              </h2>
              <p className="text-on-surface-variant text-sm">Produk-produk berkualitas tinggi terverifikasi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-16 text-on-surface-variant bg-white rounded-3xl border border-outline-variant/20 shadow-sm">
                <span className="material-symbols-outlined text-6xl opacity-35 mb-3 d-block" style={{ color: '#00aa5b' }}>folder_open</span>
                Tidak ada produk ditemukan.
              </div>
            ) : (
              products.map((p) => {
                const imgClass = getProductImage(p.name, p.category);

                return (
                  <Link key={p.productId} href={`/product?productId=${p.productId}`} className="group bg-white rounded-3xl overflow-hidden shadow-md premium-hover-glow cursor-pointer border border-outline-variant/10 flex flex-col text-decoration-none text-inherit">
                    <div className="aspect-square bg-surface-container-low overflow-hidden relative">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} src={imgClass} />
                      {p.averageRating && (
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-warning fill-1">star</span>
                          {p.averageRating?.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-lg flex-grow flex flex-col bg-white">
                      <p className="font-bold text-xs mb-1 uppercase tracking-wider" style={{ color: '#00aa5b' }}>{p.category}</p>
                      <h3 className="text-body-lg font-bold text-on-surface mb-2 line-clamp-1 hover:text-[#00aa5b] transition-colors">{p.name}</h3>
                      <p className="text-on-surface-variant text-xs line-clamp-2 mb-md leading-relaxed">{p.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-outline-variant/20">
                        <span className="font-display-lg text-headline-md font-extrabold" style={{ color: '#00aa5b' }}>Rp {p.price?.toLocaleString('id-ID')}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(p.productId);
                          }}
                          className="w-10 h-10 rounded-full hover:bg-[#00aa5b] hover:text-white active:scale-90 transition-all flex items-center justify-center shadow-sm"
                          style={{ color: '#00aa5b', backgroundColor: 'rgba(0, 170, 91, 0.1)' }}
                        >
                          <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Shops section */}
        <section className="mt-12 mb-16">
          <div className="flex flex-col mb-6">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Toko Pilihan Untukmu</h2>
            <p className="text-on-surface-variant text-sm">Temukan toko-toko terpercaya dengan produk terbaik</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.length === 0 ? (
              <div className="col-span-full text-center py-12 text-on-surface-variant bg-white rounded-3xl border border-outline-variant/20 shadow-sm">
                <span className="material-symbols-outlined text-5xl opacity-35 mb-2" style={{ color: '#00aa5b' }}>storefront</span>
                <p className="text-sm">Tidak ada toko tersedia untuk kategori ini.</p>
              </div>
            ) : (
              shops.map((s) => {
                const categoryIcon = s.shopCategory === 'Elektronik' ? 'laptop' : s.shopCategory === 'Pakaian' ? 'checkroom' : s.shopCategory === 'Makanan' ? 'lunch_dining' : 'storefront';
                return (
                  <Link 
                    key={s.userId} 
                    href={`/store?shopId=${s.userId}`} 
                    className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(0,170,91,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center justify-between group text-decoration-none text-inherit"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald/5 flex items-center justify-center font-bold text-2xl border-2 border-emerald/10 shadow-sm relative group-hover:border-[#00aa5b]/30 transition-colors flex-shrink-0">
                        {s.profilePhoto ? (
                          <img src={s.profilePhoto} alt={s.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-[#00aa5b]">{s.shopName?.charAt(0).toUpperCase() || 'S'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-base group-hover:text-[#00aa5b] transition-colors mb-1">{s.shopName || s.name}</h4>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-xs text-[#00aa5b]">{categoryIcon}</span>
                          <span className="px-2.5 py-0.5 bg-emerald/10 text-[#00aa5b] rounded-full text-[9px] font-bold uppercase tracking-wider">{s.shopCategory || 'Umum'}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]" style={{ color: '#00aa5b' }}>location_on</span>
                          <span className="line-clamp-1">{s.address || 'Alamat tidak dicantumkan'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/40 group-hover:bg-[#00aa5b] group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shadow-sm flex-shrink-0">
                      <span className="material-symbols-outlined text-sm font-bold">arrow_forward_ios</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Feature section */}
        <section className="mt-xxxl rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative mb-xxxl text-white shadow-lg bg-gradient-to-r from-[#00aa5b] to-[#007f44]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex-grow max-w-2xl text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              Mitra Seller Cartify
            </span>
            <h2 className="font-display-lg text-3xl font-extrabold tracking-tight mb-3">Mulai Berjualan di Cartify</h2>
            <p className="text-white/90 font-body-lg text-sm leading-relaxed mb-0">
              Buka toko online Anda kurang dari 5 menit secara gratis. Nikmati fitur manajemen pesanan otomatis, bebas komisi untuk 100 transaksi pertama, dan jangkau jutaan pembeli aktif sekarang!
            </p>
          </div>
          
          <div className="relative z-10 flex-shrink-0">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white font-extrabold text-[#00aa5b] rounded-2xl hover:bg-gray-50 active:scale-95 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 flex items-center justify-center gap-2 text-decoration-none shadow-md"
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span>Daftar Sebagai Seller</span>
            </Link>
          </div>
        </section>
      </main>

      {/* OFF-CANVAS CART (TAILWIND SIDEBAR PANEL) */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowCart(false)}></div>
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="flex items-start justify-between border-b pb-4">
                      <h2 className="text-lg font-bold text-on-surface flex items-center gap-2" id="slide-over-title">
                        <span className="material-symbols-outlined text-2xl" style={{ color: '#00aa5b' }}>shopping_cart</span> Keranjang Belanja
                      </h2>
                      <button onClick={() => setShowCart(false)} className="text-on-surface-variant hover:text-on-surface p-1">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <div className="mt-8">
                      <div className="flow-root">
                        {cartItems.length === 0 ? (
                          <div className="text-center py-12 text-on-surface-variant">
                            <span className="material-symbols-outlined text-5xl opacity-35 mb-2" style={{ color: '#00aa5b' }}>shopping_basket</span>
                            <p className="text-sm">Keranjang belanja Anda kosong.</p>
                          </div>
                        ) : (
                          <ul className="-my-6 divide-y divide-gray-100">
                            {cartItems.map((item) => (
                              <li key={item.product?.productId} className="flex py-6">
                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low relative">
                                  <img src={getProductImage(item.product?.name, item.product?.category)} alt={item.product?.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-bold text-on-surface">
                                      <h3 className="line-clamp-1">{item.product?.name}</h3>
                                      <p className="ml-4" style={{ color: '#00aa5b' }}>Rp {item.product?.price?.toLocaleString('id-ID')}</p>
                                    </div>
                                    <p className="mt-1 text-xs font-semibold uppercase" style={{ color: '#00aa5b' }}>{item.product?.category || 'Barang'}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-on-surface-variant">Jumlah: <b>{item.quantity}x</b></p>
                                    <button onClick={() => handleRemoveFromCart(item.product?.productId)} className="font-bold text-xs text-error hover:opacity-85 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-sm">delete</span> Hapus
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-6 bg-surface-container-low/70 backdrop-blur-md">
                      <div className="flex justify-between text-base font-bold text-on-surface mb-4">
                        <p>Subtotal</p>
                        <p className="fs-5 font-extrabold" style={{ color: '#00aa5b' }}>Rp {cartTotal?.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-on-surface-variant mb-6">Pajak dan ongkos kirim dihitung saat checkout.</p>
                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="w-full py-4 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-[#00aa5b]/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#00aa5b' }}
                      >
                        {checkoutLoading ? 'Memproses...' : 'Checkout & Bayar'}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* FOOTER */}
      <footer className="mt-xxxl bg-[#f8f9fa] w-full pt-16 pb-8 border-t border-gray-200">
        <div className="max-w-container-max mx-auto px-lg">
          
          {/* Main Footer Links & Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-gray-200">
            
            {/* Column 1: Fitur Belanja (3/12 span) */}
            <div className="lg:col-span-3">
              <h5 className="font-bold text-sm text-gray-800 mb-4 uppercase tracking-wider">Fitur Belanja</h5>
              <ul className="space-y-2.5 text-xs text-on-surface-variant list-none p-0 m-0">
                <li><button onClick={() => setShowCart(true)} className="text-gray-600 hover:text-[#00aa5b] transition-colors text-decoration-none bg-transparent border-0 p-0 cursor-pointer text-left font-body-md text-xs">Keranjang Belanja</button></li>
                <li><Link className="text-gray-600 hover:text-[#00aa5b] transition-colors text-decoration-none" href={isLoggedIn ? (userRole === 'Seller' ? '/seller/dashboard' : '/buyer/dashboard') : '/login'}>Lacak Pesanan Pembeli</Link></li>
                <li><Link className="text-gray-600 hover:text-[#00aa5b] transition-colors text-decoration-none" href="/checkout">Halaman Checkout</Link></li>
              </ul>
            </div>

            {/* Column 2: Kemitraan & Akun (3/12 span) */}
            <div className="lg:col-span-3">
              <h5 className="font-bold text-sm text-gray-800 mb-4 uppercase tracking-wider">Kemitraan & Akun</h5>
              <ul className="space-y-2.5 text-xs text-on-surface-variant list-none p-0 m-0">
                <li><Link className="text-gray-600 hover:text-[#00aa5b] transition-colors text-decoration-none" href={isLoggedIn ? (userRole === 'Seller' ? '/seller/dashboard' : '/buyer/dashboard') : '/login'}>Dashboard Seller (Penjual)</Link></li>
                <li><Link className="text-gray-600 hover:text-[#00aa5b] transition-colors text-decoration-none" href={isLoggedIn ? '/buyer/dashboard' : '/login'}>Mendaftar Toko (Jadi Seller)</Link></li>
                <li><Link className="text-gray-600 hover:text-[#00aa5b] transition-colors text-decoration-none" href="/login">Masuk / Daftar Akun</Link></li>
              </ul>
            </div>

            {/* Column 3: Pembayaran & Pengiriman (3/12 span) */}
            <div className="lg:col-span-3">
              {/* Payments */}
              <h5 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wider">Pembayaran</h5>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-blue-900 tracking-wider shadow-sm select-none">BCA</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-orange-600 tracking-wider shadow-sm select-none">BNI</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-blue-600 tracking-wider shadow-sm select-none">BRI</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-yellow-600 italic shadow-sm select-none">Mandiri</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-[#00aa5b] shadow-sm select-none">GOPAY</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-blue-800 italic shadow-sm select-none">VISA</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-red-600 shadow-sm select-none">MasterCard</span>
              </div>

              {/* Shipping */}
              <h5 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wider">Pengiriman</h5>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-red-700 shadow-sm select-none">JNE</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-red-600 shadow-sm select-none">J&T Express</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-orange-500 shadow-sm select-none">SiCepat</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-[#00aa5b] shadow-sm select-none">GoSend</span>
                <span className="px-2.5 py-1 bg-white border rounded text-[10px] font-extrabold text-green-700 shadow-sm select-none">GrabExpress</span>
              </div>
            </div>

            {/* Column 4: Ikuti Kami & Keamanan (3/12 span) */}
            <div className="lg:col-span-3">
              <h5 className="font-bold text-sm text-gray-800 mb-4 uppercase tracking-wider">Ikuti Kami</h5>
              <div className="flex flex-col gap-2.5 mb-6 text-xs">
                <a className="flex items-center gap-2 text-gray-600 hover:text-[#00aa5b] text-decoration-none" href="#">
                  <span className="material-symbols-outlined text-base">public</span> Facebook
                </a>
                <a className="flex items-center gap-2 text-gray-600 hover:text-[#00aa5b] text-decoration-none" href="#">
                  <span className="material-symbols-outlined text-base">photo_camera</span> Instagram
                </a>
                <a className="flex items-center gap-2 text-gray-600 hover:text-[#00aa5b] text-decoration-none" href="#">
                  <span className="material-symbols-outlined text-base">chat</span> Twitter / X
                </a>
                <a className="flex items-center gap-2 text-gray-600 hover:text-[#00aa5b] text-decoration-none" href="#">
                  <span className="material-symbols-outlined text-base">group</span> LinkedIn
                </a>
              </div>

              <h5 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wider">Keamanan</h5>
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-white border rounded text-[9px] font-bold text-gray-500 flex items-center gap-1 shadow-sm select-none">
                  <span className="material-symbols-outlined text-xs text-[#00aa5b]">verified_user</span> ISO 27001
                </div>
                <div className="px-2 py-1 bg-white border rounded text-[9px] font-bold text-gray-500 flex items-center gap-1 shadow-sm select-none">
                  <span className="material-symbols-outlined text-xs text-warning">shield</span> PCI-DSS
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex justify-center items-center pt-8 text-xs text-gray-500">
            <p className="m-0">© 2026 Cartify Premium. Hak cipta dilindungi undang-undang.</p>
          </div>

        </div>
      </footer>    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-success" role="status"></div></div>}>
      <CatalogContent />
    </Suspense>
  );
}
