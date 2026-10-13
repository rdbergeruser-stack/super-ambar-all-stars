// ============================================================================
// LEVEL DEFINITIONS - SUPER ÁMBAR ALL-STARS (7 WORLDS + BICYCLE LEVEL!)
// Grid: 15 rows high (0 = top sky, 13-14 = ground floor), 32x32 px tiles
// ============================================================================

function createEmptyGrid(cols, rows = 15) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(new Array(cols).fill('.'));
  }
  return grid;
}

function fillRect(grid, c1, r1, w, h, ch) {
  for (let r = r1; r < r1 + h; r++) {
    for (let c = c1; c < c1 + w; c++) {
      if (grid[r] && c >= 0 && c < grid[r].length) {
        grid[r][c] = ch;
      }
    }
  }
}

function addPipe(grid, col, topRow, groundRow = 13) {
  grid[topRow][col] = 'P';
  grid[topRow][col + 1] = 'P';
  for (let r = topRow + 1; r < groundRow; r++) {
    grid[r][col] = 'p';
    grid[r][col + 1] = 'p';
  }
}

function addStairs(grid, startCol, height, dir = 1, groundRow = 13) {
  for (let step = 0; step < height; step++) {
    const col = dir > 0 ? startCol + step : startCol + (height - 1 - step);
    for (let r = groundRow - 1 - step; r < groundRow; r++) {
      grid[r][col] = 'H';
    }
  }
}

// Helper to spell "AMBAR" in floating coins!
function addAmbarCoinBanner(coins, startTileX, topTileY) {
  const pattern = [
    " .#.  #...# ####   .#.  #### ",
    "#...# ##.## #...# #...# #...#",
    "##### #.#.# ####  ##### #### ",
    "#...# #...# #...# #...# #..# ",
    "#...# #...# ####  #...# #...#"
  ];
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      if (pattern[r][c] === '#') {
        coins.push({ x: (startTileX + c) * 32 + 4, y: (topTileY + r) * 32 + 4 });
      }
    }
  }
}

// ============================================================================
// NIVEL 1-1: PRADERA DE ALGODÓN DE AZÚCAR Y ARCOÍRIS
// ============================================================================
function buildLevel1() {
  const cols = 155;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  fillRect(grid, 0, 13, cols, 2, '#');
  fillRect(grid, 48, 13, 3, 2, '.');
  fillRect(grid, 88, 13, 3, 2, '.');

  // Opening Mario-style Question & Super Mushroom blocks!
  grid[9][10] = '?';
  grid[9][13] = 'B';
  grid[9][14] = 'M'; // <-- Super Hongo Mágico!
  grid[9][15] = 'B';
  grid[9][16] = '?';
  grid[9][17] = 'B';
  grid[5][15] = '?';

  enemies.push({ type: 'goomba', x: 16 * 32, y: 12 * 32 });

  addPipe(grid, 22, 11);
  addPipe(grid, 29, 10);
  enemies.push({ type: 'goomba', x: 26 * 32, y: 12 * 32 });

  addPipe(grid, 37, 9);
  enemies.push({ type: 'goomba', x: 33 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 35 * 32, y: 12 * 32 });

  for (let c = 30; c <= 35; c++) {
    coins.push({ x: c * 32 + 4, y: 7 * 32 });
  }

  grid[9][42] = 'B';
  grid[9][43] = 'M';
  grid[9][44] = 'B';
  grid[5][45] = 'L'; // Hongo Verde 1-UP!

  grid[12][53] = 'J';
  fillRect(grid, 55, 8, 30, 1, 'B');
  addAmbarCoinBanner(coins, 56, 2);

  enemies.push({ type: 'goomba', x: 60 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 63 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 72 * 32, y: 12 * 32 });

  const checkpointCol = 78;

  platforms.push({
    x: 87 * 32,
    y: 10 * 32,
    w: 96,
    h: 20,
    minX: 86 * 32,
    maxX: 92 * 32,
    vx: 1.2,
    vy: 0,
    style: 'cloud'
  });

  grid[9][96] = 'B';
  grid[9][97] = 'S'; // Super Estrella!
  grid[9][98] = 'B';

  enemies.push({ type: 'goomba', x: 103 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 105 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 108 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 112 * 32, y: 12 * 32 });

  addStairs(grid, 116, 4, 1);
  addStairs(grid, 122, 4, -1);

  addPipe(grid, 129, 11);

  addStairs(grid, 134, 7, 1);
  grid[12][141] = 'H';

  return {
    id: 1,
    name: 'MUNDO 1-1: PRADERA ARCOÍRIS',
    subtitle: '¡Toma el Super Hongo para crecer y usar el Buzo Rosa con Lentes Violetas!',
    theme: 1,
    bgm: 'level1',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 146 * 32,
    castleX: 150 * 32
  };
}

