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
    api.verifyEmail(token).then((result) => setState({ loading: false, message: result.message, error: '' }))
      .catch((error) => setState({ loading: false, message: '', error: error.message }));
  }, [params]);
  return <section className="simple-auth-page"><Logo /><div className="auth-form">{state.loading ? <p>আপনার ইমেইল নিশ্চিত করা হচ্ছে…</p> : state.error ? <><div className="form-error">{state.error}</div><Link className="button button-red full" to="/register">আবার অ্যাকাউন্ট খুলুন</Link></> : <><div className="auth-notice">{state.message}</div><Link className="button button-red full" to="/login">সাইন ইন করুন</Link></>}</div></section>;
}
