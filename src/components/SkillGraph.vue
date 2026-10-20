<script setup>
// Constellation of skills (outer ring) wired to the projects that use them (inner ring).
// Hover or focus any node to trace its connections.
import { computed, inject, ref } from 'vue'
import { projects, skills } from '../data/portfolio.js'

const openProject = inject('openProject')
const norm = (s) => s.toLowerCase().replace(/\s*\d+(\.\d+)?$/, '').trim()
const C = 400
const cats = Object.keys(skills)

// Outer ring: skills grouped by category, with a gap between groups
const flat = cats.flatMap((cat) => skills[cat].map((name) => ({ name, cat })))
const gapSlots = 1.4
const slots = flat.length + cats.length * gapSlots
let cursor = 0
let lastCat = null
const skillNodes = flat.map((s) => {
  if (s.cat !== lastCat) { cursor += gapSlots; lastCat = s.cat }
  const a = (cursor++ / slots) * Math.PI * 2 - Math.PI / 2
  return { ...s, key: 's:' + s.name, a, x: C + Math.cos(a) * 300, y: C + Math.sin(a) * 300 }
})

// Inner ring: projects
const wired = projects.filter((p) => p.stack.length)
const projNodes = wired.map((p, i) => {
  const a = (i / wired.length) * Math.PI * 2 - Math.PI / 2 + 0.3
  return { ...p, key: 'p:' + p.id, x: C + Math.cos(a) * 130, y: C + Math.sin(a) * 130 }
})

const edges = []
projNodes.forEach((p) => {
  const set = new Set(p.stack.map(norm))
  skillNodes.forEach((s) => { if (set.has(norm(s.name))) edges.push({ p, s, key: p.key + s.key }) })
})
const usage = Object.fromEntries(skillNodes.map((s) => [s.key, edges.filter((e) => e.s === s).length]))

const focus = ref(null)
const cat = ref(null)
const linked = computed(() => {
  if (!focus.value) return null
  const set = new Set([focus.value])
  edges.forEach((e) => {
    if (e.p.key === focus.value) set.add(e.s.key)
    if (e.s.key === focus.value) set.add(e.p.key)
  })
  return set
})
const isOn = (key, c) => {
  if (linked.value) return linked.value.has(key)
  if (cat.value && c) return c === cat.value
  return !cat.value
}
const edgeOn = (e) => (focus.value ? e.p.key === focus.value || e.s.key === focus.value : cat.value ? e.s.cat === cat.value : false)
const curve = (e) => `M${e.p.x},${e.p.y} Q${C + (e.p.x + e.s.x - 2 * C) * 0.25},${C + (e.p.y + e.s.y - 2 * C) * 0.25} ${e.s.x},${e.s.y}`

const info = computed(() => {
  if (!focus.value) return null
  if (focus.value.startsWith('p:')) {
    const p = projNodes.find((n) => n.key === focus.value)
    return { title: p.name, text: `${edges.filter((e) => e.p === p).length} linked technologies · click to open` }
  }
  const s = skillNodes.find((n) => n.key === focus.value)
  const n = usage[s.key]
  return { title: s.name, text: n ? `Used in ${n} featured project${n > 1 ? 's' : ''}` : `${s.cat} toolkit` }
})
</script>

