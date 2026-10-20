<script setup>
// Index-style project list. Hovering a row summons a floating preview that follows the pointer.
import { computed, inject, ref } from 'vue'
import { projects } from '../data/portfolio.js'
import ProjectGlyph from './ProjectGlyph.vue'

const openProject = inject('openProject')
const filters = ['All', 'Vue 3', 'TypeScript', 'Laravel', 'Real-time']
const filter = ref('All')
const matches = (p) => {
  if (filter.value === 'All') return true
  if (filter.value === 'Real-time') return p.stack.includes('WebSockets')
  if (filter.value === 'Laravel') return p.stack.some((s) => s.startsWith('Laravel'))
  return p.stack.includes(filter.value)
}
const list = computed(() => projects.map((p) => ({ ...p, show: matches(p) })))

const hover = ref(null)
const pos = ref({ x: 0, y: 0 })
function onMove(e) { pos.value = { x: e.clientX, y: e.clientY } }
</script>

<template>
  <section id="work" class="sec wrap">
    <div class="sec-head" v-reveal>
      <div class="sec-index"><b>03</b> / Work</div>
      <div>
        <h2 class="sec-title">Selected <em>work.</em></h2>
        <p class="sec-sub">Platforms I’ve built and shipped. Open any project for details.</p>
      </div>
    </div>

    <div class="filters" role="group" aria-label="Filter projects" v-reveal>
      <button
        v-for="f in filters"
        :key="f"
        type="button"
        class="mono"
        :aria-pressed="filter === f"
        @click="filter = f"
      >{{ f }}</button>
    </div>

    <ol class="index" @pointermove="onMove" @pointerleave="hover = null">
      <li
        v-for="(p, i) in list"
        :key="p.id"
        v-reveal="i * 60"
        :class="{ dim: !p.show }"
        :style="{ '--h': p.hue }"
      >
        <button type="button" class="row" :disabled="!p.show" @click="openProject(p.id)" @pointerenter="hover = p" @focus="hover = null">
          <span class="num mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="main">
            <span class="title">{{ p.name }}</span>
            <span class="tagline">{{ p.tagline }}</span>
          </span>
          <span class="side mono">
            <span>{{ p.role }}</span>
            <span class="year">{{ p.org }} · {{ p.year }}</span>
          </span>
          <span class="go" aria-hidden="true">↗</span>
          <span class="mobile-glyph"><ProjectGlyph :id="p.id" :hue="p.hue" /></span>
        </button>
      </li>
    </ol>

    <Teleport to="body">
      <Transition name="peek">
        <div v-if="hover && hover.show" class="peek hud" :style="{ transform: `translate(${pos.x + 24}px, ${pos.y - 90}px)` }" aria-hidden="true">
          <ProjectGlyph :id="hover.id" :hue="hover.hue" animated />
          <div v-if="hover.metric" class="peek-meta">
            <b>{{ hover.metric[0] }}</b>
            <span class="mono">{{ hover.metric[1] }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
.filters button { padding: 8px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; background: transparent; border: 1px solid var(--line-2); color: var(--muted); cursor: pointer; transition: all .2s; }
.filters button:hover { color: var(--text); border-color: var(--text); }
.filters button[aria-pressed='true'] { background: var(--lime); color: #06070a; border-color: var(--lime); }

.index { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line-2); }
.index li { border-bottom: 1px solid var(--line-2); transition: opacity .4s; }
.index li.dim { opacity: .18; }
.row {
  --c: hsl(var(--h) 95% 62%);
  position: relative; width: 100%; display: grid; grid-template-columns: 60px 1fr auto 40px; gap: 20px; align-items: center;
  padding: 30px 8px; background: none; border: 0; text-align: left; cursor: pointer; overflow: hidden;
}
.row::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, color-mix(in srgb, var(--c) 14%, transparent), transparent 70%); transform: scaleX(0); transform-origin: left; transition: transform .5s var(--ease); }
.row:hover::before, .row:focus-visible::before { transform: scaleX(1); }
.row > * { position: relative; }
.num { font-size: 12px; color: var(--dim); }
.title { display: block; font-family: var(--display); font-weight: 600; font-size: clamp(26px, 4vw, 50px); line-height: 1.05; letter-spacing: -0.03em; transition: color .3s, transform .4s var(--ease); }
.row:hover .title { color: var(--c); transform: translateX(10px); }
.tagline { display: block; margin-top: 6px; color: var(--muted); font-size: 15.5px; }
.side { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 12px; color: var(--text); text-align: right; }
.year { color: var(--dim); }
.go { font-size: 24px; color: var(--dim); transition: transform .4s var(--ease), color .3s; }
.row:hover .go { color: var(--c); transform: rotate(45deg); }
.row:disabled { cursor: default; }
.mobile-glyph { display: none; }

.peek { position: fixed; left: 0; top: 0; z-index: 80; width: 280px; pointer-events: none; padding: 0; overflow: hidden; transition: transform .12s linear; }
.peek-meta { display: flex; align-items: baseline; gap: 10px; padding: 12px 14px; border-top: 1px solid var(--line-2); background: var(--panel-solid); }
.peek-meta b { font-family: var(--display); font-size: 22px; }
.peek-meta span { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.peek-enter-active, .peek-leave-active { transition: opacity .25s, clip-path .35s var(--ease); }
.peek-enter-from, .peek-leave-to { opacity: 0; clip-path: inset(0 0 100% 0); }

@media (max-width: 860px) {
  .row { grid-template-columns: 36px 1fr 28px; padding: 24px 4px; }
  .side { grid-column: 2; align-items: flex-start; text-align: left; }
  .go { grid-row: 1; grid-column: 3; }
  .mobile-glyph { display: block; grid-column: 2; max-width: 320px; border: 1px solid var(--line-2); }
  .peek { display: none; }
}
@media (hover: none) { .peek { display: none; } }
</style>
