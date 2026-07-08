export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate the new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        
        // Use a white background (in case image has transparency and is converted to a format that doesn't support it, though webp does)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, width, height);

        // Compress and convert to webp (fallback to jpeg if webp not supported by browser, though most modern ones do)
        const compressedBase64 = canvas.toDataURL("image/webp", quality);
        
        // If webp is not supported, it returns png by default, so we check and fallback to jpeg just in case
        if (compressedBase64.startsWith("data:image/png") && file.type !== "image/png") {
           const fallbackBase64 = canvas.toDataURL("image/jpeg", quality);
           resolve(fallbackBase64);
        } else {
           resolve(compressedBase64);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