// ============================================================================
// NIVEL 1-2: LA FÁBRICA DE JUGUETES MÁGICOS (CON EL TRENCITO DE MADERA)
// ============================================================================
function buildLevel2() {
  const cols = 160;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  fillRect(grid, 0, 13, 32, 2, '#');
  fillRect(grid, 42, 13, 34, 2, '#');
  fillRect(grid, 85, 13, 30, 2, '#');
  fillRect(grid, 124, 13, 36, 2, '#');

  grid[9][8] = '?';
  grid[9][9] = 'M';
  grid[9][10] = '?';

  fillRect(grid, 15, 10, 4, 1, 'H');
  grid[12][21] = 'J';

  for (let c = 21; c <= 26; c++) {
    coins.push({ x: c * 32 + 4, y: 5 * 32 });
  }

  enemies.push({ type: 'robot', x: 18 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 27 * 32, y: 12 * 32 });

  platforms.push({
    x: 32 * 32,
    y: 11 * 32,
    w: 112,
    h: 22,
    minX: 31 * 32,
    maxX: 40 * 32,
    vx: 1.5,
    vy: 0,
    style: 'train'
  });

  for (let c = 34; c <= 39; c++) {
    coins.push({ x: c * 32 + 4, y: 8 * 32 });
  }

  fillRect(grid, 46, 9, 8, 1, 'B');
  grid[9][50] = 'M';
  fillRect(grid, 56, 6, 8, 1, 'B');
  grid[6][60] = 'L';

  enemies.push({ type: 'robot', x: 49 * 32, y: 12 * 32 });
  enemies.push({ type: 'cloud', x: 55 * 32, y: 7 * 32, baseY: 7 * 32 });
  enemies.push({ type: 'goomba', x: 64 * 32, y: 12 * 32 });
  enemies.push({ type: 'robot', x: 70 * 32, y: 12 * 32 });

  platforms.push({
    x: 75 * 32,
    y: 10 * 32,
    w: 104,
    h: 22,
    minX: 74 * 32,
    maxX: 83 * 32,
    vx: 1.7,
    vy: 0,
    style: 'train'
  });

  const checkpointCol = 88;

  grid[9][92] = '?';
  grid[9][93] = 'M';
  grid[9][94] = 'S';

  grid[12][99] = 'J';
  fillRect(grid, 102, 7, 10, 1, 'H');
  for (let c = 103; c <= 110; c++) {
    coins.push({ x: c * 32 + 4, y: 5 * 32 });
  }

  enemies.push({ type: 'koopa', x: 105 * 32, y: 6 * 32 });
  enemies.push({ type: 'robot', x: 108 * 32, y: 12 * 32 });

  platforms.push({
    x: 115 * 32,
    y: 11 * 32,
    w: 112,
    h: 22,
    minX: 114 * 32,
    maxX: 122 * 32,
    vx: 1.6,
    vy: 0,
    style: 'train'
  });
  enemies.push({ type: 'cloud', x: 119 * 32, y: 6 * 32, baseY: 6 * 32 });

  addStairs(grid, 132, 7, 1);
  grid[12][139] = 'H';

  // Ruta Secreta estilo Super Mario World: Estante Alto con Llave Dorada ('K') y Cerradura Cósmica ('O')
  grid[12][123] = 'J'; // Resorte para alcanzar el estante secreto superior
  fillRect(grid, 126, 4, 16, 1, 'H'); // Estante alto de juguetes
  for (let c = 127; c <= 140; c++) {
    coins.push({ x: c * 32 + 4, y: 2 * 32 });
  }
  grid[3][129] = 'K'; // ¡La Llave Dorada Secreta!
  grid[3][138] = 'O'; // ¡La Cerradura Cósmica que desbloquea 1-S!

  // Portal Secreto Alternativo detrás del Castillo (col 154)
  grid[12][154] = 'O';

  return {
    id: 2,
    name: 'MUNDO 1-2: TALLER DE JUGUETES Y TRENCITOS',
    subtitle: '¡Sube a los Trencitos de Madera y rebota en los Resortes!',
    theme: 2,
    bgm: 'level2',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 146 * 32,
    castleX: 150 * 32
  };
}

