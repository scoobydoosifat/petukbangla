export function compressImage(file, maxSize = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('ছবির ফাইল নির্বাচন করুন।'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবিটি পড়া যায়নি।'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('ছবিটি খোলা যায়নি।'));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
