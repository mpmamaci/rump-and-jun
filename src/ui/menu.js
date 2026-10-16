// ============================================================
//  MENÜS – Titel, Pause und Einstellungen teilen sich dieselbe Mechanik:
//  eine Liste von Punkten, ↑/↓ wählt, Leertaste/Enter bestätigt, Antippen geht auch.
// ============================================================
export const MENU_ITEM_H = 16;
export const MENU_ITEM_W = 200;

// Position der Menüpunkte – Renderer und Touch-Treffertest nutzen dieselben Werte
export function menuLayout(menu, viewWidth) {
  return menu.items.map((item, i) => ({
    item,
    x: viewWidth / 2 - MENU_ITEM_W / 2,
    y: menu.top + i * MENU_ITEM_H,
    w: MENU_ITEM_W,
    h: MENU_ITEM_H - 2,
  }));
}

export const labelOf = item => (typeof item.label === 'function' ? item.label() : item.label);

export function createMenu(title, top, items, onBack = null) {
  return { title, top, items, index: 0, onBack };
}

// Gibt true zurück, wenn die Taste fürs Menü war
export function menuKey(menu, code, repeat, sound) {
  const n = menu.items.length;
  if (code === 'ArrowUp' || code === 'KeyW' || code === 'ArrowLeft') {
    menu.index = (menu.index - 1 + n) % n; sound('blip'); return true;
  }
  if (code === 'ArrowDown' || code === 'KeyS' || code === 'ArrowRight') {
    menu.index = (menu.index + 1) % n; sound('blip'); return true;
  }
  if (!repeat && (code === 'Space' || code === 'Enter')) {
    sound('confirm');
    menu.items[menu.index].action();
    return true;
  }
  if (!repeat && code === 'Escape' && menu.onBack) { sound('blip'); menu.onBack(); return true; }
  return false;
}

export function menuTap(menu, x, y, viewWidth, sound) {
  const hit = menuLayout(menu, viewWidth).findIndex(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  if (hit < 0) return false;
  menu.index = hit;
  sound('confirm');
  menu.items[hit].action();
  return true;
}