// ============================================================================
// NIVEL 1-3: CASTILLO DE PIEDRA (GUARDIÁN TORMENTA)
// ============================================================================
function buildLevel3() {
  const cols = 140;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  fillRect(grid, 0, 0, 105, 1, '#');
  fillRect(grid, 0, 13, 28, 2, '#');
  fillRect(grid, 34, 13, 28, 2, '#');
  fillRect(grid, 68, 13, 28, 2, '#');
  fillRect(grid, 114, 13, 26, 2, '#');

  grid[9][7] = 'M';
  grid[9][8] = '?';
  grid[9][9] = 'M';

  enemies.push({ type: 'robot', x: 16 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 22 * 32, y: 12 * 32 });

  platforms.push({
    x: 28 * 32,
    y: 11 * 32,
    w: 96,
    h: 20,
    minX: 27 * 32,
    maxX: 33 * 32,
    vx: 1.5,
    vy: 0,
    style: 'cloud'
  });

  fillRect(grid, 40, 9, 6, 1, 'B');
  fillRect(grid, 50, 7, 6, 1, 'B');
  for (let c = 50; c <= 55; c++) {
    coins.push({ x: c * 32 + 4, y: 5 * 32 });
  }

  enemies.push({ type: 'cloud', x: 45 * 32, y: 6 * 32, baseY: 6 * 32 });
  enemies.push({ type: 'robot', x: 54 * 32, y: 12 * 32 });

  platforms.push({
    x: 62 * 32,
    y: 11 * 32,
    w: 104,
    h: 22,
    minX: 61 * 32,
    maxX: 67 * 32,
    vx: 1.6,
    vy: 0,
    style: 'train'
  });

  const checkpointCol = 72;

  grid[9][76] = 'M';
  grid[9][78] = '?';
  grid[9][80] = 'M';
  grid[12][86] = 'J';

  for (let c = 96; c <= 113; c++) {
    grid[12][c] = '=';
  }
  fillRect(grid, 99, 8, 3, 1, 'H');
  fillRect(grid, 106, 8, 3, 1, 'H');

  grid[11][113] = 'A';

  enemies.push({
    type: 'boss',
    x: 107 * 32,
    y: 9 * 32,
    w: 64,
    h: 60,
    hp: 4,
    maxHp: 4,
    minX: 97 * 32,
    maxX: 111 * 32
  });

  return {
    id: 3,
    name: 'MUNDO 1-3: CASTILLO DEL GUARDIÁN',
    subtitle: '¡Cruza el puente de lava y vence al Guardián para seguir tu aventura!',
    theme: 3,
    bgm: 'level3',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 126 * 32,
    castleX: 130 * 32
  };
}

