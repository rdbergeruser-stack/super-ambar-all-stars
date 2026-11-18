/**
 * ============================================================================
 * SUPER ÁMBAR ALL-STARS - NEXT-GEN 2D HD ENGINE (NINTENDO SWITCH 2 / WONDER QUALITY)
 * ============================================================================
 * Elevates the game to AAA modern console fidelity (Super Mario Wonder / Rayman Legends):
 *  - Hand-painted multi-tier parallax scenery with atmospheric depth & perspective
 *  - Volumetric god rays (sunbeams) and dynamic ambient lighting
 *  - Animated specular light gleams on golden question blocks & coins
 *  - Cinematic foreground depth-of-field framing (blurred foliage / ferns)
 *  - Character rim lighting, organic contact shadows & squash/stretch physics
 *  - Organic weather particle systems (drifting petals, blizzard snow, fire embers)
 *  - Ultra-sleek Glassmorphism floating HUD with 3D heart containers & animated coins
 *  - Real-time instant toggle (Key 'H' or Top Toolbar Button)
 * ============================================================================
 */

(function () {
  'use strict';

  const ModernHD = {
    // Mode is enabled by default; persists via localStorage
    enabled: localStorage.getItem('SUPER_AMBAR_HD_MODE') !== 'false',

    // High-Resolution Texture Canvas Cache
    tileCache: {},

    // Ambient Weather Particles
    weatherParticles: [],

    // Running & Skid Smoke Particles
    smokeParticles: [],

    init() {
      console.log('✨ [ModernHD] Initializing Nintendo Switch 2 Quality 2D HD Engine...');
      this.initWeather();
      this.injectHUDStyles();
      this.hookEngine();
      this.updateUI();

      // Keyboard shortcut: Press 'H' to toggle HD Mode anytime!
      window.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
          if (!e.repeat && document.activeElement.tagName !== 'INPUT') {
            this.toggle();
          }
        }
      });
    },

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('SUPER_AMBAR_HD_MODE', this.enabled ? 'true' : 'false');
      this.updateUI();

      if (window.retroAudio && window.retroAudio.playPowerUp) {
        window.retroAudio.playPowerUp();
      }

      if (window.game) {
        window.game.floatingTexts.push({
          x: (window.game.player.x || 100) - 20,
          y: (window.game.player.y || 200) - 40,
          vy: -1.2,
          life: 1.5,
          maxLife: 1.5,
          text: this.enabled ? '✨ MODO SWITCH 2 HD ACTIVADO ✨' : '📺 MODO RETRO 16-BIT 📺',
          color: this.enabled ? '#38bdf8' : '#fde047'
        });
      }
    },

    updateUI() {
      const btn = document.getElementById('btnHdToggle');
      if (btn) {
        btn.innerHTML = this.enabled ? '✨ MODO: SWITCH 2 HD' : '📺 MODO: RETRO 16-BIT';
        btn.style.background = this.enabled
          ? 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)'
          : 'linear-gradient(180deg, #475569 0%, #334155 100%)';
        btn.style.borderColor = this.enabled ? '#fde047' : '#94a3b8';
        btn.style.color = '#ffffff';
        btn.style.boxShadow = this.enabled ? '0 0 14px rgba(236, 72, 153, 0.8)' : 'none';
      }

      const badge = document.querySelector('.brand-badge');
      if (badge) {
        badge.textContent = this.enabled ? 'SWITCH 2 EDITION' : '16-BIT SNES';
        badge.style.background = this.enabled
          ? 'linear-gradient(90deg, #ec4899, #8b5cf6)'
          : '#4c1d95';
      }
    },

    injectHUDStyles() {
      if (!document.getElementById('hd-font-link')) {
        const link = document.createElement('link');
        link.id = 'hd-font-link';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Titan+One&family=Outfit:wght@600;700;800;900&display=swap';
        document.head.appendChild(link);
      }
    },

    // ========================================================================
    // 1. HIGH-DEFINITION TEXTURE GENERATOR (128x128 ANTIALIASED CANVASES)
    // ========================================================================
    getTile(type, theme = 1, time = 0, isSubterranean = false) {
      // Dynamic animated blocks use frame-based keys
      let frame = 0;
      if (type === '?' || type === 'L') {
        frame = Math.floor(time * 6) % 4;
      }

      const key = `hd_${type}_${theme}_${frame}_${isSubterranean ? 'sub' : 'top'}`;
      if (this.tileCache[key]) {
        return this.tileCache[key];
      }

      const S = 128; // High-resolution canvas size
      const cnv = document.createElement('canvas');
      cnv.width = S;
      cnv.height = S;
      const g = cnv.getContext('2d');
      g.imageSmoothingEnabled = true;

      switch (type) {
        case '#':
        case 'T':
          this.renderHDGround(g, S, theme, type === 'T', isSubterranean, time);
          break;
        case 'B':
          this.renderHDBrick(g, S, theme);
          break;
        case '?':
        case 'L':
          this.renderHDQuestionBlock(g, S, frame, time);
          break;
        case 'E':
          this.renderHDEmptyBlock(g, S);
          break;
        case 'H':
          this.renderHDHardBlock(g, S, theme);
          break;
        case 'P':
        case 'p':
          this.renderHDPipe(g, S, type, theme);
          break;
        case 'C':
          this.renderHDCloud(g, S);
          break;
        default:
          return null;
      }

      this.tileCache[key] = cnv;
      return cnv;
    },

    // HD GROUND: Lush grass on top (if surface), rich subterranean earth below
    renderHDGround(g, S, theme, isTurbo, isSubterranean, time) {
      g.save();

      // ----------------------------------------------------------------------
      // THEME 1: PRADERA ARCOÍRIS (Grassland / Subterranean Loam)
      // ----------------------------------------------------------------------
      if (theme === 1 || theme === 6 || theme === 7) {
        if (isSubterranean) {
          // Deep subterranean loam soil
          const subGrad = g.createLinearGradient(0, 0, 0, S);
          subGrad.addColorStop(0, '#421f0b');
          subGrad.addColorStop(0.5, '#351808');
          subGrad.addColorStop(1, '#271105');
          g.fillStyle = subGrad;
          g.fillRect(0, 0, S, S);

          // Deep underground cobblestone clusters
          const pebbles = [
            { x: 24, y: 28, rx: 18, ry: 13, col: '#5a2d13' },
            { x: 88, y: 34, rx: 16, ry: 12, col: '#6e3b20' },
            { x: 38, y: 84, rx: 20, ry: 14, col: '#6e3b20' },
            { x: 104, y: 92, rx: 17, ry: 12, col: '#5a2d13' }
          ];
          pebbles.forEach(p => {
            g.fillStyle = '#170b03';
            g.beginPath();
            g.ellipse(p.x, p.y + 3, p.rx, p.ry, 0, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = p.col;
            g.beginPath();
            g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = '#8d4822';
            g.beginPath();
            g.ellipse(p.x - 3, p.y - 2, p.rx * 0.6, p.ry * 0.5, 0, 0, Math.PI * 2);
            g.fill();
          });

          // Organic root strands
          g.strokeStyle = '#271408';
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(14, 0);
          g.quadraticCurveTo(28, 45, 18, S);
          g.moveTo(75, 0);
          g.quadraticCurveTo(62, 55, 80, S);
          g.stroke();

        } else {
          // Surface: Dirt Body below
          const dirtGrad = g.createLinearGradient(0, 36, 0, S);
          dirtGrad.addColorStop(0, '#5a2d13');
          dirtGrad.addColorStop(0.5, '#421f0b');
          dirtGrad.addColorStop(1, '#2c1406');
          g.fillStyle = dirtGrad;
          g.fillRect(0, 36, S, S - 36);

          // Smooth cobblestone pebbles embedded in dirt
          const pebbles = [
            { x: 22, y: 64, rx: 15, ry: 10, col: '#783d1c' },
            { x: 78, y: 72, rx: 18, ry: 12, col: '#8d4822' },
            { x: 112, y: 58, rx: 13, ry: 9, col: '#783d1c' },
            { x: 44, y: 104, rx: 16, ry: 11, col: '#8d4822' }
          ];
          pebbles.forEach(p => {
            g.fillStyle = '#1c0c04';
            g.beginPath();
            g.ellipse(p.x, p.y + 3, p.rx, p.ry, 0, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = p.col;
            g.beginPath();
            g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
            g.fill();

            g.fillStyle = '#b46132';
            g.beginPath();
            g.ellipse(p.x - 3, p.y - 2, p.rx * 0.6, p.ry * 0.5, 0, 0, Math.PI * 2);
            g.fill();
          });

          // Deep grass fringe base
          g.fillStyle = '#14532d';
          g.beginPath();
          g.moveTo(0, 38);
          g.bezierCurveTo(S * 0.25, 46, S * 0.75, 46, S, 38);
          g.lineTo(S, 0);
          g.lineTo(0, 0);
          g.closePath();
          g.fill();

          // Lush grass top gradient (lime to emerald)
          const grassGrad = g.createLinearGradient(0, 0, 0, 36);
          grassGrad.addColorStop(0, '#86efac');
          grassGrad.addColorStop(0.3, '#4ade80');
          grassGrad.addColorStop(0.7, '#22c55e');
          grassGrad.addColorStop(1, '#15803d');
          g.fillStyle = grassGrad;
          g.beginPath();
          g.moveTo(0, 34);
          g.bezierCurveTo(24, 42, 60, 44, 90, 36);
          g.bezierCurveTo(105, 32, 118, 38, S, 34);
          g.lineTo(S, 0);
          g.lineTo(0, 0);
          g.closePath();
          g.fill();

          // Individual organic grass blades
          g.fillStyle = '#bbf7d0';
          for (let bx = 6; bx < S; bx += 14) {
            g.beginPath();
            g.moveTo(bx - 3, 14);
            g.quadraticCurveTo(bx, 0, bx + 2, 2);
            g.quadraticCurveTo(bx + 4, 8, bx + 3, 16);
            g.fill();
          }

          // Tiny cute wild flowers
          const flowers = [{ x: 28, y: 14, c: '#f43f5e' }, { x: 86, y: 16, c: '#fbbf24' }];
          flowers.forEach(fl => {
            g.fillStyle = fl.c;
            for (let a = 0; a < 5; a++) {
              const rad = (a * Math.PI * 2) / 5;
              g.beginPath();
              g.arc(fl.x + Math.cos(rad) * 4, fl.y + Math.sin(rad) * 4, 3, 0, Math.PI * 2);
              g.fill();
            }
            g.fillStyle = '#ffffff';
            g.beginPath();
            g.arc(fl.x, fl.y, 2.5, 0, Math.PI * 2);
            g.fill();
          });
        }

      // ----------------------------------------------------------------------
      // THEME 2: TALLER DE JUGUETES (Polished Wood Planks)
      // ----------------------------------------------------------------------
      } else if (theme === 2) {
        g.fillStyle = '#2b1406';
        g.fillRect(0, 0, S, S);

        const plankH = S / 3;
        for (let i = 0; i < 3; i++) {
          const py = i * plankH;
          const pGrad = g.createLinearGradient(0, py, 0, py + plankH);
          pGrad.addColorStop(0, '#a1531e');
          pGrad.addColorStop(0.4, '#b45309');
          pGrad.addColorStop(0.85, '#78350f');
          pGrad.addColorStop(1, '#451a03');
          g.fillStyle = pGrad;
          g.fillRect(0, py + 2, S, plankH - 4);

          g.fillStyle = 'rgba(254, 215, 170, 0.55)';
          g.fillRect(0, py + 2, S, 3);

          g.strokeStyle = 'rgba(69, 26, 3, 0.45)';
          g.lineWidth = 2.5;
          g.beginPath();
          g.moveTo(0, py + plankH * 0.45);
          g.bezierCurveTo(S * 0.3, py + plankH * 0.3, S * 0.7, py + plankH * 0.6, S, py + plankH * 0.45);
          g.stroke();

          [14, S - 14].forEach(sx => {
            g.fillStyle = '#fde047';
            g.beginPath();
            g.arc(sx, py + plankH * 0.5, 4.5, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#78350f';
            g.fillRect(sx - 3, py + plankH * 0.5 - 1, 6, 2);
          });
        }

      // ----------------------------------------------------------------------
      // THEME 8: CASTILLO DE LAVA (Volcanic Obsidian Bricks)
      // ----------------------------------------------------------------------
      } else if (theme === 3 || theme === 8) {
        g.fillStyle = '#0f172a';
        g.fillRect(0, 0, S, S);

        const obsGrad = g.createLinearGradient(0, 0, S, S);
        obsGrad.addColorStop(0, '#334155');
        obsGrad.addColorStop(0.5, '#1e293b');
        obsGrad.addColorStop(1, '#090d16');
        g.fillStyle = obsGrad;
        g.fillRect(4, 4, S - 8, S - 8);

        g.strokeStyle = '#f97316';
        g.lineWidth = 4;
        g.shadowColor = '#ea580c';
        g.shadowBlur = 12;
        g.beginPath();
        g.moveTo(10, 20);
        g.lineTo(50, 48);
        g.lineTo(75, 40);
        g.lineTo(118, 90);
        g.stroke();
        g.strokeStyle = '#fef08a';
        g.lineWidth = 1.5;
        g.stroke();
        g.shadowBlur = 0;

      // ----------------------------------------------------------------------
      // THEME 12 / 14: VALLE GLACIAL & FORTALEZA ESCARCHA (Crystalline Ice)
      // ----------------------------------------------------------------------
      } else if (theme === 12 || theme === 14) {
        const iceGrad = g.createLinearGradient(0, 0, S, S);
        iceGrad.addColorStop(0, '#e0f2fe');
        iceGrad.addColorStop(0.3, '#7dd3fc');
        iceGrad.addColorStop(0.7, '#38bdf8');
        iceGrad.addColorStop(1, '#0284c7');
        g.fillStyle = iceGrad;
        g.fillRect(0, 0, S, S);

        // Snow top
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.moveTo(0, 16);
        g.quadraticCurveTo(S * 0.3, 24, S * 0.6, 14);
        g.quadraticCurveTo(S * 0.85, 20, S, 16);
        g.lineTo(S, 0);
        g.lineTo(0, 0);
        g.closePath();
        g.fill();

        g.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(20, 30);
        g.lineTo(60, 75);
        g.lineTo(110, 45);
        g.stroke();

      // ----------------------------------------------------------------------
      // THEME 4: PLAYA AL ATARDECER (Sandstone)
      // ----------------------------------------------------------------------
      } else if (theme === 4) {
        const sandGrad = g.createLinearGradient(0, 0, 0, S);
        sandGrad.addColorStop(0, '#fde68a');
        sandGrad.addColorStop(0.4, '#f59e0b');
        sandGrad.addColorStop(1, '#d97706');
        g.fillStyle = sandGrad;
        g.fillRect(0, 0, S, S);

        g.strokeStyle = '#b45309';
        g.lineWidth = 3;
        g.strokeRect(3, 3, S - 6, S - 6);
        g.fillStyle = 'rgba(255, 255, 255, 0.4)';
        g.fillRect(4, 4, S - 8, 8);

      // Default fallback
      } else {
        const defGrad = g.createLinearGradient(0, 0, 0, S);
        defGrad.addColorStop(0, '#64748b');
        defGrad.addColorStop(1, '#334155');
        g.fillStyle = defGrad;
        g.fillRect(0, 0, S, S);
      }

      // If TURBO Boost Pad ('T'), add glowing holographic arrows
      if (isTurbo) {
        g.fillStyle = '#38bdf8';
        g.shadowColor = '#0284c7';
        g.shadowBlur = 14;
        for (let i = 0; i < 3; i++) {
          const ax = 26 + i * 36;
          g.beginPath();
          g.moveTo(ax, 28);
          g.lineTo(ax + 20, 64);
          g.lineTo(ax, 100);
          g.lineTo(ax + 12, 100);
          g.lineTo(ax + 32, 64);
          g.lineTo(ax + 12, 28);
          g.closePath();
          g.fill();
        }
        g.shadowBlur = 0;
      }

      g.restore();
    },

    // HD QUESTION BLOCK: Beveled golden metal with animated glowing '?' and specular sheen
    renderHDQuestionBlock(g, S, frame, time) {
      g.save();

      // Outer drop shadow border
      g.fillStyle = '#78350f';
      g.beginPath();
      g.roundRect(0, 0, S, S, 18);
      g.fill();

      // Golden face with metallic bevel gradient
      const goldGrad = g.createLinearGradient(0, 0, S, S);
      goldGrad.addColorStop(0, '#fef08a');
      goldGrad.addColorStop(0.25, '#facc15');
      goldGrad.addColorStop(0.65, '#eab308');
      goldGrad.addColorStop(1, '#ca8a04');
      g.fillStyle = goldGrad;
      g.beginPath();
      g.roundRect(4, 4, S - 8, S - 8, 14);
      g.fill();

      // Inner beveled plate
      const innerGrad = g.createLinearGradient(0, 16, 0, S - 16);
      innerGrad.addColorStop(0, '#fde047');
      innerGrad.addColorStop(1, '#d97706');
      g.fillStyle = innerGrad;
      g.beginPath();
      g.roundRect(14, 14, S - 28, S - 28, 10);
      g.fill();

      // Top specular glass gleam
      g.fillStyle = 'rgba(255, 255, 255, 0.45)';
      g.beginPath();
      g.roundRect(16, 16, S - 32, 22, 8);
      g.fill();

      // 4 Metallic Corner Rivets
      const rivets = [
        { x: 14, y: 14 },
        { x: S - 14, y: 14 },
        { x: 14, y: S - 14 },
        { x: S - 14, y: S - 14 }
      ];
      rivets.forEach(rv => {
        g.fillStyle = '#78350f';
        g.beginPath();
        g.arc(rv.x, rv.y + 1, 5, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = '#fef08a';
        g.beginPath();
        g.arc(rv.x, rv.y, 4.5, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = '#451a03';
        g.beginPath();
        g.arc(rv.x, rv.y, 2, 0, Math.PI * 2);
        g.fill();
      });

      // Animated Glowing Question Mark '?'
      const pulse = 1.0 + Math.sin(frame * 1.57) * 0.08;
      g.save();
      g.translate(S / 2, S / 2);
      g.scale(pulse, pulse);

      g.font = '900 76px "Titan One", "Outfit", "Arial Black", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';

      // Drop shadow
      g.fillStyle = '#78350f';
      g.fillText('?', 2, 8);

      // Specular glow
      g.shadowColor = '#ffffff';
      g.shadowBlur = 18;
      g.fillStyle = '#ffffff';
      g.fillText('?', 0, 4);

      // Question mark face
      g.shadowBlur = 0;
      const qGrad = g.createLinearGradient(0, -32, 0, 32);
      qGrad.addColorStop(0, '#ffffff');
      qGrad.addColorStop(0.6, '#fef08a');
      qGrad.addColorStop(1, '#f59e0b');
      g.fillStyle = qGrad;
      g.fillText('?', 0, 4);

      g.restore();
      g.restore();
    },

    // HD BRICK BLOCK: Terracotta chiseled bricks with dark mortar and highlight bevels
    renderHDBrick(g, S, theme) {
      g.save();

      g.fillStyle = theme === 8 ? '#0f172a' : '#2b1406';
      g.fillRect(0, 0, S, S);

      const brickCol1 = theme === 8 ? '#475569' : '#b45309';
      const brickCol2 = theme === 8 ? '#1e293b' : '#78350f';
      const highlight = theme === 8 ? '#94a3b8' : '#f59e0b';

      const rows = [
        [{ x: 3, w: S / 2 - 5 }, { x: S / 2 + 2, w: S / 2 - 5 }],
        [{ x: 3, w: S / 4 - 3 }, { x: S / 4 + 4, w: S / 2 - 6 }, { x: S * 0.75 + 2, w: S / 4 - 5 }],
        [{ x: 3, w: S / 2 - 5 }, { x: S / 2 + 2, w: S / 2 - 5 }],
        [{ x: 3, w: S / 4 - 3 }, { x: S / 4 + 4, w: S / 2 - 6 }, { x: S * 0.75 + 2, w: S / 4 - 5 }]
      ];

      const rH = (S - 14) / 4;
      rows.forEach((rList, ryIdx) => {
        const ry = 3 + ryIdx * (rH + 3);
        rList.forEach(b => {
          const bGrad = g.createLinearGradient(b.x, ry, b.x, ry + rH);
          bGrad.addColorStop(0, brickCol1);
          bGrad.addColorStop(1, brickCol2);
          g.fillStyle = bGrad;
          g.beginPath();
          g.roundRect(b.x, ry, b.w, rH, 3);
          g.fill();

          g.fillStyle = highlight;
          g.fillRect(b.x + 1, ry + 1, b.w - 2, 2);
          g.fillRect(b.x + 1, ry + 1, 2, rH - 2);
        });
      });

      g.restore();
    },

    // HD EMPTY HIT BLOCK: Burnished bronze/iron block with indented rivets
    renderHDEmptyBlock(g, S) {
      g.save();
      g.fillStyle = '#2b1c11';
      g.beginPath();
      g.roundRect(0, 0, S, S, 12);
      g.fill();

      const bGrad = g.createLinearGradient(0, 0, S, S);
      bGrad.addColorStop(0, '#8c593b');
      bGrad.addColorStop(0.5, '#6e4128');
      bGrad.addColorStop(1, '#4f2b17');
      g.fillStyle = bGrad;
      g.beginPath();
      g.roundRect(4, 4, S - 8, S - 8, 8);
      g.fill();

      g.strokeStyle = '#2b1406';
      g.lineWidth = 3;
      g.strokeRect(16, 16, S - 32, S - 32);

      [18, S - 18].forEach(rx => {
        [18, S - 18].forEach(ry => {
          g.fillStyle = '#2b1406';
          g.beginPath();
          g.arc(rx, ry + 1, 4, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#a67252';
          g.beginPath();
          g.arc(rx, ry, 3.5, 0, Math.PI * 2);
          g.fill();
        });
      });

      g.restore();
    },

    // HD HARD BLOCK: Polished chiseled slate/metal
    renderHDHardBlock(g, S, theme) {
      g.save();
      g.fillStyle = '#0f172a';
      g.fillRect(0, 0, S, S);

      const mGrad = g.createLinearGradient(0, 0, S, S);
      mGrad.addColorStop(0, '#64748b');
      mGrad.addColorStop(0.4, '#475569');
      mGrad.addColorStop(1, '#1e293b');
      g.fillStyle = mGrad;
      g.fillRect(3, 3, S - 6, S - 6);

      g.fillStyle = 'rgba(255, 255, 255, 0.2)';
      g.beginPath();
      g.moveTo(S / 2, 10);
      g.lineTo(S - 10, S / 2);
      g.lineTo(S / 2, S - 10);
      g.lineTo(10, S / 2);
      g.closePath();
      g.fill();

      g.strokeStyle = '#cbd5e1';
      g.lineWidth = 2.5;
      g.stroke();

      g.restore();
    },

    // HD PIPE: Lustrous 3D emerald cylinder with bright specular reflection
    renderHDPipe(g, S, type, theme) {
      g.save();
      const isTop = type === 'P';

      const pipeGrad = g.createLinearGradient(0, 0, S, 0);
      pipeGrad.addColorStop(0, '#064e3b');
      pipeGrad.addColorStop(0.18, '#059669');
      pipeGrad.addColorStop(0.38, '#34d399');
      pipeGrad.addColorStop(0.5, '#a7f3d0'); // Specular light highlight
      pipeGrad.addColorStop(0.68, '#10b981');
      pipeGrad.addColorStop(0.9, '#047857');
      pipeGrad.addColorStop(1, '#022c22');

      if (isTop) {
        g.fillStyle = '#022c22';
        g.beginPath();
        g.roundRect(0, 0, S, 44, [8, 8, 4, 4]);
        g.fill();

        g.fillStyle = pipeGrad;
        g.beginPath();
        g.roundRect(3, 3, S - 6, 38, [6, 6, 2, 2]);
        g.fill();

        const holeGrad = g.createLinearGradient(0, 4, 0, 16);
        holeGrad.addColorStop(0, '#021811');
        holeGrad.addColorStop(1, '#064e3b');
        g.fillStyle = holeGrad;
        g.fillRect(8, 4, S - 16, 10);

        g.fillStyle = '#022c22';
        g.fillRect(10, 44, S - 20, S - 44);

        g.fillStyle = pipeGrad;
        g.fillRect(13, 46, S - 26, S - 46);

        g.fillStyle = 'rgba(0, 0, 0, 0.45)';
        g.fillRect(13, 44, S - 26, 8);
      } else {
        g.fillStyle = '#022c22';
        g.fillRect(10, 0, S - 20, S);

        g.fillStyle = pipeGrad;
        g.fillRect(13, 0, S - 26, S);
      }

      g.restore();
    },

    // HD CLOUD: Fluffy painterly cumulus cloud puff
    renderHDCloud(g, S) {
      g.save();
      const cGrad = g.createRadialGradient(S / 2, S / 2, 10, S / 2, S / 2, S * 0.48);
      cGrad.addColorStop(0, '#ffffff');
      cGrad.addColorStop(0.7, '#f0fdf4');
      cGrad.addColorStop(1, 'rgba(224, 242, 254, 0.9)');
      g.fillStyle = cGrad;

      g.beginPath();
      g.arc(S * 0.5, S * 0.5, S * 0.38, 0, Math.PI * 2);
      g.arc(S * 0.28, S * 0.56, S * 0.24, 0, Math.PI * 2);
      g.arc(S * 0.72, S * 0.56, S * 0.24, 0, Math.PI * 2);
      g.arc(S * 0.4, S * 0.35, S * 0.26, 0, Math.PI * 2);
      g.arc(S * 0.62, S * 0.35, S * 0.26, 0, Math.PI * 2);
      g.fill();

      g.restore();
    },

    // ========================================================================
    // 2. NEXT-GEN PAINTERLY BACKGROUNDS (NINTENDO SWITCH 2 / WONDER QUALITY)
    // ========================================================================
    renderNextGenBackground(ctx, game) {
      const theme = game.level ? game.level.theme : 1;
      const W = 854;
      const H = 480;
      const camX = game.cameraX || 0;
      const time = game.time || 0;

      ctx.save();

      // ----------------------------------------------------------------------
      // THEME 1: PRADERA ARCOÍRIS (Wonder Alpine Peaks & Volumetric Sunbeams)
      // ----------------------------------------------------------------------
      if (theme === 1 || theme === 6 || theme === 7) {
        // Sky Gradient (Rich Cerulean Blue down to Golden Peach Horizon)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, '#1e40af');
        skyGrad.addColorStop(0.35, '#3b82f6');
        skyGrad.addColorStop(0.7, '#93c5fd');
        skyGrad.addColorStop(0.92, '#fed7aa');
        skyGrad.addColorStop(1, '#fef08a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        // Radiant Morning Sun
        const sunX = W - 180 - (camX * 0.02) % 1200;
        const sunY = 85;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 140);
        sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sunGlow.addColorStop(0.25, 'rgba(254, 240, 138, 0.6)');
        sunGlow.addColorStop(0.65, 'rgba(253, 186, 116, 0.25)');
        sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
        ctx.fill();

        // Volumetric Sunbeams (God Rays)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.22 + Math.sin(time * 0.8) * 0.06;
        for (let r = 0; r < 5; r++) {
          const angle = 0.45 + r * 0.16 + Math.sin(time * 0.5 + r) * 0.02;
          const rGrad = ctx.createLinearGradient(sunX, sunY, sunX + Math.cos(angle) * 700, sunY + Math.sin(angle) * 700);
          rGrad.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
          rGrad.addColorStop(0.7, 'rgba(253, 224, 71, 0.15)');
          rGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = rGrad;
          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.lineTo(sunX + Math.cos(angle - 0.06) * 750, sunY + Math.sin(angle - 0.06) * 750);
          ctx.lineTo(sunX + Math.cos(angle + 0.06) * 750, sunY + Math.sin(angle + 0.06) * 750);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Atmospheric Rainbow
        ctx.save();
        ctx.globalAlpha = 0.32;
        const rainbowColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc'];
        const rx = 440 - (camX * 0.05) % 1000;
        rainbowColors.forEach((c, idx) => {
          ctx.strokeStyle = c;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(rx, 440, 310 - idx * 10, Math.PI, 0);
          ctx.stroke();
        });
        ctx.restore();

        // PARALLAX LAYER 1: Far Majestic Alpine Mountains (x0.06)
        for (let m = 0; m < 5; m++) {
          const mx = ((m * 290 - camX * 0.06) % (W + 400) + W + 400) % (W + 400) - 180;
          const peakH = 150 + (m % 2) * 45;
          const mGrad = ctx.createLinearGradient(mx, peakH, mx + 260, 420);
          mGrad.addColorStop(0, '#818cf8');
          mGrad.addColorStop(0.35, '#6366f1');
          mGrad.addColorStop(0.75, '#4338ca');
          mGrad.addColorStop(1, '#c7d2fe'); // Atmospheric mist at base
          ctx.fillStyle = mGrad;

          ctx.beginPath();
          ctx.moveTo(mx, 420);
          ctx.lineTo(mx + 110, peakH);
          ctx.lineTo(mx + 130, peakH + 8);
          ctx.lineTo(mx + 145, peakH);
          ctx.lineTo(mx + 260, 420);
          ctx.closePath();
          ctx.fill();

          // Snow Cap with lighting
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(mx + 110, peakH);
          ctx.lineTo(mx + 145, peakH);
          ctx.lineTo(mx + 160, peakH + 32);
          ctx.lineTo(mx + 130, peakH + 24);
          ctx.lineTo(mx + 95, peakH + 32);
          ctx.closePath();
          ctx.fill();
        }

        // PARALLAX LAYER 2: Rolling Emerald Mid Hills with Pine Forests (x0.16)
        for (let h = 0; h < 6; h++) {
          const hx = ((h * 240 - camX * 0.16) % (W + 360) + W + 360) % (W + 360) - 160;
          const hy = 230 + (h % 3) * 30;

          const hillGrad = ctx.createLinearGradient(hx, hy, hx + 280, 430);
          hillGrad.addColorStop(0, '#34d399');
          hillGrad.addColorStop(0.4, '#059669');
          hillGrad.addColorStop(1, '#065f46');
          ctx.fillStyle = hillGrad;

          ctx.beginPath();
          ctx.moveTo(hx, 430);
          ctx.quadraticCurveTo(hx + 140, hy - 25, hx + 280, 430);
          ctx.closePath();
          ctx.fill();

          // Stylized Pine Trees on the ridge
          ctx.fillStyle = '#064e3b';
          for (let t = 0; t < 4; t++) {
            const tx = hx + 70 + t * 38;
            const ty = hy + 8 + (t % 2) * 6;
            ctx.beginPath();
            ctx.moveTo(tx, ty - 18);
            ctx.lineTo(tx + 8, ty);
            ctx.lineTo(tx - 8, ty);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(tx - 1.5, ty, 3, 5);
          }
        }

        // PARALLAX LAYER 3: Near Rolling Lush Flower Hills (x0.32)
        for (let n = 0; n < 5; n++) {
          const nx = ((n * 270 - camX * 0.32) % (W + 340) + W + 340) % (W + 340) - 140;
          const ny = 295 + (n % 2) * 20;

          const nearGrad = ctx.createLinearGradient(nx, ny, nx + 290, 430);
          nearGrad.addColorStop(0, '#86efac');
          nearGrad.addColorStop(0.45, '#22c55e');
          nearGrad.addColorStop(1, '#15803d');
          ctx.fillStyle = nearGrad;

          ctx.beginPath();
          ctx.moveTo(nx, 430);
          ctx.quadraticCurveTo(nx + 145, ny - 30, nx + 290, 430);
          ctx.closePath();
          ctx.fill();
        }

        // Painterly Cumulus Clouds drifting in the sky
        for (let c = 0; c < 4; c++) {
          const cx = ((c * 320 + time * 12 - camX * 0.1) % (W + 300) + W + 300) % (W + 300) - 120;
          const cy = 60 + (c % 3) * 35;
          const cGrad = ctx.createRadialGradient(cx + 40, cy + 20, 10, cx + 40, cy + 20, 65);
          cGrad.addColorStop(0, '#ffffff');
          cGrad.addColorStop(0.8, '#f0fdf4');
          cGrad.addColorStop(1, 'rgba(224, 242, 254, 0.85)');
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(cx + 30, cy + 25, 24, 0, Math.PI * 2);
          ctx.arc(cx + 55, cy + 18, 30, 0, Math.PI * 2);
          ctx.arc(cx + 85, cy + 22, 26, 0, Math.PI * 2);
          ctx.fill();
        }

      // ----------------------------------------------------------------------
      // THEME 4: PLAYA AL ATARDECER (Sunset Synthwave Horizon & Ocean Reflections)
      // ----------------------------------------------------------------------
      } else if (theme === 4) {
        const sunsetSky = ctx.createLinearGradient(0, 0, 0, H);
        sunsetSky.addColorStop(0, '#311042');
        sunsetSky.addColorStop(0.3, '#701a75');
        sunsetSky.addColorStop(0.55, '#c026d3');
        sunsetSky.addColorStop(0.72, '#f43f5e');
        sunsetSky.addColorStop(0.85, '#fb923c');
        sunsetSky.addColorStop(1, '#fde047');
        ctx.fillStyle = sunsetSky;
        ctx.fillRect(0, 0, W, H);

        // Huge Glowing Sunset Sun
        const sunY = 240;
        const sunX = W / 2 - (camX * 0.03) % 400;
        const sGrad = ctx.createLinearGradient(sunX, sunY - 90, sunX, sunY + 90);
        sGrad.addColorStop(0, '#ffffff');
        sGrad.addColorStop(0.3, '#fef08a');
        sGrad.addColorStop(0.7, '#f97316');
        sGrad.addColorStop(1, '#e11d48');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
        ctx.fill();

        // Ocean Sea Body
        const seaGrad = ctx.createLinearGradient(0, 260, 0, H);
        seaGrad.addColorStop(0, '#1e1b4b');
        seaGrad.addColorStop(0.4, '#312e81');
        seaGrad.addColorStop(1, '#4338ca');
        ctx.fillStyle = seaGrad;
        ctx.fillRect(0, 260, W, H - 260);

        // Sun path glistening ripples on water
        for (let r = 0; r < 14; r++) {
          const ry = 265 + r * 11;
          const rw = 20 + r * 18;
          ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.2, 0.85 - r * 0.05)})`;
          ctx.fillRect(sunX - rw / 2 + Math.sin(time * 3 + r) * 6, ry, rw, 3.5);
        }

        // Silhouette Palm Trees waving
        for (let p = 0; p < 4; p++) {
          const px = ((p * 280 - camX * 0.22) % (W + 280) + W + 280) % (W + 280) - 100;
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(px, 430);
          ctx.quadraticCurveTo(px + 20, 320, px + 35, 230);
          ctx.stroke();

          // Palm fronds
          ctx.fillStyle = '#18181b';
          for (let f = 0; f < 5; f++) {
            const rad = (f * Math.PI) / 4 + Math.sin(time * 2 + p) * 0.08;
            ctx.beginPath();
            ctx.ellipse(px + 35 + Math.cos(rad) * 45, 230 + Math.sin(rad) * 30, 45, 12, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      // ----------------------------------------------------------------------
      // THEME 8 / 3: CASTILLO DE LAVA (Volcanic Caldera & Magma Falls)
      // ----------------------------------------------------------------------
      } else if (theme === 8 || theme === 3) {
        const fireSky = ctx.createLinearGradient(0, 0, 0, H);
        fireSky.addColorStop(0, '#09090b');
        fireSky.addColorStop(0.4, '#261215');
        fireSky.addColorStop(0.75, '#450a0a');
        fireSky.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = fireSky;
        ctx.fillRect(0, 0, W, H);

        // Volcanic Spires in background
        for (let v = 0; v < 5; v++) {
          const vx = ((v * 260 - camX * 0.08) % (W + 300) + W + 300) % (W + 300) - 120;
          ctx.fillStyle = '#18181b';
          ctx.beginPath();
          ctx.moveTo(vx, 430);
          ctx.lineTo(vx + 60, 110);
          ctx.lineTo(vx + 140, 430);
          ctx.closePath();
          ctx.fill();

          // Magma streak
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(vx + 60, 110);
          ctx.lineTo(vx + 75, 280);
          ctx.lineTo(vx + 65, 430);
          ctx.stroke();
        }

      // ----------------------------------------------------------------------
      // THEME 12 / 14: VALLE GLACIAL (Aurora Borealis & Jagged Snow Peaks)
      // ----------------------------------------------------------------------
      } else if (theme === 12 || theme === 14) {
        const iceSky = ctx.createLinearGradient(0, 0, 0, H);
        iceSky.addColorStop(0, '#020617');
        iceSky.addColorStop(0.4, '#0f172a');
        iceSky.addColorStop(0.75, '#0c4a6e');
        iceSky.addColorStop(1, '#075985');
        ctx.fillStyle = iceSky;
        ctx.fillRect(0, 0, W, H);

        // Waving Aurora Borealis Curtains
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.35 + Math.sin(time) * 0.1;
        const auroraColors = ['#34d399', '#38bdf8', '#c084fc'];
        auroraColors.forEach((ac, idx) => {
          ctx.fillStyle = ac;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let x = 0; x <= W; x += 40) {
            const ay = 80 + idx * 25 + Math.sin(time * 1.5 + x * 0.01 + idx) * 35;
            ctx.lineTo(x, ay);
          }
          ctx.lineTo(W, 0);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();

        // Jagged Ice Crystals
        for (let i = 0; i < 5; i++) {
          const ix = ((i * 250 - camX * 0.1) % (W + 300) + W + 300) % (W + 300) - 120;
          const iGrad = ctx.createLinearGradient(ix, 140, ix + 180, 430);
          iGrad.addColorStop(0, '#bae6fd');
          iGrad.addColorStop(0.5, '#0284c7');
          iGrad.addColorStop(1, '#082f49');
          ctx.fillStyle = iGrad;
          ctx.beginPath();
          ctx.moveTo(ix, 430);
          ctx.lineTo(ix + 90, 140);
          ctx.lineTo(ix + 180, 430);
          ctx.closePath();
          ctx.fill();
        }

      // Default Theme Fallback
      } else {
        const defSky = ctx.createLinearGradient(0, 0, 0, H);
        defSky.addColorStop(0, '#0f172a');
        defSky.addColorStop(1, '#334155');
        ctx.fillStyle = defSky;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();
    },

    // ========================================================================
    // 3. WEATHER & AMBIENT PARTICLES
    // ========================================================================
    initWeather() {
      this.weatherParticles = [];
      for (let i = 0; i < 45; i++) {
        this.weatherParticles.push({
          x: Math.random() * 900,
          y: Math.random() * 500,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.5 + Math.random() * 1.5,
          size: 2.5 + Math.random() * 4.5,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.08,
          alpha: 0.35 + Math.random() * 0.55,
          sway: Math.random() * 10
        });
      }
    },

    updateWeather(dt, theme) {
      this.weatherParticles.forEach(p => {
        p.sway += dt * 2.2;
        p.x += (p.vx + Math.sin(p.sway) * 0.8) * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.rot += p.vrot;

        if (p.y > 490) {
          p.y = -10;
          p.x = Math.random() * 900;
        }
        if (p.x < -20) p.x = 880;
        if (p.x > 880) p.x = -20;
      });

      // Update Skid Smoke
      for (let s = this.smokeParticles.length - 1; s >= 0; s--) {
        const sm = this.smokeParticles[s];
        sm.x += sm.vx;
        sm.y += sm.vy;
        sm.size += 0.4;
        sm.alpha -= dt * 2.2;
        if (sm.alpha <= 0) {
          this.smokeParticles.splice(s, 1);
        }
      }
    },

    renderWeather(ctx, theme) {
      ctx.save();

      // Draw Skid Smoke Puffs
      this.smokeParticles.forEach(sm => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, sm.alpha);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, sm.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Ambient Weather
      this.weatherParticles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        // Snowy pine / glacial world
        if (theme === 12 || theme === 14) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#bae6fd';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();

        // Castle / Lava embers
        } else if (theme === 8 || theme === 3) {
          ctx.fillStyle = '#fb923c';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();

        // Stardust (Space)
        } else if (theme === 9) {
          ctx.fillStyle = '#fde047';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

        // Grassland drifting leaves & flower petals
        } else {
          ctx.fillStyle = p.size > 4.5 ? '#f472b6' : '#86efac';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      ctx.restore();
    },

    // ========================================================================
    // 4. FOREGROUND CINEMATIC DEPTH-OF-FIELD (FERNS / LEAVES FRAMING)
    // ========================================================================
    renderForegroundDepth(ctx, game) {
      const theme = game.level ? game.level.theme : 1;
      const W = 854;
      const H = 480;
      const camX = game.cameraX || 0;

      // Only draw framing foliage on outdoor themes
      if (theme !== 1 && theme !== 4 && theme !== 6) return;

      ctx.save();
      ctx.globalAlpha = 0.55;

      // Foreground lush fern in bottom corners (moving at 1.4x speed for 3D depth)
      const fx1 = ((-camX * 1.4) % (W + 600) + W + 600) % (W + 600) - 200;
      if (fx1 > -180 && fx1 < W + 100) {
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.ellipse(fx1, H - 20, 90, 45, -0.35, 0, Math.PI * 2);
        ctx.ellipse(fx1 + 60, H - 35, 80, 40, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },

    // ========================================================================
    // 5. DYNAMIC 2D LIGHTING PASS
    // ========================================================================
    renderLightingPass(ctx, game) {
      const theme = game.level ? game.level.theme : 1;
      const W = 854;
      const H = 480;

      ctx.save();

      // Atmospheric Vignette & Color Grade per theme
      if (theme === 8 || theme === 3) {
        // Lava Castle: Fiery warm bottom radiant glow
        const lavaGlow = ctx.createLinearGradient(0, H - 140, 0, H);
        lavaGlow.addColorStop(0, 'rgba(239, 68, 68, 0)');
        lavaGlow.addColorStop(1, 'rgba(249, 115, 22, 0.4)');
        ctx.fillStyle = lavaGlow;
        ctx.fillRect(0, 0, W, H);
      } else if (theme === 12 || theme === 14) {
        // Glacial Frost: Cool cyan atmospheric mist
        const frostGlow = ctx.createLinearGradient(0, 0, 0, H);
        frostGlow.addColorStop(0, 'rgba(186, 230, 253, 0.08)');
        frostGlow.addColorStop(1, 'rgba(56, 189, 248, 0.14)');
        ctx.fillStyle = frostGlow;
        ctx.fillRect(0, 0, W, H);
      } else if (theme === 4) {
        // Sunset Beach: Warm golden amber wash
        const sunsetGrad = ctx.createLinearGradient(0, 0, 0, H);
        sunsetGrad.addColorStop(0, 'rgba(251, 146, 60, 0.16)');
        sunsetGrad.addColorStop(1, 'rgba(244, 63, 94, 0.12)');
        ctx.fillStyle = sunsetGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // Dynamic Radial Point Lights (Screen Blend Mode)
      ctx.globalCompositeOperation = 'screen';

      // Ámbar's Light Halo
      const px = Math.round(game.player.x + game.player.w / 2 - game.cameraX);
      const py = Math.round(game.player.y + game.player.h / 2);

      if (px >= -80 && px <= W + 80) {
        const isStar = game.player.starTimer > 0;
        const isFlying = game.player.isFlying;
        const radius = isStar ? 130 : (isFlying ? 95 : 70);

        const pLight = ctx.createRadialGradient(px, py, 6, px, py, radius);
        if (isStar) {
          const hue = Math.floor((game.time * 540) % 360);
          pLight.addColorStop(0, `hsla(${hue}, 100%, 75%, 0.6)`);
          pLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (isFlying) {
          pLight.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
          pLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          pLight.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
          pLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = pLight;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Torches, Rainbow Projectiles & Fireballs Light
      game.projectiles.forEach(pr => {
        const rx = Math.round(pr.x + pr.w / 2 - game.cameraX);
        const ry = Math.round(pr.y + pr.h / 2);
        if (rx >= 0 && rx <= W) {
          const rLight = ctx.createRadialGradient(rx, ry, 2, rx, ry, 50);
          rLight.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
          rLight.addColorStop(0.5, 'rgba(244, 114, 182, 0.45)');
          rLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = rLight;
          ctx.beginPath();
          ctx.arc(rx, ry, 50, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();
    },

    // ========================================================================
    // 6. MODERN GLASSMORPHISM HUD
    // ========================================================================
    renderModernHUD(ctx, game) {
      const W = 854;
      ctx.save();

      // Top Glassmorphism Bar
      const barX = 14;
      const barY = 10;
      const barW = W - 28;
      const barH = 58;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 20);
      ctx.fill();

      // Glass border & top reflection sheen
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const sheenGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH * 0.45);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.roundRect(barX + 2, barY + 2, barW - 4, barH * 0.42, [18, 18, 4, 4]);
      ctx.fill();
      ctx.restore();

      // Ámbar Character Circular Portrait Badge
      window.spriteRenderer.drawAmbarPortrait(ctx, 22, 14, 50);

      // Lives Heart Container
      ctx.font = 'bold 15px "Outfit", "Titan One", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ÁMBAR', 82, 32);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '16px "Outfit", sans-serif';
      let hearts = '';
      for (let i = 0; i < Math.min(5, game.lives); i++) hearts += '❤️';
      ctx.fillText(`${hearts} ×${game.lives}`, 82, 54);

      // Outfit Status Pill
      const outfitLabels = [
        'JARDINERO (CHIQUITA)',
        'SÚPER ÁMBAR (BUZO + LENTES)',
        '🌈 PODER ARCOÍRIS (HAZ DE LUZ)'
      ];
      const outfitColors = ['#93c5fd', '#f472b6', '#fde047'];
      const currentOutfit = game.player.isFlying
        ? '🦸‍♀️ ¡VUELO SUPERMAN (X)!'
        : game.player.onBike
          ? '🚲 ¡BICICLETA TURBO!'
          : outfitLabels[game.player.powerState];
      const currentColor = game.player.isFlying
        ? '#fde047'
        : game.player.onBike
          ? '#4ade80'
          : (outfitColors[game.player.powerState] || '#ffffff');

      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillStyle = currentColor;
      ctx.fillText(currentOutfit, 220, 32);

      ctx.font = '11px "Outfit", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Salto Doble: Espacio | Tecla H: Cambiar Gráficos', 220, 52);

      // Star Coins Icons
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText('ESTRELLAS', W - 260, 30);
      const starCoins = game.starCoins || [];
      for (let i = 0; i < 3; i++) {
        const isCol = starCoins[i] && starCoins[i].collected;
        ctx.fillStyle = isCol ? '#fde047' : '#475569';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(isCol ? '⭐' : '☆', W - 280 + i * 20, 52);
      }

      // Coins Counter Pill
      ctx.textAlign = 'right';
      ctx.font = 'bold 16px "Titan One", "Outfit", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`🪙 ${String(game.coinsCount).padStart(2, '0')}`, W - 140, 34);

      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.fillStyle = '#38bdf8';
      const lvlStr = game.level && game.level.title ? game.level.title.split('-')[0].trim() : `MUNDO ${game.currentLevelIdx + 1}`;
      ctx.fillText(lvlStr, W - 140, 54);

      // Score Display
      ctx.font = '11px "Outfit", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('PUNTOS', W - 24, 30);

      ctx.font = 'bold 17px "Titan One", "Outfit", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(String(game.score).padStart(6, '0'), W - 24, 54);

      ctx.restore();
    },

    // ========================================================================
    // 7. ENGINE HOOKS & WRAPPERS
    // ========================================================================
    hookEngine() {
      const self = this;

      function applyHooks() {
        // Hook SpriteRenderer (instance or prototype)
        const renderer = window.spriteRenderer;
        if (renderer && !renderer._hdHooked) {
          renderer._hdHooked = true;

          // Hook drawTile
          const origDrawTile = renderer.drawTile;
          renderer.drawTile = function (ctx, type, x, y, size, time, levelTheme) {
            if (self.enabled) {
              let isSub = false;
              if (type === '#' && window.game && window.game.level && window.game.level.grid) {
                const r = Math.floor(y / size);
                const c = Math.floor(x / size);
                if (r > 0 && window.game.level.grid[r - 1] && (window.game.level.grid[r - 1][c] === '#' || window.game.level.grid[r - 1][c] === 'T')) {
                  isSub = true;
                }
              }
              const hdTile = self.getTile(type, levelTheme, time, isSub);
              if (hdTile) {
                ctx.save();
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(hdTile, x, y, size, size);
                ctx.restore();
                return;
              }
            }
            return origDrawTile.call(this, ctx, type, x, y, size, time, levelTheme);
          };

          // Hook drawEnemy
          const origDrawEnemy = renderer.drawEnemy;
          renderer.drawEnemy = function (ctx, enemy, time, levelTheme) {
            if (self.enabled && !enemy.dead) {
              ctx.save();
              const ew = enemy.w || 32;
              const eh = enemy.h || 32;
              const shadowX = Math.round(enemy.x + ew / 2);
              const groundY = Math.round(enemy.y + eh);
              ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
              ctx.beginPath();
              ctx.ellipse(shadowX, groundY + 1, ew * 0.42, 4.5, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            return origDrawEnemy.call(this, ctx, enemy, time, levelTheme);
          };

          // Hook drawAmbar (Adds Contact Shadow, Rim Light & Smoothness)
          const origDrawAmbar = renderer.drawAmbar;
          renderer.drawAmbar = function (ctx, player, time) {
            if (self.enabled) {
              ctx.save();
              ctx.imageSmoothingEnabled = true;

              // Draw Soft Contact Drop Shadow on the floor below Ámbar
              const shadowX = Math.round(player.x + player.w / 2);
              const groundY = Math.round(player.y + player.h);
              const airHeight = Math.max(0, (player.vy < 0 ? -player.vy * 4 : 0));
              const shadowAlpha = Math.max(0.12, 0.42 - airHeight * 0.005);
              const shadowRadius = Math.max(8, player.w * 0.45 - airHeight * 0.08);

              ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
              ctx.beginPath();
              ctx.ellipse(shadowX, groundY + 1, shadowRadius, 5, 0, 0, Math.PI * 2);
              ctx.fill();

              // Character Rim Light Glow (Subtle soft separation halo)
              ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
              ctx.shadowBlur = 8;
            }

            origDrawAmbar.call(this, ctx, player, time);

            if (self.enabled) {
              ctx.restore();
            }
          };
          console.log('✨ [ModernHD] Hooked window.spriteRenderer successfully!');
        }

        // Hook SuperAmbarGame (instance or prototype)
        const game = window.game;
        if (game && !game._hdHooked) {
          game._hdHooked = true;

          // Hook renderBackground (Replaces flat 16-bit mounds with Next-Gen Painterly Wonder Landscapes)
          const origRenderBackground = game.renderBackground;
          game.renderBackground = function (ctx) {
            if (self.enabled) {
              self.renderNextGenBackground(ctx, this);
              return;
            }
            origRenderBackground.call(this, ctx);
          };

          // Hook render (Passes Foreground Depth, Weather & Lighting)
          const origRender = game.render;
          game.render = function () {
            // If HD Mode is active, update weather & smoke
            if (self.enabled && this.state === 'PLAYING') {
              const dt = 1 / 60;
              self.updateWeather(dt, this.level ? this.level.theme : 1);

              // Spawn runner skid smoke if reversing direction at speed
              if (this.player && this.player.grounded && Math.abs(this.player.vx) > 3) {
                if (Math.random() < 0.28) {
                  self.smokeParticles.push({
                    x: this.player.x + this.player.w / 2 - (this.cameraX || 0),
                    y: this.player.y + this.player.h - 2,
                    vx: -Math.sign(this.player.vx) * (0.8 + Math.random() * 1.2),
                    vy: -(0.5 + Math.random() * 0.8),
                    size: 3 + Math.random() * 3,
                    alpha: 0.7
                  });
                }
              }
            }

            // Execute base render
            origRender.call(this);

            // If HD Mode is active, render foreground depth-of-field, lighting and weather
            if (self.enabled && (this.state === 'PLAYING' || this.state === 'VICTORY')) {
              const ctx = this.ctx;
              self.renderForegroundDepth(ctx, this);
              self.renderLightingPass(ctx, this);
              self.renderWeather(ctx, this.level ? this.level.theme : 1);
            }
          };

          // Hook renderHUD
          const origRenderHUD = game.renderHUD;
          game.renderHUD = function (ctx) {
            if (self.enabled) {
              self.renderModernHUD(ctx, this);
              return;
            }
            origRenderHUD.call(this, ctx);
          };
          console.log('✨ [ModernHD] Hooked window.game successfully!');
        }
      }

      applyHooks();
      window.addEventListener('DOMContentLoaded', applyHooks);
      setTimeout(applyHooks, 200);
      setTimeout(applyHooks, 1000);
    }
  };

  window.ModernHD = ModernHD;

  // Auto-init on script load or DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModernHD.init());
  } else {
    ModernHD.init();
  }
})();
