import Logo from './Logo';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';

  return <footer className="site-footer">
    <div className="site-footer-copy"><Logo compact /><p>বাংলাদেশের খাবারের স্মৃতি, এক মানচিত্রে।</p></div>
    <div className="site-footer-meta">
      <p>© 2026 Petuk Bangla · Made with appetite in Bangladesh</p>
      {isLandingPage && <p className="developer-credit">Developed by <a href="https://pointfex.com/" target="_blank" rel="noreferrer" aria-label="Visit PointFex website"><img src="https://pointfex.com/logo.png" alt="PointFex" /> <span>PointFex</span></a></p>}
    </div>
  </footer>;
}
