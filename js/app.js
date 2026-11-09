// ==========================================================================
// CONTROL DE INTERACCIÓN Y PÁGINA FINAL CON LA PASTILLA BRILLANDO — LUIS CONCEPCION
// ==========================================================================
import * as ctxEscena from './escena.js';
import {
  OpticaMontaje1,
  ResortesMontaje2,
  MagnetismoMontaje3,
  actualizarFocoSuperiorProgresivo
} from './escena.js';
import { CONFIG } from './configuracion.js';
import { crearRecorrido } from './recorrido.js';

const {
  THREE,
  renderer,
  scene,
  camera,
  controls,
  conjuntoTotal,
  frames,
  optPlane,
  springPlane,
  magPlane
} = ctxEscena;

const $ = id => document.getElementById(id);
const {
  estado,
  actualizarEscenaPorScroll,
  verificarVictoriaOptica,
  desbloquearMontaje2,
  construirBandejaInferior,
  actualizarRotadorUI
} = crearRecorrido({
  ...ctxEscena,
  OpticaMontaje1,
  ResortesMontaje2,
  MagnetismoMontaje3,
  actualizarFocoSuperiorProgresivo
});

// ==========================================================================
// PÁGINA FINAL DE AGRADECIMIENTO CON ANIMACIÓN DE LA PASTILLA BRILLANDO
// ==========================================================================
const finaleModal = $('finale-page');
const pillCanvas = $('glowing-pill-canvas');
const pillCtx = pillCanvas ? pillCanvas.getContext('2d') : null;
let finaleAnimActiva = false;

function dibujarPastillaBrillando(now) {
  if (!finaleAnimActiva || !pillCtx) return;
  const W = pillCanvas.width;
  const H = pillCanvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const t = now * 0.0025;

  pillCtx.clearRect(0, 0, W, H);

  // Rayos dorados giratorios detrás de la pastilla
  pillCtx.save();
  pillCtx.translate(cx, cy);
  pillCtx.rotate(t * 0.45);
  for (let i = 0; i < 12; i++) {
    pillCtx.rotate(Math.PI / 6);
    const gradRay = pillCtx.createLinearGradient(0, 0, 95, 0);
    gradRay.addColorStop(0, 'rgba(255, 209, 102, 0.42)');
    gradRay.addColorStop(1, 'rgba(255, 209, 102, 0)');
    pillCtx.fillStyle = gradRay;
    pillCtx.beginPath();
    pillCtx.moveTo(0, -4);
    pillCtx.lineTo(95, -14);
    pillCtx.lineTo(95, 14);
    pillCtx.lineTo(0, 4);
    pillCtx.closePath();
    pillCtx.fill();
  }
  pillCtx.restore();

  // Halo resplandeciente pulsante
  const pulseR = 68 + Math.sin(t * 2.2) * 10;
  const halo = pillCtx.createRadialGradient(cx, cy, 12, cx, cy, pulseR);
  halo.addColorStop(0, 'rgba(56, 189, 248, 0.75)');
  halo.addColorStop(0.55, 'rgba(255, 209, 102, 0.35)');
  halo.addColorStop(1, 'rgba(255, 209, 102, 0)');
  pillCtx.fillStyle = halo;
  pillCtx.beginPath();
  pillCtx.arc(cx, cy, pulseR, 0, Math.PI * 2);
  pillCtx.fill();

  // Cuerpo de la Pastilla de Colección flotando y brillando
  const floatY = Math.sin(t * 1.8) * 5;
  pillCtx.save();
  pillCtx.translate(cx, cy + floatY);
  pillCtx.rotate(-0.18 + Math.sin(t) * 0.06);

  // Mitad izquierda (Cian luminoso) y mitad derecha (Oro bruñido)
  const pillGrad = pillCtx.createLinearGradient(-52, -22, 52, 22);
  pillGrad.addColorStop(0, '#38bdf8');
  pillGrad.addColorStop(0.48, '#0284c7');
  pillGrad.addColorStop(0.52, '#fbbf24');
  pillGrad.addColorStop(1, '#d97706');
  pillCtx.fillStyle = pillGrad;
  pillCtx.strokeStyle = '#ffffff';
  pillCtx.lineWidth = 3;
  pillCtx.beginPath();
  pillCtx.roundRect(-52, -24, 104, 48, 24);
  pillCtx.fill();
  pillCtx.stroke();

  // Brillo especular superior de cristal sobre la pastilla
  pillCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  pillCtx.beginPath();
  pillCtx.roundRect(-38, -17, 76, 12, 6);
  pillCtx.fill();

  pillCtx.restore();

  // Destellos estelares alrededor de la pastilla
  for (let k = 0; k < 6; k++) {
    const a = t * 1.2 + (k * Math.PI) / 3;
    const sx = cx + Math.cos(a) * 64;
    const sy = cy + Math.sin(a) * 44;
    const sRad = 2.5 + Math.max(0, Math.sin(t * 3 + k)) * 3;
    pillCtx.fillStyle = '#fffbeb';
    pillCtx.beginPath();
    pillCtx.arc(sx, sy, sRad, 0, Math.PI * 2);
    pillCtx.fill();
  }

  requestAnimationFrame(dibujarPastillaBrillando);
}

