<script setup>
// "Chronoscope": a Gantt of the career with a scrubbable playhead.
// Drag the playhead (or use arrow keys) to see what was happening at any point in time.
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import { experience, projects } from '../data/portfolio.js'

const openProject = inject('openProject')
const toNum = ([y, m]) => y + (m - 1) / 12
const MIN = 2015
const MAX = 2027
const now = 2026 + 9 / 12

const jobs = experience.map((e) => ({ ...e, s: toNum(e.start), e: toNum(e.end ?? [2026, 12]) }))

// Greedy lane packing so overlapping roles sit on separate rows
const lanes = []
;[...jobs].sort((a, b) => a.s - b.s).forEach((j) => {
  let lane = lanes.findIndex((end) => end <= j.s)
  if (lane === -1) { lane = lanes.length; lanes.push(0) }
  lanes[lane] = j.e
  j.lane = lane
})
const laneCount = lanes.length

const t = ref(now)
const pct = (v) => ((v - MIN) / (MAX - MIN)) * 100
const active = computed(() => jobs.filter((j) => t.value >= j.s && t.value <= j.e).sort((a, b) => b.s - a.s))
const years = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i)
const label = computed(() => {
  const y = Math.floor(t.value)
  const m = Math.min(11, Math.round((t.value - y) * 12))
  return new Date(y, m).toLocaleString('en-US', { month: 'short', year: 'numeric' })
})
const yearsIn = computed(() => Math.max(0, t.value - toNum([2015, 4])).toFixed(1))
const fmt = ([y, m]) => new Date(y, m - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
const projName = (id) => projects.find((p) => p.id === id)?.name

// Autoplay sweep through the whole career
const playing = ref(false)
let raf
function play() {
  if (playing.value) return stop()
  playing.value = true
  if (t.value >= now - 0.05) t.value = 2015.3
  const tick = () => {
    t.value = Math.min(now, t.value + 0.018)
    if (t.value >= now) return stop()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
function stop() { playing.value = false; cancelAnimationFrame(raf) }
function jump(j) { stop(); t.value = Math.min(j.s + 0.05, j.e) }
onBeforeUnmount(stop)
</script>

<template>
  <section id="career" class="sec wrap">
    <div class="sec-head" v-reveal>
      <div class="sec-index"><b>02</b> / Career</div>
      <div>
        <h2 class="sec-title">Eleven years,<br /><em>one timeline.</em></h2>
        <p class="sec-sub">Drag the playhead or press play to move through my career.</p>
      </div>
    </div>

    <div class="scope hud" v-reveal>
      <div class="scope-top mono">
        <button class="play" type="button" :aria-pressed="playing" @click="play">{{ playing ? '❚❚ Pause' : '▶ Play' }}</button>
        <span class="readout"><span class="dim">T =</span> <b>{{ label }}</b></span>
        <span class="readout"><span class="dim">Experience</span> <b>{{ yearsIn }} yrs</b></span>
      </div>

      <div class="chart" :style="{ '--lanes': laneCount }">
        <div class="years mono">
          <span v-for="y in years" :key="y" :style="{ left: pct(y) + '%' }">{{ String(y).slice(2) }}</span>
        </div>
        <div class="tracks">
          <button
            v-for="j in jobs"
            :key="j.id"
            type="button"
            class="bar"
            :class="{ on: active.includes(j) }"
            :style="{ left: pct(j.s) + '%', width: pct(j.e) - pct(j.s) + '%', top: `calc(${j.lane} * 46px)` }"
            :title="j.company"
            @click="jump(j)"
          ><span>{{ j.company }}</span></button>
          <div class="head" :style="{ left: pct(t) + '%' }"><span></span></div>
        </div>
        <input
          :value="t"
          class="range"
          type="range"
          :min="MIN"
          :max="MAX"
          step="0.0833"
          aria-label="Career timeline position"
          :aria-valuetext="label"
          @input="t = Math.min(now, +$event.target.value)"
          @pointerdown="stop"
        />
      </div>

      <TransitionGroup name="job" tag="div" class="now">
        <article v-for="j in active" :key="j.id" class="job">
          <header>
            <div>
              <h3>{{ j.company }}</h3>
              <p class="role">{{ j.role }}</p>
            </div>
            <span class="mono period">{{ fmt(j.start) }} — {{ fmt(j.end) }}</span>
          </header>
          <ul>
            <li v-for="p in j.points" :key="p">{{ p }}</li>
          </ul>
          <div v-if="j.projects" class="projs">
            <span class="mono dim">Projects</span>
            <button v-for="id in j.projects" :key="id" type="button" class="proj-link" @click="openProject(id)">{{ projName(id) }} ↗</button>
          </div>
          <div class="tags"><span v-for="s in j.stack" :key="s" class="tag">{{ s }}</span></div>
        </article>
        <p v-if="!active.length" key="gap" class="gap mono">No role on record for this month.</p>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.scope { padding: 22px; }
.scope-top { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px; font-size: 13px; margin-bottom: 26px; }
.play { padding: 8px 14px; background: var(--lime); color: #06070a; border: 0; cursor: pointer; font: inherit; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
.readout b { color: var(--text); font-weight: 500; font-variant-numeric: tabular-nums; }
.dim { color: var(--dim); }

.chart { position: relative; padding-top: 26px; }
.years { position: absolute; top: 0; left: 0; right: 0; height: 20px; font-size: 11px; color: var(--dim); }
.years span { position: absolute; transform: translateX(-50%); }
.years span::after { content: ''; position: absolute; left: 50%; top: 20px; width: 1px; height: calc(var(--lanes) * 46px + 6px); background: var(--line-2); opacity: .5; }
.tracks { position: relative; height: calc(var(--lanes) * 46px); }
.bar {
  position: absolute; height: 36px; padding: 0 10px; text-align: left;
  border: 1px solid var(--line-2); background: rgba(255,255,255,0.03); cursor: pointer; overflow: hidden;
  font-size: 12.5px; font-weight: 600; color: var(--muted); z-index: 2;
  transition: background .25s, color .25s, border-color .25s;
}
.bar span { white-space: nowrap; }
.bar:hover { border-color: var(--lime); color: var(--text); }
.bar.on { background: var(--lime); color: #06070a; border-color: var(--lime); }
.head { position: absolute; top: -30px; bottom: -8px; width: 0; z-index: 3; pointer-events: none; }
.head::before { content: ''; position: absolute; top: 0; bottom: 0; left: -1px; width: 2px; background: var(--signal); box-shadow: 0 0 12px var(--signal); }
.head span { position: absolute; top: -2px; left: -7px; width: 14px; height: 14px; background: var(--signal); clip-path: polygon(0 0, 100% 0, 50% 100%); }
.range { position: absolute; inset: 0; width: 100%; margin: 0; opacity: 0; cursor: ew-resize; z-index: 1; }
.range:focus-visible ~ * { outline: none; }
.chart:has(.range:focus-visible) { outline: 2px solid var(--lime); outline-offset: 6px; }

.now { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 34px; min-height: 180px; position: relative; }
.job { padding: 22px; border: 1px solid var(--line-2); background: rgba(6, 7, 10, 0.6); }
.job header { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.job h3 { font-family: var(--display); font-weight: 600; font-size: 22px; margin: 0; letter-spacing: -0.02em; }
.role { margin: 2px 0 0; color: var(--lime); font-size: 14.5px; }
.period { font-size: 12px; color: var(--dim); }
.job ul { margin: 0 0 16px; padding-left: 18px; }
.job li { margin-bottom: 6px; color: var(--muted); font-size: 15px; }
.job li::marker { color: var(--lime); content: '▹  '; }
.projs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 14px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
.proj-link { padding: 5px 10px; font-size: 13.5px; font-weight: 600; background: none; border: 1px solid var(--lime); color: var(--lime); cursor: pointer; transition: background .2s, color .2s; }
.proj-link:hover { background: var(--lime); color: #06070a; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.gap { color: var(--dim); font-size: 13px; }
.job-enter-active, .job-leave-active { transition: all .4s var(--ease); }
.job-enter-from { opacity: 0; transform: translateY(12px); }
.job-leave-to { opacity: 0; }
.job-leave-active { position: absolute; }

@media (max-width: 760px) {
  .scope { padding: 16px; }
  .bar { font-size: 0; padding: 0; }
  .bar.on { font-size: 0; }
  .now { grid-template-columns: 1fr; }
}
</style>
