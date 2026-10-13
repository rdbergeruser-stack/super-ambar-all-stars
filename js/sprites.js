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

          if (levelTheme === 1) {
            // THEME 1: PRADERA ARCOÍRIS (Grassland)
            g.fillStyle = '#3d1e10';
            g.fillRect(0, 0, 32, 32);

            const stones = [
              { x: 2, y: 11, w: 12, h: 9 },
              { x: 16, y: 12, w: 14, h: 8 },
              { x: 1, y: 22, w: 9, h: 8 },
              { x: 12, y: 21, w: 11, h: 9 },
              { x: 25, y: 22, w: 6, h: 8 }
            ];
            stones.forEach(st => {
              g.fillStyle = '#6e3b20';
              g.fillRect(st.x, st.y, st.w, st.h);
              g.fillStyle = '#9c5a35';
              g.fillRect(st.x + 1, st.y + 1, st.w - 2, st.h - 2);
              g.fillStyle = '#c47d52';
              g.fillRect(st.x + 1, st.y + 1, st.w - 3, 2);
              g.fillRect(st.x + 1, st.y + 1, 2, st.h - 3);
            });

            g.fillStyle = '#0f3818';
            g.fillRect(0, 0, 32, 11);
            g.fillStyle = '#1f6e2c';
            g.fillRect(0, 0, 32, 9);
            g.fillStyle = '#38a845';
            g.fillRect(0, 1, 32, 6);
            g.fillStyle = '#7be07d';
            g.fillRect(0, 1, 32, 2);

          } else if (levelTheme === 2) {
            // THEME 2: TALLER DE JUGUETES (Polished Oak Wood Planks)
            g.fillStyle = '#271004';
            g.fillRect(0, 0, 32, 32);

            // 3 horizontal wooden planks
            const planks = [0, 11, 22];
            planks.forEach((py, idx) => {
              const ph = idx === 2 ? 10 : 10;
              g.fillStyle = '#5c2c08';
              g.fillRect(0, py, 32, ph);
              g.fillStyle = '#85420a';
              g.fillRect(0, py + 1, 32, ph - 2);
              g.fillStyle = '#b45309';
              g.fillRect(0, py + 1, 32, 2);

              // Wood grain lines
              g.fillStyle = '#d97706';
              g.fillRect(4, py + 4, 14, 1);
              g.fillRect(21, py + 6, 8, 1);

              // Brass nail heads at plank ends
              g.fillStyle = '#fde047';
              g.fillRect(2, py + 2, 2, 2);
              g.fillRect(28, py + 2, 2, 2);
              g.fillStyle = '#451a03';
              g.fillRect(3, py + 3, 1, 1);
              g.fillRect(29, py + 3, 1, 1);
            });

          } else if (levelTheme === 3) {
            // THEME 3: PALACIO DE DULCES (Strawberry Wafer & Frosting)
            g.fillStyle = '#4a044e';
            g.fillRect(0, 0, 32, 32);

            // Waffle wafer grid base
            g.fillStyle = '#831843';
            g.fillRect(1, 10, 30, 21);
            g.fillStyle = '#9d174d';
            for (let wx = 3; wx < 30; wx += 6) {
              for (let wy = 12; wy < 30; wy += 6) {
                g.fillStyle = '#db2777';
                g.fillRect(wx, wy, 4, 4);
                g.fillStyle = '#f472b6';
                g.fillRect(wx, wy, 3, 1);
              }
            }

            // Thick wavy white sugar frosting layer dripping down
            g.fillStyle = '#fbcfe8';
            g.fillRect(0, 0, 32, 10);
            g.fillStyle = '#ffffff';
            g.fillRect(0, 0, 32, 7);

            // Scalloped frosting drips
            const drips = [2, 8, 14, 21, 27];
            drips.forEach((dx, i) => {
              const dh = 4 + (i % 3) * 2;
              g.fillStyle = '#ffffff';
              g.fillRect(dx, 7, 4, dh);
              g.fillRect(dx + 1, 7 + dh, 2, 2);
            });

            // Sugar sprinkles (red, yellow, cyan)
            g.fillStyle = '#f43f5e';
            g.fillRect(4, 2, 3, 2);
            g.fillStyle = '#facc15';
            g.fillRect(16, 3, 3, 2);
            g.fillStyle = '#38bdf8';
            g.fillRect(25, 2, 3, 2);

          } else if (levelTheme === 4) {
            // THEME 4: PLAYA COSTERA (Paved Bike Asphalt & Golden Sand Edge)
            g.fillStyle = '#1e293b';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#334155';
            g.fillRect(0, 0, 32, 12);
            g.fillStyle = '#475569';
            g.fillRect(0, 1, 32, 3);

            // Yellow bike lane dashed line
            g.fillStyle = '#facc15';
            g.fillRect(4, 6, 10, 2);
            g.fillRect(20, 6, 8, 2);

            // Golden tropical beach sand curb
            g.fillStyle = '#d97706';
            g.fillRect(0, 11, 32, 3);
            g.fillStyle = '#f59e0b';
            g.fillRect(0, 12, 32, 2);

            // Cobblestone foundation
            g.fillStyle = '#64748b';
            g.fillRect(2, 16, 13, 12);
            g.fillRect(17, 16, 13, 12);
            g.fillStyle = '#94a3b8';
            g.fillRect(3, 17, 11, 2);
            g.fillRect(18, 17, 11, 2);

          } else if (levelTheme === 5) {
            // THEME 5: CAVERNA AMATISTA (Faceted Purple Crystal Rock)
            g.fillStyle = '#0f051d';
            g.fillRect(0, 0, 32, 32);

            // Deep violet rock body
            g.fillStyle = '#2e1065';
            g.fillRect(1, 9, 30, 22);

            // Glowing faceted amethyst crystal shards inside rock
            const gems = [
              { x: 3, y: 13, w: 11, h: 8, c: '#7e22ce', hi: '#c084fc' },
              { x: 17, y: 12, w: 12, h: 9, c: '#9333ea', hi: '#e9d5ff' },
              { x: 5, y: 22, w: 10, h: 8, c: '#6b21a8', hi: '#a855f7' },
              { x: 18, y: 23, w: 11, h: 7, c: '#0891b2', hi: '#22d3ee' } // Teal geode speck!
            ];
            gems.forEach(gm => {
              g.fillStyle = gm.c;
              g.fillRect(gm.x, gm.y, gm.w, gm.h);
              g.fillStyle = gm.hi;
              g.fillRect(gm.x + 1, gm.y + 1, gm.w - 2, 2);
              g.fillRect(gm.x + 1, gm.y + 1, 2, gm.h - 2);
            });

            // Glistening amethyst top rim
            g.fillStyle = '#581c87';
            g.fillRect(0, 0, 32, 10);
            g.fillStyle = '#9333ea';
            g.fillRect(0, 0, 32, 8);
            g.fillStyle = '#c084fc';
            g.fillRect(0, 1, 32, 5);
            g.fillStyle = '#fae8ff';
            g.fillRect(0, 1, 32, 2);

          } else if (levelTheme === 6) {
            // THEME 6: CIELO DE ALGODÓN (Pure White Fluffy Cloud Mounds)
            g.fillStyle = '#0369a1';
            g.fillRect(0, 0, 32, 32);

            g.fillStyle = '#38bdf8';
            g.fillRect(0, 9, 32, 23);
            g.fillStyle = '#7dd3fc';
            g.fillRect(0, 14, 32, 18);

            // Puffy cloud lobes
            g.fillStyle = '#bae6fd';
            g.beginPath();
            g.arc(8, 12, 10, 0, Math.PI * 2);
            g.arc(24, 12, 10, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = '#e0f2fe';
            g.beginPath();
            g.arc(8, 9, 9, 0, Math.PI * 2);
            g.arc(24, 9, 9, 0, Math.PI * 2);
            g.arc(16, 7, 10, 0, Math.PI * 2);
            g.fill();

            // Cloud top highlight
            g.fillStyle = '#ffffff';
            g.fillRect(0, 0, 32, 8);
            g.beginPath();
            g.arc(8, 6, 8, 0, Math.PI * 2);
            g.arc(24, 6, 8, 0, Math.PI * 2);
            g.arc(16, 4, 9, 0, Math.PI * 2);
            g.fill();

          } else if (levelTheme === 7) {
            // THEME 7: VUELO HEROICO EN LA ESTRATOSFERA (Twilight Stardust Aerocrystal)
            g.fillStyle = '#0b0a26';
            g.fillRect(0, 0, 32, 32);

            // Indigo celestial bedrock
            g.fillStyle = '#1e1b4b';
            g.fillRect(1, 9, 30, 22);

            // Stardust crystals
            g.fillStyle = '#3730a3';
            g.fillRect(3, 12, 12, 9);
            g.fillRect(17, 13, 12, 8);
            g.fillStyle = '#6366f1';
            g.fillRect(4, 13, 10, 2);
            g.fillRect(18, 14, 10, 2);

            // Aurora borealis glowing green & cyan crest
            g.fillStyle = '#1e1b4b';
            g.fillRect(0, 0, 32, 10);
            g.fillStyle = '#4f46e5';
            g.fillRect(0, 0, 32, 8);
            g.fillStyle = '#34d399'; // Emerald aurora glow
            g.fillRect(0, 1, 32, 5);
            g.fillStyle = '#a7f3d0';
            g.fillRect(0, 1, 32, 2);

          } else if (levelTheme === 8) {
            // THEME 8: GRAN FORTALEZA VOLCÁNICA (Black Obsidian & Molten Magma Cracks)
            g.fillStyle = '#09090b';
            g.fillRect(0, 0, 32, 32);

            // Obsidian fortress bricks
            const obsBlocks = [
              { x: 1, y: 1, w: 14, h: 14 },
              { x: 17, y: 1, w: 14, h: 14 },
              { x: 1, y: 17, w: 14, h: 14 },
              { x: 17, y: 17, w: 14, h: 14 }
            ];
            obsBlocks.forEach(b => {
              g.fillStyle = '#18181b';
              g.fillRect(b.x, b.y, b.w, b.h);
              g.fillStyle = '#27272a';
              g.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
              g.fillStyle = '#3f3f46';
              g.fillRect(b.x + 1, b.y + 1, b.w - 3, 2);
            });

            // Fiery Molten Magma Cracks glowing between bricks!
            g.fillStyle = '#7f1d1d';
            g.fillRect(0, 15, 32, 2);
            g.fillRect(15, 0, 2, 32);
            g.fillStyle = '#dc2626';
            g.fillRect(1, 15, 30, 1);
            g.fillRect(15, 1, 1, 30);
            g.fillStyle = '#f87171';
            g.fillRect(15, 15, 2, 2);

          } else {
            // THEME 9: LA VÍA LÁCTEA ESTELAR (Cosmic Neon Highway)
            g.fillStyle = '#030712';
            g.fillRect(0, 0, 32, 32);

            // Deep cyber grid
            g.fillStyle = '#0f172a';
            g.fillRect(2, 2, 28, 28);

            // Neon cyan edge circuits
            g.fillStyle = '#06b6d4';
            g.fillRect(0, 0, 32, 2);
            g.fillRect(0, 30, 32, 2);
            g.fillStyle = '#22d3ee';
            g.fillRect(4, 4, 24, 2);

            // Glowing neon magenta star node in center
            g.fillStyle = '#f43f5e';
            g.fillRect(14, 14, 4, 4);
            g.fillStyle = '#fb7185';
            g.fillRect(15, 15, 2, 2);
            g.fillStyle = '#38bdf8';
            g.fillRect(6, 15, 4, 2);
            g.fillRect(22, 15, 4, 2);
          }
          this.cache[key] = cnv;
        }
        ctx.drawImage(this.cache[key], x, y, size, size);

        // If this is a TURBO BOOST PAD ('T') on the road, draw glowing animated chevrons!
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

          if (levelTheme === 2) {
            // THEME 2: Wooden Toy Puzzle Blocks with Brass Corner Brackets
            g.fillStyle = '#451a03';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#92400e';
            g.fillRect(2, 2, 28, 28);
            g.fillStyle = '#b45309';
            g.fillRect(4, 4, 24, 24);
            g.fillStyle = '#d97706';
            g.fillRect(4, 4, 24, 3);
            g.fillRect(4, 4, 3, 24);

            // Brass brackets
            g.fillStyle = '#f59e0b';
            g.fillRect(2, 2, 6, 6);
            g.fillRect(24, 2, 6, 6);
            g.fillRect(2, 24, 6, 6);
            g.fillRect(24, 24, 6, 6);
            g.fillStyle = '#fde68a';
            g.fillRect(3, 3, 3, 3);
            g.fillRect(25, 3, 3, 3);

          } else if (levelTheme === 3) {
            // THEME 3: Strawberry Waffle Wafer Blocks with Sugar Icing
            g.fillStyle = '#701a75';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#be185d';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#db2777';
            g.fillRect(3, 3, 26, 26);
            g.fillStyle = '#f472b6';
            g.fillRect(3, 3, 26, 3);
            g.fillRect(3, 3, 3, 26);

            // Waffle grid grooves
            g.fillStyle = '#9d174d';
            g.fillRect(15, 3, 2, 26);
            g.fillRect(3, 15, 26, 2);

            // White icing frosting dots
            g.fillStyle = '#ffffff';
            g.fillRect(7, 7, 4, 4);
            g.fillRect(21, 7, 4, 4);
            g.fillRect(7, 21, 4, 4);
            g.fillRect(21, 21, 4, 4);

          } else if (levelTheme === 4) {
            // THEME 4: Coral Sandstone Blocks
            g.fillStyle = '#7c2d12';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#c2410c';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#ea580c';
            g.fillRect(2, 2, 28, 28);
            g.fillStyle = '#fed7aa';
            g.fillRect(2, 2, 28, 3);
            g.fillRect(2, 2, 3, 28);

          } else if (levelTheme === 5) {
            // THEME 5: Faceted Purple Amethyst Gem Blocks
            g.fillStyle = '#1e113a';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#581c87';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#7e22ce';
            g.fillRect(3, 3, 26, 26);

            // Gem facets
            g.fillStyle = '#a855f7';
            g.beginPath();
            g.moveTo(3, 3);
            g.lineTo(16, 16);
            g.lineTo(29, 3);
            g.closePath();
            g.fill();

            g.fillStyle = '#c084fc';
            g.fillRect(14, 14, 4, 4);
            g.fillStyle = '#ffffff';
            g.fillRect(15, 15, 2, 2);

          } else if (levelTheme === 6) {
            // THEME 6: Ethereal Sky Cloud Blocks
            g.fillStyle = '#0369a1';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#0284c7';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#38bdf8';
            g.fillRect(3, 3, 26, 26);
            g.fillStyle = '#ffffff';
            g.fillRect(3, 3, 26, 4);
            g.fillRect(3, 3, 4, 26);
            g.fillStyle = '#e0f2fe';
            g.fillRect(8, 8, 16, 16);

          } else if (levelTheme === 7) {
            // THEME 7: Twilight Celestial Star-Metal Blocks
            g.fillStyle = '#0f0c2e';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#312e81';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#4f46e5';
            g.fillRect(3, 3, 26, 26);
            g.fillStyle = '#818cf8';
            g.fillRect(3, 3, 26, 3);
            g.fillRect(3, 3, 3, 26);

            // Glowing star rune in center
            g.fillStyle = '#facc15';
            g.fillRect(15, 10, 2, 12);
            g.fillRect(10, 15, 12, 2);
            g.fillRect(13, 13, 6, 6);

          } else if (levelTheme === 8) {
            // THEME 8: Volcanic Dark Basalt Fortress Blocks with Embers
            g.fillStyle = '#09090b';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#18181b';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#27272a';
            g.fillRect(3, 3, 26, 26);
            g.fillStyle = '#3f3f46';
            g.fillRect(3, 3, 26, 3);
            g.fillRect(3, 3, 3, 26);

            // Smoldering red lava seams
            g.fillStyle = '#dc2626';
            g.fillRect(6, 15, 20, 2);
            g.fillStyle = '#fca5a5';
            g.fillRect(14, 15, 4, 2);

          } else if (levelTheme === 9) {
            // THEME 9: Cosmic Neon Prism Hyper-Cube Blocks
            g.fillStyle = '#030712';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#0f172a';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#0891b2';
            g.fillRect(2, 2, 28, 2);
            g.fillRect(2, 2, 2, 28);
            g.fillStyle = '#f43f5e';
            g.fillRect(2, 28, 28, 2);
            g.fillRect(28, 2, 2, 28);

            // Glowing pulsing yellow core
            g.fillStyle = '#facc15';
            g.fillRect(12, 12, 8, 8);
            g.fillStyle = '#ffffff';
            g.fillRect(14, 14, 4, 4);

          } else {
            // Classic Terracotta Bricks (Theme 1 & fallback)
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
          }
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
        const key = `snes_pipe_${type}_${levelTheme}`;
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');

          let bands, bgCol, rimCol;
          if (levelTheme === 2) {
            // THEME 2: Polished Workshop Brass Steam Pipe
            bgCol = '#271004';
            rimCol = '#fef08a';
            bands = [
              { x: 1, w: 3, c: '#451a03' },
              { x: 4, w: 4, c: '#78350f' },
              { x: 8, w: 5, c: '#b45309' },
              { x: 13, w: 5, c: '#d97706' },
              { x: 18, w: 3, c: '#fde047' },
              { x: 21, w: 4, c: '#f59e0b' },
              { x: 25, w: 4, c: '#92400e' },
              { x: 29, w: 2, c: '#451a03' }
            ];
          } else if (levelTheme === 3) {
            // THEME 3: Red & White Candy Cane Warp Pipe
            bgCol = '#4c0519';
            rimCol = '#ffffff';
            bands = [
              { x: 1, w: 3, c: '#881337' },
              { x: 4, w: 4, c: '#e11d48' },
              { x: 8, w: 5, c: '#ffffff' },
              { x: 13, w: 5, c: '#ffffff' },
              { x: 18, w: 3, c: '#ffe4e6' },
              { x: 21, w: 4, c: '#f43f5e' },
              { x: 25, w: 4, c: '#be123c' },
              { x: 29, w: 2, c: '#881337' }
            ];
          } else if (levelTheme === 4) {
            // THEME 4: Tropical Ocean Turquoise Pipe
            bgCol = '#042f2e';
            rimCol = '#ccfbf1';
            bands = [
              { x: 1, w: 3, c: '#083344' },
              { x: 4, w: 4, c: '#0e7490' },
              { x: 8, w: 5, c: '#06b6d4' },
              { x: 13, w: 5, c: '#22d3ee' },
              { x: 18, w: 3, c: '#a5f3fc' },
              { x: 21, w: 4, c: '#06b6d4' },
              { x: 25, w: 4, c: '#0e7490' },
              { x: 29, w: 2, c: '#083344' }
            ];
          } else if (levelTheme === 5) {
            // THEME 5: Amethyst Geode Pipe
            bgCol = '#0f051d';
            rimCol = '#f5d0fe';
            bands = [
              { x: 1, w: 3, c: '#2e1065' },
              { x: 4, w: 4, c: '#581c87' },
              { x: 8, w: 5, c: '#7e22ce' },
              { x: 13, w: 5, c: '#a855f7' },
              { x: 18, w: 3, c: '#e9d5ff' },
              { x: 21, w: 4, c: '#9333ea' },
              { x: 25, w: 4, c: '#581c87' },
              { x: 29, w: 2, c: '#2e1065' }
            ];
          } else if (levelTheme === 6) {
            // THEME 6: Sky Blue Cloud Pipe
            bgCol = '#082f49';
            rimCol = '#ffffff';
            bands = [
              { x: 1, w: 3, c: '#0369a1' },
              { x: 4, w: 4, c: '#0284c7' },
              { x: 8, w: 5, c: '#38bdf8' },
              { x: 13, w: 5, c: '#7dd3fc' },
              { x: 18, w: 3, c: '#e0f2fe' },
              { x: 21, w: 4, c: '#38bdf8' },
              { x: 25, w: 4, c: '#0284c7' },
              { x: 29, w: 2, c: '#0369a1' }
            ];
          } else if (levelTheme === 7) {
            // THEME 7: Twilight Celestial Indigo/Gold Pipe
            bgCol = '#0b0a26';
            rimCol = '#fef08a';
            bands = [
              { x: 1, w: 3, c: '#1e1b4b' },
              { x: 4, w: 4, c: '#312e81' },
              { x: 8, w: 5, c: '#4f46e5' },
              { x: 13, w: 5, c: '#818cf8' },
              { x: 18, w: 3, c: '#facc15' },
              { x: 21, w: 4, c: '#6366f1' },
              { x: 25, w: 4, c: '#3730a3' },
              { x: 29, w: 2, c: '#1e1b4b' }
            ];
          } else if (levelTheme === 8) {
            // THEME 8: Volcanic Dark Cast-Iron Furnace Pipe with Molten Rim
            bgCol = '#09090b';
            rimCol = '#fca5a5';
            bands = [
              { x: 1, w: 3, c: '#18181b' },
              { x: 4, w: 4, c: '#27272a' },
              { x: 8, w: 5, c: '#7f1d1d' },
              { x: 13, w: 5, c: '#dc2626' },
              { x: 18, w: 3, c: '#f87171' },
              { x: 21, w: 4, c: '#991b1b' },
              { x: 25, w: 4, c: '#3f3f46' },
              { x: 29, w: 2, c: '#18181b' }
            ];
          } else if (levelTheme === 9) {
            // THEME 9: Cosmic Cyber Neon Gateway
            bgCol = '#030712';
            rimCol = '#f43f5e';
            bands = [
              { x: 1, w: 3, c: '#0f172a' },
              { x: 4, w: 4, c: '#0e7490' },
              { x: 8, w: 5, c: '#06b6d4' },
              { x: 13, w: 5, c: '#22d3ee' },
              { x: 18, w: 3, c: '#67e8f9' },
              { x: 21, w: 4, c: '#06b6d4' },
              { x: 25, w: 4, c: '#f43f5e' },
              { x: 29, w: 2, c: '#0f172a' }
            ];
          } else {
            // Classic Mario Green (Theme 1 & fallback)
            bgCol = '#061a0a';
            rimCol = '#b8f5c2';
            bands = [
              { x: 1, w: 3, c: '#0a2e12' },
              { x: 4, w: 4, c: '#155724' },
              { x: 8, w: 5, c: '#288f3d' },
              { x: 13, w: 5, c: '#67d67a' },
              { x: 18, w: 3, c: '#b8f5c2' },
              { x: 21, w: 4, c: '#38a84f' },
              { x: 25, w: 4, c: '#196129' },
              { x: 29, w: 2, c: '#0a2e12' }
            ];
          }

          g.fillStyle = bgCol;
          g.fillRect(0, 0, 32, 32);
          bands.forEach(b => {
            g.fillStyle = b.c;
            g.fillRect(b.x, 0, b.w, 32);
          });

          if (type === 'P') {
            g.fillStyle = bgCol;
            g.fillRect(0, 12, 32, 3);
            g.fillStyle = rimCol;
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

      case 'K': {
        // 16-BIT SNES GOLDEN SECRET KEY (Llave Secreta)
        const bob = Math.sin(time * 6) * 3;
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2 + bob);
        // Golden glow
        ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        // Golden Key body
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-12, -4, 24, 8);
        ctx.beginPath();
        ctx.arc(-8, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(4, 0, 4, 9);
        ctx.fillRect(10, 0, 4, 7);

        ctx.fillStyle = '#facc15';
        ctx.fillRect(-11, -3, 22, 6);
        ctx.beginPath();
        ctx.arc(-8, 0, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(4, 0, 3, 8);
        ctx.fillRect(10, 0, 3, 6);

        // Center hole of key
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(-8, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Shimmer highlight
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-6, -2, 14, 2);
        ctx.restore();
        break;
      }

      case 'O': {
        // 16-BIT SNES SWIRLING MAGICAL KEYHOLE / PORTAL DE SALIDA SECRETA
        const rot = time * 2.5;
        const pulse = 1.0 + Math.sin(time * 5) * 0.12;
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);
        ctx.scale(pulse, pulse);

        // Swirling vortex background
        const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, 22);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#f472b6');
        grad.addColorStop(0.6, '#818cf8');
        grad.addColorStop(1, 'rgba(30, 27, 75, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // Rotating spiral star sparks
        ctx.save();
        ctx.rotate(rot);
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(11, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // The Keyhole Silhouette
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, -3, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-3, -1);
        ctx.lineTo(3, -1);
        ctx.lineTo(5, 10);
        ctx.lineTo(-5, 10);
        ctx.closePath();
        ctx.fill();

        // Golden rim around the keyhole
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -3, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-3, -1);
        ctx.lineTo(3, -1);
        ctx.lineTo(5, 10);
        ctx.lineTo(-5, 10);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
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
            // Candy Mode: Whipped Cream Swirl with a Red Cherry!
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -50 + bob, 11, Math.PI, 0);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, -58 + bob, 7, 0, Math.PI * 2);
            ctx.fill();
            // Red cherry
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -68 + bob, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -73 + bob);
            ctx.quadraticCurveTo(5, -78 + bob, 4, -83 + bob);
            ctx.stroke();

          } else if (theme === 5) {
            // Amethyst Cavern: Miner Helmet with Glowing Gem Lamp!
            ctx.fillStyle = '#eab308';
            ctx.fillRect(-14, -50 + bob, 28, 5);
            ctx.beginPath();
            ctx.arc(0, -50 + bob, 13, Math.PI, 0);
            ctx.fill();
            // Glowing turquoise gem headlight
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath();
            ctx.arc(0, -53 + bob, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
            ctx.beginPath();
            ctx.arc(0, -53 + bob, 8, 0, Math.PI * 2);
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

          } else if (theme === 7) {
            // Twilight Stratosphere: Glowing Stardust Star Halo!
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, -58 + bob, 15, 5, 0, 0, Math.PI * 2);
            ctx.stroke();
            // Golden star sparks
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -66 + bob, 4, 4);

          } else if (theme === 8) {
            // Volcanic Fortress: Spiked Iron Helmet / Devilish Horns!
            ctx.fillStyle = '#18181b';
            ctx.fillRect(-13, -50 + bob, 26, 4);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(-10, -50 + bob);
            ctx.lineTo(-15, -60 + bob);
            ctx.lineTo(-5, -50 + bob);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(10, -50 + bob);
            ctx.lineTo(15, -60 + bob);
            ctx.lineTo(5, -50 + bob);
            ctx.fill();

          } else if (theme === 9) {
            // Cosmic Milky Way: Astronaut Bubble Helmet & Star Antenna!
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -42 + bob, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Star antenna
            ctx.strokeStyle = '#f43f5e';
            ctx.beginPath();
            ctx.moveTo(0, -62 + bob);
            ctx.lineTo(0, -72 + bob);
            ctx.stroke();
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(0, -74 + bob, 3, 0, Math.PI * 2);
            ctx.fill();
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

  // ==========================================================================
  // MINI ÁMBAR OVERWORLD MAP SPRITE (16-BIT SNES MAP AVATAR)
  // ==========================================================================
  drawMiniAmbarMap(ctx, x, y, facing = 1, walkFrame = 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (facing < 0) ctx.scale(-1, 1);

    const bob = Math.sin(walkFrame * Math.PI) * 2;
    const legSwing = Math.sin(walkFrame * Math.PI * 2) * 4;

    // Shadow on the map path
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Sneakers
    ctx.fillStyle = '#0284c7'; // Denim shorts
    ctx.fillRect(-6, 4, 12, 6);

    // Left Shoe
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-6 - legSwing * 0.4, 9 + bob * 0.3, 5, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7 - legSwing * 0.4, 13 + bob * 0.3, 6, 3);

    // Right Shoe
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(1 + legSwing * 0.4, 9 - bob * 0.3, 5, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0 + legSwing * 0.4, 13 - bob * 0.3, 6, 3);

    // Torso: Pink Hoodie
    ctx.fillStyle = '#db2777';
    ctx.fillRect(-7, -8 + bob, 14, 13);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(-6, -7 + bob, 12, 11);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-5, -7 + bob, 4, 9);

    // Hoodie pocket & white cords
    ctx.fillStyle = '#be185d';
    ctx.fillRect(-4, -1 + bob, 8, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -6 + bob, 1, 4);
    ctx.fillRect(1, -6 + bob, 1, 4);

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // Skin
    ctx.fillRect(-6, -18 + bob, 12, 11);

    // Brown Hair
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-7, -21 + bob, 14, 6);
    ctx.fillRect(-7, -19 + bob, 3, 9);
    ctx.fillRect(4, -19 + bob, 3, 9);

    // Hair Buns on top
    ctx.fillRect(-8, -24 + bob, 5, 5);
    ctx.fillRect(3, -24 + bob, 5, 5);
    // Red Ribbons on buns
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-6, -21 + bob, 3, 2);
    ctx.fillRect(3, -21 + bob, 3, 2);

    // Violet-tinted Glasses
    ctx.fillStyle = '#581c87';
    ctx.fillRect(-4, -15 + bob, 4, 4);
    ctx.fillRect(1, -15 + bob, 4, 4);
    ctx.fillRect(-1, -14 + bob, 2, 2);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(-3, -14 + bob, 2, 2);
    ctx.fillRect(2, -14 + bob, 2, 2);

    // Rosy cheeks and smile
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(-5, -11 + bob, 2, 1);
    ctx.fillRect(3, -11 + bob, 2, 1);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-1, -10 + bob, 3, 1);

    ctx.restore();
  }
}

window.spriteRenderer = new SpriteRenderer();
