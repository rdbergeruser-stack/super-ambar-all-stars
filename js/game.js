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
  8: [{ col: 28, row: 5 }, { col: 70, row: 4 }, { col: 112, row: 5 }]
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

    this.bindEvents();
    this.loadLevel(0, false);
    this.state = 'TITLE';

    this.lastFrameTime = performance.now();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  createDefaultPlayer(keepPower = false) {
    const powerState = keepPower && this.player ? this.player.powerState : 0;
    return {
      x: 96,
      y: 10 * TILE_SIZE,
      w: powerState >= 1 ? 30 : 24,
      h: powerState >= 1 ? 54 : 36,
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
        } else if (this.state === 'GAMEOVER') {
          this.lives = 5;
          this.startLevelIntro(this.currentLevelIdx, false);
        } else if (this.state === 'VICTORY') {
          this.currentLevelIdx = 0;
          this.startGame();
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

    this.canvas.addEventListener('pointerdown', () => {
      window.retroAudio.init();
      if (this.state === 'TITLE') {
        this.startGame();
      } else if (this.state === 'GAMEOVER') {
        this.lives = 5;
        this.startLevelIntro(this.currentLevelIdx, false);
      } else if (this.state === 'VICTORY') {
        this.currentLevelIdx = 0;
        this.startGame();
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
        if (this.state === 'TITLE') this.startGame();
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

    bindTouch('touchLeft', 'left');
    bindTouch('touchRight', 'right');
    bindTouch('touchJump', 'jump');
    bindTouch('touchMagic', 'action');

    // Allow sliding the left thumb continuously between ◀ and ▶ on mobile!
    const dpad = document.getElementById('touchDpad');
    const btnL = document.getElementById('touchLeft');
    const btnR = document.getElementById('touchRight');
    if (dpad && btnL && btnR) {
      dpad.addEventListener('touchmove', (ev) => {
        ev.preventDefault();
        let hitL = false;
        let hitR = false;
        const rectL = btnL.getBoundingClientRect();
        const rectR = btnR.getBoundingClientRect();
        for (let i = 0; i < ev.touches.length; i++) {
          const t = ev.touches[i];
          if (t.clientX >= rectL.left && t.clientX <= rectL.right && t.clientY >= rectL.top && t.clientY <= rectL.bottom) hitL = true;
          if (t.clientX >= rectR.left && t.clientX <= rectR.right && t.clientY >= rectR.top && t.clientY <= rectR.bottom) hitR = true;
        }
        this.keys.left = hitL;
        this.keys.right = hitR;
        btnL.classList.toggle('pressed', hitL);
        btnR.classList.toggle('pressed', hitR);
      }, { passive: false });
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
    this.startLevelIntro(this.currentLevelIdx, false);
  }

  selectLevel(idx) {
    this.currentLevelIdx = idx;
    this.checkpointReached = false;
    this.updateLevelButtonsUI();
    this.startLevelIntro(idx, true);
  }

  updateLevelButtonsUI() {
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
      btn.classList.toggle('current-level', i === this.currentLevelIdx);
    });
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

      if (this.stateTimer <= 0) {
        if (this.currentLevelIdx + 1 < window.LEVEL_BUILDERS.length) {
          this.checkpointReached = false;
          this.startLevelIntro(this.currentLevelIdx + 1, true);
        } else {
          this.state = 'VICTORY';
          window.retroAudio.stopBgm();
          window.retroAudio.playSfx('stageClear');
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

    // Horizontal Movement (with Bicycle Mode in 1-4 & Superman Flight Mode in 1-7!)
    const baseMax = p.isFlying
      ? (p.turboTimer > 0 ? 7.8 : (this.keys.action ? 6.0 : 4.9))
      : p.onBike
        ? (p.turboTimer > 0 ? 8.2 : (this.keys.action ? 6.5 : 5.3))
        : (this.keys.action ? 5.4 : 4.2);
    const maxSpeed = baseMax * (p.starTimer > 0 ? 1.2 : 1.0);
    const accel = p.isFlying ? 0.50 : p.onBike ? (p.onGround ? 0.56 : 0.42) : (p.onGround ? 0.48 : 0.36);
    const friction = p.isFlying ? 0.90 : p.onBike ? (p.onGround ? 0.90 : 0.96) : (p.onGround ? 0.82 : 0.94);

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

    if (p.isFlying) {
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
            window.retroAudio.playSfx('coin');
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
    if (p.isFlying) {
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
    return ['B', '?', 'M', 'S', 'L', 'E', 'H', 'P', 'p', '#', '=', 'J', 'T', 'C'].includes(ch);
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
                // TURBO BOOST PAD ON THE BICYCLE TRACK!
                if (p.turboTimer <= 0.2) {
                  window.retroAudio.playSfx('powerupAppear');
                  this.addFloatingText(p.x, p.y - 16, '¡TURBO BICI!', '#fde047');
                }
                p.turboTimer = 0.85;
                p.facing = p.vx < -0.5 ? -1 : 1;
                p.vx = p.facing * 8.0;
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
        window.retroAudio.playSfx('oneup');
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

      if (en.type === 'cloud') {
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
              if (other.type === 'boss') {
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
          if (en.type === 'boss') {
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
          if (en.type === 'boss') {
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
      this.addFloatingText(boss.x, boss.y - 20, '¡REY NUBARRÓN DERROTADO!', '#ffe58f');
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
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(ep.x + 7, ep.y + 7, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d50000';
      ctx.stroke();
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
      if (pt.type === 'dust') {
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
    } else if (theme === 5) {
      // MUNDO 1-5: CUEVA DE CRISTAL SUBTERRÁNEA
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Glowing Crystal Formations in Parallax Background
      const crystalColors = ['#38bdf8', '#a855f7', '#ec4899', '#2dd4bf'];
      for (let i = 0; i < 8; i++) {
        const cx = ((i * 180 - this.cameraX * 0.28) % (LOGICAL_WIDTH + 200) + LOGICAL_WIDTH + 200) % (LOGICAL_WIDTH + 200) - 80;
        const cColor = crystalColors[i % crystalColors.length];
        ctx.fillStyle = cColor;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, 13 * TILE_SIZE);
        ctx.lineTo(cx + 18, 250 + (i % 2) * 40);
        ctx.lineTo(cx + 36, 13 * TILE_SIZE);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (theme === 6) {
      // MUNDO 1-6: CIELO DE NUBES Y ARCOÍRIS
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#1e3a8a');
      grad.addColorStop(0.5, '#60a5fa');
      grad.addColorStop(1, '#fef9c3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      const rainbowColors = ['#f43f5e', '#f59e0b', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6'];
      ctx.save();
      ctx.globalAlpha = 0.5;
      rainbowColors.forEach((c, idx) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.arc(LOGICAL_WIDTH / 2, 460, 340 - idx * 11, Math.PI, 0);
        ctx.stroke();
      });
      ctx.restore();

      for (let i = 0; i < 9; i++) {
        const cx = ((i * 190 - this.cameraX * 0.3) % (LOGICAL_WIDTH + 220) + LOGICAL_WIDTH + 220) % (LOGICAL_WIDTH + 220) - 100;
        const cy = 70 + (i % 4) * 65;
        this.drawSnesCloud(ctx, cx, cy);
      }

      // Soft sea of clouds at the bottom when in the Flying Level (no solid floor!)
      if (this.level && this.level.isFlyingLevel) {
        for (let i = 0; i < 16; i++) {
          const bx = ((i * 75 - this.cameraX * 0.55) % (LOGICAL_WIDTH + 160) + LOGICAL_WIDTH + 160) % (LOGICAL_WIDTH + 160) - 80;
          const by = LOGICAL_HEIGHT - 12 + Math.sin(this.time * 2 + i) * 3;
          this.drawSnesCloud(ctx, bx, by);
        }
      }
    } else if (theme === 2) {
      // SUPER MARIO ALL-STARS WORLD 1-2: Timber & Brick Cavern / Workshop
      const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#334155');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      for (let i = 0; i < 6; i++) {
        const px = ((i * 220 - this.cameraX * 0.25) % (LOGICAL_WIDTH + 220) + LOGICAL_WIDTH + 220) % (LOGICAL_WIDTH + 220) - 80;
        ctx.fillStyle = '#1e2433';
        ctx.fillRect(px, 0, 64, 13 * TILE_SIZE);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, 0, 64, 13 * TILE_SIZE);

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(px + 32, 160, 14, Math.PI, 0);
        ctx.lineTo(px + 46, 195);
        ctx.lineTo(px + 18, 195);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // SUPER MARIO ALL-STARS CASTLE INTERIOR (1-3 & 1-7)
      ctx.fillStyle = '#0f111a';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      ctx.strokeStyle = '#1e2235';
      ctx.lineWidth = 2;
      const offsetX = Math.floor(this.cameraX * 0.2) % 64;
      for (let r = 1; r < 13; r++) {
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

      for (let i = 0; i < 5; i++) {
        const ax = ((i * 240 - this.cameraX * 0.3) % (LOGICAL_WIDTH + 240) + LOGICAL_WIDTH + 240) % (LOGICAL_WIDTH + 240) - 80;
        ctx.fillStyle = '#31102f';
        ctx.fillRect(ax, 100, 64, 140);
        ctx.beginPath();
        ctx.arc(ax + 32, 100, 32, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#090a0f';
        for (let bx = ax + 12; bx < ax + 60; bx += 14) {
          ctx.fillRect(bx, 72, 4, 168);
        }
      }
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
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    window.spriteRenderer.roundRect(ctx, 90, 65, LOGICAL_WIDTH - 180, 350, 12);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.stroke();

    window.spriteRenderer.drawAmbarPortrait(ctx, LOGICAL_WIDTH / 2 - 44, 80, 88);

    ctx.textAlign = 'center';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText('¡FELICITACIONES ÁMBAR!', LOGICAL_WIDTH / 2, 198);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('¡Completaste todos los mundos de Super Ámbar All-Stars!', LOGICAL_WIDTH / 2, 235);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`PUNTAJE FINAL: ${this.score}   •   MONEDAS: ${this.coinsCount}`, LOGICAL_WIDTH / 2, 280);

    if (Math.floor(this.time * 2.5) % 2 === 0) {
      ctx.fillStyle = '#4ade80';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('PRESIONA ENTER O CLIC PARA JUGAR DE NUEVO', LOGICAL_WIDTH / 2, 350);
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
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new SuperAmbarGame();
});
