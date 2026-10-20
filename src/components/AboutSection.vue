<script setup>
import { profile } from '../data/portfolio.js'
</script>

<template>
  <section id="about" class="sec wrap">
    <div class="sec-head" v-reveal>
      <div class="sec-index"><b>01</b> / About</div>
      <h2 class="sec-title">Engineer first.<br />Now with <em>AI</em> in the loop.</h2>
    </div>

    <div class="grid">
      <div class="copy">
        <p v-for="(p, i) in profile.about" :key="i" v-reveal="i * 120">{{ p }}</p>
      </div>
      <dl class="card hud" v-reveal="200">
        <div><dt class="mono">Focus</dt><dd>Vue 3 · Laravel · TypeScript</dd></div>
        <div><dt class="mono">Workflow</dt><dd>Claude Code · OpenAI Codex</dd></div>
        <div><dt class="mono">Base</dt><dd>{{ profile.location }} · Remote-ready</dd></div>
        <div><dt class="mono">Education</dt><dd>{{ profile.education }}</dd></div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 50px; align-items: start; padding-left: 204px; }
.copy p { font-size: clamp(18px, 1.8vw, 22px); line-height: 1.55; color: var(--muted); margin: 0 0 22px; }
.copy p:first-child { color: var(--text); }
.card { margin: 0; padding: 6px 22px; }
.card div { padding: 16px 0; border-bottom: 1px dashed var(--line-2); }
.card div:last-child { border: 0; }
dt { font-size: 11px; color: var(--lime); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4px; }
dd { margin: 0; font-size: 15.5px; }
@media (max-width: 960px) { .grid { grid-template-columns: 1fr; padding-left: 0; } }
</style>
