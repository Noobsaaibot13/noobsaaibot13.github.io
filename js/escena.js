// ==========================================================================
// ESCENA 3D DE ALTO RENDIMIENTO (CERO LAG) + LUZ QUE BAJA POCO A POCO +
// CÁMARAS DE LED CON 1 SOLA PUERTA + BOBINA DE MADERA AL RAS — LUIS CONCEPCION
// ==========================================================================
import * as THREE from 'three';
import { SVGRenderer } from '../vendor/SVGRenderer.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { CONFIG } from './configuracion.js';

const $ = id => document.getElementById(id);
const host = $('canvas');

let renderer, compat = false;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
} catch (e) {
  compat = true;
  renderer = new SVGRenderer();
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio = () => {};
  renderer.shadowMap = {};
  renderer.setAnimationLoop = fn => {
    function tick() {
      fn();
      requestAnimationFrame(tick);
    }
    tick();
  };
}

// Optimización máxima anti-lag: pixelRatio moderado y sin mapas de sombra pesados por fotograma
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
if ('toneMapping' in renderer) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
}
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
camera.position.set(8.2, 6.8, 12.6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3.0, 0);
controls.enableDamping = true;
controls.enabled = false;

const hemiLight = new THREE.HemisphereLight(0xfffaf2, 0x9e8470, 3.1);
scene.add(hemiLight);

const light = new THREE.DirectionalLight(0xfff4e5, 3.8);
light.position.set(3, 9, 6);
scene.add(light);

const fill = new THREE.DirectionalLight(0xffffff, 1.8);
fill.position.set(-5, 4, -4);
scene.add(fill);

// Textura ligera de madera
const tc = document.createElement('canvas');
tc.width = 128;
tc.height = 256;
const ctxWood = tc.getContext('2d');
ctxWood.fillStyle = '#795338';
ctxWood.fillRect(0, 0, 128, 256);
let seed = 77;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
for (let i = 0; i < 180; i++) {
  const x = rnd() * 128;
  ctxWood.strokeStyle = `rgba(${rnd() > 0.5 ? '39,18,8' : '203,161,111'},${rnd() * 0.16})`;
  ctxWood.lineWidth = 0.5 + rnd() * 1.1;
  ctxWood.beginPath();
  for (let y = 0; y < 260; y += 16) {
    const xx = x + Math.sin(y * 0.02 + i) * 1.8;
    y ? ctxWood.lineTo(xx, y) : ctxWood.moveTo(xx, y);
  }
  ctxWood.stroke();
}
const texWood = new THREE.CanvasTexture(tc);
texWood.colorSpace = THREE.SRGBColorSpace;

// Materiales ligeros (MeshLambertMaterial / MeshStandardMaterial sin clearcoat pesado) para evitar lag
const wood = new THREE.MeshLambertMaterial({
  map: texWood,
  color: compat ? 0x593920 : 0xdfbfa0
});
const woodDark = new THREE.MeshLambertMaterial({
  map: texWood,
  color: compat ? 0x422916 : 0xb38b67
});
const brass = new THREE.MeshStandardMaterial({
  color: 0xc59f61,
  metalness: 0.6,
  roughness: 0.32
});
const steelMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  metalness: 0.65,
  roughness: 0.28
});
const glass = new THREE.MeshBasicMaterial({
  color: 0xd8ecea,
  transparent: true,
  opacity: 0.11,
  depthWrite: false,
  side: THREE.DoubleSide
});
const glassBanquet = new THREE.MeshBasicMaterial({
  color: 0xe6ddd3,
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
  side: THREE.DoubleSide
});

function box(parent, w, h, d, x, y, z, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

// ==========================================================================
// GRUPO MAESTRO (conjuntoTotal) PARA DAR VUELTA 360° A TODO EL MONTAJE
// ==========================================================================
const conjuntoTotal = new THREE.Group();
scene.add(conjuntoTotal);

const base = new THREE.Group();
conjuntoTotal.add(base);
base.position.y = 1;
box(base, 5.25, 0.22, 4.05, 0, 0, 0, wood);
for (const x of [-2.52, 2.52]) box(base, 0.14, 0.29, 4.08, x, 0.12, 0, woodDark);
for (const z of [-1.96, 1.96]) box(base, 5.1, 0.26, 0.12, 0, 0.11, z, woodDark);

// ==========================================================================
// FOCO SUPERIOR 3D CON TRANSICIÓN CONTINUA POCO A POCO DE LUZ Y COLOR
// ==========================================================================
const focoSuperior3D = new THREE.Group();
focoSuperior3D.position.set(0, 6.45, 0.4);
conjuntoTotal.add(focoSuperior3D);

box(focoSuperior3D, 0.09, 0.9, 0.09, 0, 0.55, 0, brass);
const campanaFoco = new THREE.Mesh(
  new THREE.ConeGeometry(0.58, 0.4, 16, 1, true),
  brass
);
campanaFoco.position.set(0, 0.06, 0);
focoSuperior3D.add(campanaFoco);

const bombillaFocoMat = new THREE.MeshBasicMaterial({ color: 0xfff8dc });
const bombillaFocoMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), bombillaFocoMat);
bombillaFocoMesh.position.set(0, -0.06, 0);
focoSuperior3D.add(bombillaFocoMesh);

const conoLuzMat = new THREE.MeshBasicMaterial({
  color: 0xfff3c4,
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
  side: THREE.DoubleSide
});
const conoLuzMesh = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.2, 16, 1, true), conoLuzMat);
conoLuzMesh.position.set(0, -2.15, 0);
focoSuperior3D.add(conoLuzMesh);

// Interpola poco a poco la luz y el color del fondo (sin saltar nunca de blanco a negro)
export function actualizarFocoSuperiorProgresivo(brillo, posY, posZ) {
  focoSuperior3D.position.y = posY;
  focoSuperior3D.position.z = posZ;

  const b = Math.max(0, Math.min(1, brillo));
  conoLuzMat.opacity = b * 0.22;

  // Color de la bombilla del foco superior: pasa gradualmente de encendido cálido a apagado
  const br = Math.round(28 + b * 227);
  const bg = Math.round(38 + b * 208);
  const bb = Math.round(54 + b * 166);
  bombillaFocoMat.color.setRGB(br / 255, bg / 255, bb / 255);

  // Luces 3D del escenario: bajan poco a poco y vuelven al color normal poco a poco
  hemiLight.intensity = 0.48 + b * 2.62;
  light.intensity = 0.55 + b * 3.25;
  fill.intensity = 0.3 + b * 1.5;

  // Color de fondo de la página: interpola poco a poco desde el color normal (245, 239, 232)
  // hasta oscuro (9, 13, 22) y de vuelta al color normal (245, 239, 232)
  const bgR = Math.round(9 + b * (245 - 9));
  const bgG = Math.round(13 + b * (239 - 13));
  const bgB = Math.round(22 + b * (232 - 22));
  document.body.style.backgroundColor = `rgb(${bgR}, ${bgG}, ${bgB})`;
}

// ==========================================================================
// CUBIERTA EXTERIOR TIPO BANQUETE
// ==========================================================================
const cubiertaBanquete = new THREE.Group();
conjuntoTotal.add(cubiertaBanquete);
box(cubiertaBanquete, 5.16, 0.2, 3.92, 0, 2.28, 0, wood);
box(cubiertaBanquete, 4.65, 0.22, 3.42, 0, 2.46, 0, woodDark);
box(cubiertaBanquete, 1.45, 0.1, 0.45, 0, 2.6, 0, brass);
box(cubiertaBanquete, 0.95, 0.08, 0.12, 0, 2.86, 0, brass);
box(cubiertaBanquete, 0.09, 0.24, 0.1, -0.42, 2.72, 0, brass);
box(cubiertaBanquete, 0.09, 0.24, 0.1, 0.42, 2.72, 0, brass);

for (const x of [-2.46, 2.46]) {
  for (const z of [-1.84, 1.84]) {
    box(cubiertaBanquete, 0.18, 4.42, 0.18, x, 0.02, z, woodDark);
  }
}
for (const x of [-2.46, 2.46]) box(cubiertaBanquete, 0.16, 0.18, 3.84, x, -2.12, 0, brass);
for (const z of [-1.84, 1.84]) box(cubiertaBanquete, 5.08, 0.18, 0.16, 0, -2.12, z, brass);

box(cubiertaBanquete, 4.76, 4.18, 0.03, 0, 0.02, 1.84, glassBanquet);
box(cubiertaBanquete, 4.76, 4.18, 0.03, 0, 0.02, -1.84, glassBanquet);
box(cubiertaBanquete, 0.03, 4.18, 3.52, -2.46, 0.02, 0, glassBanquet);
box(cubiertaBanquete, 0.03, 4.18, 3.52, 2.46, 0.02, 0, glassBanquet);
cubiertaBanquete.position.set(0, 3.28, 0);

// ==========================================================================
// LAS 3 CAJAS DE EXPERIMENTO
// ==========================================================================
const frames = [];
const zs = [1.1, 0, -1.1];

function crearCajitaRegalo(conCandado = false, colorCuerpo = woodDark) {
  const grp = new THREE.Group();
  box(grp, 0.42, 0.36, 0.22, 0, 0, 0, colorCuerpo);
  box(grp, 0.055, 0.37, 0.23, 0, 0, 0, brass);
  box(grp, 0.43, 0.37, 0.055, 0, 0, 0, brass);
  const tapaPivot = new THREE.Group();
  tapaPivot.position.set(0, 0.18, -0.11);
  grp.add(tapaPivot);
  box(tapaPivot, 0.46, 0.065, 0.24, 0, 0.03, 0.11, colorCuerpo);
  box(tapaPivot, 0.13, 0.055, 0.13, 0, 0.08, 0.11, brass);

  let candadoMesh = null;
  if (conCandado) {
    candadoMesh = new THREE.Group();
    candadoMesh.position.set(0, 0.02, 0.14);
    box(candadoMesh, 0.14, 0.14, 0.05, 0, -0.04, 0, brass);
    const arco = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 12, Math.PI), steelMat);
    arco.position.set(0, 0.03, 0);
    candadoMesh.add(arco);
    grp.add(candadoMesh);
  }

  grp.userData = { tapaPivot, candadoMesh };
  return grp;
}

