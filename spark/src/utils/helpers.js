/**
 * @mixpeek/spark — Helper Utilities
 */

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createCacheKey(content) {
  const str = JSON.stringify(content);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return `mixpeek_${Math.abs(hash).toString(36)}`;
}

export function sanitizeText(text, maxLength = 50000) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, maxLength);
}

export function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
        ? deepMerge(target[key], source[key]) : { ...source[key] };
    } else if (Array.isArray(source[key])) {
      result[key] = [...source[key]];
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try { new URL(url); return true; } catch { return false; }
}

export function extractDomain(url) {
  if (!isValidUrl(url)) return null;
  try { return new URL(url).hostname; } catch { return null; }
}

export default { generateId, createCacheKey, sanitizeText, deepMerge, isValidUrl, extractDomain };
