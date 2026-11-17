import { ArrowRight, Download, MapPinned, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-grain" />
      <div className="hero-copy reveal-in">
        <p className="eyebrow">বাংলাদেশের স্বাদ · YOUR FOOD STORY</p>
        <h1 aria-label="খাবারের স্মৃতিতে রঙিন হোক দেশ">
          <span className="hero-line" aria-hidden="true"><span className="word-reveal word-one">খাবারের</span>{' '}<span className="word-reveal word-two">স্মৃতিতে</span></span>
          <em className="hero-line" aria-hidden="true"><span className="word-reveal word-three">রঙিন</span>{' '}<span className="word-reveal word-four">হোক</span>{' '}<span className="word-reveal word-five">দেশ</span></em>
        </h1>
        <p className="hero-lead">যে জেলার ঐতিহ্যবাহী খাবার চেখেছেন, মানচিত্রে তাকে জাগিয়ে তুলুন। আর ঢাকার অলিগলির অজানা স্বাদ ভাগ করুন সবার সঙ্গে।</p>
        <div className="hero-actions">
          <Link className="button button-red" to="/food-map">আমার Food Map বানাই <ArrowRight size={19} /></Link>
          <Link className="button button-ghost" to="/explore">ঢাকার খাবার খুঁজি <MapPinned size={19} /></Link>
        </div>
        <div className="hero-notes"><span><i>৬৪</i> জেলা</span><span><i>১</i> স্মৃতির মানচিত্র</span><span><i>∞</i> অজানা খাবার</span></div>
      </div>
      <div className="hero-art reveal-in delay">
        <div className="sun-disc"><div className="sun-alpona" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><span>স্বাদে<br />বাংলাদেশ</span></div>
        <span className="flavor-spark spark-one">✦</span><span className="flavor-spark spark-two">✦</span><span className="flavor-spark spark-three">●</span><span className="flavor-spark spark-four">◆</span>
        <span className="floating-food food-one">🍛</span><span className="floating-food food-two">🥭</span><span className="floating-food food-three">🐟</span>
        <div className="hero-ticket"><small>আজকের আহ্বান</small><b>একটি নতুন স্বাদ খুঁজুন</b><span>২৩.৮১০৩° N · ৯০.৪১২৫° E</span></div>
      </div>
    </section>

    <section className="three-paths section-wrap">
      <div className="path-grid">
        <Link to="/food-map" className="path-card map-card"><span className="path-number">01</span><div className="card-icon"><Sparkles /></div><h3>Food Map</h3><p>সাইন ইন ছাড়াই জেলার খাবার বেছে নিজের রঙিন স্বাদের মানচিত্র PNG হিসেবে নামিয়ে নিন।</p><b>মানচিত্র খুলুন <ArrowRight /></b><span className="bangla-stamp">সবার জন্য</span></Link>
        <Link to="/explore" className="path-card explore-card"><span className="path-number">02</span><div className="card-icon"><MapPinned /></div><h3>Food Exploration</h3><p>ঢাকার মানচিত্রে মানুষের খুঁজে পাওয়া খাবারের পিন দেখুন, নিজের আবিষ্কার যোগ করুন।</p><b>স্বাদ খুঁজুন <ArrowRight /></b><span className="bangla-stamp">সাইন ইন</span></Link>
        <Link to="/register" className="path-card join-card"><span className="path-number">03</span><div className="card-icon"><Logo compact /></div><h3>Join the Adda</h3><p>ভেরিফাইড ইমেইল, নাম আর পাসওয়ার্ড দিয়ে ছোট্ট অ্যাকাউন্ট বানিয়ে এখনই যোগ দিন।</p><b>অ্যাকাউন্ট খুলুন <ArrowRight /></b><span className="bangla-stamp">ফ্রি</span></Link>
      </div>
    </section>

    <section className="story-strip"><div className="story-photo"><span>ইলিশ · পিঠা · পথের স্বাদ</span></div><div><p className="eyebrow">খাবার শুধু রেসিপি নয়</p><h2>একেকটি স্বাদ,<br />একেকটি জায়গার গল্প।</h2><p>পেটুক বাংলা কোনো রেস্টুরেন্ট র‍্যাঙ্কিং নয়। এটি ব্যক্তিগত খাবার-স্মৃতি আর কমিউনিটির আবিষ্কারের একটি জীবন্ত নকশা।</p><Link to="/food-map">আপনার গল্প আঁকুন <Download size={18} /></Link></div></section>
  </>;
}
