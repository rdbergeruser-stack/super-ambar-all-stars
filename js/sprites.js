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
      skate: [],
      mermaid: [],
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

    ['jeans', 'hoodie', 'bike', 'fly', 'skate', 'mermaid', 'cloud'].forEach(group => {
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
    // MERMAID MODE (MUNDO 2-2: ÁMBAR SIRENA EN EL ARRECIFE DE CORAL)
    // Studio-grade 16-bit dedicated mermaid sprite (assets/ambar_mermaid_0/1.png)
    // ------------------------------------------------------------------------
    if (player.isMermaid) {
      const frames = (this.images.mermaid && this.images.mermaid.length > 0 && this.images.mermaid[0].complete)
        ? this.images.mermaid
        : (this.images.hoodie || this.images.jeans);

      if (frames && frames.length > 0 && frames[0].complete && frames[0].naturalWidth > 0) {
        const vy = player.vy || 0;
        const vx = player.vx || 0;
        const speed = Math.hypot(vx, vy);
        const isStroking = player.swimStrokeTimer > 0;
        const swimPitch = Math.max(-0.45, Math.min(0.45, vy * 0.08 + (speed > 1 ? 0.06 : 0)));

        // Frame 0: Swimming kick power stroke. Frame 1: Undulating recovery glide.
        const frameIdx = (isStroking || speed > 1.2)
          ? (Math.floor(time * 8) % frames.length)
          : (Math.floor(time * 3) % frames.length);

        const img = frames[frameIdx] || frames[0];
        const targetH = player.displayHeight || 68;
        const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
        const targetW = Math.round(targetH * aspect);

        // Center vertically so swimming rotation is centered on Ámbar's body
        ctx.translate(0, -targetH * 0.42);
        ctx.rotate(swimPitch);

        ctx.drawImage(
          img,
          Math.round(-targetW / 2),
          Math.round(-targetH * 0.58),
          targetW,
          targetH
        );

        // Subtle underwater bubble trail from her swimming tail
        if (speed > 0.4 && Math.random() < 0.4) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(
            -targetW * 0.28 + (Math.random() - 0.5) * 8,
            targetH * 0.35 + Math.random() * 6,
            1.5 + Math.random() * 1.5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        ctx.restore();
        return;
      }
    }

    // ------------------------------------------------------------------------
    // ROLLER SKATE MODE (MUNDO 2-1: PARQUE COSTERO EN PATINES)
    // Studio-grade 16-bit dedicated quad roller skate sprites (assets/ambar_skate_0..3.png)
    // ------------------------------------------------------------------------
    if (player.onSkates) {
      const frames = (this.images.skate && this.images.skate.length > 0 && this.images.skate[0].complete)
        ? this.images.skate
        : (isSuper ? this.images.hoodie : this.images.jeans);

      if (frames && frames.length > 0 && frames[0].complete && frames[0].naturalWidth > 0) {
        const vx = player.vx || 0;
        const speed = Math.abs(vx);
        const onGround = player.onGround;
        const isGrinding = player.isGrinding;

        // Dynamic 4-frame roller skating stride cycle
        let skateCycle = 0;
        let bobY = 0;
        if (!onGround) {
          skateCycle = Math.min(3, frames.length - 1);
        } else if (speed > 0.2) {
          const stepRate = speed * 2.8 + 6;
          const cycle = Math.floor(time * stepRate) % 4;
          if (cycle === 0) {
            skateCycle = 1; // Right stride push
            bobY = -1.5;
          } else if (cycle === 1) {
            skateCycle = 0; // Glide
            bobY = 0;
          } else if (cycle === 2) {
            skateCycle = Math.min(2, frames.length - 1); // Mid-stride
            bobY = -1.5;
          } else {
            skateCycle = Math.min(3, frames.length - 1); // Left stride push
            bobY = 0;
          }
        }

        const img = frames[skateCycle] || frames[0];
        const targetH = player.displayHeight || (isSuper ? 86 : 56);
        const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
        const targetW = Math.round(targetH * aspect);

        // Aerodynamic skating lean
        const skateTilt = isGrinding
          ? Math.sin(time * 18) * 0.05
          : (onGround && speed > 0.8 ? 0.08 : 0);
        ctx.rotate(skateTilt);

        // Draw complete sprite flush with ground at y: 0
        ctx.drawImage(
          img,
          Math.round(-targetW / 2),
          Math.round(-targetH + bobY),
          targetW,
          targetH
        );

        // Rail grind friction sparks
        if (isGrinding) {
          ctx.save();
          for (let s = 0; s < 7; s++) {
            const spX = -10 - Math.random() * 22;
            const spY = 1 + (Math.random() - 0.5) * 6;
            const spCol = ['#fde047', '#f59e0b', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)];
            ctx.fillStyle = spCol;
            ctx.fillRect(spX, spY, 2.5, 2.5);
          }
          ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
          ctx.beginPath();
          ctx.ellipse(0, 3, 14, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (onGround && speed > 1.4 && Math.random() < 0.35) {
          // Rolling wind puff behind wheels
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(-14 - Math.random() * 6, -2, 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return;
      }
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

          } else if (levelTheme === 9) {
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

          } else if (levelTheme === 10) {
            // THEME 10: PARQUE COSTERO EN PATINES (Super Mario World Seaside Boardwalk Pier)
            g.fillStyle = '#1e0d04';
            g.fillRect(0, 0, 32, 32);

            // Coping curb on top (skate park curb - cream marble with sunlit bevel)
            g.fillStyle = '#fef3c7';
            g.fillRect(0, 0, 32, 5);
            g.fillStyle = '#ffffff';
            g.fillRect(0, 0, 32, 2);
            g.fillStyle = '#d97706';
            g.fillRect(0, 4, 32, 1);

            // Boardwalk horizontal wooden planks (warm golden honey oak)
            [5, 14, 23].forEach((py, idx) => {
              const ph = idx === 2 ? 9 : 8;
              g.fillStyle = '#78350f';
              g.fillRect(0, py, 32, ph);
              g.fillStyle = '#b45309';
              g.fillRect(0, py + 1, 32, ph - 2);
              g.fillStyle = '#d97706';
              g.fillRect(0, py + 1, 32, 2);
              // Wood grain striations
              g.fillStyle = '#f59e0b';
              g.fillRect(5, py + 3, 14, 1);
              g.fillRect(22, py + 4, 6, 1);
              // Brass nail pairs with dark indentation
              g.fillStyle = '#451a03';
              g.fillRect(2, py + 2, 3, 3);
              g.fillRect(27, py + 2, 3, 3);
              g.fillStyle = '#fde047';
              g.fillRect(3, py + 2, 2, 2);
              g.fillRect(28, py + 2, 2, 2);
            });

          } else if (levelTheme === 11) {
            // THEME 11: ARRECIFE DE CORAL DE LA SIRENA (Living Coral Bedrock & Sea Pearls)
            g.fillStyle = '#083344';
            g.fillRect(0, 0, 32, 32);

            // Deep turquoise sea floor
            g.fillStyle = '#0e7490';
            g.fillRect(1, 8, 30, 23);

            // Living coral polyps & sea fan patches
            g.fillStyle = '#db2777';
            g.beginPath();
            g.arc(8, 14, 6, 0, Math.PI * 2);
            g.arc(22, 18, 7, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f472b6';
            g.beginPath();
            g.arc(8, 14, 3, 0, Math.PI * 2);
            g.arc(22, 18, 4, 0, Math.PI * 2);
            g.fill();

            // Glowing sea pearl
            g.fillStyle = '#fef08a';
            g.beginPath();
            g.arc(15, 24, 3, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#ffffff';
            g.fillRect(14, 23, 1, 1);

            // Soft aquatic moss crest on top
            g.fillStyle = '#2dd4bf';
            g.fillRect(0, 0, 32, 7);
            g.fillStyle = '#99f6e4';
            g.fillRect(0, 1, 32, 3);

          } else if (levelTheme === 12) {
            // THEME 12: VALLE GLACIAL Y BOSQUE NEVADO (Crystalline Ice & Snow Drifts)
            g.fillStyle = '#082f49';
            g.fillRect(0, 0, 32, 32);

            // Crystalline blue glacial core
            g.fillStyle = '#0284c7';
            g.fillRect(1, 10, 30, 21);
            g.fillStyle = '#38bdf8';
            g.fillRect(3, 12, 12, 8);
            g.fillRect(17, 18, 12, 9);
            g.fillStyle = '#7dd3fc';
            g.fillRect(4, 13, 10, 2);
            g.fillRect(18, 19, 10, 2);

            // Powder snow blanket on top
            g.fillStyle = '#bae6fd';
            g.fillRect(0, 0, 32, 10);
            g.fillStyle = '#ffffff';
            g.fillRect(0, 0, 32, 8);
            // Drooping snow scallops
            [3, 11, 19, 27].forEach(sx => {
              g.fillRect(sx, 7, 3, 3);
            });

          } else if (levelTheme === 13) {
            // THEME 13: LA MANSIÓN ENCANTADA DE LOS BOOS (Haunted Victorian Mahogany)
            g.fillStyle = '#090514';
            g.fillRect(0, 0, 32, 32);

            // Dark haunted floorboard slats
            g.fillStyle = '#1e1b4b';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#312e81';
            [0, 10, 21].forEach(py => {
              g.fillRect(0, py, 32, 1);
              g.fillRect(2, py + 2, 28, 2);
            });

            // Spooky cobweb corner
            g.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(10, 0);
            g.moveTo(0, 0);
            g.lineTo(0, 10);
            g.moveTo(0, 0);
            g.lineTo(8, 8);
            g.stroke();

          } else if (levelTheme === 14) {
            // THEME 14: FORTALEZA GLACIAL DEL REY ESCARCHA (Frost Fortress Obsidian)
            g.fillStyle = '#020617';
            g.fillRect(0, 0, 32, 32);

            // Deep obsidian glacial blocks
            g.fillStyle = '#0f172a';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#1e293b';
            g.fillRect(3, 3, 26, 26);

            // Glowing cyan frost runes & icy fissure cracks
            g.fillStyle = '#0369a1';
            g.fillRect(0, 15, 32, 2);
            g.fillRect(15, 0, 2, 32);
            g.fillStyle = '#38bdf8';
            g.fillRect(2, 15, 28, 1);
            g.fillRect(15, 2, 1, 28);
            g.fillStyle = '#e0f2fe';
            g.fillRect(14, 14, 4, 4);

          } else {
            // Classic Terracotta (Theme 1 & fallback)
            g.fillStyle = '#3d1e10';
            g.fillRect(0, 0, 32, 32);
            g.fillStyle = '#0f3818';
            g.fillRect(0, 0, 32, 11);
            g.fillStyle = '#38a845';
            g.fillRect(0, 1, 32, 6);
            g.fillStyle = '#7be07d';
            g.fillRect(0, 1, 32, 2);
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

          } else if (levelTheme === 10) {
            // THEME 10: PARQUE COSTERO EN PATINES (Super Mario World / SMB3 Boardwalk Pier Wood Crate Block)
            g.fillStyle = '#271004';
            g.fillRect(0, 0, 32, 32);

            // Beveled outer timber rim
            g.fillStyle = '#78350f';
            g.fillRect(1, 1, 30, 30);
            g.fillStyle = '#d97706';
            g.fillRect(1, 1, 30, 2);
            g.fillRect(1, 1, 2, 30);
            g.fillStyle = '#451a03';
            g.fillRect(1, 29, 30, 2);
            g.fillRect(29, 1, 2, 30);

            // Honey-oak wood plank face
            g.fillStyle = '#b45309';
            g.fillRect(3, 3, 26, 26);

            // Diagonal "X" cross-brace beams (iconic SMB3 / SMW wood block)
            g.fillStyle = '#78350f';
            for (let i = 0; i < 24; i++) {
              g.fillRect(4 + i, 4 + i, 2, 2);
              g.fillRect(26 - i, 4 + i, 2, 2);
            }
            g.fillStyle = '#d97706';
            for (let i = 0; i < 22; i++) {
              g.fillRect(5 + i, 4 + i, 1, 1);
              g.fillRect(25 - i, 4 + i, 1, 1);
            }

            // 4 brass corner brackets with rivets
            const corners = [
              { x: 3, y: 3 }, { x: 23, y: 3 },
              { x: 3, y: 23 }, { x: 23, y: 23 }
            ];
            corners.forEach(c => {
              g.fillStyle = '#fde047';
              g.fillRect(c.x, c.y, 6, 6);
              g.fillStyle = '#451a03';
              g.fillRect(c.x + 2, c.y + 2, 2, 2);
              g.fillStyle = '#ffffff';
              g.fillRect(c.x + 1, c.y + 1, 1, 1);
            });

          } else if (levelTheme === 11) {
            // THEME 11: ARRECIFE DE CORAL DE LA SIRENA (Super Mario All-Stars Submerged Coral Stone Bricks)
            g.fillStyle = '#042f2e';
            g.fillRect(0, 0, 32, 32);

            // Classic Mario 2-row brick masonry pattern
            // Row 1 (y: 1 to 14): 2 bricks
            const r1 = [
              { x: 1, w: 14 }, { x: 17, w: 14 }
            ];
            r1.forEach(b => {
              g.fillStyle = '#0f766e';
              g.fillRect(b.x, 1, b.w, 13);
              g.fillStyle = '#2dd4bf';
              g.fillRect(b.x + 1, 2, b.w - 2, 2);
              g.fillRect(b.x + 1, 2, 2, 10);
              g.fillStyle = '#083344';
              g.fillRect(b.x + 1, 12, b.w - 2, 2);
              g.fillRect(b.x + b.w - 2, 2, 2, 11);
            });

            // Mortar horizontal divide
            g.fillStyle = '#042f2e';
            g.fillRect(0, 14, 32, 3);
            g.fillRect(0, 0, 32, 1);
            g.fillRect(0, 31, 32, 1);

            // Row 2 (y: 17 to 30): 3 offset bricks
            const r2 = [
              { x: 1, w: 6 }, { x: 9, w: 14 }, { x: 25, w: 6 }
            ];
            r2.forEach(b => {
              g.fillStyle = '#0f766e';
              g.fillRect(b.x, 17, b.w, 13);
              g.fillStyle = '#2dd4bf';
              g.fillRect(b.x + 1, 18, b.w - 2, 2);
              g.fillRect(b.x + 1, 18, 2, 10);
              g.fillStyle = '#083344';
              g.fillRect(b.x + 1, 28, b.w - 2, 2);
              g.fillRect(b.x + b.w - 2, 18, 2, 11);
            });

            // Center golden seashell medallion inlay
            g.fillStyle = '#fef08a';
            g.beginPath();
            g.arc(16, 15, 3.5, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f59e0b';
            g.fillRect(15, 14, 2, 2);

          } else if (levelTheme === 12) {
            // THEME 12: VALLE GLACIAL Y BOSQUE NEVADO (Super Mario All-Stars Frosted Ice Land Bricks)
            g.fillStyle = '#082f49';
            g.fillRect(0, 0, 32, 32);

            // Frosted Ice Masonry (2 rows with beveled crystalline edges)
            // Row 1
            const ir1 = [{ x: 1, w: 14 }, { x: 17, w: 14 }];
            ir1.forEach(b => {
              g.fillStyle = '#0284c7';
              g.fillRect(b.x, 1, b.w, 13);
              g.fillStyle = '#7dd3fc';
              g.fillRect(b.x + 1, 2, b.w - 2, 2);
              g.fillRect(b.x + 1, 2, 2, 10);
              g.fillStyle = '#ffffff';
              g.fillRect(b.x + 2, 2, 4, 2);
              g.fillStyle = '#0369a1';
              g.fillRect(b.x + 1, 12, b.w - 2, 2);
            });

            // Mortar line
            g.fillStyle = '#082f49';
            g.fillRect(0, 14, 32, 3);

            // Row 2
            const ir2 = [{ x: 1, w: 6 }, { x: 9, w: 14 }, { x: 25, w: 6 }];
            ir2.forEach(b => {
              g.fillStyle = '#0284c7';
              g.fillRect(b.x, 17, b.w, 13);
              g.fillStyle = '#7dd3fc';
              g.fillRect(b.x + 1, 18, b.w - 2, 2);
              g.fillRect(b.x + 1, 18, 2, 10);
              g.fillStyle = '#ffffff';
              g.fillRect(b.x + 2, 18, 3, 2);
              g.fillStyle = '#0369a1';
              g.fillRect(b.x + 1, 28, b.w - 2, 2);
            });

            // Glassy ice specular gleams
            g.fillStyle = '#ffffff';
            g.fillRect(4, 5, 2, 2);
            g.fillRect(19, 21, 2, 2);

          } else if (levelTheme === 13) {
            // THEME 13: LA MANSIÓN ENCANTADA DE LOS BOOS (Super Mario World Ghost House Lavender Stone Bricks)
            g.fillStyle = '#17052e';
            g.fillRect(0, 0, 32, 32);

            // Gothic Lavender Masonry
            // Row 1
            const gr1 = [{ x: 1, w: 14 }, { x: 17, w: 14 }];
            gr1.forEach(b => {
              g.fillStyle = '#3b0764';
              g.fillRect(b.x, 1, b.w, 13);
              g.fillStyle = '#6b21a8';
              g.fillRect(b.x + 1, 2, b.w - 2, 10);
              g.fillStyle = '#a855f7';
              g.fillRect(b.x + 1, 2, b.w - 2, 2);
              g.fillRect(b.x + 1, 2, 2, 9);
              g.fillStyle = '#2e1065';
              g.fillRect(b.x + 1, 11, b.w - 2, 2);
            });

            g.fillStyle = '#17052e';
            g.fillRect(0, 14, 32, 3);

            // Row 2
            const gr2 = [{ x: 1, w: 6 }, { x: 9, w: 14 }, { x: 25, w: 6 }];
            gr2.forEach(b => {
              g.fillStyle = '#3b0764';
              g.fillRect(b.x, 17, b.w, 13);
              g.fillStyle = '#6b21a8';
              g.fillRect(b.x + 1, 18, b.w - 2, 10);
              g.fillStyle = '#a855f7';
              g.fillRect(b.x + 1, 18, b.w - 2, 2);
              g.fillRect(b.x + 1, 18, 2, 9);
              g.fillStyle = '#2e1065';
              g.fillRect(b.x + 1, 27, b.w - 2, 2);
            });

            // Chipped stone hairline cracks
            g.fillStyle = '#17052e';
            g.fillRect(6, 6, 4, 1);
            g.fillRect(9, 7, 1, 3);
            g.fillRect(20, 22, 5, 1);

          } else if (levelTheme === 14) {
            // THEME 14: FORTALEZA GLACIAL DEL REY ESCARCHA (Super Mario World Castle Slate Bricks with Frost Trim)
            g.fillStyle = '#020617';
            g.fillRect(0, 0, 32, 32);

            // Castle Slate Masonry
            // Row 1
            const cr1 = [{ x: 1, w: 14 }, { x: 17, w: 14 }];
            cr1.forEach(b => {
              g.fillStyle = '#0f172a';
              g.fillRect(b.x, 1, b.w, 13);
              g.fillStyle = '#1e293b';
              g.fillRect(b.x + 1, 2, b.w - 2, 10);
              g.fillStyle = '#38bdf8';
              g.fillRect(b.x + 1, 2, b.w - 2, 1);
              g.fillRect(b.x + 1, 2, 1, 9);
              g.fillStyle = '#090d16';
              g.fillRect(b.x + 1, 11, b.w - 2, 2);
            });

            g.fillStyle = '#020617';
            g.fillRect(0, 14, 32, 3);

            // Row 2
            const cr2 = [{ x: 1, w: 6 }, { x: 9, w: 14 }, { x: 25, w: 6 }];
            cr2.forEach(b => {
              g.fillStyle = '#0f172a';
              g.fillRect(b.x, 17, b.w, 13);
              g.fillStyle = '#1e293b';
              g.fillRect(b.x + 1, 18, b.w - 2, 10);
              g.fillStyle = '#38bdf8';
              g.fillRect(b.x + 1, 18, b.w - 2, 1);
              g.fillRect(b.x + 1, 18, 1, 9);
              g.fillStyle = '#090d16';
              g.fillRect(b.x + 1, 27, b.w - 2, 2);
            });

            // Frost rivets on outer corners
            g.fillStyle = '#7dd3fc';
            g.fillRect(3, 3, 2, 2);
            g.fillRect(27, 3, 2, 2);
            g.fillRect(3, 27, 2, 2);
            g.fillRect(27, 27, 2, 2);

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
        const key = `snes_hard_block_${levelTheme}`;
        if (!this.cache[key]) {
          const cnv = document.createElement('canvas');
          cnv.width = 32;
          cnv.height = 32;
          const g = cnv.getContext('2d');

          // Authentic Super Mario All-Stars Sandstone Stair Block
          // Outer dark stone border
          g.fillStyle = '#1f140a';
          g.fillRect(0, 0, 32, 32);

          // Top/Left sunlit beveled edge (warm cream stone)
          g.fillStyle = '#f5ebe0';
          g.fillRect(1, 1, 30, 3);
          g.fillRect(1, 1, 3, 30);

          // Bottom/Right shadow beveled edge (dark umber stone)
          g.fillStyle = '#5c3d24';
          g.fillRect(1, 28, 30, 3);
          g.fillRect(28, 1, 3, 30);

          // Warm sandstone center face
          g.fillStyle = '#ab8560';
          g.fillRect(4, 4, 24, 24);
          g.fillStyle = '#c49e79';
          g.fillRect(4, 4, 24, 2);
          g.fillRect(4, 4, 2, 24);
          g.fillStyle = '#8c6847';
          g.fillRect(4, 26, 24, 2);
          g.fillRect(26, 4, 2, 24);

          // Iconic Super Mario All-Stars center circular bolt indentation
          g.fillStyle = '#452b16';
          g.beginPath();
          g.arc(16, 16, 4.5, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#f5ebe0';
          g.fillRect(15, 14, 2, 2);

          // 4 corner bolt rivets
          const bolts = [
            { x: 6, y: 6 }, { x: 23, y: 6 },
            { x: 6, y: 23 }, { x: 23, y: 23 }
          ];
          bolts.forEach(b => {
            g.fillStyle = '#3d2511';
            g.fillRect(b.x, b.y, 3, 3);
            g.fillStyle = '#f5ebe0';
            g.fillRect(b.x, b.y, 1, 1);
          });

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
          } else if (levelTheme === 10) {
            // THEME 10: Neon Skate Park Turquoise Pipe with Hazard Stripes
            bgCol = '#083344';
            rimCol = '#facc15';
            bands = [
              { x: 1, w: 3, c: '#0e7490' },
              { x: 4, w: 4, c: '#06b6d4' },
              { x: 8, w: 5, c: '#22d3ee' },
              { x: 13, w: 5, c: '#fde047' },
              { x: 18, w: 3, c: '#ffffff' },
              { x: 21, w: 4, c: '#06b6d4' },
              { x: 25, w: 4, c: '#db2777' },
              { x: 29, w: 2, c: '#083344' }
            ];
          } else if (levelTheme === 11) {
            // THEME 11: Glowing Sea Anemone Marine Pipe
            bgCol = '#042f2e';
            rimCol = '#f472b6';
            bands = [
              { x: 1, w: 3, c: '#0f766e' },
              { x: 4, w: 4, c: '#14b8a6' },
              { x: 8, w: 5, c: '#2dd4bf' },
              { x: 13, w: 5, c: '#5eead4' },
              { x: 18, w: 3, c: '#fbcfe8' },
              { x: 21, w: 4, c: '#ec4899' },
              { x: 25, w: 4, c: '#0f766e' },
              { x: 29, w: 2, c: '#042f2e' }
            ];
          } else if (levelTheme === 12) {
            // THEME 12: Hollow Crystalline Glacial Icicle Pipe
            bgCol = '#082f49';
            rimCol = '#ffffff';
            bands = [
              { x: 1, w: 3, c: '#0369a1' },
              { x: 4, w: 4, c: '#0284c7' },
              { x: 8, w: 5, c: '#38bdf8' },
              { x: 13, w: 5, c: '#7dd3fc' },
              { x: 18, w: 3, c: '#ffffff' },
              { x: 21, w: 4, c: '#38bdf8' },
              { x: 25, w: 4, c: '#0c4a6e' },
              { x: 29, w: 2, c: '#082f49' }
            ];
          } else if (levelTheme === 13) {
            // THEME 13: Haunted Victorian Gargoyle Pedestal Pipe
            bgCol = '#090514';
            rimCol = '#facc15';
            bands = [
              { x: 1, w: 3, c: '#1e1b4b' },
              { x: 4, w: 4, c: '#312e81' },
              { x: 8, w: 5, c: '#4f46e5' },
              { x: 13, w: 5, c: '#818cf8' },
              { x: 18, w: 3, c: '#c7d2fe' },
              { x: 21, w: 4, c: '#4f46e5' },
              { x: 25, w: 4, c: '#2e1065' },
              { x: 29, w: 2, c: '#090514' }
            ];
          } else if (levelTheme === 14) {
            // THEME 14: Frost Castle Spire Pillar
            bgCol = '#020617';
            rimCol = '#e0f2fe';
            bands = [
              { x: 1, w: 3, c: '#0f172a' },
              { x: 4, w: 4, c: '#1e293b' },
              { x: 8, w: 5, c: '#0284c7' },
              { x: 13, w: 5, c: '#38bdf8' },
              { x: 18, w: 3, c: '#e0f2fe' },
              { x: 21, w: 4, c: '#0369a1' },
              { x: 25, w: 4, c: '#1e293b' },
              { x: 29, w: 2, c: '#020617' }
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
        // 16-BIT METALLIC SKATE GRIND RAIL & WOODEN BEAM
        if (levelTheme === 10 || levelTheme === 4) {
          // Yellow and Chrome Tubular Skate Grind Rail
          // Steel vertical support stanchion
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 13, y + 10, 6, 22);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + 14, y + 11, 4, 21);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + 14, y + 11, 2, 21);

          // Tubular horizontal steel rail bar
          ctx.fillStyle = '#1e293b';
          this.roundRect(ctx, x, y + 4, size, 8, 3);
          ctx.fill();
          ctx.fillStyle = '#94a3b8';
          this.roundRect(ctx, x, y + 5, size, 6, 2);
          ctx.fill();
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(x, y + 5, size, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y + 5, size, 1);
        } else {
          ctx.fillStyle = '#451a03';
          this.roundRect(ctx, x + 1, y + 1, size - 2, 16, 4);
          ctx.fill();
          ctx.fillStyle = '#92400e';
          this.roundRect(ctx, x + 3, y + 2, size - 6, 12, 3);
          ctx.fill();
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x + 5, y + 3, size - 10, 3);
        }
        break;
      }

      case 'I': {
        // 16-BIT SLIPPERY GLACIAL ICE TILE
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x + 2, y + 2, size - 4, 3);
        ctx.fillRect(x + 2, y + 2, 3, size - 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 4, 4, 2);
        ctx.fillRect(x + 18, y + 16, 6, 2);
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
    } else if (enemy.type === 'fish') {
      // ======================================================================
      // 16-BIT CHEEP-CHEEP (TROPICAL CORAL REEF FISH - SUPER MARIO ALL-STARS)
      // ======================================================================
      ctx.translate(cx, bottomY);
      if (enemy.vx > 0) ctx.scale(-1, 1);
      const finFlap = Math.sin(time * 16) * 4;
      const wingFlap = Math.cos(time * 16) * 0.35;
      const swimBob = Math.sin(time * 6 + enemy.x * 0.05) * 3;

      // 1. Scalloped Yellow Tail Fin (with 16-bit black outline & ribs)
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-11, -18 + swimBob);
      ctx.lineTo(-24 + finFlap, -30 + swimBob);
      ctx.quadraticCurveTo(-18 + finFlap, -18 + swimBob, -26 + finFlap, -6 + swimBob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Tail fin ray highlights
      ctx.strokeStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-11, -18 + swimBob);
      ctx.lineTo(-22 + finFlap, -22 + swimBob);
      ctx.moveTo(-11, -18 + swimBob);
      ctx.lineTo(-22 + finFlap, -14 + swimBob);
      ctx.stroke();

      // 2. Plump Crimson & Orange Fish Body (16-Bit Super Mario All-Stars Palette)
      const bodyGrad = ctx.createRadialGradient(3, -22 + swimBob, 3, 0, -18 + swimBob, 16);
      bodyGrad.addColorStop(0, '#f97316');
      bodyGrad.addColorStop(0.5, '#ea580c');
      bodyGrad.addColorStop(0.9, '#dc2626');
      bodyGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -18 + swimBob, 15, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Creamy White Underbelly
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(1, -12 + swimBob, 12, 7, 0, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Yellow Spiky Mohawk Dorsal Fin
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-6, -30 + swimBob);
      ctx.lineTo(-2, -37 + swimBob);
      ctx.lineTo(2, -32 + swimBob);
      ctx.lineTo(6, -38 + swimBob);
      ctx.lineTo(9, -29 + swimBob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5. Oversized Pouty Yellow Fish Lips (Beak)
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.4;
      // Upper lip
      ctx.beginPath();
      ctx.ellipse(15, -20 + swimBob, 4.5, 3.2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Lower lip
      ctx.beginPath();
      ctx.ellipse(14.5, -15 + swimBob, 4, 3, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Black mouth corner
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12, -18 + swimBob, 2, 2);

      // 6. Expressive Big Cartoon Eye
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(6, -21 + swimBob, 5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Pupil looking forward
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(8, -21 + swimBob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Specular eye shine
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7.5, -23 + swimBob, 1.8, 1.8);

      // 7. Flapping White Pectoral Wing Fin
      ctx.save();
      ctx.translate(-2, -15 + swimBob);
      ctx.rotate(wingFlap);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 4.2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.stroke();
      ctx.restore();

      // Subtle rising air bubble
      if (Math.floor(time * 4) % 3 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(20, -22 + swimBob - (time * 18 % 16), 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (enemy.type === 'jellyfish') {
      // ======================================================================
      // 16-BIT BIOLUMINESCENT SEA JELLYFISH (BLOOPER & MEDUSA HYBRID)
      // ======================================================================
      ctx.translate(cx, bottomY);
      const pulse = 1.0 + Math.sin(time * 6) * 0.18;
      const bob = Math.sin(time * 4) * 4.5;

      // Soft bioluminescent glow aura
      const aura = ctx.createRadialGradient(0, -23 + bob, 4, 0, -23 + bob, 24 * pulse);
      aura.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      aura.addColorStop(0.6, 'rgba(192, 132, 252, 0.2)');
      aura.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -23 + bob, 24 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Translucent Outer Umbrella Bell (Dome)
      const bellGrad = ctx.createLinearGradient(0, -36 + bob, 0, -16 + bob);
      bellGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
      bellGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.85)');
      bellGrad.addColorStop(0.85, 'rgba(14, 116, 144, 0.9)');
      bellGrad.addColorStop(1, '#083344');
      ctx.fillStyle = bellGrad;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, -24 + bob, 15 * pulse, 13 / pulse, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Scalloped frilled bottom rim of the bell
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      const frillW = (30 * pulse) / 5;
      for (let f = 0; f < 5; f++) {
        const fx = -15 * pulse + f * frillW + frillW / 2;
        ctx.beginPath();
        ctx.arc(fx, -24 + bob, frillW / 2, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      // Bioluminescent glowing inner nucleus
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -26 + bob, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -27 + bob, 2, 2);

      // Cute expressive cartoon eyes (Blooper style)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#083344';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(-5, -23 + bob, 3.5, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(5, -23 + bob, 3.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Pupils glancing forward
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-4, -22 + bob, 1.8, 0, Math.PI * 2);
      ctx.arc(6, -22 + bob, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Articulated Coiling Tentacles (Flowing silk ribbons)
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      for (let tIdx = -2; tIdx <= 2; tIdx++) {
        const tx = tIdx * 5.5 * pulse;
        const wave = Math.sin(time * 8 + tIdx * 1.2) * 5;
        ctx.beginPath();
        ctx.moveTo(tx, -18 + bob);
        ctx.bezierCurveTo(tx + wave, -10 + bob, tx - wave * 0.8, -2 + bob, tx + wave * 0.5, 8 + bob);
        ctx.stroke();
      }

    } else if (enemy.type === 'boo') {
      // ======================================================================
      // 16-BIT SHY BOO GHOST (SUPER MARIO WORLD RETRO MASTERPIECE)
      // ======================================================================
      ctx.translate(cx, bottomY);
      if (enemy.vx < 0 || (enemy.facing && enemy.facing < 0)) ctx.scale(-1, 1);
      const bob = Math.sin(time * 4 + enemy.x * 0.04) * 3.5;

      // Soft eerie ghost glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(0, -20 + bob, 21, 0, Math.PI * 2);
      ctx.fill();

      // Main Spherical Ghost Body with 16-bit SMW Shading
      const booGrad = ctx.createRadialGradient(-3, -24 + bob, 4, 0, -20 + bob, 16);
      booGrad.addColorStop(0, '#ffffff');
      booGrad.addColorStop(0.7, '#f8fafc');
      booGrad.addColorStop(0.95, '#e2e8f0');
      booGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = booGrad;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -20 + bob, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Curled Little Wispy Ghost Tail Behind
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-13, -23 + bob);
      ctx.quadraticCurveTo(-24, -22 + bob, -18, -12 + bob);
      ctx.quadraticCurveTo(-14, -16 + bob, -11, -17 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (enemy.isShy) {
        // --------------------------------------------------------------------
        // SHY BOO: ÁMBAR IS LOOKING! COVERING FACE WITH PAWS & BLUSHING!
        // --------------------------------------------------------------------
        // Embarrassed shivering wiggle
        const shiver = Math.sin(time * 24) * 0.8;

        // Big Glowing Rosy Pink Blush Circles on Cheeks
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-7 + shiver, -16 + bob, 4, 0, Math.PI * 2);
        ctx.arc(7 + shiver, -16 + bob, 4, 0, Math.PI * 2);
        ctx.fill();

        // Closed Embarrassed Crescent Eyes
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(-5 + shiver, -24 + bob, 2.5, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(5 + shiver, -24 + bob, 2.5, Math.PI, 0);
        ctx.stroke();

        // Both Chubby White Ghost Hands Covering Face
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        // Left hand
        ctx.beginPath();
        ctx.ellipse(-4 + shiver, -20 + bob, 4.5, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right hand
        ctx.beginPath();
        ctx.ellipse(4 + shiver, -20 + bob, 4.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Little comical blue sweat drop
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(11, -29 + bob);
        ctx.quadraticCurveTo(13, -26 + bob, 11, -24 + bob);
        ctx.quadraticCurveTo(9, -26 + bob, 11, -29 + bob);
        ctx.fill();

      } else {
        // --------------------------------------------------------------------
        // ACTIVE BOO: SNEAKING UP WITH MISCHIEVOUS GRIN & VAMPIRE FANGS!
        // --------------------------------------------------------------------
        // Mischievous Narrow Eyes with Black Pupils
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(5, -24 + bob, 2.8, 3.8, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4.5, -26 + bob, 1.5, 1.5);

        // Angled Mischievous Eyebrow
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(1, -27 + bob);
        ctx.lineTo(8, -25 + bob);
        ctx.stroke();

        // Gaping Mischievous Vampire Mouth
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(1, -19 + bob);
        ctx.quadraticCurveTo(7, -11 + bob, 12, -18 + bob);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sharp White Vampire Fangs
        ctx.fillStyle = '#ffffff';
        // Top front fang
        ctx.beginPath();
        ctx.moveTo(3, -19 + bob);
        ctx.lineTo(5, -15 + bob);
        ctx.lineTo(7, -19 + bob);
        ctx.closePath();
        ctx.fill();
        // Top second fang
        ctx.beginPath();
        ctx.moveTo(8, -19 + bob);
        ctx.lineTo(10, -16 + bob);
        ctx.lineTo(11, -19 + bob);
        ctx.closePath();
        ctx.fill();

        // Pink Tongue
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(6, -14 + bob, 2.5, 0, Math.PI);
        ctx.fill();

        // Outstretched Grabbing Ghost Arm
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(14, -18 + bob, 5, 3.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

    } else if (enemy.type === 'penguin') {
      // ======================================================================
      // 16-BIT BUMPTY PENGUIN (YOSHI'S ISLAND & SUPER MARIO 64 CHUBBY PENGUIN)
      // ======================================================================
      ctx.translate(cx, bottomY);
      if (enemy.vx > 0) ctx.scale(-1, 1);

      if (enemy.sliding) {
        // --------------------------------------------------------------------
        // BELLY SLIDING OVER GLACIAL ICE (TORPEDO SLIDE POSE!)
        // --------------------------------------------------------------------
        // Dark navy/black penguin body
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, -10, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pure white belly sliding on ice
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(1, -7, 14, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright orange beak pointing forward
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(15, -12);
        ctx.lineTo(23, -9);
        ctx.lineTo(15, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Happy closed smiling eye (^)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(11, -12);
        ctx.lineTo(13, -14);
        ctx.lineTo(15, -12);
        ctx.stroke();

        // Outstretched jet flippers
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(-5, -13, 8, 3.5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Orange feet trailing behind
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-18, -10, 5, 3);

        // Ice snow spray & frosty crystals kicking up!
        ctx.fillStyle = '#bae6fd';
        for (let sp = 0; sp < 4; sp++) {
          const spX = -14 - Math.random() * 12;
          const spY = -4 + (Math.random() - 0.5) * 6;
          ctx.fillRect(spX, spY, 2, 2);
        }

      } else {
        // --------------------------------------------------------------------
        // HAPPY WADDLING CHUBBY PENGUIN
        // --------------------------------------------------------------------
        const waddleAngle = Math.sin(time * 12) * 0.14;
        ctx.rotate(waddleAngle);

        // Chubby Midnight Navy Body
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, -18, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Big Snowy White Pear Tummy
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(2, -16, 9.5, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Plump Orange Triangular Beak
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(11, -22);
        ctx.lineTo(18, -19);
        ctx.lineTo(11, -16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Big Expressive Cartoon Eyes
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(6, -24, 3.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Pupil glancing ahead
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(7.5, -24, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, -25.5, 1.2, 1.2);

        // Side Flippers that paddle as he walks
        const paddleWave = Math.sin(time * 12) * 0.3;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1;
        ctx.save();
        ctx.translate(-8, -18);
        ctx.rotate(-paddleWave);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.5, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Cute Orange Webbed Feet
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        // Left foot
        ctx.beginPath();
        ctx.ellipse(-5, -2, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right foot
        ctx.beginPath();
        ctx.ellipse(4, -2, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

    } else if (enemy.type === 'frost_boss') {
      // ======================================================================
      // 16-BIT REY ESCARCHA (FINAL BOSS: KING FROST SUPREME 16-BIT TITAN)
      // ======================================================================
      ctx.translate(cx, bottomY);
      if (enemy.vx > 0) ctx.scale(-1, 1);
      if (enemy.hurtTimer > 0 && Math.floor(time * 20) % 2 === 0) {
        ctx.filter = 'brightness(2.2) saturate(2.5)';
      }

      const breath = Math.sin(time * 4) * 2.5;

      // 1. Blizzard Frost Aura radiating from King Frost
      const bossAura = ctx.createRadialGradient(0, -42 + breath, 10, 0, -42 + breath, 52);
      bossAura.addColorStop(0, 'rgba(125, 211, 252, 0.45)');
      bossAura.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
      bossAura.addColorStop(1, 'rgba(8, 47, 73, 0)');
      ctx.fillStyle = bossAura;
      ctx.beginPath();
      ctx.arc(0, -42 + breath, 52, 0, Math.PI * 2);
      ctx.fill();

      // 2. Colossal Glacial Mantle & Robes (Deep Midnight Obsidian & Royal Navy)
      const cloakGrad = ctx.createLinearGradient(0, -70 + breath, 0, 0);
      cloakGrad.addColorStop(0, '#0c4a6e');
      cloakGrad.addColorStop(0.5, '#075985');
      cloakGrad.addColorStop(1, '#021e33');
      ctx.fillStyle = cloakGrad;
      ctx.strokeStyle = '#082f49';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -36 + breath, 30, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Thick Pure-White Frosted Fur Collar & Trim
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -58 + breath, 25, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4. Glacial Face & Frozen Jaw
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, -52 + breath, 17, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Multi-Spiked Crystalline Icicle Beard (5 Faceted Icicle Points!)
      const beardSpikes = [-12, -6, 0, 6, 12];
      beardSpikes.forEach((bx, bIdx) => {
        const spikeLen = bIdx === 2 ? 26 : (bIdx === 1 || bIdx === 3 ? 20 : 14);
        ctx.fillStyle = '#bae6fd';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx - 3, -44 + breath);
        ctx.lineTo(bx, -44 + spikeLen + breath);
        ctx.lineTo(bx + 3, -44 + breath);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Crystalline reflection
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - 1, -44 + breath, 1.5, spikeLen - 4);
      });

      // 6. Glowing Piercing Cyan Eyes & Frost Brow
      ctx.fillStyle = '#082f49';
      ctx.fillRect(-8, -58 + breath, 16, 3); // Heavy brow line
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-6, -53 + breath, 4, 0, Math.PI * 2);
      ctx.arc(6, -53 + breath, 4, 0, Math.PI * 2);
      ctx.fill();
      // Eye pupils & glowing cores
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5.5, -53 + breath, 2, 0, Math.PI * 2);
      ctx.arc(6.5, -53 + breath, 2, 0, Math.PI * 2);
      ctx.fill();

      // 7. Majestic 5-Pointed Ice Crystal Crown with Sapphire Gems
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-18, -66 + breath);
      ctx.lineTo(-24, -86 + breath);
      ctx.lineTo(-10, -74 + breath);
      ctx.lineTo(0, -96 + breath); // Central highest spire!
      ctx.lineTo(10, -74 + breath);
      ctx.lineTo(24, -86 + breath);
      ctx.lineTo(18, -66 + breath);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glistening Sapphire Gems on Crown Spikes
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -82 + breath, 3.5, 0, Math.PI * 2);
      ctx.arc(-16, -75 + breath, 2.5, 0, Math.PI * 2);
      ctx.arc(16, -75 + breath, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -84 + breath, 2, 2);

      // 8. Spiked Glacial Shoulder Pauldrons
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      // Left shoulder spike
      ctx.beginPath();
      ctx.moveTo(-28, -50 + breath);
      ctx.lineTo(-44, -62 + breath);
      ctx.lineTo(-25, -36 + breath);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right shoulder spike
      ctx.beginPath();
      ctx.moveTo(28, -50 + breath);
      ctx.lineTo(44, -62 + breath);
      ctx.lineTo(25, -36 + breath);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 9. Frost Scepter in King's Hand
      ctx.save();
      ctx.translate(32, -34 + breath);
      ctx.rotate(-0.25);
      // Scepter shaft
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(-2, -30, 4, 45);
      // Glowing Frost Star Tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -32, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -32);
      ctx.lineTo(10, -32);
      ctx.moveTo(0, -42);
      ctx.lineTo(0, -22);
      ctx.stroke();
      ctx.restore();

      // 10. Epic 16-Bit Boss Health Bar with Frosted Crystal Frame
      const maxHp = enemy.maxHp || 10;
      const barW = 84;
      const barX = cx - barW / 2;
      const barY = y - 32;

      // Frosted frame border
      ctx.fillStyle = '#082f49';
      ctx.fillRect(barX - 3, barY - 3, barW + 6, 12);
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX - 3, barY - 3, barW + 6, 12);

      // HP Bar Gradient
      const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      hpGrad.addColorStop(0, '#38bdf8');
      hpGrad.addColorStop(0.5, '#0284c7');
      hpGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = hpGrad;
      ctx.fillRect(barX, barY, (barW * Math.max(0, enemy.hp)) / maxHp, 6);

      // Boss Name Tag
      ctx.fillStyle = '#e0f2fe';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('👑 REY ESCARCHA 👑', cx, barY - 6);
      ctx.textAlign = 'left';
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