MagnetismoMontaje3.onJuegoTerminadoCallback = () => {
  if (!finaleModal) return;
  finaleModal.hidden = false;
  if (!finaleAnimActiva) {
    finaleAnimActiva = true;
    requestAnimationFrame(dibujarPastillaBrillando);
  }
};

$('btnFinaleInspect').onclick = () => {
  finaleModal.hidden = true;
  finaleAnimActiva = false;
};

$('btnFinaleRestart').onclick = () => {
  finaleModal.hidden = true;
  finaleAnimActiva = false;
  estado.targetScroll = 0.0;
};

// ==========================================================================
// EVENTOS DE PUNTERO Y ARRASTRE
// ==========================================================================
const surface = renderer.domElement;
const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();

let piezaOpticaArrastrada = null;
let arrastrandoMasitaM2 = false;
let arrastrandoEnchufeFuenteM3 = false;
let arrastrandoCableBobinaM3 = false;
let arrastrandoLlaveAlCandadoM3 = false;
let arrastreRotacionCaja = null;
let arrastreConjuntoCompleto = null;
let touchStartY = null;

function uvToCoords(uv) {
  return {
    x: uv.x * 820,
    y: (1 - uv.y) * 760
  };
}

surface.addEventListener('pointerdown', e => {
  const r = surface.getBoundingClientRect();
  puntero.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1
  );
  raycaster.setFromCamera(puntero, camera);

  // 0. EN EL INICIO (scroll < 0.85): Arrastrar da vuelta 360° a todo el montaje
  if (estado.currentScroll < 0.85) {
    estado.giro = false;
    $('orbit').setAttribute('aria-pressed', 'false');
    arrastreConjuntoCompleto = { x: e.clientX, y: e.clientY };
    surface.setPointerCapture(e.pointerId);
    return;
  }

  // 1. INTERACCIÓN EN MONTAJE 1 (scroll 0.92..1.08)
  if (estado.currentScroll >= 0.92 && estado.currentScroll <= 1.08) {
    const hitOpt = raycaster.intersectObject(optPlane, false);
    if (hitOpt.length > 0 && hitOpt[0].uv) {
      const pt = uvToCoords(hitOpt[0].uv);

      if (pt.x >= 18 && pt.x <= 68 && pt.y >= 345 && pt.y <= 415) {
        OpticaMontaje1.linternaEncendida = !OpticaMontaje1.linternaEncendida;
        verificarVictoriaOptica();
        construirBandejaInferior();
        return;
      }

      for (let i = OpticaMontaje1.piezas.length - 1; i >= 0; i--) {
        const p = OpticaMontaje1.piezas[i];
        if (Math.hypot(pt.x - p.x, pt.y - p.y) <= p.radius + 14) {
          OpticaMontaje1.piezaSeleccionadaId = p.id;
          piezaOpticaArrastrada = p;
          actualizarRotadorUI();
          OpticaMontaje1.dibujarCanvasOptico();
          surface.setPointerCapture(e.pointerId);
          return;
        }
      }
    }
  }

  // 2. INTERACCIÓN EN MONTAJE 2 (scroll 1.92..2.08)
  if (estado.currentScroll >= 1.92 && estado.currentScroll <= 2.08) {
    const hitSp = raycaster.intersectObject(springPlane, false);
    if (hitSp.length > 0 && hitSp[0].uv) {
      const pt = uvToCoords(hitSp[0].uv);

      if (ResortesMontaje2.gameOver && pt.x >= 180 && pt.x <= 440 && pt.y >= 380 && pt.y <= 460) {
        ResortesMontaje2.reiniciarMontaje2();
        construirBandejaInferior();
        return;
      }

      const m = ResortesMontaje2.masita;
      if (ResortesMontaje2.masitaRecibida && Math.hypot(pt.x - m.x, pt.y - m.y) <= 44) {
        arrastrandoMasitaM2 = true;
        m.resorteColgadoId = null;
        surface.setPointerCapture(e.pointerId);
        return;
      }

      for (const res of ResortesMontaje2.resortes) {
        if (Math.abs(pt.x - res.x) <= 42 && pt.y >= 180 && pt.y <= 550) {
          ResortesMontaje2.colgarMasitaEnResorte(res.id, () => desbloquearMontaje2());
          construirBandejaInferior();
          return;
        }
      }
    }
  }

  // 3. INTERACCIÓN MANUAL EN MONTAJE 3 (scroll >= 2.92)
  if (estado.currentScroll >= 2.92) {
    const hitMag = raycaster.intersectObject(magPlane, false);
    if (hitMag.length > 0 && hitMag[0].uv) {
      const pt = uvToCoords(hitMag[0].uv);

      if (
        MagnetismoMontaje3.llave.enBandejaExterior &&
        !MagnetismoMontaje3.candadoAbierto &&
        Math.hypot(pt.x - MagnetismoMontaje3.llave.x, pt.y - MagnetismoMontaje3.llave.y) <= 48
      ) {
        arrastrandoLlaveAlCandadoM3 = true;
        surface.setPointerCapture(e.pointerId);
        return;
      }

      for (const sock of MagnetismoMontaje3.conectoresSuperiores) {
        if (Math.abs(pt.x - sock.x) <= 64 && Math.abs(pt.y - sock.y) <= 34) {
          MagnetismoMontaje3.conectarCableA(sock.id);
          construirBandejaInferior();
          return;
        }
      }

      if (
        Math.hypot(
          pt.x - MagnetismoMontaje3.cablePlug.x,
          pt.y - MagnetismoMontaje3.cablePlug.y
        ) <= 44
      ) {
        arrastrandoCableBobinaM3 = true;
        surface.setPointerCapture(e.pointerId);
        return;
      }

      if (
        Math.hypot(
          pt.x - MagnetismoMontaje3.enchufeFuentePlug.x,
          pt.y - MagnetismoMontaje3.enchufeFuentePlug.y
        ) <= 42
      ) {
        arrastrandoEnchufeFuenteM3 = true;
        surface.setPointerCapture(e.pointerId);
        return;
      }
    }
  }

  const cajaActivaIdx =
    estado.currentScroll >= 0.92 && estado.currentScroll <= 1.08
      ? 0
      : estado.currentScroll >= 1.92 && estado.currentScroll <= 2.08
      ? 1
      : estado.currentScroll >= 2.92
      ? 2
      : -1;
  if (cajaActivaIdx >= 0) {
    if (raycaster.intersectObject(frames[cajaActivaIdx], true).length) {
      estado.giro = false;
      $('orbit').setAttribute('aria-pressed', 'false');
      arrastreRotacionCaja = { idx: cajaActivaIdx, x: e.clientX, y: e.clientY };
      surface.setPointerCapture(e.pointerId);
    }
  }
});

