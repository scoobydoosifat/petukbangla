export const HIGH_ACCURACY_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 30000,
};

export function getAccuratePosition(geolocation, { desiredAccuracy = 60, acceptableAccuracy = 250, waitMs = 30000 } = {}) {
  if (!geolocation) return Promise.reject(new Error('আপনার ব্রাউজারে লোকেশন সুবিধা পাওয়া যায়নি।'));

  return new Promise((resolve, reject) => {
    let best = null;
    let watchId;
    let finished = false;
    const stop = () => {
      if (watchId !== undefined && geolocation.clearWatch) geolocation.clearWatch(watchId);
      clearTimeout(timer);
    };
    const finish = () => {
      if (finished) return;
      finished = true; stop();
      if (best && Number.isFinite(best.coords.accuracy) && best.coords.accuracy <= acceptableAccuracy) resolve(best);
      else {
        const lowAccuracy = new Error(`লোকেশনটি যথেষ্ট নির্ভুল নয়${best?.coords?.accuracy ? ` (প্রায় ${Math.round(best.coords.accuracy)} মিটার)` : ''}। ফোনের Precise Location/GPS চালু করে, ব্রাউজারকে Location permission দিয়ে, খোলা জায়গা থেকে আবার চেষ্টা করুন।`);
        lowAccuracy.code = 'LOW_ACCURACY';
        lowAccuracy.position = best;
        reject(lowAccuracy);
      }
    };
    const success = (position) => {
      const accuracy = Number(position.coords.accuracy);
      if (!best || (Number.isFinite(accuracy) && accuracy < Number(best.coords.accuracy))) best = position;
      if (Number.isFinite(accuracy) && accuracy <= desiredAccuracy) finish();
    };
    const failure = (error) => {
      if (error?.code === 1) {
        if (finished) return;
        finished = true; stop();
        reject(new Error('লোকেশন অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংস থেকে Location permission চালু করুন।'));
      }
    };
    const timer = setTimeout(finish, waitMs);

    if (geolocation.watchPosition) {
      watchId = geolocation.watchPosition(success, failure, HIGH_ACCURACY_OPTIONS);
    } else {
      geolocation.getCurrentPosition((position) => { best = position; finish(); }, failure, HIGH_ACCURACY_OPTIONS);
    }
  });
}
