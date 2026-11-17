import { Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ConfirmDialog from './ConfirmDialog';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [signOutRequested, setSignOutRequested] = useState(false);
  const { user, logout } = useAuth();
  const close = () => setOpen(false);
  const confirmSignOut = () => { logout(); setSignOutRequested(false); close(); };
  return <header className="site-header"><nav className="nav-wrap">
    <Link to="/" onClick={close}><Logo /></Link>
    <button className="menu-button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <div className={`nav-links ${open ? 'open' : ''}`}>
      <NavLink to="/food-map" onClick={close}>Food Map</NavLink>
      <NavLink to="/explore" onClick={close}>Food Exploration</NavLink>
      {user ? <><span className="nav-user">আসসালামু আলাইকুম, {user.name.split(' ')[0]}</span><NavLink className="profile-link" to="/profile" onClick={close}><Settings size={16} /> Profile</NavLink><button className="text-button" onClick={() => setSignOutRequested(true)}>Sign out</button></> : <Link className="nav-cta" to="/login" onClick={close}>Sign in</Link>}
    </div>
  </nav><ConfirmDialog open={signOutRequested} title="আপনি কি সাইন আউট করতে চাচ্ছেন?" message="সাইন আউট করলে এই ডিভাইসে আপনার অ্যাকাউন্ট থেকে বের হয়ে যাবেন।" confirmLabel="হ্যাঁ, সাইন আউট করুন" cancelLabel="না, থাক" onConfirm={confirmSignOut} onCancel={() => setSignOutRequested(false)} /></header>;
}