// ============================================================================
// NIVEL 1-4: PASEO COSTERO EN BICICLETA (¡ÁMBAR RECORRE EL NIVEL EN SU BICI!)
// Designed specifically for high-speed bicycle riding:
// - Turbo Speed Pads ('T') on the road before stunt ramps
// - Long paved bike lanes, wooden stunt ramps, suspension bridges, and coin arcs!
// ============================================================================
function buildLevel4Bike() {
  const cols = 195;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  // Long paved bicycle track sections with scenic ramp jumps!
  fillRect(grid, 0, 13, 38, 2, '#');
  fillRect(grid, 42, 13, 38, 2, '#');
  fillRect(grid, 85, 13, 42, 2, '#');
  fillRect(grid, 132, 13, 63, 2, '#');

  // Opening Power-Up & Speed Boost Pad
  grid[9][9] = 'M';
  grid[9][10] = '?';
  grid[9][11] = 'S';

  // Coin line along initial flat bike sprint
  for (let c = 12; c <= 20; c++) {
    coins.push({ x: c * 32 + 4, y: 11 * 32 + 4 });
  }

  enemies.push({ type: 'goomba', x: 23 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 27 * 32, y: 12 * 32 });

  // STUNT RAMP 1 (cols 31..37) with Turbo Boost Pads ('T') leading up to it!
  grid[13][29] = 'T';
  grid[13][30] = 'T';
  grid[13][31] = 'T';
  addStairs(grid, 33, 4, 1);
  grid[9][37] = 'H';

  // High coin arc over the gap (cols 38..42) matching bike ramp trajectory!
  const arcCols1 = [38, 39, 40, 41, 42, 43];
  const arcRows1 = [7,  6,  5,  5,  6,  7];
  for (let i = 0; i < arcCols1.length; i++) {
    coins.push({ x: arcCols1[i] * 32 + 4, y: arcRows1[i] * 32 });
  }

  // Landing deck & upper bike boardwalk (cols 44..58)
  fillRect(grid, 45, 9, 14, 1, '=');
  for (let c = 46; c <= 57; c += 2) {
    coins.push({ x: c * 32 + 4, y: 7 * 32 });
  }

  // Lower bike lane under the boardwalk with Turbo Pads & Enemies
  grid[13][47] = 'T';
  grid[13][48] = 'T';
  enemies.push({ type: 'robot', x: 52 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 56 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 63 * 32, y: 12 * 32 });

  // Double Rolling Bike Hills (cols 65..74)
  fillRect(grid, 65, 12, 6, 1, 'H');
  fillRect(grid, 67, 11, 2, 1, 'H');

  // STUNT RAMP 2 (cols 75..79) launching over Gap 2 (cols 80..84)
  grid[13][72] = 'T';
  grid[13][73] = 'T';
  addStairs(grid, 75, 4, 1);
  grid[9][79] = 'H';
  // Safety bridge in case player cruises low
  for (let c = 80; c <= 84; c++) {
    grid[12][c] = '=';
  }
  for (let c = 80; c <= 84; c++) {
    coins.push({ x: c * 32 + 4, y: 6 * 32 });
  }

  // CHECKPOINT at col 88!
  const checkpointCol = 88;
  grid[9][90] = 'M';
  grid[9][92] = 'L'; // 1-UP Green Mushroom!

  // High-Speed Slalom & Wooden Suspension Bridge (cols 95..125)
  grid[13][94] = 'T';
  grid[13][95] = 'T';
  enemies.push({ type: 'koopa', x: 99 * 32, y: 12 * 32 });
  enemies.push({ type: 'robot', x: 105 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 111 * 32, y: 12 * 32 });

  // Elevated Bike Track + Star Power-up!
  fillRect(grid, 102, 8, 16, 1, '=');
  grid[5][109] = 'S'; // Super Star!
  for (let c = 103; c <= 116; c++) {
    coins.push({ x: c * 32 + 4, y: 6 * 32 });
  }

  // MEGA RAMP 3 (cols 121..126) over the canyon gap (cols 127..131)
  grid[13][119] = 'T';
  grid[13][120] = 'T';
  addStairs(grid, 122, 5, 1);
  for (let c = 127; c <= 131; c++) {
    grid[12][c] = '=';
    coins.push({ x: c * 32 + 4, y: 5 * 32 });
  }

  // Final Turbo Straightaway to the Goal Flag!
  grid[13][136] = 'T';
  grid[13][137] = 'T';
  grid[13][146] = 'T';
  grid[13][147] = 'T';
  for (let c = 138; c <= 162; c += 2) {
    coins.push({ x: c * 32 + 4, y: 11 * 32 });
  }
  enemies.push({ type: 'goomba', x: 144 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 152 * 32, y: 12 * 32 });
  enemies.push({ type: 'robot', x: 158 * 32, y: 12 * 32 });

  // Final Victory Bike Ramp to the Flagpole!
  grid[13][166] = 'T';
  grid[13][167] = 'T';
  addStairs(grid, 169, 6, 1);
  grid[12][175] = 'H';

  // Salida Secreta Alternativa en Bici: Mega Salto hacia la Nube Cósmica
  fillRect(grid, 172, 4, 6, 1, 'C');
  grid[3][174] = 'O'; // ¡Portal Secreto hacia 1-S!

  return {
    id: 4,
    name: 'MUNDO 1-4: PLAYA COSTERA EN BICICLETA',
    subtitle: '¡Ámbar pedalea por la playa al atardecer! Pisa las flechas TURBO y salta las rampas',
    theme: 4,
    isBikeLevel: true,
    bgm: 'level1',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 181 * 32,
    castleX: 185 * 32
  };
}