for (let n = 0; n < 3; n++) {
  const g = new THREE.Group();
  g.position.z = zs[n];
  conjuntoTotal.add(g);
  frames.push(g);

  for (const x of [-2.08, 2.08]) box(g, 0.22, 4.1, 0.4, x, 2.22, 0, wood);
  for (const y of [0.27, 4.17]) box(g, 4.0, 0.22, 0.4, 0, y, 0, wood);

  for (const z of [-0.18, 0.18]) {
    box(g, 3.96, 3.68, 0.025, 0, 2.22, z, glass);
    const ed = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(3.96, 3.68, 0.025)),
      new THREE.LineBasicMaterial({ color: 0xabc1bc, transparent: true, opacity: 0.42 })
    );
    ed.position.set(0, 2.22, z);
    g.add(ed);
  }

  box(g, 0.54, 0.16, 0.04, 0, 4.18, 0.215, brass);
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const ct = c.getContext('2d');
  ct.font = 'bold 40px Georgia';
  ct.textAlign = 'center';
  ct.fillStyle = '#35271d';
  ct.fillText(String(n + 1), 64, 46);
  const t = new THREE.CanvasTexture(c);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.15),
    new THREE.MeshBasicMaterial({ map: t, transparent: true })
  );
  label.position.set(0, 4.18, 0.24);
  g.add(label);

  for (const x of [-1.93, 1.93]) {
    for (const y of [0.29, 4.15]) {
      for (const z of [-0.211, 0.211]) {
        const screw = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), brass);
        screw.position.set(x, y, z);
        g.add(screw);
      }
    }
  }
  for (const x of [-1.9, 1.9]) box(base, 0.035, 0.018, 0.55, x, 0.112, zs[n], brass);
}

for (const frame of frames) {
  for (const part of frame.children) part.position.y -= 2.22;
  frame.position.y = 3.22;
}

// ==========================================================================
// MONTAJE 1: PAREDES CORREGIDAS (1 SOLA PUERTA POR LED, CERRADO CERCA DEL FOCO)
// ==========================================================================
const f1 = frames[0];

const linterna3D = new THREE.Group();
linterna3D.position.set(-2.22, 0.0, 0);
const cuerpoLinterna = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.42, 12), brass);
cuerpoLinterna.rotation.z = Math.PI / 2;
linterna3D.add(cuerpoLinterna);
const focoLinternaMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.13, 0.13, 0.06, 12),
  new THREE.MeshBasicMaterial({ color: 0x332211 })
);
focoLinternaMesh.rotation.z = Math.PI / 2;
focoLinternaMesh.position.x = 0.22;
linterna3D.add(focoLinternaMesh);
f1.add(linterna3D);

const regalo1 = crearCajitaRegalo(false, woodDark);
regalo1.position.set(1.42, -1.35, 0);
f1.add(regalo1);

// Lienzo optimizado (640 x 593 con escala interna a 820 x 760 para máximo rendimiento y nitidez)
const optCanvas = document.createElement('canvas');
optCanvas.width = 640;
optCanvas.height = 593;
const optCtx = optCanvas.getContext('2d');
optCtx.scale(640 / 820, 593 / 760);
const optTexture = new THREE.CanvasTexture(optCanvas);
optTexture.colorSpace = THREE.SRGBColorSpace;

const optPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(3.92, 3.64),
  new THREE.MeshBasicMaterial({ map: optTexture, transparent: true, side: THREE.DoubleSide })
);
f1.add(optPlane);

