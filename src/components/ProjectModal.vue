<script setup>
import { nextTick, ref, watch } from 'vue'
import ProjectGlyph from './ProjectGlyph.vue'

const props = defineProps({ project: Object })
const emit = defineEmits(['close'])
const dlg = ref(null)

watch(() => props.project, async (p) => {
  await nextTick()
  if (p && !dlg.value.open) { dlg.value.showModal(); document.body.classList.add('has-dialog') }
  if (!p && dlg.value.open) dlg.value.close()
})
function onClose() { document.body.classList.remove('has-dialog'); emit('close') }
function onBackdrop(e) { if (e.target === dlg.value) dlg.value.close() }
</script>

<template>
  <dialog ref="dlg" class="modal" :aria-label="project?.name" @close="onClose" @click="onBackdrop">
    <article v-if="project" class="inner hud" :style="{ '--c': `hsl(${project.hue} 95% 62%)` }">
      <button class="x mono" type="button" aria-label="Close" @click="dlg.close()">ESC ✕</button>
      <div class="art"><ProjectGlyph :id="project.id" :hue="project.hue" animated /></div>
      <div class="body">
        <p class="mono kicker">{{ project.org }} · {{ project.year }}</p>
        <h2>{{ project.name }}</h2>
        <p class="lead">{{ project.about }}</p>

        <div class="facts">
          <div><span class="mono">Role</span>{{ project.role }}</div>
          <div v-if="project.status"><span class="mono">Status</span><b>{{ project.status }}</b></div>
          <div v-else-if="project.metric"><span class="mono">Signal</span><b>{{ project.metric[0] }}</b> {{ project.metric[1] }}</div>
        </div>

        <template v-if="project.highlights.length">
        <h3 class="mono">{{ project.status ? 'What it does' : 'What I delivered' }}</h3>
        <ul>
          <li v-for="h in project.highlights" :key="h">{{ h }}</li>
        </ul>
        </template>

        <template v-if="project.stack.length">
        <h3 class="mono">Stack</h3>
        <div class="tags"><span v-for="s in project.stack" :key="s" class="tag">{{ s }}</span></div>
        </template>
      </div>
    </article>
  </dialog>
</template>

<style scoped>
.modal { width: min(820px, calc(100% - 24px)); max-height: calc(100vh - 40px); margin: auto; overflow: visible; }
.modal[open] { animation: open .45s var(--ease); }
@keyframes open { from { opacity: 0; transform: translateY(20px); clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
.inner { max-height: calc(100vh - 40px); overflow-y: auto; overflow-x: hidden; background: var(--panel-solid); }
.inner::before, .inner::after { border-color: var(--c); }
.x { position: absolute; top: 14px; right: 14px; z-index: 2; padding: 6px 10px; font-size: 11px; color: var(--text); background: rgba(6,7,10,.7); border: 1px solid var(--line-2); cursor: pointer; }
.x:hover { border-color: var(--c); color: var(--c); }
.art { border-bottom: 1px solid var(--line-2); height: 200px; overflow: hidden; }
.art :deep(svg) { height: 100%; }
.body { padding: 28px 32px 32px; }
.kicker { font-size: 12px; color: var(--c); text-transform: uppercase; letter-spacing: .08em; margin: 0 0 8px; }
h2 { font-family: var(--display); font-weight: 600; font-size: clamp(28px, 4.4vw, 44px); letter-spacing: -0.03em; line-height: 1.05; margin: 0 0 12px; }
.lead { color: var(--muted); font-size: 17px; margin: 0 0 22px; }
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); border: 1px solid var(--line-2); margin-bottom: 26px; }
.facts div { padding: 14px 16px; font-size: 15px; }
.facts div + div { border-left: 1px solid var(--line-2); }
.facts span { display: block; font-size: 10.5px; color: var(--dim); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 2px; }
.facts b { color: var(--c); }
h3 { font-size: 11px; font-weight: 500; color: var(--dim); text-transform: uppercase; letter-spacing: .1em; margin: 0 0 12px; }
ul { list-style: none; padding: 0; margin: 0 0 26px; display: grid; gap: 10px; }
li { position: relative; padding-left: 22px; font-size: 15.5px; }
li::before { content: '▹'; position: absolute; left: 0; color: var(--c); }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
@media (max-width: 600px) {
  .body { padding: 22px 20px 26px; }
  .facts { grid-template-columns: 1fr; }
  .facts div + div { border-left: 0; border-top: 1px solid var(--line-2); }
}
</style>
