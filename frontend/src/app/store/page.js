'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert } from '../api';
import { getProductImage } from '../shop/page';

export function getProductSubCategory(name = '', category = '') {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  // FOOD PRODUCTS
  if (c.includes('makanan') || n.includes('kripik') || n.includes('singkong') || n.includes('roti') || 
      n.includes('cokelat') || n.includes('truffle') || n.includes('cookies') || n.includes('cookie') || 
      n.includes('madu') || n.includes('selai') || n.includes('butter') || n.includes('kopi') || 
      n.includes('teh') || n.includes('matcha') || n.includes('susu') || n.includes('keju') || n.includes('snack')) {
      
    if (n.includes('kripik') || n.includes('singkong') || n.includes('cookies') || n.includes('cookie') || n.includes('snack') || n.includes('keripik') || n.includes('cemilan')) {
      return 'Makanan Ringan';
    }
    if (n.includes('roti') || n.includes('sourdough') || n.includes('gandum') || n.includes('cake') || n.includes('kue')) {
      return 'Roti & Kue';
    }
    if (n.includes('cokelat') || n.includes('truffle') || n.includes('chocolate') || n.includes('pudding') || n.includes('dessert')) {
      return 'Dessert';
    }
    if (n.includes('kopi') || n.includes('teh') || n.includes('matcha') || n.includes('coffee') || n.includes('juice') || n.includes('jus') || n.includes('sirup')) {
      return 'Minuman';
    }
    if (n.includes('madu') || n.includes('selai') || n.includes('butter') || n.includes('peanut') || n.includes('susu') || n.includes('keju') || n.includes('mentega')) {
      return 'Bahan & Selai';
    }
    return 'Makanan Lainnya';
  }

  // FASHION PRODUCTS
  if (c.includes('pakaian') || c.includes('fashion') || c.includes('baju') || n.includes('kaos') || 
      n.includes('jaket') || n.includes('hoodie') || n.includes('chino') || n.includes('celana') || 
      n.includes('dress') || n.includes('kemeja') || n.includes('kerudung') || n.includes('hijab') || 
      n.includes('jilbab') || n.includes('gamis')) {
      
    if (n.includes('kerudung') || n.includes('hijab') || n.includes('jilbab') || n.includes('mukena') || n.includes('gamis') || n.includes('daster') || n.includes('kaftan') || n.includes('sarung')) {
      return 'Busana Muslim';
    }
    if (n.includes('kaos') || n.includes('t-shirt') || n.includes('tshirt') || n.includes('kemeja') || n.includes('flanel') || n.includes('hoodie') || n.includes('jaket') || n.includes('sweater') || n.includes('blazer')) {
      return 'Atasan';
    }
    if (n.includes('chino') || n.includes('celana') || n.includes('jeans') || n.includes('rok') || n.includes('skirt')) {
      return 'Bawahan';
    }
    if (n.includes('dress')) {
      return 'Terusan';
    }
    if (n.includes('topi') || n.includes('cap') || n.includes('sneakers') || n.includes('sepatu') || n.includes('sandal') || n.includes('sendal') || n.includes('tas') || n.includes('kaos kaki')) {
      return 'Aksesoris & Sepatu';
    }
    return 'Pakaian Lainnya';
  }

  // ELECTRONIC PRODUCTS
  if (c.includes('elektronik') || c.includes('laptop') || n.includes('laptop') || n.includes('keychron') || 
      n.includes('mouse') || n.includes('monitor') || n.includes('headphone') || n.includes('phone') || 
      n.includes('watch') || n.includes('webcam') || n.includes('ram') || n.includes('motherboard') || 
      n.includes('vga') || n.includes('ssd') || n.includes('processor')) {
      
    if (n.includes('ram') || n.includes('motherboard') || n.includes('mobo') || n.includes('vga') || n.includes('gpu') || n.includes('ssd') || n.includes('hdd') || n.includes('processor') || n.includes('cpu') || n.includes('power supply') || n.includes('psu') || n.includes('casing') || n.includes('cooler')) {
      return 'Komponen PC';
    }
    if (n.includes('laptop') || n.includes('loq') || n.includes('zenbook') || n.includes('pc') || n.includes('desktop')) {
      return 'Laptop & Komputer';
    }
    if (n.includes('phone') || n.includes('poco') || n.includes('hp') || n.includes('tablet') || n.includes('ipad')) {
      return 'Handphone & Tablet';
    }
    if (n.includes('keyboard') || n.includes('keychron') || n.includes('mouse') || n.includes('master') || n.includes('monitor') || n.includes('headphone') || n.includes('sony') || n.includes('watch') || n.includes('smartwatch') || n.includes('webcam') || n.includes('brio') || n.includes('camera') || n.includes('audio') || n.includes('speaker')) {
      return 'Aksesoris';
    }
    return 'Elektronik Lainnya';
  }

  return 'Umum';
}

