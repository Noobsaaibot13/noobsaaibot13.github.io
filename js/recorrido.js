// ==========================================================================
// MOTOR DE SCROLL CONTINUO CON TRANSICIÓN GRADUAL DE LUZ/COLOR POCO A POCO
// Y PÁGINA FINAL DE AGRADECIMIENTO CON LA PASTILLA BRILLANDO — Luis Concepcion
// ==========================================================================
import { CONFIG, TEXTOS_BREVES } from './configuracion.js';

export function crearRecorrido(ctxEscena) {
  const {
    THREE,
    conjuntoTotal,
    frames,
    camera,
    controls,
    cubiertaBanquete,
    regalo1,
    regalo2,
    dispararEfectoPuf,
    actualizarFocoSuperiorProgresivo,
    OpticaMontaje1,
    ResortesMontaje2,
    MagnetismoMontaje3,
    zs
  } = ctxEscena;

  const estado = {
    currentScroll: 0.0,
    targetScroll: 0.0,
    giro: false,
    exp1Completado: false,
    exp2Completado: false,
    puf1Disparado: false,
    puf2Disparado: false
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }

  function posCajaEnTramo(zSlot, u) {
    const t = clamp(u, 0, 1);
    if (t < 0.35) {
      const k = t / 0.35;
      return { y: lerp(CONFIG.alturaReposo, CONFIG.alturaExtraccion, k), z: zSlot };
    } else if (t < 0.72) {
      const k = (t - 0.35) / 0.37;
      return { y: CONFIG.alturaExtraccion, z: lerp(zSlot, CONFIG.frente, k) };
    } else {
      const k = (t - 0.72) / 0.28;
      return { y: lerp(CONFIG.alturaExtraccion, CONFIG.alturaReposo, k), z: CONFIG.frente };
    }
  }

  function actualizarEscenaPorScroll(dt) {
    const maxPermitido = !estado.exp1Completado ? 1.0 : !estado.exp2Completado ? 2.0 : 3.0;
    estado.targetScroll = clamp(estado.targetScroll, 0.0, maxPermitido);

    estado.currentScroll += (estado.targetScroll - estado.currentScroll) * Math.min(1, dt * 8.5);
    if (Math.abs(estado.targetScroll - estado.currentScroll) < 0.0008) {
      estado.currentScroll = estado.targetScroll;
    }

    const s = estado.currentScroll;

    // Solo actualizar el montaje activo para mantener 60 FPS sin lag
    if (s >= 1.35 && s <= 2.35) {
      ResortesMontaje2.actualizar(dt);
    } else if (s > 2.35) {
      MagnetismoMontaje3.actualizar(dt);
    }

    if (s > 0.45 && !estado.giro) {
      conjuntoTotal.rotation.y *= 0.88;
      conjuntoTotal.rotation.x *= 0.88;
    }

    // Transición continua POCO A POCO de la luz y del color:
    // • Del Panel Principal (s=0.0) al Montaje 1 (s=1.0): la luz y el color bajan poco a poco (1.0 -> 0.0)
    // • Del Montaje 1 (s=1.0) al Montaje 2 (s=2.0): la luz y el color vuelven poco a poco al color normal (0.0 -> 1.0)
    if (s <= 1.0) {
      const uApagado = clamp((s - 0.12) / 0.84, 0, 1);
      const brillo = 1.0 - uApagado;
      const focoY = lerp(6.45, 5.15, uApagado);
      const focoZ = lerp(0.4, 5.2, uApagado);
      actualizarFocoSuperiorProgresivo(brillo, focoY, focoZ);
    } else if (s <= 2.0) {
      const uRegresoNormal = clamp((s - 1.04) / 0.84, 0, 1);
      const focoY = lerp(5.15, 6.45, uRegresoNormal);
      const focoZ = lerp(5.2, 4.5, uRegresoNormal);
      actualizarFocoSuperiorProgresivo(uRegresoNormal, focoY, focoZ);
    } else {
      actualizarFocoSuperiorProgresivo(1.0, 6.45, 4.5);
    }

    const heroIntro = document.getElementById('hero-intro');
    if (heroIntro) {
      heroIntro.style.opacity = String(clamp(1 - s * 3.1, 0, 1));
    }

    const railFill = document.getElementById('scroll-rail-fill');
    if (railFill) railFill.style.height = `${(s / 3) * 100}%`;
    document.querySelectorAll('.rail-dot').forEach(dot => {
      const target = Number(dot.dataset.target);
      dot.classList.toggle('active', Math.abs(s - target) < 0.35);
    });

    const uBanquete = clamp(s / 0.45, 0, 1);
    cubiertaBanquete.position.y = lerp(
      CONFIG.alturaBanqueteCerrado,
      CONFIG.alturaBanqueteAbierto,
      uBanquete
    );

    let u1 = 0, u2 = 0, u3 = 0;
    if (s <= 1.0) {
      u1 = clamp((s - 0.42) / 0.58, 0, 1);
    } else if (s <= 2.0) {
      u1 = 1.0 - clamp((s - 1.0) / 0.48, 0, 1);
      u2 = clamp((s - 1.48) / 0.52, 0, 1);
    } else {
      u2 = 1.0 - clamp((s - 2.0) / 0.48, 0, 1);
      u3 = clamp((s - 2.48) / 0.52, 0, 1);
    }

    const p1 = posCajaEnTramo(zs[0], u1);
    frames[0].position.y = p1.y;
    frames[0].position.z = p1.z;

    const p2 = posCajaEnTramo(zs[1], u2);
    frames[1].position.y = p2.y;
    frames[1].position.z = p2.z;

    const p3 = posCajaEnTramo(zs[2], u3);
    frames[2].position.y = p3.y;
    frames[2].position.z = p3.z;

    if (u1 < 0.95) { frames[0].rotation.x *= 0.88; frames[0].rotation.y *= 0.88; }
    if (u2 < 0.95) { frames[1].rotation.x *= 0.88; frames[1].rotation.y *= 0.88; }
    if (u3 < 0.95) { frames[2].rotation.x *= 0.88; frames[2].rotation.y *= 0.88; }

    const enTransito =
      (s > 0.35 && s < 0.88) || (s > 1.08 && s < 1.88) || (s > 2.08 && s < 2.88);
    if (s <= 0.35) {
      const k = s / 0.35;
      camera.position.set(
        lerp(CONFIG.camaraInicio[0], 9.2, k),
        lerp(CONFIG.camaraInicio[1], 8.2, k),
        lerp(CONFIG.camaraInicio[2], 16.5, k)
      );
      controls.target.set(0, lerp(3.0, 4.2, k), lerp(0, 1.5, k));
    } else if (enTransito) {
      camera.position.lerp(new THREE.Vector3(7.5, 7.8, 17.5), 0.08);
      controls.target.lerp(new THREE.Vector3(0, 4.2, 2.5), 0.08);
    } else {
      camera.position.lerp(
        new THREE.Vector3(
          CONFIG.camaraExperimento[0],
          CONFIG.camaraExperimento[1],
          CONFIG.camaraExperimento[2]
        ),
        0.1
      );
      controls.target.lerp(
        new THREE.Vector3(
          CONFIG.objetivoExperimento[0],
          CONFIG.objetivoExperimento[1],
          CONFIG.objetivoExperimento[2]
        ),
        0.1
      );
    }

    const enM1 = s >= 0.92 && s <= 1.08;
    if (!enM1 && OpticaMontaje1.linternaEncendida) {
      OpticaMontaje1.linternaEncendida = false;
      OpticaMontaje1.recalcularRayos();
    }

    if (estado.exp1Completado && s >= 1.90 && !estado.puf1Disparado) {
      estado.puf1Disparado = true;
      frames[1].add(regalo1);
      regalo1.position.set(1.42, 0.45, 0);
      gsap.to(regalo1.userData.tapaPivot.rotation, {
        x: -Math.PI * 0.7,
        duration: 0.35,
        onComplete: () => {
          const wp = new THREE.Vector3();
          regalo1.getWorldPosition(wp);
          dispararEfectoPuf(wp);
          regalo1.visible = false;
          ResortesMontaje2.masitaRecibida = true;
          ResortesMontaje2.cronometroActivo = true;
          ResortesMontaje2.dirty = true;
        }
      });
    }

    if (estado.exp2Completado && s >= 2.90 && !estado.puf2Disparado) {
      estado.puf2Disparado = true;
      frames[2].add(regalo2);
      regalo2.position.set(-1.35, 1.35, 0);
      gsap.to(regalo2.userData.tapaPivot.rotation, {
        x: -Math.PI * 0.7,
        duration: 0.35,
        onComplete: () => {
          const wp = new THREE.Vector3();
          regalo2.getWorldPosition(wp);
          dispararEfectoPuf(wp);
          regalo2.visible = false;
          MagnetismoMontaje3.cableRecibido = true;
          MagnetismoMontaje3.dirty = true;
        }
      });
    }

    actualizarInterfazContextual(s);
  }

  let ultimaCajaCercana = -1;
  function actualizarInterfazContextual(s) {
    const caption = document.getElementById('exp-caption');
    const tray = document.getElementById('bottom-tray');
    const rotator = document.getElementById('optic-rotator');

    const cajaCercana =
      s >= 0.92 && s <= 1.08 ? 1 : s >= 1.92 && s <= 2.08 ? 2 : s >= 2.92 ? 3 : 0;

    if (cajaCercana > 0) {
      const info = TEXTOS_BREVES[cajaCercana];
      document.getElementById('cap-eyebrow').textContent = info.eyebrow;
      document.getElementById('cap-title').textContent = info.title;
      document.getElementById('cap-desc').textContent = info.desc;

      const lockEl = document.getElementById('cap-lock');
      if (cajaCercana === 1) {
        lockEl.className = `lock-pill ${estado.exp1Completado ? 'unlocked' : ''}`;
        lockEl.textContent = estado.exp1Completado
          ? '✓ 4 LEDs brillantes y Masita liberada · Haz scroll al Montaje 2 ↓'
          : '🔒 Scroll bloqueado hasta encender los 4 LEDs';
      } else if (cajaCercana === 2) {
        lockEl.className = `lock-pill ${estado.exp2Completado ? 'unlocked' : ''}`;
        lockEl.textContent = estado.exp2Completado
          ? '✓ Cable bipolar liberado · Haz scroll al Montaje 3 ↓'
          : '🔒 Scroll bloqueado hasta colocar la Masita en el resorte correcto';
      } else {
        lockEl.className = `lock-pill ${MagnetismoMontaje3.candadoAbierto ? 'unlocked' : ''}`;
        lockEl.textContent = MagnetismoMontaje3.candadoAbierto
          ? '★ ¡Pastilla de Colección obtenida!'
          : 'Conecta 2. Madera, bájala al ras y arrastra la llave hacia el Hierro Dulce';
      }

      caption.classList.add('visible');
      tray.classList.add('visible');
    } else {
      caption.classList.remove('visible');
      tray.classList.remove('visible');
      if (rotator) rotator.hidden = true;
    }

    if (cajaCercana !== ultimaCajaCercana) {
      ultimaCajaCercana = cajaCercana;
      if (cajaCercana === 1 && !OpticaMontaje1.linternaEncendida) {
        OpticaMontaje1.linternaEncendida = true;
        OpticaMontaje1.recalcularRayos();
      }
      if (cajaCercana === 2 && !ResortesMontaje2.masitaRecibida) {
        ResortesMontaje2.masitaRecibida = true;
        ResortesMontaje2.cronometroActivo = true;
        ResortesMontaje2.dirty = true;
      }
      if (cajaCercana === 3) {
        MagnetismoMontaje3.cableRecibido = true;
        MagnetismoMontaje3.dirty = true;
      }
      construirBandejaInferior();
      actualizarRotadorUI();
    }
  }

  function construirBandejaInferior() {
    const tray = document.getElementById('bottom-tray');
    if (!tray) return;
    tray.innerHTML = '';

    if (ultimaCajaCercana === 1) {
      const slotLinterna = document.createElement('div');
      slotLinterna.className = `tray-slot ${OpticaMontaje1.linternaEncendida ? 'active-tool' : ''}`;
      slotLinterna.innerHTML = `
        <span class="tray-count">${OpticaMontaje1.linternaEncendida ? 'ON' : 'OFF'}</span>
        <div style="font-size:19px;margin-top:5px;">🔦</div>
        <span class="tray-name">Linterna</span>
      `;
      slotLinterna.onclick = e => {
        e.stopPropagation();
        OpticaMontaje1.linternaEncendida = !OpticaMontaje1.linternaEncendida;
        verificarVictoriaOptica();
        construirBandejaInferior();
      };
      tray.appendChild(slotLinterna);

      for (const item of OpticaMontaje1.catalogo) {
        const rem = OpticaMontaje1.restantes(item.type);
        const slot = document.createElement('div');
        slot.className = `tray-slot ${rem === 0 ? 'depleted' : ''}`;
        const icono =
          item.type === 'divisor'
            ? '⟋'
            : item.type === 'espejo'
            ? '🪞'
            : item.type === 'lupa'
            ? '🔍'
            : '🔺';
        slot.innerHTML = `
          <span class="tray-count">${rem}/${item.max}</span>
          <div style="font-size:18px;margin-top:5px;">${icono}</div>
          <span class="tray-name">${item.name}</span>
        `;
        slot.onclick = e => {
          e.stopPropagation();
          if (rem <= 0) return;
          let pos = { x: 320, y: 380 };
          for (const n of OpticaMontaje1.nodosAnclaje) {
            const ocupado = OpticaMontaje1.piezas.some(
              p => Math.hypot(p.x - n.x, p.y - n.y) < 28
            );
            if (!ocupado) {
              pos = { x: n.x, y: n.y };
              break;
            }
          }
          const nueva = {
            id: `p_${OpticaMontaje1.nextId++}`,
            type: item.type,
            x: pos.x,
            y: pos.y,
            angle: item.defaultAngle,
            radius: item.radius
          };
          OpticaMontaje1.piezas.push(nueva);
          OpticaMontaje1.piezaSeleccionadaId = nueva.id;
          verificarVictoriaOptica();
          construirBandejaInferior();
          actualizarRotadorUI();
        };
        tray.appendChild(slot);
      }

      const slotDemo = document.createElement('div');
      slotDemo.className = 'tray-slot';
      slotDemo.innerHTML = `
        <span class="tray-count">DEMO</span>
        <div style="font-size:18px;margin-top:5px;">🌈</div>
        <span class="tray-name">Montar Todo</span>
      `;
      slotDemo.onclick = e => {
        e.stopPropagation();
        OpticaMontaje1.cargarDemostracionCompleta();
        verificarVictoriaOptica();
        construirBandejaInferior();
        actualizarRotadorUI();
      };
      tray.appendChild(slotDemo);
    } else if (ultimaCajaCercana === 2) {
      ['A', 'B', 'C', 'D'].forEach(letra => {
        const slot = document.createElement('div');
        slot.className = `tray-slot ${ResortesMontaje2.masita.resorteColgadoId === letra ? 'active-tool' : ''}`;
        slot.innerHTML = `
          <span class="tray-count">${letra}</span>
          <div style="font-size:18px;margin-top:5px;">⚖️</div>
          <span class="tray-name">Colgar en ${letra}</span>
        `;
        slot.onclick = e => {
          e.stopPropagation();
          ResortesMontaje2.colgarMasitaEnResorte(letra, () => {
            desbloquearMontaje2();
          });
          construirBandejaInferior();
        };
        tray.appendChild(slot);
      });

      const slotReset2 = document.createElement('div');
      slotReset2.className = 'tray-slot';
      slotReset2.innerHTML = `
        <span class="tray-count">2 ❤️</span>
        <div style="font-size:18px;margin-top:5px;">↻</div>
        <span class="tray-name">Reintentar M2</span>
      `;
      slotReset2.onclick = e => {
        e.stopPropagation();
        ResortesMontaje2.reiniciarMontaje2();
        construirBandejaInferior();
      };
      tray.appendChild(slotReset2);
    } else if (ultimaCajaCercana === 3) {
      const addBtn3 = (badge, icon, label, isSelected, onClick) => {
        const slot = document.createElement('div');
        slot.className = `tray-slot ${isSelected ? 'active-tool' : ''}`;
        slot.innerHTML = `
          <span class="tray-count">${badge}</span>
          <div style="font-size:17px;margin-top:5px;">${icon}</div>
          <span class="tray-name">${label}</span>
        `;
        slot.onclick = e => {
          e.stopPropagation();
          onClick();
          construirBandejaInferior();
        };
        tray.appendChild(slot);
      };

      if (!MagnetismoMontaje3.intentoIniciado && !MagnetismoMontaje3.tiempoAgotado && !MagnetismoMontaje3.llave.enBandejaExterior) {
        addBtn3('60 s', '⏱️', 'Iniciar Reloj', false, () => MagnetismoMontaje3.iniciarIntento());
      }
      if (MagnetismoMontaje3.tiempoAgotado) {
        addBtn3('60 s', '↻', 'Reintentar M3', false, () => MagnetismoMontaje3.reiniciarIntento());
      }

      addBtn3(
        'Núcleo 1',
        '🔌',
        '1. Vidrio',
        MagnetismoMontaje3.conectorEnchufadoEn === 'vidrio',
        () => MagnetismoMontaje3.conectarCableA('vidrio')
      );
      addBtn3(
        'Núcleo 2',
        '🪵',
        '2. Madera',
        MagnetismoMontaje3.conectorEnchufadoEn === 'madera',
        () => MagnetismoMontaje3.conectarCableA('madera')
      );
      addBtn3(
        'Núcleo 3',
        '🧲',
        '3. Hierro Dulce',
        MagnetismoMontaje3.conectorEnchufadoEn === 'hierro',
        () => MagnetismoMontaje3.conectarCableA('hierro')
      );

      addBtn3('Carro', '◀', 'Mover Izq.', false, () => MagnetismoMontaje3.moverCarroHorizontal(-36));
      addBtn3('Carro', '▶', 'Mover Der.', false, () => MagnetismoMontaje3.moverCarroHorizontal(36));
      addBtn3('Torno', '⬇', 'Bajar al Ras', false, () => MagnetismoMontaje3.ejecutarBajarYProbar());
      addBtn3('Torno', '▲', 'Subir Bobina', false, () => MagnetismoMontaje3.subirCabezalAEstacionamiento());
      addBtn3('Altura', '▼', 'Nivel Medio', false, () => MagnetismoMontaje3.ajustarAlturaManual(55));
      addBtn3('Bobina', '⚡', 'Soltar / Cortar', false, () =>
        MagnetismoMontaje3.ejecutarSoltar(() => {
          construirBandejaInferior();
        })
      );

      if (MagnetismoMontaje3.llave.enBandejaExterior && !MagnetismoMontaje3.candadoAbierto) {
        addBtn3('Premio', '🔓', 'Abrir Candado', false, () => {
          MagnetismoMontaje3.abrirCandadoRegaloFinal();
          actualizarInterfazContextual(estado.currentScroll);
        });
      }
    }
  }

  function actualizarRotadorUI() {
    const rot = document.getElementById('optic-rotator');
    if (!rot) return;
    if (ultimaCajaCercana !== 1 || !OpticaMontaje1.piezaSeleccionadaId) {
      rot.hidden = true;
      return;
    }
    const p = OpticaMontaje1.piezas.find(x => x.id === OpticaMontaje1.piezaSeleccionadaId);
    if (!p) {
      rot.hidden = true;
      return;
    }
    rot.hidden = false;
    document.getElementById('rotator-label').textContent = p.type.toUpperCase();
    document.getElementById('rot-slider').value = Math.round(p.angle);
    document.getElementById('rot-val').textContent = `${Math.round(p.angle)}°`;
  }

  function verificarVictoriaOptica() {
    const ganado = OpticaMontaje1.recalcularRayos();
    if (ganado && !estado.exp1Completado) {
      estado.exp1Completado = true;
      const wCompuerta = OpticaMontaje1.walls.find(w => w.esCompuertaRegalo);
      if (wCompuerta) wCompuerta.h = 40;
      OpticaMontaje1.dibujarCanvasOptico();
      gsap.to(regalo1.position, { x: 0.95, y: -0.95, duration: 0.55, ease: 'back.out(1.7)' });
      actualizarInterfazContextual(estado.currentScroll);
    }
  }

  function desbloquearMontaje2() {
    if (!estado.exp2Completado) {
      estado.exp2Completado = true;
      gsap.to(regalo2.position, { x: 0.95, y: -0.95, duration: 0.55, ease: 'back.out(1.7)' });
      actualizarInterfazContextual(estado.currentScroll);
    }
  }

  return {
    estado,
    actualizarEscenaPorScroll,
    verificarVictoriaOptica,
    desbloquearMontaje2,
    construirBandejaInferior,
    actualizarRotadorUI
  };
}
