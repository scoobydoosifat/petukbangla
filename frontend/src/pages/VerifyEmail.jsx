import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, message: '', error: '' });
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return; ran.current = true;
    const token = params.get('token');
    if (!token) { setState({ loading: false, message: '', error: 'The confirmation link is missing.' }); return; }
    api.verifyEmail(token).then((result) => {
      const email = localStorage.getItem('petuk-pending-verification-email');
      if (email) {
        localStorage.setItem('petuk-email-verified', JSON.stringify({ email, at: Date.now() }));
        localStorage.removeItem('petuk-pending-verification-email');
      }
      setState({ loading: false, message: 'ইমেইল কনফার্ম করা হয়েছে। আগের ট্যাবে ফিরে সাইন ইন করুন।', error: '' });
    })
      .catch((error) => setState({ loading: false, message: '', error: error.message }));
  }, [params]);
  return <section className="simple-auth-page"><Logo /><div className="auth-form">{state.loading ? <p>আপনার ইমেইল নিশ্চিত করা হচ্ছে…</p> : state.error ? <><div className="form-error">{state.error}</div><Link className="button button-red full" to="/register">আবার অ্যাকাউন্ট খুলুন</Link></> : <><div className="auth-notice">{state.message}</div><p className="auth-switch">আগের ট্যাবের ফর্মটি স্বয়ংক্রিয়ভাবে সাইন ইন পেজে চলে যাবে।</p><Link className="button button-red full" to="/login">এই ট্যাবেও সাইন ইন করুন</Link></>}</div></section>;
}
