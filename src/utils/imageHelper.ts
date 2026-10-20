/**
 * Utility to process and compress images uploaded from Computer or Mobile.
 * Resizes large smartphone camera photos down to optimal dimensions
 * and converts to a lightweight, fast-loading Data URL.
 */
export async function processImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 900,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('দয়া করে একটি সঠিক ইমেজ ফাইল (JPG, PNG, WebP) নির্বাচন করুন।'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ইমেজ প্রসেস করতে ব্যর্থ হয়েছে।'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving resize
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
