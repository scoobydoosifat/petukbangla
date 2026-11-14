import { KeyRound, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingButton from '../components/LoadingButton';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const requestPasswordChange = (event) => {
    event.preventDefault(); setError(''); setNotice('');
    if (passwords.newPassword !== passwords.confirmPassword) { setError('নতুন পাসওয়ার্ড দুবার একইভাবে লিখুন।'); return; }
    setConfirmation('password');
  };

  const requestDeletion = (event) => {
    event.preventDefault(); setError(''); setNotice('');
    setConfirmation('delete');
  };

  const confirm = async () => {
    if (saving) return;
    setSaving(true); setError('');
    try {
      if (confirmation === 'password') {
        await api.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setNotice('পাসওয়ার্ড সফলভাবে বদলানো হয়েছে।');
        setConfirmation(null);
      } else {
        await api.deleteAccount({ password: deletePassword });
        logout(); navigate('/', { replace: true });
      }
    } catch (exception) { setError(exception.message); setConfirmation(null); }
    finally { setSaving(false); }
  };

  return <div className="profile-page section-wrap">
    <header className="profile-head float-soft"><p className="eyebrow">ACCOUNT SETTINGS</p><h1>আপনার <em>প্রোফাইল</em></h1><p>নিরাপত্তা ও অ্যাকাউন্টের সিদ্ধান্ত আপনার নিয়ন্ত্রণে।</p></header>
    {error && <div className="notice error">{error}</div>}
    {notice && <div className="notice success">{notice}</div>}
    <div className="profile-grid">
      <section className="settings-card float-card"><div className="settings-title"><span><UserRound /></span><div><h2>{user.name}</h2><p>{user.email}</p></div></div><div className="account-note"><ShieldCheck /><span>আপনার পিন শুধু আপনি মুছতে পারবেন। পাসওয়ার্ড কখনো প্রকাশ করা হয় না।</span></div></section>
      <form className="settings-card float-card float-delay-one" onSubmit={requestPasswordChange}>
        <div className="settings-title"><span><KeyRound /></span><div><h2>পাসওয়ার্ড বদলান</h2><p>কমপক্ষে ৮ অক্ষরের নতুন পাসওয়ার্ড দিন</p></div></div>
        <label>বর্তমান পাসওয়ার্ড<input type="password" required value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} autoComplete="current-password" /></label>
        <label>নতুন পাসওয়ার্ড<input type="password" required minLength="8" maxLength="72" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} autoComplete="new-password" /></label>
        <label>নতুন পাসওয়ার্ড আবার<input type="password" required minLength="8" maxLength="72" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} autoComplete="new-password" /></label>
        <LoadingButton loading={saving && confirmation === 'password'} className="button button-red" type="submit">পরিবর্তন যাচাই করুন</LoadingButton>
      </form>
      <form className="settings-card danger-zone float-card float-delay-two" onSubmit={requestDeletion}>
        <div className="settings-title"><span><Trash2 /></span><div><h2>অ্যাকাউন্ট মুছুন</h2><p>এই সিদ্ধান্ত ফিরিয়ে নেওয়া যাবে না</p></div></div>
        <p>অ্যাকাউন্ট মুছলে আপনার প্রকাশ করা খাবারের পিনও মানচিত্র থেকে সরিয়ে রাখা হবে। নিশ্চিত করতে বর্তমান পাসওয়ার্ড লিখুন।</p>
        <label>বর্তমান পাসওয়ার্ড<input type="password" required value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" /></label>
        <LoadingButton loading={saving && confirmation === 'delete'} className="button button-danger" type="submit">অ্যাকাউন্ট মুছতে চাই</LoadingButton>
      </form>
    </div>
    <ConfirmDialog open={confirmation === 'password'} loading={saving} title="পাসওয়ার্ড বদলাবেন?" message="নিশ্চিত করলে পরেরবার থেকে নতুন পাসওয়ার্ড দিয়ে সাইন ইন করতে হবে।" confirmLabel="হ্যাঁ, বদলান" onConfirm={confirm} onCancel={() => setConfirmation(null)} />
    <ConfirmDialog open={confirmation === 'delete'} loading={saving} tone="danger" title="অ্যাকাউন্ট স্থায়ীভাবে মুছবেন?" message="আপনার অ্যাকাউন্ট এবং মানচিত্রে প্রকাশ করা সব পিন আর দেখা যাবে না। এই কাজটি ফিরিয়ে নেওয়া যাবে না।" confirmLabel="স্থায়ীভাবে মুছুন" onConfirm={confirm} onCancel={() => setConfirmation(null)} />
  </div>;
}