// ============================================================================
// NIVEL 1-5: CUEVA DE CRISTAL SUBTERRÁNEA
// ============================================================================
function buildLevel5Crystal() {
  const cols = 160;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  // Underground cavern roof and floors
  fillRect(grid, 0, 0, 138, 1, '#');
  fillRect(grid, 0, 13, 45, 2, '#');
  fillRect(grid, 53, 13, 42, 2, '#');
  fillRect(grid, 103, 13, 57, 2, '#');

  // Cavern Stalactite Pillars & Power-up blocks
  grid[9][8] = '?';
  grid[9][9] = 'M';
  grid[9][10] = '?';

  addPipe(grid, 18, 10);
  enemies.push({ type: 'goomba', x: 15 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 24 * 32, y: 12 * 32 });

  // Multi-level crystal ledges
  fillRect(grid, 26, 9, 10, 1, 'B');
  fillRect(grid, 29, 5, 6, 1, 'B');
  grid[5][31] = 'L'; // 1-UP Green Mushroom!
  for (let c = 27; c <= 34; c++) {
    coins.push({ x: c * 32 + 4, y: 7 * 32 });
  }

  enemies.push({ type: 'robot', x: 38 * 32, y: 12 * 32 });

  // Moving platform over crystal chasm 1 (cols 45..52)
  platforms.push({
    x: 45 * 32,
    y: 11 * 32,
    w: 104,
    h: 20,
    minX: 44 * 32,
    maxX: 52 * 32,
    vx: 1.5,
    vy: 0,
    style: 'cloud'
  });

  // Mid cavern with Koopa shell bowling alley!
  grid[9][57] = 'M';
  grid[9][58] = 'B';
  grid[9][59] = '?';
  enemies.push({ type: 'koopa', x: 62 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 67 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 70 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 73 * 32, y: 12 * 32 });

  addPipe(grid, 77, 10);
  const checkpointCol = 82;

  grid[12][86] = 'J'; // Spring to upper crystal gallery
  fillRect(grid, 88, 7, 12, 1, 'H');
  for (let c = 89; c <= 98; c++) {
    coins.push({ x: c * 32 + 4, y: 5 * 32 });
  }

  // Moving Train over chasm 2 (cols 95..102)
  platforms.push({
    x: 95 * 32,
    y: 11 * 32,
    w: 104,
    h: 22,
    minX: 94 * 32,
    maxX: 102 * 32,
    vx: 1.6,
    vy: 0,
    style: 'train'
  });

  grid[9][107] = 'S'; // Super Star!
  enemies.push({ type: 'robot', x: 112 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 117 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 122 * 32, y: 12 * 32 });

  addStairs(grid, 132, 7, 1);
  grid[12][139] = 'H';

  return {
    id: 5,
    name: 'MUNDO 1-5: CUEVA DE CRISTAL SUBTERRÁNEA',
    subtitle: '¡Patea el Caparazón de Tortuga para derribar filas de enemigos!',
    theme: 5,
    bgm: 'level2',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 146 * 32,
    castleX: 150 * 32
  };
}

