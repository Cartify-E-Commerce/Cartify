'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert } from '../api';
import { getProductImage } from '../shop/page';

function StoreDetailContent() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('Guest');
  const [userName, setUserName] = useState('');
  const [cartCount, setCartCount] = useState(0);

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
                    {userName?.charAt(0).toUpperCase()}
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
        
        <div className="max-w-container-max mx-auto px-lg relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white/20 text-white flex items-center justify-center font-bold text-5xl border-3 border-white/40 shadow-2xl backdrop-blur-md">
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
      </div>

      {/* STORE PRODUCTS CATALOG */}
      <main className="max-w-container-max mx-auto px-lg py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-display-lg text-2xl font-bold text-on-surface">Katalog Produk</h2>
            <p className="text-on-surface-variant text-sm">Menampilkan produk-produk berkualitas tinggi dari {store.shopName}</p>
          </div>
          <span className="px-4 py-2 bg-white rounded-2xl border text-xs font-bold text-on-surface-variant">
            {store.products?.length || 0} Produk Aktif
          </span>
        </div>

        {store.products?.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant bg-white rounded-3xl border shadow-sm">
            <span className="material-symbols-outlined text-6xl opacity-35 mb-3 d-block" style={{ color: '#00aa5b' }}>storefront</span>
            Toko ini belum menambahkan produk saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {store.products.map((p) => {
              const img = getProductImage(p.name, p.category);
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
                      <span className="text-[10px] font-bold text-[#00aa5b] uppercase tracking-wider">{p.category}</span>
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
