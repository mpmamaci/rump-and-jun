// ============================================================
//  VOLLBILD
//  - Desktop, Android, iPad: echte Vollbild-API des Browsers
//  - iPhone: Safari erlaubt das nicht → Hinweis „Zum Home-Bildschirm“
//    (als App gestartet läuft das Spiel ohne Browserleisten)
// ============================================================
const root = document.documentElement;

// Als App vom Home-Bildschirm gestartet? Dann ist es schon so groß wie möglich.
export const isStandalone = () =>
  matchMedia('(display-mode: fullscreen)').matches ||
  matchMedia('(display-mode: standalone)').matches ||
  navigator.standalone === true;

export const canFullscreen = () => !!(root.requestFullscreen || root.webkitRequestFullscreen);

const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
export const isFullscreen = () => !!fullscreenElement() || isStandalone();

// Muss direkt aus einer Nutzeraktion (Klick/Taste) aufgerufen werden, sonst blockiert der Browser.
// Ergebnis: 'enter' | 'exit' | 'unsupported' | 'failed'
export async function toggleFullscreen() {
  if (fullscreenElement()) {
    await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    return 'exit';
  }
  if (!canFullscreen()) return 'unsupported';
  try {
    if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' });
    else root.webkitRequestFullscreen();
  } catch {
    return 'failed';
  }
  // Android: im Vollbild aufs Querformat festlegen (wo erlaubt)
  try { await screen.orientation?.lock?.('landscape'); } catch { /* nicht überall erlaubt */ }
  return 'enter';
}

export function onFullscreenChange(fn) {
  document.addEventListener('fullscreenchange', fn);
  document.addEventListener('webkitfullscreenchange', fn);
}