surface.addEventListener('pointermove', e => {
  if (arrastreConjuntoCompleto) {
    conjuntoTotal.rotation.y += (e.clientX - arrastreConjuntoCompleto.x) * 0.0085;
    conjuntoTotal.rotation.x = THREE.MathUtils.clamp(
      conjuntoTotal.rotation.x + (e.clientY - arrastreConjuntoCompleto.y) * 0.0045,
      -0.45,
      0.45
    );
    arrastreConjuntoCompleto.x = e.clientX;
    arrastreConjuntoCompleto.y = e.clientY;
    return;
  }

  if (
    !piezaOpticaArrastrada &&
    !arrastrandoMasitaM2 &&
    !arrastrandoEnchufeFuenteM3 &&
    !arrastrandoCableBobinaM3 &&
    !arrastrandoLlaveAlCandadoM3 &&
    !arrastreRotacionCaja
  ) {
    return;
  }

  if (arrastreRotacionCaja) {
    const g = frames[arrastreRotacionCaja.idx];
    g.rotation.y += (e.clientX - arrastreRotacionCaja.x) * 0.007;
    g.rotation.x = THREE.MathUtils.clamp(
      g.rotation.x + (e.clientY - arrastreRotacionCaja.y) * 0.005,
      -0.65,
      0.65
    );
    arrastreRotacionCaja.x = e.clientX;
    arrastreRotacionCaja.y = e.clientY;
    return;
  }

  const r = surface.getBoundingClientRect();
  puntero.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1
  );
  raycaster.setFromCamera(puntero, camera);

  if (piezaOpticaArrastrada) {
    const hitOpt = raycaster.intersectObject(optPlane, false);
    if (hitOpt.length > 0 && hitOpt[0].uv) {
      const pt = uvToCoords(hitOpt[0].uv);
      let nx = Math.max(65, Math.min(OpticaMontaje1.W - 65, pt.x));
      let ny = Math.max(65, Math.min(OpticaMontaje1.H - 65, pt.y));
      for (const n of OpticaMontaje1.nodosAnclaje) {
        if (Math.hypot(nx - n.x, ny - n.y) < 24) {
          nx = n.x;
          ny = n.y;
          break;
        }
      }
      piezaOpticaArrastrada.x = nx;
      piezaOpticaArrastrada.y = ny;
      verificarVictoriaOptica();
    }
    return;
  }

  if (arrastrandoMasitaM2) {
    const hitSp = raycaster.intersectObject(springPlane, false);
    if (hitSp.length > 0 && hitSp[0].uv) {
      const pt = uvToCoords(hitSp[0].uv);
      ResortesMontaje2.masita.x = Math.max(55, Math.min(765, pt.x));
      ResortesMontaje2.masita.y = Math.max(165, Math.min(660, pt.y));
      ResortesMontaje2.dirty = true;
    }
    return;
  }

  if (arrastrandoEnchufeFuenteM3) {
    const hitMag = raycaster.intersectObject(magPlane, false);
    if (hitMag.length > 0 && hitMag[0].uv) {
      const pt = uvToCoords(hitMag[0].uv);
      MagnetismoMontaje3.enchufeFuentePlug.x = Math.max(30, Math.min(220, pt.x));
      MagnetismoMontaje3.enchufeFuentePlug.y = Math.max(40, Math.min(220, pt.y));
      MagnetismoMontaje3.dirty = true;
    }
    return;
  }

  if (arrastrandoCableBobinaM3) {
    const hitMag = raycaster.intersectObject(magPlane, false);
    if (hitMag.length > 0 && hitMag[0].uv) {
      const pt = uvToCoords(hitMag[0].uv);
      MagnetismoMontaje3.cablePlug.x = Math.max(100, Math.min(570, pt.x));
      MagnetismoMontaje3.cablePlug.y = Math.max(40, Math.min(220, pt.y));
      MagnetismoMontaje3.dirty = true;
    }
    return;
  }

  if (arrastrandoLlaveAlCandadoM3) {
    const hitMag = raycaster.intersectObject(magPlane, false);
    if (hitMag.length > 0 && hitMag[0].uv) {
      const pt = uvToCoords(hitMag[0].uv);
      MagnetismoMontaje3.llave.x = Math.max(580, Math.min(790, pt.x));
      MagnetismoMontaje3.llave.y = Math.max(540, Math.min(710, pt.y));
      MagnetismoMontaje3.dirty = true;
      if (
        Math.hypot(
          MagnetismoMontaje3.llave.x - MagnetismoMontaje3.candadoRegaloPos.x,
          MagnetismoMontaje3.llave.y - MagnetismoMontaje3.candadoRegaloPos.y
        ) < 48
      ) {
        arrastrandoLlaveAlCandadoM3 = false;
        MagnetismoMontaje3.abrirCandadoRegaloFinal();
        construirBandejaInferior();
      }
    }
  }
});

