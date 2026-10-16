// ============================================================
//  LEADERBOARD
//  Das Spiel spricht nur mit dieser Schnittstelle:
//     load()          → Promise<Eintrag[]>  (bestes zuerst)
//     submit(eintrag) → Promise<{ entries, rank }>
//  Jetzt speichern wir lokal im Browser. Später kommt ein ServerStore dazu,
//  ohne dass sich am Spiel etwas ändern muss.
// ============================================================
export const MAX_ENTRIES = 10;

const sortEntries = list => list.sort((a, b) => b.score - a.score || b.meters - a.meters);

export class LocalStore {
  constructor(key = 'jump-and-run.leaderboard') {
    this.key = key;
  }

  async load() {
    try {
      const list = JSON.parse(localStorage.getItem(this.key) || '[]');
      return Array.isArray(list) ? sortEntries(list).slice(0, MAX_ENTRIES) : [];
    } catch {
      return [];
    }
  }

  async submit(entry) {
    const list = await this.load();
    list.push(entry);
    sortEntries(list);
    const top = list.slice(0, MAX_ENTRIES);
    try { localStorage.setItem(this.key, JSON.stringify(top)); } catch { /* privates Fenster o. Ä. */ }
    return { entries: top, rank: top.indexOf(entry) };
  }
}

// Schafft es dieser Punktestand in die Top 10?
export function qualifies(entries, score) {
  if (score <= 0) return false;
  return entries.length < MAX_ENTRIES || score > entries[entries.length - 1].score;
}
