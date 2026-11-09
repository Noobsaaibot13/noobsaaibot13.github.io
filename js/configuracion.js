// ==========================================================================
// CONFIGURACIÓN GENERAL Y PARÁMETROS CONFIGURABLES — LUIS CONCEPCION
// ==========================================================================
export const CONFIG = {
  alturaReposo: 3.22,
  alturaExtraccion: 8.1,
  alturaBanqueteCerrado: 3.28,
  alturaBanqueteAbierto: 10.2,
  frente: 6.5,
  giroPorSegundo: 0.42,
  tiempoMaximoMontaje2Segundos: 120, // 2 minutos para el Montaje 2 (con 2 vidas)
  vidasInicialesMontaje2: 2,
  tiempoMaximoMontaje3Segundos: 60,  // 60 segundos para el Montaje 3
  camaraInicio: [8.2, 6.8, 12.6],
  objetivoInicio: [0, 3.0, 0],
  camaraExperimento: [0, 3.22, 12.8],
  objetivoExperimento: [0, 3.22, 6.5]
};

export const TEXTOS_BREVES = {
  1: {
    eyebrow: 'MONTAJE 01 · FOCO APAGADO (MODO OSCURO)',
    title: 'Brillo Óptico, Lupa y LEDs',
    desc: 'El foco superior se apagó para ver brillar los rayos, el arcoíris y los 4 LEDs que liberan la Masita.'
  },
  2: {
    eyebrow: 'MONTAJE 02 · LUZ BLANCA (2 VIDAS · 02:00)',
    title: 'El Acertijo de los 4 Resortes',
    desc: 'Con la luz blanca encendida, arrastra la Masita ganada hasta el resorte correcto (A, B, C o D).'
  },
  3: {
    eyebrow: 'MONTAJE 03 · «LA LLAVE FUERA DE ALCANCE»',
    title: 'Conexión Manual y Arrastre Magnético',
    desc: 'Conecta manualmente ambos extremos del cable. Usa el campo ligero de Vidrio o Madera para arrastrar la llave hacia el alcance del Hierro Dulce.'
  }
};