// ============================================================================
// NIVEL 1-6: CIELO DE NUBES Y PUENTES ARCOÍRIS
// ============================================================================
function buildLevel6Sky() {
  const cols = 160;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  // Starting sky island
  fillRect(grid, 0, 13, 24, 2, '#');
  grid[9][7] = 'M';
  grid[9][8] = '?';
  grid[9][9] = 'L';

  // Rainbow Bridges & Cloud Islands in the sky!
  fillRect(grid, 26, 11, 16, 1, '=');
  for (let c = 28; c <= 39; c += 2) {
    coins.push({ x: c * 32 + 4, y: 9 * 32 });
  }
  enemies.push({ type: 'koopa', x: 34 * 32, y: 10 * 32 });
  enemies.push({ type: 'cloud', x: 40 * 32, y: 6 * 32, baseY: 6 * 32 });

  // Sky Island 2
  fillRect(grid, 44, 13, 28, 2, '#');
  grid[12][49] = 'J';
  fillRect(grid, 52, 7, 14, 1, 'B');
  addAmbarCoinBanner(coins, 48, 2);

  enemies.push({ type: 'goomba', x: 55 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 62 * 32, y: 12 * 32 });

  // Moving Cloud Platforms across the sky gap (cols 72..84)
  platforms.push({
    x: 73 * 32,
    y: 11 * 32,
    w: 104,
    h: 20,
    minX: 72 * 32,
    maxX: 83 * 32,
    vx: 1.6,
    vy: 0,
    style: 'cloud'
  });

  // Sky Island 3 + Checkpoint
  fillRect(grid, 84, 13, 30, 2, '#');
  const checkpointCol = 87;
  grid[9][90] = 'M';
  grid[9][91] = 'S';

  enemies.push({ type: 'cloud', x: 96 * 32, y: 7 * 32, baseY: 7 * 32 });
  enemies.push({ type: 'robot', x: 101 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 107 * 32, y: 12 * 32 });

  // High Rainbow Bridge + Moving Cloud
  fillRect(grid, 115, 10, 12, 1, '=');
  for (let c = 116; c <= 125; c++) {
    coins.push({ x: c * 32 + 4, y: 8 * 32 });
  }

  // Final Sky Sanctuary Island
  fillRect(grid, 128, 13, 32, 2, '#');
  addStairs(grid, 133, 7, 1);
  grid[12][140] = 'H';

  return {
    id: 6,
    name: 'MUNDO 1-6: CIELO DE NUBES Y ARCOÍRIS',
    subtitle: '¡Salta entre las islas flotantes y los puentes del cielo!',
    theme: 6,
    bgm: 'level1',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 146 * 32,
    castleX: 150 * 32
  };
}

// ============================================================================
// NIVEL 1-7: VUELO SUPERSÓNICO DE SUPER ÁMBAR (¡VUELA COMO SUPERMAN!)
// ============================================================================
function buildLevel7Flying() {
  const cols = 185;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  // NO SOLID GROUND FLOOR! Pure open sky with soft 16-bit cloud islands ('C')!
  // Small starting cloud cushion & ending cloud sanctuary for the Goal Flag
  fillRect(grid, 1, 12, 8, 1, 'C');
  fillRect(grid, 162, 13, 22, 2, 'C');

  // Scattered fluffy cloud islands along the lower sky
  fillRect(grid, 20, 13, 5, 1, 'C');
  fillRect(grid, 38, 12, 6, 1, 'C');
  fillRect(grid, 112, 13, 6, 1, 'C');
  fillRect(grid, 138, 12, 6, 1, 'C');

  // Opening Rainbow Power-Up & Star
  grid[8][8] = 'M';
  grid[8][10] = '?';

  // Helper to create aerial rings of coins to fly through!
  const addCoinRing = (centerCol, centerRow) => {
    const offsets = [
      [-1, -1], [0, -2], [1, -1],
      [-2, 0],           [2, 0],
      [-1, 1],  [0, 2],  [1, 1]
    ];
    offsets.forEach(([dc, dr]) => {
      coins.push({ x: (centerCol + dc) * 32 + 4, y: (centerRow + dr) * 32 + 4 });
    });
  };

  addCoinRing(22, 6);
  addCoinRing(32, 4);
  addCoinRing(42, 8);

  // Aerial Turbo Boost Gates ('T') suspended in the sky!
  grid[6][27] = 'T';
  grid[4][37] = 'T';
  grid[8][47] = 'T';

  // Sky squadron of 16-bit winged dragon-koopa cloud riders!
  enemies.push({ type: 'cloud', x: 29 * 32, y: 5 * 32, baseY: 5 * 32 });
  enemies.push({ type: 'cloud', x: 39 * 32, y: 7 * 32, baseY: 7 * 32 });
  enemies.push({ type: 'cloud', x: 48 * 32, y: 4 * 32, baseY: 4 * 32 });

  // Floating Cloud Gates ('C') to slalom through in flight (cols 54..78)
  fillRect(grid, 55, 1, 2, 4, 'C');
  fillRect(grid, 55, 10, 2, 3, 'C');
  addCoinRing(56, 7);

  fillRect(grid, 66, 1, 2, 3, 'C');
  fillRect(grid, 66, 8, 2, 4, 'C');
  addCoinRing(67, 5);

  fillRect(grid, 77, 1, 2, 5, 'C');
  fillRect(grid, 77, 11, 2, 3, 'C');
  addCoinRing(78, 8);

  // Checkpoint cloud island in mid-air at col 86!
  fillRect(grid, 84, 13, 8, 1, 'C');
  const checkpointCol = 86;
  grid[8][88] = 'M';
  grid[8][90] = 'L'; // 1-UP Green Mushroom!

  // Giant "AMBAR" Coin Banner in the upper stratosphere (cols 95..124)!
  addAmbarCoinBanner(coins, 96, 3);
  grid[9][95] = 'T';
  grid[9][108] = 'T';
  grid[9][120] = 'S'; // Invincibility Star in mid-air!

  // High-altitude enemy fleet
  enemies.push({ type: 'cloud', x: 102 * 32, y: 8 * 32, baseY: 8 * 32 });
  enemies.push({ type: 'cloud', x: 114 * 32, y: 5 * 32, baseY: 5 * 32 });
  enemies.push({ type: 'cloud', x: 128 * 32, y: 7 * 32, baseY: 7 * 32 });
  enemies.push({ type: 'cloud', x: 136 * 32, y: 4 * 32, baseY: 4 * 32 });
  enemies.push({ type: 'cloud', x: 144 * 32, y: 9 * 32, baseY: 9 * 32 });

  addCoinRing(132, 6);
  addCoinRing(142, 4);
  addCoinRing(152, 7);
  grid[6][148] = 'T';

  // Cloud staircase leading to the Sky Goal Flagpole!
  for (let s = 0; s < 5; s++) {
    fillRect(grid, 163 + s, 12 - s, 1, s + 1, 'C');
  }

  return {
    id: 7,
    name: 'MUNDO 1-7: ¡SUPER ÁMBAR VUELA POR EL CIELO!',
    subtitle: '¡Vuela entre las nubes como Superman y lanza Haces de Luz con X!',
    theme: 6,
    isFlyingLevel: true,
    bgm: 'star',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 174 * 32,
    castleX: 178 * 32
  };
}

