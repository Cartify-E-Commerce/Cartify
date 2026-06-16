'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert } from '../api';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transactionId');

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transactionId) {
      api.getPaymentDetails(transactionId)
        .then(res => {
          setTransaction(res);
          setAmount(res.totalAmount);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError('ID Transaksi tidak valid!');
      setLoading(false);
    }
  }, [transactionId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || amt > 999999999) {
      setError('Masukkan jumlah pembayaran yang valid (di antara Rp1 dan Rp999.999.999)!');
      return;
    }

    try {
      const res = await api.processPayment(transactionId, amt);
      if (res.status === 'success') {
        await showAlert('Pembayaran Berhasil', 'Pesanan Anda sedang diproses.', 'success');
        router.push('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
        <p className="ms-2">Memuat halaman pembayaran...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#f4f6f9' }}>
      <div className="login-card shadow-lg" style={{ maxWidth: '540px' }}>
        <div className="login-header">
          <Link href="/" className="text-decoration-none text-white d-flex align-items-center justify-content-center gap-2 mb-2">
            <i className="fa-solid fa-cart-shopping fs-3"></i>
            <span className="fs-4 fw-bold">Cartify</span>
          </Link>
          <h5 className="fw-bold mb-1">INVOICE PEMBAYARAN</h5>
          <span className="badge bg-warning text-dark px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '11px', borderRadius: '20px' }}>
            PENDING PAYMENT
          </span>
        </div>

        <div className="login-body">
          {error && (
            <div className="alert alert-danger p-3 mb-3 small fw-semibold" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
            </div>
          )}

          {transaction ? (
            <div>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-muted">ID Transaksi:</span>
                  <strong>#{transaction.transactionId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-muted">Waktu:</span>
                  <strong>{new Date(transaction.createdAt).toLocaleString('id-ID')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #dee2e6', paddingTop: '8px' }}>
                  <span className="text-muted">Status Pembayaran:</span>
                  <strong style={{ color: '#d97706' }}>{transaction.paymentStatus}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h6 className="fw-bold text-muted small text-uppercase mb-2">Detail Item Belanja:</h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {transaction.itemList?.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>{item.product?.name} (x{item.quantity})</span>
                      <span>Rp {(item.product?.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderTop: '2px solid #dee2e6', marginBottom: '25px' }}>
                <strong style={{ fontSize: '14px' }}>TOTAL INVOICE:</strong>
                <strong style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--cartify-green)' }}>
                  Rp {transaction.totalAmount?.toLocaleString('id-ID')}
                </strong>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-muted">Masukkan Nominal Uang (Rp)</label>
                  <input
                    type="number"
                    className="form-control form-control-custom"
                    placeholder="Masukkan jumlah uang..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <small style={{ color: '#6c757d', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    *Harus sama dengan atau lebih besar dari total invoice.
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link href="/buyer/dashboard" className="btn btn-light w-50 py-2 fw-bold" style={{ borderRadius: '8px', border: '1px solid #ced4da' }}>
                    Batal
                  </Link>
                  <button type="submit" className="btn btn-custom w-50 fw-bold">
                    <i className="fa-solid fa-credit-card me-2"></i>Bayar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#6c757d', marginBottom: '20px' }}>Transaksi tidak ditemukan.</p>
              <Link href="/buyer/dashboard" className="btn btn-custom px-4">
                Kembali ke Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
        <p className="ms-2">Memuat halaman pembayaran...</p>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
