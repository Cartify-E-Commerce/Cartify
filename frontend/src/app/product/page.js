'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

function ProductDetailContent() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('Guest');
  const [userName, setUserName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);

  const [selectedShop, setSelectedShop] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  useEffect(() => {
    if (productId) {
      loadProductDetail(productId);
    }
    updateDashboardSummary();
  }, [productId]);

  const loadProductDetail = async (id) => {
    try {
      const data = await api.getProductDetail(id);
      setProduct(data);
    } catch (err) {
      await showAlert('Gagal', 'Gagal memuat detail produk: ' + err.message, 'error');
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

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      await showAlert('Peringatan', 'Harap masuk/login terlebih dahulu sebelum berbelanja!', 'warning');
      router.push('/login');
      return;
    }
    setCartLoading(true);
    try {
      // Add based on quantity
      for (let i = 0; i < quantity; i++) {
        await api.addToCart(productId);
      }
      await showAlert('Berhasil', `${product.nama} berhasil ditambahkan ke keranjang!`, 'success');
      updateDashboardSummary();
    } catch (err) {
      await showAlert('Gagal', 'Gagal menambahkan ke keranjang: ' + err.message, 'error');
    } finally {
      setCartLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6">
        <div className="glass-panel border rounded-3xl p-8 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
          <h3 className="font-bold text-lg mb-2">Produk Tidak Ditemukan</h3>
          <p className="text-sm text-on-surface-variant mb-6">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
          <Link href="/shop" className="px-6 py-2.5 text-white rounded-full font-bold text-sm block" style={{ backgroundColor: '#00aa5b' }}>
            Kembali ke Toko
          </Link>
        </div>
      </div>
    );
  }

  const imgClass = getProductImage(product.nama, product.kategori);

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
            <Link href="/shop" className="text-on-surface-variant font-bold text-sm hover:text-[#00aa5b] transition-all">
              Kembali Belanja
            </Link>
            
            <div className="h-8 w-px bg-outline-variant/60 mx-1"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href={userRole === 'Seller' ? '/seller/dashboard' : '/buyer/dashboard'} className="flex items-center gap-2 hover:opacity-85 transition-all" style={{ textDecoration: 'none' }}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-content-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: '#00aa5b', borderColor: 'rgba(0, 170, 91, 0.2)' }}>
                    {userName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-bold text-sm text-on-surface align-middle">{userName?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-1 hover:opacity-85 active:scale-95 transition-all bg-transparent border-0 flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-2xl" style={{ color: '#00aa5b' }}>power_settings_new</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 text-white rounded-full font-bold text-xs shadow-md" style={{ backgroundColor: '#00aa5b' }}>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* PRODUCT CONTENT */}
      <main className="max-w-container-max mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl p-8 shadow-md border border-outline-variant/10">
          
          {/* Left: Product Image */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="aspect-square bg-surface-container-low rounded-3xl overflow-hidden relative border shadow-sm">
              <img src={imgClass} alt={product.nama} className="w-full h-full object-cover" />
              {product.averageRating > 0 && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-white text-sm font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-md text-warning fill-1">star</span>
                  {product.averageRating?.toFixed(1)} / 5.0
                </div>
              )}
            </div>
          </div>

          {/* Right: Info & Purchase Card */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[#00aa5b]/10 text-[#00aa5b] text-xs font-bold uppercase tracking-wider">
                  {product.kategori}
                </span>
                {product.seller && (
                  <Link 
                    href={`/store?shopId=${product.seller.userId}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-[#00aa5b]/10 hover:text-[#00aa5b] text-on-surface-variant text-xs font-bold transition-all border-0 cursor-pointer"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    <span>Toko: {product.seller.shopName}</span>
                  </Link>
                )}
              </div>
              <h1 className="font-display-lg text-3xl font-extrabold text-on-surface mb-2">{product.nama}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-extrabold" style={{ color: '#00aa5b' }}>
                  Rp {product.harga?.toLocaleString('id-ID')}
                </span>
                <div className="h-4 w-px bg-outline-variant/60"></div>
                <span className="text-xs font-semibold text-on-surface-variant">
                  Stok: <span className={product.stok > 0 ? 'text-[#00aa5b]' : 'text-danger'}>{product.stok} unit</span>
                </span>
              </div>

              <hr className="border-outline-variant/20 my-4" />

              <div className="mb-6">
                <h3 className="text-sm font-bold text-on-surface mb-2">Deskripsi Produk:</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{product.deskripsi}</p>
              </div>

              {/* Specifications */}
              {product.spesifikasi && Object.keys(product.spesifikasi).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-on-surface mb-2">Spesifikasi Tambahan:</h3>
                  <div className="border border-outline-variant/30 rounded-2xl overflow-hidden divide-y divide-gray-100 text-xs shadow-sm max-w-md">
                    {Object.entries(product.spesifikasi).map(([k, v]) => (
                      <div key={k} className="flex justify-between p-3.5 bg-surface-container-lowest">
                        <span className="text-on-surface-variant font-bold">{k}</span>
                        <span className="text-on-surface font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Purchase Block */}
            <div className="bg-surface-container-low/40 p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant">Jumlah:</span>
                <div className="flex items-center border rounded-xl bg-white overflow-hidden shadow-sm">
                  <button 
                    type="button" 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 bg-transparent hover:bg-surface-container-low border-0 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-sm text-center min-w-8">{quantity}</span>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(q => Math.min(product.stok, q + 1))}
                    className="px-3 py-2 bg-transparent hover:bg-surface-container-low border-0 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stok === 0 || cartLoading}
                className="flex-1 sm:flex-initial px-8 py-3.5 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-[#00aa5b]/20 active:scale-95 transition-all flex items-center justify-center gap-2 border-0 cursor-pointer"
                style={{ backgroundColor: '#00aa5b' }}
              >
                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                {cartLoading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </button>
            </div>

          </div>
        </div>

        {/* CUSTOMER REVIEWS */}
        <div className="bg-white rounded-3xl p-8 mt-12 shadow-md border border-outline-variant/10">
          <h3 className="font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: '#00aa5b' }}>chat</span> Ulasan Pelanggan ({product.totalReviews || 0})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8 pb-6 border-b">
            {/* Average Rating Block */}
            <div className="md:col-span-4 flex flex-col items-center text-center p-6 bg-surface-container-low/40 rounded-3xl border">
              <h4 className="text-5xl font-extrabold text-on-surface mb-1">
                {product.averageRating ? product.averageRating?.toFixed(1) : '0.0'}
              </h4>
              <div className="flex gap-0.5 text-warning mb-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' ${idx < Math.round(product.averageRating || 0) ? 1 : 0}` }}>star</span>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Berdasarkan ulasan pembeli terverifikasi</p>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-8 space-y-4">
              {product.reviews?.length === 0 ? (
                <div className="text-center py-12 bg-surface-container-low/20 rounded-3xl border border-dashed text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl opacity-40 mb-2">rate_review</span>
                  <p className="text-sm">Belum ada ulasan untuk produk ini.</p>
                </div>
              ) : (
                product.reviews?.map((r, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-on-surface">{r.namaBuyer}</span>
                      <span className="text-[10px] text-on-surface-variant font-semibold bg-surface-container-low px-2 py-1 rounded-md">{r.tanggal}</span>
                    </div>
                    <div className="flex gap-0.5 text-warning">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${idx < r.rating ? 1 : 0}` }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm text-on-surface-variant italic mt-1">"{r.komentar}"</p>
                    {r.balasan && (
                      <div className="mt-3 p-3 bg-secondary-container/10 border-l-4 border-[#00aa5b] text-xs rounded-r-xl">
                        <span className="font-bold text-[#00aa5b] block mb-0.5">Tanggapan Toko:</span> "{r.balasan}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin"></div>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide">Memuat halaman produk...</p>
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
