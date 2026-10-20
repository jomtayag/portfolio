<script setup>
// AI workflow: principles plus a replayable agent session that types itself out when visible.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { aiPrinciples } from '../data/portfolio.js'

const session = [
  { t: 'you', s: 'Add permission-scoped menus for staff. Follow AGENTS.md.' },
  { t: 'agent', s: 'Reading AGENTS.md, router, and the auth store…' },
  { t: 'agent', s: 'Plan: 1) expose permissions on profile  2) guard routes  3) filter menu' },
  { t: 'you', s: 'Approved. Add tests for the route guard.' },
  { t: 'edit', s: '~ src/router/guards.ts      +42 −3' },
  { t: 'edit', s: '~ src/stores/auth.ts        +18 −2' },
  { t: 'edit', s: '+ tests/guards.spec.ts      +64' },
  { t: 'ok', s: '✓ vue-tsc  0 errors   ✓ vitest  38 passed' },
  { t: 'you', s: 'Reviewed the diff. Rename hasPerm → can. Ship it.' },
  { t: 'ok', s: '✓ committed  feat: scope staff menus and routes by permission' },
]
const shown = ref([])
const typing = ref('')
const box = ref(null)
let timer, io, started = false

function run() {
  clearTimeout(timer)
  shown.value = []
  typing.value = ''
  let i = 0
  const next = () => {
    if (i >= session.length) return
    const line = session[i]
    let k = 0
    const speed = line.t === 'you' ? 22 : 8
    const typeChar = () => {
      typing.value = line.s.slice(0, ++k)
      if (k < line.s.length) timer = setTimeout(typeChar, speed)
      else {
        shown.value.push(line)
        typing.value = ''
        i++
        timer = setTimeout(next, line.t === 'you' ? 500 : 260)
      }
    }
    typing.value = ''
    typeChar()
  }
  next()
}
const current = () => session[shown.value.length]

onMounted(() => {
  io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !started) { started = true; run() }
  }, { threshold: 0.4 })
  io.observe(box.value)
})
onBeforeUnmount(() => { clearTimeout(timer); io?.disconnect() })
</script>

<template>
  <section id="ai" class="sec wrap">
    <div class="sec-head" v-reveal>
      <div class="sec-index"><b>06</b> / AI Workflow</div>
      <div>
        <h2 class="sec-title">Faster with agents.<br /><em>Still engineered.</em></h2>
        <p class="sec-sub">My daily work runs on Claude Code and OpenAI Codex. Here’s how I keep that speed dependable.</p>
      </div>
    </div>

    <div class="grid">
      <ol class="principles">
        <li v-for="(p, i) in aiPrinciples" :key="p.k" v-reveal="i * 90">
          <span class="k mono">{{ p.k }}</span>
          <div>
            <h3>{{ p.title }}</h3>
            <p>{{ p.text }}</p>
          </div>
        </li>
      </ol>

      <div ref="box" class="session hud" v-reveal="120">
        <div class="bar mono">
          <span class="led"></span> agent-session · tutorvio
          <button type="button" class="replay mono" @click="run">↻ Replay</button>
        </div>
        <div class="log mono" aria-label="Example AI-assisted development session">
          <p v-for="(l, i) in shown" :key="i" :class="l.t"><span class="who">{{ l.t === 'you' ? 'you ›' : l.t === 'agent' ? 'ai  ›' : '    ' }}</span>{{ l.s }}</p>
          <p v-if="typing" :class="current()?.t"><span class="who">{{ current()?.t === 'you' ? 'you ›' : current()?.t === 'agent' ? 'ai  ›' : '    ' }}</span>{{ typing }}<span class="cur">▍</span></p>
        </div>
        <p class="note mono">Illustrative replay of my typical workflow.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 40px; align-items: start; }
.principles { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line-2); }
.principles li { display: grid; grid-template-columns: 52px 1fr; gap: 12px; padding: 22px 0; border-bottom: 1px solid var(--line-2); }
.k { font-size: 12px; color: var(--lime); padding-top: 4px; }
h3 { font-family: var(--display); font-weight: 600; font-size: 19px; letter-spacing: -0.01em; margin: 0 0 6px; }
.principles p { margin: 0; color: var(--muted); font-size: 15.5px; }

.session { background: rgba(6, 7, 10, 0.85); }
.bar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--line-2); font-size: 12px; color: var(--dim); }
.led { width: 8px; height: 8px; background: var(--cyan); box-shadow: 0 0 10px var(--cyan); }
.replay { margin-left: auto; background: none; border: 1px solid var(--line-2); color: var(--muted); cursor: pointer; padding: 4px 10px; font-size: 11px; }
.replay:hover { color: var(--lime); border-color: var(--lime); }
.log { padding: 18px 16px; min-height: 380px; font-size: 13px; line-height: 1.8; }
.log p { margin: 0; white-space: pre-wrap; word-break: break-word; }
.who { color: var(--dim); margin-right: 10px; }
.you { color: var(--text); }
.agent { color: var(--cyan); }
.edit { color: var(--muted); }
.ok { color: var(--lime); }
.cur { color: var(--lime); animation: b 1s steps(1) infinite; }
@keyframes b { 50% { opacity: 0; } }
.note { margin: 0; padding: 10px 16px; border-top: 1px solid var(--line-2); font-size: 11px; color: var(--dim); }
@media (max-width: 960px) { .grid { grid-template-columns: 1fr; } .log { min-height: 0; font-size: 12px; } }
</style>
