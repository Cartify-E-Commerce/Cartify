'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert } from '../api';
import { getProductImage } from '../shop/page';

function CheckoutContent() {
  const [profile, setProfile] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Configuration States
  const [shippingAddress, setShippingAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // Couriers list
  const couriers = [
    { id: 'jne', name: 'JNE Regular', cost: 15000, etd: '2-3 Hari' },
    { id: 'jnt', name: 'J&T Express', cost: 12000, etd: '2-4 Hari' },
    { id: 'gosend', name: 'GoSend Instant', cost: 30000, etd: '1-3 Jam' },
    { id: 'grab', name: 'GrabExpress Sameday', cost: 20000, etd: '6-8 Jam' },
  ];
  const [selectedCourier, setSelectedCourier] = useState(couriers[0]);

  // Vouchers list
  const vouchers = [
    { code: 'FREESHIP', name: 'Gratis Ongkir (Potongan s.d Rp15.000)', type: 'shipping', value: 15000 },
    { code: 'DISC10', name: 'Diskon 10% Spesial', type: 'percent', value: 0.1 },
    { code: 'CARTIFYNEW', name: 'Potongan Belanja Rp50.000', type: 'flat', value: 50000 },
  ];
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  // Payment Methods
  const paymentMethods = [
    { id: 'GoPay', name: 'GoPay / QRIS', icon: 'qr_code_2' },
    { id: 'OVO', name: 'OVO', icon: 'account_balance_wallet' },
    { id: 'ShopeePay', name: 'ShopeePay', icon: 'payments' },
    { id: 'Virtual Account', name: 'Transfer Virtual Account', icon: 'account_balance' },
    { id: 'Credit Card', name: 'Kartu Kredit / Debit', icon: 'credit_card' },
  ];
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);
  const [selectedVariants, setSelectedVariants] = useState({});

  const router = useRouter();

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const meRes = await api.me();
      if (!meRes.user) {
        router.push('/login');
        return;
      }
      setProfile(meRes.user);
      setShippingAddress(meRes.user.address || '');
      setTempAddress(meRes.user.address || '');

      const dashboardData = await api.getBuyerDashboard();
      setCartItems(dashboardData.cartItems || []);
      setCartTotal(dashboardData.cartTotal || 0);

      try {
        const vars = JSON.parse(localStorage.getItem('cart_variants') || '{}');
        setSelectedVariants(vars);
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error('Failed to load checkout data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    const code = voucherCodeInput.trim().toUpperCase();
    if (code.length > 30) {
      showAlert('Gagal', 'Kode voucher tidak valid (terlalu panjang).', 'error');
      return;
    }
    const found = vouchers.find(v => v.code === code);
    if (found) {
      setAppliedVoucher(found);
      showAlert('Berhasil', `Voucher ${found.code} berhasil digunakan!`, 'success');
    } else {
      showAlert('Gagal', 'Kode voucher tidak valid.', 'error');
    }
  };

  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === 'shipping') {
      return Math.min(selectedCourier.cost, appliedVoucher.value);
    }
    if (appliedVoucher.type === 'percent') {
      return Math.round(cartTotal * appliedVoucher.value);
    }
    if (appliedVoucher.type === 'flat') {
      return Math.min(cartTotal, appliedVoucher.value);
    }
    return 0;
  };

  const handleSaveAddress = () => {
    const trimmedAddress = tempAddress.trim();
    if (!trimmedAddress) {
      showAlert('Error', 'Alamat pengiriman tidak boleh kosong!', 'error');
      return;
    }
    if (trimmedAddress.length > 200) {
      showAlert('Error', 'Alamat pengiriman maksimal 200 karakter!', 'error');
      return;
    }
    setShippingAddress(trimmedAddress);
    setIsEditingAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      showAlert('Error', 'Harap isi alamat pengiriman terlebih dahulu!', 'error');
      return;
    }

    setCheckoutLoading(true);
    const shippingCost = selectedCourier.cost;
    const discount = calculateDiscount();
    
    const payload = {
      shippingAddress,
      courier: selectedCourier.name,
      shippingCost,
      discount,
      paymentMethod: selectedPaymentMethod.id,
    };

    try {
      const res = await api.checkout(payload);
      if (res.status === 'success') {
        await showAlert('Pesanan Dibuat', 'Pesanan Anda berhasil dibuat. Silakan selesaikan pembayaran.', 'success');
        router.push(`/payment?transactionId=${res.transactionId}`);
      } else {
        await showAlert('Info', res.message, 'info');
      }
    } catch (err) {
      await showAlert('Gagal', 'Checkout gagal: ' + err.message, 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6">
        <div className="bg-white border rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <span className="material-symbols-outlined text-6xl text-[#00aa5b] mb-4">shopping_basket</span>
          <h3 className="font-bold text-lg mb-2">Keranjang Belanja Kosong</h3>
          <p className="text-sm text-on-surface-variant mb-6">Anda tidak memiliki produk di keranjang untuk dicheckout.</p>
          <Link href="/shop" className="px-6 py-2.5 text-white rounded-full font-bold text-sm block transition-all hover:bg-[#00904d] active:scale-95" style={{ backgroundColor: '#00aa5b' }}>
            Kembali Belanja
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = selectedCourier.cost;
  const discount = calculateDiscount();
  const serviceFee = 1000;
  const grandTotal = cartTotal + shippingCost - discount + serviceFee;

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
            <span className="text-on-surface-variant/40 mx-2 text-xl">|</span>
            <span className="font-bold text-sm text-on-surface-variant">Checkout</span>
          </div>
          <Link href="/shop" className="text-on-surface-variant font-bold text-sm hover:text-[#00aa5b] transition-all">
            Kembali Ke Toko
          </Link>
        </nav>
      </header>

      {/* BODY CONTENT */}
      <main className="max-w-container-max mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Checkout Configurations */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Shipping Address Box */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00aa5b]">location_on</span> Alamat Pengiriman
                </h3>
                {!isEditingAddress && (
                  <button 
                    onClick={() => setIsEditingAddress(true)} 
                    className="text-xs font-bold text-[#00aa5b] hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Ubah Alamat
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="flex flex-col gap-4">
                  {/* Select address from registered addresses list */}
                  {profile?.addresses && profile.addresses.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Pilih dari Alamat Terdaftar</span>
                      <div className="flex flex-col gap-2">
                        {profile.addresses.map((addr, idx) => (
                          <label key={idx} className="flex gap-3 items-start p-3 bg-surface-container-low/50 border border-outline-variant/15 rounded-2xl cursor-pointer hover:border-primary transition-all">
                            <input
                              type="radio"
                              name="registeredAddress"
                              checked={tempAddress === addr}
                              onChange={() => setTempAddress(addr)}
                              className="mt-1"
                            />
                            <div className="text-sm">
                              <span className="font-bold text-xs text-on-surface-variant block mb-1">Alamat #{idx + 1}</span>
                              <span className="text-on-surface">{addr}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Alamat Kustom / Baru</span>
                    <textarea
                      className="w-full p-3.5 border-2 border-outline-variant/30 focus:border-primary rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                      rows="3"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      placeholder="Masukkan alamat lengkap pengiriman..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={handleSaveAddress} 
                      className="px-4 py-2 bg-[#00aa5b] text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Simpan
                    </button>
                    <button 
                      onClick={() => { setTempAddress(shippingAddress); setIsEditingAddress(false); }} 
                      className="px-4 py-2 border rounded-lg font-bold text-xs bg-transparent cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm mb-1">{profile?.name}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {shippingAddress || 'Alamat belum diatur. Silakan tambahkan alamat pengiriman.'}
                  </p>
                </div>
              )}
            </div>

            {/* Courier Delivery Selector */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2 border-b pb-4 mb-4">
                <span className="material-symbols-outlined text-[#00aa5b]">local_shipping</span> Opsi Pengiriman
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {couriers.map((c) => {
                  const isSelected = selectedCourier.id === c.id;
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedCourier(c)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-[#00aa5b] bg-[#00aa5b]/5' : 'border-outline-variant/30 hover:border-[#00aa5b]/50'}`}
                    >
                      <div>
                        <p className="font-bold text-sm mb-0.5">{c.name}</p>
                        <p className="text-xs text-on-surface-variant/70">Estimasi Tiba: {c.etd}</p>
                      </div>
                      <p className="font-extrabold text-sm text-[#00aa5b]">Rp {c.cost.toLocaleString('id-ID')}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voucher & Coupon Box */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2 border-b pb-4 mb-4">
                <span className="material-symbols-outlined text-[#00aa5b]">sell</span> Voucher Belanja
              </h3>
              
              <form onSubmit={handleApplyVoucher} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#00aa5b]/20 focus:border-[#00aa5b] text-sm uppercase"
                  placeholder="Masukkan kode voucher..."
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                />
                <button type="submit" className="px-5 py-2.5 bg-[#00aa5b] text-white font-bold text-sm rounded-xl hover:shadow-md cursor-pointer">
                  Terapkan
                </button>
              </form>

              {appliedVoucher && (
                <div className="mt-4 p-3 bg-[#00aa5b]/5 border border-[#00aa5b]/20 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 bg-[#00aa5b] text-white rounded text-[10px] font-bold tracking-wider mr-2">VOUCHER AKTIF</span>
                    <span className="text-sm font-bold text-on-surface">{appliedVoucher.code}</span>
                    <p className="text-xs text-on-surface-variant/70 mt-1">{appliedVoucher.name}</p>
                  </div>
                  <button 
                    onClick={() => { setAppliedVoucher(null); setVoucherCodeInput(''); }} 
                    className="text-error hover:text-error/85 bg-transparent border-0 font-bold text-xs cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              )}

              {/* Recommended Voucher Hints */}
              <div className="mt-4">
                <p className="text-xs text-on-surface-variant/70 mb-2 font-bold">Rekomendasi kode voucher untuk dicoba:</p>
                <div className="flex flex-wrap gap-2">
                  {vouchers.map(v => (
                    <span 
                      key={v.code} 
                      onClick={() => setVoucherCodeInput(v.code)}
                      className="px-2.5 py-1 border border-dashed rounded-lg text-xs font-semibold cursor-pointer hover:bg-surface-container-low transition-all"
                    >
                      {v.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method selector */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2 border-b pb-4 mb-4">
                <span className="material-symbols-outlined text-[#00aa5b]">payment</span> Metode Pembayaran
              </h3>
              <div className="flex flex-col gap-2.5">
                {paymentMethods.map((m) => {
                  const isSelected = selectedPaymentMethod.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedPaymentMethod(m)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${isSelected ? 'border-[#00aa5b] bg-[#00aa5b]/5 font-bold' : 'border-outline-variant/20 hover:border-outline-variant/60'}`}
                    >
                      <span className="material-symbols-outlined text-[#00aa5b]">{m.icon}</span>
                      <span className="text-sm flex-1">{m.name}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#00aa5b] bg-[#00aa5b]' : 'border-outline-variant/40'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
            
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
              <h3 className="font-bold text-base text-on-surface border-b pb-4 mb-4">Ringkasan Belanja</h3>
              
              {/* Product items list */}
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div key={item.product?.productId} className="flex py-3 items-center gap-3">
                    <img 
                      src={item.product?.imageUrl || getProductImage(item.product?.name, item.product?.category)} 
                      alt={item.product?.name} 
                      className="w-12 h-12 object-cover rounded-lg border bg-surface-container-low" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate mb-0.5">{item.product?.name}</p>
                      <p className="text-xs text-on-surface-variant/70">{item.quantity}x @ Rp {item.product?.price?.toLocaleString('id-ID')}</p>
                      {selectedVariants[item.product?.productId] && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-surface-container font-bold text-on-surface-variant">
                          Varian: {selectedVariants[item.product?.productId]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#00aa5b' }}>
                      Rp {(item.quantity * item.product?.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-outline-variant/20 my-4" />

              {/* Price Details Breakdown */}
              <div className="flex flex-col gap-2.5 text-sm mb-6">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal Produk</span>
                  <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Ongkos Kirim ({selectedCourier.name})</span>
                  <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald font-semibold" style={{ color: '#00aa5b' }}>
                    <span>Diskon Voucher ({appliedVoucher?.code})</span>
                    <span>-Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>Biaya Jasa Aplikasi</span>
                  <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                </div>
                <hr className="border-outline-variant/20 my-2" />
                <div className="flex justify-between text-base font-extrabold text-on-surface">
                  <span>Total Pembayaran</span>
                  <span style={{ color: '#00aa5b' }}>Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Place Order Action Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={checkoutLoading || !shippingAddress.trim() || !selectedPaymentMethod}
                className="w-full py-4 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border-0"
                style={{ 
                  backgroundColor: (checkoutLoading || !shippingAddress.trim() || !selectedPaymentMethod) ? '#a0a5a2' : '#00aa5b',
                  cursor: (checkoutLoading || !shippingAddress.trim() || !selectedPaymentMethod) ? 'not-allowed' : 'pointer'
                }}
              >
                {checkoutLoading ? 'Memproses Pesanan...' : 'Buat Pesanan & Bayar'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              {(!shippingAddress.trim()) && (
                <p className="text-center text-xs mt-3 font-semibold" style={{ color: '#dc3545' }}>
                  * Harap isi alamat pengiriman untuk melanjutkan pemesanan.
                </p>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-12"><div className="w-12 h-12 rounded-full border-4 border-[#00aa5b] border-t-transparent animate-spin mx-auto"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
