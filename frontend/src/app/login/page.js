'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, showAlert } from '../api';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('Buyer'); // 'Buyer' or 'Seller'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [shopName, setShopName] = useState('');

  // Use refs to make sure Google callback has access to latest values without re-rendering button
  const latestState = useRef({ role, name, address, shopName });
  useEffect(() => {
    latestState.current = { role, name, address, shopName };
  }, [role, name, address, shopName]);

  const handleGoogleLogin = async (googleResponse) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.loginWithGoogle(googleResponse.credential);
      if (res.status === 'success') {
        await showAlert('Login Berhasil', 'Selamat datang di Cartify!', 'success');
        if (res.user.role === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/shop');
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('belum terdaftar')) {
        setError('Akun Google Anda belum terdaftar. Silakan pilih tab "Daftar Akun" di atas dan isi detail untuk mendaftar.');
        setActiveTab('register');
      } else {
        setError(err.message || 'Login dengan Google gagal!');
      }
    }
  };

  const handleGoogleRegister = async (googleResponse) => {
    setError('');
    setSuccess('');
    try {
      const payload = {
        idToken: googleResponse.credential,
      };
      const res = await api.registerWithGoogle(payload);
      if (res.status === 'success') {
        await showAlert('Registrasi Berhasil', 'Akun Google Anda berhasil didaftarkan! Menghubungkan sesi Anda...', 'success');
        
        // Auto-login after registration
        const loginRes = await api.loginWithGoogle(googleResponse.credential);
        if (loginRes.status === 'success') {
          if (loginRes.user.role === 'Admin') {
            router.push('/admin');
          } else {
            router.push('/shop');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Pendaftaran dengan Google gagal!');
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '1080216648204-bkf0khd6f1oqr9d363e4kvkmidlkski6.apps.googleusercontent.com',
          callback: (googleResponse) => {
            if (activeTab === 'login') {
              handleGoogleLogin(googleResponse);
            } else {
              handleGoogleRegister(googleResponse);
            }
          },
        });

        if (activeTab === 'login') {
          const btnDiv = document.getElementById('google-login-btn');
          if (btnDiv) {
            window.google.accounts.id.renderButton(btnDiv, {
              theme: 'outline',
              size: 'large',
              width: 320,
            });
          }
        } else {
          const btnRegDiv = document.getElementById('google-register-btn');
          if (btnRegDiv) {
            window.google.accounts.id.renderButton(btnRegDiv, {
              theme: 'outline',
              size: 'large',
              width: 320,
            });
          }
        }
      }
    };

    if (!document.getElementById('google-jssdk')) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }, [activeTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.login(email, password);
      if (res.status === 'success') {
        await showAlert('Login Berhasil', 'Selamat datang di Cartify!', 'success');
        if (res.user.role === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/shop');
        }
      }
    } catch (err) {
      setError(err.message || 'Email atau password salah!');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError('Nama lengkap, email, dan password wajib diisi!');
      return;
    }

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError('Nama lengkap harus terdiri dari 2 hingga 50 karakter!');
      return;
    }

    if (!/^[a-zA-Z\s'.,]+$/.test(trimmedName)) {
      setError('Nama lengkap hanya boleh mengandung huruf, spasi, titik, koma, dan petik tunggal!');
      return;
    }

    if (!/^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/.test(trimmedEmail)) {
      setError('Format email tidak valid!');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-+=*#/.])[A-Za-z\d@$!%*?&_\-+=*#/.]{8,32}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      setError('Password tidak cukup kuat! Password harus memiliki panjang 8-32 karakter dan mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter spesial (@$!%*?&_\\-+=*#/. )!');
      return;
    }

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      };
      const res = await api.register(payload);
      if (res.status === 'success') {
        await showAlert('Pendaftaran Berhasil', 'Akun berhasil dibuat! Mengalihkan ke dashboard...', 'success');
        // Auto-login with credentials
        const loginRes = await api.login(trimmedEmail, trimmedPassword);
        if (loginRes.status === 'success') {
          if (loginRes.user.role === 'Admin') {
            router.push('/admin');
          } else {
            router.push('/shop');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal!');
    }
  };


  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f9', padding: '20px' }}>
      <div className="login-card shadow-lg">
        <div className="login-header">
          <h3 className="fw-bold mb-1"><i className="fa-solid fa-cart-shopping me-2"></i>Cartify</h3>
          <p className="mb-0 opacity-75">Platform E-Commerce Modern, Aman, dan Tepercaya</p>
        </div>

        <div className="login-body">
          {/* Tabs */}
          <div className="nav-tabs-custom">
            <button
              className={`nav-link-custom border-0 bg-transparent ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccess('');
              }}
            >
              Masuk
            </button>
            <button
              className={`nav-link-custom border-0 bg-transparent ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setError('');
                setSuccess('');
              }}
            >
              Daftar Akun
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="alert alert-danger p-3 mb-3 small fw-semibold" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
            </div>
          )}

          {success && (
            <div className="alert alert-success p-3 mb-3 small fw-semibold" role="alert">
              <i className="fa-solid fa-circle-check me-2"></i>{success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Email / Username</label>
                <input
                  type="email"
                  className="form-control form-control-custom"
                  placeholder="contoh@student.telkomuniversity.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold small text-muted">Password</label>
                <input
                  type="password"
                  className="form-control form-control-custom"
                  placeholder="Password Anda..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-custom w-100">
                <i className="fa-solid fa-right-to-bracket me-2"></i>Masuk Sekarang
              </button>
              
              <div className="text-center my-3 text-muted small">atau</div>
              
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div id="google-login-btn"></div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  placeholder="Nama lengkap Anda..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Email</label>
                <input
                  type="email"
                  className="form-control form-control-custom"
                  placeholder="contoh@student.telkomuniversity.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Password</label>
                <input
                  type="password"
                  className="form-control form-control-custom"
                  placeholder="Buat password aman..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>



              <button type="submit" className="btn btn-custom w-100">
                <i className="fa-solid fa-user-plus me-2"></i>Daftar Sekarang
              </button>

              <div className="text-center my-3 text-muted small">atau</div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div id="google-register-btn"></div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
