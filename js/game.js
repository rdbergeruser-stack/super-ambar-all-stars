// ============================================================================
// MAIN GAME ENGINE - SUPER ÁMBAR BROS (HD 16-BIT EDITION)
// ============================================================================

const LOGICAL_WIDTH = 854;
const LOGICAL_HEIGHT = 480;
const TILE_SIZE = 32;

const STAR_COINS_DATA = {
  1: [{ col: 34, row: 5 }, { col: 78, row: 4 }, { col: 122, row: 5 }],
  2: [{ col: 32, row: 5 }, { col: 76, row: 4 }, { col: 118, row: 4 }],
  3: [{ col: 30, row: 6 }, { col: 64, row: 4 }, { col: 96, row: 5 }],
  4: [{ col: 36, row: 6 }, { col: 80, row: 5 }, { col: 138, row: 4 }],
  5: [{ col: 34, row: 5 }, { col: 75, row: 4 }, { col: 120, row: 4 }],
  6: [{ col: 32, row: 5 }, { col: 72, row: 4 }, { col: 116, row: 4 }],
  7: [{ col: 35, row: 4 }, { col: 82, row: 10 }, { col: 128, row: 2 }],
  8: [{ col: 28, row: 5 }, { col: 70, row: 4 }, { col: 112, row: 5 }],
  9: [{ col: 38, row: 4 }, { col: 84, row: 6 }, { col: 136, row: 4 }],
  10: [{ col: 34, row: 5 }, { col: 80, row: 4 }, { col: 126, row: 5 }],
  11: [{ col: 36, row: 5 }, { col: 82, row: 6 }, { col: 128, row: 4 }],
  12: [{ col: 32, row: 6 }, { col: 78, row: 5 }, { col: 124, row: 4 }]
};

class SuperAmbarGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = LOGICAL_WIDTH;
    this.canvas.height = LOGICAL_HEIGHT;

    this.state = 'TITLE'; // TITLE, LEVEL_INTRO, PLAYING, STAGE_CLEAR, VICTORY, GAMEOVER
    this.time = 0;
    this.stateTimer = 0;

    this.currentLevelIdx = 0;
    this.score = 0;
    this.coinsCount = 0;
    this.lives = 5;

    // Input state
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      jumpJustPressed: false,
      action: false,
      actionJustPressed: false
    };

    this.checkpointReached = false;
    this.player = this.createDefaultPlayer();
    this.level = null;
    this.items = [];
    this.starCoins = [];
    this.savedStarCoins = {};
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.bumpOffsets = {};
    this.fireworks = [];

    this.cameraX = 0;
    this.screenShakeTimer = 0;
    this.screenShakeIntensity = 0;
    this.hitStopTimer = 0;
    this.ghosts = [];
    this.ghostTimer = 0;

    // Super Mario World 16-Bit Overworld Map System (Mundo 1 & Mundo 2!)
    this.currentWorld = 1;
    this.world1Nodes = [
      { id: 0, levelIdx: 0, x: 130, y: 340, name: '1-1 Pradera', subtitle: 'Pradera Arcoíris', icon: 'level', paths: { right: 1 }, unlocked: true, cleared: false },
      { id: 1, levelIdx: 1, x: 240, y: 310, name: '1-2 Taller', subtitle: 'Fábrica de Juguetes', icon: 'level', paths: { left: 0, right: 2 }, secretPath: { up: 8 }, hasSecretExit: true, unlocked: false, cleared: false },
      { id: 2, levelIdx: 2, x: 350, y: 270, name: '1-3 Castillo', subtitle: 'Fortaleza de Dulces', icon: 'fortress', paths: { left: 1, down: 3 }, unlocked: false, cleared: false },
      { id: 3, levelIdx: 3, x: 440, y: 360, name: '1-4 Playa Bici', subtitle: 'Costa en Bicicleta', icon: 'bike', paths: { up: 2, right: 4 }, secretPath: { up: 8 }, hasSecretExit: true, unlocked: false, cleared: false },
      { id: 4, levelIdx: 4, x: 550, y: 320, name: '1-5 Cueva', subtitle: 'Caverna Amatista', icon: 'gem', paths: { left: 3, up: 5 }, unlocked: false, cleared: false },
      { id: 5, levelIdx: 5, x: 670, y: 240, name: '1-6 Cielo', subtitle: 'Nubes de Algodón', icon: 'cloud', paths: { down: 4, left: 6 }, unlocked: false, cleared: false },
      { id: 6, levelIdx: 6, x: 540, y: 150, name: '1-7 Vuelo', subtitle: 'Vuelo Estelar Superman', icon: 'wing', paths: { right: 5, left: 7 }, unlocked: false, cleared: false },
      { id: 7, levelIdx: 7, x: 370, y: 120, name: '1-8 Fortaleza', subtitle: 'Castillo Bowser Supremo', icon: 'castle', paths: { right: 6 }, unlocked: false, cleared: false },
      { id: 8, levelIdx: 8, x: 240, y: 170, name: '1-S Isla Secreta', subtitle: 'Vía Láctea Estelar', icon: 'secret_star', paths: { down: 1, right: 6 }, isSecret: true, unlocked: false, cleared: false }
    ];

    this.world2Nodes = [
      { id: 0, levelIdx: 9, x: 180, y: 320, name: '2-1 Glacial', subtitle: 'Valle Glacial y Bosque Nevado', icon: 'glacier', paths: { right: 1 }, unlocked: true, cleared: false },
      { id: 1, levelIdx: 10, x: 440, y: 250, name: '2-2 Mansión', subtitle: 'Mansión Encantada de los Boos', icon: 'ghost', paths: { left: 0, right: 2 }, unlocked: false, cleared: false },
      { id: 2, levelIdx: 11, x: 700, y: 160, name: '2-3 Castillo', subtitle: 'Fortaleza Glacial del Rey Escarcha', icon: 'ice_castle', paths: { left: 1 }, unlocked: false, cleared: false }
    ];

    this.currentMapNodeId = 0;
    this.mapAmbar = {
      x: 130,
      y: 340,
      facing: 1,
      targetNodeId: 0,
      isMoving: false,
      moveT: 0,
      walkFrame: 0,
      fromX: 130,
      fromY: 340,
      toX: 130,
      toY: 340
    };
    this.secretPathUnlockedAnim = 0;
    this.isSecretExit = false;

    this.bindEvents();
    this.loadLevel(0, false);
    this.state = 'TITLE';

    this.lastFrameTime = performance.now();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  get mapNodes() {
    return this.currentWorld === 2 ? this.world2Nodes : this.world1Nodes;
  }

  toggleWorld(targetWorld) {
    if (targetWorld !== undefined) {
      this.currentWorld = targetWorld;
    } else {
      this.currentWorld = this.currentWorld === 1 ? 2 : 1;
    }
    this.currentMapNodeId = 0;
    const node = this.mapNodes[0];
    if (node) {
      this.mapAmbar.x = node.x;
      this.mapAmbar.y = node.y;
    }
    this.mapAmbar.isMoving = false;
    window.retroAudio.playSfx('mapMove');
    this.updateLevelButtonsUI();
  }

  createDefaultPlayer(keepPower = false) {
    const powerState = keepPower && this.player ? this.player.powerState : 0;
    return {
      x: 96,
      y: 10 * TILE_SIZE,
      w: powerState >= 1 ? 30 : 24,
      h: powerState >= 1 ? 54 : 36,
      hasKey: false,
      vx: 0,
      vy: 0,
      prevVy: 0,
      squashX: 1.0,
      squashY: 1.0,
      isJumping: false,
      onWall: 0,
      facing: 1,
      onGround: false,
      airJumpsLeft: 1, // Allows a second mid-air boost jump!
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      powerState: powerState, // 0: Chiquita (Jardinero), 1: Super Ámbar (Buzo Rosa + Lentes), 2: Ámbar Arcoíris
      growAnimTimer: 0,
      onBike: false,
      bikeAngle: 0,
      bikeSpinRot: 0,
      bikeTricks: 0,
      wheelieTimer: 0,
      isFlying: false,
      diveBombing: false,
      isMermaid: false,
      swimStrokeTimer: 0,
      swamThisUp: false,
      onSkates: false,
      isGrinding: false,
      grindTimer: 0,
      standingOnIce: false,
      turboTimer: 0,
      invulnerableTimer: 0,
      starTimer: 0,
      shootCooldown: 0,
      shootAnimTimer: 0,
      dead: false
    };
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      window.retroAudio.init();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = true;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyK') {
        if (!this.keys.jump) this.keys.jumpJustPressed = true;
        this.keys.jump = true;
      }

      if (e.code === 'KeyX' || e.code === 'KeyZ' || e.code === 'KeyJ' || e.code === 'KeyF' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (!this.keys.action) this.keys.actionJustPressed = true;
        this.keys.action = true;
      }

      if (e.code === 'Enter' || e.code === 'Space') {
        if (this.state === 'TITLE') {
          this.startGame();
        } else if (this.state === 'MAP') {
          this.launchCurrentMapLevel();
        } else if (this.state === 'GAMEOVER') {
          this.lives = 5;
          this.enterMapScreen();
        } else if (this.state === 'VICTORY') {
          if (this.currentLevelIdx === 7) {
            this.world2Nodes[0].unlocked = true;
            this.toggleWorld(2);
            this.enterMapScreen();
          } else {
            this.currentLevelIdx = 0;
            this.enterMapScreen();
          }
        }
      }

      if (e.code === 'KeyT' && this.state === 'PLAYING') {
        this.cycleAmbarPowerUp();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyK') {
        this.keys.jump = false;
      }
      if (e.code === 'KeyX' || e.code === 'KeyZ' || e.code === 'KeyJ' || e.code === 'KeyF' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.keys.action = false;
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      window.retroAudio.init();
      if (this.state === 'TITLE') {
        this.startGame();
      } else if (this.state === 'MAP') {
        this.handleMapPointerDown(e);
      } else if (this.state === 'GAMEOVER') {
        this.lives = 5;
        this.enterMapScreen();
      } else if (this.state === 'VICTORY') {
        if (this.currentLevelIdx === 7) {
          this.world2Nodes[0].unlocked = true;
          this.toggleWorld(2);
          this.enterMapScreen();
        } else {
          this.currentLevelIdx = 0;
          this.enterMapScreen();
        }
      }
    });

    const bindTouch = (id, keyName) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const press = (ev) => {
        ev.preventDefault();
        window.retroAudio.init();
        btn.classList.add('pressed');
        if (keyName === 'jump' && !this.keys.jump) this.keys.jumpJustPressed = true;
        if (keyName === 'action' && !this.keys.action) this.keys.actionJustPressed = true;
        this.keys[keyName] = true;
        if (this.state === 'TITLE') {
          this.startGame();
        } else if (this.state === 'MAP' && (keyName === 'jump' || keyName === 'action')) {
          this.launchCurrentMapLevel();
        }
      };
      const release = (ev) => {
        ev.preventDefault();
        btn.classList.remove('pressed');
        this.keys[keyName] = false;
      };
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('touchcancel', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    };

    bindTouch('touchUp', 'up');
    bindTouch('touchDown', 'down');
    bindTouch('touchLeft', 'left');
    bindTouch('touchRight', 'right');
    bindTouch('touchJump', 'jump');
    bindTouch('touchMagic', 'action');

    // Allow sliding thumb across all 4 directions (▲, ▼, ◀, ▶) on mobile!
    const dpad = document.getElementById('touchDpad');
    const btnU = document.getElementById('touchUp');
    const btnD = document.getElementById('touchDown');
    const btnL = document.getElementById('touchLeft');
    const btnR = document.getElementById('touchRight');
    if (dpad && btnU && btnD && btnL && btnR) {
      const handleDpadTouches = (ev) => {
        ev.preventDefault();
        let hitU = false, hitD = false, hitL = false, hitR = false;
        const rectU = btnU.getBoundingClientRect();
        const rectD = btnD.getBoundingClientRect();
        const rectL = btnL.getBoundingClientRect();
        const rectR = btnR.getBoundingClientRect();
        for (let i = 0; i < ev.touches.length; i++) {
          const t = ev.touches[i];
          if (t.clientX >= rectU.left && t.clientX <= rectU.right && t.clientY >= rectU.top && t.clientY <= rectU.bottom) hitU = true;
          if (t.clientX >= rectD.left && t.clientX <= rectD.right && t.clientY >= rectD.top && t.clientY <= rectD.bottom) hitD = true;
          if (t.clientX >= rectL.left && t.clientX <= rectL.right && t.clientY >= rectL.top && t.clientY <= rectL.bottom) hitL = true;
          if (t.clientX >= rectR.left && t.clientX <= rectR.right && t.clientY >= rectR.top && t.clientY <= rectR.bottom) hitR = true;
        }
        this.keys.up = hitU;
        this.keys.down = hitD;
        this.keys.left = hitL;
        this.keys.right = hitR;
        btnU.classList.toggle('pressed', hitU);
        btnD.classList.toggle('pressed', hitD);
        btnL.classList.toggle('pressed', hitL);
        btnR.classList.toggle('pressed', hitR);
      };
      dpad.addEventListener('touchmove', handleDpadTouches, { passive: false });
      dpad.addEventListener('touchstart', handleDpadTouches, { passive: false });
    }
  }

  cycleAmbarPowerUp() {
    const nextState = (this.player.powerState + 1) % 3;
    this.setPlayerPowerState(nextState);
    window.retroAudio.playSfx('powerup');
    const labels = [
      'Jardinero de Jean',
      '¡Buzo Rosa + Lentes Violetas!',
      '¡Ámbar Arcoíris Mágica!'
    ];
    this.addFloatingText(this.player.x, this.player.y - 12, labels[nextState], '#ffe58f');
  }

  setPlayerPowerState(newState) {
    const oldH = this.player.h;
    const oldState = this.player.powerState;
    this.player.powerState = newState;
    if (this.player.isFlying) {
      this.player.w = 56;
      this.player.h = 38;
    } else if (this.player.onBike) {
      this.player.w = 42;
      this.player.h = 56;
    } else {
      this.player.w = newState >= 1 ? 30 : 24;
      this.player.h = newState >= 1 ? 54 : 36;
    }
    if ((oldState === 0 && newState >= 1) || (oldState >= 1 && newState === 0)) {
      this.player.growAnimTimer = 0.55;
    }
    this.player.y -= (this.player.h - oldH);
  }

  startGame() {
    this.score = 0;
    this.coinsCount = 0;
    this.lives = 5;
    this.player.powerState = 0;
    this.enterMapScreen();
  }

  enterMapScreen() {
    this.state = 'MAP';
    this.stateTimer = 0;
    window.retroAudio.playBgm('map');
    const node = this.mapNodes[this.currentMapNodeId] || this.mapNodes[0];
    this.mapAmbar.x = node.x;
    this.mapAmbar.y = node.y;
    this.mapAmbar.isMoving = false;
    this.updateLevelButtonsUI();
  }

  selectLevel(idx) {
    this.currentLevelIdx = idx;
    this.checkpointReached = false;
    const nodeIdx = this.mapNodes.findIndex(n => n.levelIdx === idx);
    if (nodeIdx !== -1) {
      this.currentMapNodeId = nodeIdx;
      this.mapNodes[nodeIdx].unlocked = true;
    }
    this.updateLevelButtonsUI();
    this.startLevelIntro(idx, true);
  }

  updateLevelButtonsUI() {
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
      btn.classList.toggle('current-level', this.state !== 'MAP' && i === this.currentLevelIdx);
    });
    const mapBtn = document.getElementById('btnMap');
    if (mapBtn) {
      mapBtn.classList.toggle('active', this.state === 'MAP');
    }
  }

  startLevelIntro(idx, keepPower = true) {
    this.currentLevelIdx = idx;
    this.updateLevelButtonsUI();
    this.loadLevel(idx, keepPower);
    this.state = 'LEVEL_INTRO';
    this.stateTimer = 1.8;
    window.retroAudio.stopBgm();
  }

  loadLevel(idx, keepPower = true) {
    const builder = window.LEVEL_BUILDERS[idx] || window.LEVEL_BUILDERS[0];
    this.level = builder();
    this.player = this.createDefaultPlayer(keepPower);
    this.currentWorld = idx < 9 ? 1 : 2;

    if (this.level.isBikeLevel) {
      this.player.onBike = true;
      this.player.w = 42;
      this.player.h = 56;
    } else if (this.level.isFlyingLevel) {
      this.player.isFlying = true;
      this.player.powerState = 2; // Grants Rainbow Beam shooting while flying like Superman!
      this.player.w = 56;
      this.player.h = 38;
      this.player.y = 6 * TILE_SIZE;
    }

    if (this.checkpointReached && this.level.checkpointX) {
      this.player.x = this.level.checkpointX;
      this.player.y = 9 * TILE_SIZE;
    }

    this.items = this.level.coins.map(c => ({
      type: 'coin',
      x: c.x,
      y: c.y,
      w: 22,
      h: 22,
      vx: 0,
      vy: 0,
      static: true
    }));

    const starDefs = STAR_COINS_DATA[idx + 1] || [
      { col: 32, row: 5 }, { col: 75, row: 4 }, { col: 120, row: 5 }
    ];
    const prevSaved = this.savedStarCoins[idx] || [false, false, false];
    this.starCoins = starDefs.map((sc, i) => ({
      x: sc.col * TILE_SIZE,
      y: sc.row * TILE_SIZE,
      w: 30,
      h: 30,
      collected: !!prevSaved[i],
      index: i
    }));

    this.enemies = this.level.enemies.map(e => ({
      type: e.type,
      x: e.x,
      y: e.y,
      w: e.w || (e.type === 'cloud' ? 44 : 36),
      h: e.h || (e.type === 'cloud' ? 46 : 36),
      vx: e.type === 'boss' ? -1.4 : -1.1,
      vy: 0,
      onGround: false,
      squished: false,
      squishTimer: 0,
      inShell: false,
      baseY: e.baseY || e.y,
      hp: e.hp || 1,
      maxHp: e.maxHp || 1,
      minX: e.minX || 0,
      maxX: e.maxX || 99999,
      hurtTimer: 0,
      attackTimer: 2.0,
      dead: false
    }));

    this.platforms = (this.level.platforms || []).map(p => ({ ...p }));
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.bumpOffsets = {};
    this.fireworks = [];
    this.flagSlideY = 3 * TILE_SIZE;
    this.cameraX = Math.max(0, this.player.x - 220);
  }

  loop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;
    this.time += dt;

    this.update(dt);
    this.render();

    this.keys.jumpJustPressed = false;
    this.keys.actionJustPressed = false;

    requestAnimationFrame((ts) => this.loop(ts));
  }

  update(dt) {
    if (this.state === 'TITLE') return;

    if (this.state === 'MAP') {
      this.updateOverworldMap(dt);
      return;
    }

    if (this.state === 'LEVEL_INTRO') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'PLAYING';
        window.retroAudio.playBgm(this.level.bgm);
      }
      return;
    }

    if (this.state === 'STAGE_CLEAR') {
      this.stateTimer -= dt;
      this.updateParticles(dt);
      this.updateFloatingTexts(dt);
      this.updateFireworks(dt);

      if (!this.isSecretExit) {
        if (this.player.y < 12 * TILE_SIZE - this.player.h) {
          this.player.y += 190 * dt;
          this.flagSlideY = Math.min(11.5 * TILE_SIZE, this.flagSlideY + 190 * dt);
        } else {
          this.player.y = 13 * TILE_SIZE - this.player.h;
          this.player.onGround = true;
          if (this.player.x < this.level.castleX + 36) {
            this.player.x += 120 * dt;
            this.player.vx = 2;
            this.player.facing = 1;
          } else {
            this.player.vx = 0;
          }
        }
      } else {
        // Floating secret exit celestial sparkles
        this.player.vy = 0;
        this.player.vx = 0;
        if (Math.random() < 0.25) {
          this.spawnSparkle(this.player.x + Math.random() * this.player.w, this.player.y + Math.random() * this.player.h);
        }
      }

      if (this.stateTimer <= 0) {
        if ((this.currentLevelIdx === 7 || this.currentLevelIdx === 11) && !this.isSecretExit) {
          this.state = 'VICTORY';
          window.retroAudio.stopBgm();
          window.retroAudio.playSfx('stageClear');
        } else {
          this.onStageClearReturnToMap();
        }
      }
      return;
    }

    if (this.state === 'VICTORY') {
      this.updateFireworks(dt);
      if (Math.random() < 0.06) {
        this.spawnFirework(this.cameraX + 120 + Math.random() * 600, 70 + Math.random() * 140);
      }
      return;
    }

    if (this.state === 'GAMEOVER') return;

    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
    }

    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      return; // Freeze action for micro-impact!
    }

    this.updatePlayer(dt);
    this.updateGhosts(dt);
    this.updatePlatforms(dt);
    this.updateItems(dt);
    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updateBumpAnimations(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    const targetCamX = this.player.x - LOGICAL_WIDTH * 0.34 + this.player.facing * 45;
    const maxCamX = this.level.cols * TILE_SIZE - LOGICAL_WIDTH;
    this.cameraX += (Math.max(0, Math.min(maxCamX, targetCamX)) - this.cameraX) * 0.14;
  }

  updatePlayer(dt) {
    const p = this.player;

    // Smooth spring recovery of Squash & Stretch deformation
    p.squashX += (1.0 - p.squashX) * Math.min(1.0, 18 * dt);
    p.squashY += (1.0 - p.squashY) * Math.min(1.0, 18 * dt);

    if (p.dead) {
      p.vy += 22 * dt;
      p.y += p.vy;
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.lives > 0) {
          this.startLevelIntro(this.currentLevelIdx, false);
        } else {
          this.state = 'GAMEOVER';
          window.retroAudio.stopBgm();
          window.retroAudio.playSfx('gameover');
        }
      }
      return;
    }

    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.shootCooldown > 0) p.shootCooldown -= dt;
    if (p.shootAnimTimer > 0) p.shootAnimTimer -= dt;
    if (p.growAnimTimer > 0) p.growAnimTimer -= dt;
    if (p.turboTimer > 0) {
      p.turboTimer -= dt;
      if (Math.random() < 0.55) {
        this.spawnSparkle(p.x + (p.facing > 0 ? 4 : p.w - 4), p.y + p.h - 6);
      }
    }

    if (p.starTimer > 0) {
      p.starTimer -= dt;
      if (Math.random() < 0.45) {
        this.spawnSparkle(p.x + Math.random() * p.w, p.y + Math.random() * p.h);
      }
      if (p.starTimer <= 0) {
        window.retroAudio.playBgm(this.level.bgm);
      }
    }

    // Horizontal Movement (with Bicycle, Mermaid, Skate and Flight modes!)
    const baseMax = p.isFlying
      ? (p.turboTimer > 0 ? 7.8 : (this.keys.action ? 6.0 : 4.9))
      : p.onBike
        ? (p.turboTimer > 0 ? 8.2 : (this.keys.action ? 6.5 : 5.3))
        : p.onSkates
          ? (p.turboTimer > 0 ? 7.8 : (this.keys.action ? 6.4 : 5.2))
          : p.isMermaid
            ? (this.keys.action ? 4.8 : 3.8)
            : (this.keys.action ? 5.4 : 4.2);
    const maxSpeed = baseMax * (p.starTimer > 0 ? 1.2 : 1.0);
    const accel = p.isFlying ? 0.50 : p.onBike ? (p.onGround ? 0.56 : 0.42) : p.onSkates ? 0.52 : p.isMermaid ? 0.42 : (p.onGround ? 0.48 : 0.36);
    const friction = p.isFlying ? 0.90 : p.onBike ? (p.onGround ? 0.90 : 0.96) : p.isMermaid ? 0.96 : p.standingOnIce ? 0.985 : p.onSkates ? (p.onGround ? 0.94 : 0.97) : (p.onGround ? 0.82 : 0.94);

    if (this.keys.left) {
      p.vx = Math.max(-maxSpeed, p.vx - accel);
      p.facing = -1;
    } else if (this.keys.right) {
      p.vx = Math.min(maxSpeed, p.vx + accel);
      p.facing = 1;
    } else {
      p.vx *= friction;
      if (Math.abs(p.vx) < 0.08) p.vx = 0;
    }

    // Footstep / Skid dust particles when turning or speeding on the ground
    if (p.onGround && Math.abs(p.vx) > 2.0) {
      if ((this.keys.left && p.vx > 0.8) || (this.keys.right && p.vx < -0.8)) {
        if (Math.random() < 0.55) {
          this.spawnDust(p.x + p.w / 2, p.y + p.h, 1, -p.vx * 0.25, -0.4);
        }
      }
    }

    if (p.isMermaid) {
      // MERMAID SWIMMING CONTROLS (MUNDO 2-2):
      // Swim stroke on Jump or Up!
      if (this.keys.jumpJustPressed || (this.keys.up && !p.swamThisUp)) {
        p.vy = -4.8;
        p.swimStrokeTimer = 0.35;
        p.swamThisUp = true;
        window.retroAudio.playSfx('swim');
        this.spawnBubble(p.x + p.w / 2, p.y + p.h - 4);
        this.spawnBubble(p.x + p.w / 2 - 6, p.y + p.h);
      }
      if (!this.keys.up && !this.keys.jump) {
        p.swamThisUp = false;
      }
      if (this.keys.down) {
        p.vy = Math.min(3.8, p.vy + 0.4);
      }
      p.vy = Math.min(2.4, p.vy + 0.16);

      if (p.swimStrokeTimer > 0) p.swimStrokeTimer -= dt;
      if (Math.random() < 0.28) {
        this.spawnBubble(p.x + (p.facing < 0 ? p.w + 2 : -2), p.y + p.h * 0.7);
      }

      if (this.keys.actionJustPressed && p.powerState >= 2 && p.shootCooldown <= 0 && this.projectiles.length < 3) {
        this.shootRainbowStar();
      }
    } else if (p.isFlying) {
      // SUPERMAN FLIGHT CONTROLS:
      // Hold Up / W / Space (or ▲ SALTO on Mobile!) to fly up; Down / S to dive; release to hover/glide!
      if (this.keys.up || this.keys.jump) {
        if (p.diveBombing && p.vy > 3.0) {
          // Super Rocket Zoom Pull-up from a dive!
          p.vy = -7.8;
          p.vx = p.facing * 7.4;
          this.triggerScreenShake(0.12, 2.8);
          this.addFloatingText(p.x, p.y - 14, '¡ZOOM PICADA!', '#38bdf8');
          window.retroAudio.playSfx('superJump');
          for (let k = 0; k < 10; k++) this.spawnSparkle(p.x + p.w / 2, p.y + p.h / 2);
          p.diveBombing = false;
        } else {
          p.vy = Math.max(-5.5, p.vy - 0.62);
          p.diveBombing = false;
        }
      } else if (this.keys.down) {
        // PICADA SUPERSÓNICA!
        p.diveBombing = true;
        p.vy = Math.min(10.8, p.vy + 0.88);
        if (Math.random() < 0.45) {
          this.spawnSparkle(p.x + p.w / 2, p.y + 6);
        }
      } else {
        p.diveBombing = false;
        p.vy = p.vy * 0.84 + 0.12;
      }

      if (Math.random() < 0.35) {
        this.spawnSparkle(p.x + (p.facing > 0 ? 4 : p.w - 4), p.y + p.h / 2);
      }

      if (this.keys.actionJustPressed && p.shootCooldown <= 0 && this.projectiles.length < 4) {
        this.shootRainbowStar();
      }
    } else {
      // Coyote time & Jump buffer
      if (p.onGround) {
        p.coyoteTimer = 0.14;
        p.airJumpsLeft = 1;
      } else {
        p.coyoteTimer -= dt;
      }

      if (this.keys.jumpJustPressed) {
        p.jumpBufferTimer = 0.15;
      } else {
        p.jumpBufferTimer -= dt;
      }

      // HIGH, EFFORTLESS JUMP + DOUBLE JUMP (OR BICYCLE BUNNY-HOP & WHEELIE!)
      if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
        const speedBonus = Math.abs(p.vx) * 0.22;
        p.vy = (p.onBike ? -13.2 : -12.8) - speedBonus;
        p.onGround = false;
        p.isJumping = true;
        p.squashX = 0.82;
        p.squashY = 1.25;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        this.spawnDust(p.x + p.w / 2, p.y + p.h, 3, 0, -0.4);
        window.retroAudio.playSfx(p.powerState >= 1 || p.onBike ? 'superJump' : 'jump');
      } else if (this.keys.jumpJustPressed && !p.onGround && p.airJumpsLeft > 0) {
        p.airJumpsLeft--;
        p.vy = -11.6;
        p.isJumping = true;
        p.squashX = 0.80;
        p.squashY = 1.28;
        p.jumpBufferTimer = 0;
        window.retroAudio.playSfx('superJump');
        if (p.onBike) {
          this.addFloatingText(p.x, p.y - 10, '¡WHEELIE!', '#38bdf8');
        }
        for (let i = 0; i < 8; i++) {
          this.spawnSparkle(p.x + p.w / 2, p.y + p.h);
        }
      }

      // Variable Jump Height: releasing jump button early cuts upward momentum cleanly!
      if (!this.keys.jump && p.vy < -3.5 && p.isJumping) {
        p.vy *= 0.58;
        p.isJumping = false;
      }

      // Wall Slide & Wall Jump detection
      p.onWall = 0;
      if (!p.onGround && !p.isFlying && !p.onBike && p.vy > 0.5) {
        const checkR1 = Math.floor((p.y + 10) / TILE_SIZE);
        const checkR2 = Math.floor((p.y + p.h - 10) / TILE_SIZE);
        const checkLeftC = Math.floor((p.x - 4) / TILE_SIZE);
        const checkRightC = Math.floor((p.x + p.w + 4) / TILE_SIZE);

        const isWallLeft = this.isSolidTile(this.getTile(checkR1, checkLeftC)) || this.isSolidTile(this.getTile(checkR2, checkLeftC));
        const isWallRight = this.isSolidTile(this.getTile(checkR1, checkRightC)) || this.isSolidTile(this.getTile(checkR2, checkRightC));

        if (this.keys.left && isWallLeft) {
          p.onWall = -1;
          p.vy = Math.min(2.4, p.vy); // Wall friction slide!
          if (Math.random() < 0.35) {
            this.spawnDust(p.x, p.y + p.h * 0.7, 1, 0.4, -0.2);
          }
        } else if (this.keys.right && isWallRight) {
          p.onWall = 1;
          p.vy = Math.min(2.4, p.vy); // Wall friction slide!
          if (Math.random() < 0.35) {
            this.spawnDust(p.x + p.w, p.y + p.h * 0.7, 1, -0.4, -0.2);
          }
        }
      }

      // Execute Wall Jump
      if (p.onWall !== 0 && this.keys.jumpJustPressed) {
        p.vy = -12.4;
        p.vx = -p.onWall * 6.4; // Push off strongly away from the wall
        p.facing = -p.onWall;
        p.isJumping = true;
        p.squashX = 0.82;
        p.squashY = 1.25;
        p.airJumpsLeft = 1;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        window.retroAudio.playSfx(p.powerState >= 1 ? 'superJump' : 'jump');
        this.spawnDust(p.x + (p.onWall === -1 ? 0 : p.w), p.y + p.h * 0.5, 5, -p.onWall * 1.5, -0.6);
        this.addFloatingText(p.x, p.y - 12, '¡WALL JUMP!', '#818cf8');
        p.onWall = 0;
      }

      // Bicycle Acrobacias / Flips in mid-air & Wheelie Combos!
      if (p.onBike) {
        if (!p.onGround) {
          if (this.keys.up) {
            p.bikeAngle -= 7.5 * dt;
            p.bikeSpinRot += 7.5 * dt;
            if (Math.random() < 0.35) this.spawnSparkle(p.x + p.w / 2, p.y + p.h / 2);
          } else if (this.keys.down) {
            p.bikeAngle += 7.5 * dt;
            p.bikeSpinRot += 7.5 * dt;
            if (Math.random() < 0.35) this.spawnSparkle(p.x + p.w / 2, p.y + p.h / 2);
          }

          if (p.bikeSpinRot >= Math.PI * 1.85) {
            p.bikeTricks++;
            p.bikeSpinRot -= Math.PI * 2;
            this.addFloatingText(p.x, p.y - 16, p.bikeTricks > 1 ? '¡DOBLE FLIP!' : '¡360° FLIP!', '#f472b6');
            window.retroAudio.playSfx('trick');
            this.addScore(300, p.x, p.y);
          }
        } else {
          // On Ground
          if (p.bikeTricks > 0) {
            p.turboTimer = Math.max(p.turboTimer, 1.3 * p.bikeTricks);
            this.triggerScreenShake(0.12, 3.2);
            this.addFloatingText(p.x, p.y - 20, '¡TRUCO PERFECTO! +TURBO', '#fde047');
            window.retroAudio.playSfx('powerupAppear');
            for (let k = 0; k < 12; k++) this.spawnSparkle(p.x + p.w / 2, p.y + p.h);
            p.bikeTricks = 0;
          }
          p.bikeSpinRot = 0;

          if (this.keys.up && Math.abs(p.vx) > 1.5) {
            p.wheelieTimer += dt;
            p.bikeAngle += (-0.36 - p.bikeAngle) * Math.min(1.0, dt * 12);
            if (Math.random() < 0.35) {
              this.spawnDust(p.x + (p.facing > 0 ? 0 : p.w), p.y + p.h, 1, -p.facing * 0.9, -0.3);
            }
            if (p.wheelieTimer >= 0.5) {
              p.wheelieTimer = 0.1;
              this.addScore(100, p.x, p.y - 12);
              this.addFloatingText(p.x, p.y - 12, '¡WHEELIE! +100', '#38bdf8');
            }
          } else {
            p.wheelieTimer = 0;
            p.bikeAngle += (0 - p.bikeAngle) * Math.min(1.0, dt * 14);
          }
        }
      }

      // Skate Rail Grinding Physics (Mundo 2-1)
      if (p.onSkates && p.isGrinding) {
        if (Math.abs(p.vx) < 5.2) {
          p.vx = (p.facing || 1) * 6.2;
        }
        p.grindTimer = (p.grindTimer || 0) + dt;
        if (p.grindTimer >= 0.14) {
          p.grindTimer = 0;
          this.addScore(10, p.x, p.y);
          window.retroAudio.playSfx('grind');
        }
        if (Math.random() < 0.65) {
          this.spawnGrindSpark(p.x + p.w / 2, p.y + p.h);
        }
        if (this.keys.jumpJustPressed) {
          p.vy = -12.4;
          p.isGrinding = false;
          p.isJumping = true;
          this.addScore(300, p.x, p.y - 12);
          this.addFloatingText(p.x, p.y - 14, '¡GRIND COMBO! +300', '#facc15');
          window.retroAudio.playSfx('trick');
        }
      }

      if (this.keys.actionJustPressed && p.powerState >= 2 && p.shootCooldown <= 0 && this.projectiles.length < 3) {
        this.shootRainbowStar();
      }

      const gravity = (p.vy < 0 && this.keys.jump) ? 0.35 : 0.44;
      p.vy = Math.min(12.0, p.vy + gravity);
    }

    // Move & Collide X
    p.x += p.vx;
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
    this.resolvePlayerTileCollisionsX(p);

    // Move & Collide Y
    const prevBottom = p.y + p.h - p.vy;
    p.prevVy = p.vy;
    p.y += p.vy;
    if (p.isMermaid) {
      if (p.y < 16) {
        p.y = 16;
        p.vy = Math.max(0, p.vy);
      }
    } else if (p.isFlying) {
      if (p.y < 14) {
        p.y = 14;
        p.vy = Math.max(0, p.vy);
      } else if (p.y + p.h > LOGICAL_HEIGHT - 14) {
        // Sea of clouds upward air current at the bottom of the sky level (no solid floor needed!)
        p.y = LOGICAL_HEIGHT - p.h - 14;
        p.vy = Math.min(0, -1.6);
      }
    }
    p.onGround = false;
    this.resolvePlayerTileCollisionsY(p);

    // Collide with Moving Platforms
    this.platforms.forEach(plat => {
      if (
        p.vy >= 0 &&
        prevBottom <= plat.y + 10 &&
        p.x + p.w > plat.x + 3 &&
        p.x < plat.x + plat.w - 3 &&
        p.y + p.h >= plat.y &&
        p.y + p.h <= plat.y + plat.h + 12
      ) {
        if (!p.onGround && p.prevVy > 2.5) {
          const impact = Math.min(1.0, p.prevVy / 12.0);
          p.squashX = 1.0 + impact * 0.32;
          p.squashY = 1.0 - impact * 0.28;
          this.spawnDust(p.x + p.w / 2, plat.y, Math.floor(impact * 4) + 2, 0, -0.4);
        }
        p.y = plat.y - p.h;
        p.vy = 0;
        p.onGround = true;
        p.airJumpsLeft = 1;
        p.isJumping = false;
        p.x += plat.vx;
      }
    });

    // Check Checkpoint Flag
    if (!this.checkpointReached && this.level.checkpointX && p.x >= this.level.checkpointX) {
      this.checkpointReached = true;
      window.retroAudio.playSfx('checkpoint');
      this.addFloatingText(p.x, p.y - 20, '¡CHECKPOINT!', '#5cdbd3');
      for (let i = 0; i < 14; i++) {
        this.spawnSparkle(this.level.checkpointX + 12, 10 * TILE_SIZE + Math.random() * 60);
      }
    }

    // Check Secret Key ('K') and Secret Keyhole / Portal ('O')
    const startCol = Math.floor(p.x / TILE_SIZE);
    const endCol = Math.floor((p.x + p.w) / TILE_SIZE);
    const startRow = Math.floor(p.y / TILE_SIZE);
    const endRow = Math.floor((p.y + p.h) / TILE_SIZE);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const ch = this.getTile(r, c);
        if (ch === 'K') {
          this.level.grid[r][c] = '.';
          p.hasKey = true;
          window.retroAudio.playSfx('powerupAppear');
          this.addScore(1000, c * TILE_SIZE, r * TILE_SIZE);
          this.addFloatingText(p.x, p.y - 24, '¡LLAVE MÁGICA!', '#fde047');
          for (let k = 0; k < 12; k++) {
            this.spawnSparkle(c * TILE_SIZE + 16, r * TILE_SIZE + 16);
          }
        } else if (ch === 'O') {
          this.triggerSecretExit(c * TILE_SIZE, r * TILE_SIZE);
          return;
        }
      }
    }

    // Check Goal Flagpole
    if (this.level.flagX && p.x + p.w >= this.level.flagX && p.x <= this.level.flagX + 24) {
      this.triggerStageClear();
    }

    if (p.y > LOGICAL_HEIGHT + 36) {
      this.killPlayer();
    }
  }

  shootRainbowStar() {
    const p = this.player;
    p.shootCooldown = 0.24;
    p.shootAnimTimer = 0.18;
    window.retroAudio.playSfx('shoot');

    // Fires a straight, high-speed radiant Light Beam ("Haz de Luz")!
    this.projectiles.push({
      x: p.facing > 0 ? p.x + p.w + 2 : p.x - 30,
      y: p.y + Math.round(p.h * 0.36),
      w: 32,
      h: 12,
      vx: p.facing * 10.5,
      vy: 0
    });
  }

  isSolidTile(ch) {
    return ['B', '?', 'M', 'S', 'L', 'E', 'H', 'P', 'p', '#', '=', 'J', 'T', 'C', 'I'].includes(ch);
  }

  resolvePlayerTileCollisionsX(p) {
    const startCol = Math.floor(p.x / TILE_SIZE);
    const endCol = Math.floor((p.x + p.w - 0.01) / TILE_SIZE);
    const startRow = Math.floor(p.y / TILE_SIZE);
    const endRow = Math.floor((p.y + p.h - 0.01) / TILE_SIZE);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const ch = this.getTile(r, c);
        if (ch === 'A') {
          this.triggerRainbowSwitch(r, c);
          continue;
        }
        if (this.isSolidTile(ch)) {
          const blockTop = r * TILE_SIZE;
          const footOverlap = (p.y + p.h) - blockTop;
          if (footOverlap > 0 && footOverlap <= 12 && !this.isSolidTile(this.getTile(r - 1, c))) {
            p.y = blockTop - p.h;
            p.vy = Math.min(0, p.vy);
            p.onGround = true;
            return;
          }

          if (p.vx > 0) {
            p.x = c * TILE_SIZE - p.w;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = (c + 1) * TILE_SIZE;
            p.vx = 0;
          }
        }
      }
    }
  }

  resolvePlayerTileCollisionsY(p) {
    const startCol = Math.floor((p.x + 2) / TILE_SIZE);
    const endCol = Math.floor((p.x + p.w - 2.01) / TILE_SIZE);
    const startRow = Math.floor(p.y / TILE_SIZE);
    const endRow = Math.floor((p.y + p.h - 0.01) / TILE_SIZE);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const ch = this.getTile(r, c);
        if (ch === 'A') {
          this.triggerRainbowSwitch(r, c);
          continue;
        }
        if (this.isSolidTile(ch)) {
          if (p.vy > 0) {
            p.y = r * TILE_SIZE - p.h;
            if (ch === 'J') {
              p.vy = -15.8;
              p.onGround = false;
              p.airJumpsLeft = 1;
              p.isJumping = true;
              p.squashX = 0.78;
              p.squashY = 1.30;
              window.retroAudio.playSfx('spring');
              for (let i = 0; i < 8; i++) {
                this.spawnSparkle(c * TILE_SIZE + 16, r * TILE_SIZE);
              }
            } else {
              if (p.prevVy > 2.5) {
                const impact = Math.min(1.0, p.prevVy / 12.0);
                p.squashX = 1.0 + impact * 0.32;
                p.squashY = 1.0 - impact * 0.28;
                this.spawnDust(p.x + p.w / 2, p.y + p.h, Math.floor(impact * 5) + 2, 0, -0.4);
                if (p.prevVy > 8.0) {
                  this.triggerScreenShake(0.08, 2.0);
                }
              }
              p.vy = 0;
              p.onGround = true;
              p.airJumpsLeft = 1;
              p.isJumping = false;
              if (ch === 'T') {
                // TURBO BOOST PAD ON THE BICYCLE / SKATE TRACK!
                if (p.turboTimer <= 0.2) {
                  window.retroAudio.playSfx('powerupAppear');
                  this.addFloatingText(p.x, p.y - 16, '¡TURBO!', '#fde047');
                }
                p.turboTimer = 0.85;
                p.facing = p.vx < -0.5 ? -1 : 1;
                p.vx = p.facing * 8.0;
              } else if (ch === '=') {
                if (p.onSkates) {
                  p.isGrinding = true;
                }
              } else if (ch === 'I') {
                p.standingOnIce = true;
              }
            }
            return;
          } else if (p.vy < 0) {
            // Corner correction when jumping past the edge of a block
            const blockLeft = c * TILE_SIZE;
            const blockRight = (c + 1) * TILE_SIZE;
            const overlapRight = (p.x + p.w) - blockLeft;
            const overlapLeft = blockRight - p.x;

            if (overlapRight > 0 && overlapRight <= 8 && !this.isSolidTile(this.getTile(r, c - 1))) {
              p.x = blockLeft - p.w;
              continue;
            }
            if (overlapLeft > 0 && overlapLeft <= 8 && !this.isSolidTile(this.getTile(r, c + 1))) {
              p.x = blockRight;
              continue;
            }

            p.y = (r + 1) * TILE_SIZE;
            p.vy = 1.0;
            p.squashX = 1.25;
            p.squashY = 0.82;
            this.hitBlockFromBelow(r, c, ch);
            return;
          }
        }
      }
    }
  }

  hitBlockFromBelow(r, c, ch) {
    const bx = c * TILE_SIZE;
    const by = r * TILE_SIZE;
    this.triggerScreenShake(0.10, 2.2);

    this.enemies.forEach(en => {
      if (!en.dead && en.x + en.w > bx && en.x < bx + TILE_SIZE && Math.abs((en.y + en.h) - by) < 10) {
        en.vy = -6;
        en.squished = true;
        en.squishTimer = 0.4;
        this.addScore(200, en.x, en.y);
        window.retroAudio.playSfx('kick');
      }
    });

    if (ch === '?') {
      this.level.grid[r][c] = 'E';
      this.triggerBump(r, c);
      window.retroAudio.playSfx('coin');
      this.coinsCount++;
      this.addScore(100, bx + 6, by - 16);
      this.spawnSparkle(bx + 16, by - 10);
    } else if (ch === 'M') {
      this.level.grid[r][c] = 'E';
      this.triggerBump(r, c);
      window.retroAudio.playSfx('powerupAppear');
      const itemType = this.player.powerState === 0 ? 'cupcake' : 'magic_wand';
      this.items.push({
        type: itemType,
        x: bx + 2,
        y: by - TILE_SIZE + 2,
        w: 28,
        h: 28,
        vx: itemType === 'cupcake' ? 1.3 : 0,
        vy: -2.5,
        static: false
      });
    } else if (ch === 'S') {
      this.level.grid[r][c] = 'E';
      this.triggerBump(r, c);
      window.retroAudio.playSfx('powerupAppear');
      this.items.push({
        type: 'star',
        x: bx + 2,
        y: by - TILE_SIZE + 2,
        w: 28,
        h: 28,
        vx: 2.0,
        vy: -5.5,
        static: false
      });
    } else if (ch === 'L') {
      this.level.grid[r][c] = 'E';
      this.triggerBump(r, c);
      window.retroAudio.playSfx('powerupAppear');
      this.items.push({
        type: 'oneup',
        x: bx + 2,
        y: by - TILE_SIZE + 2,
        w: 28,
        h: 28,
        vx: 1.4,
        vy: -2.5,
        static: false
      });
    } else if (ch === 'B') {
      if (this.player.powerState >= 1) {
        this.level.grid[r][c] = '.';
        window.retroAudio.playSfx('break');
        this.triggerHitStop(0.04);
        this.triggerScreenShake(0.18, 3.8);
        this.addScore(50, bx, by);
        const dirs = [[-2.5, -6], [2.5, -6], [-2, -3.5], [2, -3.5]];
        dirs.forEach(([vx, vy]) => {
          this.particles.push({
            x: bx + 12,
            y: by + 12,
            vx,
            vy,
            size: 8,
            color: '#ff85c0',
            life: 0.7
          });
        });
      } else {
        this.triggerBump(r, c);
        window.retroAudio.playSfx('bump');
      }
    } else {
      window.retroAudio.playSfx('bump');
    }
  }

  triggerBump(r, c) {
    this.bumpOffsets[`${r},${c}`] = { offset: -9, vy: 50 };
  }

  updateBumpAnimations(dt) {
    Object.keys(this.bumpOffsets).forEach(key => {
      const b = this.bumpOffsets[key];
      b.offset += b.vy * dt;
      if (b.offset >= 0) {
        delete this.bumpOffsets[key];
      }
    });
  }

  updatePlatforms(dt) {
    this.platforms.forEach(plat => {
      plat.x += plat.vx;
      if (plat.x <= plat.minX) {
        plat.x = plat.minX;
        plat.vx = Math.abs(plat.vx);
      } else if (plat.x + plat.w >= plat.maxX) {
        plat.x = plat.maxX - plat.w;
        plat.vx = -Math.abs(plat.vx);
      }
    });
  }

  updateItems(dt) {
    const p = this.player;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];

      if (!it.static) {
        it.vy = Math.min(8, it.vy + 0.35);
        it.x += it.vx;

        const col = Math.floor((it.vx > 0 ? it.x + it.w : it.x) / TILE_SIZE);
        const row = Math.floor((it.y + it.h / 2) / TILE_SIZE);
        if (this.isSolidTile(this.getTile(row, col))) {
          it.vx = -it.vx;
        }

        it.y += it.vy;
        const bottomRow = Math.floor((it.y + it.h) / TILE_SIZE);
        const midCol = Math.floor((it.x + it.w / 2) / TILE_SIZE);
        if (it.vy > 0 && this.isSolidTile(this.getTile(bottomRow, midCol))) {
          it.y = bottomRow * TILE_SIZE - it.h;
          it.vy = it.type === 'star' ? -6.2 : 0;
        }
      }

      if (this.rectsOverlap(p, it)) {
        if (it.type === 'coin') {
          window.retroAudio.playSfx('coin');
          this.coinsCount++;
          if (this.coinsCount >= 100) {
            this.coinsCount -= 100;
            this.lives++;
            window.retroAudio.playSfx('oneUp');
            this.addFloatingText(p.x, p.y - 20, '¡1-UP!', '#95de64');
          }
          this.addScore(100, it.x, it.y);
          this.spawnSparkle(it.x + 10, it.y + 10);
        } else if (it.type === 'cupcake') {
          window.retroAudio.playSfx('powerup');
          if (p.powerState < 1) {
            this.setPlayerPowerState(1);
          }
          this.addScore(1000, it.x, it.y);
          this.addFloatingText(p.x, p.y - 20, '¡SUPER HONGO! ¡ÁMBAR CRECE!', '#ff85c0');
          for (let k = 0; k < 12; k++) this.spawnSparkle(p.x + 14, p.y + 20);
        } else if (it.type === 'magic_wand') {
          window.retroAudio.playSfx('powerup');
          this.setPlayerPowerState(2);
          this.addScore(1000, it.x, it.y);
          this.addFloatingText(p.x, p.y - 20, '¡PODER ARCOÍRIS: HAZ DE LUZ (X)!', '#ffe58f');
          for (let k = 0; k < 15; k++) this.spawnSparkle(p.x + 14, p.y + 20);
        } else if (it.type === 'star') {
          p.starTimer = 10.0;
          window.retroAudio.playBgm('star');
          this.addScore(1000, it.x, it.y);
          this.addFloatingText(p.x, p.y - 20, '¡SUPER ESTRELLA!', '#ffe58f');
        } else if (it.type === 'oneup') {
          this.lives++;
          window.retroAudio.playSfx('oneUp');
          this.addFloatingText(p.x, p.y - 20, '¡1-UP VIDA EXTRA!', '#95de64');
        }
        this.items.splice(i, 1);
      }
    }

    // Giant Star Coins Collection
    this.starCoins.forEach(sc => {
      if (!sc.collected && this.rectsOverlap(p, sc)) {
        sc.collected = true;
        if (!this.savedStarCoins[this.currentLevelIdx]) {
          this.savedStarCoins[this.currentLevelIdx] = [false, false, false];
        }
        this.savedStarCoins[this.currentLevelIdx][sc.index] = true;
        this.addScore(1000, sc.x, sc.y);
        const collectedCount = this.starCoins.filter(s => s.collected).length;
        this.addFloatingText(sc.x, sc.y - 18, `¡MONEDA ESTRELLA ${collectedCount}/3! +1000`, '#fde047');
        window.retroAudio.playSfx('starCoin');
        this.triggerScreenShake(0.12, 2.5);
        this.triggerHitStop(0.04);
        for (let k = 0; k < 16; k++) {
          this.spawnSparkle(sc.x + 15, sc.y + 15);
        }
      }
    });
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.x += pr.vx;
      pr.y += pr.vy;

      // Spawn glowing light trail particles behind the Light Beam ("Haz de Luz")
      if (Math.random() < 0.65) {
        this.particles.push({
          x: pr.vx > 0 ? pr.x - 4 : pr.x + pr.w + 2,
          y: pr.y + pr.h / 2 + (Math.random() - 0.5) * 6,
          vx: -pr.vx * 0.12,
          vy: (Math.random() - 0.5) * 1.2,
          size: 4 + Math.random() * 3,
          color: Math.random() < 0.5 ? '#fde047' : '#38bdf8',
          life: 0.22
        });
      }

      const wallCol = Math.floor((pr.vx > 0 ? pr.x + pr.w : pr.x) / TILE_SIZE);
      const midRow = Math.floor((pr.y + pr.h / 2) / TILE_SIZE);
      if (this.isSolidTile(this.getTile(midRow, wallCol)) || pr.x < this.cameraX - 60 || pr.x > this.cameraX + LOGICAL_WIDTH + 60) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (let j = 0; j < this.enemies.length; j++) {
        const en = this.enemies[j];
        if (!en.dead && !en.squished && this.rectsOverlap(pr, en)) {
          this.projectiles.splice(i, 1);
          for (let k = 0; k < 8; k++) {
            this.spawnSparkle(en.x + en.w / 2, en.y + en.h / 2);
          }
          if (en.type === 'boss') {
            this.damageBoss(en);
          } else {
            en.squished = true;
            en.squishTimer = 0.25;
            window.retroAudio.playSfx('kick');
            this.addScore(200, en.x, en.y);
          }
          break;
        }
      }
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx;
      ep.y += ep.vy;
      if (this.rectsOverlap(ep, this.player)) {
        this.enemyProjectiles.splice(i, 1);
        this.damagePlayer();
        continue;
      }
      if (ep.x < this.cameraX - 50 || ep.y > LOGICAL_HEIGHT + 40) {
        this.enemyProjectiles.splice(i, 1);
      }
    }
  }

  updateEnemies(dt) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      if (en.dead) {
        this.enemies.splice(i, 1);
        continue;
      }

      if (en.x > this.cameraX + LOGICAL_WIDTH + 180) continue;

      if (en.squished) {
        en.squishTimer -= dt;
        if (en.squishTimer <= 0) en.dead = true;
        continue;
      }

      if (en.hurtTimer > 0) en.hurtTimer -= dt;

      if (en.type === 'fish') {
        if (en.baseY === undefined) en.baseY = en.y;
        en.x += (en.vx || -1.2);
        en.y = en.baseY + Math.sin(this.time * 4 + en.x * 0.05) * 14;
        if (en.x < -60) en.x = this.level.cols * TILE_SIZE + 20;
        if (en.x > this.level.cols * TILE_SIZE + 60) en.x = -20;
      } else if (en.type === 'jellyfish') {
        if (en.baseY === undefined) en.baseY = en.y;
        en.y = en.baseY + Math.sin(this.time * 2.5 + en.x * 0.04) * 26;
      } else if (en.type === 'boo') {
        const dx = (p.x + p.w / 2) - (en.x + en.w / 2);
        const dy = (p.y + p.h / 2) - (en.y + en.h / 2);
        // If Boo is to the right of Ámbar (dx < 0), Ámbar looks at Boo when facing right (p.facing > 0)
        // If Boo is to the left of Ámbar (dx > 0), Ámbar looks at Boo when facing left (p.facing < 0)
        const isLookingAtBoo = (dx < 0 && p.facing > 0) || (dx > 0 && p.facing < 0);
        en.isShy = isLookingAtBoo;
        en.facing = dx > 0 ? 1 : -1;
        if (!en.isShy) {
          const dist = Math.max(1, Math.hypot(dx, dy));
          en.x += (dx / dist) * 1.4;
          en.y += (dy / dist) * 1.05;
        }
      } else if (en.type === 'frost_boss') {
        en.x += en.vx;
        const arenaMinX = 144 * TILE_SIZE;
        const arenaMaxX = 168 * TILE_SIZE;
        if (en.x <= arenaMinX) {
          en.x = arenaMinX;
          en.vx = Math.abs(en.vx);
        } else if (en.x + en.w >= arenaMaxX) {
          en.x = arenaMaxX - en.w;
          en.vx = -Math.abs(en.vx);
        }

        en.vy = Math.min(10, en.vy + 0.35);
        en.y += en.vy;

        const bRow = Math.floor((en.y + en.h) / TILE_SIZE);
        const bCol = Math.floor((en.x + en.w / 2) / TILE_SIZE);
        if (en.vy > 0 && this.isSolidTile(this.getTile(bRow, bCol))) {
          en.y = bRow * TILE_SIZE - en.h;
          en.vy = 0;
          if (Math.random() < 0.02) {
            en.vy = -8.2;
          }
        }

        en.attackTimer = (en.attackTimer || 2.4) - dt;
        if (en.attackTimer <= 0 && Math.abs(en.x - p.x) < 460) {
          en.attackTimer = 2.4;
          const dx = p.x - en.x;
          const dy = p.y - en.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          this.enemyProjectiles.push({
            x: en.x + en.w / 2,
            y: en.y + en.h / 2,
            w: 16,
            h: 16,
            vx: (dx / dist) * 4.6,
            vy: (dy / dist) * 4.6,
            isIceShard: true
          });
          window.retroAudio.playSfx('bump');
        }

        if (en.y > LOGICAL_HEIGHT + 40) {
          en.dead = true;
          window.retroAudio.playSfx('bossDefeat');
          this.addScore(5000, en.x, LOGICAL_HEIGHT - 80);
          this.addFloatingText(p.x, p.y - 30, '¡REY ESCARCHA DERROTADO!', '#38bdf8');
        }
      } else if (en.type === 'cloud') {
        en.y = en.baseY + Math.sin(this.time * 2.8 + en.x * 0.02) * 38;
        en.x += en.vx * 0.6;
        if (Math.sin(this.time * 0.8) > 0.98) en.vx = -en.vx;
      } else if (en.type === 'boss') {
        en.x += en.vx;
        if (en.x <= en.minX) {
          en.x = en.minX;
          en.vx = Math.abs(en.vx);
        } else if (en.x + en.w >= en.maxX) {
          en.x = en.maxX - en.w;
          en.vx = -Math.abs(en.vx);
        }

        en.vy = Math.min(10, en.vy + 0.35);
        en.y += en.vy;

        const bRow = Math.floor((en.y + en.h) / TILE_SIZE);
        const bCol = Math.floor((en.x + en.w / 2) / TILE_SIZE);
        if (en.vy > 0 && this.isSolidTile(this.getTile(bRow, bCol))) {
          en.y = bRow * TILE_SIZE - en.h;
          en.vy = 0;
          if (Math.random() < 0.025) {
            en.vy = -8.5;
          }
        }

        en.attackTimer -= dt;
        if (en.attackTimer <= 0 && Math.abs(en.x - p.x) < 440) {
          en.attackTimer = 2.4;
          const dx = p.x - en.x;
          const dy = p.y - en.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          this.enemyProjectiles.push({
            x: en.x + en.w / 2,
            y: en.y + en.h / 2,
            w: 14,
            h: 14,
            vx: (dx / dist) * 4.2,
            vy: (dy / dist) * 4.2
          });
        }

        if (en.y > LOGICAL_HEIGHT + 40) {
          en.dead = true;
          window.retroAudio.playSfx('bossDefeat');
          this.addScore(5000, en.x, LOGICAL_HEIGHT - 80);
          this.addFloatingText(p.x, p.y - 30, '¡REY NUBARRÓN DERROTADO!', '#ffe58f');
        }
      } else {
        en.vy = Math.min(10, en.vy + 0.4);
        en.x += en.vx;

        const wallCol = Math.floor((en.vx > 0 ? en.x + en.w : en.x) / TILE_SIZE);
        const midRow = Math.floor((en.y + en.h / 2) / TILE_SIZE);
        if (this.isSolidTile(this.getTile(midRow, wallCol))) {
          en.vx = -en.vx;
          if (en.inShell && Math.abs(en.vx) > 3) {
            window.retroAudio.playSfx('bump');
          }
        }

        en.y += en.vy;
        const bottomRow = Math.floor((en.y + en.h) / TILE_SIZE);
        const centerCol = Math.floor((en.x + en.w / 2) / TILE_SIZE);
        if (en.vy >= 0 && this.isSolidTile(this.getTile(bottomRow, centerCol))) {
          en.y = bottomRow * TILE_SIZE - en.h;
          en.vy = 0;

          if (!en.inShell && en.type !== 'goomba') {
            const aheadCol = Math.floor((en.vx > 0 ? en.x + en.w + 4 : en.x - 4) / TILE_SIZE);
            if (!this.isSolidTile(this.getTile(bottomRow, aheadCol))) {
              en.vx = -en.vx;
            }
          }
        }

        if (en.inShell && Math.abs(en.vx) > 3) {
          this.enemies.forEach(other => {
            if (other !== en && !other.dead && !other.squished && this.rectsOverlap(en, other)) {
              if (other.type === 'boss' || other.type === 'frost_boss') {
                this.damageBoss(other);
              } else {
                other.squished = true;
                other.squishTimer = 0.25;
                window.retroAudio.playSfx('kick');
                this.addScore(400, other.x, other.y);
              }
            }
          });
        }
      }

      if (!p.dead && this.rectsOverlap(p, en)) {
        if (p.starTimer > 0 || (p.isFlying && p.diveBombing && p.vy > 3.0)) {
          if (en.type === 'boss' || en.type === 'frost_boss') {
            this.damageBoss(en);
          } else {
            en.squished = true;
            en.squishTimer = 0.25;
            window.retroAudio.playSfx('kick');
            this.triggerScreenShake(0.14, 3.5);
            this.addScore(300, en.x, en.y);
            this.addFloatingText(en.x, en.y - 12, '¡PICADA!', '#38bdf8');
            for (let k = 0; k < 6; k++) this.spawnSparkle(en.x + en.w / 2, en.y + en.h / 2);
          }
          continue;
        }

        if (en.type === 'boo') {
          // Boos are ethereal ghosts; stomping them without invincibility hurts Ámbar!
          this.damagePlayer();
          continue;
        }

        const stompFromAbove = p.vy > 0 && (p.y + p.h - p.vy) <= en.y + 24;

        if (stompFromAbove) {
          p.vy = -10.5;
          p.airJumpsLeft = 1;
          p.isJumping = true;
          p.squashX = 1.25;
          p.squashY = 0.78;
          this.triggerHitStop(0.04);
          this.triggerScreenShake(0.12, 3.2);
          this.spawnDust(p.x + p.w / 2, p.y + p.h, 4, 0, -0.6);
          if (en.type === 'boss' || en.type === 'frost_boss') {
            this.damageBoss(en);
          } else if (en.type === 'koopa') {
            if (!en.inShell) {
              en.inShell = true;
              en.vx = 0;
              window.retroAudio.playSfx('stomp');
              this.addScore(100, en.x, en.y);
            } else if (en.vx === 0) {
              en.vx = p.facing * 7.2;
              window.retroAudio.playSfx('kick');
              this.addScore(200, en.x, en.y);
            } else {
              en.vx = 0;
              window.retroAudio.playSfx('stomp');
            }
          } else {
            en.squished = true;
            en.squishTimer = 0.35;
            window.retroAudio.playSfx('stomp');
            this.addScore(100, en.x, en.y);
          }
        } else if (en.type === 'koopa' && en.inShell && en.vx === 0) {
          en.vx = (p.x < en.x ? 1 : -1) * 7.2;
          this.triggerHitStop(0.03);
          this.triggerScreenShake(0.08, 2.0);
          window.retroAudio.playSfx('kick');
          this.addScore(200, en.x, en.y);
        } else {
          this.damagePlayer();
        }
      }
    }
  }

  damageBoss(boss) {
    if (boss.hurtTimer > 0) return;
    boss.hp--;
    boss.hurtTimer = 0.6;
    this.triggerHitStop(0.08);
    this.triggerScreenShake(0.28, 6.5);
    window.retroAudio.playSfx('bossHit');
    this.addScore(500, boss.x, boss.y);

    if (boss.hp <= 0) {
      boss.dead = true;
      window.retroAudio.playSfx('bossDefeat');
      this.triggerScreenShake(0.6, 9.0);
      this.addScore(5000, boss.x, boss.y);
      const title = boss.type === 'frost_boss' ? '¡REY ESCARCHA DERROTADO!' : '¡REY NUBARRÓN DERROTADO!';
      this.addFloatingText(boss.x, boss.y - 20, title, '#ffe58f');
      for (let i = 0; i < 25; i++) {
        this.spawnSparkle(boss.x + Math.random() * boss.w, boss.y + Math.random() * boss.h);
      }
    }
  }

  triggerRainbowSwitch(r, c) {
    this.level.grid[r][c] = '.';
    window.retroAudio.playSfx('bossDefeat');
    this.addFloatingText(c * TILE_SIZE, r * TILE_SIZE - 20, '¡PUENTE LIBERADO!', '#ffe58f');

    for (let row = 0; row < this.level.rows; row++) {
      for (let col = 0; col < this.level.cols; col++) {
        if (this.level.grid[row][col] === '=') {
          this.level.grid[row][col] = '.';
          this.spawnSparkle(col * TILE_SIZE + 16, row * TILE_SIZE + 8);
        }
      }
    }
  }

  damagePlayer() {
    const p = this.player;
    if (p.invulnerableTimer > 0 || p.starTimer > 0 || p.dead) return;

    this.triggerHitStop(0.06);
    this.triggerScreenShake(0.24, 6.0);

    if (p.powerState >= 1) {
      window.retroAudio.playSfx('hurt');
      this.setPlayerPowerState(p.powerState - 1);
      p.invulnerableTimer = 2.0;
      const msg = p.powerState === 1 ? '¡Cuidado!' : 'Jardinero de Jean';
      this.addFloatingText(p.x, p.y - 16, msg, '#ffd6e7');
    } else {
      this.killPlayer();
    }
  }

  killPlayer() {
    const p = this.player;
    if (p.dead) return;
    p.dead = true;
    p.vy = -10.5;
    p.vx = 0;
    this.lives--;
    this.stateTimer = 2.2;
    window.retroAudio.stopBgm();
    window.retroAudio.playSfx('hurt');
  }

  triggerStageClear() {
    if (this.state === 'STAGE_CLEAR') return;
    this.state = 'STAGE_CLEAR';
    this.stateTimer = 3.8;
    window.retroAudio.stopBgm();
    window.retroAudio.playSfx('flagpole');
    setTimeout(() => window.retroAudio.playSfx('stageClear'), 650);

    this.addScore(2000, this.player.x, this.player.y - 20);
    this.addFloatingText(this.player.x, this.player.y - 35, '¡META ALCANZADA!', '#ffe58f');
    for (let i = 0; i < 5; i++) {
      this.spawnFirework(this.level.flagX - 80 + i * 50, 90 + (i % 2) * 40);
    }
  }

  triggerSecretExit(gx, gy) {
    if (this.state === 'STAGE_CLEAR') return;
    this.state = 'STAGE_CLEAR';
    this.isSecretExit = true;
    this.stateTimer = 4.2;
    window.retroAudio.stopBgm();
    window.retroAudio.playSfx('secretExit');

    this.addScore(5000, this.player.x, this.player.y - 20);
    this.addFloatingText(this.player.x, this.player.y - 30, '¡¡SALIDA SECRETA DESCUBIERTA!!', '#fde047');
    this.addFloatingText(this.player.x, this.player.y - 50, '¡CAMINO ESTELAR A 1-S DESBLOQUEADO!', '#38bdf8');

    // Dazzling spiral galaxy star burst
    const originX = gx !== undefined ? gx + 16 : this.player.x + 16;
    const originY = gy !== undefined ? gy + 16 : this.player.y + 16;
    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * Math.PI * 4;
      const spd = 2 + (i % 5) * 1.5;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 2.2,
        color: ['#fde047', '#f472b6', '#38bdf8', '#c084fc', '#ffffff'][i % 5],
        size: 4 + (i % 3) * 2,
        sparkle: true
      });
    }
  }

  onStageClearReturnToMap() {
    const curId = this.currentMapNodeId;
    const node = this.mapNodes[curId];
    if (node) {
      node.cleared = true;
    }

    if (this.currentWorld === 1) {
      // If clearing 1-8 (node 7) or 1-S (node 8), unlock World 2!
      if (curId === 7 || curId === 8) {
        this.world2Nodes[0].unlocked = true;
      }

      if (this.isSecretExit) {
        // Unlocks secret level node (Node 8: 1-S) and triggers secret path animation!
        const secretNode = this.world1Nodes.find(n => n.id === 8);
        if (secretNode) {
          secretNode.unlocked = true;
        }
        this.secretPathUnlockedAnim = 2.8;
        this.currentMapNodeId = 8;
      } else {
        // Normal exit: unlock next connected nodes
        if (node && node.paths) {
          for (const dir in node.paths) {
            const nextId = node.paths[dir];
            if (this.world1Nodes[nextId]) {
              this.world1Nodes[nextId].unlocked = true;
            }
          }
        }
        // If clearing 1-S (secret level), unlock the shortcut path to node 6 (1-7 Vuelo)!
        if (curId === 8) {
          if (this.world1Nodes[6]) this.world1Nodes[6].unlocked = true;
        }
        // Advance Ámbar to next connected unlocked node if available
        if (node && node.paths) {
          const primaryNext = node.paths.right !== undefined ? node.paths.right : (node.paths.down !== undefined ? node.paths.down : Object.values(node.paths)[0]);
          if (primaryNext !== undefined && this.world1Nodes[primaryNext]) {
            this.currentMapNodeId = primaryNext;
          }
        }
      }
    } else {
      // In World 2: unlock next connected nodes
      if (node && node.paths) {
        for (const dir in node.paths) {
          const nextId = node.paths[dir];
          if (this.world2Nodes[nextId]) {
            this.world2Nodes[nextId].unlocked = true;
          }
        }
        const primaryNext = node.paths.right !== undefined ? node.paths.right : Object.values(node.paths)[0];
        if (primaryNext !== undefined && this.world2Nodes[primaryNext]) {
          this.currentMapNodeId = primaryNext;
        }
      }
    }

    this.isSecretExit = false;
    this.checkpointReached = false;
    this.enterMapScreen();
  }

  updateOverworldMap(dt) {
    if (this.secretPathUnlockedAnim > 0) {
      this.secretPathUnlockedAnim -= dt;
      // Spawn golden sparkles between 1-2 and 1-S during unlock fanfare!
      const n1 = this.mapNodes[1];
      const n8 = this.mapNodes[8];
      if (n1 && n8) {
        const t = Math.random();
        this.particles.push({
          x: n1.x + (n8.x - n1.x) * t + (Math.random() - 0.5) * 16,
          y: n1.y + (n8.y - n1.y) * t + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2 - 0.5,
          life: 0.8,
          color: ['#fde047', '#f472b6', '#38bdf8', '#c084fc'][Math.floor(Math.random() * 4)],
          size: 3 + Math.random() * 3,
          sparkle: true
        });
      }
    }

    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    if (this.mapAmbar.isMoving) {
      this.mapAmbar.moveT += dt * 3.6;
      this.mapAmbar.walkFrame = this.mapAmbar.moveT * 4;
      const t = Math.min(1.0, this.mapAmbar.moveT);
      this.mapAmbar.x = this.mapAmbar.fromX + (this.mapAmbar.toX - this.mapAmbar.fromX) * t;
      this.mapAmbar.y = this.mapAmbar.fromY + (this.mapAmbar.toY - this.mapAmbar.fromY) * t;
      if (this.mapAmbar.moveT >= 1.0) {
        this.mapAmbar.isMoving = false;
        this.currentMapNodeId = this.mapAmbar.targetNodeId;
        const n = this.mapNodes[this.currentMapNodeId];
        this.mapAmbar.x = n.x;
        this.mapAmbar.y = n.y;
        this.updateLevelButtonsUI();
      }
    } else {
      this.mapAmbar.walkFrame = 0;
      this.handleMapInput(dt);
    }
  }

  handleMapInput(dt) {
    const cur = this.mapNodes[this.currentMapNodeId];
    if (!cur) return;
    let nextId = null;
    let targetFacing = this.mapAmbar.facing;

    if (this.keys.right) {
      if (cur.paths && cur.paths.right !== undefined) nextId = cur.paths.right;
      targetFacing = 1;
    } else if (this.keys.left) {
      if (cur.paths && cur.paths.left !== undefined) nextId = cur.paths.left;
      targetFacing = -1;
    } else if (this.keys.up) {
      if (cur.paths && cur.paths.up !== undefined) nextId = cur.paths.up;
      else if (cur.secretPath && cur.secretPath.up !== undefined && this.mapNodes[cur.secretPath.up].unlocked) {
        nextId = cur.secretPath.up;
      }
    } else if (this.keys.down) {
      if (cur.paths && cur.paths.down !== undefined) nextId = cur.paths.down;
      else if (cur.secretPath && cur.secretPath.down !== undefined && this.mapNodes[cur.secretPath.down].unlocked) {
        nextId = cur.secretPath.down;
      }
    }

    if (nextId !== null && this.mapNodes[nextId] && this.mapNodes[nextId].unlocked) {
      this.startMapTravel(nextId, targetFacing);
    }

    if (this.keys.jumpJustPressed || this.keys.actionJustPressed) {
      this.launchCurrentMapLevel();
    }
  }

  startMapTravel(targetNodeId, facing) {
    const cur = this.mapNodes[this.currentMapNodeId];
    const target = this.mapNodes[targetNodeId];
    if (!target || !target.unlocked) return;
    this.mapAmbar.fromX = cur.x;
    this.mapAmbar.fromY = cur.y;
    this.mapAmbar.toX = target.x;
    this.mapAmbar.toY = target.y;
    this.mapAmbar.targetNodeId = targetNodeId;
    this.mapAmbar.facing = facing !== undefined ? facing : (target.x >= cur.x ? 1 : -1);
    this.mapAmbar.moveT = 0;
    this.mapAmbar.isMoving = true;
    window.retroAudio.playSfx('mapMove');
  }

  launchCurrentMapLevel() {
    const cur = this.mapNodes[this.currentMapNodeId];
    if (cur && cur.unlocked) {
      window.retroAudio.playSfx('mapSelect');
      this.startLevelIntro(cur.levelIdx, true);
    }
  }

  handleMapPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Check header World toggle buttons
    if (my >= 14 && my <= 52) {
      if (mx >= 250 && mx <= 322) {
        if (this.currentWorld !== 1) this.toggleWorld(1);
        return;
      }
      if (mx >= 326 && mx <= 398) {
        if (this.currentWorld !== 2) this.toggleWorld(2);
        return;
      }
    }

    // Check if clicked the bottom level action card
    if (my > 410) {
      this.launchCurrentMapLevel();
      return;
    }

    // Check node clicks
    for (let i = 0; i < this.mapNodes.length; i++) {
      const node = this.mapNodes[i];
      if (!node.unlocked) continue;
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy <= 28 * 28) {
        if (this.currentMapNodeId === i) {
          this.launchCurrentMapLevel();
        } else {
          this.startMapTravel(i, node.x >= this.mapAmbar.x ? 1 : -1);
        }
        return;
      }
    }
  }

  getTile(r, c) {
    if (!this.level || r < 0 || r >= this.level.rows || c < 0 || c >= this.level.cols) {
      return '.';
    }
    return this.level.grid[r][c];
  }

  rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  addScore(pts, x, y) {
    this.score += pts;
    this.addFloatingText(x, y, `+${pts}`, '#fff1b8');
  }

  addFloatingText(x, y, text, color = '#ffffff') {
    this.floatingTexts.push({ x, y, text, color, life: 1.0 });
  }

  updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  triggerScreenShake(duration = 0.16, intensity = 3.5) {
    this.screenShakeTimer = Math.max(this.screenShakeTimer, duration);
    this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity);
  }

  triggerHitStop(duration = 0.04) {
    this.hitStopTimer = Math.max(this.hitStopTimer, duration);
  }

  spawnDust(x, y, count = 3, vx = 0, vy = -0.5, color = null) {
    const isBeach = this.level && this.level.theme === 4;
    const defaultColor = isBeach ? '#fde047' : '#cbd5e1';
    const c = color || defaultColor;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'dust',
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 4,
        vx: vx + (Math.random() - 0.5) * 1.8,
        vy: vy - Math.random() * 1.2,
        size: 3 + Math.random() * 3,
        maxSize: 6 + Math.random() * 4,
        color: c,
        life: 0.28 + Math.random() * 0.16,
        maxLife: 0.35
      });
    }
  }

  spawnSparkle(x, y) {
    const colors = ['#ff85c0', '#ffe58f', '#5cdbd3', '#b37feb', '#95de64', '#ffffff'];
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 1,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0.45 + Math.random() * 0.3
    });
  }

  spawnBubble(x, y) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1.2 - Math.random() * 1.6,
      size: 3 + Math.random() * 4,
      color: 'rgba(224, 242, 254, 0.75)',
      isBubble: true,
      life: 0.8 + Math.random() * 0.5
    });
  }

  spawnGrindSpark(x, y) {
    const colors = ['#fde047', '#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.8 * (this.player.facing || 1)) * 5,
        vy: -2 - Math.random() * 3,
        size: 2.5 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.25 + Math.random() * 0.2
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.type === 'dust') {
        pt.vx *= 0.92;
        pt.vy *= 0.90;
        pt.size = Math.min(pt.maxSize, pt.size + dt * 9);
      } else {
        pt.vy += 0.15;
      }
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  spawnFirework(x, y) {
    const colors = ['#ff4d94', '#ffe58f', '#5cdbd3', '#b37feb', '#95de64'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      this.fireworks.push({
        x,
        y,
        vx: Math.cos(a) * (2 + Math.random() * 2.5),
        vy: Math.sin(a) * (2 + Math.random() * 2.5),
        color: c,
        life: 0.9
      });
    }
  }

  updateFireworks(dt) {
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.06;
      fw.life -= dt;
      if (fw.life <= 0) this.fireworks.splice(i, 1);
    }
  }

  updateGhosts(dt) {
    const p = this.player;
    const isHighSpeed = Math.abs(p.vx) > 6.0 || p.turboTimer > 0 || (p.isFlying && (p.diveBombing || Math.abs(p.vx) > 5.0));

    if (isHighSpeed && !p.dead) {
      this.ghostTimer = (this.ghostTimer || 0) - dt;
      if (this.ghostTimer <= 0) {
        this.ghostTimer = 0.042;
        const color = p.isFlying ? '#38bdf8' : (p.onBike ? '#f472b6' : '#fde047');
        this.ghosts.push({
          x: p.x,
          y: p.y,
          w: p.w,
          h: p.h,
          facing: p.facing,
          powerState: p.powerState,
          onBike: p.onBike,
          isFlying: p.isFlying,
          bikeAngle: p.bikeAngle || 0,
          color,
          alpha: 0.45,
          life: 0.18,
          maxLife: 0.18
        });
      }
    }

    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.life -= dt;
      g.alpha = Math.max(0, (g.life / g.maxLife) * 0.45);
      if (g.life <= 0) {
        this.ghosts.splice(i, 1);
      }
    }
  }

  // ==========================================================================
  // RENDERING
  // ==========================================================================
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    if (this.state === 'TITLE') {
      this.renderTitleScreen(ctx);
      return;
    }

    if (this.state === 'MAP') {
      this.renderOverworldMap(ctx);
      return;
    }

    if (this.state === 'LEVEL_INTRO') {
      this.renderLevelIntroScreen(ctx);
      return;
    }

    this.renderBackground(ctx);

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
    }

    ctx.save();
    ctx.translate(-Math.round(this.cameraX) + shakeX, shakeY);

    if (this.level.checkpointX) {
      this.renderCheckpointFlag(ctx, this.level.checkpointX, 13 * TILE_SIZE);
    }

    if (this.level.flagX) {
      this.renderGoalAndCastle(ctx);
    }

    const startCol = Math.max(0, Math.floor(this.cameraX / TILE_SIZE) - 1);
    const endCol = Math.min(this.level.cols - 1, Math.ceil((this.cameraX + LOGICAL_WIDTH) / TILE_SIZE) + 1);

    for (let r = 0; r < this.level.rows; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const ch = this.level.grid[r][c];
        if (ch !== '.') {
          const bump = this.bumpOffsets[`${r},${c}`];
          const by = r * TILE_SIZE + (bump ? bump.offset : 0);
          window.spriteRenderer.drawTile(ctx, ch, c * TILE_SIZE, by, TILE_SIZE, this.time, this.level.theme);
        }
      }
    }

    if (this.level.theme === 3) {
      this.renderCastleLava(ctx, startCol, endCol);
    }

    this.platforms.forEach(plat => {
      window.spriteRenderer.drawPlatform(ctx, plat, this.time);
    });

    this.items.forEach(it => {
      if (it.x + it.w >= this.cameraX && it.x <= this.cameraX + LOGICAL_WIDTH) {
        window.spriteRenderer.drawItem(ctx, it, this.time);
      }
    });

    this.starCoins.forEach(sc => {
      if (!sc.collected && sc.x + sc.w >= this.cameraX && sc.x <= this.cameraX + LOGICAL_WIDTH) {
        window.spriteRenderer.drawStarCoin(ctx, sc, this.time);
      }
    });

    this.enemies.forEach(en => {
      if (!en.dead && en.x + en.w >= this.cameraX - 40 && en.x <= this.cameraX + LOGICAL_WIDTH + 40) {
        window.spriteRenderer.drawEnemy(ctx, en, this.time, this.level ? this.level.theme : 1);
      }
    });

    this.projectiles.forEach(pr => {
      window.spriteRenderer.drawRainbowProjectile(ctx, pr, this.time);
    });

    this.enemyProjectiles.forEach(ep => {
      if (ep.isIceShard) {
        ctx.save();
        ctx.fillStyle = '#bae6fd';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ep.x + 8, ep.y);
        ctx.lineTo(ep.x + 16, ep.y + 8);
        ctx.lineTo(ep.x + 8, ep.y + 16);
        ctx.lineTo(ep.x, ep.y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ep.x + 6, ep.y + 6, 4, 4);
        ctx.restore();
      } else {
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(ep.x + 7, ep.y + 7, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#d50000';
        ctx.stroke();
      }
    });

    // Draw Speed Trail Ghosts
    this.ghosts.forEach(g => {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.shadowColor = g.color;
      ctx.shadowBlur = 8;
      window.spriteRenderer.drawAmbar(ctx, g, this.time);
      ctx.restore();
    });

    // Draw High-Definition Ámbar!
    window.spriteRenderer.drawAmbar(ctx, this.player, this.time);

    this.particles.forEach(pt => {
      if (pt.isBubble) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillStyle = pt.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1.5, pt.size / 2), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pt.x - 1, pt.y - pt.size / 3, 1.5, 1.5);
        ctx.restore();
      } else if (pt.type === 'dust') {
        ctx.save();
        const alpha = Math.max(0, Math.min(1, pt.life / (pt.maxLife || 0.35)));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1, pt.size / 2), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }
    });

    this.fireworks.forEach(fw => {
      ctx.fillStyle = fw.color;
      ctx.fillRect(fw.x, fw.y, 5, 5);
    });

    this.floatingTexts.forEach(ft => {
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#1a0933';
      ctx.fillText(ft.text, ft.x + 1.5, ft.y + 1.5);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore();

    this.renderHUD(ctx);

    if (this.state === 'VICTORY') {
      this.renderVictoryOverlay(ctx);
    } else if (this.state === 'GAMEOVER') {
      this.renderGameOverOverlay(ctx);
    }
  }

  renderBackground(ctx) {
    const theme = this.level ? this.level.theme : 1;

    if (theme === 1) {
      // SUPER MARIO ALL-STARS OVERWORLD SKY (Rich 16-Bit Cerulean to Horizon Blue)
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(0.85, '#93c5fd');
      grad.addColorStop(1, '#dbeafe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Subtle atmospheric rainbow in the distant sky
      const rainbowColors = ['#f43f5e', '#f59e0b', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6'];
      const rx = 440 - (this.cameraX * 0.08) % 900;
      ctx.save();
      ctx.globalAlpha = 0.38;
      rainbowColors.forEach((c, idx) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(rx, 430, 290 - idx * 9, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();

      // PARALLAX LAYER 1: Super Mario All-Stars Distant Blue-Green Mountain Ranges with Waterfalls
      for (let i = 0; i < 6; i++) {
        const mx = ((i * 260 - this.cameraX * 0.16) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 150;
        const mh = 175 + (i % 2) * 35;

        // Mountain body with 16-bit shading
        const mGrad = ctx.createLinearGradient(mx, mh, mx + 220, 13 * TILE_SIZE);
        mGrad.addColorStop(0, '#2dd4bf');
        mGrad.addColorStop(0.35, '#0f766e');
        mGrad.addColorStop(1, '#115e59');
        ctx.fillStyle = mGrad;
        ctx.strokeStyle = '#042f2e';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(mx, 13 * TILE_SIZE);
        ctx.lineTo(mx + 85, mh + 15);
        ctx.quadraticCurveTo(mx + 110, mh - 12, mx + 135, mh + 15);
        ctx.lineTo(mx + 220, 13 * TILE_SIZE);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // SNES Waterfall stripe on mountain
        ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
        ctx.fillRect(mx + 104, mh + 10, 12, 13 * TILE_SIZE - mh - 10);
        ctx.fillStyle = '#ffffff';
        const wfOffset = (this.time * 40) % 16;
        for (let wy = mh + 14 + wfOffset; wy < 13 * TILE_SIZE - 10; wy += 16) {
          ctx.fillRect(mx + 106, wy, 8, 5);
        }
      }

      // PARALLAX LAYER 2: Super Mario All-Stars Shaded 16-Bit Clouds
      for (let i = 0; i < 7; i++) {
        const cx = ((i * 220 - this.cameraX * 0.26) % (LOGICAL_WIDTH + 220) + LOGICAL_WIDTH + 220) % (LOGICAL_WIDTH + 220) - 100;
        const cy = 66 + (i % 3) * 38;
        this.drawSnesCloud(ctx, cx, cy);
      }

      // PARALLAX LAYER 3: Super Mario All-Stars Rounded Green Hills & Leafy Bushes
      for (let i = 0; i < 6; i++) {
        const hx = ((i * 280 - this.cameraX * 0.45) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 140;
        const hillGrad = ctx.createLinearGradient(hx, 13 * TILE_SIZE - 95, hx + 180, 13 * TILE_SIZE);
        hillGrad.addColorStop(0, '#4ade80');
        hillGrad.addColorStop(0.5, '#16a34a');
        hillGrad.addColorStop(1, '#14532d');

        ctx.fillStyle = hillGrad;
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx + 90, 13 * TILE_SIZE, 92, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        // Diagonal bevel spots on hill (SMB3 / All-Stars signature detail!)
        ctx.fillStyle = 'rgba(187, 247, 208, 0.35)';
        ctx.fillRect(hx + 55, 13 * TILE_SIZE - 65, 14, 24);
        ctx.fillRect(hx + 95, 13 * TILE_SIZE - 50, 14, 24);

        // Shaded SNES Bush next to hill
        this.drawSnesBush(ctx, hx + 170, 13 * TILE_SIZE);
      }
    } else if (theme === 4) {
      // MUNDO 1-4: PASEO COSTERO EN BICICLETA (Tropical Beach, Sunset Synthwave & Ocean Bay)
      // 1. Magical Tropical Sunset Sky Gradient (Synthwave / SNES Palette)
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#581c87');    // Deep twilight purple
      grad.addColorStop(0.25, '#9333ea'); // Synthwave purple
      grad.addColorStop(0.48, '#db2777'); // Vivid coral pink
      grad.addColorStop(0.70, '#f97316'); // Warm sunset orange
      grad.addColorStop(0.88, '#fde047'); // Golden horizon yellow
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // 2. Distant Horizon Islands / Mountains (Parallax 0.06)
      ctx.fillStyle = '#3b0764';
      for (let i = 0; i < 5; i++) {
        const mx = ((i * 300 - this.cameraX * 0.06) % (LOGICAL_WIDTH + 320) + LOGICAL_WIDTH + 320) % (LOGICAL_WIDTH + 320) - 120;
        ctx.beginPath();
        ctx.ellipse(mx + 80, 230, 95, 30, 0, Math.PI, 0);
        ctx.fill();
      }

      // 3. Giant Glowing Sunset Sun with Retro Heat-Haze Bands
      const sunX = ((620 - this.cameraX * 0.04) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 150;
      const sunY = 195;
      const sunRad = 52;

      // Outer golden glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRad * 0.4, sunX, sunY, sunRad * 1.8);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sunGlow.addColorStop(0.4, 'rgba(251, 146, 60, 0.45)');
      sunGlow.addColorStop(1, 'rgba(251, 113, 133, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRad * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Sun core
      const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRad, sunX, sunY + sunRad);
      sunGrad.addColorStop(0, '#fffbeb');
      sunGrad.addColorStop(0.5, '#fde047');
      sunGrad.addColorStop(1, '#f97316');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRad, 0, Math.PI * 2);
      ctx.fill();

      // Retro sunset scanline bands cutting across the sun
      ctx.fillStyle = '#db2777';
      for (let sl = 6; sl < sunRad; sl += 8) {
        ctx.fillRect(sunX - sunRad, sunY + sl, sunRad * 2, 2.5);
      }

      // 4. Sparkling Ocean Bay (from y = 226 to y = 345)
      const seaGrad = ctx.createLinearGradient(0, 226, 0, 345);
      seaGrad.addColorStop(0, '#1e1b4b');
      seaGrad.addColorStop(0.3, '#1e3a8a');
      seaGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, 226, LOGICAL_WIDTH, 120);

      // Sun Reflection Shimmer Trail directly under the sun
      const reflX = sunX;
      for (let ry = 230; ry < 345; ry += 7) {
        const spread = (ry - 226) * 0.9;
        const wave = Math.sin(this.time * 4 + ry) * 8;
        ctx.fillStyle = ry < 270 ? 'rgba(254, 240, 138, 0.75)' : 'rgba(251, 146, 60, 0.55)';
        ctx.fillRect(reflX - spread * 0.5 + wave, ry, spread, 2.5);
      }

      // Sparkling Wave Lines across the ocean
      for (let wx = 0; wx < LOGICAL_WIDTH; wx += 50) {
        for (let row = 0; row < 4; row++) {
          const wy = 240 + row * 24;
          const wPhase = Math.sin(this.time * 3 + wx * 0.08 + row) * 8;
          ctx.fillStyle = row % 2 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(125, 211, 252, 0.5)';
          ctx.fillRect(wx + wPhase, wy, 28, 2);
        }
      }

      // 5. Tropical Sandy Beach & Dunes (from y = 335 to ground floor)
      const sandGrad = ctx.createLinearGradient(0, 335, 0, 13 * TILE_SIZE);
      sandGrad.addColorStop(0, '#d97706');
      sandGrad.addColorStop(0.4, '#f59e0b');
      sandGrad.addColorStop(1, '#fbbf24');
      ctx.fillStyle = sandGrad;

      for (let i = 0; i < 5; i++) {
        const dx = ((i * 260 - this.cameraX * 0.25) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 150;
        ctx.beginPath();
        ctx.ellipse(dx + 120, 13 * TILE_SIZE, 150, 85, 0, Math.PI, 0);
        ctx.fill();
      }

      // 6. Flying Seagulls in Sunset Sky
      for (let g = 0; g < 4; g++) {
        const gx = ((g * 240 + this.time * 25 - this.cameraX * 0.15) % (LOGICAL_WIDTH + 150) + LOGICAL_WIDTH + 150) % (LOGICAL_WIDTH + 150) - 50;
        const gy = 70 + (g % 2) * 35;
        this.drawSnesSeagull(ctx, gx, gy, this.time * 6 + g * 2);
        this.drawSnesSeagull(ctx, gx + 22, gy - 8, this.time * 6 + g * 2 + 0.8);
      }

      // 7. Layer 1: Background Silhouette Palm Trees (Parallax 0.35)
      for (let i = 0; i < 5; i++) {
        const px = ((i * 240 - this.cameraX * 0.35) % (LOGICAL_WIDTH + 260) + LOGICAL_WIDTH + 260) % (LOGICAL_WIDTH + 260) - 100;
        const tilt = i % 2 === 0 ? 1 : -1;
        this.drawSnesPalmTree(ctx, px, 13 * TILE_SIZE, 0.72, tilt, true);
      }

      // 8. Layer 2: Foreground Detailed Tropical Palms (Parallax 0.55)
      for (let i = 0; i < 5; i++) {
        const px = ((i * 320 - this.cameraX * 0.55) % (LOGICAL_WIDTH + 340) + LOGICAL_WIDTH + 340) % (LOGICAL_WIDTH + 340) - 120;
        const tilt = (i % 2 === 0 ? 1.2 : -0.9);
        this.drawSnesPalmTree(ctx, px + 80, 13 * TILE_SIZE, 1.05, tilt, false);
      }
    } else if (theme === 2) {
      // MUNDO 1-2: TALLER DE JUGUETES Y TRENCITOS
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#130d06');
      grad.addColorStop(0.5, '#26170c');
      grad.addColorStop(1, '#3a2212');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Wooden beams across the background wall
      ctx.strokeStyle = '#1a0e05';
      ctx.lineWidth = 3;
      for (let y = 40; y < 13 * TILE_SIZE; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(LOGICAL_WIDTH, y);
        ctx.stroke();
      }

      // Parallax Carpenter Pillars & Rotating Brass Gears
      for (let i = 0; i < 6; i++) {
        const px = ((i * 220 - this.cameraX * 0.22) % (LOGICAL_WIDTH + 240) + LOGICAL_WIDTH + 240) % (LOGICAL_WIDTH + 240) - 80;
        // Wooden column
        ctx.fillStyle = '#451a03';
        ctx.fillRect(px, 0, 54, 13 * TILE_SIZE);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px + 4, 0, 46, 13 * TILE_SIZE);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px + 4, 0, 4, 13 * TILE_SIZE);

        // Rotating Brass Gear on pillar
        ctx.save();
        ctx.translate(px + 27, 130);
        ctx.rotate(this.time * 1.4 * (i % 2 === 0 ? 1 : -1));
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        for (let t = 0; t < 8; t++) {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-3, -22, 6, 8);
        }
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Warm glowing lantern hanging from pillar
        const ly = 210;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + 27, 160);
        ctx.lineTo(px + 27, ly);
        ctx.stroke();

        // Lantern Glow Halo
        const glow = ctx.createRadialGradient(px + 27, ly + 8, 4, px + 27, ly + 8, 40);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
        glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px + 27, ly + 8, 40, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 21, ly, 12, 16);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 23, ly + 2, 8, 12);
        ctx.strokeStyle = '#78350f';
        ctx.strokeRect(px + 21, ly, 12, 16);
      }

      // Parallax Wooden Trestle Bridge with Miniature Toy Train Chugging
      const bridgeY = 280;
      ctx.fillStyle = '#5c2c08';
      ctx.fillRect(0, bridgeY, LOGICAL_WIDTH, 6);
      for (let bx = 0; bx < LOGICAL_WIDTH; bx += 24) {
        ctx.fillRect(bx, bridgeY, 4, 13 * TILE_SIZE - bridgeY);
      }
      // Miniature Toy Train
      const trainX = ((this.time * 55 - this.cameraX * 0.12) % (LOGICAL_WIDTH + 200) + LOGICAL_WIDTH + 200) % (LOGICAL_WIDTH + 200) - 100;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(trainX, bridgeY - 14, 28, 14);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(trainX + 20, bridgeY - 20, 8, 10);
      ctx.fillRect(trainX - 22, bridgeY - 12, 18, 12);
      // Puffy smoke puffs
      for (let s = 0; s < 3; s++) {
        const sx = trainX + 24 - s * 14 - (this.time * 20) % 20;
        const sy = bridgeY - 24 - s * 6;
        ctx.fillStyle = `rgba(241, 245, 249, ${0.6 - s * 0.18})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 4 + s * 2, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (theme === 3) {
      // MUNDO 1-3: PALACIO DE DULCES Y CARAMELOS
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#2e022d');
      grad.addColorStop(0.5, '#4a044e');
      grad.addColorStop(1, '#701a75');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Parallax Giant Gumdrop Hills in the background
      for (let i = 0; i < 6; i++) {
        const gx = ((i * 240 - this.cameraX * 0.14) % (LOGICAL_WIDTH + 280) + LOGICAL_WIDTH + 280) % (LOGICAL_WIDTH + 280) - 100;
        const colors = ['#f43f5e', '#a855f7', '#38bdf8', '#fbbf24'];
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.ellipse(gx + 70, 13 * TILE_SIZE, 85, 95, 0, Math.PI, 0);
        ctx.fill();
        // Sugar crystals coating on gumdrop
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let c = 0; c < 8; c++) {
          ctx.fillRect(gx + 25 + (c * 13) % 90, 13 * TILE_SIZE - 20 - (c * 17) % 70, 3, 3);
        }
      }

      // Parallax Candy Cane Pillars with Red/White Spirals
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 260 - this.cameraX * 0.28) % (LOGICAL_WIDTH + 280) + LOGICAL_WIDTH + 280) % (LOGICAL_WIDTH + 280) - 100;
        // Pillar base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, 0, 48, 13 * TILE_SIZE);
        // Red diagonal spiral stripes
        ctx.fillStyle = '#e11d48';
        for (let sy = -20; sy < 13 * TILE_SIZE + 40; sy += 36) {
          ctx.beginPath();
          ctx.moveTo(cx, sy);
          ctx.lineTo(cx + 48, sy + 24);
          ctx.lineTo(cx + 48, sy + 38);
          ctx.lineTo(cx, sy + 14);
          ctx.closePath();
          ctx.fill();
        }

        // Stained-Glass Candy Window Arch next to pillar
        const wx = cx + 70;
        const wy = 120;
        ctx.fillStyle = '#be185d';
        ctx.fillRect(wx, wy, 54, 110);
        ctx.beginPath();
        ctx.arc(wx + 27, wy, 27, Math.PI, 0);
        ctx.fill();

        // Stained-Glass warm glow
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(wx + 4, wy + 4, 46, 102);
        ctx.beginPath();
        ctx.arc(wx + 27, wy, 23, Math.PI, 0);
        ctx.fill();

        // Glass panes
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(wx + 8, wy, 16, 48);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(wx + 30, wy, 16, 48);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(wx + 8, wy + 54, 16, 48);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(wx + 30, wy + 54, 16, 48);

        // Sugar dust sparkles floating in air
        for (let s = 0; s < 3; s++) {
          const spX = wx + 10 + (s * 15 + this.time * 12) % 60;
          const spY = wy + 30 + Math.sin(this.time * 3 + s) * 20;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(spX, spY, 2, 2);
        }
      }

    } else if (theme === 5) {
      // MUNDO 1-5: CAVERNA DE AMATISTA Y GEMAS
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#04020a');
      grad.addColorStop(0.4, '#130826');
      grad.addColorStop(1, '#090414');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Deep Cavern Stalactites hanging from ceiling with animated falling water drips
      for (let i = 0; i < 14; i++) {
        const sx = ((i * 95 - this.cameraX * 0.15) % (LOGICAL_WIDTH + 140) + LOGICAL_WIDTH + 140) % (LOGICAL_WIDTH + 140) - 50;
        const sh = 40 + (i % 3) * 28;
        ctx.fillStyle = '#2e1065';
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 14, sh);
        ctx.lineTo(sx + 28, 0);
        ctx.closePath();
        ctx.fill();

        // Water droplet dripping from stalactite tip
        if (i % 2 === 0) {
          const dropT = (this.time * 1.8 + i) % 1.5;
          if (dropT < 1.0) {
            const dy = sh + dropT * 180;
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(sx + 13, dy, 2, 4);
          }
        }
      }

      // Parallax Multifaceted Amethyst & Turquoise Crystal Clusters rising from the ground
      for (let i = 0; i < 9; i++) {
        const cx = ((i * 155 - this.cameraX * 0.28) % (LOGICAL_WIDTH + 200) + LOGICAL_WIDTH + 200) % (LOGICAL_WIDTH + 200) - 70;
        const ch = 130 + (i % 4) * 40;
        const cy = 13 * TILE_SIZE;

        // Amethyst Crystal Spikes
        const isTeal = i % 3 === 0;
        const cBase = isTeal ? '#0e7490' : '#6b21a8';
        const cMid = isTeal ? '#06b6d4' : '#9333ea';
        const cHi = isTeal ? '#67e8f9' : '#c084fc';

        // Crystal Glow
        const cg = ctx.createRadialGradient(cx + 20, cy - ch * 0.6, 10, cx + 20, cy - ch * 0.6, 65);
        cg.addColorStop(0, isTeal ? 'rgba(34, 211, 238, 0.35)' : 'rgba(192, 132, 252, 0.35)');
        cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx + 20, cy - ch * 0.6, 65, 0, Math.PI * 2);
        ctx.fill();

        // Main Crystal Body
        ctx.fillStyle = cBase;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 20, cy - ch);
        ctx.lineTo(cx + 40, cy);
        ctx.closePath();
        ctx.fill();

        // Left facet highlight
        ctx.fillStyle = cMid;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 20, cy - ch);
        ctx.lineTo(cx + 18, cy);
        ctx.closePath();
        ctx.fill();

        // Crest glint
        ctx.fillStyle = cHi;
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - ch * 0.7);
        ctx.lineTo(cx + 20, cy - ch);
        ctx.lineTo(cx + 22, cy - ch * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 19, cy - ch - 1, 3, 3);
      }

      // Bioluminescent crystal spore motes floating in dark cave
      for (let s = 0; s < 18; s++) {
        const mx = ((s * 75 + this.time * 15 - this.cameraX * 0.35) % (LOGICAL_WIDTH + 100) + LOGICAL_WIDTH + 100) % (LOGICAL_WIDTH + 100) - 50;
        const my = 120 + Math.sin(this.time * 2 + s) * 70;
        ctx.fillStyle = s % 2 === 0 ? '#38bdf8' : '#c084fc';
        ctx.fillRect(mx, my, 2, 2);
      }

    } else if (theme === 6) {
      // MUNDO 1-6: CIELO DE NUBES Y ARCOÍRIS
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.8, '#bae6fd');
      grad.addColorStop(1, '#fef9c3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Arching Rainbow across sky
      const rainbowColors = ['#f43f5e', '#f59e0b', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6'];
      ctx.save();
      ctx.globalAlpha = 0.55;
      rainbowColors.forEach((c, idx) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(LOGICAL_WIDTH / 2, 450, 330 - idx * 10, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();

      // Parallax Floating Puffy White Cloud Islands with Pastel Grass
      for (let i = 0; i < 8; i++) {
        const cx = ((i * 200 - this.cameraX * 0.28) % (LOGICAL_WIDTH + 240) + LOGICAL_WIDTH + 240) % (LOGICAL_WIDTH + 240) - 100;
        const cy = 60 + (i % 4) * 60;
        this.drawSnesCloud(ctx, cx, cy);

        // Floating island with grass beneath cloud
        if (i % 2 === 1) {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.ellipse(cx + 30, cy + 28, 38, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    } else if (theme === 7) {
      // MUNDO 1-7: VUELO HEROICO EN LA ESTRATOSFERA
      // Sunset twilight transitioning into deep space
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#070314');    // Deep Space Black/Violet
      grad.addColorStop(0.3, '#1e1b4b');  // Midnight Indigo
      grad.addColorStop(0.65, '#4338ca'); // Twilight Blue
      grad.addColorStop(0.85, '#db2777'); // Stratospheric Rose Pink
      grad.addColorStop(1, '#f59e0b');    // Golden Sunset Horizon
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Radiant Waving Aurora Borealis Curtains
      ctx.save();
      for (let a = 0; a < 3; a++) {
        const aColors = ['#10b981', '#06b6d4', '#ec4899'];
        ctx.fillStyle = aColors[a];
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= LOGICAL_WIDTH; x += 30) {
          const y = 90 + a * 35 + Math.sin(this.time * 2.2 + x * 0.015 + a * 1.5) * 35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(LOGICAL_WIDTH, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Twinkling Space Stars in upper stratosphere
      for (let s = 0; s < 35; s++) {
        const sx = ((s * 47 - this.cameraX * 0.05) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const sy = (s * 19) % 200;
        const twinkle = Math.sin(this.time * 6 + s) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + twinkle * 0.6})`;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Fast Streaking Shooting Stars
      for (let st = 0; st < 2; st++) {
        const stX = ((this.time * 240 + st * 400 - this.cameraX * 0.1) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 150;
        const stY = 40 + st * 70;
        const stGrad = ctx.createLinearGradient(stX - 40, stY - 20, stX, stY);
        stGrad.addColorStop(0, 'rgba(254, 240, 138, 0)');
        stGrad.addColorStop(1, 'rgba(254, 240, 138, 0.9)');
        ctx.strokeStyle = stGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(stX - 40, stY - 20);
        ctx.lineTo(stX, stY);
        ctx.stroke();
      }

      // Sea of golden sunset clouds floating far below
      for (let i = 0; i < 16; i++) {
        const bx = ((i * 75 - this.cameraX * 0.5) % (LOGICAL_WIDTH + 160) + LOGICAL_WIDTH + 160) % (LOGICAL_WIDTH + 160) - 80;
        const by = LOGICAL_HEIGHT - 14 + Math.sin(this.time * 2 + i) * 3;
        this.drawSnesCloud(ctx, bx, by);
      }

    } else if (theme === 8) {
      // MUNDO 1-8: GRAN FORTALEZA VOLCÁNICA FINAL
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#090505');
      grad.addColorStop(0.5, '#180404');
      grad.addColorStop(1, '#2c0808');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Dark volcanic fortress battlements & arches
      const offsetX = Math.floor(this.cameraX * 0.22) % 64;
      ctx.strokeStyle = '#2d0f0f';
      ctx.lineWidth = 2;
      for (let r = 1; r < 12; r++) {
        const y = r * 36;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(LOGICAL_WIDTH, y);
        ctx.stroke();
        const rowShift = (r % 2) * 32;
        for (let x = -offsetX + rowShift; x < LOGICAL_WIDTH; x += 64) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 36);
          ctx.stroke();
        }
      }

      // Castle arches & burning iron torches
      for (let i = 0; i < 5; i++) {
        const ax = ((i * 240 - this.cameraX * 0.3) % (LOGICAL_WIDTH + 240) + LOGICAL_WIDTH + 240) % (LOGICAL_WIDTH + 240) - 80;
        ctx.fillStyle = '#180808';
        ctx.fillRect(ax, 90, 64, 150);
        ctx.beginPath();
        ctx.arc(ax + 32, 90, 32, Math.PI, 0);
        ctx.fill();

        // Iron bars in arch
        ctx.fillStyle = '#050202';
        for (let bx = ax + 12; bx < ax + 60; bx += 14) {
          ctx.fillRect(bx, 60, 4, 180);
        }

        // Flickering Iron Wall Torch Sconce
        const tx = ax + 32;
        const ty = 140;
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(tx - 3, ty, 6, 12);
        // Fire Glow
        const tGlow = ctx.createRadialGradient(tx, ty - 6, 2, tx, ty - 6, 28);
        tGlow.addColorStop(0, 'rgba(254, 215, 170, 0.7)');
        tGlow.addColorStop(0.5, 'rgba(239, 68, 68, 0.35)');
        tGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = tGlow;
        ctx.beginPath();
        ctx.arc(tx, ty - 6, 28, 0, Math.PI * 2);
        ctx.fill();
        // Fire tongue
        const fFlicker = Math.sin(this.time * 18 + i) * 3;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(tx, ty - 6, 7, 10 + fFlicker, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(tx, ty - 4, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bubbling Molten Lava Moat at Bottom of Fortress
      const lavaY = 13 * TILE_SIZE - 25;
      const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, LOGICAL_HEIGHT);
      lavaGrad.addColorStop(0, '#f97316');
      lavaGrad.addColorStop(0.3, '#dc2626');
      lavaGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, lavaY, LOGICAL_WIDTH, LOGICAL_HEIGHT - lavaY);

      // Bubbling Lava waves and rising embers
      for (let bx = 0; bx < LOGICAL_WIDTH; bx += 32) {
        const wave = Math.sin(this.time * 5 + bx * 0.1) * 4;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx, lavaY + wave, 24, 3);
      }
      for (let em = 0; em < 12; em++) {
        const ex = ((em * 77 + this.time * 20 - this.cameraX * 0.4) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const ey = lavaY - ((this.time * 50 + em * 25) % 120);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(ex, ey, 2.5, 2.5);
      }

    } else if (theme === 9) {
      // MUNDO 1-S: LA VÍA LÁCTEA ESTELAR (NIVEL SECRETO)
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#030014');
      grad.addColorStop(0.5, '#080220');
      grad.addColorStop(1, '#0c042e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Glowing Multi-Colored Interstellar Nebulas
      const nebulae = [
        { x: 220, y: 150, rad: 160, c1: 'rgba(236, 72, 153, 0.28)', c2: 'rgba(219, 39, 119, 0)' },
        { x: 620, y: 220, rad: 180, c1: 'rgba(6, 182, 212, 0.28)', c2: 'rgba(14, 116, 144, 0)' },
        { x: 440, y: 340, rad: 170, c1: 'rgba(139, 92, 246, 0.25)', c2: 'rgba(109, 40, 217, 0)' }
      ];
      nebulae.forEach(n => {
        const nx = ((n.x - this.cameraX * 0.08) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 150;
        const ng = ctx.createRadialGradient(nx, n.y, 10, nx, n.y, n.rad);
        ng.addColorStop(0, n.c1);
        ng.addColorStop(1, n.c2);
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(nx, n.y, n.rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant Spiral Galaxy
      const galX = ((700 - this.cameraX * 0.05) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 150;
      ctx.save();
      ctx.translate(galX, 120);
      ctx.rotate(this.time * 0.15);
      const galG = ctx.createRadialGradient(0, 0, 2, 0, 0, 48);
      galG.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
      galG.addColorStop(0.4, 'rgba(192, 132, 252, 0.4)');
      galG.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = galG;
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Deep Space Twinkling Starfield
      for (let s = 0; s < 50; s++) {
        const sx = ((s * 43 - this.cameraX * 0.06) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const sy = (s * 23) % (LOGICAL_HEIGHT - 30);
        const col = s % 3 === 0 ? '#38bdf8' : (s % 3 === 1 ? '#f43f5e' : '#facc15');
        const blink = Math.sin(this.time * 5 + s) * 0.4 + 0.6;
        ctx.fillStyle = col;
        ctx.globalAlpha = blink;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.globalAlpha = 1.0;

      // Hyper-speed Cosmic Shooting Stars with Neon Rainbow Trails
      for (let st = 0; st < 3; st++) {
        const stX = ((this.time * 300 + st * 320 - this.cameraX * 0.15) % (LOGICAL_WIDTH + 350) + LOGICAL_WIDTH + 350) % (LOGICAL_WIDTH + 350) - 150;
        const stY = 30 + st * 90;
        const sGrad = ctx.createLinearGradient(stX - 60, stY - 25, stX, stY);
        sGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        sGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.7)');
        sGrad.addColorStop(1, 'rgba(254, 240, 138, 0.95)');
        ctx.strokeStyle = sGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(stX - 60, stY - 25);
        ctx.lineTo(stX, stY);
        ctx.stroke();
      }

    } else if (theme === 10) {
      // MUNDO 2-1: PARQUE COSTERO EN PATINES (Super Mario All-Stars Sunny Coastal Promenade)
      // 1. Rich 16-Bit Cerulean to Horizon Azure Sky
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.35, '#0ea5e9');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(0.88, '#7dd3fc');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // 2. Radiant Sunny 16-Bit Sun with Soft Golden Aura
      const sunX = ((560 - this.cameraX * 0.04) % (LOGICAL_WIDTH + 260) + LOGICAL_WIDTH + 260) % (LOGICAL_WIDTH + 260) - 130;
      const sunY = 95;
      const sGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 52);
      sGlow.addColorStop(0, '#fef08a');
      sGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.45)');
      sGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = sGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 52, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX - 4, sunY - 4, 8, 0, Math.PI * 2);
      ctx.fill();

      // 3. Parallax Layer 1: Distant Tropical Island Hills & Ocean Horizon (Parallax 0.08)
      for (let i = 0; i < 5; i++) {
        const mx = ((i * 260 - this.cameraX * 0.08) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 120;
        // Distant cyan/green island
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.ellipse(mx + 90, 248, 110, 36, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.ellipse(mx + 86, 244, 98, 28, 0, Math.PI, 0);
        ctx.fill();
      }

      // Distant Sparkling Ocean Sea Line
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 248, LOGICAL_WIDTH, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 248, LOGICAL_WIDTH, 2);

      // 4. Parallax Layer 2: Shaded 16-Bit Super Mario All-Stars Clouds (Parallax 0.2)
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 220 - this.cameraX * 0.2) % (LOGICAL_WIDTH + 220) + LOGICAL_WIDTH + 220) % (LOGICAL_WIDTH + 220) - 80;
        const cy = 60 + (i % 3) * 32;
        this.drawSnesCloud(ctx, cx, cy);
      }

      // 5. Parallax Layer 3: Lush Green Tropical Palm Trees (Parallax 0.35)
      for (let i = 0; i < 6; i++) {
        const px = ((i * 210 - this.cameraX * 0.35) % (LOGICAL_WIDTH + 240) + LOGICAL_WIDTH + 240) % (LOGICAL_WIDTH + 240) - 100;
        const py = 13 * TILE_SIZE;

        // Curved brown segmented palm trunk
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + 12, py - 60, px + 18, py - 125);
        ctx.stroke();

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px + 1, py);
        ctx.quadraticCurveTo(px + 13, py - 60, px + 19, py - 125);
        ctx.stroke();

        // Tropical Palm Fronds (Rich 16-bit green)
        const topX = px + 18;
        const topY = py - 125;

        // Golden coconuts
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(topX - 4, topY + 4, 3.5, 0, Math.PI * 2);
        ctx.arc(topX + 4, topY + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 6 lush fronds
        for (let a = 0; a < 6; a++) {
          const ang = (a / 6) * Math.PI * 2;
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.quadraticCurveTo(
            topX + Math.cos(ang) * 26,
            topY + Math.sin(ang) * 18 - 8,
            topX + Math.cos(ang) * 42,
            topY + Math.sin(ang) * 26 + 8
          );
          ctx.stroke();

          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.quadraticCurveTo(
            topX + Math.cos(ang) * 26,
            topY + Math.sin(ang) * 18 - 10,
            topX + Math.cos(ang) * 40,
            topY + Math.sin(ang) * 26 + 6
          );
          ctx.stroke();
        }
      }

    } else if (theme === 11) {
      // MUNDO 2-2: ARRECIFE DE CORAL DE LA SIRENA (Crystal Underwater Ocean & Sunrays)
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.3, '#0891b2');
      grad.addColorStop(0.65, '#0e7490');
      grad.addColorStop(1, '#083344');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Shimmering Godrays filtering from water surface
      for (let r = 0; r < 6; r++) {
        const rx = ((r * 160 + Math.sin(this.time * 0.8 + r) * 30 - this.cameraX * 0.12) % (LOGICAL_WIDTH + 180) + LOGICAL_WIDTH + 180) % (LOGICAL_WIDTH + 180) - 90;
        const rGrad = ctx.createLinearGradient(rx, 0, rx + 60, LOGICAL_HEIGHT);
        rGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        rGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.15)');
        rGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.moveTo(rx - 10, 0);
        ctx.lineTo(rx + 40, 0);
        ctx.lineTo(rx + 90, LOGICAL_HEIGHT);
        ctx.lineTo(rx + 20, LOGICAL_HEIGHT);
        ctx.closePath();
        ctx.fill();
      }

      // Distant Sunken Coral Spires in background
      for (let c = 0; c < 6; c++) {
        const cx = ((c * 210 - this.cameraX * 0.22) % (LOGICAL_WIDTH + 220) + LOGICAL_WIDTH + 220) % (LOGICAL_WIDTH + 220) - 90;
        const ch = 110 + (c % 3) * 35;
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.moveTo(cx, 13 * TILE_SIZE);
        ctx.quadraticCurveTo(cx + 25, 13 * TILE_SIZE - ch, cx + 35, 13 * TILE_SIZE - ch - 20);
        ctx.quadraticCurveTo(cx + 45, 13 * TILE_SIZE - ch, cx + 70, 13 * TILE_SIZE);
        ctx.closePath();
        ctx.fill();
      }

      // Rising luminous ocean bubbles in background
      for (let b = 0; b < 18; b++) {
        const bx = ((b * 55 - this.cameraX * 0.25) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const by = (LOGICAL_HEIGHT - (this.time * 35 + b * 28) % LOGICAL_HEIGHT);
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
        ctx.fillStyle = 'rgba(224, 242, 254, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 3 + (b % 4), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

    } else if (theme === 12) {
      // MUNDO 2-1: VALLE GLACIAL Y BOSQUE NEVADO (SNES Super Mario World Glacial Tundra)
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#031738');
      grad.addColorStop(0.35, '#07335e');
      grad.addColorStop(0.70, '#0284c7');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Shimmering Aurora Borealis ribbons dancing across upper sky
      for (let a = 0; a < 3; a++) {
        const aWave = Math.sin(this.time * 0.8 + a * 1.5) * 22;
        const aGrad = ctx.createLinearGradient(0, 30 + a * 25, 0, 160 + a * 20);
        aGrad.addColorStop(0, a === 0 ? 'rgba(52, 211, 153, 0.45)' : (a === 1 ? 'rgba(34, 211, 238, 0.40)' : 'rgba(168, 85, 247, 0.35)'));
        aGrad.addColorStop(1, 'rgba(3, 23, 56, 0)');
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.moveTo(0, 60 + aWave + a * 20);
        ctx.bezierCurveTo(LOGICAL_WIDTH * 0.3, 25 - aWave, LOGICAL_WIDTH * 0.7, 105 + aWave, LOGICAL_WIDTH, 50 - aWave);
        ctx.lineTo(LOGICAL_WIDTH, 175);
        ctx.lineTo(0, 175);
        ctx.closePath();
        ctx.fill();
      }

      // Parallax Distant Jagged Glacial Peaks
      for (let i = 0; i < 5; i++) {
        const gx = ((i * 260 - this.cameraX * 0.14) % (LOGICAL_WIDTH + 280) + LOGICAL_WIDTH + 280) % (LOGICAL_WIDTH + 280) - 100;
        const gh = 160 + (i % 2) * 45;
        ctx.fillStyle = '#0c4a6e';
        ctx.beginPath();
        ctx.moveTo(gx, 13 * TILE_SIZE);
        ctx.lineTo(gx + 85, 13 * TILE_SIZE - gh);
        ctx.lineTo(gx + 135, 13 * TILE_SIZE - gh * 0.78);
        ctx.lineTo(gx + 200, 13 * TILE_SIZE);
        ctx.closePath();
        ctx.fill();
        // White snow-cap facet
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(gx + 55, 13 * TILE_SIZE - gh * 0.65);
        ctx.lineTo(gx + 85, 13 * TILE_SIZE - gh);
        ctx.lineTo(gx + 115, 13 * TILE_SIZE - gh * 0.75);
        ctx.closePath();
        ctx.fill();
      }

      // Parallax Snow-Covered Fir Trees
      for (let t = 0; t < 8; t++) {
        const tx = ((t * 150 - this.cameraX * 0.35) % (LOGICAL_WIDTH + 180) + LOGICAL_WIDTH + 180) % (LOGICAL_WIDTH + 180) - 70;
        const ty = 13 * TILE_SIZE;
        ctx.fillStyle = '#064e3b';
        for (let tier = 0; tier < 3; tier++) {
          const tw = 28 - tier * 6;
          const th = 24;
          const topTierY = ty - 40 - tier * 20;
          ctx.beginPath();
          ctx.moveTo(tx - tw, topTierY + th);
          ctx.lineTo(tx, topTierY);
          ctx.lineTo(tx + tw, topTierY + th);
          ctx.closePath();
          ctx.fill();
          // Thick puffy snow on branches
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(tx - tw + 3, topTierY + th - 4, tw * 2 - 6, 4);
          ctx.fillStyle = '#064e3b';
        }
      }

      // Drifting Snowflakes in Foreground Parallax
      for (let s = 0; s < 30; s++) {
        const sx = ((s * 42 - this.time * 25 - this.cameraX * 0.22) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const sy = (s * 23 + this.time * 40 + Math.sin(this.time * 2 + s) * 12) % LOGICAL_HEIGHT;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(sx, sy, s % 3 === 0 ? 3 : 2, s % 3 === 0 ? 3 : 2);
      }

    } else if (theme === 13) {
      // MUNDO 2-2: LA MANSIÓN ENCANTADA DE LOS BOOS (Victorian Gothic Manor Interior)
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#06030c');
      grad.addColorStop(0.45, '#170929');
      grad.addColorStop(0.85, '#250d42');
      grad.addColorStop(1, '#0c0317');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Gothic Damask Fleur-de-lis wallpaper pattern repeat
      ctx.fillStyle = 'rgba(168, 85, 247, 0.06)';
      for (let dy = 20; dy < 320; dy += 36) {
        for (let dx = 0; dx < LOGICAL_WIDTH; dx += 48) {
          const px = ((dx - this.cameraX * 0.15) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
          ctx.fillRect(px + 4, dy, 4, 8);
          ctx.fillRect(px, dy + 4, 12, 3);
        }
      }

      // Dark Walnut Wainscoting Paneling along lower wall
      ctx.fillStyle = '#1c0926';
      ctx.fillRect(0, 310, LOGICAL_WIDTH, 170);
      ctx.fillStyle = '#3b124d';
      ctx.fillRect(0, 308, LOGICAL_WIDTH, 4);
      for (let wx = 0; wx < LOGICAL_WIDTH; wx += 60) {
        const panelX = ((wx - this.cameraX * 0.25) % (LOGICAL_WIDTH + 60) + LOGICAL_WIDTH + 60) % (LOGICAL_WIDTH + 60) - 30;
        ctx.strokeStyle = '#280c38';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, 320, 52, 95);
      }

      // Grand Gothic Arched Windows with Full Moon & Volumetric Moonlight Shafts
      for (let w = 0; w < 4; w++) {
        const wx = ((w * 270 - this.cameraX * 0.22) % (LOGICAL_WIDTH + 260) + LOGICAL_WIDTH + 260) % (LOGICAL_WIDTH + 260) - 80;
        const wy = 65;

        // Window exterior aperture
        ctx.fillStyle = '#0f0521';
        ctx.fillRect(wx, wy, 64, 130);
        ctx.beginPath();
        ctx.arc(wx + 32, wy, 32, Math.PI, 0);
        ctx.fill();

        // Moonlight sky view
        ctx.fillStyle = '#312e81';
        ctx.fillRect(wx + 4, wy + 4, 56, 122);
        ctx.beginPath();
        ctx.arc(wx + 32, wy, 28, Math.PI, 0);
        ctx.fill();

        // Eerie pale full moon visible through window
        if (w === 1) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(wx + 32, wy + 22, 18, 0, Math.PI * 2);
          ctx.fill();
          // Moon craters
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(wx + 26, wy + 18, 4, 0, Math.PI * 2);
          ctx.arc(wx + 38, wy + 26, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Stone tracery & crossbars
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(wx + 32, wy - 28);
        ctx.lineTo(wx + 32, wy + 126);
        ctx.moveTo(wx + 4, wy + 60);
        ctx.lineTo(wx + 60, wy + 60);
        ctx.stroke();

        // Diagonal Volumetric Moonlight Rays streaming down from window
        const beamGrad = ctx.createLinearGradient(wx + 32, wy, wx - 60, wy + 260);
        beamGrad.addColorStop(0, 'rgba(199, 210, 254, 0.16)');
        beamGrad.addColorStop(1, 'rgba(199, 210, 254, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(wx + 8, wy + 20);
        ctx.lineTo(wx + 56, wy + 20);
        ctx.lineTo(wx + 10, wy + 280);
        ctx.lineTo(wx - 80, wy + 280);
        ctx.closePath();
        ctx.fill();
      }

      // Hanging Wrought-Iron Candelabras with Flickering Candlelight
      for (let c = 0; c < 3; c++) {
        const cx = ((c * 340 + 120 - this.cameraX * 0.3) % (LOGICAL_WIDTH + 300) + LOGICAL_WIDTH + 300) % (LOGICAL_WIDTH + 300) - 100;
        // Iron chain from ceiling
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, 75);
        ctx.stroke();
        // Candelabra frame
        ctx.fillStyle = '#0f0521';
        ctx.fillRect(cx - 24, 75, 48, 5);
        ctx.fillRect(cx - 2, 70, 4, 12);

        // 3 Candles with flickering flames
        [-18, 0, 18].forEach((cOff, idx) => {
          const candX = cx + cOff;
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(candX - 2, 63, 4, 12);
          // Flame glow halo
          ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
          ctx.beginPath();
          ctx.arc(candX, 58, 12, 0, Math.PI * 2);
          ctx.fill();
          // Animated flame
          const fOff = Math.sin(this.time * 14 + idx * 3) * 1.5;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(candX - 2.5, 62);
          ctx.lineTo(candX + 2.5, 62);
          ctx.lineTo(candX + fOff, 53);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(candX - 1, 58, 2, 3);
        });
      }

      // Spooky Framed Victorian Portraits on wall (eyes follow or blink!)
      for (let p = 0; p < 2; p++) {
        const px = ((p * 450 + 200 - this.cameraX * 0.28) % (LOGICAL_WIDTH + 350) + LOGICAL_WIDTH + 350) % (LOGICAL_WIDTH + 350) - 120;
        const py = 150;
        // Gilded frame
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px - 18, py - 22, 36, 44);
        ctx.fillStyle = '#0f0521';
        ctx.fillRect(px - 14, py - 18, 28, 36);
        // Portrait spooky figure silhouette
        ctx.fillStyle = '#31104d';
        ctx.beginPath();
        ctx.arc(px, py - 4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(px - 10, py + 4, 20, 14);
        // Eerie glowing eyes
        const blink = Math.floor(this.time * 2.5 + p) % 5 === 0;
        if (!blink) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(px - 4, py - 5, 2, 2);
          ctx.fillRect(px + 2, py - 5, 2, 2);
        }
      }

      // Multi-layer rolling ground fog crawling along the bottom
      const mistY = 13 * TILE_SIZE - 20;
      for (let m = 0; m < 6; m++) {
        const mx = ((m * 180 + Math.sin(this.time * 2 + m) * 30 - this.cameraX * 0.45) % (LOGICAL_WIDTH + 200) + LOGICAL_WIDTH + 200) % (LOGICAL_WIDTH + 200) - 90;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.26)';
        ctx.beginPath();
        ctx.ellipse(mx + 60, mistY, 90, 28, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating Will-o'-the-wisps (soft spectral orbs)
      for (let oi = 0; oi < 5; oi++) {
        const ox = ((oi * 210 + Math.cos(this.time * 1.5 + oi) * 20 - this.cameraX * 0.2) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const oy = 110 + Math.sin(this.time * 2 + oi * 1.7) * 35;
        ctx.fillStyle = 'rgba(192, 132, 252, 0.45)';
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox - 1.5, oy - 1.5, 3, 3);
      }

    } else if (theme === 14) {
      // MUNDO 2-3: FORTALEZA GLACIAL DEL REY ESCARCHA (Frost Fortress Obsidian Citadel)
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#01040f');
      grad.addColorStop(0.35, '#07162c');
      grad.addColorStop(0.70, '#082f49');
      grad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Huge Ice Stalactites hanging from fortress ceiling
      for (let i = 0; i < 14; i++) {
        const sx = ((i * 85 - this.cameraX * 0.18) % (LOGICAL_WIDTH + 140) + LOGICAL_WIDTH + 140) % (LOGICAL_WIDTH + 140) - 50;
        const sh = 48 + (i % 3) * 38;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 15, sh);
        ctx.lineTo(sx + 30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 13, 2, 4, sh - 8);
      }

      // Glowing Cyan Frost Fortress Pillars with Blue Spirit Flame Torches
      for (let p = 0; p < 5; p++) {
        const px = ((p * 240 - this.cameraX * 0.3) % (LOGICAL_WIDTH + 240) + LOGICAL_WIDTH + 240) % (LOGICAL_WIDTH + 240) - 70;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px, 35, 54, 13 * TILE_SIZE);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, 35, 54, 13 * TILE_SIZE);

        // Frost Rune glowing band
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + 4, 120, 46, 8);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(px + 10, 122, 34, 4);

        // Wall torch sconce with Cyan Spirit Fire
        ctx.fillStyle = '#475569';
        ctx.fillRect(px + 23, 175, 8, 16);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(px + 27, 168, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        const fFlicker = Math.sin(this.time * 16 + p) * 2;
        ctx.beginPath();
        ctx.moveTo(px + 22, 175);
        ctx.lineTo(px + 32, 175);
        ctx.lineTo(px + 27 + fFlicker, 160);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 26, 168, 2, 4);
      }

      // Frost Blizzard Wind particles drifting across hall
      for (let f = 0; f < 30; f++) {
        const fx = ((f * 38 - this.time * 95 - this.cameraX * 0.48) % LOGICAL_WIDTH + LOGICAL_WIDTH) % LOGICAL_WIDTH;
        const fy = (f * 18 + Math.sin(this.time * 4 + f) * 16) % LOGICAL_HEIGHT;
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(fx, fy, 2.5, 2.5);
      }

    } else {
      // Fallback
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }
  }

  drawSnesCloud(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#93c5fd';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 4, 18, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + 22, y - 4, 22, Math.PI, Math.PI * 2);
    ctx.arc(x + 46, y + 4, 18, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 2, y + 1, 15, Math.PI * 0.6, Math.PI * 1.6);
    ctx.arc(x + 22, y - 6, 19, Math.PI * 0.9, Math.PI * 2.1);
    ctx.arc(x + 43, y + 1, 14, Math.PI * 1.4, Math.PI * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawSnesBush(ctx, x, groundY) {
    ctx.save();
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(x, groundY - 12, 14, Math.PI * 0.6, Math.PI * 1.8);
    ctx.arc(x + 18, groundY - 18, 17, Math.PI * 0.8, Math.PI * 2.2);
    ctx.arc(x + 36, groundY - 12, 14, Math.PI * 1.2, Math.PI * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(x + 16, groundY - 21, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSnesPalmTree(ctx, x, groundY, scale = 1.0, tilt = 1, isSilhouette = false) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);

    const trunkH = 120;
    const curve = tilt * 30;

    // Curved trunk
    ctx.strokeStyle = isSilhouette ? '#1e1b4b' : '#3e1a06';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(curve * 0.35, -trunkH * 0.5, curve, -trunkH);
    ctx.stroke();

    if (!isSilhouette) {
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(curve * 0.35, -trunkH * 0.5, curve, -trunkH);
      ctx.stroke();

      // Trunk segment rings
      ctx.fillStyle = '#451a03';
      for (let i = 1; i <= 6; i++) {
        const t = i / 7;
        const tx = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * (curve * 0.35) + t * t * curve;
        const ty = -trunkH * t;
        ctx.fillRect(tx - 4, ty - 2, 8, 3);
      }

      // Coconuts
      ctx.fillStyle = '#3e1a06';
      ctx.beginPath();
      ctx.arc(curve - 4, -trunkH + 4, 5, 0, Math.PI * 2);
      ctx.arc(curve + 4, -trunkH + 4, 5, 0, Math.PI * 2);
      ctx.arc(curve, -trunkH + 7, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Palm fronds (leaves)
    const topX = curve;
    const topY = -trunkH;
    const wind = Math.sin(this.time * 2.5 + x * 0.05) * 5;

    const leaves = [
      { angle: -155, length: 54, drop: 22, color: isSilhouette ? '#1e1b4b' : '#14532d' },
      { angle: -125, length: 62, drop: 28, color: isSilhouette ? '#2e1065' : '#166534' },
      { angle: -85,  length: 66, drop: 30, color: isSilhouette ? '#3b0764' : '#15803d' },
      { angle: -45,  length: 62, drop: 26, color: isSilhouette ? '#2e1065' : '#166534' },
      { angle: -15,  length: 52, drop: 20, color: isSilhouette ? '#1e1b4b' : '#14532d' }
    ];

    leaves.forEach(leaf => {
      const rad = (leaf.angle * Math.PI) / 180;
      const ex = topX + Math.cos(rad) * leaf.length + wind;
      const ey = topY + Math.sin(rad) * leaf.length * 0.5 + leaf.drop;
      const cpx = topX + Math.cos(rad) * (leaf.length * 0.6);
      const cpy = topY + Math.sin(rad) * (leaf.length * 0.3) - 12;

      ctx.strokeStyle = leaf.color;
      ctx.lineWidth = isSilhouette ? 4 : 5;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);
      ctx.stroke();

      ctx.lineWidth = 2;
      for (let s = 0.2; s <= 0.95; s += 0.15) {
        const lx = (1 - s) * (1 - s) * topX + 2 * (1 - s) * s * cpx + s * s * ex;
        const ly = (1 - s) * (1 - s) * topY + 2 * (1 - s) * s * cpy + s * s * ey;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 7, ly + 8);
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 7, ly + 8);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  drawSnesSeagull(ctx, x, y, wingPhase) {
    ctx.save();
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const flap = Math.sin(wingPhase) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + flap);
    ctx.quadraticCurveTo(x - 5, y - 4, x, y);
    ctx.quadraticCurveTo(x + 5, y - 4, x + 10, y + flap);
    ctx.stroke();
    ctx.restore();
  }

  renderCastleLava(ctx, startCol, endCol) {
    for (let c = startCol; c <= endCol; c++) {
      if (this.level.grid[13][c] === '.') {
        const lx = c * TILE_SIZE;
        const ly = 13 * TILE_SIZE + 8;
        const wave = Math.sin(this.time * 5 + c) * 3;
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(lx, ly + wave, TILE_SIZE, 64);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(lx, ly + wave, TILE_SIZE, 12);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(lx + 4, ly + wave, TILE_SIZE - 8, 4);
      }
    }
  }

  renderCheckpointFlag(ctx, x, groundY) {
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(x + 12, groundY - 88, 5, 88);
    ctx.strokeRect(x + 12, groundY - 88, 5, 88);

    const flagY = this.checkpointReached ? groundY - 84 : groundY - 38;
    ctx.fillStyle = this.checkpointReached ? '#ef4444' : '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(x + 17, flagY);
    ctx.lineTo(x + 56, flagY + 15);
    ctx.lineTo(x + 17, flagY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('★', x + 23, flagY + 19);
  }

  renderGoalAndCastle(ctx) {
    const fx = this.level.flagX;
    const groundY = 13 * TILE_SIZE;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(fx - 6, groundY - 16, 20, 16);
    ctx.strokeRect(fx - 6, groundY - 16, 20, 16);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(fx + 1, 3 * TILE_SIZE, 6, 10 * TILE_SIZE - 16);
    ctx.strokeRect(fx + 1, 3 * TILE_SIZE, 6, 10 * TILE_SIZE - 16);

    window.spriteRenderer.drawStarShape(ctx, fx + 4, 3 * TILE_SIZE - 4, 5, 13, 6, '#facc15', '#0f172a');

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(fx + 7, this.flagSlideY);
    ctx.lineTo(fx + 62, this.flagSlideY + 18);
    ctx.lineTo(fx + 7, this.flagSlideY + 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('ÁMBAR', fx + 10, this.flagSlideY + 22);

    const cx = this.level.castleX;
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(cx, groundY - 115, 114, 115);
    ctx.strokeRect(cx, groundY - 115, 114, 115);

    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 1.5;
    for (let by = groundY - 100; by < groundY; by += 16) {
      ctx.beginPath();
      ctx.moveTo(cx, by);
      ctx.lineTo(cx + 114, by);
      ctx.stroke();
    }

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx + 20, groundY - 160, 74, 45);
    ctx.strokeRect(cx + 20, groundY - 160, 74, 45);

    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(cx + i * 24, groundY - 127, 16, 12);
      ctx.strokeRect(cx + i * 24, groundY - 127, 16, 12);
    }

    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(cx + 14, groundY - 160);
    ctx.lineTo(cx + 57, groundY - 210);
    ctx.lineTo(cx + 100, groundY - 160);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx + 57, groundY - 28, 22, Math.PI, 0);
    ctx.lineTo(cx + 79, groundY);
    ctx.lineTo(cx + 35, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
    window.spriteRenderer.roundRect(ctx, 10, 8, LOGICAL_WIDTH - 20, 54, 8);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    window.spriteRenderer.drawAmbarPortrait(ctx, 18, 10, 50);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#fde047';
    ctx.fillText('ÁMBAR', 76, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`♥×${this.lives}`, 76, 48);

    const outfitLabels = [
      'CHIQUITA (JARDINERO)',
      'SUPER ÁMBAR (BUZO+LENTES) ★',
      '🌈 ARCOÍRIS: HAZ DE LUZ (X)'
    ];
    const outfitColors = ['#93c5fd', '#f472b6', '#fde047'];
    ctx.fillStyle = this.player.isFlying
      ? '#fde047'
      : this.player.onBike
        ? '#4ade80'
        : (outfitColors[this.player.powerState] || '#fff');
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(
      this.player.isFlying
        ? '🦸‍♀️ ¡SÚPER VUELO + HAZ DE LUZ (X)!'
        : this.player.onBike
          ? '🚲 ¡EN BICICLETA TURBO!'
          : outfitLabels[this.player.powerState],
      172,
      27
    );

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Salto + Salto Doble (Espacio)', 172, 47);

    // Star Coins Tracker in HUD
    ctx.textAlign = 'center';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText('ESTRELLAS', LOGICAL_WIDTH - 280, 26);
    const starCoins = this.starCoins || [];
    for (let i = 0; i < 3; i++) {
      const isCol = starCoins[i] && starCoins[i].collected;
      ctx.fillStyle = isCol ? '#fde047' : '#475569';
      ctx.font = '13px monospace';
      ctx.fillText(isCol ? '★' : '☆', LOGICAL_WIDTH - 298 + i * 18, 47);
    }

    ctx.textAlign = 'right';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`MONEDAS:${String(this.coinsCount).padStart(2, '0')}`, LOGICAL_WIDTH - 175, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`MUNDO 1-${this.currentLevelIdx + 1}`, LOGICAL_WIDTH - 175, 48);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('PUNTOS', LOGICAL_WIDTH - 24, 28);
    ctx.fillStyle = '#fde047';
    ctx.fillText(String(this.score).padStart(6, '0'), LOGICAL_WIDTH - 24, 48);
    ctx.restore();
  }

  renderTitleScreen(ctx) {
    this.renderBackground(ctx);

    for (let c = 0; c < 28; c++) {
      window.spriteRenderer.drawTile(ctx, '#', c * TILE_SIZE, 13 * TILE_SIZE, TILE_SIZE, this.time, 1);
      window.spriteRenderer.drawTile(ctx, '#', c * TILE_SIZE, 14 * TILE_SIZE, TILE_SIZE, this.time, 1);
    }

    window.spriteRenderer.drawPlatform(ctx, {
      x: 80 + Math.sin(this.time * 1.4) * 45,
      y: 12 * TILE_SIZE - 6,
      w: 112,
      h: 22,
      vx: Math.cos(this.time * 1.4),
      style: 'train'
    }, this.time);

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    window.spriteRenderer.roundRect(ctx, 95, 30, LOGICAL_WIDTH - 190, 344, 12);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    window.spriteRenderer.roundRect(ctx, 103, 38, LOGICAL_WIDTH - 206, 328, 8);
    ctx.stroke();

    window.spriteRenderer.drawAmbarPortrait(ctx, LOGICAL_WIDTH / 2 - 46, 48, 92);

    // Showcase Small Ámbar (left) vs Super Ámbar / Bicycle (right)!
    window.spriteRenderer.drawAmbar(ctx, {
      x: 185,
      y: 94,
      w: 24,
      h: 36,
      displayHeight: 52,
      vx: 1.5,
      vy: 0,
      facing: 1,
      onGround: true,
      powerState: 0,
      invulnerableTimer: 0,
      starTimer: 0,
      shootAnimTimer: 0
    }, this.time);

    window.spriteRenderer.drawAmbar(ctx, {
      x: LOGICAL_WIDTH - 240,
      y: 74,
      w: 42,
      h: 56,
      displayHeight: 74,
      onBike: Math.floor(this.time * 0.5) % 2 === 1,
      vx: 2.2,
      vy: 0,
      facing: -1,
      onGround: true,
      powerState: 2,
      invulnerableTimer: 0,
      starTimer: 0,
      shootAnimTimer: 0
    }, this.time);

    ctx.textAlign = 'center';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('Chiquita (Sin Hongo)', 198, 146);
    ctx.fillStyle = '#f472b6';
    ctx.fillText('Super Ámbar / 🚲 Bici', LOGICAL_WIDTH - 218, 146);

    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillStyle = '#000000';
    ctx.fillText('SUPER ÁMBAR ALL-STARS', LOGICAL_WIDTH / 2 + 3, 182);
    ctx.fillStyle = '#fde047';
    ctx.fillText('SUPER ÁMBAR ALL-STARS', LOGICAL_WIDTH / 2, 179);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('★ 7 MUNDOS 16-BIT + CICLOVÍA EN BICICLETA ★', LOGICAL_WIDTH / 2, 209);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('• ¡Toma el Super Hongo para crecer y usar tu Buzo y Lentes!', LOGICAL_WIDTH / 2, 242);
    ctx.fillText('• ¡En el Mundo 1-4 recorre la pista andando en Bicicleta!', LOGICAL_WIDTH / 2, 264);
    ctx.fillText('• 7 Niveles: Pradera, Trencitos, Castillo, Bici, Cueva, Cielo y Final', LOGICAL_WIDTH / 2, 286);

    if (Math.floor(this.time * 2.5) % 2 === 0) {
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.fillText('► PRESIONA ENTER, ESPACIO O CLIC PARA JUGAR ◄', LOGICAL_WIDTH / 2, 336);
    }
    ctx.restore();
  }

  renderLevelIntroScreen(ctx) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText(this.level.name, LOGICAL_WIDTH / 2, 145);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(this.level.subtitle, LOGICAL_WIDTH / 2, 182);

    window.spriteRenderer.drawAmbarPortrait(ctx, LOGICAL_WIDTH / 2 - 58, 215, 70);

    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`×  ${this.lives}`, LOGICAL_WIDTH / 2 + 42, 258);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('¡VAMOS ÁMBAR! (Recuerda: tienes Salto Doble)', LOGICAL_WIDTH / 2, 340);
    ctx.textAlign = 'left';
  }

  renderVictoryOverlay(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    window.spriteRenderer.roundRect(ctx, 80, 60, LOGICAL_WIDTH - 160, 360, 14);
    ctx.fill();
    ctx.strokeStyle = this.currentLevelIdx === 11 ? '#38bdf8' : '#fbbf24';
    ctx.lineWidth = 4;
    ctx.stroke();

    window.spriteRenderer.drawAmbarPortrait(ctx, LOGICAL_WIDTH / 2 - 44, 75, 88);

    ctx.textAlign = 'center';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = '#fde047';
    if (this.currentLevelIdx === 11) {
      ctx.fillText('¡REINA DEL REINO ESCARCHA!', LOGICAL_WIDTH / 2, 192);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText('¡Derrotaste al Rey Escarcha en su Fortaleza Glacial!', LOGICAL_WIDTH / 2, 226);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillText('¡Ámbar conquistó la Nieve, la Mansión de los Boos y el Trono Helado!', LOGICAL_WIDTH / 2, 248);
    } else {
      ctx.fillText('¡FELICITACIONES ÁMBAR!', LOGICAL_WIDTH / 2, 192);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('¡Completaste la Isla Ámbar del Mundo 1!', LOGICAL_WIDTH / 2, 226);
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText('¡Ahora se ha abierto el MUNDO 2 GLACIAL Y LA MANSIÓN ENCANTADA!', LOGICAL_WIDTH / 2, 248);
    }

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`PUNTAJE FINAL: ${this.score}   •   MONEDAS: ${this.coinsCount}`, LOGICAL_WIDTH / 2, 290);

    if (Math.floor(this.time * 2.5) % 2 === 0) {
      ctx.fillStyle = '#4ade80';
      ctx.font = '11px "Press Start 2P", monospace';
      const promptText = this.currentLevelIdx === 7 ? '► PRESIONA ENTER PARA IR AL MUNDO 2 ◄' : '► PRESIONA ENTER O CLIC PARA CONTINUAR ◄';
      ctx.fillText(promptText, LOGICAL_WIDTH / 2, 355);
    }
    ctx.restore();
  }

  renderGameOverOverlay(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    window.spriteRenderer.roundRect(ctx, 160, 110, LOGICAL_WIDTH - 320, 260, 12);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.fillStyle = '#f87171';
    ctx.fillText('¡A NO RENDIRSE, ÁMBAR!', LOGICAL_WIDTH / 2, 175);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('¡Puedes continuar desde este mismo mundo!', LOGICAL_WIDTH / 2, 225);

    ctx.fillStyle = '#fde047';
    ctx.fillText('PRESIONA ENTER O HAZ CLIC PARA CONTINUAR', LOGICAL_WIDTH / 2, 285);
    ctx.restore();
  }

  // ==========================================================================
  // OVERWORLD WORLD MAP RENDERING (16-BIT SUPER MARIO WORLD RETRO MAP)
  // ==========================================================================
  renderOverworldMap(ctx) {
    const t = this.time;

    if (this.currentWorld === 2) {
      this.renderWorld2Map(ctx, t);
    } else {
      this.renderWorld1Map(ctx, t);
    }

    // Render All Map Nodes
    this.mapNodes.forEach((node, i) => {
      this.renderMapNode(ctx, node, i === this.currentMapNodeId, t);
    });

    // Mini Ámbar Avatar on Map
    window.spriteRenderer.drawMiniAmbarMap(
      ctx,
      this.mapAmbar.x,
      this.mapAmbar.y - 6,
      this.mapAmbar.facing,
      this.mapAmbar.walkFrame
    );

    // Particles on map (secret path sparkles / ambient)
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    });

    // Top SNES HUD Banner
    this.renderMapTopHeader(ctx);

    // Bottom Level Info & Action Card
    this.renderMapBottomCard(ctx);
  }

  drawMapSteppingStones(ctx, x1, y1, x2, y2, isUnlocked, style = 'world1', t = 0) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const count = Math.max(5, Math.floor(dist / 14));
    for (let i = 1; i < count; i++) {
      const frac = i / count;
      const sx = x1 + (x2 - x1) * frac;
      const sy = y1 + (y2 - y1) * frac;

      if (!isUnlocked) {
        // Locked / unrevealed dashed silhouette
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(Math.round(sx - 3), Math.round(sy - 3), 6, 6);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(sx - 3), Math.round(sy - 3), 6, 6);
      } else if (style === 'world2') {
        // Crystalline ice stepping stones with 16-bit shine
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(Math.round(sx - 4), Math.round(sy - 3), 8, 8);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(Math.round(sx - 3), Math.round(sy - 4), 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(sx - 2), Math.round(sy - 3), 2, 2);
      } else {
        // Authentic SMW Golden Cobblestone Stepping Stones
        ctx.fillStyle = '#78350f';
        ctx.fillRect(Math.round(sx - 4), Math.round(sy - 3), 8, 8);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(Math.round(sx - 3), Math.round(sy - 4), 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(sx - 2), Math.round(sy - 3), 2, 2);
      }
    }
  }

  renderWorld1Map(ctx, t) {
    // 1. Layered 16-Bit Super Mario World Ocean
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    oceanGrad.addColorStop(0, '#0284c7');
    oceanGrad.addColorStop(0.5, '#0369a1');
    oceanGrad.addColorStop(1, '#075985');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Animated wave crests across ocean
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let row = 0; row < 16; row++) {
      const wy = row * 30 + 10;
      const speed = (row % 2 === 0 ? 1 : -1) * 16;
      const offX = ((t * speed) % 80 + 80) % 80;
      for (let wx = -40 + offX; wx < LOGICAL_WIDTH + 40; wx += 80) {
        ctx.fillRect(wx, wy, 16, 2);
        ctx.fillRect(wx + 4, wy + 2, 8, 1);
      }
    }

    // Ocean Wildlife: Animated Leaping Cheep-Cheep
    const leapCycle = (t * 0.65) % 4.0;
    if (leapCycle < 1.3) {
      const p = leapCycle / 1.3;
      const kx = 105 + p * 40;
      const ky = 430 - Math.sin(p * Math.PI) * 45;
      const ang = (p - 0.5) * 1.2;
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(ang);
      // Cheep-cheep body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-8, -3, 3, 6); // Tail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3, -2, 3, 0, Math.PI * 2); // Eye
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -3, 2, 2);
      ctx.restore();
      // Water splash rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(105, 430, 8 * p, 3 * p, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Mini Swimming Cheep-Cheep in southeast waters
    const swimX = 640 + Math.sin(t * 1.2) * 15;
    const swimY = 390 + Math.cos(t * 1.5) * 4;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(swimX, swimY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(swimX - 7, swimY - 2, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(swimX + 2, swimY - 2, 2, 2);

    // Cute Super Mario World Mini Wooden Sailboat
    const boatX = 190 + Math.sin(t * 0.8) * 6;
    const boatY = 422 + Math.cos(t * 1.1) * 3;
    const boatTilt = Math.sin(t * 1.5) * 0.08;
    ctx.save();
    ctx.translate(boatX, boatY);
    ctx.rotate(boatTilt);
    // Wooden hull
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.lineTo(8, 7);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-10, 1, 20, 2);
    // Mast
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-1, -14, 2, 14);
    // White Sail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(1, -13);
    ctx.lineTo(10, -2);
    ctx.lineTo(1, -2);
    ctx.closePath();
    ctx.fill();
    // Tiny red pennant flag
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-4, -14, 4, 3);
    ctx.restore();

    // =========================================================================
    // 2. THE MAIN OVERWORLD ISLAND ("ISLA REINO ÁMBAR") - 3D STEPPED CLIFFS
    // =========================================================================
    // Coastal Shore Foam Fringe (animated lapping surf)
    const foamPulse = Math.sin(t * 2.5) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.beginPath();
    ctx.ellipse(390, 268 + foamPulse * 0.3, 332 + foamPulse, 168 + foamPulse * 0.6, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // 3D Cliff Escarpment (Stepped drop beneath the island)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(390, 276, 320, 160, -0.05, 0, Math.PI * 2);
    ctx.fill();
    // Layered sedimentary cliff face
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(390, 270, 316, 156, -0.05, 0, Math.PI * 2);
    ctx.fill();
    // Vertical rock striations on cliff drop
    ctx.fillStyle = '#5c2c08';
    for (let cx = 140; cx <= 640; cx += 16) {
      const cy = 260 + Math.sin((cx - 390) / 320 * Math.PI) * 140;
      if (cy > 240) {
        ctx.fillRect(cx, cy, 3, 16);
      }
    }

    // Golden Beach Shoreline
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(390, 260, 312, 152, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Primary Grassy Mesa Plateau (Lush SMW Green)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(390, 258, 286, 134, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(390, 256, 274, 126, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Elevated Grassy Ridge (North-Central Plateau)
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(400, 215, 175, 75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(400, 211, 168, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit Lime Border Highlight along grass rims
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(390, 254, 270, 122, -0.05, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();

    // Animated Cartoon Smiling Hills with Blinking Eyes (Super Mario World signature!)
    const drawSmilingHill = (hx, hy, hr, hCol, eyeBlinkOffset) => {
      // Hill base with 16-bit left highlight & right shadow
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(hx, hy, hr, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = hCol;
      ctx.beginPath();
      ctx.arc(hx - 2, hy - 1, hr - 2, Math.PI * 0.95, Math.PI * 1.9);
      ctx.fill();

      // Blinking Cartoon Eyes (SMW dinosaur land hills blink every ~3.5s!)
      const blinkTimer = (Math.floor(t * 10) + eyeBlinkOffset) % 36;
      const isBlinking = blinkTimer >= 33;

      if (isBlinking) {
        // Closed horizontal eyelid slits
        ctx.fillStyle = '#14532d';
        ctx.fillRect(hx - 6, hy - hr * 0.5, 4, 2);
        ctx.fillRect(hx + 2, hy - hr * 0.5, 4, 2);
      } else {
        // Big cute open SMW pill eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - 6, hy - hr * 0.55, 4, 8);
        ctx.fillRect(hx + 2, hy - hr * 0.55, 4, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(hx - 5, hy - hr * 0.5, 2, 5);
        ctx.fillRect(hx + 3, hy - hr * 0.5, 2, 5);
        // Specular eye shine
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - 6, hy - hr * 0.55, 1, 2);
        ctx.fillRect(hx + 2, hy - hr * 0.55, 1, 2);
      }
    };

    drawSmilingHill(180, 310, 26, '#4ade80', 0);
    drawSmilingHill(300, 265, 34, '#86efac', 12);
    drawSmilingHill(480, 235, 28, '#4ade80', 24);

    // Mini 16-Bit SMW Round Trees on Meadows
    const drawSmwTree = (tx, ty) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 2, ty - 8, 4, 8); // Trunk
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tx, ty - 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(tx - 1, ty - 13, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.fillRect(tx - 4, ty - 16, 4, 2);
    };
    drawSmwTree(150, 325);
    drawSmwTree(210, 290);
    drawSmwTree(330, 245);
    drawSmwTree(450, 220);
    drawSmwTree(510, 210);

    // 16-Bit Yellow Flowers Clumps
    const drawFlower = (fx, fy) => {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(fx, fy, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 1, fy - 1, 1, 1);
      ctx.fillRect(fx - 1, fy + 1, 1, 1);
      ctx.fillRect(fx + 3, fy + 1, 1, 1);
      ctx.fillRect(fx + 1, fy + 3, 1, 1);
    };
    drawFlower(170, 335);
    drawFlower(225, 305);
    drawFlower(310, 280);
    drawFlower(465, 230);

    // 1-3 Sweet Candy Fortress Landmark (North of Node 2: x: 350, y: 270)
    const cfX = 350;
    const cfY = 246;
    ctx.fillStyle = '#78350f'; // Chocolate walls
    ctx.fillRect(cfX - 16, cfY - 12, 32, 16);
    ctx.fillStyle = '#f43f5e'; // Strawberry roof
    ctx.beginPath();
    ctx.moveTo(cfX - 18, cfY - 12);
    ctx.lineTo(cfX, cfY - 24);
    ctx.lineTo(cfX + 18, cfY - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fde047'; // Golden flag
    ctx.fillRect(cfX - 1, cfY - 32, 2, 8);
    ctx.beginPath();
    ctx.moveTo(cfX + 1, cfY - 32);
    ctx.lineTo(cfX + 9, cfY - 28);
    ctx.lineTo(cfX + 1, cfY - 24);
    ctx.closePath();
    ctx.fill();

    // =========================================================================
    // THEMED ISLAND REGIONS & LANDMARKS
    // =========================================================================
    // 1-4 Tropical Beach (South-Center, Node 3: x: 440, y: 360)
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(440, 360, 72, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Curved Coconut Palm Trees on South Beach
    const drawPalmTree = (px, py, lean) => {
      ctx.save();
      ctx.translate(px, py);
      // Trunk
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(lean * 8, -12, lean * 14, -22);
      ctx.stroke();
      // Trunk segments
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lean * 4, -6);
      ctx.lineTo(lean * 5, -8);
      ctx.moveTo(lean * 8, -12);
      ctx.lineTo(lean * 9, -14);
      ctx.stroke();
      // Fronds
      const tx = lean * 14;
      const ty = -22;
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tx - 10, ty + 2, 7, 0, Math.PI * 2);
      ctx.arc(tx + 10, ty + 2, 7, 0, Math.PI * 2);
      ctx.arc(tx, ty - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(tx - 7, ty, 6, 0, Math.PI * 2);
      ctx.arc(tx + 7, ty, 6, 0, Math.PI * 2);
      ctx.arc(tx, ty - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      // Coconuts
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 3, ty - 2, 3, 3);
      ctx.fillRect(tx + 1, ty - 2, 3, 3);
      ctx.restore();
    };
    drawPalmTree(400, 365, -1);
    drawPalmTree(485, 360, 1);

    // 1-5 Purple Amethyst Cavern Mountain (East, Node 4: x: 550, y: 320)
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.ellipse(550, 320, 62, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.ellipse(550, 318, 50, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    // Faceted amethyst crystal clusters
    const drawCrystal = (cx, cy, ch, col) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - 5, cy - ch * 0.7);
      ctx.lineTo(cx, cy - ch);
      ctx.lineTo(cx + 5, cy - ch * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fae8ff';
      ctx.fillRect(cx - 1, cy - ch + 2, 2, 4);
    };
    drawCrystal(525, 315, 16, '#c084fc');
    drawCrystal(575, 312, 18, '#a855f7');
    drawCrystal(550, 305, 14, '#e9d5ff');
    // Dark Cavern entrance arch
    ctx.fillStyle = '#0f051d';
    ctx.beginPath();
    ctx.arc(550, 332, 10, Math.PI, 0);
    ctx.fill();

    // 1-8 Bowser's Volcanic Basalt Caldera (North, Node 7: x: 370, y: 120)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(370, 128, 105, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(370, 124, 90, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    // Molten lava pool & bubbling fissures
    const lavaPulse = Math.sin(t * 4) * 2;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(370, 126, 38 + lavaPulse, 16 + lavaPulse * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(370, 126, 28, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(366, 124, 8, 4);
    // Smoke puffs rising from volcano
    for (let sm = 0; sm < 3; sm++) {
      const smT = (t * 0.8 + sm * 0.9) % 2.5;
      const smX = 370 + Math.sin(smT * 2 + sm) * 8;
      const smY = 115 - smT * 18;
      ctx.fillStyle = `rgba(148, 163, 184, ${Math.max(0, 0.45 - smT * 0.16)})`;
      ctx.beginPath();
      ctx.arc(smX, smY, 4 + smT * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating Celestial Star Island (Node 8: 1-S, x: 240, y: 170)
    const starIslandPulse = Math.sin(t * 2.5) * 3;
    const sIslandX = 240;
    const sIslandY = 170 + starIslandPulse;

    // Cosmic purple nebula glow behind floating star island
    const nebGrad = ctx.createRadialGradient(sIslandX, sIslandY, 5, sIslandX, sIslandY, 75);
    nebGrad.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
    nebGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.25)');
    nebGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = nebGrad;
    ctx.beginPath();
    ctx.arc(sIslandX, sIslandY, 75, 0, Math.PI * 2);
    ctx.fill();

    // 3D Craggy Rock Underbelly hanging in the sky
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(sIslandX - 52, sIslandY + 6);
    ctx.lineTo(sIslandX - 25, sIslandY + 28);
    ctx.lineTo(sIslandX, sIslandY + 34); // Stalactite peak
    ctx.lineTo(sIslandX + 22, sIslandY + 26);
    ctx.lineTo(sIslandX + 52, sIslandY + 6);
    ctx.closePath();
    ctx.fill();

    // Floating Star Island Landmass Surface
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.ellipse(sIslandX, sIslandY + 4, 58, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.ellipse(sIslandX, sIslandY, 52, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.ellipse(sIslandX, sIslandY - 3, 44, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling Star Crystals on the floating island
    for (let st = 0; st < 4; st++) {
      const stX = sIslandX - 28 + st * 18;
      const stY = sIslandY - 4 + (st % 2) * 5;
      const stShine = Math.sin(t * 5 + st) > 0;
      ctx.fillStyle = stShine ? '#fde047' : '#ffffff';
      ctx.fillRect(stX - 1, stY - 1, 3, 3);
    }

    // Drifting fluffy SNES clouds over the islands
    for (let ci = 0; ci < 4; ci++) {
      const cx = ((ci * 240 + t * 14) % (LOGICAL_WIDTH + 140)) - 70;
      const cy = 55 + ci * 65;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.arc(cx + 18, cy - 6, 16, 0, Math.PI * 2);
      ctx.arc(cx - 18, cy + 4, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // =========================================================================
    // 3. ROADS / PATHS CONNECTING NODES (AUTHENTIC SMW STEPPING STONES)
    // =========================================================================
    this.world1Nodes.forEach(node => {
      if (node.paths) {
        for (const dir in node.paths) {
          const targetId = node.paths[dir];
          const target = this.world1Nodes[targetId];
          if (!target || targetId < node.id) continue;

          const isUnlocked = node.unlocked && target.unlocked;

          // Packed dirt road base outline
          ctx.strokeStyle = isUnlocked ? '#78350f' : 'rgba(120, 53, 15, 0.22)';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();

          // Authentic SMW Cobblestone Stepping Stones
          this.drawMapSteppingStones(ctx, node.x, node.y, target.x, target.y, isUnlocked, 'world1', t);
        }
      }
    });

    // Secret Rainbow Path (Node 1 -> Node 8)
    const secretNode = this.world1Nodes[8];
    const n1 = this.world1Nodes[1];
    if (secretNode && n1) {
      const secretUnlocked = secretNode.unlocked;
      if (secretUnlocked) {
        // Radiant 7-Color Rainbow Bridge!
        const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#818cf8', '#c084fc'];
        colors.forEach((col, idx) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(n1.x - 6 + idx * 2, n1.y);
          ctx.lineTo(secretNode.x - 6 + idx * 2, secretNode.y);
          ctx.stroke();
        });

        // Pulsing sparkling stars along the rainbow bridge
        for (let s = 1; s <= 5; s++) {
          const st = (s / 6 + t * 0.4) % 1.0;
          const sx = n1.x + (secretNode.x - n1.x) * st;
          const sy = n1.y + (secretNode.y - n1.y) * st;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
        }
      } else {
        // Mystical question mark dotted trail
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(secretNode.x, secretNode.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Shortcut Path (Node 8 -> Node 6)
    const n6 = this.world1Nodes[6];
    if (secretNode && secretNode.cleared && n6) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(secretNode.x, secretNode.y);
      ctx.lineTo(n6.x, n6.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  renderWorld2Map(ctx, t) {
    // 1. Deep Arctic Ocean Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    oceanGrad.addColorStop(0, '#021226');
    oceanGrad.addColorStop(0.5, '#023059');
    oceanGrad.addColorStop(1, '#075985');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Glowing cyan arctic wave ripples
    ctx.fillStyle = 'rgba(125, 211, 252, 0.22)';
    for (let row = 0; row < 16; row++) {
      const wy = row * 30 + 10;
      const speed = (row % 2 === 0 ? 1 : -1) * 16;
      const offX = ((t * speed) % 90 + 90) % 90;
      for (let wx = -40 + offX; wx < LOGICAL_WIDTH + 40; wx += 90) {
        ctx.fillRect(wx, wy, 18, 2);
        ctx.fillRect(wx + 5, wy + 2, 8, 1);
      }
    }

    // Spectacular Aurora Borealis Ribbons dancing in upper sky
    ctx.save();
    for (let ai = 0; ai < 3; ai++) {
      ctx.beginPath();
      const aColor = ai === 0 ? 'rgba(16, 185, 129, 0.25)' : (ai === 1 ? 'rgba(6, 182, 212, 0.28)' : 'rgba(168, 85, 247, 0.22)');
      ctx.strokeStyle = aColor;
      ctx.lineWidth = 18;
      ctx.moveTo(0, 45 + ai * 15);
      for (let ax = 0; ax <= LOGICAL_WIDTH; ax += 30) {
        const ay = 45 + ai * 15 + Math.sin(ax * 0.007 + t * 0.9 + ai * 1.6) * 16 + Math.cos(ax * 0.014 - t * 0.6) * 6;
        ctx.lineTo(ax, ay);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 3D Faceted Drifting Icebergs in Ocean
    const iceFloes = [
      { x: 70, y: 190, r: 26 },
      { x: 300, y: 145, r: 22 },
      { x: 550, y: 130, r: 28 },
      { x: 760, y: 340, r: 26 },
      { x: 340, y: 390, r: 24 },
      { x: 130, y: 440, r: 22 }
    ];
    iceFloes.forEach((floe, idx) => {
      const fx = floe.x + Math.sin(t * 0.8 + idx) * 8;
      const fy = floe.y + Math.cos(t * 0.6 + idx) * 4;
      const r = floe.r;

      // Submerged icy base
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.ellipse(fx, fy + 8, r * 1.15, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shadow facet (right side)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(fx + 2, fy + 4, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sunny facet (left side)
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.ellipse(fx - 2, fy + 2, r * 0.95, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pure white snow cap on top
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(fx, fy, r * 0.8, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // =========================================================================
    // THEMATIC 16-BIT REGIONS OF WORLD 2 (GLACIAL, HAUNTED MANSION, FROST CASTLE)
    // =========================================================================

    // -------------------------------------------------------------------------
    // 1. VALLE GLACIAL Y BOSQUE NEVADO (Node 0: 2-1 Glacial, x: 180, y: 320)
    // -------------------------------------------------------------------------
    // 3D Stepped Glacial Ice Cliff Base
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.ellipse(180, 332, 115, 68, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(180, 326, 108, 62, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Pure White Snow Cover Mesa
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(180, 318, 100, 54, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Snow Drift Shadow
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.ellipse(180, 324, 88, 42, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Frozen Reflective Ice Lake (Node pond)
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.ellipse(175, 326, 48, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ice skate glints on frozen lake
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(160, 324);
    ctx.lineTo(180, 328);
    ctx.moveTo(176, 322);
    ctx.lineTo(194, 326);
    ctx.stroke();

    // Snow-draped evergreen pine trees grove
    const pineTrees = [
      { x: 115, y: 300, scale: 1.0 },
      { x: 135, y: 275, scale: 0.85 },
      { x: 235, y: 295, scale: 0.95 },
      { x: 255, y: 325, scale: 0.8 }
    ];
    pineTrees.forEach(pt => {
      const px = pt.x;
      const py = pt.y;
      const s = pt.scale;
      // Trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px - 2 * s, py, 4 * s, 6 * s);
      // Pine tiers
      for (let tier = 0; tier < 3; tier++) {
        const ty = py - 4 * s - tier * 8 * s;
        const tw = (14 - tier * 3) * s;
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.moveTo(px, ty - 10 * s);
        ctx.lineTo(px - tw, ty);
        ctx.lineTo(px + tw, ty);
        ctx.closePath();
        ctx.fill();
        // White snow top
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(px, ty - 10 * s);
        ctx.lineTo(px - tw * 0.5, ty - 4 * s);
        ctx.lineTo(px + tw * 0.5, ty - 4 * s);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Cute animated mini penguin sliding on belly near the lake
    const pengSlide = Math.sin(t * 2.2) * 16;
    const pengX = 145 + pengSlide;
    const pengY = 345;
    ctx.save();
    ctx.translate(pengX, pengY);
    // Dark penguin body
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // White tummy
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(1, 1, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Orange beak & feet
    ctx.fillStyle = '#f97316';
    ctx.fillRect(5, -1, 3, 2);
    ctx.fillRect(-6, 2, 2, 2);
    ctx.restore();

    // -------------------------------------------------------------------------
    // 2. LA MANSIÓN ENCANTADA DE LOS BOOS (Node 1: 2-2 Mansión, x: 440, y: 250)
    // -------------------------------------------------------------------------
    // Dark Twilight Violet Gothic Basalt Cliff
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(440, 264, 110, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.ellipse(440, 256, 102, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.ellipse(440, 248, 92, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eerie undulating purple fog aura
    const fogGrad = ctx.createRadialGradient(440, 240, 15, 440, 240, 85);
    fogGrad.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
    fogGrad.addColorStop(0.6, 'rgba(126, 34, 206, 0.20)');
    fogGrad.addColorStop(1, 'rgba(46, 16, 101, 0)');
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.arc(440, 240, 85, 0, Math.PI * 2);
    ctx.fill();

    // Wrought-iron spiked cemetery fences
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(375, 260);
    ctx.lineTo(415, 260);
    ctx.moveTo(465, 260);
    ctx.lineTo(505, 260);
    ctx.stroke();
    for (let fx = 378; fx <= 412; fx += 7) {
      ctx.beginPath();
      ctx.moveTo(fx, 265);
      ctx.lineTo(fx, 254);
      ctx.lineTo(fx + 1, 252);
      ctx.stroke();
    }
    for (let fx = 468; fx <= 502; fx += 7) {
      ctx.beginPath();
      ctx.moveTo(fx, 265);
      ctx.lineTo(fx, 254);
      ctx.lineTo(fx + 1, 252);
      ctx.stroke();
    }

    // Crooked stone tombstones with crosses
    const drawMapTombstone = (tx, ty) => {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(tx, ty - 6, 4, Math.PI, 0);
      ctx.lineTo(tx + 4, ty);
      ctx.lineTo(tx - 4, ty);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Mini cross
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(tx - 1, ty - 7, 2, 5);
      ctx.fillRect(tx - 3, ty - 5, 6, 2);
    };
    drawMapTombstone(395, 254);
    drawMapTombstone(485, 256);

    // Spooky dead silhouette trees with crooked branches
    const drawSpookyTree = (tx, ty) => {
      ctx.fillStyle = '#0f051d';
      ctx.fillRect(tx - 2, ty - 18, 4, 18);
      ctx.fillRect(tx - 8, ty - 14, 7, 2);
      ctx.fillRect(tx + 2, ty - 16, 7, 2);
      ctx.fillRect(tx - 8, ty - 20, 2, 7);
      ctx.fillRect(tx + 6, ty - 22, 2, 7);
    };
    drawSpookyTree(375, 245);
    drawSpookyTree(505, 240);

    // =========================================================================
    // DETAILED 16-BIT VICTORIAN GOTHIC HAUNTED MANSION (Behind Node 1)
    // =========================================================================
    const manX = 440;
    const manY = 222;

    // Mansion Main Hall Stone Block
    ctx.fillStyle = '#170929';
    ctx.fillRect(manX - 22, manY - 14, 44, 28);
    ctx.strokeStyle = '#0a0312';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(manX - 22, manY - 14, 44, 28);

    // Steep Gothic Roof (Center Gable)
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(manX - 26, manY - 14);
    ctx.lineTo(manX, manY - 36);
    ctx.lineTo(manX + 26, manY - 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2e1065';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Left Spire Tower
    ctx.fillStyle = '#170929';
    ctx.fillRect(manX - 32, manY - 24, 12, 38);
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(manX - 34, manY - 24);
    ctx.lineTo(manX - 26, manY - 48);
    ctx.lineTo(manX - 18, manY - 24);
    ctx.closePath();
    ctx.fill();
    // Golden weather vane
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(manX - 27, manY - 52, 2, 5);

    // Right Spire Tower
    ctx.fillStyle = '#170929';
    ctx.fillRect(manX + 20, manY - 24, 12, 38);
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(manX + 18, manY - 24);
    ctx.lineTo(manX + 26, manY - 48);
    ctx.lineTo(manX + 34, manY - 24);
    ctx.closePath();
    ctx.fill();
    // Golden weather vane
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(manX + 25, manY - 52, 2, 5);

    // Glowing Candlelight Windows (warm yellow with candle flicker)
    const winFlicker = Math.sin(t * 12) > 0 ? '#fde047' : '#facc15';
    ctx.fillStyle = winFlicker;
    ctx.fillRect(manX - 12, manY - 4, 6, 8);
    ctx.fillRect(manX + 6, manY - 4, 6, 8);
    ctx.fillRect(manX - 28, manY - 16, 4, 6);
    ctx.fillRect(manX + 24, manY - 16, 4, 6);

    // Arched Main Entrance Doorway
    ctx.fillStyle = '#0f051d';
    ctx.beginPath();
    ctx.arc(manX, manY + 8, 5, Math.PI, 0);
    ctx.lineTo(manX + 5, manY + 14);
    ctx.lineTo(manX - 5, manY + 14);
    ctx.closePath();
    ctx.fill();

    // Two Cute Animated Boos floating near the mansion!
    const boo1Bob = Math.sin(t * 3.5) * 6;
    const boo1X = 405 + Math.cos(t * 1.5) * 8;
    const boo1Y = 195 + boo1Bob;
    // Boo 1 Body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(boo1X, boo1Y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Curled little tail
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(boo1X - 6, boo1Y - 1);
    ctx.quadraticCurveTo(boo1X - 12, boo1Y + 3, boo1X - 7, boo1Y + 6);
    ctx.fill();
    // Eyes & Blush
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(boo1X + 1, boo1Y - 3, 2, 3);
    ctx.fillRect(boo1X + 4, boo1Y - 3, 2, 3);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(boo1X, boo1Y + 1, 2, 2);
    ctx.fillRect(boo1X + 6, boo1Y + 1, 2, 2);

    // Boo 2 (Right side, slightly higher)
    const boo2Bob = Math.cos(t * 3.2) * 5;
    const boo2X = 475 + Math.sin(t * 1.8) * 8;
    const boo2Y = 185 + boo2Bob;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(boo2X, boo2Y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Eyes & Smile
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(boo2X - 4, boo2Y - 2, 2, 2);
    ctx.fillRect(boo2X - 1, boo2Y - 2, 2, 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(boo2X - 5, boo2Y + 1, 2, 1);
    ctx.fillRect(boo2X + 1, boo2Y + 1, 2, 1);

    // -------------------------------------------------------------------------
    // 3. FORTALEZA GLACIAL DEL REY ESCARCHA (Node 2: 2-3 Castillo, x: 700, y: 160)
    // -------------------------------------------------------------------------
    const casX = 700;
    const casY = 160;

    // Massive Jagged Glacial Mountain Peak Base
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.ellipse(casX, casY + 12, 105, 62, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(casX, casY + 4, 95, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(casX, casY - 4, 85, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Frost Mountain Crystalline Peak facets
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(casX - 40, casY);
    ctx.lineTo(casX - 15, casY - 55);
    ctx.lineTo(casX, casY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(casX - 8, casY);
    ctx.lineTo(casX + 10, casY - 68);
    ctx.lineTo(casX + 30, casY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(casX + 20, casY);
    ctx.lineTo(casX + 38, casY - 50);
    ctx.lineTo(casX + 54, casY);
    ctx.closePath();
    ctx.fill();

    // Crystalline Citadel Battlements
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(casX - 32, casY - 26, 64, 30);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(casX - 32, casY - 26, 64, 30);

    // Crenellations along castle top
    ctx.fillStyle = '#0284c7';
    for (let bx = casX - 32; bx <= casX + 24; bx += 14) {
      ctx.fillRect(bx, casY - 34, 8, 8);
    }

    // Four Sharp Ice Spires
    [-26, -10, 10, 26].forEach((sx, idx) => {
      const sh = idx === 1 || idx === 2 ? 36 : 26;
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.moveTo(casX + sx - 5, casY - 26);
      ctx.lineTo(casX + sx, casY - 26 - sh);
      ctx.lineTo(casX + sx + 5, casY - 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(casX + sx - 1, casY - 26 - sh + 2, 2, 8);
    });

    // Golden Royal Frost King Crown Emblem mounted above gateway
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(casX - 8, casY - 14);
    ctx.lineTo(casX - 8, casY - 20);
    ctx.lineTo(casX - 4, casY - 17);
    ctx.lineTo(casX, casY - 22);
    ctx.lineTo(casX + 4, casY - 17);
    ctx.lineTo(casX + 8, casY - 20);
    ctx.lineTo(casX + 8, casY - 14);
    ctx.closePath();
    ctx.fill();

    // Massive Fortress Iron Gatehouse
    ctx.fillStyle = '#082f49';
    ctx.fillRect(casX - 10, casY - 2, 20, 18);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(casX - 10, casY - 2, 20, 18);

    // Pulsing Frost King Crystalline Aura
    const frostAura = ctx.createRadialGradient(casX, casY - 18, 10, casX, casY - 18, 80);
    frostAura.addColorStop(0, 'rgba(125, 211, 252, 0.55)');
    frostAura.addColorStop(0.5, 'rgba(56, 189, 248, 0.20)');
    frostAura.addColorStop(1, 'rgba(8, 47, 73, 0)');
    ctx.fillStyle = frostAura;
    ctx.beginPath();
    ctx.arc(casX, casY - 18, 80, 0, Math.PI * 2);
    ctx.fill();

    // =========================================================================
    // CRYSTALLINE ICE BRIDGES CONNECTING NODES (WORLD 2)
    // =========================================================================
    this.world2Nodes.forEach(node => {
      if (node.paths) {
        for (const dir in node.paths) {
          const targetId = node.paths[dir];
          const target = this.world2Nodes[targetId];
          if (!target || targetId < node.id) continue;

          const isUnlocked = node.unlocked && target.unlocked;

          // Ice bridge base
          ctx.strokeStyle = isUnlocked ? '#0284c7' : 'rgba(2, 132, 199, 0.25)';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();

          // Crystalline frost stepping stones
          this.drawMapSteppingStones(ctx, node.x, node.y, target.x, target.y, isUnlocked, 'world2', t);

          // Ice sparkle diamonds along unlocked bridges
          if (isUnlocked) {
            for (let sp = 1; sp <= 4; sp++) {
              const spt = (sp / 5 + t * 0.25) % 1.0;
              const sx = node.x + (target.x - node.x) * spt;
              const sy = node.y + (target.y - node.y) * spt;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
            }
          }
        }
      }
    });
  }

  renderMapNode(ctx, node, isSelected, time) {
    ctx.save();
    const x = node.x;
    const y = node.y;

    if (!node.unlocked) {
      // Locked node
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', x, y + 4);
      ctx.restore();
      return;
    }

    // Active Selection Pulsing Ring
    if (isSelected) {
      const pulse = 1.0 + Math.sin(time * 8) * 0.18;
      ctx.strokeStyle = this.currentWorld === 2 ? '#38bdf8' : '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 20 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (node.isSecret) {
      // Secret Pulsating Rainbow Star Node
      const rot = time * 2;
      const starScale = 1.0 + Math.sin(time * 6) * 0.15;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(starScale, starScale);

      // Glowing aura
      const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
      aura.addColorStop(0, '#fef08a');
      aura.addColorStop(0.5, '#f472b6');
      aura.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Rotating 5-point Star
      ctx.rotate(rot);
      ctx.fillStyle = '#facc15';
      this.drawStarPolygon(ctx, 0, 0, 5, 14, 6.5);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    } else if (node.icon === 'glacier') {
      // Glacier Snowflake Node
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();

      // Snowflake
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x, y + 8);
      ctx.moveTo(x - 5, y - 5);
      ctx.lineTo(x + 5, y + 5);
      ctx.moveTo(x + 5, y - 5);
      ctx.lineTo(x - 5, y + 5);
      ctx.stroke();

      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.stroke();
    } else if (node.icon === 'ghost') {
      // Boo Haunted House Node
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();

      // Cute Boo silhouette
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y - 1, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 3, y - 2, 2, 2);
      ctx.fillRect(x + 2, y - 2, 2, 2);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x - 5, y + 1, 2, 2);
      ctx.fillRect(x + 4, y + 1, 2, 2);

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.stroke();
    } else if (node.icon === 'ice_castle' || node.icon === 'castle' || node.icon === 'fortress') {
      // 16-Bit Castle Fortress Icon
      const isIce = node.icon === 'ice_castle';
      ctx.fillStyle = isIce ? '#082f49' : '#0f172a';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isIce ? '#7dd3fc' : (node.icon === 'castle' ? '#475569' : '#64748b');
      ctx.fillRect(x - 14, y - 8, 28, 18);
      ctx.fillRect(x - 14, y - 14, 8, 8);
      ctx.fillRect(x - 4, y - 12, 8, 6);
      ctx.fillRect(x + 6, y - 14, 8, 8);
      ctx.fillStyle = isIce ? '#0f172a' : '#1e293b';
      ctx.fillRect(x - 4, y + 2, 8, 8);
      ctx.fillStyle = isIce ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(x + 10, y - 14);
      ctx.lineTo(x + 18, y - 11);
      ctx.lineTo(x + 10, y - 8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isIce ? '#bae6fd' : '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.stroke();
    } else if (node.hasSecretExit) {
      // Dual-ring Red Level Dot (Super Mario World style for levels with secret exits!)
      const pulseRed = Math.floor(time * 6) % 2 === 0;
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pulseRed ? '#ef4444' : '#dc2626';
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Normal Level Yellow Dot
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x - 3, y - 3, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cleared Golden Star Badge inside node
    if (node.cleared) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', x, y + 4);
    }

    // Node mini label underneath
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(node.name.split(' ')[0], x, y + 26);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawStarPolygon(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  renderMapTopHeader(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    window.spriteRenderer.roundRect(ctx, 24, 12, LOGICAL_WIDTH - 48, 44, 10);
    ctx.fill();
    ctx.strokeStyle = this.currentWorld === 2 ? '#38bdf8' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.currentWorld === 2 ? '#7dd3fc' : '#fde047';
    ctx.fillText(this.currentWorld === 2 ? '❄️ M2: GLACIAL' : '🌍 M1: ISLA ÁMBAR', 38, 38);

    // Interactive World Switcher Buttons
    const w1Active = this.currentWorld === 1;
    const w2Active = this.currentWorld === 2;

    // Button M1
    ctx.fillStyle = w1Active ? 'rgba(245, 158, 11, 0.45)' : 'rgba(30, 41, 59, 0.75)';
    window.spriteRenderer.roundRect(ctx, 252, 18, 68, 32, 6);
    ctx.fill();
    ctx.strokeStyle = w1Active ? '#facc15' : '#475569';
    ctx.lineWidth = w1Active ? 2.5 : 1;
    ctx.stroke();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = w1Active ? '#fef08a' : '#94a3b8';
    ctx.fillText('🌍 M1', 286, 38);

    // Button M2
    ctx.fillStyle = w2Active ? 'rgba(56, 189, 248, 0.45)' : 'rgba(30, 41, 59, 0.75)';
    window.spriteRenderer.roundRect(ctx, 326, 18, 68, 32, 6);
    ctx.fill();
    ctx.strokeStyle = w2Active ? '#38bdf8' : '#475569';
    ctx.lineWidth = w2Active ? 2.5 : 1;
    ctx.stroke();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = w2Active ? '#e0f2fe' : '#94a3b8';
    ctx.fillText('❄️ M2', 360, 38);

    // Right-aligned stats
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f472b6';
    ctx.fillText(`♥ x${this.lives}`, LOGICAL_WIDTH - 245, 38);

    ctx.fillStyle = '#fde047';
    ctx.fillText(`🪙 ${this.coinsCount}`, LOGICAL_WIDTH - 155, 38);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PTS ${String(this.score).padStart(6, '0')}`, LOGICAL_WIDTH - 38, 38);
    ctx.restore();
  }

  renderMapBottomCard(ctx) {
    ctx.save();
    const cur = this.mapNodes[this.currentMapNodeId] || this.mapNodes[0];

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    window.spriteRenderer.roundRect(ctx, 24, 408, LOGICAL_WIDTH - 48, 62, 12);
    ctx.fill();
    ctx.strokeStyle = cur.isSecret ? '#c084fc' : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = cur.isSecret ? '#fde047' : '#ffffff';
    ctx.fillText(`MUNDO ${cur.name.toUpperCase()}`, 44, 432);

    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(cur.subtitle, 44, 452);

    const saved = this.savedStarCoins[cur.levelIdx] || [false, false, false];
    ctx.textAlign = 'right';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbbf24';
    const starStr = `ESTRELLAS: ${saved[0] ? '★' : '☆'} ${saved[1] ? '★' : '☆'} ${saved[2] ? '★' : '☆'}`;
    ctx.fillText(starStr, LOGICAL_WIDTH - 44, 432);

    const flash = Math.floor(this.time * 3) % 2 === 0;
    ctx.fillStyle = flash ? '#4ade80' : '#86efac';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('▶ PRESIONA ESPACIO / SALTO PARA ENTRAR ◀', LOGICAL_WIDTH - 44, 454);

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new SuperAmbarGame();
});
