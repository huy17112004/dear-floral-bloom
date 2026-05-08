export function resolveImageUrl(imageUrl?: string): string {
  if (!imageUrl) {
    return '/placeholder.svg';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const configuredBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '');
  const baseOrigin = configuredBase.replace(/\/api$/i, '');
  const rawPath = imageUrl.replace(/\\/g, '/');
  let normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

  if (normalizedPath.startsWith('/products/')) {
    normalizedPath = `/uploads${normalizedPath}`;
  }

  return `${baseOrigin}${normalizedPath}`;
}
