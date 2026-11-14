import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import LoadingButton from '../components/LoadingButton';
import Logo from '../components/Logo';
import { api } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    try { setMessage((await api.forgotPassword(email)).message); }
    catch (exception) { setError(exception.message); }
    finally { setLoading(false); }
  };
  return <section className="auth-page"><div className="auth-art"><Logo /><div><p>আপনার অ্যাকাউন্ট<br />আবার ফিরে পান।</p><span>— পেটুক বাংলার আড্ডা</span></div><div className="auth-sun" /></div><form className="auth-form" onSubmit={submit}><p className="eyebrow">অ্যাকাউন্ট উদ্ধার</p><h1>পাসওয়ার্ড ভুলে গেছেন?</h1><p>আপনার নিবন্ধিত ইমেইল লিখুন। আমরা একটি নিরাপদ password change link পাঠাব।</p>{error && <div className="form-error">{error}</div>}{message && <div className="auth-notice">{message}</div>}<label><span><Mail size={17} /> ইমেইল</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><LoadingButton loading={loading} className="button button-red full" type="submit">লিংক পাঠান</LoadingButton><p className="auth-switch"><Link to="/login">সাইন ইন পেজে ফিরে যান</Link></p></form></section>;
}