function soltarPuntero() {
  arrastreConjuntoCompleto = null;
  piezaOpticaArrastrada = null;

  if (arrastrandoMasitaM2) {
    arrastrandoMasitaM2 = false;
    const m = ResortesMontaje2.masita;
    let colgado = false;
    for (const res of ResortesMontaje2.resortes) {
      if (Math.abs(m.x - res.x) <= 52 && m.y >= 180 && m.y <= 560) {
        ResortesMontaje2.colgarMasitaEnResorte(res.id, () => desbloquearMontaje2());
        colgado = true;
        break;
      }
    }
    if (!colgado) {
      m.x = m.homeX;
      m.y = m.homeY;
      ResortesMontaje2.dirty = true;
    }
    construirBandejaInferior();
  }

  if (arrastrandoEnchufeFuenteM3) {
    arrastrandoEnchufeFuenteM3 = false;
    const p = MagnetismoMontaje3.enchufeFuentePlug;
    if (
      Math.hypot(
        p.x - MagnetismoMontaje3.tomaFuentePos.x,
        p.y - MagnetismoMontaje3.tomaFuentePos.y
      ) <= 68
    ) {
      MagnetismoMontaje3.conectarEnchufeFuente();
    }
  }

  if (arrastrandoCableBobinaM3) {
    arrastrandoCableBobinaM3 = false;
    const plug = MagnetismoMontaje3.cablePlug;
    for (const sock of MagnetismoMontaje3.conectoresSuperiores) {
      if (Math.hypot(plug.x - sock.x, plug.y - sock.y) <= 72) {
        MagnetismoMontaje3.conectarCableA(sock.id);
        break;
      }
    }
    construirBandejaInferior();
  }

  arrastrandoLlaveAlCandadoM3 = false;
  arrastreRotacionCaja = null;
}
surface.addEventListener('pointerup', soltarPuntero);
surface.addEventListener('pointercancel', soltarPuntero);

