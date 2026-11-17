import { useCallback, useEffect, useMemo, useState } from 'react';
import { CirclePlus, Crosshair, MapPin, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { DivIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { api } from '../api';
import LoadingButton from '../components/LoadingButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { compressImage } from '../utils/image';
import { getAccuratePosition } from '../utils/geolocation';
import { searchLocations } from '../utils/locationSearch';

const DHAKA = [23.8103, 90.4125];
const emptyForm = { foodName: '', placeName: '', description: '', address: '', latitude: '', longitude: '', imageDataUrl: '' };
const pinIcon = new DivIcon({ className: 'food-map-pin', html: '<span>🍽</span>', iconSize: [42, 50], iconAnchor: [21, 48], popupAnchor: [0, -44] });
const locationIcon = new DivIcon({ className: 'current-location-pin', html: '<span><i></i></span>', iconSize: [34, 34], iconAnchor: [17, 17] });
const searchedLocationIcon = new DivIcon({ className: 'searched-location-pin', html: '<span><i></i></span>', iconSize: [38, 48], iconAnchor: [19, 47], popupAnchor: [0, -43] });

function ClickPicker({ onPick }) {
  useMapEvents({ click: (event) => onPick(event.latlng) });
  return null;
}

function MapFocus({ point }) {
  const map = useMap();
  useEffect(() => { if (point) map.flyTo([point.lat, point.lng], 17, { duration: 1.1 }); }, [map, point]);
  return null;
}

function SearchResultMarker({ point }) {
  const map = useMap();
  useEffect(() => { if (point) map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 16), { duration: 1.1 }); }, [map, point]);
  return null;
}