<template>
  <section id="stack" class="sec wrap">
    <div class="sec-head" v-reveal>
      <div class="sec-index"><b>05</b> / Stack</div>
      <div>
        <h2 class="sec-title">The <em>constellation.</em></h2>
        <p class="sec-sub">Every skill, wired to the projects where I used it. Hover a node to trace it.</p>
      </div>
    </div>

    <div class="legend" role="group" aria-label="Highlight a skill category" v-reveal>
      <button
        v-for="c in cats"
        :key="c"
        type="button"
        class="mono"
        :aria-pressed="cat === c"
        @click="cat = cat === c ? null : c"
      >{{ c }} <span>{{ skills[c].length }}</span></button>
    </div>

    <div class="stage hud" v-reveal>
      <svg viewBox="0 0 800 800" role="group" aria-label="Skills and project connections" @pointerleave="focus = null">
        <circle :cx="C" :cy="C" r="300" class="orbit" />
        <circle :cx="C" :cy="C" r="130" class="orbit" />
        <circle :cx="C" :cy="C" r="215" class="orbit faint" />

        <path v-for="e in edges" :key="e.key" :d="curve(e)" class="edge" :class="{ on: edgeOn(e) }" />

        <g
          v-for="s in skillNodes"
          :key="s.key"
          class="node skill"
          :class="{ off: !isOn(s.key, s.cat), ai: s.cat === 'AI' }"
          tabindex="0"
          @pointerenter="focus = s.key"
          @focus="focus = s.key"
          @blur="focus = null"
        >
          <circle :cx="s.x" :cy="s.y" :r="4 + usage[s.key] * 1.6" />
          <text
            :x="s.x + Math.cos(s.a) * (14 + usage[s.key] * 1.6)"
            :y="s.y + Math.sin(s.a) * (14 + usage[s.key] * 1.6)"
            :text-anchor="Math.cos(s.a) > 0.15 ? 'start' : Math.cos(s.a) < -0.15 ? 'end' : 'middle'"
            dominant-baseline="middle"
          >{{ s.name }}</text>
        </g>

        <g
          v-for="p in projNodes"
          :key="p.key"
          class="node proj"
          :class="{ off: !isOn(p.key) && (focus || cat) }"
          :style="{ '--c': `hsl(${p.hue} 95% 62%)` }"
          tabindex="0"
          role="button"
          :aria-label="'Open ' + p.name"
          @pointerenter="focus = p.key"
          @focus="focus = p.key"
          @blur="focus = null"
          @click="openProject(p.id)"
          @keydown.enter="openProject(p.id)"
        >
          <rect :x="p.x - 26" :y="p.y - 26" width="52" height="52" :transform="`rotate(45 ${p.x} ${p.y})`" />
          <text :x="p.x" :y="p.y" text-anchor="middle" dominant-baseline="central">{{ p.code }}</text>
        </g>

        <g class="core">
          <text :x="C" :y="C - 8" text-anchor="middle">{{ info ? info.title : 'JT' }}</text>
          <text :x="C" :y="C + 16" text-anchor="middle" class="sub">{{ info ? info.text : 'hover a node' }}</text>
        </g>
      </svg>
    </div>

    <div class="list">
      <div v-for="c in cats" :key="c" class="list-cat">
        <h3 class="mono">{{ c }}</h3>
        <div class="chips"><span v-for="s in skills[c]" :key="s" class="tag">{{ s }}</span></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.legend button { padding: 8px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; background: transparent; border: 1px solid var(--line-2); color: var(--muted); cursor: pointer; transition: all .2s; }
.legend button span { color: var(--dim); margin-left: 4px; }
.legend button:hover { color: var(--text); }
.legend button[aria-pressed='true'] { background: var(--lime); color: #06070a; border-color: var(--lime); }
.legend button[aria-pressed='true'] span { color: #06070a; }

.stage { padding: 10px; }
svg { display: block; width: 100%; max-width: 820px; margin: 0 auto; overflow: visible; }
.orbit { fill: none; stroke: var(--line-2); stroke-dasharray: 2 6; }
.orbit.faint { opacity: .4; }
.edge { fill: none; stroke: rgba(238, 241, 246, 0.07); stroke-width: 1; transition: stroke .3s, stroke-width .3s; }
.edge.on { stroke: var(--lime); stroke-width: 1.4; }

.node { cursor: pointer; outline: none; transition: opacity .3s; }
.node.off { opacity: .15; }
.skill circle { fill: var(--bg); stroke: var(--muted); stroke-width: 1.5; transition: fill .2s, stroke .2s; }
.skill text { font-family: var(--mono); font-size: 12.5px; fill: var(--text); }
.skill.ai circle { stroke: var(--cyan); }
.skill.ai text { fill: var(--cyan); }
.skill:hover circle, .skill:focus-visible circle { fill: var(--lime); stroke: var(--lime); }
.skill:focus-visible text { fill: var(--lime); }
.proj rect { fill: var(--panel-solid); stroke: var(--c); stroke-width: 1.5; transition: fill .25s; }
.proj text { font-family: var(--display); font-weight: 600; font-size: 13px; fill: var(--c); transition: fill .25s; pointer-events: none; }
.proj:hover rect, .proj:focus-visible rect { fill: var(--c); }
.proj:hover text, .proj:focus-visible text { fill: #06070a; }
.core text { font-family: var(--display); font-weight: 600; font-size: 22px; fill: var(--text); pointer-events: none; }
.core .sub { font-family: var(--mono); font-weight: 400; font-size: 11px; fill: var(--dim); }

.list { display: none; }
@media (max-width: 760px) {
  .stage, .legend { display: none; }
  .list { display: grid; gap: 22px; }
  .list h3 { font-size: 11px; font-weight: 500; color: var(--lime); text-transform: uppercase; letter-spacing: .1em; margin: 0 0 10px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
}
</style>