function StoreDetailContent() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('Guest');
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');

  useEffect(() => {
    if (shopId) {
      loadStoreDetail(shopId);
    } else {
      router.push('/shop');
    }
    updateDashboardSummary();
  }, [shopId]);

  const loadStoreDetail = async (id) => {
    try {
      const data = await api.getShopDetail(id);
      setStore(data);
    } catch (err) {
      await showAlert('Gagal', 'Gagal memuat detail toko: ' + err.message, 'error');
      router.push('/shop');
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardSummary = async () => {
    try {
      const userRes = await api.me();
      if (userRes.user) {
        setIsLoggedIn(true);
        setUserRole(userRes.user.role);
        setUserName(userRes.user.name);
        setUserPhoto(userRes.user.profilePhoto || '');
        
        if (userRes.user.role === 'Buyer') {
          const dashboardData = await api.getBuyerDashboard();
          setCartCount(dashboardData.cartCount || 0);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide">Memuat halaman toko...</p>
        </div>
      </div>
    );
  }

  if (!store) return null;

  // Map products to include subCategory
  const productsWithSubCategory = (store.products || []).map(p => ({
    ...p,
    subCategory: getProductSubCategory(p.name, p.category)
  }));

  // Dynamic categories filter list based on mapped subCategory
  const categoriesList = Array.from(new Set(productsWithSubCategory.map(p => p.subCategory)));

  // Filter and Sort products list
  const filteredProducts = productsWithSubCategory
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory ? p.subCategory === selectedCategory : true;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'stock-desc') return b.stock - a.stock;
      return 0; // default (no sort)
    });

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased bg-gradient-soft pb-16">
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
            <Link href="/shop" className="text-on-surface-variant font-bold text-sm hover:text-[#00aa5b] transition-all" style={{ textDecoration: 'none' }}>
              Kembali ke Toko Utama
            </Link>
            
            <div className="h-8 w-px bg-outline-variant/60 mx-1"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href={userRole === 'Seller' ? '/seller/dashboard' : '/buyer/dashboard'} className="flex items-center gap-2 hover:opacity-85 transition-all" style={{ textDecoration: 'none' }}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: '#00aa5b', borderColor: 'rgba(0, 170, 91, 0.2)' }}>
                    {userPhoto ? (
                      <img src={userPhoto} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userName ? userName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="hidden md:inline font-bold text-sm text-on-surface align-middle">{userName?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-1 hover:opacity-85 active:scale-95 transition-all bg-transparent border-0 flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-2xl" style={{ color: '#00aa5b' }}>power_settings_new</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 text-white rounded-full font-bold text-xs shadow-md" style={{ backgroundColor: '#00aa5b', textDecoration: 'none' }}>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* STORE HERO BANNER */}
      <div className="w-full bg-gradient-to-r from-[#00aa5b] to-[#005a30] text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-container-max mx-auto px-lg relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white/20 text-white flex items-center justify-center font-bold text-5xl border-3 border-white/40 shadow-2xl backdrop-blur-md flex-shrink-0">
              {store.profilePhoto ? (
                <img src={store.profilePhoto} alt={store.shopName} className="w-full h-full object-cover" />
              ) : (
                store.shopName?.charAt(0).toUpperCase() || 'S'
              )}
            </div>
            <div className="text-center md:text-left">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                {store.shopCategory || 'Umum'}
              </span>
              <h1 className="font-display-lg text-4xl font-extrabold tracking-tight mb-2">{store.shopName}</h1>
              <p className="text-white/85 text-sm font-medium mb-3">Owner: {store.name} • {store.email}</p>
              <p className="text-xs text-white/80 flex items-center justify-center md:justify-start gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {store.address || 'Alamat belum diatur'}
              </p>
            </div>
          </div>

          {/* Shop Statistics Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 shadow-xl w-full lg:w-auto">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-yellow-300" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <div>
                <div className="text-xs text-white/70">Rating Toko</div>
                <div className="text-lg font-bold">{store.averageRating || '5.0'} / 5.0</div>
              </div>
            </div>
            <div className="h-px sm:h-10 w-full sm:w-px bg-white/10"></div>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-white">shopping_bag</span>
              </div>
              <div>
                <div className="text-xs text-white/70">Produk Terjual</div>
                <div className="text-lg font-bold">{store.totalSold || '0'} +</div>
              </div>
            </div>
            <div className="h-px sm:h-10 w-full sm:w-px bg-white/10"></div>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-white">calendar_today</span>
              </div>
              <div>
                <div className="text-xs text-white/70">Bergabung</div>
                <div className="text-lg font-bold">{store.joinedAt || 'Juni 2025'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STORE PRODUCTS CATALOG */}
      <main className="max-w-container-max mx-auto px-lg py-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-outline-variant/20">
          <div>
            <h2 className="font-display-lg text-2xl font-bold text-on-surface">Katalog Produk</h2>
            <p className="text-on-surface-variant text-sm">Menampilkan produk-produk berkualitas tinggi dari {store.shopName}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input 
                type="text" 
                placeholder="Cari di toko ini..." 
                className="pl-10 pr-4 py-2.5 text-sm font-semibold border border-outline-variant/60 rounded-2xl bg-white focus:outline-none focus:border-[#00aa5b] focus:ring-4 focus:ring-[#00aa5b]/10 transition-all duration-300 shadow-sm hover:shadow-md w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

             {/* Category Filter */}
            <select 
              className="appearance-none pl-4 pr-10 py-2.5 text-sm font-semibold border border-outline-variant/60 rounded-2xl bg-white bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22%252300aa5b%22%3E%3Cpath_d=%22M7_10l5_5_5-5H7z%22/%3E%3C/svg%3E')] bg-[length:18px] bg-[right_10px_center] bg-no-repeat hover:border-[#00aa5b] focus:border-[#00aa5b] focus:ring-4 focus:ring-[#00aa5b]/10 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-on-surface-variant focus:outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort Options */}
            <select 
              className="appearance-none pl-4 pr-10 py-2.5 text-sm font-semibold border border-outline-variant/60 rounded-2xl bg-white bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22%252300aa5b%22%3E%3Cpath_d=%22M7_10l5_5_5-5H7z%22/%3E%3C/svg%3E')] bg-[length:18px] bg-[right_10px_center] bg-no-repeat hover:border-[#00aa5b] focus:border-[#00aa5b] focus:ring-4 focus:ring-[#00aa5b]/10 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-on-surface-variant focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Urutkan: Bawaan</option>
              <option value="price-asc">Harga: Terendah ke Tinggi</option>
              <option value="price-desc">Harga: Tertinggi ke Rendah</option>
              <option value="name-asc">Nama: A - Z</option>
              <option value="name-desc">Nama: Z - A</option>
              <option value="stock-desc">Stok: Terbanyak</option>
            </select>

            <span className="px-4 py-2 bg-white rounded-2xl border text-xs font-bold text-on-surface-variant">
              {filteredProducts.length} Produk
            </span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant bg-white rounded-3xl border shadow-sm">
            <span className="material-symbols-outlined text-6xl opacity-35 mb-3 d-block" style={{ color: '#00aa5b' }}>storefront</span>
            Tidak ada produk yang cocok dengan pencarian atau filter Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const img = p.imageUrl || getProductImage(p.name, p.category);
              return (
                <Link 
                  key={p.productId} 
                  href={`/product?productId=${p.productId}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer border border-outline-variant/10 flex flex-col text-decoration-none text-inherit"
                >
                  <div className="aspect-square bg-surface-container-low overflow-hidden relative">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={img} alt={p.name} />
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#00aa5b] uppercase tracking-wider">{p.subCategory}</span>
                      <h3 className="text-body-lg font-bold text-on-surface mb-2 line-clamp-1 group-hover:text-[#00aa5b] transition-colors mt-1">{p.name}</h3>
                      <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed mb-4">{p.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-display-lg text-headline-md font-extrabold" style={{ color: '#00aa5b' }}>
                        Rp {p.price?.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">Stok: {p.stock}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function StoreDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide">Memuat halaman toko...</p>
        </div>
      </div>
    }>
      <StoreDetailContent />
    </Suspense>
  );
}