export const OpticaMontaje1 = {
  W: 820,
  H: 760,
  linternaEncendida: false,

  // PAREDES CORREGIDAS: Cada uno de los 4 LEDs tiene UNA SOLA PUERTA de entrada,
  // y la pared izquierda cercana al foco de la linterna está completamente cerrada.
  walls: [
    // Marco exterior de la caja
    { x: 10, y: 10, w: 800, h: 16 },
    { x: 10, y: 734, w: 800, h: 16 },
    { x: 10, y: 10, w: 16, h: 740 },
    { x: 794, y: 10, w: 16, h: 740 },

    // Habitación de LED 1 (Superior Izquierda): cerrada a izquierda, arriba y derecha;
    // tiene UNA SOLA ABERTURA estrecha de 14 px abajo (x = 223..237) para la Lupa.
    { x: 140, y: 26, w: 16, h: 148 },
    { x: 330, y: 26, w: 16, h: 148 },
    { x: 156, y: 158, w: 67, h: 16 },
    { x: 237, y: 158, w: 93, h: 16 },

    // Habitación de LED 2 (Inferior Izquierda): pared izquierda CERRADA cerca del foco (x=140),
    // techo cerrado (y=495) y UNA SOLA PUERTA a la derecha (y=590..670).
    { x: 140, y: 495, w: 16, h: 239 },
    { x: 140, y: 495, w: 196, h: 16 },
    { x: 320, y: 511, w: 16, h: 79 },
    { x: 320, y: 670, w: 16, h: 64 },

    // Habitación de LED 3 (Superior Derecha): piso cerrado (y=224) y UNA SOLA PUERTA a la izquierda (y=85..155).
    { x: 635, y: 26, w: 16, h: 59 },
    { x: 635, y: 155, w: 16, h: 85 },
    { x: 635, y: 224, w: 159, h: 16 },

    // Habitación de LED 4 (Media Derecha - Arcoíris): techo cerrado (y=340), piso cerrado (y=555)
    // y UNA SOLA PUERTA a la izquierda (y=395..505).
    { x: 695, y: 340, w: 99, h: 16 },
    { x: 695, y: 340, w: 16, h: 55 },
    { x: 695, y: 505, w: 16, h: 50 },

    // Esquina inferior derecha donde está encerrado el Regalo 1 (con la Masita)
    { x: 565, y: 555, w: 229, h: 16 },
    { x: 565, y: 555, w: 16, h: 179, esCompuertaRegalo: true }
  ],

  nodosAnclaje: [
    { x: 230, y: 380 },
    { x: 230, y: 232 },
    { x: 410, y: 380 },
    { x: 410, y: 630 },
    { x: 560, y: 380 },
    { x: 560, y: 120 },
    { x: 645, y: 380 }
  ],

  sensores: [
    { id: 'LDR-1', titulo: 'LED 1 · Focalizada (Lupa)', x: 230, y: 92, radius: 18, reqTipo: 'lupa', reqHaces: 6, hacesRecibidos: 0, activo: false },
    { id: 'LDR-2', titulo: 'LED 2 · Reflejada (Espejo)', x: 215, y: 630, radius: 24, reqTipo: 'espejo', reqHaces: 6, hacesRecibidos: 0, activo: false },
    { id: 'LDR-3', titulo: 'LED 3 · Dividida (5 Haces)', x: 725, y: 120, radius: 22, reqTipo: 'dividida', reqHaces: 5, hacesRecibidos: 0, activo: false },
    { id: 'LDR-4', titulo: 'LED 4 · Arcoíris (Prisma)', x: 750, y: 450, radius: 28, reqTipo: 'arcoiris', reqHaces: 15, hacesRecibidos: 0, coloresRecibidos: new Set(), activo: false }
  ],

  catalogo: [
    { type: 'divisor', name: 'Divisor Haz', max: 3, defaultAngle: -45, radius: 30 },
    { type: 'espejo', name: 'Espejo Plano', max: 2, defaultAngle: -45, radius: 30 },
    { type: 'lupa', name: 'Lupa Focal', max: 2, defaultAngle: 0, radius: 34 },
    { type: 'prisma', name: 'Prisma 3 Lados', max: 1, defaultAngle: 48, radius: 42 }
  ],

  piezas: [],
  piezaSeleccionadaId: null,
  nextId: 1,
  segmentosTrazados: [],
  bandasArcoiris: [
    { name: 'Rojo', n: 1.51, color: '#ff3b30' },
    { name: 'Naranja', n: 1.53, color: '#ff9500' },
    { name: 'Verde', n: 1.55, color: '#34c759' },
    { name: 'Cian', n: 1.58, color: '#00f5ea' },
    { name: 'Violeta', n: 1.60, color: '#c084fc' }
  ],

  restantes(type) {
    const item = this.catalogo.find(c => c.type === type);
    if (!item) return 0;
    const usados = this.piezas.filter(p => p.type === type).length;
    return Math.max(0, item.max - usados);
  },

  cargarDemostracionCompleta() {
    this.linternaEncendida = true;
    this.piezas = [
      { id: 'p1', type: 'divisor', x: 230, y: 380, angle: -45, radius: 30 },
      { id: 'p2', type: 'lupa', x: 230, y: 232, angle: 0, radius: 34 },
      { id: 'p3', type: 'divisor', x: 410, y: 380, angle: 45, radius: 30 },
      { id: 'p4', type: 'espejo', x: 410, y: 630, angle: -45, radius: 30 },
      { id: 'p5', type: 'divisor', x: 560, y: 380, angle: -45, radius: 30 },
      { id: 'p6', type: 'espejo', x: 560, y: 120, angle: -45, radius: 30 },
      { id: 'p7', type: 'prisma', x: 645, y: 380, angle: 48, radius: 42 }
    ];
    this.piezaSeleccionadaId = 'p2';
    this.recalcularRayos();
  },

  interseccionSegmento(ox, oy, dx, dy, x1, y1, x2, y2) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const denom = dx * vy - dy * vx;
    if (Math.abs(denom) < 1e-8) return null;
    const t = ((x1 - ox) * vy - (y1 - oy) * vx) / denom;
    const u = ((x1 - ox) * dy - (y1 - oy) * dx) / denom;
    if (t > 0.6 && u >= 0 && u <= 1) {
      return { t, x: ox + t * dx, y: oy + t * dy };
    }
    return null;
  },

  reflejar(dx, dy, nx, ny) {
    const dot = dx * nx + dy * ny;
    return { dx: dx - 2 * dot * nx, dy: dy - 2 * dot * ny };
  },

  refractarSnell(dx, dy, nx, ny, n1, n2) {
    let cosI = -(dx * nx + dy * ny);
    let nxx = nx, nyy = ny;
    if (cosI < 0) {
      nxx = -nx;
      nyy = -ny;
      cosI = -cosI;
    }
    const eta = n1 / n2;
    const k = 1 - eta * eta * (1 - cosI * cosI);
    if (k < 0) return this.reflejar(dx, dy, nxx, nyy);
    const cosT = Math.sqrt(k);
    const rx = eta * dx + (eta * cosI - cosT) * nxx;
    const ry = eta * dy + (eta * cosI - cosT) * nyy;
    const l = Math.hypot(rx, ry) || 1;
    return { dx: rx / l, dy: ry / l };
  },

  verticesPrisma(p) {
    const rad = (p.angle * Math.PI) / 180;
    const verts = [];
    for (let k = 0; k < 3; k++) {
      const a = rad + (k * 2 * Math.PI) / 3;
      verts.push({ x: p.x + p.radius * Math.cos(a), y: p.y + p.radius * Math.sin(a) });
    }
    return verts;
  },

  recalcularRayos() {
    this.segmentosTrazados = [];
    for (const s of this.sensores) {
      s.hacesRecibidos = 0;
      if (s.coloresRecibidos) s.coloresRecibidos.clear();
      s.activo = false;
    }

    focoLinternaMesh.material.color.setHex(this.linternaEncendida ? 0xfff8d6 : 0x332211);

    if (!this.linternaEncendida) {
      this.dibujarCanvasOptico();
      return false;
    }

    for (let i = -4; i <= 4; i++) {
      const oy = 380 + i * 4;
      this.trazarRayo({
        ox: 54,
        oy,
        dx: 1,
        dy: 0,
        color: '#ffffff',
        bandName: null,
        passedLupa: false,
        bouncedMirror: false,
        hasSplit: false,
        depth: 0
      });
    }

    let activas = 0;
    for (const s of this.sensores) {
      if (s.reqTipo === 'arcoiris') {
        s.activo = s.hacesRecibidos >= s.reqHaces && s.coloresRecibidos.size >= 3;
      } else {
        s.activo = s.hacesRecibidos >= s.reqHaces;
      }
      if (s.activo) activas++;
    }

    this.dibujarCanvasOptico();
    return activas === 4;
  },

  trazarRayo(ray) {
    if (ray.depth > 12) return;
    let closest = null;

    for (const w of this.walls) {
      const edges = [
        [w.x, w.y, w.x + w.w, w.y],
        [w.x + w.w, w.y, w.x + w.w, w.y + w.h],
        [w.x + w.w, w.y + w.h, w.x, w.y + w.h],
        [w.x, w.y + w.h, w.x, w.y]
      ];
      for (const [x1, y1, x2, y2] of edges) {
        const hit = this.interseccionSegmento(ray.ox, ray.oy, ray.dx, ray.dy, x1, y1, x2, y2);
        if (hit && (!closest || hit.t < closest.t)) {
          closest = { ...hit, hitType: 'wall' };
        }
      }
    }

    for (const s of this.sensores) {
      const hitH = this.interseccionSegmento(
        ray.ox, ray.oy, ray.dx, ray.dy,
        s.x - s.radius, s.y, s.x + s.radius, s.y
      );
      const hitV = this.interseccionSegmento(
        ray.ox, ray.oy, ray.dx, ray.dy,
        s.x, s.y - s.radius, s.x, s.y + s.radius
      );
      const hit = hitH && hitV ? (hitH.t < hitV.t ? hitH : hitV) : hitH || hitV;
      if (hit && (!closest || hit.t < closest.t)) {
        closest = { ...hit, hitType: 'sensor', sensor: s };
      }
    }

    for (const p of this.piezas) {
      if (p.type === 'espejo' || p.type === 'divisor' || p.type === 'lupa') {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad);
        const ty = Math.sin(rad);
        const nx = -ty;
        const ny = tx;
        const hit = this.interseccionSegmento(
          ray.ox, ray.oy, ray.dx, ray.dy,
          p.x - tx * p.radius, p.y - ty * p.radius,
          p.x + tx * p.radius, p.y + ty * p.radius
        );
        if (hit && (!closest || hit.t < closest.t)) {
          closest = { ...hit, hitType: p.type, piece: p, tx, ty, nx, ny };
        }
      } else if (p.type === 'prisma') {
        const verts = this.verticesPrisma(p);
        for (let k = 0; k < 3; k++) {
          const v1 = verts[k];
          const v2 = verts[(k + 1) % 3];
          const hit = this.interseccionSegmento(ray.ox, ray.oy, ray.dx, ray.dy, v1.x, v1.y, v2.x, v2.y);
          if (hit && (!closest || hit.t < closest.t)) {
            const ex = v2.x - v1.x, ey = v2.y - v1.y;
            const el = Math.hypot(ex, ey) || 1;
            closest = { ...hit, hitType: 'prisma', piece: p, nx: -ey / el, ny: ex / el, verts };
          }
        }
      }
    }

    if (!closest) return;

    this.segmentosTrazados.push({
      x1: ray.ox,
      y1: ray.oy,
      x2: closest.x,
      y2: closest.y,
      color: ray.color
    });

    if (closest.hitType === 'wall') return;

    if (closest.hitType === 'sensor') {
      const s = closest.sensor;
      if (s.reqTipo === 'lupa' && ray.passedLupa) {
        s.hacesRecibidos++;
      } else if (s.reqTipo === 'espejo' && ray.bouncedMirror) {
        s.hacesRecibidos++;
      } else if (s.reqTipo === 'dividida' && ray.hasSplit) {
        s.hacesRecibidos++;
      } else if (s.reqTipo === 'arcoiris' && ray.bandName) {
        s.hacesRecibidos++;
        s.coloresRecibidos.add(ray.bandName);
      }
      return;
    }

    if (closest.hitType === 'espejo') {
      const refl = this.reflejar(ray.dx, ray.dy, closest.nx, closest.ny);
      this.trazarRayo({
        ...ray,
        ox: closest.x,
        oy: closest.y,
        dx: refl.dx,
        dy: refl.dy,
        bouncedMirror: true,
        depth: ray.depth + 1
      });
      return;
    }

    if (closest.hitType === 'divisor') {
      const refl = this.reflejar(ray.dx, ray.dy, closest.nx, closest.ny);
      this.trazarRayo({
        ...ray,
        ox: closest.x,
        oy: closest.y,
        dx: refl.dx,
        dy: refl.dy,
        hasSplit: true,
        depth: ray.depth + 1
      });
      this.trazarRayo({
        ...ray,
        ox: closest.x,
        oy: closest.y,
        dx: ray.dx,
        dy: ray.dy,
        hasSplit: true,
        depth: ray.depth + 1
      });
      return;
    }

    if (closest.hitType === 'lupa') {
      const f = 68;
      let axisX = closest.nx;
      let axisY = closest.ny;
      if (ray.dx * axisX + ray.dy * axisY < 0) {
        axisX = -axisX;
        axisY = -axisY;
      }
      const tangX = -axisY;
      const tangY = axisX;
      const h = (closest.x - closest.piece.x) * tangX + (closest.y - closest.piece.y) * tangY;
      const inLat = ray.dx * tangX + ray.dy * tangY;
      const inAx = Math.max(0.1, ray.dx * axisX + ray.dy * axisY);
      const slopeOut = inLat / inAx - h / f;
      const outX = axisX + slopeOut * tangX;
      const outY = axisY + slopeOut * tangY;
      const len = Math.hypot(outX, outY) || 1;
      this.trazarRayo({
        ...ray,
        ox: closest.x,
        oy: closest.y,
        dx: outX / len,
        dy: outY / len,
        passedLupa: true,
        depth: ray.depth + 1
      });
      return;
    }

    if (closest.hitType === 'prisma') {
      const bandas = ray.bandName
        ? this.bandasArcoiris.filter(b => b.name === ray.bandName)
        : this.bandasArcoiris;
      for (const b of bandas) {
        const inside = this.refractarSnell(ray.dx, ray.dy, closest.nx, closest.ny, 1.0, b.n);
        let exitHit = null;
        const verts = closest.verts;
        for (let k = 0; k < 3; k++) {
          const v1 = verts[k];
          const v2 = verts[(k + 1) % 3];
          const h2 = this.interseccionSegmento(
            closest.x, closest.y, inside.dx, inside.dy, v1.x, v1.y, v2.x, v2.y
          );
          if (h2 && (!exitHit || h2.t < exitHit.t)) {
            const ex = v2.x - v1.x, ey = v2.y - v1.y;
            const el = Math.hypot(ex, ey) || 1;
            exitHit = { ...h2, nx: -ey / el, ny: ex / el };
          }
        }
        if (exitHit) {
          this.segmentosTrazados.push({
            x1: closest.x,
            y1: closest.y,
            x2: exitHit.x,
            y2: exitHit.y,
            color: b.color
          });
          const outside = this.refractarSnell(inside.dx, inside.dy, exitHit.nx, exitHit.ny, b.n, 1.0);
          this.trazarRayo({
            ...ray,
            ox: exitHit.x,
            oy: exitHit.y,
            dx: outside.dx,
            dy: outside.dy,
            color: b.color,
            bandName: b.name,
            depth: ray.depth + 1
          });
        }
      }
    }
  },

  dibujarCanvasOptico() {
    const ctx = optCtx;
    ctx.clearRect(0, 0, this.W, this.H);

    ctx.fillStyle = 'rgba(8, 12, 22, 0.88)';
    ctx.fillRect(16, 16, this.W - 32, this.H - 32);

    ctx.fillStyle = '#fde68a';
    ctx.font = 'italic 11.5px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('← Estrecho (14 px) →', 230, 186);

    for (const n of this.nodosAnclaje) {
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const w of this.walls) {
      ctx.fillStyle = w.esCompuertaRegalo ? '#d97706' : '#3a2415';
      ctx.strokeStyle = w.esCompuertaRegalo ? '#fef08a' : '#a37048';
      ctx.lineWidth = 1.6;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    }

    // Boca de la Linterna con halo luminoso
    ctx.save();
    if (this.linternaEncendida) {
      const halo = ctx.createRadialGradient(54, 380, 4, 54, 380, 62);
      halo.addColorStop(0, 'rgba(255, 250, 210, 0.95)');
      halo.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
      halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(54, 380, 62, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = this.linternaEncendida ? '#fde047' : '#475569';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(22, 352, 34, 56, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 11px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(this.linternaEncendida ? 'ON' : 'OFF', 39, 384);
    ctx.restore();

    // Haces luminosos con brillo rápido (sin shadowBlur costoso)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const seg of this.segmentosTrazados) {
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 6.5;
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
    for (const seg of this.segmentosTrazados) {
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
    ctx.restore();

    // Los 4 LEDs brillantes cada uno dentro de su cámara de 1 sola puerta
    for (const s of this.sensores) {
      ctx.save();
      if (s.activo || s.hacesRecibidos > 0) {
        const ledColor = s.activo ? 'rgba(16, 185, 129, 0.88)' : 'rgba(245, 158, 11, 0.72)';
        const ledHalo = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.radius * 2.5);
        ledHalo.addColorStop(0, ledColor);
        ledHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ledHalo;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = s.activo ? '#10b981' : s.hacesRecibidos > 0 ? '#f59e0b' : '#1e293b';
      ctx.strokeStyle = s.activo ? '#a7f3d0' : '#94a3b8';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.min(s.hacesRecibidos, s.reqHaces)}/${s.reqHaces}`, s.x, s.y + 4);

      ctx.fillStyle = s.activo ? '#6ee7b7' : '#f8fafc';
      ctx.font = 'bold 11.5px Georgia';
      ctx.fillText(s.titulo, s.x, s.y + s.radius + 16);
      ctx.restore();
    }

    for (const p of this.piezas) {
      ctx.save();
      ctx.translate(p.x, p.y);
      const rad = (p.angle * Math.PI) / 180;

      if (p.id === this.piezaSeleccionadaId) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, p.radius + 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.rotate(rad);
      if (p.type === 'espejo') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(-p.radius, -6, p.radius * 2, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-p.radius, 0);
        ctx.lineTo(p.radius, 0);
        ctx.stroke();
      } else if (p.type === 'divisor') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.setLineDash([7, 4]);
        ctx.beginPath();
        ctx.moveTo(-p.radius, 0);
        ctx.lineTo(p.radius, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (p.type === 'lupa') {
        ctx.fillStyle = 'rgba(125, 211, 252, 0.45)';
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-p.radius, 0);
        ctx.quadraticCurveTo(0, -15, p.radius, 0);
        ctx.quadraticCurveTo(0, 15, -p.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'prisma') {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.42)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          const a = (k * 2 * Math.PI) / 3;
          const vx = p.radius * Math.cos(a);
          const vy = p.radius * Math.sin(a);
          k === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    optTexture.needsUpdate = true;
  }
};
OpticaMontaje1.dibujarCanvasOptico();

// ==========================================================================
// MONTAJE 2: 4 RESORTES HELICOIDALES, 1 MASITA, 2 VIDAS Y 2 MINUTOS
// ==========================================================================
const f2 = frames[1];

const regalo2 = crearCajitaRegalo(false, wood);
regalo2.position.set(1.42, -1.38, 0);
f2.add(regalo2);

const springCanvas = document.createElement('canvas');
springCanvas.width = 640;
springCanvas.height = 593;
const spCtx = springCanvas.getContext('2d');
spCtx.scale(640 / 820, 593 / 760);
const springTexture = new THREE.CanvasTexture(springCanvas);
springTexture.colorSpace = THREE.SRGBColorSpace;

const springPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(3.92, 3.64),
  new THREE.MeshBasicMaterial({ map: springTexture, transparent: true, side: THREE.DoubleSide })
);
f2.add(springPlane);

export const ResortesMontaje2 = {
  W: 820,
  H: 760,
  dirty: true,
  vidas: CONFIG.vidasInicialesMontaje2,
  tiempoRestante: CONFIG.tiempoMaximoMontaje2Segundos,
  ultimoSegundoDibujado: 120,
  cronometroActivo: false,
  gameOver: false,
  completado: false,
  masitaRecibida: false,

  masita: {
    x: 690,
    y: 255,
    homeX: 690,
    homeY: 255,
    radius: 30,
    resorteColgadoId: null
  },

  resortes: [
    { id: 'A', nombre: 'Resorte A', nota: 'Alambre grueso', x: 115, topY: 215, baseLen: 185, currentExt: 0, targetExt: 0, vel: 0, k: 3.4, wireW: 5.5, coils: 11, deformacionPlastica: 0, color: '#cbd5e1' },
    { id: 'B', nombre: 'Resorte B', nota: 'Alambre muy fino', x: 245, topY: 215, baseLen: 185, currentExt: 0, targetExt: 0, vel: 0, k: 0.65, wireW: 2.2, coils: 14, deformacionPlastica: 0, color: '#94a3b8' },
    { id: 'C', nombre: 'Resorte C', nota: 'Latón blando', x: 375, topY: 215, baseLen: 185, currentExt: 0, targetExt: 0, vel: 0, k: 1.5, wireW: 3.4, coils: 12, deformacionPlastica: 0, color: '#f59e0b' },
    { id: 'D', nombre: 'Resorte D', nota: 'Acero elástico', x: 505, topY: 215, baseLen: 185, currentExt: 0, targetExt: 0, vel: 0, k: 1.08, wireW: 3.8, coils: 12, deformacionPlastica: 0, color: '#38bdf8' }
  ],

  compuertaAbierta: false,
  mensajeEstado: 'Agarra la Masita de la cajilla superior derecha y cuélgala en el resorte correcto.',

  reiniciarMontaje2() {
    this.vidas = CONFIG.vidasInicialesMontaje2;
    this.tiempoRestante = CONFIG.tiempoMaximoMontaje2Segundos;
    this.gameOver = false;
    this.completado = false;
    this.cronometroActivo = true;
    this.masita.resorteColgadoId = null;
    this.masita.x = this.masita.homeX;
    this.masita.y = this.masita.homeY;
    for (const r of this.resortes) {
      r.currentExt = 0;
      r.targetExt = 0;
      r.vel = 0;
      r.deformacionPlastica = 0;
    }
    this.mensajeEstado = 'Sistema reiniciado (2 vidas y 02:00). Arrastra la Masita al resorte que resuelve el acertijo.';
    this.dirty = true;
    this.dibujarCanvasResortes();
  },

  colgarMasitaEnResorte(resorteId, onCorrectoCallback) {
    if (this.gameOver || this.completado) return;
    const r = this.resortes.find(x => x.id === resorteId);
    if (!r) return;

    this.masita.resorteColgadoId = r.id;
    this.dirty = true;
    if (r.id === 'A') {
      r.targetExt = 36;
      this.registrarFallo('Resorte A: Muy rígido, apenas se estira y no alcanza el seguro.');
    } else if (r.id === 'B') {
      r.targetExt = 185;
      this.registrarFallo('Resorte B: Demasiado flexible, sobrepasa la zona del seguro.');
    } else if (r.id === 'C') {
      r.targetExt = 122;
      r.deformacionPlastica = 68;
      this.registrarFallo('Resorte C: Superó su límite elástico y sufrió deformación permanente.');
    } else if (r.id === 'D') {
      r.targetExt = 112;
      this.completado = true;
      this.cronometroActivo = false;
      this.compuertaAbierta = true;
      this.mensajeEstado = '¡Correcto! El Resorte D alcanza el seguro y conserva su elasticidad. Entregando Cable al Montaje 3...';
      if (onCorrectoCallback) onCorrectoCallback();
    }
  },

  registrarFallo(motivo) {
    this.vidas = Math.max(0, this.vidas - 1);
    this.dirty = true;
    if (this.vidas <= 0) {
      this.gameOver = true;
      this.cronometroActivo = false;
      this.mensajeEstado = `${motivo} ¡GAME OVER! Te quedaste sin vidas. Sistema bloqueado.`;
    } else {
      this.mensajeEstado = `${motivo} Perdiste 1 vida (te queda ${this.vidas} vida). La Masita regresó para otro intento.`;
      setTimeout(() => {
        if (!this.gameOver && !this.completado) {
          for (const r of this.resortes) {
            r.targetExt = r.deformacionPlastica;
          }
          this.masita.resorteColgadoId = null;
          this.masita.x = this.masita.homeX;
          this.masita.y = this.masita.homeY;
          this.dirty = true;
        }
      }, 1350);
    }
  },

  actualizar(dt) {
    if (this.cronometroActivo && !this.completado && !this.gameOver) {
      this.tiempoRestante = Math.max(0, this.tiempoRestante - dt);
      const segActual = Math.ceil(this.tiempoRestante);
      if (segActual !== this.ultimoSegundoDibujado) {
        this.ultimoSegundoDibujado = segActual;
        this.dirty = true;
      }
      if (this.tiempoRestante <= 0) {
        this.gameOver = true;
        this.cronometroActivo = false;
        this.mensajeEstado = '¡TIEMPO AGOTADO (00:00)! GAME OVER — El sistema del Montaje 2 se ha bloqueado.';
        this.dirty = true;
      }
    }

    for (const r of this.resortes) {
      const diff = r.targetExt - r.currentExt;
      if (Math.abs(diff) > 0.08 || Math.abs(r.vel) > 0.08) {
        const force = diff * 28 - r.vel * 4.2;
        r.vel += force * dt;
        r.currentExt += r.vel * dt;
        if (this.masita.resorteColgadoId === r.id) {
          this.masita.x = r.x;
          this.masita.y = r.topY + r.baseLen + r.currentExt + 32;
        }
        this.dirty = true;
      }
    }

    if (this.dirty) {
      this.dirty = false;
      this.dibujarCanvasResortes();
    }
  },

  dibujarHéliceContinua(ctx, x, y1, y2, coils, wireW, color) {
    const rad = 22;
    const len = Math.max(50, y2 - y1);
    const lead = 14;
    const body = len - lead * 2;
    const steps = coils * 8;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = 'rgba(20, 12, 6, 0.5)';
    ctx.lineWidth = wireW + 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y1 + lead);
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const a = u * coils * Math.PI * 2;
      ctx.lineTo(x + Math.sin(a) * rad, y1 + lead + u * body);
    }
    ctx.lineTo(x, y2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = wireW;
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, wireW * 0.3);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y2 + 7, 7, -Math.PI * 0.5, Math.PI * 0.8);
    ctx.stroke();
    ctx.restore();
  },

  dibujarCanvasResortes() {
    const ctx = spCtx;
    ctx.clearRect(0, 0, this.W, this.H);

    ctx.fillStyle = 'rgba(28, 18, 12, 0.22)';
    ctx.fillRect(16, 16, this.W - 32, this.H - 32);

    ctx.fillStyle = '#593a24';
    ctx.strokeStyle = '#d6b088';
    ctx.lineWidth = 1.5;
    ctx.fillRect(10, 10, 800, 16);
    ctx.fillRect(10, 734, 800, 16);
    ctx.fillRect(10, 10, 16, 740);
    ctx.fillRect(794, 10, 16, 740);
    ctx.fillRect(580, 145, 14, 589);
    ctx.fillRect(580, 345, 214, 14);
    ctx.fillRect(580, 545, 214, 14);

    ctx.fillStyle = 'rgba(54, 32, 19, 0.88)';
    ctx.strokeStyle = '#e5be90';
    ctx.fillRect(36, 36, 748, 105);
    ctx.strokeRect(36, 36, 748, 105);

    const mins = String(Math.floor(this.tiempoRestante / 60)).padStart(2, '0');
    const secs = String(Math.floor(this.tiempoRestante % 60)).padStart(2, '0');
    const corazones = '❤️'.repeat(this.vidas) + '🖤'.repeat(Math.max(0, 2 - this.vidas));

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`ACERTIJO DE ELASTICIDAD`, 52, 60);
    ctx.textAlign = 'right';
    ctx.fillText(`VIDAS: ${corazones}   |   RELOJ: ${mins}:${secs}`, 766, 60);

    ctx.fillStyle = '#fff8ee';
    ctx.font = '13.5px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(
      '«Necesito un resorte que se estire al colocar una carga, almacene energía elástica y recupere su',
      52,
      88
    );
    ctx.fillText(
      'forma al retirarla, alcanzando el seguro sin deformarse permanentemente. ¿Cuál elegirías?»',
      52,
      110
    );

    ctx.fillStyle = '#b99458';
    ctx.fillRect(65, 200, 490, 15);

    const seguroTop = 215 + 185 + 98;
    const seguroBot = 215 + 185 + 128;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([6, 4]);
    ctx.fillRect(65, seguroTop, 490, seguroBot - seguroTop);
    ctx.strokeRect(65, seguroTop, 490, seguroBot - seguroTop);
    ctx.setLineDash([]);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('ZONA DEL SEGURO MECÁNICO', 74, seguroTop - 6);

    for (const r of this.resortes) {
      const endY = r.topY + r.baseLen + r.currentExt;
      this.dibujarHéliceContinua(ctx, r.x, r.topY, endY, r.coils, r.wireW, r.color);

      ctx.fillStyle = '#fff8ee';
      ctx.font = 'bold 14px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(r.nombre, r.x, 186);
      ctx.fillStyle = '#e5be90';
      ctx.font = '11px Georgia';
      ctx.fillText(r.nota, r.x, 665);
    }

    ctx.fillStyle = '#ffe6c7';
    ctx.font = 'bold 11.5px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('CAJILLA DE REGALO RECIBIDO', 688, 175);
    ctx.font = '11px Georgia';
    ctx.fillText('(Arrastra la Masita al resorte)', 688, 193);

    if (this.masitaRecibida) {
      const mx = this.masita.x;
      const my = this.masita.y;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(mx, my - 22, 7, Math.PI, 0);
      ctx.stroke();

      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mx - 26, my - 16, 52, 42, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#291507';
      ctx.font = 'bold 12px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('MASITA', mx, my + 4);
      ctx.font = '10px Arial';
      ctx.fillText('M', mx, my + 18);
      ctx.restore();
    }

    ctx.fillStyle = this.gameOver ? 'rgba(127, 29, 29, 0.92)' : 'rgba(48, 28, 16, 0.85)';
    ctx.strokeStyle = this.gameOver ? '#f87171' : '#e5be90';
    ctx.fillRect(36, 682, 525, 44);
    ctx.strokeRect(36, 682, 525, 44);
    ctx.fillStyle = '#fff';
    ctx.font = '12.5px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(this.mensajeEstado, 48, 709);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(20, 10, 6, 0.85)';
      ctx.fillRect(60, 260, 500, 220);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 260, 500, 220);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 28px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER · SISTEMA BLOQUEADO', 310, 330);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Georgia';
      ctx.fillText('Haz clic aquí o en «Reintentar» en la bandeja inferior.', 310, 375);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(210, 405, 200, 42);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Georgia';
      ctx.fillText('↻ Reintentar Montaje 2', 310, 431);
    }

    springTexture.needsUpdate = true;
  }
};
ResortesMontaje2.dibujarCanvasResortes();

// ==========================================================================
// MONTAJE 3: «LA LLAVE FUERA DE ALCANCE»
// • Bobina de Madera claramente visible (núcleo de madera clara veteada + etiqueta «MADERA»)
// • Descenso AL RAS del nivel de la llave en el suelo (y = 616, quedando el borde inferior en y = 638)
// • Al abrir el candado del regalo final, dispara la Página Final de Agradecimiento con la Pastilla Brillando
// ==========================================================================
const f3 = frames[2];

const gift = crearCajitaRegalo(true, woodDark);
gift.position.set(1.68, -1.36, 0.12);
f3.add(gift);

const magCanvas = document.createElement('canvas');
magCanvas.width = 640;
magCanvas.height = 593;
const magCtx = magCanvas.getContext('2d');
magCtx.scale(640 / 820, 593 / 760);
const magTexture = new THREE.CanvasTexture(magCanvas);
magTexture.colorSpace = THREE.SRGBColorSpace;

const magPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(3.92, 3.64),
  new THREE.MeshBasicMaterial({ map: magTexture, transparent: true, side: THREE.DoubleSide })
);
f3.add(magPlane);

export const MagnetismoMontaje3 = {
  W: 820,
  H: 760,
  dirty: true,
  cableRecibido: true,
  onJuegoTerminadoCallback: null,

  tomaFuentePos: { x: 68, y: 66 },
  enchufeFuenteConectado: true,
  enchufeFuentePlug: { x: 68, y: 84 },

  conectorEnchufadoEn: null, // null | 'vidrio' | 'madera' | 'hierro'
  cablePlug: { x: 158, y: 128 },

  // Las 3 bobinas con colores de núcleo de alto contraste y etiquetas visibles
  conectoresSuperiores: [
    { id: 'vidrio', nombre: '1. Núcleo Vidrio', tagCorto: 'VIDRIO', x: 225, y: 66, muRel: 1.0, colorNucleo: '#7dd3fc' },
    { id: 'madera', nombre: '2. Núcleo Madera', tagCorto: 'MADERA', x: 365, y: 66, muRel: 1.0, colorNucleo: '#f6d59e' },
    { id: 'hierro', nombre: '3. Hierro Dulce', tagCorto: 'HIERRO', x: 505, y: 66, muRel: 15.0, colorNucleo: '#94a3b8' }
  ],

  carroX: 135,
  targetCarroX: 135,

  // Altura de descenso AL RAS con la llave del suelo: y = 616 (su borde inferior queda en 616 + 22 = 638, al ras de la llave)
  alturaAlRasSuelo: 616,

  cabezales: {
    vidrio: { offsetCarroX: -54, y: 175, parkedY: 175 },
    madera: { offsetCarroX: 0, y: 175, parkedY: 175 },
    hierro: { offsetCarroX: 54, y: 175, parkedY: 175 }
  },
  targetActiveY: 175,
  bobinaAlimentada: false,
  mostrarCampoDidactico: true,
  separadorMecanicoActivo: false,

  llave: {
    x: 115,
    y: 638,
    targetX: 115,
    targetY: 638,
    anguloAtraccion: 0,
    sujetaPorBobina: false,
    siendoArrastradaLigero: false,
    enConductoSalida: false,
    enBandejaExterior: false
  },

  obstaculos: [
    { id: 'pared_baja', x: 242, y: 475, w: 22, h: 185, label: 'Pared Baja' },
    { id: 'techo_bajo', x: 358, y: 145, w: 74, h: 205, label: 'Techo Bajo' }
  ],

  aberturaSalida: { xMin: 495, xMax: 565, yEntrada: 495 },
  bandejaExteriorPos: { x: 642, y: 658 },
  candadoRegaloPos: { x: 742, y: 635 },

  intentoIniciado: false,
  tiempoRestante: CONFIG.tiempoMaximoMontaje3Segundos,
  ultimoSegundoDibujado: 60,
  tiempoAgotado: false,
  paradaControladaEnCurso: false,
  candadoAbierto: false,
  pastillaColeccionVisible: false,

  mensaje:
    'Conecta 2. MADERA (o 1. VIDRIO), pulsa «⬇ Bajar al Ras» y arrastra la llave hacia la derecha (x=189).',

  iniciarIntento() {
    if (this.intentoIniciado || this.candadoAbierto) return;
    this.intentoIniciado = true;
    this.tiempoAgotado = false;
    this.tiempoRestante = CONFIG.tiempoMaximoMontaje3Segundos;
    this.mensaje =
      'Reloj de 60 s iniciado. Conecta 2. MADERA, bájala al ras y arrastra la llave hacia x=189.';
    this.dirty = true;
    this.dibujarCanvasMagnetico();
  },

  reiniciarIntento() {
    this.tiempoAgotado = false;
    this.paradaControladaEnCurso = false;
    this.intentoIniciado = false;
    this.tiempoRestante = CONFIG.tiempoMaximoMontaje3Segundos;
    this.bobinaAlimentada = false;
    this.llave.sujetaPorBobina = false;
    this.llave.siendoArrastradaLigero = false;
    this.llave.enConductoSalida = false;
    this.llave.enBandejaExterior = false;
    this.llave.x = 115;
    this.llave.y = 638;
    this.llave.targetX = 115;
    this.llave.targetY = 638;
    this.llave.anguloAtraccion = 0;
    this.carroX = 135;
    this.targetCarroX = 135;
    this.targetActiveY = 175;
    for (const k of ['vidrio', 'madera', 'hierro']) {
      this.cabezales[k].y = 175;
    }
    this.mensaje = 'Sistema reiniciado. Conecta 2. MADERA y bájala al ras para arrastrar la llave fuera del rincón.';
    this.dirty = true;
    this.dibujarCanvasMagnetico();
  },

  conectarEnchufeFuente() {
    if (this.tiempoAgotado || this.paradaControladaEnCurso) return;
    this.enchufeFuenteConectado = true;
    this.enchufeFuentePlug.x = this.tomaFuentePos.x;
    this.enchufeFuentePlug.y = this.tomaFuentePos.y + 18;
    this.mensaje = 'Enchufe conectado a la Fuente DC. Ahora conecta el otro extremo a una de las 3 bobinas.';
    this.dirty = true;
    this.dibujarCanvasMagnetico();
  },

  conectarCableA(idConector) {
    if (this.tiempoAgotado || this.paradaControladaEnCurso) return;
    this.cableRecibido = true;
    this.enchufeFuenteConectado = true;
    this.enchufeFuentePlug.x = this.tomaFuentePos.x;
    this.enchufeFuentePlug.y = this.tomaFuentePos.y + 18;

    if (this.conectorEnchufadoEn !== null && this.conectorEnchufadoEn !== idConector) {
      if (this.llave.sujetaPorBobina) {
        this.mensaje = 'Primero suelta la llave (⚡ Soltar) antes de cambiar el cable a otra bobina.';
        this.dirty = true;
        this.dibujarCanvasMagnetico();
        return;
      }
      this.bobinaAlimentada = false;
      this.cabezales[this.conectorEnchufadoEn].y = 175;
    }

    this.conectorEnchufadoEn = idConector;
    const sock = this.conectoresSuperiores.find(c => c.id === idConector);
    if (sock) {
      this.cablePlug.x = sock.x;
      this.cablePlug.y = sock.y + 18;
    }
    this.targetActiveY = 175;
    this.bobinaAlimentada = false;
    this.mensaje = `Cable conectado a [${sock ? sock.nombre : idConector}]. Pulsa «⬇ Bajar Bobina» para bajarla al ras de la llave.`;
    this.dirty = true;
    this.dibujarCanvasMagnetico();
  },

  asegurarBobinaConectadaPorDefecto() {
    this.cableRecibido = true;
    this.enchufeFuenteConectado = true;
    if (!this.conectorEnchufadoEn) {
      this.conectarCableA('madera');
    }
  },

  cabezalActivoPos() {
    const id = this.conectorEnchufadoEn || 'madera';
    const cab = this.cabezales[id];
    return {
      id,
      x: this.carroX + cab.offsetCarroX,
      y: cab.y,
      cab
    };
  },

  moverCarroHorizontal(deltaX) {
    if (this.tiempoAgotado || this.paradaControladaEnCurso) return;
    this.asegurarBobinaConectadaPorDefecto();

    const act = this.cabezalActivoPos();
    const nuevoCarroX = Math.max(135, Math.min(525, this.targetCarroX + deltaX));
    const nuevoCabX = nuevoCarroX + act.cab.offsetCarroX;

    // Solo comprobar colisión con la Pared Baja si NO estamos arrastrando la llave por el suelo a la izquierda de x=215
    const bottomY = this.targetActiveY + (this.llave.sujetaPorBobina ? 58 : 22);
    for (const obs of this.obstaculos) {
      const chocaX = nuevoCabX + 22 > obs.x && nuevoCabX - 22 < obs.x + obs.w;
      const chocaY = bottomY > obs.y && this.targetActiveY - 24 < obs.y + obs.h;
      if (chocaX && chocaY) {
        this.mensaje =
          obs.id === 'pared_baja'
            ? 'Obstáculo (Pared Baja): sube la bobina (▲ Subir) para pasar por encima de la pared baja.'
            : 'Obstáculo (Techo Bajo): baja un poco la bobina (▼ Nivel Medio) para pasar debajo del techo bajo.';
        this.dirty = true;
        this.dibujarCanvasMagnetico();
        return;
      }
    }

    this.targetCarroX = nuevoCarroX;
    this.dirty = true;

    // Cuando la bobina de Madera o Vidrio está al ras del suelo (targetActiveY >= 480) con campo activo,
    // arrastra la llave suavemente por el suelo junto con ella hasta x = 190
    if (
      this.bobinaAlimentada &&
      (this.conectorEnchufadoEn === 'vidrio' || this.conectorEnchufadoEn === 'madera') &&
      this.targetActiveY >= 480 &&
      !this.llave.sujetaPorBobina &&
      !this.llave.enBandejaExterior &&
      Math.abs(act.x - this.llave.x) <= 90
    ) {
      this.llave.siendoArrastradaLigero = true;
      this.llave.targetX = Math.max(95, Math.min(192, nuevoCabX));
      this.llave.anguloAtraccion = deltaX >= 0 ? -0.18 : 0.18;
      this.mensaje = `Bobina de ${
        this.conectorEnchufadoEn === 'madera' ? 'Madera' : 'Vidrio'
      } al ras arrastrando la llave (x=${Math.round(this.llave.targetX)}). En x≥189 ya la alcanza el Hierro Dulce.`;
    } else if (!this.llave.sujetaPorBobina && this.targetActiveY >= 480) {
      this.evaluarInteraccionMagneticaAbajo(nuevoCabX, this.targetActiveY);
    }
  },

  ajustarAlturaManual(deltaY) {
    if (this.tiempoAgotado || this.paradaControladaEnCurso) return;
    this.asegurarBobinaConectadaPorDefecto();

    const act = this.cabezalActivoPos();
    const nuevaY = Math.max(175, Math.min(this.alturaAlRasSuelo, this.targetActiveY + deltaY));
    const bottomY = nuevaY + (this.llave.sujetaPorBobina ? 58 : 22);

    for (const obs of this.obstaculos) {
      const chocaX = act.x + 22 > obs.x && act.x - 22 < obs.x + obs.w;
      const chocaY = bottomY > obs.y && nuevaY - 24 < obs.y + obs.h;
      if (chocaX && chocaY) {
        this.mensaje = `Contacto con ${obs.label}: mueve el carro horizontalmente antes de cambiar más la altura aquí.`;
        this.dirty = true;
        this.dibujarCanvasMagnetico();
        return;
      }
    }

    this.targetActiveY = nuevaY;
    this.dirty = true;

    if (nuevaY >= 470) {
      this.bobinaAlimentada = true;
      this.evaluarInteraccionMagneticaAbajo(act.x, nuevaY);
    } else if (nuevaY <= 220 && !this.llave.sujetaPorBobina) {
      this.llave.siendoArrastradaLigero = false;
      this.llave.anguloAtraccion = 0;
    }
  },

  evaluarInteraccionMagneticaAbajo(cabX, cabY) {
    if (this.llave.enBandejaExterior || this.llave.sujetaPorBobina) return;
    const distH = Math.abs(cabX - this.llave.x);

    if (this.conectorEnchufadoEn === 'hierro') {
      if (distH <= 58 && cabY >= 480) {
        this.llave.sujetaPorBobina = true;
        this.llave.siendoArrastradaLigero = false;
        this.llave.anguloAtraccion = 0;
        this.mensaje =
          '¡ATRACCIÓN FERROMAGNÉTICA! La llave se pegó al núcleo de Hierro Dulce. Ahora llévala a la derecha sorteando la Pared Baja y el Techo Bajo.';
      } else {
        this.mensaje =
          'Hierro Dulce bajó al ras en x=' +
          Math.round(cabX) +
          ', lejos de la llave (x=' +
          Math.round(this.llave.x) +
          '). Conecta primero 2. MADERA para arrastrar la llave hacia x=189.';
      }
    } else if (this.conectorEnchufadoEn === 'vidrio' || this.conectorEnchufadoEn === 'madera') {
      if (distH <= 85 && cabY >= 480) {
        this.llave.siendoArrastradaLigero = true;
        this.llave.targetX = Math.min(190, Math.max(this.llave.targetX + 38, cabX + 20));
        this.llave.anguloAtraccion = -0.18;
        this.mensaje =
          '¡Bobina de ' +
          (this.conectorEnchufadoEn === 'madera' ? 'Madera' : 'Vidrio') +
          ' al ras del suelo! Arrastró la llave hacia x=' +
          Math.round(this.llave.targetX) +
          '. Pulsa «▶ Mover Der.» hasta x=189 y luego cambia a Hierro Dulce.';
      } else {
        this.mensaje =
          'Bobina al ras del suelo con campo activo. Acércala a la llave con «◀ Mover Izq.» o «▶ Mover Der.».';
      }
    }
    this.dirty = true;
  },

  // Baja la bobina conectada AL RAS del nivel de la llave en el suelo (y = 616) y la mantiene abajo
  ejecutarBajarYProbar() {
    if (this.tiempoAgotado || this.paradaControladaEnCurso) return;
    this.asegurarBobinaConectadaPorDefecto();

    const act = this.cabezalActivoPos();
    this.targetActiveY = this.alturaAlRasSuelo;
    this.bobinaAlimentada = true;
    this.evaluarInteraccionMagneticaAbajo(act.x, this.alturaAlRasSuelo);

    if (this.conectorEnchufadoEn === 'hierro' && this.llave.sujetaPorBobina) {
      this.targetActiveY = 365;
    }
    this.dirty = true;
  },

  subirCabezalAEstacionamiento() {
    if (this.tiempoAgotado || this.paradaControladaEnCurso) return;
    this.targetActiveY = this.llave.sujetaPorBobina ? 360 : 175;
    if (!this.llave.sujetaPorBobina) {
      this.llave.siendoArrastradaLigero = false;
      this.llave.anguloAtraccion = 0;
    }
    this.mensaje = this.llave.sujetaPorBobina
      ? 'Llave elevada sobre la Pared Baja. Avanza a la derecha (▶) y usa «▼ Nivel Medio» bajo el Techo Bajo.'
      : 'Bobina elevada a estacionamiento. Ya puedes conectar otra bobina.';
    this.dirty = true;
  },

  ejecutarSoltar(onLlaveEnBandejaCallback) {
    if (this.tiempoAgotado || this.paradaControladaEnCurso) return;
    this.bobinaAlimentada = false;
    this.llave.siendoArrastradaLigero = false;
    this.llave.anguloAtraccion = 0;
    this.separadorMecanicoActivo = true;
    this.dirty = true;
    setTimeout(() => {
      this.separadorMecanicoActivo = false;
      this.dirty = true;
    }, 500);

    if (!this.llave.sujetaPorBobina) {
      this.targetActiveY = 175;
      this.mensaje =
        'Corriente cortada y bobina elevada. Ahora puedes conectar el cable a 3. Hierro Dulce.';
      return;
    }

    this.llave.sujetaPorBobina = false;
    this.targetActiveY = 175;
    if (
      this.llave.x >= this.aberturaSalida.xMin &&
      this.llave.x <= this.aberturaSalida.xMax
    ) {
      this.llave.enConductoSalida = true;
      this.mensaje =
        '¡Llave liberada en la abertura de salida! Cayendo por gravedad hacia la bandeja exterior...';
      setTimeout(() => {
        this.llave.enConductoSalida = false;
        this.llave.enBandejaExterior = true;
        this.llave.x = this.bandejaExteriorPos.x;
        this.llave.y = this.bandejaExteriorPos.y;
        this.llave.targetX = this.bandejaExteriorPos.x;
        this.llave.targetY = this.bandejaExteriorPos.y;
        this.intentoIniciado = false;
        this.mensaje =
          '¡Llave en la bandeja exterior! Arrástrala hasta el candado del regalo final o pulsa «🔓 Abrir Candado».';
        this.dirty = true;
        if (onLlaveEnBandejaCallback) onLlaveEnBandejaCallback();
      }, 650);
    } else {
      this.llave.y = 638;
      this.llave.targetY = 638;
      if (this.llave.x > 230 && this.llave.x < 270) this.llave.targetX = 205;
      this.mensaje = 'La llave cayó al suelo dentro de la cámara. Puedes volver a bajar la bobina para sujetarla.';
    }
  },

  abrirCandadoRegaloFinal() {
    if (!this.llave.enBandejaExterior || this.candadoAbierto) return;
    this.candadoAbierto = true;
    this.pastillaColeccionVisible = true;
    this.mensaje =
      '¡Candado abierto! Has desbloqueado la Pastilla Virtual de Colección de Luis Concepcion.';
    if (gift.userData.candadoMesh) {
      gsap.to(gift.userData.candadoMesh.position, { y: -0.25, duration: 0.4 });
    }
    gsap.to(gift.userData.tapaPivot.rotation, { x: -Math.PI * 0.72, duration: 0.55, ease: 'back.out(1.7)' });
    this.dirty = true;
    this.dibujarCanvasMagnetico();

    // Mostrar la Página Final de Agradecimiento con la Pastilla Brillando tras abrir el candado
    if (this.onJuegoTerminadoCallback) {
      setTimeout(() => {
        this.onJuegoTerminadoCallback();
      }, 850);
    }
  },

  actualizar(dt) {
    if (this.intentoIniciado && !this.tiempoAgotado && !this.llave.enBandejaExterior) {
      this.tiempoRestante = Math.max(0, this.tiempoRestante - dt);
      const seg = Math.ceil(this.tiempoRestante);
      if (seg !== this.ultimoSegundoDibujado) {
        this.ultimoSegundoDibujado = seg;
        this.dirty = true;
      }
      if (this.tiempoRestante <= 0) {
        this.tiempoAgotado = true;
        this.paradaControladaEnCurso = true;
        this.mensaje = 'Tiempo agotado. La llave sigue dentro del sistema.';
        this.targetActiveY = this.alturaAlRasSuelo;
        this.dirty = true;
        setTimeout(() => {
          if (this.llave.sujetaPorBobina) {
            this.llave.sujetaPorBobina = false;
            this.llave.y = 638;
            this.llave.targetY = 638;
          }
          this.bobinaAlimentada = false;
          this.targetActiveY = 175;
          this.paradaControladaEnCurso = false;
          this.dirty = true;
        }, 700);
      }
    }

    if (Math.abs(this.targetCarroX - this.carroX) > 0.2) {
      this.carroX += (this.targetCarroX - this.carroX) * Math.min(1, dt * 10);
      this.dirty = true;
    } else {
      this.carroX = this.targetCarroX;
    }

    for (const k of ['vidrio', 'madera', 'hierro']) {
      const metaY = this.conectorEnchufadoEn === k ? this.targetActiveY : this.cabezales[k].parkedY;
      if (Math.abs(metaY - this.cabezales[k].y) > 0.2) {
        this.cabezales[k].y += (metaY - this.cabezales[k].y) * Math.min(1, dt * 10);
        this.dirty = true;
      } else {
        this.cabezales[k].y = metaY;
      }
    }

    if (this.llave.sujetaPorBobina && this.conectorEnchufadoEn) {
      const act = this.cabezalActivoPos();
      // La llave va pegada justo al ras de la cara inferior del núcleo de hierro (act.y + 26)
      if (Math.abs(act.x - this.llave.x) > 0.2 || Math.abs(act.y + 26 - this.llave.y) > 0.2) {
        this.llave.x += (act.x - this.llave.x) * Math.min(1, dt * 14);
        this.llave.y += (act.y + 26 - this.llave.y) * Math.min(1, dt * 14);
        this.llave.targetX = this.llave.x;
        this.llave.targetY = this.llave.y;
        this.dirty = true;
      }
    } else if (this.llave.enConductoSalida) {
      this.llave.x += (this.bandejaExteriorPos.x - this.llave.x) * 0.22;
      this.llave.y += (this.bandejaExteriorPos.y - this.llave.y) * 0.22;
      this.dirty = true;
    } else if (!this.llave.enBandejaExterior) {
      if (Math.abs(this.llave.targetX - this.llave.x) > 0.2 || Math.abs(638 - this.llave.y) > 0.2) {
        this.llave.x += (this.llave.targetX - this.llave.x) * Math.min(1, dt * 11);
        this.llave.y += (638 - this.llave.y) * Math.min(1, dt * 11);
        this.dirty = true;
      } else {
        this.llave.x = this.llave.targetX;
        this.llave.y = 638;
      }
    }

    if (this.dirty) {
      this.dirty = false;
      this.dibujarCanvasMagnetico();
    }
  },

  dibujarCanvasMagnetico() {
    const ctx = magCtx;
    ctx.clearRect(0, 0, this.W, this.H);

    ctx.fillStyle = 'rgba(24, 15, 10, 0.28)';
    ctx.fillRect(24, 110, 556, 570);

    // 1. Toma de Fuente Exterior DC
    ctx.fillStyle = this.enchufeFuenteConectado ? '#065f46' : '#3b2416';
    ctx.strokeStyle = this.enchufeFuenteConectado ? '#34d399' : '#f59e0b';
    ctx.lineWidth = 2.2;
    ctx.fillRect(22, 42, 96, 44);
    ctx.strokeRect(22, 42, 96, 44);
    ctx.fillStyle = '#fff8ee';
    ctx.font = 'bold 10px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('FUENTE DC', 70, 58);
    ctx.fillStyle = '#fde68a';
    ctx.fillText(this.enchufeFuenteConectado ? '✓ ENCHUFADO' : 'CONECTAR AQUÍ', 70, 76);

    // 2. Tres conectores bipolares de las bobinas
    for (const sock of this.conectoresSuperiores) {
      const conectado = this.conectorEnchufadoEn === sock.id;
      ctx.fillStyle = conectado ? '#78350f' : '#3b2416';
      ctx.strokeStyle = conectado ? '#ffd166' : '#d6b088';
      ctx.lineWidth = conectado ? 2.5 : 1.5;
      ctx.fillRect(sock.x - 62, sock.y - 24, 124, 44);
      ctx.strokeRect(sock.x - 62, sock.y - 24, 124, 44);

      ctx.fillStyle = '#e5be90';
      ctx.beginPath();
      ctx.arc(sock.x - 14, sock.y + 6, 4, 0, Math.PI * 2);
      ctx.arc(sock.x + 14, sock.y + 6, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff8ee';
      ctx.font = 'bold 10.5px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(sock.nombre, sock.x, sock.y - 6);
    }

    // Reloj de 60 segundos
    ctx.fillStyle = '#3b2416';
    ctx.strokeStyle = this.tiempoAgotado ? '#ef4444' : '#e5be90';
    ctx.fillRect(585, 42, 210, 44);
    ctx.strokeRect(585, 42, 210, 44);
    ctx.fillStyle = this.tiempoAgotado ? '#fca5a5' : '#ffd166';
    ctx.font = 'bold 13.5px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`TIEMPO: ${Math.ceil(this.tiempoRestante)} s / 60 s`, 690, 69);

    // Cable Bipolar
    if (this.cableRecibido) {
      ctx.save();
      ctx.strokeStyle = this.conectorEnchufadoEn ? '#fbbf24' : '#d97706';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(this.enchufeFuentePlug.x, this.enchufeFuentePlug.y);
      ctx.quadraticCurveTo(
        (this.enchufeFuentePlug.x + this.cablePlug.x) / 2,
        Math.max(this.enchufeFuentePlug.y, this.cablePlug.y) + 34,
        this.cablePlug.x,
        this.cablePlug.y
      );
      ctx.stroke();

      ctx.fillStyle = this.enchufeFuenteConectado ? '#10b981' : '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fillRect(this.enchufeFuentePlug.x - 28, this.enchufeFuentePlug.y - 11, 56, 22);
      ctx.strokeRect(this.enchufeFuentePlug.x - 28, this.enchufeFuentePlug.y - 11, 56, 22);
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ENCHUFE', this.enchufeFuentePlug.x, this.enchufeFuentePlug.y + 3);

      ctx.fillStyle = this.conectorEnchufadoEn ? '#38bdf8' : '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.fillRect(this.cablePlug.x - 34, this.cablePlug.y - 11, 68, 22);
      ctx.strokeRect(this.cablePlug.x - 34, this.cablePlug.y - 11, 68, 22);
      ctx.fillStyle = '#111827';
      ctx.fillText('A BOBINA', this.cablePlug.x, this.cablePlug.y + 3);
      ctx.restore();
    }

    // Paredes de la cámara cerrada
    ctx.fillStyle = '#593a24';
    ctx.strokeStyle = '#d6b088';
    ctx.lineWidth = 1.5;
    ctx.fillRect(20, 110, 560, 14);
    ctx.fillRect(20, 665, 560, 16);
    ctx.fillRect(20, 110, 16, 571);
    ctx.fillRect(566, 110, 16, 395);

    // Línea de alcance mínimo del Hierro Dulce (x = 189)
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(189, 540);
    ctx.lineTo(189, 664);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '10px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Alcance mín. Hierro (x=189)', 189, 532);
    ctx.restore();

    for (const obs of this.obstaculos) {
      ctx.fillStyle = '#6e492d';
      ctx.strokeStyle = '#e5be90';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }

    // Conducto de salida y bandeja exterior
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(495, 505);
    ctx.lineTo(545, 585);
    ctx.lineTo(665, 675);
    ctx.stroke();

    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(495, 492, 70, 16);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 10.5px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ABERTURA SALIDA', 530, 486);

    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#cbd5e1';
    ctx.fillRect(595, 655, 88, 22);
    ctx.strokeRect(595, 655, 88, 22);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px Georgia';
    ctx.fillText('Bandeja Exterior', 639, 692);

    // Riel y carro superior común con las 3 bobinas (VIDRIO, MADERA y HIERRO claramente visibles)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(42, 132, 518, 8);
    ctx.fillStyle = '#b99458';
    ctx.strokeStyle = '#fff';
    ctx.fillRect(this.carroX - 80, 124, 160, 24);
    ctx.strokeRect(this.carroX - 80, 124, 160, 24);

    for (const sock of this.conectoresSuperiores) {
      const cab = this.cabezales[sock.id];
      const cx = this.carroX + cab.offsetCarroX;
      const cy = cab.y;

      // Cordón de soporte y cable eléctrico
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, 148);
      ctx.lineTo(cx, cy - 22);
      ctx.stroke();

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 6, 148);
      ctx.quadraticCurveTo(cx - 16, (148 + cy) / 2, cx - 5, cy - 20);
      ctx.stroke();

      // Núcleo bien diferenciado (en especial la Bobina de Madera con veta clara y saliente inferior al ras)
      ctx.fillStyle = sock.colorNucleo;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.fillRect(cx - 11, cy - 24, 22, 46);
      ctx.strokeRect(cx - 11, cy - 24, 22, 46);

      if (sock.id === 'madera') {
        // Vetas de madera visibles en el núcleo de madera
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 22); ctx.lineTo(cx - 4, cy + 20);
        ctx.moveTo(cx + 4, cy - 22); ctx.lineTo(cx + 4, cy + 20);
        ctx.stroke();
      }

      // Devanado de cobre (deja ver claramente los extremos superior e inferior del núcleo al ras)
      ctx.fillStyle = '#c2410c';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      for (let wy = cy - 12; wy <= cy + 8; wy += 6.5) {
        ctx.fillRect(cx - 16, wy, 32, 4.5);
        ctx.strokeRect(cx - 16, wy, 32, 4.5);
      }

      // Etiqueta clara sobre el propio cabezal (VIDRIO / MADERA / HIERRO) para encontrarla de inmediato
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(cx - 23, cy - 39, 46, 13);
      ctx.fillStyle = sock.id === 'madera' ? '#fde68a' : sock.id === 'vidrio' ? '#bae6fd' : '#e2e8f0';
      ctx.font = 'bold 8.5px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(sock.tagCorto, cx, cy - 29.5);

      if (this.separadorMecanicoActivo && this.conectorEnchufadoEn === sock.id) {
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(cx - 3, cy + 22, 6, 9);
      }

      if (this.bobinaAlimentada && this.conectorEnchufadoEn === sock.id && this.mostrarCampoDidactico) {
        const esHierro = sock.id === 'hierro';
        ctx.save();
        ctx.strokeStyle = esHierro ? 'rgba(56, 189, 248, 0.85)' : 'rgba(251, 191, 36, 0.72)';
        ctx.lineWidth = esHierro ? 2.6 : 1.8;
        const maxR = esHierro ? 58 : 34;
        for (let r = 16; r <= maxR; r += 12) {
          ctx.beginPath();
          ctx.ellipse(cx, cy + 22, r, r * 0.72, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (this.llave.siendoArrastradaLigero || this.llave.sujetaPorBobina) {
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, cy + 22);
          ctx.lineTo(this.llave.x, this.llave.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }
    }

    // Llave de acero ferromagnético
    const kx = this.llave.x;
    const ky = this.llave.y;
    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(this.llave.anguloAtraccion || 0);
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-12, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-3, -3, 24, 6);
    ctx.fillRect(12, 3, 4, 6);
    ctx.fillRect(18, 3, 4, 6);
    ctx.restore();

    // Regalo Final con Candado
    const gx = this.candadoRegaloPos.x;
    const gy = this.candadoRegaloPos.y;
    ctx.save();
    ctx.fillStyle = '#593a24';
    ctx.strokeStyle = '#e5be90';
    ctx.lineWidth = 2;
    ctx.fillRect(gx - 38, gy - 32, 76, 64);
    ctx.strokeRect(gx - 38, gy - 32, 76, 64);

    if (!this.candadoAbierto) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(gx - 12, gy - 8, 24, 22);
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.arc(gx, gy - 8, 8, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CANDADO', gx, gy + 44);
    } else if (this.pastillaColeccionVisible) {
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(gx - 22, gy - 54, 44, 22, 11);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 10.5px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('★ PASTILLA DE COLECCIÓN ★', gx, gy - 62);
    }
    ctx.restore();

    ctx.fillStyle = this.tiempoAgotado ? 'rgba(127, 29, 29, 0.92)' : 'rgba(48, 28, 16, 0.88)';
    ctx.strokeStyle = this.tiempoAgotado ? '#f87171' : '#e5be90';
    ctx.fillRect(24, 698, 772, 40);
    ctx.strokeRect(24, 698, 772, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '11.8px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(this.mensaje, 34, 723);

    magTexture.needsUpdate = true;
  }
};
MagnetismoMontaje3.dibujarCanvasMagnetico();

// Efecto de partículas «¡PUF!»
const puffGroup = new THREE.Group();
scene.add(puffGroup);
const puffSpheres = [];
for (let i = 0; i < 12; i++) {
  const sp = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 6, 6),
    new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffe2a8 : 0xe6c299, transparent: true, opacity: 0 })
  );
  puffGroup.add(sp);
  puffSpheres.push(sp);
}

function dispararEfectoPuf(worldPos) {
  puffGroup.position.copy(worldPos);
  puffSpheres.forEach((sp, i) => {
    sp.position.set(0, 0, 0);
    sp.material.opacity = 1;
    const ang = (i / puffSpheres.length) * Math.PI * 2;
    const elev = ((i % 4) - 1.5) * 0.25;
    const dist = 0.45 + (i % 3) * 0.18;
    gsap.to(sp.position, {
      x: Math.cos(ang) * dist,
      y: Math.sin(ang) * dist + elev,
      z: ((i % 2) - 0.5) * 0.35,
      duration: 0.65,
      ease: 'power2.out'
    });
    gsap.to(sp.material, { opacity: 0, duration: 0.65, ease: 'power2.out' });
  });
}

function resize() {
  const { width, height } = host.getBoundingClientRect();
  if (width === 0 || height === 0) return;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

export {
  THREE,
  renderer,
  scene,
  camera,
  controls,
  conjuntoTotal,
  focoSuperior3D,
  frames,
  cubiertaBanquete,
  optPlane,
  springPlane,
  magPlane,
  regalo1,
  regalo2,
  gift,
  dispararEfectoPuf,
  host,
  zs
};
