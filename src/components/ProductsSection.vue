<script setup>
// Own products: a grid of "modules" with live status. Pointer position drives a glow on each card.
import { inject } from 'vue'
import { products } from '../data/portfolio.js'
import ProjectGlyph from './ProjectGlyph.vue'

const openProject = inject('openProject')
function glow(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}
</script>

<template>
  <section id="lab" class="sec wrap">
    <div class="sec-head" v-reveal>
      <div class="sec-index"><b>04</b> / Lab</div>
      <div>
        <h2 class="sec-title">Things I’m <em>building.</em></h2>
        <p class="sec-sub">My own products, designed and built solo with an AI-first workflow.</p>
      </div>
    </div>

    <div class="grid">
      <button
        v-for="(p, i) in products"
        :key="p.id"
        v-reveal="(i % 3) * 90"
        type="button"
        class="mod hud"
        :style="{ '--c': `hsl(${p.hue} 95% 62%)` }"
        @pointermove="glow"
        @click="openProject(p.id)"
      >
        <span class="art"><ProjectGlyph :id="p.id" :hue="p.hue" /></span>
        <span class="body">
          <span class="top mono">
            <span class="status"><i></i>{{ p.status }}</span>
            <span class="code">{{ p.code }}</span>
          </span>
          <span class="name">{{ p.name }}</span>
          <span class="tag-line">{{ p.tagline }}</span>
          <span class="tags"><span v-for="s in p.stack.slice(0, 4)" :key="s" class="tag">{{ s }}</span></span>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.mod {
  display: flex; flex-direction: column; padding: 0; text-align: left; cursor: pointer; overflow: hidden;
  transition: border-color .3s, transform .4s var(--ease);
}
.mod::before, .mod::after { border-color: var(--c); }
.mod:hover { border-color: color-mix(in srgb, var(--c) 50%, transparent); transform: translateY(-4px); }
.mod .body::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .3s;
  background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--c) 14%, transparent), transparent 60%);
}
.mod:hover .body::before { opacity: 1; }
.art { display: block; height: 130px; overflow: hidden; border-bottom: 1px solid var(--line-2); filter: saturate(.6) brightness(.8); transition: filter .4s; }
.art :deep(svg) { height: 100%; }
.mod:hover .art { filter: none; }
.body { position: static; display: flex; flex-direction: column; gap: 8px; padding: 18px 20px 20px; flex: 1; }
.top { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
.status { display: inline-flex; align-items: center; gap: 7px; color: var(--c); }
.status i { width: 6px; height: 6px; background: var(--c); box-shadow: 0 0 8px var(--c); animation: blink 1.6s steps(1) infinite; }
@keyframes blink { 50% { opacity: .25; } }
.code { color: var(--dim); }
.name { font-family: var(--display); font-weight: 600; font-size: 24px; letter-spacing: -0.02em; line-height: 1.15; transition: color .3s; }
.mod:hover .name { color: var(--c); }
.tag-line { color: var(--muted); font-size: 15px; line-height: 1.5; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; padding-top: 8px; }
@media (max-width: 1000px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .grid { grid-template-columns: 1fr; } }
</style>
