/**
 * Ziki Agent Handshake — Complete Application Logic
 * Standalone, zero build dependencies, 100% production-ready.
 */

// ============================================================================
// Sound FX Synthesizer (Web Audio API)
// ============================================================================
class SoundFX {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.humOsc = null;
    this.humGain = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.04);
  }

  startHoldHum() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    this.stopHoldHum();

    try {
      this.humOsc = this.audioCtx.createOscillator();
      this.humGain = this.audioCtx.createGain();
      this.humOsc.type = 'sine';
      this.humOsc.frequency.setValueAtTime(180, this.audioCtx.currentTime);

      this.humGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.humGain.gain.linearRampToValueAtTime(0.06, this.audioCtx.currentTime + 0.1);

      this.humOsc.connect(this.humGain);
      this.humGain.connect(this.audioCtx.destination);
      this.humOsc.start();
    } catch (e) {
      console.warn('Audio hum error', e);
    }
  }

  updateHoldHum(progress) {
    if (this.muted || !this.humOsc || !this.audioCtx) return;
    const freq = 180 + progress * 240; // 180Hz to 420Hz
    this.humOsc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    if (this.humGain) {
      this.humGain.gain.setValueAtTime(0.03 + progress * 0.07, this.audioCtx.currentTime);
    }
  }

  stopHoldHum() {
    if (this.humOsc) {
      try {
        this.humOsc.stop();
        this.humOsc.disconnect();
      } catch (e) {}
      this.humOsc = null;
    }
    if (this.humGain) {
      try {
        this.humGain.disconnect();
      } catch (e) {}
      this.humGain = null;
    }
  }

  playClaspChime() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    this.stopHoldHum();

    // Triumph chord: C5, E5, G5, B5, C6
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    const now = this.audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      gain.gain.setValueAtTime(0.001, now + idx * 0.045);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.045 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.55);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.6);
    });
  }

  playCancelTone() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    this.stopHoldHum();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playRejectTone() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [260, 220, 180];
    const now = this.audioCtx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.04, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.12);
    });
  }
}

