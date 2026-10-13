// ============================================================================
// RETRO 8-BIT WEB AUDIO SYNTHESIZER - SUPER ÁMBAR BROS
// ============================================================================

class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmTimer = null;
    this.currentTrack = null;
    this.stepIndex = 0;
    this.masterVolume = 0.28;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    } else if (this.currentTrack) {
      const trackToResume = this.currentTrack;
      this.currentTrack = null;
      this.playBgm(trackToResume);
    }
    return this.muted;
  }

  // Convert MIDI or Note name to Frequency
  noteFreq(note) {
    if (!note || note === '-') return 0;
    const notes = {
      'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'Fs3': 185.00, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'Cs4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'Fs4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'Cs5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'Fs5': 739.99, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98
    };
    return notes[note] || 0;
  }

  playTone(freq, duration, type = 'square', vol = 0.2, delay = 0, slideTo = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || freq <= 0) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    const effectiveVol = vol * this.masterVolume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(effectiveVol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playNoise(duration, vol = 0.2, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);

    const gain = this.ctx.createGain();
    const effectiveVol = vol * this.masterVolume;
    gain.gain.setValueAtTime(effectiveVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Sound Effects
  playSfx(name) {
    if (this.muted) return;
    this.init();

    switch (name) {
      case 'jump':
        this.playTone(180, 0.18, 'square', 0.35, 0, 520);
        break;

      case 'superJump':
        this.playTone(220, 0.22, 'square', 0.38, 0, 680);
        this.playTone(330, 0.18, 'triangle', 0.3, 0.04, 880);
        break;

      case 'coin':
        // Classic B5 -> E6 Mario coin chime
        this.playTone(987.77, 0.08, 'square', 0.35, 0);
        this.playTone(1318.51, 0.28, 'square', 0.35, 0.075);
        break;

      case 'bump':
        this.playTone(150, 0.09, 'triangle', 0.5, 0, 75);
        break;

      case 'break':
        this.playNoise(0.14, 0.45, 0);
        this.playTone(280, 0.08, 'square', 0.3, 0, 110);
        this.playTone(210, 0.1, 'square', 0.3, 0.05, 80);
        break;

      case 'powerupAppear': {
        const notes = ['C4', 'G4', 'C5', 'E5', 'G5', 'C6'];
        notes.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.07, 'square', 0.3, i * 0.045);
        });
        break;
      }

      case 'powerup': {
        // Classic Super transformation fanfare
        const seq = [
          'C4', 'E4', 'G4', 'C5', 'G4',
          'Ab4', 'C5', 'Eb5', 'Ab5', 'Eb5',
          'Bb4', 'D5', 'F5', 'Bb5', 'C6'
        ];
        seq.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.065, 'square', 0.36, i * 0.042);
        });
        break;
      }

      case 'shoot':
        this.playTone(880, 0.11, 'square', 0.32, 0, 290);
        this.playTone(1320, 0.09, 'triangle', 0.25, 0.02, 440);
        break;

      case 'stomp':
        this.playTone(260, 0.09, 'square', 0.38, 0, 580);
        this.playNoise(0.05, 0.25, 0);
        break;

      case 'kick':
        this.playTone(190, 0.06, 'square', 0.45, 0, 620);
        this.playNoise(0.06, 0.35, 0);
        break;

      case 'Spring':
      case 'spring':
        this.playTone(160, 0.28, 'square', 0.4, 0, 920);
        break;

      case 'hurt': {
        const notes = ['E5', 'C5', 'G4', 'E4', 'C4', 'G3'];
        notes.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.07, 'sawtooth', 0.32, i * 0.05);
        });
        break;
      }

      case 'oneup':
      case 'oneUp': {
        const notes = ['E5', 'G5', 'E6', 'C6', 'D6', 'G6'];
        notes.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.11, 'square', 0.38, i * 0.085);
        });
        break;
      }

      case 'starCoin': {
        const notes = ['C5', 'G5', 'C6', 'E6'];
        notes.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.14, 'triangle', 0.42, i * 0.06);
          this.playTone(this.noteFreq(n) * 2, 0.08, 'sine', 0.25, i * 0.06);
        });
        break;
      }

      case 'trick': {
        const notes = ['G4', 'C5', 'E5', 'G5'];
        notes.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.08, 'square', 0.35, i * 0.04);
        });
        break;
      }

      case 'checkpoint': {
        const notes = ['C5', 'E5', 'G5', 'C6'];
        notes.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.12, 'triangle', 0.45, i * 0.07);
        });
        break;
      }

      case 'flagpole': {
        const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'C6'];
        notes.forEach((n, i) => {
          this.playTone(this.noteFreq(n), 0.07, 'square', 0.32, i * 0.045);
        });
        break;
      }

      case 'stageClear': {
        const notes = [
          { n: 'G4', d: 0.12, t: 0.00 },
          { n: 'C5', d: 0.12, t: 0.12 },
          { n: 'E5', d: 0.12, t: 0.24 },
          { n: 'G5', d: 0.22, t: 0.36 },
          { n: 'E5', d: 0.14, t: 0.60 },
          { n: 'C6', d: 0.55, t: 0.76 }
        ];
        notes.forEach(item => {
          this.playTone(this.noteFreq(item.n), item.d, 'square', 0.4, item.t);
        });
        break;
      }

      case 'bossHit':
        this.playNoise(0.22, 0.5, 0);
        this.playTone(140, 0.2, 'sawtooth', 0.45, 0, 55);
        break;

      case 'bossDefeat': {
        for (let i = 0; i < 8; i++) {
          this.playNoise(0.12, 0.45, i * 0.1);
          this.playTone(200 + i * 95, 0.12, 'square', 0.38, i * 0.1, 100 + i * 60);
        }
        break;
      }

      case 'mapMove': {
        this.playTone(392, 0.04, 'square', 0.28, 0, 523);
        break;
      }

      case 'mapSelect': {
        this.playTone(523.25, 0.08, 'square', 0.35, 0);
        this.playTone(659.25, 0.08, 'square', 0.35, 0.05);
        this.playTone(783.99, 0.14, 'square', 0.40, 0.10);
        break;
      }

      case 'secretExit': {
        const notes = [
          { n: 'G4', d: 0.10, t: 0.00 },
          { n: 'Bb4', d: 0.10, t: 0.09 },
          { n: 'D5', d: 0.10, t: 0.18 },
          { n: 'G5', d: 0.16, t: 0.27 },
          { n: 'F5', d: 0.10, t: 0.45 },
          { n: 'Bb5', d: 0.12, t: 0.54 },
          { n: 'D6', d: 0.14, t: 0.65 },
          { n: 'G6', d: 0.45, t: 0.78 }
        ];
        notes.forEach(item => {
          this.playTone(this.noteFreq(item.n), item.d, 'square', 0.42, item.t);
          this.playTone(this.noteFreq(item.n) * 0.5, item.d * 1.1, 'triangle', 0.30, item.t);
        });
        break;
      }

      case 'gameover': {
        const notes = [
          { n: 'C5', d: 0.18, t: 0.00 },
          { n: 'G4', d: 0.18, t: 0.24 },
          { n: 'E4', d: 0.22, t: 0.48 },
          { n: 'A4', d: 0.18, t: 0.72 },
          { n: 'B4', d: 0.18, t: 0.90 },
          { n: 'A4', d: 0.18, t: 1.08 },
          { n: 'Ab4', d: 0.22, t: 1.26 },
          { n: 'Bb4', d: 0.22, t: 1.48 },
          { n: 'Ab4', d: 0.22, t: 1.70 },
          { n: 'G4', d: 0.55, t: 1.92 }
        ];
        notes.forEach(item => {
          this.playTone(this.noteFreq(item.n), item.d, 'triangle', 0.45, item.t);
        });
        break;
      }
    }
  }

  // Background Music Sequencer
  getTracks() {
    return {
      map: {
        // Cheerful Super Mario World style Overworld Map theme
        tempo: 148,
        lead: [
          'C5', '-', 'E5', 'G5', 'A5', 'G5', 'E5', '-',
          'F5', '-', 'A5', 'C6', 'B5', '-', 'G5', '-',
          'C5', '-', 'E5', 'G5', 'A5', 'C6', 'D6', '-',
          'B5', 'G5', 'E5', 'D5', 'C5', '-', '-', '-',
          'G5', 'A5', 'G5', 'E5', 'F5', 'G5', 'F5', 'D5',
          'E5', 'F5', 'E5', 'C5', 'D5', '-', 'G4', '-',
          'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6',
          'D6', 'B5', 'G5', 'D5', 'C5', '-', '-', '-'
        ],
        bass: [
          'C3', 'G3', 'E3', 'G3', 'F3', 'C4', 'A3', 'C4',
          'D3', 'A3', 'F3', 'A3', 'G3', 'D4', 'B3', 'D4',
          'C3', 'G3', 'E3', 'G3', 'F3', 'C4', 'A3', 'C4',
          'G3', 'D4', 'B3', 'D4', 'C3', 'G3', 'C3', '-',
          'C3', 'G3', 'E3', 'G3', 'D3', 'A3', 'F3', 'A3',
          'C3', 'G3', 'E3', 'G3', 'G3', 'D4', 'B3', 'G3',
          'C3', 'G3', 'E3', 'G3', 'F3', 'C4', 'A3', 'C4',
          'G3', 'D4', 'B3', 'G3', 'C3', 'G3', 'C3', '-'
        ]
      },
      title: {
        tempo: 165,
        lead: [
          'E5', 'G5', 'C6', 'B5', 'A5', 'G5', 'E5', 'C5',
          'D5', 'F5', 'A5', 'G5', 'F5', 'E5', 'D5', '-',
          'E5', 'G5', 'C6', 'B5', 'A5', 'C6', 'D6', 'B5',
          'C6', '-', 'G5', 'E5', 'C5', '-', '-', '-'
        ],
        bass: [
          'C3', 'G3', 'C4', 'G3', 'F3', 'C4', 'F4', 'C4',
          'G3', 'D4', 'G4', 'D4', 'C3', 'G3', 'C4', 'G3',
          'C3', 'G3', 'C4', 'G3', 'F3', 'C4', 'G3', 'D4',
          'C3', 'G3', 'E3', 'G3', 'C3', '-', '-', '-'
        ]
      },
      level1: {
        // Upbeat Candy & Rainbow Meadow Theme
        tempo: 145,
        lead: [
          'E5', 'E5', '-', 'E5', '-', 'C5', 'E5', '-',
          'G5', '-', '-', '-', 'G4', '-', '-', '-',
          'C5', '-', '-', 'G4', '-', '-', 'E4', '-',
          '-', 'A4', '-', 'B4', '-', 'Bb4', 'A4', '-',
          'G4', 'E5', 'G5', 'A5', '-', 'F5', 'G5', '-',
          'E5', '-', 'C5', 'D5', 'B4', '-', '-', '-',
          'C5', 'E5', 'G5', 'C6', '-', 'A5', 'G5', 'E5',
          'F5', 'D5', 'B4', 'G5', 'C5', '-', '-', '-'
        ],
        bass: [
          'C3', 'G3', 'C4', 'G3', 'C3', 'G3', 'C4', 'G3',
          'G3', 'D4', 'G4', 'D4', 'G3', 'D4', 'G3', '-',
          'C3', 'G3', 'E3', 'G3', 'C3', 'G3', 'E3', 'G3',
          'F3', 'C4', 'F3', 'C4', 'F3', 'Fs3', 'G3', '-',
          'C3', 'G3', 'E3', 'G3', 'F3', 'C4', 'A3', 'C4',
          'C3', 'G3', 'E3', 'G3', 'G3', 'D4', 'B3', 'G3',
          'C3', 'G3', 'E3', 'G3', 'F3', 'C4', 'A3', 'C4',
          'G3', 'D4', 'G3', 'B3', 'C3', 'G3', 'C3', '-'
        ]
      },
      level2: {
        // Playful Toy Workshop & Wooden Train Theme
        tempo: 150,
        lead: [
          'C5', '-', 'G4', 'E4', 'C5', '-', 'G4', '-',
          'A4', 'B4', 'C5', 'A4', 'G4', '-', '-', '-',
          'F5', '-', 'D5', 'B4', 'G5', '-', 'E5', '-',
          'D5', 'E5', 'D5', 'C5', 'D5', '-', '-', '-',
          'E5', 'G5', 'E5', 'C5', 'D5', 'F5', 'D5', 'B4',
          'C5', 'E5', 'A5', 'G5', 'F5', 'E5', 'D5', '-',
          'E5', 'C5', 'G5', 'E5', 'A5', 'F5', 'D5', 'B4',
          'C5', '-', 'E5', 'G5', 'C6', '-', '-', '-'
        ],
        bass: [
          'C3', 'G3', 'E3', 'G3', 'C3', 'G3', 'E3', 'G3',
          'F3', 'C4', 'A3', 'C4', 'C3', 'G3', 'E3', 'G3',
          'G3', 'D4', 'B3', 'D4', 'C3', 'G3', 'E3', 'G3',
          'G3', 'D4', 'B3', 'D4', 'G3', 'A3', 'B3', 'G3',
          'C3', 'G3', 'C3', 'G3', 'G3', 'D4', 'G3', 'D4',
          'A3', 'E4', 'A3', 'E4', 'F3', 'C4', 'G3', 'D4',
          'C3', 'G3', 'E3', 'G3', 'F3', 'C4', 'G3', 'D4',
          'C3', 'G3', 'E3', 'G3', 'C3', '-', '-', '-'
        ]
      },
      level3: {
        // Crystal Candy Castle & Boss Theme
        tempo: 130,
        lead: [
          'D5', 'Eb5', 'D5', 'C5', 'D5', 'Eb5', 'D5', '-',
          'G5', 'Fs5', 'G5', 'A5', 'Bb5', 'A5', 'G5', '-',
          'F5', 'G5', 'F5', 'Eb5', 'D5', 'Eb5', 'C5', '-',
          'D5', '-', 'A4', 'Bb4', 'D5', '-', 'Fs5', '-',
          'G5', 'D5', 'Bb5', 'A5', 'G5', 'Fs5', 'G5', '-',
          'Eb5', 'C5', 'G5', 'F5', 'Eb5', 'D5', 'C5', '-',
          'D5', 'Fs5', 'A5', 'C6', 'Bb5', 'A5', 'G5', 'Fs5',
          'G5', '-', 'D5', 'Fs5', 'G5', '-', '-', '-'
        ],
        bass: [
          'G3', 'D4', 'Bb3', 'D4', 'G3', 'D4', 'Bb3', 'D4',
          'Eb3', 'Bb3', 'G3', 'Bb3', 'Eb3', 'Bb3', 'G3', 'Bb3',
          'F3', 'C4', 'A3', 'C4', 'C3', 'G3', 'Eb3', 'G3',
          'D3', 'A3', 'Fs3', 'A3', 'D3', 'A3', 'D4', 'C4',
          'G3', 'D4', 'Bb3', 'D4', 'G3', 'D4', 'Bb3', 'D4',
          'C3', 'G3', 'Eb3', 'G3', 'C3', 'G3', 'Eb3', 'G3',
          'D3', 'A3', 'Fs3', 'A3', 'D3', 'A3', 'D4', 'A3',
          'G3', 'D4', 'D3', 'A3', 'G3', '-', '-', '-'
        ]
      },
      star: {
        // Super Rainbow Invincibility Theme
        tempo: 105,
        lead: [
          'C6', 'C6', 'C6', 'G5', 'C6', '-', 'C6', 'G5',
          'Bb5', 'Bb5', 'Bb5', 'F5', 'Bb5', '-', 'Bb5', 'F5',
          'C6', 'C6', 'C6', 'G5', 'C6', '-', 'E6', 'D6',
          'C6', 'B5', 'A5', 'B5', 'C6', '-', 'G5', '-'
        ],
        bass: [
          'C4', 'G4', 'C4', 'G4', 'C4', 'G4', 'C4', 'G4',
          'Bb3', 'F4', 'Bb3', 'F4', 'Bb3', 'F4', 'Bb3', 'F4',
          'C4', 'G4', 'C4', 'G4', 'C4', 'G4', 'C4', 'G4',
          'G3', 'D4', 'G3', 'D4', 'C4', 'G4', 'C4', '-'
        ]
      }
    };
  }

  playBgm(trackName) {
    if (this.currentTrack === trackName && this.bgmTimer) return;
    this.stopBgm();
    this.currentTrack = trackName;
    if (this.muted) return;

    const tracks = this.getTracks();
    const track = tracks[trackName];
    if (!track) return;

    this.stepIndex = 0;
    const stepMs = track.tempo;

    this.bgmTimer = setInterval(() => {
      if (this.muted) return;
      this.init();
      if (!this.ctx || this.ctx.state !== 'running') return;

      const leadNote = track.lead[this.stepIndex % track.lead.length];
      const bassNote = track.bass[this.stepIndex % track.bass.length];

      if (leadNote && leadNote !== '-') {
        this.playTone(this.noteFreq(leadNote), (stepMs / 1000) * 0.85, 'square', 0.16);
      }
      if (bassNote && bassNote !== '-') {
        this.playTone(this.noteFreq(bassNote), (stepMs / 1000) * 0.9, 'triangle', 0.22);
      }

      this.stepIndex++;
    }, stepMs);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.retroAudio = new RetroAudio();

