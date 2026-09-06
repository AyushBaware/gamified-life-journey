import * as THREE from "three";

/** All textures are generated on <canvas> — zero asset files, zero network. */

export function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

export function toTexture(c: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  }
  t.anisotropy = 4;
  return t;
}

/** Warm paving stones for the running track */
export function makePavingTexture() {
  const { c, g } = makeCanvas(512, 512);
  const rand = seededRandom(73);
  g.fillStyle = "#646056";
  g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 8; row++) {
    for (let column = -1; column < 5; column++) {
      const x = column * 128 + (row % 2) * 64;
      const y = row * 64;
      const lightness = 51 + rand() * 10;
      g.fillStyle = `hsl(35, 9%, ${lightness}%)`;
      g.fillRect(x + 1.5, y + 1.5, 125, 61);
      g.fillStyle = "rgba(250,244,222,0.14)";
      g.fillRect(x + 2, y + 2, 124, 1);
      g.fillStyle = "rgba(25,28,20,0.15)";
      g.fillRect(x + 2, y + 61, 124, 1.5);
    }
  }
  for (let i = 0; i < 6000; i++) {
    g.fillStyle = rand() > 0.5 ? "rgba(255,252,229,0.075)" : "rgba(29,35,24,0.1)";
    g.fillRect(rand() * 512, rand() * 512, 1 + rand() * 2, 1);
  }
  return toTexture(c, true);
}

export function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeGrassTexture() {
  const { c, g } = makeCanvas(256, 256);
  const rand = seededRandom(17);
  g.fillStyle = "#536842";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3500; i++) {
    g.strokeStyle = `hsla(${76 + rand() * 30}, ${20 + rand() * 20}%, ${22 + rand() * 20}%, 0.55)`;
    const x = rand() * 256;
    const y = rand() * 256;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 1 + rand() * 3, y - 2 - rand() * 5);
    g.stroke();
  }
  return toTexture(c, true);
}

export function makeCloudTexture() {
  const { c, g } = makeCanvas(512, 256);
  const puffs = [[130, 145, 88], [222, 112, 105], [310, 125, 93], [375, 156, 68], [265, 153, 86]];
  for (const [x, y, r] of puffs) {
    const gradient = g.createRadialGradient(x - r * 0.15, y - r * 0.22, r * 0.2, x, y, r);
    gradient.addColorStop(0, "rgba(255,246,229,0.94)");
    gradient.addColorStop(0.58, "rgba(243,230,213,0.8)");
    gradient.addColorStop(0.83, "rgba(191,186,183,0.34)");
    gradient.addColorStop(1, "rgba(191,186,183,0)");
    g.fillStyle = gradient;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return toTexture(c);
}

/** Pool tiles */
export function makePoolTileTexture() {
  const { c, g } = makeCanvas(256, 256);
  g.fillStyle = "#7dd3e8";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(14,116,144,0.55)";
  g.lineWidth = 3;
  for (let i = 0; i <= 8; i++) {
    g.beginPath();
    g.moveTo((i / 8) * 256, 0);
    g.lineTo((i / 8) * 256, 256);
    g.stroke();
    g.beginPath();
    g.moveTo(0, (i / 8) * 256);
    g.lineTo(256, (i / 8) * 256);
    g.stroke();
  }
  for (let i = 0; i < 220; i++) {
    g.fillStyle = "rgba(255,255,255,0.12)";
    g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
  }
  return toTexture(c, true);
}

/** Red/white striped awning */
export function makeStripeTexture(a = "#D94F3D", b = "#F6EFE3") {
  const { c, g } = makeCanvas(256, 64);
  const n = 8;
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? b : a;
    g.fillRect((i / n) * 256, 0, 256 / n + 1, 64);
  }
  return toTexture(c, true);
}

/** Distant city skyline with lit windows */
export function makeSkylineTexture(tint = "#1C2438", windowColor = "#FFC97A") {
  const { c, g } = makeCanvas(1024, 256);
  g.clearRect(0, 0, 1024, 256);
  let x = 0;
  let i = 0;
  while (x < 1024) {
    const w = 40 + ((i * 53) % 70);
    const h = 70 + ((i * 97) % 150);
    g.fillStyle = tint;
    g.fillRect(x, 256 - h, w, h);
    // windows
    for (let wy = 256 - h + 10; wy < 246; wy += 16) {
      for (let wx = x + 6; wx < x + w - 8; wx += 13) {
        if ((wx * 7 + wy * 13 + i) % 5 < 2) {
          g.fillStyle = windowColor;
          g.globalAlpha = 0.5 + ((wx + wy) % 3) * 0.16;
          g.fillRect(wx, wy, 6, 8);
          g.globalAlpha = 1;
        }
      }
    }
    x += w + 6 + ((i * 31) % 18);
    i++;
  }
  return toTexture(c);
}

/** A soft round blob for fake shadows / glow discs */
export function makeBlobTexture(color = "0,0,0") {
  const { c, g } = makeCanvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, `rgba(${color},0.55)`);
  grad.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return toTexture(c);
}

/** Text on a transparent card — used for floating labels, banners, signs */
export function makeLabelTexture(
  text: string,
  { font = "600 42px 'Space Grotesk', sans-serif", color = "#F5F5F4", bg = "rgba(11,15,25,0.78)", pad = 26, radius = 18, border = "rgba(255,184,107,0.5)" }: { font?: string; color?: string; bg?: string; pad?: number; radius?: number; border?: string } = {},
) {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font;
  const w = Math.ceil(probe.measureText(text).width) + pad * 2;
  const h = 64 + pad;
  const { c, g } = makeCanvas(w, h);
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(2, 2, w - 4, h - 4, radius);
  g.fill();
  g.strokeStyle = border;
  g.lineWidth = 2;
  g.stroke();
  g.font = font;
  g.fillStyle = color;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 2);
  return { tex: toTexture(c), aspect: w / h };
}
