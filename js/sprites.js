// ============================================================================
// SUPER MARIO ALL-STARS (SNES 16-BIT) SPRITE & TILE ENGINE
// Uses Studio-Grade 16-Bit Pixel-Art Sprites from window.SPRITE_ASSETS
// ============================================================================

class SpriteRenderer {
  constructor() {
    this.cache = {};
    this.images = {
      jeans: [],
      hoodie: [],
      bike: [],
      fly: [],
      cloud: [],
      goomba: null,
      koopa: null,
      robot: null,
      boss: null,
      mushroom: null,
      oneup: null,
      star: null,
      rainbow: null,
      shell: null
    };
    this.loadSpriteAssets();
  }

  loadSpriteAssets() {
    if (!window.SPRITE_ASSETS) return;

    ['jeans', 'hoodie', 'bike', 'fly', 'cloud'].forEach(group => {
      if (Array.isArray(window.SPRITE_ASSETS[group])) {
        this.images[group] = window.SPRITE_ASSETS[group].map(src => {
          const img = new Image();
          img.src = src;
          return img;
        });
      }
    });

    ['goomba', 'koopa', 'robot', 'boss', 'mushroom', 'oneup', 'star', 'rainbow', 'shell'].forEach(key => {
      if (window.SPRITE_ASSETS[key]) {
        const img = new Image();
        img.src = window.SPRITE_ASSETS[key];
        this.images[key] = img;
      }
    });
  }

  roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // ==========================================================================
  // 16-BIT SNES PORTRAIT OF ÁMBAR (CROPPED FROM HER 16-BIT SPRITE)
  // ==========================================================================
  drawAmbarPortrait(ctx, x, y, size = 48) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, x, y, size, size, 8);
    ctx.fill();

    const bgGrad = ctx.createLinearGradient(x, y, x, y + size);
    bgGrad.addColorStop(0, '#2563eb');
    bgGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = bgGrad;
    this.roundRect(ctx, x + 3, y + 3, size - 6, size - 6, 6);
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, x + 2, y + 2, size - 4, size - 4, 7);
    ctx.stroke();

    const img = (this.images.hoodie && this.images.hoodie[0]) || (this.images.jeans && this.images.jeans[0]);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      this.roundRect(ctx, x + 4, y + 4, size - 8, size - 8, 5);
      ctx.clip();
      const srcW = img.naturalWidth;
      const srcH = Math.floor(img.naturalHeight * 0.56);
      ctx.drawImage(img, 0, 0, srcW, srcH, x + 4, y + 4, size - 8, size - 8);
      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================================
  // 16-BIT SNES ÁMBAR SPRITE (WALKING, SUPER GROWTH, BICYCLE, AND SUPERMAN FLIGHT!)
  // ==========================================================================
  drawAmbar(ctx, player, time) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const cx = Math.round(player.x + player.w / 2);
    const bottomY = Math.round(player.y + player.h);

    if (player.invulnerableTimer > 0 && Math.floor(time * 20) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    ctx.translate(cx, bottomY);
    const sx = (player.squashX || 1.0) * (player.facing < 0 ? -1 : 1);
    const sy = player.squashY || 1.0;
    ctx.scale(sx, sy);

    const isSuper = player.powerState >= 1;
    const isMagic = player.powerState >= 2;
    const isStar = player.starTimer > 0;

    if (isStar) {
      const hue = Math.floor((time * 540) % 360);
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = 14;
    } else if (isMagic || player.turboTimer > 0 || player.isFlying) {
      ctx.shadowColor = player.turboTimer > 0 ? '#38bdf8' : '#fde047';
      ctx.shadowBlur = 11;
    }

    // ------------------------------------------------------------------------
    // SUPERMAN FLIGHT MODE (MUNDO 1-7: ¡SUPER ÁMBAR VUELA POR EL CIELO!)
    // ------------------------------------------------------------------------
    if (player.isFlying && this.images.fly && this.images.fly.length > 0 && this.images.fly[0].complete) {
      const capeIdx = Math.floor(time * 10) % this.images.fly.length;
      const flyImg = this.images.fly[capeIdx] || this.images.fly[0];

      const hoverY = Math.sin(time * 7) * 2.5;
      const divePitch = player.diveBombing ? 0.38 : 0;
      const pitch = Math.max(-0.35, Math.min(0.72, (player.vy || 0) * 0.05 + divePitch));

      ctx.translate(0, -player.h / 2 + hoverY);
      ctx.rotate(pitch);

      const targetH = player.displayHeight || 56;
      const aspect = flyImg.naturalWidth / Math.max(1, flyImg.naturalHeight);
      const targetW = Math.round(targetH * aspect);

      ctx.drawImage(
        flyImg,
        Math.round(-targetW / 2),
        Math.round(-targetH / 2),
        targetW,
        targetH
      );
      ctx.restore();
      return;
    }

    // ------------------------------------------------------------------------
    // BICYCLE MODE (MUNDO 1-4: CICLOVÍA TURBO EN BICICLETA)
    // ------------------------------------------------------------------------
    if (player.onBike && this.images.bike && this.images.bike.length > 0 && this.images.bike[0].complete) {
      const speed = Math.abs(player.vx || 0);
      const pedalIndex = speed > 0.15
        ? Math.floor(time * (speed * 2.8 + 5)) % this.images.bike.length
        : 0;
      const bikeImg = this.images.bike[pedalIndex] || this.images.bike[0];

      const baseTilt = !player.onGround
        ? Math.max(-0.22, Math.min(0.14, (player.vy || 0) * 0.018))
        : (player.turboTimer > 0 ? -0.08 : 0);
      const totalAngle = baseTilt + (player.bikeAngle || 0);

      const bobY = player.onGround && speed > 0.2 ? Math.sin(time * 22) * 1.2 : 0;
      const targetH = player.displayHeight || 86;
      const aspect = bikeImg.naturalWidth / Math.max(1, bikeImg.naturalHeight);
      const targetW = Math.round(targetH * aspect);

      ctx.translate(0, -targetH * 0.44);
      ctx.rotate(totalAngle);
      ctx.translate(0, targetH * 0.44);

      ctx.drawImage(
        bikeImg,
        Math.round(-targetW / 2),
        Math.round(-targetH + 3 + bobY),
        targetW,
        targetH
      );
      ctx.restore();
      return;
    }

    // ------------------------------------------------------------------------
    // STANDARD / SUPER ÁMBAR MODE
    // Clearly smaller when she hasn't grabbed the Super Mushroom (56px vs 86px)!
    // ------------------------------------------------------------------------
    let useSuperSprite = isSuper;
    if (player.growAnimTimer > 0) {
      // Classic Super Mario Bros growth flash between small & super!
      useSuperSprite = Math.floor(time * 18) % 2 === 0;
    }

    const frames = useSuperSprite ? this.images.hoodie : this.images.jeans;
    if (!frames || frames.length === 0 || !frames[0].complete || frames[0].naturalWidth === 0) {
      ctx.restore();
      return;
    }

    let frameIdx = 0;
    let bobY = 0;

    if (!player.onGround) {
      frameIdx = Math.min(3, frames.length - 1);
    } else if (Math.abs(player.vx) > 0.2) {
      const cycle = Math.floor(time * (Math.abs(player.vx) * 2.5 + 5.5)) % 4;
      if (cycle === 0) {
        frameIdx = 1;
        bobY = -2;
      } else if (cycle === 1) {
        frameIdx = 0;
        bobY = 0;
      } else if (cycle === 2) {
        frameIdx = Math.min(2, frames.length - 1);
        bobY = -2;
      } else {
        frameIdx = 0;
        bobY = 0;
      }
    }

    const img = frames[frameIdx] || frames[0];
    // Small Ámbar (no mushroom): 56px tall | Super Ámbar (with mushroom): 86px tall!
    const targetH = player.displayHeight || (useSuperSprite ? 86 : 56);
    const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    const targetW = Math.round(targetH * aspect);

    ctx.drawImage(
      img,
      Math.round(-targetW / 2),
      Math.round(-targetH + 3 + bobY),
      targetW,
      targetH
    );

    ctx.restore();
  }

  // ==========================================================================
  // 16-BIT SNES TILES (32x32 NATIVE PIXEL TEXTURES)
  // ==========================================================================
  drawTile(ctx, type, x, y, size, time, levelTheme = 1) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    switch (type) {
      case '#':
      case 'T': {
        const key = `snes_ground_${levelTheme}`;
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');

          if (levelTheme === 1 || levelTheme === 6) {
            g.fillStyle = levelTheme === 6 ? '#312e81' : '#3d1e10';
            g.fillRect(0, 0, 32, 32);

            const stones = [
              { x: 2, y: 11, w: 12, h: 9 },
              { x: 16, y: 12, w: 14, h: 8 },
              { x: 1, y: 22, w: 9, h: 8 },
              { x: 12, y: 21, w: 11, h: 9 },
              { x: 25, y: 22, w: 6, h: 8 }
            ];
            stones.forEach(st => {
              g.fillStyle = levelTheme === 6 ? '#4338ca' : '#6e3b20';
              g.fillRect(st.x, st.y, st.w, st.h);
              g.fillStyle = levelTheme === 6 ? '#6366f1' : '#9c5a35';
              g.fillRect(st.x + 1, st.y + 1, st.w - 2, st.h - 2);
              g.fillStyle = levelTheme === 6 ? '#a5b4fc' : '#c47d52';
              g.fillRect(st.x + 1, st.y + 1, st.w - 3, 2);
              g.fillRect(st.x + 1, st.y + 1, 2, st.h - 3);
            });

            g.fillStyle = levelTheme === 6 ? '#93c5fd' : '#0f3818';
            g.fillRect(0, 0, 32, 11);
            g.fillStyle = levelTheme === 6 ? '#dbeafe' : '#1f6e2c';
            g.fillRect(0, 0, 32, 9);
            g.fillStyle = levelTheme === 6 ? '#eff6ff' : '#38a845';
            g.fillRect(0, 1, 32, 6);
            g.fillStyle = levelTheme === 6 ? '#ffffff' : '#7be07d';
            g.fillRect(0, 1, 32, 2);
          } else if (levelTheme === 4) {
            // BICYCLE TRACK ASPHALT & CURB (MUNDO 1-4)
            g.fillStyle = '#1e293b';
            g.fillRect(0, 0, 32, 32);
            // Paved asphalt top surface
            g.fillStyle = '#334155';
            g.fillRect(0, 0, 32, 12);
            g.fillStyle = '#475569';
            g.fillRect(0, 1, 32, 3);
            // Red & white bike lane curb + dashed yellow line
            g.fillStyle = '#facc15';
            g.fillRect(4, 6, 10, 2);
            g.fillRect(20, 6, 8, 2);
            g.fillStyle = '#22c55e';
            g.fillRect(0, 11, 32, 3);
            // Cobblestone base under bike track
            g.fillStyle = '#64748b';
            g.fillRect(2, 16, 13, 12);
            g.fillRect(17, 16, 13, 12);
          } else if (levelTheme === 2 || levelTheme === 5) {
            g.fillStyle = '#1f2430';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = levelTheme === 5 ? '#1e3a8a' : '#3a4459';
            g.fillRect(2, 10, 13, 10);
            g.fillRect(17, 10, 13, 10);
            g.fillRect(2, 22, 20, 8);
            g.fillRect(24, 22, 6, 8);
            g.fillStyle = levelTheme === 5 ? '#38bdf8' : '#586580';
            g.fillRect(3, 11, 11, 2);
            g.fillRect(18, 11, 11, 2);

            g.fillStyle = levelTheme === 5 ? '#0284c7' : '#6e4220';
            g.fillRect(0, 0, 32, 9);
            g.fillStyle = levelTheme === 5 ? '#38bdf8' : '#a36836';
            g.fillRect(0, 1, 32, 6);
            g.fillStyle = levelTheme === 5 ? '#bae6fd' : '#d4975c';
            g.fillRect(0, 1, 32, 2);
          } else {
            g.fillStyle = '#141720';
            g.fillRect(0, 0, 32, 32);
            const bricks = [
              [1, 1, 14, 14], [17, 1, 14, 14],
              [1, 17, 21, 14], [24, 17, 7, 14]
            ];
            bricks.forEach(([bx, by, bw, bh]) => {
              g.fillStyle = '#333b52';
              g.fillRect(bx, by, bw, bh);
              g.fillStyle = '#4e5978';
              g.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
              g.fillStyle = '#7583a6';
              g.fillRect(bx + 1, by + 1, bw - 3, 2);
              g.fillRect(bx + 1, by + 1, 2, bh - 3);
            });
          }
          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x, y, size, size);

        // If this is a TURBO BOOST PAD ('T') on the bicycle road, draw glowing animated chevrons!
        if (type === 'T') {
          const pulse = Math.floor(time * 12) % 3;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 1, y, size - 2, 10);
          for (let i = 0; i < 3; i++) {
            const active = i === pulse;
            ctx.fillStyle = active ? '#fde047' : '#38bdf8';
            const cx = x + 5 + i * 9;
            ctx.beginPath();
            ctx.moveTo(cx, y + 2);
            ctx.lineTo(cx + 6, y + 5);
            ctx.lineTo(cx, y + 8);
            ctx.closePath();
            ctx.fill();
          }
        }
        break;
      }

      case 'B': {
        const key = `snes_brick_${levelTheme}`;
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');

          g.fillStyle = '#1f0c05';
          g.fillRect(0, 0, 32, 32);

          const rows = [
            { y: 1, h: 7, offsets: [1, 17] },
            { y: 9, h: 7, offsets: [-7, 9, 25] },
            { y: 17, h: 7, offsets: [1, 17] },
            { y: 25, h: 6, offsets: [-7, 9, 25] }
          ];

          rows.forEach(r => {
            r.offsets.forEach(ox => {
              const bx = Math.max(0, ox);
              const bw = Math.min(32, ox + 15) - bx;
              if (bw <= 0) return;
              g.fillStyle = '#702912';
              g.fillRect(bx, r.y, bw, r.h);
              g.fillStyle = '#a84422';
              g.fillRect(bx, r.y, bw - 1, r.h - 1);
              g.fillStyle = '#de6d43';
              g.fillRect(bx, r.y, bw - 2, 2);
            });
          });
          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x, y, size, size);
        break;
      }

      case '?':
      case 'M':
      case 'S':
      case 'L': {
        const frame = Math.floor(time * 6) % 4;
        const key = `snes_qblock_${frame}`;
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');

          const bgColors = ['#db7f00', '#f59e0b', '#fbbf24', '#f59e0b'];
          const hiColors = ['#fde047', '#fef08a', '#ffffff', '#fef08a'];

          g.fillStyle = '#1f1004';
          g.fillRect(0, 0, 32, 32);

          g.fillStyle = '#854200';
          g.fillRect(1, 1, 30, 30);

          g.fillStyle = bgColors[frame];
          g.fillRect(2, 2, 27, 27);

          g.fillStyle = hiColors[frame];
          g.fillRect(2, 2, 27, 3);
          g.fillRect(2, 2, 3, 27);

          g.fillStyle = '#472100';
          g.fillRect(4, 4, 3, 3);
          g.fillRect(25, 4, 3, 3);
          g.fillRect(4, 25, 3, 3);
          g.fillRect(25, 25, 3, 3);

          g.fillStyle = '#472100';
          g.fillRect(12, 8, 10, 4);
          g.fillRect(18, 12, 4, 5);
          g.fillRect(14, 15, 6, 4);
          g.fillRect(14, 22, 4, 4);

          g.fillStyle = '#fffbeb';
          g.fillRect(11, 7, 10, 4);
          g.fillRect(17, 11, 4, 5);
          g.fillRect(13, 14, 6, 4);
          g.fillRect(13, 21, 4, 4);

          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x, y, size, size);
        break;
      }

      case 'E': {
        const key = 'snes_empty_block';
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');
          g.fillStyle = '#1a1412';
          g.fillRect(0, 0, 32, 32);
          g.fillStyle = '#5c493f';
          g.fillRect(1, 1, 30, 30);
          g.fillStyle = '#7d665a';
          g.fillRect(3, 3, 26, 26);
          g.fillStyle = '#2e221d';
          g.fillRect(4, 4, 3, 3);
          g.fillRect(25, 4, 3, 3);
          g.fillRect(4, 25, 3, 3);
          g.fillRect(25, 25, 3, 3);
          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x, y, size, size);
        break;
      }

      case 'H': {
        const key = 'snes_hard_block';
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');
          g.fillStyle = '#141824';
          g.fillRect(0, 0, 32, 32);

          g.fillStyle = '#d8b4fe';
          g.fillRect(1, 1, 30, 30);

          g.fillStyle = '#4c1d95';
          g.beginPath();
          g.moveTo(31, 1);
          g.lineTo(31, 31);
          g.lineTo(1, 31);
          g.closePath();
          g.fill();

          g.fillStyle = '#7c3aed';
          g.fillRect(5, 5, 22, 22);
          g.fillStyle = '#a78bfa';
          g.fillRect(6, 6, 20, 2);
          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x, y, size, size);
        break;
      }

      case 'P':
      case 'p': {
        const key = `snes_pipe_${type}`;
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');

          const bands = [
            { x: 1, w: 3, c: '#0a2e12' },
            { x: 4, w: 4, c: '#155724' },
            { x: 8, w: 5, c: '#288f3d' },
            { x: 13, w: 5, c: '#67d67a' },
            { x: 18, w: 3, c: '#b8f5c2' },
            { x: 21, w: 4, c: '#38a84f' },
            { x: 25, w: 4, c: '#196129' },
            { x: 29, w: 2, c: '#0a2e12' }
          ];

          g.fillStyle = '#061a0a';
          g.fillRect(0, 0, 32, 32);
          bands.forEach(b => {
            g.fillStyle = b.c;
            g.fillRect(b.x, 0, b.w, 32);
          });

          if (type === 'P') {
            g.fillStyle = '#061a0a';
            g.fillRect(0, 12, 32, 3);
            g.fillStyle = '#b8f5c2';
            g.fillRect(2, 1, 28, 2);
          }
          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x, y, size, size);
        break;
      }

      case 'J': {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y - 16);
        ctx.lineTo(x + size / 2, y + 4);
        ctx.stroke();

        const ballGrad = ctx.createRadialGradient(
          x + size / 2 - 4,
          y + size / 2 - 2,
          2,
          x + size / 2,
          y + size / 2 + 2,
          size / 2
        );
        ballGrad.addColorStop(0, '#fca5a5');
        ballGrad.addColorStop(0.35, '#dc2626');
        ballGrad.addColorStop(1, '#450a0a');

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2 + 2, size / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#180404';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#18181b';
        ctx.fillRect(x + 2, y + size / 2 - 2, size - 4, 6);
        break;
      }

      case '=': {
        ctx.fillStyle = '#451a03';
        this.roundRect(ctx, x + 1, y + 1, size - 2, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#92400e';
        this.roundRect(ctx, x + 3, y + 2, size - 6, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 5, y + 3, size - 10, 3);
        break;
      }

      case 'A': {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 12, y + 12, 6, 18);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x + 18, y + 12, 11, -Math.PI * 0.6, Math.PI * 0.6);
        ctx.lineTo(x + 12, y + 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }

      case 'C': {
        // 16-BIT SNES FLUFFY CLOUD TILE (Nube esponjosa para el nivel de vuelo)
        const key = 'snes_cloud_tile';
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 36;
          cnv.height = 36;
          const g = cnv.getContext('2d');

          // Outer dark-blue 16-bit pixel outline
          g.fillStyle = '#1e3a8a';
          g.beginPath();
          g.arc(10, 18, 9, 0, Math.PI * 2);
          g.arc(18, 13, 11, 0, Math.PI * 2);
          g.arc(26, 18, 9, 0, Math.PI * 2);
          g.arc(14, 23, 8, 0, Math.PI * 2);
          g.arc(22, 23, 8, 0, Math.PI * 2);
          g.fill();

          // Soft sky-blue lower cloud shading
          g.fillStyle = '#bfdbfe';
          g.beginPath();
          g.arc(10, 18, 7.5, 0, Math.PI * 2);
          g.arc(18, 13, 9.5, 0, Math.PI * 2);
          g.arc(26, 18, 7.5, 0, Math.PI * 2);
          g.arc(14, 22, 6.5, 0, Math.PI * 2);
          g.arc(22, 22, 6.5, 0, Math.PI * 2);
          g.fill();

          // Pure white fluffy upper cloud highlight
          g.fillStyle = '#ffffff';
          g.beginPath();
          g.arc(10, 16, 6.2, 0, Math.PI * 2);
          g.arc(18, 12, 8.2, 0, Math.PI * 2);
          g.arc(25, 16, 6.2, 0, Math.PI * 2);
          g.fill();

          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x - 2, y - 2, size + 4, size + 4);
        break;
      }
    }
    ctx.restore();
  }

  // ==========================================================================
  // 16-BIT SNES ITEMS & POWER-UPS (SUPER MUSHROOM, 1-UP MUSHROOM, SUPER STAR)
  // ==========================================================================
  drawItem(ctx, item, time) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const x = Math.round(item.x);
    const y = Math.round(item.y + Math.sin(time * 5 + item.x) * 1.5);
    const w = item.w;
    const h = item.h;
    const cx = x + w / 2;
    const cy = y + h / 2;

    if (item.type === 'coin') {
      const scaleX = 0.25 + 0.75 * Math.abs(Math.cos(time * 5 + item.x * 0.04));
      ctx.translate(cx, cy);
      ctx.scale(scaleX, 1);

      ctx.fillStyle = '#1f1000';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-3, -6, 3, 12);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, -6, 2, 12);
    } else if (item.type === 'cupcake' || item.type === 'mushroom') {
      // 16-Bit SNES Super Mushroom (Hongo Mágico Rojo)
      const img = this.images.mushroom;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, Math.round(cx - 19), Math.round(y + h - 38), 38, 38);
      }
    } else if (item.type === 'oneup') {
      // 16-Bit SNES 1-UP Green Mushroom (Hongo Verde)
      const img = this.images.oneup;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, Math.round(cx - 19), Math.round(y + h - 38), 38, 38);
      }
    } else if (item.type === 'magic_wand' || item.type === 'rainbow') {
      // 16-Bit SNES Magical Rainbow Power-Up (da a Ámbar el poder de lanzar Haces de Luz!)
      const img = this.images.rainbow;
      if (img && img.complete && img.naturalWidth > 0) {
        const hue = Math.floor((time * 360) % 360);
        ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
        ctx.shadowBlur = 10;
        ctx.drawImage(img, Math.round(cx - 23), Math.round(y + h - 36), 46, 36);
      }
    } else if (item.type === 'star') {
      // 16-Bit SNES Invincibility Super Star (Estrella de Invencibilidad)
      const img = this.images.star;
      if (img && img.complete && img.naturalWidth > 0) {
        const hue = Math.floor((time * 480) % 360);
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.drawImage(img, Math.round(cx - 20), Math.round(y + h - 40), 40, 40);
      }
    }
    ctx.restore();
  }

  // ==========================================================================
  // 16-BIT SNES LIGHT BEAM PROJECTILE ("HAZ DE LUZ" DE ÁMBAR)
  // ==========================================================================
  drawRainbowProjectile(ctx, pr, time) {
    ctx.save();
    const cx = Math.round(pr.x + pr.w / 2);
    const cy = Math.round(pr.y + pr.h / 2);
    ctx.translate(cx, cy);
    if (pr.vx < 0) ctx.scale(-1, 1);

    const pulse = 0.88 + 0.22 * Math.sin(time * 38);
    const hue = Math.floor((time * 420 + pr.x * 2) % 360);

    // Outer radiant prismatic light halo
    ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
    ctx.shadowBlur = 14;

    // Trailing light streaks behind the beam
    const trailGrad = ctx.createLinearGradient(-28, 0, 16, 0);
    trailGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    trailGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.65)');
    trailGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.92)');
    trailGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = trailGrad;
    this.roundRect(ctx, -28, Math.round(-6 * pulse), 42, Math.round(12 * pulse), 6);
    ctx.fill();

    // Secondary golden/cyan energy wave lines
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.lineTo(10, -4);
    ctx.moveTo(-22, 4);
    ctx.lineTo(10, 4);
    ctx.stroke();

    // Intense pure-white laser core ("Haz de Luz" central)
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, -16, -3, 30, 6, 3);
    ctx.fill();

    // Glowing star-flash at the tip of the light beam
    this.drawStarShape(ctx, 13, 0, 4, 8 * pulse, 3, '#ffffff', '#fde047');

    ctx.restore();
  }

  drawStarShape(ctx, cx, cy, spikes, outerR, innerR, fillStyle = null, strokeStyle = null) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.closePath();
    if (fillStyle) ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // ==========================================================================
  // 16-BIT SNES MOVING PLATFORMS
  // ==========================================================================
  drawPlatform(ctx, plat, time) {
    ctx.save();
    const x = Math.round(plat.x);
    const y = Math.round(plat.y);
    const w = plat.w;
    const h = plat.h;
    ctx.strokeStyle = '#140c1c';
    ctx.lineWidth = 2;

    if (plat.style === 'train') {
      ctx.fillStyle = '#9a5b25';
      this.roundRect(ctx, x + 6, y - 16, 30, 22, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c88246';
      ctx.fillRect(x + 8, y - 14, 26, 18);

      ctx.fillStyle = '#5c3412';
      this.roundRect(ctx, x + 2, y - 20, 38, 5, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#291507';
      ctx.beginPath();
      ctx.arc(x + 21, y - 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b56e33';
      this.roundRect(ctx, x + 40, y - 11, w - 46, 17, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#deb078';
      ctx.fillRect(x + 42, y - 9, w - 50, 3);

      ctx.fillStyle = '#784218';
      this.roundRect(ctx, x, y + 4, w, h - 4, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b56e33';
      ctx.fillRect(x + 2, y + 6, w - 4, 4);

      const wheelX = [x + 16, x + 40, x + w - 40, x + w - 16];
      wheelX.forEach(wx => {
        ctx.save();
        ctx.translate(wx, y + h);
        ctx.rotate(time * 3 * Math.sign(plat.vx || 1));

        ctx.fillStyle = '#d99b52';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    } else {
      ctx.fillStyle = '#cbd5e1';
      this.roundRect(ctx, x, y + 2, w, h - 4, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 4, y + 4, w - 8, 4);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 4, y + h - 7, w - 8, 3);
    }
    ctx.restore();
  }

  drawStarCoin(ctx, sc, time) {
    const cx = Math.round(sc.x + sc.w / 2);
    const cy = Math.round(sc.y + sc.h / 2 + Math.sin(time * 4 + sc.x * 0.05) * 3);
    const rot = Math.cos(time * 3.5 + sc.x * 0.05);

    ctx.save();
    ctx.translate(cx, cy);

    // Glowing Star Halo
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;

    // Coin outer rim (spinning around Y)
    ctx.scale(Math.abs(rot) < 0.1 ? 0.1 : rot, 1);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Embossed Star in center
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const aOuter = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const aInner = aOuter + Math.PI / 5;
      const rOuter = 8.5;
      const rInner = 4.0;
      if (i === 0) ctx.moveTo(Math.cos(aOuter) * rOuter, Math.sin(aOuter) * rOuter);
      else ctx.lineTo(Math.cos(aOuter) * rOuter, Math.sin(aOuter) * rOuter);
      ctx.lineTo(Math.cos(aInner) * rInner, Math.sin(aInner) * rInner);
    }
    ctx.closePath();
    ctx.fill();

    // Specular shine highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-5, -8, 4, 3);

    ctx.restore();
  }

  // ==========================================================================
  // 16-BIT SNES ENEMIES & KOOPA SHELL (RENDERED FROM EXTRACTED 16-BIT SPRITES)
  // ==========================================================================
  drawEnemy(ctx, enemy, time, theme = 1) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const x = Math.round(enemy.x);
    const y = Math.round(enemy.y);
    const w = enemy.w;
    const h = enemy.h;
    const cx = x + w / 2;
    const bottomY = y + h;

    if (enemy.type === 'goomba') {
      const img = this.images.goomba;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.translate(cx, bottomY);
        if (enemy.squished) {
          ctx.scale(1.25, 0.45);
          ctx.drawImage(img, -25, -50, 50, 50);
        } else {
          const waddle = Math.sin(time * 12) * 0.08;
          const bob = Math.abs(Math.sin(time * 12)) * -2.5;
          ctx.rotate(waddle);
          ctx.drawImage(img, -25, -50 + bob, 50, 50);

          // Thematic enemy accessories (16-bit retro detail!)
          if (theme === 4) {
            // Beach Mode: Cool Retro Sunglasses!
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-16, -35 + bob, 12, 8);
            ctx.fillRect(4, -35 + bob, 12, 8);
            ctx.fillRect(-4, -33 + bob, 8, 3);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-14, -34 + bob, 3, 2);
            ctx.fillRect(6, -34 + bob, 3, 2);
          } else if (theme === 2) {
            // Snow Mode: Cozy Winter Beanie with Pom-pom!
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(0, -48 + bob, 14, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#1d4ed8';
            ctx.fillRect(-14, -48 + bob, 28, 4);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -62 + bob, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (theme === 3) {
            // Castle Mode: Spiked Iron Helmet / Horns!
            ctx.fillStyle = '#64748b';
            ctx.fillRect(-12, -50 + bob, 24, 4);
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(-10, -50 + bob);
            ctx.lineTo(-14, -58 + bob);
            ctx.lineTo(-6, -50 + bob);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(10, -50 + bob);
            ctx.lineTo(14, -58 + bob);
            ctx.lineTo(6, -50 + bob);
            ctx.fill();
          } else if (theme === 6) {
            // Sky Mode: Fluttering Angel Wings!
            const wingFlap = Math.sin(time * 24) * 6;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(-24, -30 + bob + wingFlap * 0.3, 10, 5, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(24, -30 + bob - wingFlap * 0.3, 10, 5, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    } else if (enemy.type === 'koopa') {
      if (enemy.inShell) {
        // 16-Bit SNES Koopa Troopa Shell!
        const shellImg = this.images.shell;
        ctx.translate(cx, bottomY);
        if (Math.abs(enemy.vx) > 0.5) {
          // Spinning shell wobble & flip effect
          const spinScale = Math.cos(time * 28) >= 0 ? 1 : -1;
          ctx.scale(spinScale, 1);
        }
        if (shellImg && shellImg.complete && shellImg.naturalWidth > 0) {
          ctx.drawImage(shellImg, -21, -38, 42, 38);
        }
        ctx.restore();
        return;
      }

      const img = this.images.koopa;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.translate(cx, bottomY);
        if (enemy.vx > 0) ctx.scale(-1, 1);
        const bob = Math.abs(Math.sin(time * 10)) * -3;
        ctx.drawImage(img, -27, -60 + bob, 54, 60);
      }
    } else if (enemy.type === 'robot') {
      const img = this.images.robot;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.translate(cx, bottomY);
        if (enemy.vx < 0) ctx.scale(-1, 1);
        const bob = Math.abs(Math.sin(time * 14)) * -2;
        ctx.drawImage(img, -29, -54 + bob, 58, 54);
      }
    } else if (enemy.type === 'cloud') {
      // 16-Bit SNES Winged Dragon-Koopa Cloud Rider (2-Frame Wing-Flapping Animation!)
      const cloudFrames = this.images.cloud;
      const flapIdx = Math.floor(time * 9 + enemy.x * 0.03) % 2;
      const img = Array.isArray(cloudFrames)
        ? (cloudFrames[flapIdx] || cloudFrames[0])
        : cloudFrames;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.translate(cx, bottomY);
        if (enemy.vx > 0) ctx.scale(-1, 1);
        if (enemy.squished) {
          ctx.scale(1.25, 0.45);
          ctx.drawImage(img, -31, -62, 62, 62);
        } else {
          const hover = Math.sin(time * 10 + enemy.x * 0.05) * 3.5;
          const tilt = Math.sin(time * 8) * 0.04;
          ctx.rotate(tilt);
          ctx.drawImage(img, -31, -62 + hover, 62, 62);
        }
      }
    } else if (enemy.type === 'boss') {
      const img = this.images.boss;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.translate(cx, bottomY);
        if (enemy.vx > 0) ctx.scale(-1, 1);
        if (enemy.hurtTimer > 0 && Math.floor(time * 20) % 2 === 0) {
          ctx.filter = 'brightness(1.8) sepia(1) hue-rotate(-50deg) saturate(4)';
        }
        const hover = Math.sin(time * 5) * 3.5;
        ctx.drawImage(img, -49, -92 + hover, 98, 92);
        ctx.restore();
      }

      const maxHp = enemy.maxHp || 5;
      const barW = 68;
      const barX = cx - barW / 2;
      const barY = y - 28;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(barX - 2, barY - 2, barW + 4, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, (barW * Math.max(0, enemy.hp)) / maxHp, 6);
    }
    ctx.restore();
  }
}

window.spriteRenderer = new SpriteRenderer();
