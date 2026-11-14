import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import LoadingButton from '../components/LoadingButton';
import Logo from '../components/Logo';
import { api } from '../api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    if (password !== confirmation) { setError('The passwords do not match.'); return; }
    setLoading(true);
    try { setMessage((await api.resetPassword(params.get('token') || '', password)).message); }
    catch (exception) { setError(exception.message); }
    finally { setLoading(false); }
  };
  return <section className="simple-auth-page"><Logo /><form className="auth-form" onSubmit={submit}><p className="eyebrow">নতুন পাসওয়ার্ড</p><h1>পাসওয়ার্ড বদলান</h1><p>কমপক্ষে ৮ অক্ষরের একটি নতুন পাসওয়ার্ড লিখুন।</p>{error && <div className="form-error">{error}</div>}{message ? <><div className="auth-notice">{message}</div><Link className="button button-red full" to="/login">সাইন ইন করুন</Link></> : <><label><span><KeyRound size={17} /> নতুন পাসওয়ার্ড</span><input type="password" required minLength="8" maxLength="72" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label><span><KeyRound size={17} /> আবার লিখুন</span><input type="password" required minLength="8" maxLength="72" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label><LoadingButton loading={loading} className="button button-red full" type="submit">পাসওয়ার্ড বদলান</LoadingButton></>}</form></section>;
}
