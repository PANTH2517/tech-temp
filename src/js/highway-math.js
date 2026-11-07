export const R = 34;
export const L = Math.PI * 2 * R;
export const INTRO = 0.1;

export function gateU(count) {
  const out = [];
  for (let k = 0; k < count; k++) {
    const r = count === 1 ? 0.5 : 0.12 + (0.78 * k) / (count - 1);
    out.push(INTRO + (1 - INTRO) * r);
  }
  return out;
}

export const gateArcs = count => gateU(count).map(u => u * L - 1.5);
