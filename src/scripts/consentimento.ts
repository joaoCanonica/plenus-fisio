// Preferências de consentimento (LGPD). Guardadas só no navegador do visitante.
// Categorias: "necessarios" (sempre; só esta preferência) e "medicao" (analytics, opcional).
export interface Preferencias {
  readonly medicao: boolean;
  readonly data: string;
}
const CHAVE = 'plenus-consentimento-v1';
const EVENTO = 'consentimento';

export function lerPreferencias(): Preferencias | null {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Preferencias | null;
    return v && typeof v.medicao === 'boolean' ? v : null;
  } catch {
    return null;
  }
}

export function gravarPreferencias(medicao: boolean): void {
  const p: Preferencias = { medicao, data: new Date().toISOString() };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    /* navegação privada: vale só nesta página */
  }
  dispatchEvent(new CustomEvent<Preferencias>(EVENTO, { detail: p }));
}

export function aoMudar(fn: (p: Preferencias) => void): void {
  addEventListener(EVENTO, (ev) => fn((ev as CustomEvent<Preferencias>).detail));
}
