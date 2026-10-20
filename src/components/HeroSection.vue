<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { profile, stats } from '../data/portfolio.js'

// ---- Magnetic, scrambling name ----
const nameEl = ref(null)
const glyphs = '01<>/{}[]#$%&*+=?'
const lines = [profile.first.toUpperCase(), profile.last.toUpperCase()]
const chars = ref(lines.map((l) => l.split('').map((c) => ({ c, show: c }))))

function scramble(li, ci) {
  const item = chars.value[li][ci]
  if (item.busy) return
  item.busy = true
  let n = 0
  const id = setInterval(() => {
    item.show = n++ > 6 ? item.c : glyphs[(Math.random() * glyphs.length) | 0]
    if (item.show === item.c && n > 6) { clearInterval(id); item.busy = false }
  }, 45)
}

// Idle "typing" pass: scrambles the name letter by letter, in sync with each new role.
const sweepTimers = []
function sweep() {
  sweepTimers.splice(0).forEach(clearTimeout)
  let k = 0
  chars.value.forEach((line, li) => line.forEach((_, ci) => {
    sweepTimers.push(setTimeout(() => scramble(li, ci), 400 + k++ * 70))
  }))
}

let raf
const pointer = { x: -9999, y: -9999 }
function onMove(e) { pointer.x = e.clientX; pointer.y = e.clientY }
function magnet() {
  nameEl.value?.querySelectorAll('.ch').forEach((s) => {
    const r = s.getBoundingClientRect()
    const dx = r.left + r.width / 2 - pointer.x
    const dy = r.top + r.height / 2 - pointer.y
    const d = Math.hypot(dx, dy)
    const f = Math.max(0, 1 - d / 160)
    s.style.transform = f ? `translate(${(dx / d) * f * 16}px, ${(dy / d) * f * 16}px)` : ''
    s.classList.toggle('lit', f > 0.35)
  })
  raf = requestAnimationFrame(magnet)
}

// ---- Typed roles ----
const typed = ref('')
let ri = 0, ci = 0, del = false, typeTimer
function type() {
  const word = profile.roles[ri]
  typed.value = word.slice(0, ci)
  if (!del && ci === word.length) { del = true; typeTimer = setTimeout(type, 1800); return }
  if (del && ci === 0) { del = false; ri = (ri + 1) % profile.roles.length; sweep() }
  ci += del ? -1 : 1
  typeTimer = setTimeout(type, del ? 28 : 60)
}

// ---- Counters ----
const counts = ref(stats.map(() => 0))
const statsEl = ref(null)
let statsIo
function runCounters() {
  const t0 = performance.now()
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1600)
    const e = 1 - Math.pow(1 - k, 3)
    counts.value = stats.map((s) => Math.round(s.value * e))
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(magnet)
  }
  type()
  sweepTimers.push(setTimeout(sweep, 900))
  statsIo = new IntersectionObserver(([e]) => { if (e.isIntersecting) { runCounters(); statsIo.disconnect() } })
  statsIo.observe(statsEl.value)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(typeTimer)
  sweepTimers.forEach(clearTimeout)
  statsIo?.disconnect()
  removeEventListener('pointermove', onMove)
})
</script>

<template>
  <section id="top" class="hero wrap">
    <div class="meta mono">
      <span><span class="dot"></span>Available for work</span>
      <span>{{ profile.coords }}</span>
      <span>{{ profile.location }}</span>
    </div>

    <div class="grid">
      <div class="left">
        <h1 ref="nameEl" class="name" :aria-label="profile.name">
          <span v-for="(line, li) in chars" :key="li" class="line" aria-hidden="true">
            <span
              v-for="(ch, ci) in line"
              :key="ci"
              class="ch"
              :class="{ busy: ch.busy }"
              :style="{ animationDelay: (li * 6 + ci) * 45 + 'ms' }"
              @mouseenter="scramble(li, ci)"
            >{{ ch.show }}</span>
          </span>
        </h1>

        <p class="role mono"><span class="lime">//</span> {{ typed }}<span class="caret">▍</span></p>
        <p class="headline">{{ profile.headline }}</p>

        <div class="cta">
          <a href="#work" class="btn solid">View work <span class="arrow">→</span></a>
          <a href="#contact" class="btn">Contact me</a>
        </div>
      </div>
    </div>

    <ul ref="statsEl" class="stats">
      <li v-for="(s, i) in stats" :key="s.label" class="hud">
        <b>{{ counts[i].toLocaleString() }}{{ s.suffix }}</b>
        <span class="mono">{{ s.label }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hero { position: relative; z-index: 2; min-height: 100vh; padding: 120px 0 60px; display: flex; flex-direction: column; justify-content: center; }
.meta { display: flex; flex-wrap: wrap; gap: 10px 28px; font-size: 12px; color: var(--dim); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 26px; }
.meta > span:first-child { color: var(--lime); }
.dot { display: inline-block; width: 7px; height: 7px; margin-right: 8px; background: var(--lime); animation: blink 1.4s steps(1) infinite; }
@keyframes blink { 50% { opacity: .2; } }

.grid { max-width: 980px; }
.name { margin: 0; font-family: var(--display); font-weight: 800; font-size: clamp(56px, 13vw, 176px); line-height: .9; letter-spacing: -0.04em; }
.line { display: block; white-space: nowrap; }
.line:last-child { -webkit-text-stroke: 1.5px var(--text); color: transparent; }
.ch { display: inline-block; transition: transform .25s var(--ease), translate .3s var(--ease), color .2s; animation: drop .9s var(--ease) backwards; min-width: .3em; }
.ch.lit, .ch.busy { color: var(--lime); -webkit-text-stroke-color: var(--lime); }
.ch.busy { translate: 0 -8%; }
@keyframes drop { from { opacity: 0; transform: translateY(40%) skewY(8deg); filter: blur(6px); } }

.role { font-size: clamp(15px, 1.8vw, 19px); margin: 26px 0 10px; color: var(--text); min-height: 1.6em; }
.caret { color: var(--lime); animation: blink 1s steps(1) infinite; }
.headline { font-size: clamp(17px, 1.6vw, 20px); color: var(--muted); max-width: 540px; margin: 0 0 32px; }
.cta { display: flex; flex-wrap: wrap; gap: 12px; }

.stats { list-style: none; margin: 60px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stats li { padding: 18px 18px 16px; }
.stats b { display: block; font-family: var(--display); font-weight: 600; font-size: clamp(24px, 3vw, 36px); line-height: 1.1; font-variant-numeric: tabular-nums; }
.stats span { display: block; margin-top: 6px; font-size: 11.5px; color: var(--dim); text-transform: uppercase; letter-spacing: .06em; }

@media (max-width: 960px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
