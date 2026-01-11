import { decode } from 'blurhash';

/**
 * Decode BlurHash to base64 data URL for use as image placeholder
 */
export function blurhashToDataUrl(
  blurhash: string,
  width: number = 32,
  height: number = 32
): string {
  try {
    const pixels = decode(blurhash, width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
  } catch (error) {
    console.error('Failed to decode blurhash:', error);
    return '';
  }
}

/**
 * Generate CSS blur style from blurhash
 */
export function getBlurhashStyle(blurhash: string): React.CSSProperties {
  const dataUrl = blurhashToDataUrl(blurhash);

  return {
    backgroundImage: `url(${dataUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(10px)',
  };
}

/**
 * Validate if a string is a valid BlurHash
 */
export function isValidBlurHash(blurhash: string): boolean {
  if (!blurhash || typeof blurhash !== 'string') return false;

  // BlurHash should be at least 6 characters
  if (blurhash.length < 6) return false;

  try {
    decode(blurhash, 32, 32);
    return true;
  } catch {
    return false;
  }
}
