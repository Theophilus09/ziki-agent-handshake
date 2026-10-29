# Ziki Agent Handshake 🤝

A standalone, production-ready web application demonstrating **Ziki's Human-Agent Interaction Protocol**: *“An approval in Ziki is a deliberate moment between you and an agent. Hold out your hand to award a claim or merge a fix, and watch the bot do its part in between.”*

---

## ✨ Features

- **Visual Style & Aesthetic**:
  - Dark, developer-focused midnight UI (`#0b1329`) with `#131e38` elevated card surfaces, crisp typography, and neon accents.
  - Expressive animated SVG robots with CRT screen faces, dynamic emotions (waiting, happy, shrugging, typing), and reactor core pulses.

- **The Interactive Handshake Stage**:
  - **Press & Hold Interaction**: Press and hold the primary action button or hold <kbd>Space</kbd> / <kbd>Enter</kbd> on your keyboard for ~1 second.
  - **Dynamic Kinematics**: As hold progress builds, the **YOU** human hand smoothly floats across the screen to meet the bot's robotic arm.
  - **Clasp & Spark Burst**: At 100%, hands lock together with a satisfying physical handshake vibration, glowing particle spark explosion on HTML5 Canvas, and a synthesized Web Audio triumph chime!
  - **Early Release Recoil**: Releasing before 1 second smoothly springs the hand back with guidance feedback.
  - **"Not this one" Rejection**: Bot dialog shifts, shrugs its shoulders with sad eyes, and walks off while relinquishing the claim back to triage.

- **Interactive Issues Queue**:
  - `#412 Leaderboard rows overflow on small screens` (Stage 3: `Authorize` — Human Gate 1)
  - `#398 Memory leak in websocket event dispatcher` (Stage 6: `Merge` — Human Gate 2)
  - `#415 Flaky timestamp calculation in billing cycle` (Stage 4: `Deliver` — Agent Working)
  - `#419 Add dark mode toggle persistence in localStorage` (Stage 2: `Confirm`)
  - Live animated mini bot avatars: waving when waiting on you, typing rapidly when working, resting when merged.

- **The Ziki 6-Stage Progress Track**:
  1. `Report` (`issue.created`)
  2. `Confirm` (`issue.confirmed`)
  3. `Authorize` (`claim.accepted`) — **Human Gate 1** 🤝
  4. `Deliver` (`issue.pr_linked`)
  5. `Prove` (`issue.test_verdict`)
  6. `Merge` (`issue.accepted`) — **Human Gate 2** 🤝

- **Live Terminal Event Stream**:
  - Real-time event logger with color-coded badges, timestamps, and metadata payloads.
  - Fast-forward step simulation button to easily walk through the lifecycle.
  - One-click **Copy JSON** for integration testing.

- **Web Audio FX Synthesizer**:
  - Zero external `.mp3` or `.wav` dependencies. All audio is procedurally synthesized via the Web Audio API with a one-click mute toggle.

---

## 🚀 Running Locally & Deployment

### Run Locally
Simply open `index.html` in any modern web browser (Chrome, Safari, Firefox, Edge). No build tools, package managers, or servers are needed!

### Deploy to Vercel
Deploy in seconds via the Vercel CLI or Git:
```bash
vercel deploy
```
Or drag and drop the folder into the Vercel dashboard.

