/**
 * Safe multi-environment clipboard copy utility
 * Gracefully handles insecure contexts, unsupported navigators, and iframe sandbox restrictions.
 */
export function copyToClipboard(text: string): boolean {
  if (typeof window === 'undefined') return false;

  // Try modern navigator.clipboard API if available
  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    try {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }

  return fallbackCopy(text);
}

function fallbackCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Fallback copy error:', err);
    return false;
  }
}