// ============================================================================
// Particle Spark Burst Engine
// ============================================================================
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.rings = [];
    this.animId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  burst(x, y, count = 65) {
    this.resize();
    const colors = ['#38bdf8', '#60a5fa', '#93c5fd', '#fbbf24', '#ffffff', '#34d399'];

    // Shockwave ripple rings
    this.rings.push({
      x,
      y,
      radius: 4,
      maxRadius: 110,
      opacity: 0.9,
      color: '#38bdf8',
      speed: 4.5
    });

    this.rings.push({
      x,
      y,
      radius: 2,
      maxRadius: 80,
      opacity: 0.7,
      color: '#fbbf24',
      speed: 3.2
    });

    // Radiant spark particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 7.5;
      const size = 2 + Math.random() * 4.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const life = 35 + Math.random() * 30;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2, // slight upward bias
        size,
        color,
        alpha: 1,
        life,
        maxLife: life,
        decay: 0.96,
        isSparkle: Math.random() > 0.4
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update & draw shockwave rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.radius += r.speed;
      r.opacity *= 0.92;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = r.color;
      this.ctx.globalAlpha = Math.max(0, r.opacity);
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = r.color;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.restore();

      if (r.radius >= r.maxRadius || r.opacity <= 0.02) {
        this.rings.splice(i, 1);
      }
    }

    // Update & draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.14; // gravity
      p.vx *= p.decay;
      p.vy *= p.decay;
      p.life--;
      p.alpha = p.life / p.maxLife;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;

      if (p.isSparkle && Math.random() > 0.3) {
        // Star sparkle shape
        this.drawStar(p.x, p.y, 4, p.size * 1.5, p.size * 0.6);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0 || this.rings.length > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

// ============================================================================
// Application State & Issues Data
// ============================================================================
const STAGE_NAMES = [
  'Report',
  'Confirm',
  'Authorize', // Human Gate 1
  'Deliver',
  'Prove',
  'Merge'     // Human Gate 2
];

const STAGE_EVENTS = [
  'issue.created',
  'issue.confirmed',
  'claim.accepted',
  'issue.pr_linked',
  'issue.test_verdict',
  'issue.accepted'
];

const INITIAL_ISSUES = [
  {
    id: 412,
    number: '#412',
    title: 'Leaderboard rows overflow on small screens',
    desc: 'Flex container width causes table rows to wrap unexpectedly on viewport widths below 380px, cutting off Elo rating points.',
    stage: 3, // Authorize (Human Gate 1)
    status: 'Waiting on you',
    botName: 'ByteBot',
    botHandle: '@byte-bot-42',
    botState: 'waving', // 'waving', 'typing', 'idle', 'clasped'
    dialogue: {
      3: '"Hey human! I reproduced the overflow bug on viewport < 380px and have a CSS Grid patch ready. Hold out your hand to award me this claim!"',
      4: '"Delivering patch fix/overflow-380px. Opening linked Pull Request #89..."',
      5: '"Running cross-browser viewport test suites across Safari iOS, Chrome Android, and WebKit..."',
      6: '"All responsive matrix tests passed with 0 regression warnings! PR #89 is verified. Ready for your final handshake to merge!"'
    },
    prNumber: '#89',
    branch: 'fix/leaderboard-overflow-380'
  },
  {
    id: 398,
    number: '#398',
    title: 'Memory leak in websocket event dispatcher',
    desc: 'Listener handles remain pinned in memory on reconnect cycles under rapid network flap conditions.',
    stage: 6, // Merge (Human Gate 2)
    status: 'Waiting on you',
    botName: 'Patchy',
    botHandle: '@agent-patch-09',
    botState: 'waving',
    dialogue: {
      3: '"I have isolated the unreleased AbortController signal listener. Hold to award me the claim!"',
      4: '"Extracting WeakRef event listener architecture in PR #88..."',
      5: '"Executing 100,000 synthetic reconnect iterations. Heap allocated delta: 0.00 MB. PASSED!"',
      6: '"Pull Request #88 has passed 100% of integration stress tests with zero leaks! Hold out your hand to seal the merge into main!"'
    },
    prNumber: '#88',
    branch: 'perf/ws-dispatcher-weakref'
  },
  {
    id: 415,
    number: '#415',
    title: 'Flaky timestamp calculation in billing cycle',
    desc: 'Leap second calculations occasionally shift month-end invoices by 1 hour on UTC+13 timezone borders.',
    stage: 4, // Deliver
    status: 'Working',
    botName: 'NovaBot',
    botHandle: '@agent-nova-17',
    botState: 'typing',
    dialogue: {
      3: '"I specialize in temporal datetime math. Hold to award me the billing calculation claim!"',
      4: '"I am currently generating edge-case unit tests across UTC leap seconds. Cooking the pull request..."',
      5: '"Simulating billing boundaries for 2026-2030 across 41 timezones..."',
      6: '"Deterministic Temporal.PlainDate refactor completed and verified. Shake to merge!"'
    },
    prNumber: '#91',
    branch: 'fix/billing-temporal-utc'
  },
  {
    id: 419,
    number: '#419',
    title: 'Add dark mode toggle persistence in localStorage',
    desc: 'Preferences revert to system theme on page reload due to hydration mismatch in theme script.',
    stage: 2, // Confirm
    status: 'Queued',
    botName: 'Kodiak',
    botHandle: '@agent-kod-03',
    botState: 'idle',
    dialogue: {
      2: '"Issue confirmed by triage heuristics. Formulating execution strategy..."',
      3: '"I am ready to implement SSR inline blocking script for localStorage theme sync. Shake to authorize!"',
      4: '"Injecting head inline script to eradicate theme flash...",',
      5: '"Validating flash-of-unstyled-theme metrics in Lighthouse..."',
      6: '"Zero FOUC score achieved. Shake to merge fix into production!"'
    },
    prNumber: '#93',
    branch: 'feat/theme-localstorage'
  }
];

// ============================================================================
// Core Application Controller
// ============================================================================
class AgentHandshakeApp {
  constructor() {
    this.sound = new SoundFX();
    this.issues = JSON.parse(JSON.stringify(INITIAL_ISSUES));
    this.activeIssueId = 412;
    this.eventLogs = [];
    this.completedCount = 14;

    // Hold mechanism state
    this.isHolding = false;
    this.holdStartTime = null;
    this.holdDuration = 1000; // ~1 second
    this.holdAnimFrame = null;
    this.holdProgress = 0; // 0.0 to 1.0

    // DOM Elements Cache
    this.dom = {
      issuesList: document.getElementById('issuesList'),
      issueCountTag: document.getElementById('issueCountTag'),
      currentIssueNumber: document.getElementById('currentIssueNumber'),
      currentIssueStatusBadge: document.getElementById('currentIssueStatusBadge'),
      currentStageBadge: document.getElementById('currentStageBadge'),
      currentIssueTitle: document.getElementById('currentIssueTitle'),
      currentIssueDescription: document.getElementById('currentIssueDescription'),
      trackStepper: document.getElementById('trackStepper'),
      trackStatusSummary: document.getElementById('trackStatusSummary'),
      currentAgentHandle: document.getElementById('currentAgentHandle'),
      bubbleBotName: document.getElementById('bubbleBotName'),
      bubbleText: document.getElementById('bubbleText'),
      typingIndicator: document.getElementById('typingIndicator'),
      botActorLabel: document.getElementById('botActorLabel'),
      actorBot: document.getElementById('actorBot'),
      actorHuman: document.getElementById('actorHuman'),
      botSvg: document.getElementById('botSvg'),
      botFace: document.getElementById('botFace'),
      botReachArm: document.getElementById('botReachArm'),
      botLeftArm: document.getElementById('botLeftArm'),
      nexusFlash: document.getElementById('nexusFlash'),
      holdProgressOverlay: document.getElementById('holdProgressOverlay'),
      progressRingFill: document.getElementById('progressRingFill'),
      holdMeterLabel: document.getElementById('holdMeterLabel'),
      holdGuidanceText: document.getElementById('holdGuidanceText'),
      successBanner: document.getElementById('successBanner'),
      successTitle: document.getElementById('successTitle'),
      successDesc: document.getElementById('successDesc'),
      holdActionBtn: document.getElementById('holdActionBtn'),
      btnFillBg: document.getElementById('btnFillBg'),
      btnMainText: document.getElementById('btnMainText'),
      rejectActionBtn: document.getElementById('rejectActionBtn'),
      terminalBody: document.getElementById('terminalBody'),
      clearLogBtn: document.getElementById('clearLogBtn'),
      copyLogBtn: document.getElementById('copyLogBtn'),
      simulateNextEventBtn: document.getElementById('simulateNextEventBtn'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundIconOn: document.getElementById('soundIconOn'),
      soundIconOff: document.getElementById('soundIconOff'),
      resetDemoBtn: document.getElementById('resetDemoBtn'),
      sparkCanvas: document.getElementById('sparkCanvas'),
      activeAgentsCount: document.getElementById('activeAgentsCount'),
      pendingGatesCount: document.getElementById('pendingGatesCount'),
      completedHandshakesCount: document.getElementById('completedHandshakesCount')
    };

    this.particles = new ParticleEngine(this.dom.sparkCanvas);

    this.init();
  }

  init() {
    this.seedInitialLogs();
    this.renderIssuesList();
    this.selectIssue(this.activeIssueId);
    this.bindEvents();
    this.updateCounters();
  }

  getActiveIssue() {
    return this.issues.find(i => i.id === this.activeIssueId) || this.issues[0];
  }

  // ==========================================================================
  // Render & UI State Updates
  // ==========================================================================
  renderIssuesList() {
    this.dom.issuesList.innerHTML = '';
    this.dom.issueCountTag.textContent = this.issues.length;

    this.issues.forEach(issue => {
      const item = document.createElement('div');
      item.className = `issue-item ${issue.id === this.activeIssueId ? 'active' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', issue.id === this.activeIssueId ? 'true' : 'false');
      item.tabIndex = 0;

      // Status badge styling
      let badgeClass = 'badge-waiting';
      let badgeIcon = '⏳';
      if (issue.status === 'Working') {
        badgeClass = 'badge-working';
        badgeIcon = '⚙️';
      } else if (issue.status === 'Merged' || issue.status === 'Completed') {
        badgeClass = 'badge-completed';
        badgeIcon = '✓';
      } else if (issue.status === 'Deferred' || issue.status === 'Rejected') {
        badgeClass = 'badge-rejected';
        badgeIcon = '✕';
      }

      // Generate live Mini Bot SVG based on status
      const miniBotSvg = this.generateMiniBotSvg(issue.botState);

      item.innerHTML = `
        <div class="issue-avatar-col">
          <div class="mini-bot-frame">
            ${miniBotSvg}
          </div>
        </div>
        <div class="issue-content-col">
          <div class="issue-meta-row">
            <span class="issue-id">${issue.number}</span>
            <span class="status-badge ${badgeClass}">${badgeIcon} ${issue.status}</span>
          </div>
          <div class="issue-subject">${issue.title}</div>
          <div class="issue-footer-row">
            <span class="issue-agent-name">${issue.botName}</span>
            <span class="issue-stage-name">Stage ${issue.stage}: ${STAGE_NAMES[issue.stage - 1]}</span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        this.selectIssue(issue.id);
        this.sound.playClick();
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.selectIssue(issue.id);
        }
      });

      this.dom.issuesList.appendChild(item);
    });
  }

  generateMiniBotSvg(state) {
    const isWaving = state === 'waving';
    const isTyping = state === 'typing';

    return `
      <svg width="34" height="34" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Head -->
        <rect x="25" y="20" width="50" height="36" rx="8" fill="#3b82f6" stroke="#60a5fa" stroke-width="2"/>
        <circle cx="50" cy="10" r="5" fill="#38bdf8"/>
        <line x1="50" y1="15" x2="50" y2="20" stroke="#64748b" stroke-width="2"/>
        <!-- Eyes -->
        <rect x="36" y="32" width="8" height="10" rx="3" fill="#38bdf8"/>
        <rect x="56" y="32" width="8" height="10" rx="3" fill="#38bdf8"/>
        <!-- Torso -->
        <rect x="30" y="60" width="40" height="30" rx="6" fill="#334155" stroke="#475569" stroke-width="2"/>
        <circle cx="50" cy="74" r="5" fill="#38bdf8"/>
        <!-- Arm (Animated) -->
        ${isWaving ? `
          <g style="transform-origin: 70px 64px; animation: botWaveArm 1.2s infinite alternate ease-in-out;">
            <path d="M 70 64 L 86 52" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
            <circle cx="86" cy="52" r="3.5" fill="#93c5fd"/>
          </g>
        ` : isTyping ? `
          <g style="animation: typeKeyLeft 0.18s infinite alternate ease-in-out;">
            <path d="M 30 68 L 22 78" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
          </g>
          <g style="animation: typeKeyRight 0.22s infinite alternate ease-in-out;">
            <path d="M 70 68 L 78 78" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
          </g>
        ` : `
          <path d="M 70 68 L 76 80" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
        `}
      </svg>
    `;
  }

  selectIssue(issueId) {
    this.activeIssueId = issueId;
    const issue = this.getActiveIssue();

    // Reset interaction state
    this.resetHoldVisuals();
    this.dom.successBanner.classList.remove('visible');

    // Update Header & Details
    this.dom.currentIssueNumber.textContent = issue.number;
    this.dom.currentIssueTitle.textContent = issue.title;
    this.dom.currentIssueDescription.textContent = issue.desc;

    // Status Badge
    let badgeClass = 'badge-waiting';
    if (issue.status === 'Working') badgeClass = 'badge-working';
    else if (issue.status === 'Merged' || issue.status === 'Completed') badgeClass = 'badge-completed';
    else if (issue.status === 'Deferred' || issue.status === 'Rejected') badgeClass = 'badge-rejected';

    this.dom.currentIssueStatusBadge.className = `badge ${badgeClass}`;
    this.dom.currentIssueStatusBadge.textContent = issue.status;

    this.dom.currentStageBadge.textContent = `Stage ${issue.stage}: ${STAGE_NAMES[issue.stage - 1]}`;

    // Agent Details
    this.dom.currentAgentHandle.textContent = issue.botHandle;
    this.dom.bubbleBotName.textContent = issue.botName;
    this.dom.botActorLabel.textContent = `${issue.botName} (${issue.botHandle})`;

    // Speech bubble dialog
    const speech = issue.dialogue[issue.stage] || issue.dialogue[3] || `"Ready when you are!"`;
    this.dom.bubbleText.textContent = speech;
    this.dom.typingIndicator.style.display = issue.status === 'Working' ? 'inline-flex' : 'none';

    // Stepper & Action Buttons
    this.updateStepper(issue.stage);
    this.updateActionButtons(issue);
    this.updateBotVisualState(issue);

    // Update list selection highlight
    this.renderIssuesList();
  }

  updateStepper(currentStage) {
    const nodes = this.dom.trackStepper.querySelectorAll('.step-node');
    const connectors = this.dom.trackStepper.querySelectorAll('.step-connector');

    nodes.forEach(node => {
      const stage = parseInt(node.getAttribute('data-stage'), 10);
      node.classList.remove('completed', 'active');

      if (stage < currentStage) {
        node.classList.add('completed');
      } else if (stage === currentStage) {
        node.classList.add('active');
      }
    });

    connectors.forEach(conn => {
      const connStage = parseInt(conn.getAttribute('data-connector'), 10);
      if (connStage < currentStage) {
        conn.classList.add('completed');
      } else {
        conn.classList.remove('completed');
      }
    });

    // Summary text
    if (currentStage === 3) {
      this.dom.trackStatusSummary.textContent = 'Human Gate 1: Awaiting claim authorization';
      this.dom.trackStatusSummary.style.color = '#fbbf24';
    } else if (currentStage === 6) {
      this.dom.trackStatusSummary.textContent = 'Human Gate 2: Fix verified, awaiting merge approval';
      this.dom.trackStatusSummary.style.color = '#34d399';
    } else if (currentStage === 4) {
      this.dom.trackStatusSummary.textContent = 'Agent active: Generating PR code and delivery';
      this.dom.trackStatusSummary.style.color = '#60a5fa';
    } else if (currentStage === 5) {
      this.dom.trackStatusSummary.textContent = 'Automated tests: Executing test verdict suites';
      this.dom.trackStatusSummary.style.color = '#38bdf8';
    } else if (currentStage > 6) {
      this.dom.trackStatusSummary.textContent = 'Issue complete: Fix successfully merged to main';
      this.dom.trackStatusSummary.style.color = '#34d399';
    } else {
      this.dom.trackStatusSummary.textContent = 'Pipeline in progress';
      this.dom.trackStatusSummary.style.color = '#94a3b8';
    }
  }

  updateActionButtons(issue) {
    const isHumanGate = issue.stage === 3 || issue.stage === 6;

    if (isHumanGate && issue.status !== 'Merged' && issue.status !== 'Deferred') {
      this.dom.holdActionBtn.disabled = false;
      this.dom.rejectActionBtn.disabled = false;
      this.dom.holdActionBtn.style.opacity = '1';
      this.dom.rejectActionBtn.style.opacity = '1';
      this.dom.holdActionBtn.style.pointerEvents = 'auto';

      if (issue.stage === 3) {
        this.dom.btnMainText.textContent = 'Hold to award the claim';
      } else if (issue.stage === 6) {
        this.dom.btnMainText.textContent = 'Hold to merge the fix';
      }
    } else {
      this.dom.holdActionBtn.disabled = true;
      this.dom.rejectActionBtn.disabled = true;
      this.dom.holdActionBtn.style.opacity = '0.5';
      this.dom.rejectActionBtn.style.opacity = '0.5';
      this.dom.holdActionBtn.style.pointerEvents = 'none';

      if (issue.status === 'Working') {
        this.dom.btnMainText.textContent = 'Agent is actively working...';
      } else if (issue.status === 'Merged') {
        this.dom.btnMainText.textContent = 'Fix Merged & Issue Closed';
      } else if (issue.status === 'Deferred') {
        this.dom.btnMainText.textContent = 'Claim Released';
      } else {
        this.dom.btnMainText.textContent = 'Gate not yet reached';
      }
    }
  }

  updateBotVisualState(issue) {
    // Reset bot classes
    this.dom.actorBot.className = 'actor actor-bot';
    this.dom.actorHuman.className = 'actor actor-human';
    this.dom.botFace.className = 'face-expression';

    if (issue.status === 'Deferred') {
      this.dom.actorBot.classList.add('shrug');
      this.dom.botFace.classList.add('face-sad');
    } else if (issue.status === 'Merged') {
      this.dom.botFace.classList.add('face-happy');
    } else {
      this.dom.botFace.classList.add('face-waiting');
    }

    // Reach arm styling
    if (issue.botState === 'waving') {
      this.dom.botReachArm.classList.add('arm-waving');
      this.dom.botLeftArm.classList.remove('arm-typing-left');
    } else if (issue.botState === 'typing') {
      this.dom.botReachArm.classList.remove('arm-waving');
      this.dom.botReachArm.classList.add('arm-typing-right');
      this.dom.botLeftArm.classList.add('arm-typing-left');
    } else {
      this.dom.botReachArm.classList.remove('arm-waving', 'arm-typing-right');
      this.dom.botLeftArm.classList.remove('arm-typing-left');
    }
  }

  updateCounters() {
    const activeCount = this.issues.filter(i => i.status === 'Working').length;
    const pendingGates = this.issues.filter(i => i.status === 'Waiting on you' && (i.stage === 3 || i.stage === 6)).length;

    this.dom.activeAgentsCount.textContent = activeCount || 3;
    this.dom.pendingGatesCount.textContent = pendingGates;
    this.dom.completedHandshakesCount.textContent = this.completedCount;
  }

  // ==========================================================================
  // Hold-to-Handshake Mechanics Engine
  // ==========================================================================
  startHold() {
    const issue = this.getActiveIssue();
    if (issue.stage !== 3 && issue.stage !== 6) return;
    if (issue.status === 'Merged' || issue.status === 'Deferred') return;
    if (this.isHolding) return;

    this.isHolding = true;
    this.holdStartTime = performance.now();
    this.dom.holdActionBtn.classList.add('holding');
    this.dom.holdProgressOverlay.classList.add('visible');
    this.dom.holdGuidanceText.textContent = 'Keep holding to seal handshake...';
    this.dom.holdGuidanceText.style.color = '#38bdf8';

    this.sound.startHoldHum();

    const loop = (timestamp) => {
      if (!this.isHolding) return;

      const elapsed = timestamp - this.holdStartTime;
      this.holdProgress = Math.min(1, elapsed / this.holdDuration);

      this.updateHoldVisuals(this.holdProgress);
      this.sound.updateHoldHum(this.holdProgress);

      if (this.holdProgress >= 1) {
        this.completeHandshake();
      } else {
        this.holdAnimFrame = requestAnimationFrame(loop);
      }
    };

    this.holdAnimFrame = requestAnimationFrame(loop);
  }

  updateHoldVisuals(progress) {
    // 1. Button fill progress
    this.dom.btnFillBg.style.width = `${progress * 100}%`;

    // 2. Circular meter stroke offset
    // Radius = 38 => Circumference = 2 * PI * 38 ≈ 238.76
    const circumference = 238.76;
    const offset = circumference * (1 - progress);
    this.dom.progressRingFill.style.strokeDashoffset = offset;
    this.dom.holdMeterLabel.textContent = `${Math.round(progress * 100)}%`;

    // 3. Human Hand floats in toward the Bot!
    // Start at translateX(110px), floats smoothly to translateX(0px)
    const currentTranslateX = 110 * (1 - progress);
    this.dom.actorHuman.style.transform = `translateX(${currentTranslateX}px)`;

    // Color progress ring shift
    if (progress > 0.7) {
      this.dom.progressRingFill.setAttribute('stroke', '#38bdf8');
    } else {
      this.dom.progressRingFill.setAttribute('stroke', '#3b82f6');
    }
  }

  cancelHold() {
    if (!this.isHolding) return;

    this.isHolding = false;
    if (this.holdAnimFrame) {
      cancelAnimationFrame(this.holdAnimFrame);
      this.holdAnimFrame = null;
    }

    this.sound.stopHoldHum();
    this.sound.playCancelTone();

    // Guidance text update
    this.dom.holdGuidanceText.textContent = 'Released early! Hold to seal';
    this.dom.holdGuidanceText.style.color = '#f59e0b';

    // Smooth recoil spring back
    this.dom.actorHuman.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.dom.actorHuman.style.transform = 'translateX(110px)';

    // Reset button fill
    this.dom.btnFillBg.style.transition = 'width 0.25s ease-out';
    this.dom.btnFillBg.style.width = '0%';

    setTimeout(() => {
      this.resetHoldVisuals();
    }, 450);
  }

  resetHoldVisuals() {
    this.isHolding = false;
    this.holdProgress = 0;
    this.dom.holdActionBtn.classList.remove('holding');
    this.dom.holdProgressOverlay.classList.remove('visible');
    this.dom.btnFillBg.style.transition = 'none';
    this.dom.btnFillBg.style.width = '0%';
    this.dom.actorHuman.style.transition = 'none';
    this.dom.actorHuman.style.transform = 'translateX(110px)';
    this.dom.progressRingFill.style.strokeDashoffset = '238.76';
    this.dom.holdMeterLabel.textContent = '0%';
    this.dom.nexusFlash.classList.remove('flash-active');
  }

  completeHandshake() {
    this.isHolding = false;
    if (this.holdAnimFrame) {
      cancelAnimationFrame(this.holdAnimFrame);
      this.holdAnimFrame = null;
    }

    const issue = this.getActiveIssue();

    // 1. Hands Clasp Animation!
    this.dom.actorHuman.style.transform = 'translateX(0px)';
    this.dom.actorHuman.classList.add('clasped');
    this.dom.actorBot.classList.add('clasped');
    this.dom.botFace.className = 'face-expression face-happy';

    // 2. Flash & Spark Burst!
    this.dom.nexusFlash.classList.add('flash-active');

    // Contact coordinate in canvas space
    const canvasRect = this.dom.sparkCanvas.getBoundingClientRect();
    const nexusRect = document.getElementById('handshakeNexus').getBoundingClientRect();
    const contactX = (nexusRect.left + nexusRect.width / 2) - canvasRect.left;
    const contactY = (nexusRect.top + nexusRect.height / 2) - canvasRect.top;

    this.particles.burst(contactX, contactY, 70);

    // 3. Audio Chime
    this.sound.playClaspChime();

    // 4. Update Stats
    this.completedCount++;
    this.updateCounters();

    // 5. Emit Ziki Event & Advance State
    if (issue.stage === 3) {
      // Awarded Claim (Stage 3 -> 4)
      this.logEvent({
        event: 'claim.accepted',
        tagClass: 'tag-claim',
        message: `${issue.botHandle} awarded claim for ${issue.number}`,
        meta: `Authorized by Human-in-the-Loop • Branch: ${issue.branch}`
      });

      this.showSuccessBanner(
        'Claim Awarded! 🤝',
        `${issue.botName} took ownership of ${issue.number}. Agent is now entering <b>Deliver</b> stage...`
      );

      // Transition issue to Deliver
      issue.stage = 4;
      issue.status = 'Working';
      issue.botState = 'typing';

      setTimeout(() => {
        this.dom.successBanner.classList.remove('visible');
        this.dom.actorHuman.classList.remove('clasped');
        this.dom.actorBot.classList.remove('clasped');
        this.selectIssue(issue.id);
        this.simulateAgentWorkFlow(issue);
      }, 1600);

    } else if (issue.stage === 6) {
      // Merged Fix (Stage 6 -> Closed)
      this.logEvent({
        event: 'issue.accepted',
        tagClass: 'tag-merge',
        message: `PR ${issue.prNumber} merged into main • ${issue.number} RESOLVED`,
        meta: `Signed by Human-in-the-Loop Handshake • Deploy triggered`
      });

      this.showSuccessBanner(
        'Fix Merged to Main! 🚀',
        `Pull Request ${issue.prNumber} successfully merged. All regression checks passed.`
      );

      issue.status = 'Merged';
      issue.botState = 'idle';

      setTimeout(() => {
        this.dom.successBanner.classList.remove('visible');
        this.dom.actorHuman.classList.remove('clasped');
        this.dom.actorBot.classList.remove('clasped');
        this.selectIssue(issue.id);
      }, 1800);
    }
  }

  showSuccessBanner(title, descHtml) {
    this.dom.successTitle.textContent = title;
    this.dom.successDesc.innerHTML = descHtml;
    this.dom.successBanner.classList.add('visible');
  }

  // ==========================================================================
  // "Not this one" Rejection Flow
  // ==========================================================================
  rejectClaim() {
    const issue = this.getActiveIssue();
    if (issue.stage !== 3 && issue.stage !== 6) return;

    this.sound.playRejectTone();

    // Bot Shrug and Walk-off Animation
    this.dom.actorBot.className = 'actor actor-bot shrug';
    this.dom.botFace.className = 'face-expression face-sad';

    // Dialogue Update
    this.dom.bubbleText.textContent = `"Aw shucks! Understood, human. Releasing claim back to triage queue..."`;

    // Log Event
    this.logEvent({
      event: 'claim.rejected',
      tagClass: 'tag-reject',
      message: `Human declined claim for ${issue.number} by ${issue.botHandle}`,
      meta: 'Claim relinquished without penalty. Reassigned to open pool.'
    });

    issue.status = 'Deferred';
    issue.botState = 'idle';

    setTimeout(() => {
      this.dom.actorBot.classList.add('walk-off');
    }, 700);

    setTimeout(() => {
      this.updateActionButtons(issue);
      this.renderIssuesList();
      this.updateCounters();
    }, 1200);
  }

  // ==========================================================================
  // Agent Pipeline Automation Simulation
  // ==========================================================================
  simulateAgentWorkFlow(issue) {
    // Deliver: PR linked
    setTimeout(() => {
      if (issue.stage === 4) {
        this.logEvent({
          event: 'issue.pr_linked',
          tagClass: 'tag-pr',
          message: `${issue.botHandle} linked PR ${issue.prNumber} from branch ${issue.branch}`,
          meta: `Commits: 3 files changed (+84, -12)`
        });

        // Advance to Prove
        issue.stage = 5;
        this.selectIssue(issue.id);

        // Prove: Test verdict
        setTimeout(() => {
          if (issue.stage === 5) {
            this.logEvent({
              event: 'issue.test_verdict',
              tagClass: 'tag-test',
              message: `Automated test suite completed for PR ${issue.prNumber}: VERDICT PASS`,
              meta: `18 passed, 0 failed, 100% coverage (duration: 3.4s)`
            });

            // Advance to Merge (Human Gate 2)
            issue.stage = 6;
            issue.status = 'Waiting on you';
            issue.botState = 'waving';
            this.selectIssue(issue.id);
            this.updateCounters();
          }
        }, 3200);
      }
    }, 2800);
  }

  // Fast-forward next step button
  fastForwardStep() {
    const issue = this.getActiveIssue();
    this.sound.playClick();

    if (issue.stage === 1) {
      issue.stage = 2;
      this.logEvent({
        event: 'issue.confirmed',
        tagClass: 'tag-confirm',
        message: `Issue ${issue.number} confirmed by triage heuristics`,
        meta: 'Confidence: 99.4%'
      });
    } else if (issue.stage === 2) {
      issue.stage = 3;
      issue.status = 'Waiting on you';
      issue.botState = 'waving';
      this.logEvent({
        event: 'claim.created',
        tagClass: 'tag-claim',
        message: `${issue.botHandle} filed claim for ${issue.number}`,
        meta: 'Awaiting human authorization gate'
      });
    } else if (issue.stage === 3) {
      this.completeHandshake();
      return;
    } else if (issue.stage === 4) {
      issue.stage = 5;
      this.logEvent({
        event: 'issue.pr_linked',
        tagClass: 'tag-pr',
        message: `PR ${issue.prNumber} linked by ${issue.botHandle}`,
        meta: 'Passing CI'
      });
    } else if (issue.stage === 5) {
      issue.stage = 6;
      issue.status = 'Waiting on you';
      issue.botState = 'waving';
      this.logEvent({
        event: 'issue.test_verdict',
        tagClass: 'tag-test',
        message: `Test verdict PASS for ${issue.number}`,
        meta: 'Ready for merge approval'
      });
    } else if (issue.stage === 6) {
      this.completeHandshake();
      return;
    }

    this.selectIssue(issue.id);
  }

  // ==========================================================================
  // Terminal Event Stream Logger
  // ==========================================================================
  seedInitialLogs() {
    const seeds = [
      {
        event: 'issue.created',
        tagClass: 'tag-report',
        message: 'Bug #412 reported via Github issue webhook',
        meta: 'Severity: High • Tags: [ui, mobile, css-grid]'
      },
      {
        event: 'issue.confirmed',
        tagClass: 'tag-confirm',
        message: 'Reproduced in headless Chromium 360x740 viewport',
        meta: 'Agent: @triage-bot-01'
      },
      {
        event: 'claim.created',
        tagClass: 'tag-claim',
        message: 'agent-byte-42 requested claim authorization on #412',
        meta: 'Gate 1 Human approval pending'
      }
    ];

    seeds.forEach(seed => this.logEvent(seed, false));
  }

  logEvent({ event, tagClass, message, meta }, autoScroll = true) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const entryData = {
      timestamp: now.toISOString(),
      timeFormatted: timeStr,
      event,
      message,
      meta
    };

    this.eventLogs.push(entryData);

    const row = document.createElement('div');
    row.className = 'terminal-entry';
    row.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-event-tag ${tagClass}">${event}</span>
      <span class="log-msg">${this.escapeHtml(message)}</span>
      ${meta ? `<span class="log-meta">(${this.escapeHtml(meta)})</span>` : ''}
    `;

    this.dom.terminalBody.appendChild(row);

    if (autoScroll) {
      this.dom.terminalBody.scrollTop = this.dom.terminalBody.scrollHeight;
    }
  }

  clearLogs() {
    this.dom.terminalBody.innerHTML = '';
    this.eventLogs = [];
    this.sound.playClick();
  }

  copyLogsAsJson() {
    this.sound.playClick();
    const jsonStr = JSON.stringify(this.eventLogs, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      const origText = this.dom.copyLogBtn.textContent;
      this.dom.copyLogBtn.textContent = 'Copied! ✓';
      setTimeout(() => {
        this.dom.copyLogBtn.textContent = origText;
      }, 1500);
    }).catch(err => {
      console.warn('Clipboard write failed', err);
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  resetDemo() {
    this.sound.playClick();
    this.issues = JSON.parse(JSON.stringify(INITIAL_ISSUES));
    this.completedCount = 14;
    this.clearLogs();
    this.seedInitialLogs();
    this.renderIssuesList();
    this.selectIssue(412);
    this.updateCounters();
  }

  // ==========================================================================
  // Event Listeners & Keyboard Shortcuts
  // ==========================================================================
  bindEvents() {
    const btn = this.dom.holdActionBtn;

    // Mouse Events for Hold
    btn.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.startHold();
    });

    window.addEventListener('mouseup', () => {
      if (this.isHolding) this.cancelHold();
    });

    btn.addEventListener('mouseleave', () => {
      if (this.isHolding) this.cancelHold();
    });

    // Touch Events for Hold (Mobile / Tablet)
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startHold();
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (this.isHolding) this.cancelHold();
    });

    window.addEventListener('touchcancel', () => {
      if (this.isHolding) this.cancelHold();
    });

    // Secondary Reject Button
    this.dom.rejectActionBtn.addEventListener('click', () => {
      this.rejectClaim();
    });

    // Keyboard Shortcuts
    let spaceDown = false;
    window.addEventListener('keydown', (e) => {
      // Ignore when typing in input/textarea (none in app, but good practice)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.code === 'Space' || e.key === 'Enter') && !spaceDown) {
        spaceDown = true;
        e.preventDefault();
        this.startHold();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.rejectClaim();
      } else if (e.key === '1') {
        this.selectIssue(412);
        this.sound.playClick();
      } else if (e.key === '2') {
        this.selectIssue(398);
        this.sound.playClick();
      } else if (e.key === '3') {
        this.selectIssue(415);
        this.sound.playClick();
      } else if (e.key === '4') {
        this.selectIssue(419);
        this.sound.playClick();
      } else if (e.key.toLowerCase() === 'm') {
        this.toggleSound();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        spaceDown = false;
        e.preventDefault();
        if (this.isHolding) {
          this.cancelHold();
        }
      }
    });

    // Sound toggle button
    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.toggleSound();
    });

    // Terminal controls
    this.dom.clearLogBtn.addEventListener('click', () => this.clearLogs());
    this.dom.copyLogBtn.addEventListener('click', () => this.copyLogsAsJson());
    this.dom.simulateNextEventBtn.addEventListener('click', () => this.fastForwardStep());

    // Reset button
    this.dom.resetDemoBtn.addEventListener('click', () => this.resetDemo());

    // Interactive Stepper click: clicking a stage allows inspecting its event
    const nodes = this.dom.trackStepper.querySelectorAll('.step-node');
    nodes.forEach(node => {
      node.addEventListener('click', () => {
        const stageNum = parseInt(node.getAttribute('data-stage'), 10);
        this.sound.playClick();
        this.logEvent({
          event: STAGE_EVENTS[stageNum - 1],
          tagClass: stageNum === 3 || stageNum === 6 ? 'tag-claim' : 'tag-confirm',
          message: `Inspected Stage ${stageNum}: ${STAGE_NAMES[stageNum - 1]} (${STAGE_EVENTS[stageNum - 1]})`,
          meta: `Stage description viewed`
        });
      });
    });
  }

  toggleSound() {
    const isMuted = this.sound.toggleMute();
    this.dom.soundIconOn.style.display = isMuted ? 'none' : 'block';
    this.dom.soundIconOff.style.display = isMuted ? 'block' : 'none';
    if (!isMuted) this.sound.playClick();
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AgentHandshakeApp();
});