export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locatedPoint, setLocatedPoint] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [approximatePoint, setApproximatePoint] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [actionError, setActionError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchedPoint, setSearchedPoint] = useState(null);

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    try { setPlaces(await api.places()); setError(''); } catch (exception) { setError(exception.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { load(); const timer = setInterval(() => load(true), 20000); return () => clearInterval(timer); }, [load]);

  const selectPoint = ({ lat, lng }, accuracy = null) => {
    if (lat < 23.60 || lat > 24.10 || lng < 90.20 || lng > 90.60) { setError('ঢাকা শহরের ভেতরের একটি জায়গা নির্বাচন করুন।'); return; }
    setForm((value) => ({ ...value, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    setLocationAccuracy(accuracy);
    if (accuracy !== null) setLocatedPoint({ lat, lng }); else setLocatedPoint(null);
    setApproximatePoint(null);
    setModal(true); setError('');
  };
  const useLocation = async () => {
    if (locating) return;
    setLocating(true);
    setError(''); setApproximatePoint(null);
    try {
      const { coords } = await getAccuratePosition(navigator.geolocation);
      selectPoint({ lat: coords.latitude, lng: coords.longitude }, Math.round(coords.accuracy));
    } catch (exception) {
      if (exception.code === 'LOW_ACCURACY' && exception.position) {
        setApproximatePoint({ lat: exception.position.coords.latitude, lng: exception.position.coords.longitude, accuracy: Math.round(exception.position.coords.accuracy) });
      }
      setError(exception.message);
    }
    finally { setLocating(false); }
  };
  const submit = async (event) => {
    event.preventDefault(); if (saving) return;
    if (!form.latitude) { setError('আগে মানচিত্রে লোকেশন নির্বাচন করুন।'); return; }
    setActionError(''); setConfirmation({ type: 'create' });
  };
  const confirmAction = async () => {
    if (!confirmation || saving) return;
    setSaving(true);
    try {
      if (confirmation.type === 'create') {
        const created = await api.createPlace({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) });
        setPlaces((items) => [created, ...items]); setForm(emptyForm); setLocatedPoint(null); setLocationAccuracy(null); setModal(false); setError('');
      } else {
        await api.deletePlace(confirmation.place.id);
        setPlaces((items) => items.filter((place) => place.id !== confirmation.place.id));
      }
      setActionError(''); setConfirmation(null);
    } catch (exception) { setActionError(exception.message); }
    finally { setSaving(false); }
  };
  const remove = (place) => { setActionError(''); setConfirmation({ type: 'delete', place }); };
  const useApproximateLocation = () => {
    if (!approximatePoint) return;
    selectPoint(approximatePoint, approximatePoint.accuracy);
  };
  const searchLocation = async (event) => {
    event.preventDefault();
    if (searchingLocation || !locationQuery.trim()) return;
    setSearchingLocation(true); setLocationResults([]); setError('');
    try {
      const results = await searchLocations(locationQuery);
      if (!results.length) throw new Error('জায়গাটি খুঁজে পাওয়া যায়নি। ইংরেজি বা বাংলা বানান দিয়ে আবার চেষ্টা করুন।');
      setLocationResults(results);
      setSearchedPoint(null);
    } catch (exception) {
      if (exception.name !== 'AbortError') setError(exception.message);
    } finally { setSearchingLocation(false); }
  };
  const chooseLocation = (point) => {
    setSearchedPoint(point); setLocationResults([]); setError('');
  };
  const onPhoto = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const imageDataUrl = await compressImage(file);
      setForm((value) => ({ ...value, imageDataUrl }));
    } catch (exception) { setError(exception.message); }
  };
  const markers = useMemo(() => places.filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)), [places]);

  return <div className="explore-page">
    <section className="explore-head section-wrap"><div><p className="eyebrow">COMMUNITY MAP · DHAKA</p><h1>অলিগলির খাবার,<br /><em>মানচিত্রে সবার</em></h1><p>মানচিত্রে ক্লিক করে কোনো অনন্য খাবারের সঠিক জায়গা যোগ করুন। নতুন পিন প্রতি ২০ সেকেন্ডে দেখা যায়।</p></div><div className="explore-actions"><button className="button button-light" onClick={() => load(true)} disabled={refreshing}><RefreshCw size={18} className={refreshing ? 'spin' : ''} /> Refresh</button><LoadingButton className="button button-red" loading={locating} onClick={useLocation}><Crosshair size={18} /> আমার লোকেশন</LoadingButton></div></section>
    {error && <div className="notice error section-wrap"><span>{error}</span>{approximatePoint && <button className="button button-light location-fallback" type="button" onClick={useApproximateLocation}>আনুমানিক অবস্থান ব্যবহার করুন</button>}</div>}
    <section className="explore-layout section-wrap">
      <div className="dhaka-map-wrap">
        <div className="map-hint"><MapPin size={17} /> নতুন খাবার যোগ করতে মানচিত্রে ক্লিক করুন</div>
        <form className="map-location-search" onSubmit={searchLocation}>
          <Search size={18} aria-hidden="true" />
          <input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder="ইংরেজি বা বাংলায় জায়গা খুঁজুন" aria-label="জায়গা খুঁজুন" />
          <button type="submit" disabled={searchingLocation || !locationQuery.trim()}>{searchingLocation ? 'খুঁজছি…' : 'খুঁজুন'}</button>
        </form>
        {!!locationResults.length && <div className="location-results" role="listbox" aria-label="জায়গার ফলাফল">{locationResults.map((result) => <button key={result.id} type="button" onClick={() => chooseLocation(result)}><MapPin size={15} /><span>{result.label}</span></button>)}</div>}
        <MapContainer center={DHAKA} zoom={13} minZoom={10} maxZoom={20} className="dhaka-map" scrollWheelZoom zoomControl preferCanvas>
          <TileLayer maxZoom={20} maxNativeZoom={19} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickPicker onPick={(point) => selectPoint(point)} />
          <MapFocus point={locatedPoint} />
          <SearchResultMarker point={searchedPoint} />
          {locatedPoint && <Marker position={[locatedPoint.lat, locatedPoint.lng]} icon={locationIcon} interactive={false} />}
          {searchedPoint && <Marker position={[searchedPoint.lat, searchedPoint.lng]} icon={searchedLocationIcon}><Popup><strong>{searchedPoint.label}</strong><br /><small>এখানে খাবারের পিন যোগ করতে মানচিত্রে ক্লিক করুন।</small></Popup></Marker>}
          {markers.map((place) => <Marker key={place.id} position={[place.latitude, place.longitude]} icon={pinIcon}><Popup maxWidth={285}><article className="pin-popup">{place.imageDataUrl && <img src={place.imageDataUrl} alt={place.foodName} />}<small>{place.placeName}</small><h3>{place.foodName}</h3><p>{place.description}</p><span><MapPin size={13} /> {place.address}</span><footer>পিন করেছেন {place.userName}{place.ownedByCurrentUser && <button onClick={() => remove(place)} aria-label="Delete pin"><Trash2 size={15} /></button>}</footer></article></Popup></Marker>)}
        </MapContainer>
        {loading && <div className="map-loading"><span className="logo-mark small"><i /></span> খাবারের পিন খুঁজছি…</div>}
      </div>
      <aside className="place-feed"><div className="feed-title"><span>সাম্প্রতিক আবিষ্কার</span><b>{places.length} pins</b></div>{places.slice(0, 8).map((place) => <button key={place.id} onClick={() => setForm((value) => ({ ...value, latitude: place.latitude, longitude: place.longitude }))}><span>{place.imageDataUrl ? <img src={place.imageDataUrl} alt="" /> : '🍽️'}</span><div><b>{place.foodName}</b><small>{place.placeName}</small><p>{place.address}</p></div></button>)}{!loading && !places.length && <div className="empty-feed"><CirclePlus /><h3>প্রথম পিনটি আপনার হোক</h3><p>মানচিত্রে কোনো জায়গায় ক্লিক করে পরিচিত খাবারের গল্প বলুন।</p></div>}</aside>
    </section>

    {modal && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && setModal(false)}><form className="pin-form" onSubmit={submit}><button type="button" className="modal-close" onClick={() => setModal(false)} disabled={saving}><X /></button><p className="eyebrow">নতুন খাবারের পিন</p><h2>কী খুঁজে পেলেন?</h2><div className="coordinate-note"><MapPin size={16} /> {form.latitude}, {form.longitude}{locationAccuracy !== null && <b>GPS ±{locationAccuracy}m</b>}</div>{locationAccuracy !== null && <p className="location-confirm-note">{locationAccuracy > 250 ? 'এটি Chrome-এর আনুমানিক অবস্থান। সঠিক জায়গায় পিন বসাতে এই ফর্ম বন্ধ করে মানচিত্রে ঠিক জায়গায় ক্লিক করুন।' : 'নীল চিহ্নটি আপনার বর্তমান GPS অবস্থান। ঠিক না হলে বাইরে বা জানালার কাছে গিয়ে আবার “আমার লোকেশন” চাপুন।'}</p>}<div className="form-grid"><label>খাবারের নাম<input required maxLength="80" value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} placeholder="যেমন: কালা ভুনা" /></label><label>জায়গার নাম<input required maxLength="100" value={form.placeName} onChange={(e) => setForm({ ...form, placeName: e.target.value })} placeholder="দোকান / এলাকা" /></label></div><label>ঠিকানা<input required maxLength="180" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="রোড, এলাকা, কাছের ল্যান্ডমার্ক" /></label><label>কেন খাবারটি আলাদা?<textarea required minLength="10" maxLength="600" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="স্বাদ, দাম, কখন পাওয়া যায়—ছোট করে লিখুন" /></label><label className="photo-input">একটি ছবি (ঐচ্ছিক)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} /><span>{form.imageDataUrl ? 'ছবি প্রস্তুত ✓' : 'JPEG, PNG বা WebP · স্বয়ংক্রিয়ভাবে ছোট হবে'}</span></label><LoadingButton loading={saving} className="button button-red full" type="submit">পিন যাচাই করুন</LoadingButton></form></div>}
    <ConfirmDialog open={confirmation?.type === 'create'} loading={saving} error={actionError} title="এই খাবারের পিন প্রকাশ করবেন?" message={`${form.foodName || 'খাবারটি'} — ${form.placeName || 'নির্বাচিত জায়গা'}। প্রকাশ করলে ঢাকার Food Exploration মানচিত্রে অন্য ব্যবহারকারীরাও এটি দেখতে পাবেন।`} confirmLabel="হ্যাঁ, পিন যোগ করুন" onConfirm={confirmAction} onCancel={() => { setActionError(''); setConfirmation(null); }} />
    <ConfirmDialog open={confirmation?.type === 'delete'} loading={saving} error={actionError} tone="danger" title="এই খাবারের পিনটি মুছবেন?" message={`${confirmation?.place?.foodName || 'পিনটি'} মানচিত্র থেকে সরিয়ে দেওয়া হবে। এই কাজটি ফিরিয়ে নেওয়া যাবে না।`} confirmLabel="হ্যাঁ, মুছুন" onConfirm={confirmAction} onCancel={() => { setActionError(''); setConfirmation(null); }} />
  </div>;
}