// ============================================================================
// NIVEL 1-8: GRAN FORTALEZA FINAL DEL REY TORMENTA
// ============================================================================
function buildLevel8FinalCastle() {
  const cols = 155;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  fillRect(grid, 0, 0, 120, 1, '#');
  fillRect(grid, 0, 13, 30, 2, '#');
  fillRect(grid, 38, 13, 30, 2, '#');
  fillRect(grid, 76, 13, 30, 2, '#');
  fillRect(grid, 126, 13, 29, 2, '#');

  // Royal Armory Supply at Start
  grid[9][7] = 'M';
  grid[9][8] = 'L';
  grid[9][9] = 'M';

  enemies.push({ type: 'robot', x: 16 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 23 * 32, y: 12 * 32 });

  platforms.push({
    x: 30 * 32,
    y: 11 * 32,
    w: 104,
    h: 22,
    minX: 29 * 32,
    maxX: 37 * 32,
    vx: 1.7,
    vy: 0,
    style: 'train'
  });

  fillRect(grid, 43, 9, 8, 1, 'B');
  grid[9][47] = 'S';
  enemies.push({ type: 'robot', x: 48 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 54 * 32, y: 12 * 32 });
  enemies.push({ type: 'cloud', x: 60 * 32, y: 6 * 32, baseY: 6 * 32 });

  platforms.push({
    x: 68 * 32,
    y: 11 * 32,
    w: 104,
    h: 20,
    minX: 67 * 32,
    maxX: 75 * 32,
    vx: 1.7,
    vy: 0,
    style: 'cloud'
  });

  const checkpointCol = 80;
  grid[9][84] = 'M';
  grid[9][86] = '?';
  grid[9][88] = 'M';
  grid[12][96] = 'J';

  // GRAND FINAL BOSS ARENA (cols 106..125, row 12)
  for (let c = 106; c <= 125; c++) {
    grid[12][c] = '=';
  }
  fillRect(grid, 109, 8, 3, 1, 'H');
  fillRect(grid, 118, 8, 3, 1, 'H');

  grid[11][125] = 'A';

  enemies.push({
    type: 'boss',
    x: 119 * 32,
    y: 8 * 32,
    w: 68,
    h: 64,
    hp: 6,
    maxHp: 6,
    minX: 107 * 32,
    maxX: 123 * 32
  });

  return {
    id: 8,
    name: 'MUNDO 1-8: GRAN FORTALEZA FINAL',
    subtitle: '¡Batalla Final contra el Rey Tormenta! Salva el Reino de Ámbar',
    theme: 3,
    bgm: 'level3',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 138 * 32,
    castleX: 142 * 32
  };
}

