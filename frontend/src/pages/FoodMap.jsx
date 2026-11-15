import { useEffect, useMemo, useRef, useState } from 'react';
import { toCanvas } from 'html-to-image';
import { Check, Download, Instagram, RotateCcw, Search, Share2 } from 'lucide-react';
import { api } from '../api';
import fallbackFoods from '../data/traditionalFoods.json';
import FoodMapGraphic from '../components/FoodMapGraphic';
import LoadingButton from '../components/LoadingButton';
import { loadTriedFoods, progressPercent, saveTriedFoods } from '../utils/foodMap';
import { foodColor } from '../utils/foodColor';

export default function FoodMap() {
  const [foods, setFoods] = useState(fallbackFoods);
  const [geojson, setGeojson] = useState(null);
  const [selected, setSelected] = useState(loadTriedFoods);
  const [query, setQuery] = useState('');
  const [division, setDivision] = useState('All');
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [shareLink, setShareLink] = useState('');
  const exportRef = useRef(null);
  const shareCanvasRef = useRef(null);
  const shareCanvasPromiseRef = useRef(null);
  const SOCIAL_CARD_WIDTH = 1080;
  const SOCIAL_CARD_HEIGHT = 1350;

  useEffect(() => { api.foods().then(setFoods).catch(() => setNotice('অফলাইন তালিকা দেখানো হচ্ছে—আপনার নির্বাচন ঠিকই সংরক্ষিত হবে।')); }, []);
  useEffect(() => { fetch('/data/bangladesh-districts.geojson').then((response) => response.json()).then(setGeojson).catch(() => setNotice('মানচিত্রের রেখা লোড করা যায়নি।')); }, []);
  useEffect(() => { saveTriedFoods(selected); }, [selected]);

  const divisions = ['All', ...new Set(foods.map((food) => food.division))];
  const shownFoods = useMemo(() => foods.filter((food) => (division === 'All' || food.division === division) && `${food.name} ${food.nameBn} ${food.district} ${food.districtBn}`.toLowerCase().includes(query.toLowerCase())), [foods, division, query]);
  const triedPercent = progressPercent(selected.length, foods.length);
  const toggle = (food) => {
    shareCanvasRef.current = null;
    shareCanvasPromiseRef.current = null;
    setSelected((current) => current.includes(food.slug) ? current.filter((slug) => slug !== food.slug) : [...current, food.slug]);
  };

  const renderMapCanvas = async () => {
      const backgroundColor = getComputedStyle(exportRef.current).backgroundColor || '#073d2c';
      const rendered = await toCanvas(exportRef.current, {
        cacheBust: true,
        canvasWidth: SOCIAL_CARD_WIDTH,
        canvasHeight: SOCIAL_CARD_HEIGHT,
        pixelRatio: 1,
        backgroundColor,
      });
      const opaque = document.createElement('canvas');
      opaque.width = rendered.width; opaque.height = rendered.height;
      const context = opaque.getContext('2d');
      context.fillStyle = backgroundColor; context.fillRect(0, 0, opaque.width, opaque.height);
      context.drawImage(rendered, 0, 0);
      return opaque;
  };

  const downloadCanvas = (canvas) => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a'); link.download = 'petuk-bangla-food-map.png'; link.href = dataUrl; link.click();
  };

  const prepareShareCard = (downloadImage = false) => {
    if (shareCanvasRef.current) {
      if (downloadImage) downloadCanvas(shareCanvasRef.current);
      return Promise.resolve(shareCanvasRef.current);
    }
    if (!shareCanvasPromiseRef.current) {
      shareCanvasPromiseRef.current = renderMapCanvas().then((canvas) => {
        shareCanvasRef.current = canvas;
        shareCanvasPromiseRef.current = null;
        return canvas;
      }).catch((error) => {
        shareCanvasPromiseRef.current = null;
        throw error;
      });
    }
    return shareCanvasPromiseRef.current.then((canvas) => {
      if (downloadImage) downloadCanvas(canvas);
      return canvas;
    });
  };

  const openShareMenu = () => {
    if (downloading || sharing) return;
    setShareOpen((open) => !open);
    setNotice('');
  };

  const download = async () => {
    if (downloading || sharing) return;
    setDownloading(true); setNotice(''); setShareLink('');
    try { downloadCanvas(await renderMapCanvas()); }
    catch { setNotice('Food Map PNG তৈরি করা যায়নি। আবার চেষ্টা করুন।'); }
    finally { setDownloading(false); }
  };

  const share = async (target) => {
    setShareOpen(false); setSharing(true); setNotice(''); setShareLink('');
    const sharePageUrl = import.meta.env.VITE_PUBLIC_URL || window.location.href;
    const destination = target === 'facebook'
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`
      : 'https://www.instagram.com/';
    // Open the real destination during the click event. Delayed navigation from
    // an about:blank tab is commonly blocked by Chrome's popup protection.
    const externalWindow = target !== 'native' && !navigator.share
      ? window.open('', '_blank')
      : null;
    try {
      // Always download the constant-size PNG before opening an external feed.
      const canvas = await prepareShareCard(true);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG তৈরি করা যায়নি।');
      const file = new File([blob], 'petuk-bangla-food-map.png', { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: 'আমার Food Map — পেটুক বাংলা', text: 'আমার পেটুক বাংলা Food Map', files: [file] });
      } else {
        if (externalWindow && !externalWindow.closed) externalWindow.location.href = destination;
        setShareLink(destination);
        setNotice(target === 'facebook' ? 'কার্ডটি ডাউনলোড হয়েছে। Facebook-এ পোস্ট করার জন্য ডাউনলোড করা ছবিটি বেছে নিন।' : 'কার্ডটি ডাউনলোড হয়েছে। Instagram খুলে পোস্টে ছবিটি বেছে নিন।');
      }
    } catch (exception) {
      if (exception.name !== 'AbortError') setNotice('Share সম্পন্ন করা যায়নি। কার্ডটি Download করে পোস্ট করুন।');
      if (externalWindow && !externalWindow.closed) externalWindow.close();
    } finally { setSharing(false); }
  };

  return <div className="food-map-page">
    <section className="page-intro section-wrap"><p className="eyebrow">বাংলাদেশের ঐতিহ্যবাহী স্বাদ</p><h1>কোন কোন জেলার স্বাদ<br /><em>আপনার গল্পে আছে?</em></h1><p>খাবারের নাম বা মানচিত্রের জেলা ছুঁয়ে নির্বাচন করুন। এই ব্রাউজারেই আপনার তালিকা মনে থাকবে।</p></section>
    {notice && <div className="notice section-wrap"><span>{notice}</span>{shareLink && <a className="share-fallback-link" href={shareLink} target="_blank" rel="noreferrer">{shareLink.includes('facebook') ? 'Facebook খুলুন' : 'Instagram খুলুন'} ↗</a>}</div>}
    <div className="map-workspace section-wrap">
      <aside className="food-picker">
        <div className="progress-head"><div><small>আপনার স্বাদযাত্রা</small><strong>{selected.length} / {foods.length}</strong></div><span>{triedPercent}% ট্রাই করেছেন</span></div>
        <div className="progress-track"><i style={{ width: `${triedPercent}%` }} /></div>
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="খাবার বা জেলা খুঁজুন" /></label>
        <div className="division-tabs">{divisions.map((item) => <button key={item} className={division === item ? 'active' : ''} onClick={() => setDivision(item)}>{item === 'All' ? 'সব' : item}</button>)}</div>
        <div className="food-list">{shownFoods.map((food) => {
          const active = selected.includes(food.slug);
          return <button key={food.slug} className={`food-row ${active ? 'active' : ''}`} style={{ '--food-color': foodColor(food) }} onClick={() => toggle(food)}><span className="food-color" aria-hidden="true">{food.emoji}</span><span><b>{food.nameBn}</b><small>{food.districtBn} · {food.name}</small></span><span className="food-check">{active && <Check size={16} />}</span></button>;
        })}</div>
      </aside>
      <section className="map-stage">
        <div ref={exportRef} className="export-card">
          <div className="export-title"><div><small>পেটুক বাংলার স্বাদযাত্রা</small><h2>আমার Food Map</h2><p>{selected.length}টি খাবার ট্রাই করেছি</p></div><span className="export-score"><b>{triedPercent}%</b> ট্রাই</span></div>
          {geojson ? <FoodMapGraphic geojson={geojson} foods={foods} selectedIds={selected} onDistrictClick={toggle} /> : <div className="map-skeleton"><span /></div>}
          <div className="export-foot"><span>petukbangla</span><p>বাংলাদেশের ঐতিহ্যবাহী খাবারের স্মৃতি</p><time>{new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium' }).format(new Date())}</time></div>
        </div>
        <div className="map-actions"><LoadingButton loading={downloading || sharing} className="button button-red" onClick={download}><Download size={18} /> PNG ডাউনলোড</LoadingButton><div className="share-wrap"><LoadingButton loading={sharing || downloading} className="button button-share" onClick={openShareMenu} aria-expanded={shareOpen}><Share2 size={18} /> Share</LoadingButton>{shareOpen && <div className="share-menu" role="menu"><button type="button" onClick={() => share('native')}><Share2 size={16} /> ফোনের Share menu</button><button type="button" onClick={() => share('facebook')}><span className="facebook-mark">f</span> Facebook</button><button type="button" onClick={() => share('instagram')}><Instagram size={16} /> Instagram</button></div>}</div><button className="button button-light" disabled={!selected.length || downloading || sharing} onClick={() => { shareCanvasRef.current = null; shareCanvasPromiseRef.current = null; setSelected([]); }}><RotateCcw size={17} /> মুছে ফেলুন</button></div>
      </section>
    </div>
  </div>;
}
