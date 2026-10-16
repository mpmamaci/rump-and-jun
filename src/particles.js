export const PARTICLE_LIFE = 0.5;

export function puff(particles, x, y, n, color = '#ffffff') {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 24 + Math.random() * 64;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 24, life: PARTICLE_LIFE, color });
  }
}

export function updateParticles(particles, dt) {
  for (const pt of particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 240 * dt; pt.life -= dt; }
  return particles.filter(pt => pt.life > 0);
}