// ============================================================================
// NIVEL 1-S: LA VÍA LÁCTEA ESTELAR (NIVEL SECRETO DESBLOQUEABLE)
// ============================================================================
function buildLevelSecret() {
  const cols = 175;
  const grid = createEmptyGrid(cols, 15);
  const coins = [];
  const enemies = [];
  const platforms = [];

  // Cosmic neon platforms & starry ground sections
  fillRect(grid, 0, 13, 30, 2, '#');
  fillRect(grid, 35, 13, 22, 2, '#');
  fillRect(grid, 62, 13, 32, 2, '#');
  fillRect(grid, 100, 13, 28, 2, '#');
  fillRect(grid, 135, 13, 40, 2, '#');

  // Welcome Question blocks with Super Star!
  grid[9][6] = '?';
  grid[9][8] = 'S'; // Super Estrella Invencible!
  grid[9][10] = '?';
  grid[9][12] = 'M'; // Super Hongo

  // Turbo speed boost pads
  grid[12][16] = 'T';
  grid[12][19] = 'T';
  grid[12][22] = 'T';

  // Rainbow Star spring launch
  grid[12][28] = 'J';

  // Floating high cloud / star bridges
  fillRect(grid, 32, 7, 10, 1, 'C');
  for (let c = 33; c <= 40; c++) {
    coins.push({ x: c * 32 + 4, y: 5 * 32 });
  }

  // Floating rainbow platforms
  platforms.push({
    x: 44 * 32,
    y: 9 * 32,
    w: 110,
    h: 20,
    minX: 42 * 32,
    maxX: 55 * 32,
    vx: 1.8,
    vy: 0,
    style: 'rainbow'
  });

  // Cosmic enemies
  enemies.push({ type: 'cloud', x: 48 * 32, y: 5 * 32, baseY: 5 * 32 });
  enemies.push({ type: 'koopa', x: 65 * 32, y: 12 * 32 });
  enemies.push({ type: 'goomba', x: 68 * 32, y: 12 * 32 });
  enemies.push({ type: 'koopa', x: 74 * 32, y: 12 * 32 });

  // Floating 1-UP & Star blocks
  grid[8][68] = 'L'; // 1-UP Mushroom!
  grid[8][72] = 'S'; // Second Star!

  // AMBAR Coin Constellation
  addAmbarCoinBanner(coins, 78, 3);

  // Checkpoint at col 90
  const checkpointCol = 90;

  // Platform moving vertically over starry void
  platforms.push({
    x: 94 * 32,
    y: 11 * 32,
    w: 96,
    h: 20,
    minY: 6 * 32,
    maxY: 12 * 32,
    vx: 0,
    vy: 1.5,
    style: 'rainbow'
  });

  // Second Turbo track section
  grid[12][102] = 'T';
  grid[12][106] = 'T';
  grid[12][110] = 'T';
  grid[12][114] = 'T';

  // Moving Star Train platform
  platforms.push({
    x: 128 * 32,
    y: 9 * 32,
    w: 120,
    h: 22,
    minX: 126 * 32,
    maxX: 134 * 32,
    vx: 2.0,
    vy: 0,
    style: 'train'
  });

  // Grand Cosmic Golden Stairs
  addStairs(grid, 142, 6, 1);
  addStairs(grid, 150, 6, -1);

  return {
    id: 9,
    name: 'MUNDO 1-S: LA VÍA LÁCTEA ESTELAR',
    subtitle: '¡Pistas Cósmicas de Neón, Turbo Estelar y Monedas Galácticas!',
    theme: 6,
    bgm: 'star',
    cols,
    rows: 15,
    grid,
    coins,
    enemies,
    platforms,
    checkpointX: checkpointCol * 32,
    flagX: 160 * 32,
    castleX: 164 * 32
  };
}

window.LEVEL_BUILDERS = [
  buildLevel1,
  buildLevel2,
  buildLevel3,
  buildLevel4Bike,
  buildLevel5Crystal,
  buildLevel6Sky,
  buildLevel7Flying,
  buildLevel8FinalCastle,
  buildLevelSecret
];