window.addEventListener(
  'wheel',
  e => {
    if (e.target.closest('.secondary-modal') || e.target.closest('#bottom-tray')) return;
    e.preventDefault();
    estado.targetScroll += e.deltaY * 0.00095;
  },
  { passive: false }
);

window.addEventListener(
  'touchstart',
  e => {
    if (e.touches.length === 1) touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);
window.addEventListener(
  'touchmove',
  e => {
    if (
      touchStartY !== null &&
      !arrastreConjuntoCompleto &&
      !piezaOpticaArrastrada &&
      !arrastrandoMasitaM2 &&
      !arrastrandoEnchufeFuenteM3 &&
      !arrastrandoCableBobinaM3 &&
      !arrastrandoLlaveAlCandadoM3 &&
      !arrastreRotacionCaja
    ) {
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      estado.targetScroll += dy * 0.0022;
    }
  },
  { passive: true }
);

$('rot-minus').onclick = () => {
  const p = OpticaMontaje1.piezas.find(x => x.id === OpticaMontaje1.piezaSeleccionadaId);
  if (p) {
    p.angle = ((p.angle - 5 + 180) % 360) - 180;
    verificarVictoriaOptica();
    actualizarRotadorUI();
  }
};
$('rot-plus').onclick = () => {
  const p = OpticaMontaje1.piezas.find(x => x.id === OpticaMontaje1.piezaSeleccionadaId);
  if (p) {
    p.angle = ((p.angle + 5 + 180) % 360) - 180;
    verificarVictoriaOptica();
    actualizarRotadorUI();
  }
};
$('rot-slider').oninput = e => {
  const p = OpticaMontaje1.piezas.find(x => x.id === OpticaMontaje1.piezaSeleccionadaId);
  if (p) {
    p.angle = Number(e.target.value);
    verificarVictoriaOptica();
    actualizarRotadorUI();
  }
};
$('rot-del').onclick = () => {
  if (!OpticaMontaje1.piezaSeleccionadaId) return;
  OpticaMontaje1.piezas = OpticaMontaje1.piezas.filter(
    x => x.id !== OpticaMontaje1.piezaSeleccionadaId
  );
  OpticaMontaje1.piezaSeleccionadaId = null;
  verificarVictoriaOptica();
  construirBandejaInferior();
  actualizarRotadorUI();
};

$('btnResetScrollTop').onclick = () => {
  estado.targetScroll = 0.0;
};
document.querySelectorAll('.rail-dot').forEach(dot => {
  dot.onclick = () => {
    estado.targetScroll = Number(dot.dataset.target);
  };
});

$('front').onclick = () => {
  estado.giro = false;
  $('orbit').setAttribute('aria-pressed', 'false');
  gsap.to(conjuntoTotal.rotation, { x: 0, y: 0, z: 0, duration: 0.55 });
  frames.forEach(f => gsap.to(f.rotation, { x: 0, y: 0, z: 0, duration: 0.5 }));
};
$('orbit').onclick = () => {
  estado.giro = !estado.giro;
  $('orbit').setAttribute('aria-pressed', String(estado.giro));
};
$('zin').onclick = () => {
  camera.fov = Math.max(24, camera.fov - 3);
  camera.updateProjectionMatrix();
};
$('zout').onclick = () => {
  camera.fov = Math.min(50, camera.fov + 3);
  camera.updateProjectionMatrix();
};

const sciModal = $('sci-help-modal');
$('btnOpenSciHelp').onclick = () => {
  sciModal.hidden = false;
};
$('btnCloseSciHelp').onclick = () => {
  sciModal.hidden = true;
};

const secModal = $('secondary-page');
$('btnOpenSecondaryPage').onclick = () => {
  secModal.hidden = false;
};
$('btnReturnMainScroll').onclick = () => {
  secModal.hidden = true;
};

let anterior = performance.now();
renderer.setAnimationLoop(() => {
  const ahora = performance.now();
  const dt = Math.min((ahora - anterior) / 1000, 0.05);
  anterior = ahora;

  actualizarEscenaPorScroll(dt);

  if (estado.giro) {
    if (estado.currentScroll < 0.85) {
      conjuntoTotal.rotation.y += dt * CONFIG.giroPorSegundo;
    } else {
      const idx = Math.round(estado.currentScroll) - 1;
      if (frames[idx]) frames[idx].rotation.y += dt * CONFIG.giroPorSegundo;
    }
  }

  camera.lookAt(controls.target);
  renderer.render(scene, camera);
});
