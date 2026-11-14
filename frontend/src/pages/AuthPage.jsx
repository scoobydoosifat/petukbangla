import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, UserRound } from 'lucide-react';
import LoadingButton from '../components/LoadingButton';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const registerMode = mode === 'register';
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: location.state?.email || '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const explorationRequired = location.state?.from === '/explore';

  useEffect(() => {
    if (!registerMode) return undefined;
    const onEmailVerified = (event) => {
      if (event.key !== 'petuk-email-verified' || !event.newValue) return;
      const verification = JSON.parse(event.newValue);
      if (verification.email === form.email.trim().toLowerCase()) {
        navigate('/login', { replace: true, state: { email: form.email, emailVerified: true } });
      }
    };
    window.addEventListener('storage', onEmailVerified);
    return () => window.removeEventListener('storage', onEmailVerified);
  }, [form.email, navigate, registerMode]);
  if (user) return <Navigate to="/explore" replace />;
  const submit = async (event) => {
    event.preventDefault(); if (loading) return; setLoading(true); setError('');
    try {
      if (registerMode) {
        const result = await register(form);
        localStorage.setItem('petuk-pending-verification-email', form.email.trim().toLowerCase());
        setNotice('আপনার ইমেইল ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন। সেখানে থাকা লিংকে ক্লিক করে অ্যাকাউন্ট নিশ্চিত করুন।');
      } else {
        await login({ email: form.email, password: form.password });
        navigate(location.state?.from || '/explore');
      }
    }
    catch (exception) { setError(exception.message); } finally { setLoading(false); }
  };
  return (
    <section className="auth-page">
      <div className="auth-art"><Logo /><div><p>“খাবারের সবচেয়ে সুন্দর ঠিকানা<br />মানুষের স্মৃতিতে।”</p><span>— পেটুক বাংলার আড্ডা</span></div><div className="auth-sun" /></div>
      <form className="auth-form" onSubmit={submit}>
        {explorationRequired && !registerMode && <div className="auth-required">Food Exploration ব্যবহার করতে আপনাকে সাইন ইন করতে হবে।</div>}
        <p className="eyebrow">{registerMode ? 'নতুন পেটুক' : 'আবার স্বাগতম'}</p>
        <h1>{registerMode ? 'আড্ডায় যোগ দিন' : 'আপনার অ্যাকাউন্টে'}</h1>
        <p>{registerMode ? 'অ্যাকাউন্ট খুলতে আপনার ইমেইল নিশ্চিত করতে হবে।' : 'ঢাকার খাবার মানচিত্রে নিজের আবিষ্কার যোগ করতে সাইন ইন করুন।'}</p>
        {error && <div className="form-error">{error}</div>}
        {notice && <div className="auth-notice">{notice}</div>}
        {location.state?.emailVerified && <div className="auth-notice">ইমেইল কনফার্ম করা হয়েছে। এখন সাইন ইন করুন।</div>}
        {!notice && <>
          {registerMode && <label><span><UserRound size={17} /> নাম</span><input required minLength="2" maxLength="60" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}
          <label><span><Mail size={17} /> ইমেইল</span><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label><span><KeyRound size={17} /> পাসওয়ার্ড</span><input type="password" required minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><small>কমপক্ষে ৮ অক্ষর</small></label>
          <LoadingButton loading={loading} className="button button-red full" type="submit">{registerMode ? 'অ্যাকাউন্ট খুলুন' : 'সাইন ইন করুন'}</LoadingButton>
        </>}
        {!registerMode && <Link className="auth-inline-link" to="/forgot-password">পাসওয়ার্ড ভুলে গেছেন?</Link>}
        <p className="auth-switch">{registerMode ? 'আগেই অ্যাকাউন্ট আছে?' : 'এখনও অ্যাকাউন্ট নেই?'} <Link to={registerMode ? '/login' : '/register'}>{registerMode ? 'সাইন ইন' : 'ফ্রি অ্যাকাউন্ট'}</Link></p>
        <Link className="map-without-login" to="/food-map">Food Map খুলুন →</Link>
      </form>
    </section>
  );
}
