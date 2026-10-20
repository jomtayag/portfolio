<script setup>
import { computed, inject, nextTick, ref, watch } from 'vue'
import { products, profile, projects } from '../data/portfolio.js'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])
const openProject = inject('openProject')
const notify = inject('notify')
const dlg = ref(null)
const input = ref(null)
const q = ref('')
const sel = ref(0)

const go = (id) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
const commands = [
  { label: 'Go to About', hint: 'section', run: go('about') },
  { label: 'Go to Career timeline', hint: 'section', run: go('career') },
  { label: 'Go to Work', hint: 'section', run: go('work') },
  { label: 'Go to Lab (my products)', hint: 'section', run: go('lab') },
  { label: 'Go to Stack constellation', hint: 'section', run: go('stack') },
  { label: 'Go to AI workflow', hint: 'section', run: go('ai') },
  { label: 'Send a message', hint: 'contact', run: go('contact') },
  ...[...projects, ...products].map((p) => ({ label: `Open ${p.name}`, hint: 'project', run: () => openProject(p.id) })),
  { label: 'Copy email address', hint: 'action', run: () => navigator.clipboard?.writeText(profile.email).then(() => notify('Email copied')) },
  { label: 'Email Jomari', hint: 'action', run: () => (location.href = 'mailto:' + profile.email) },
  { label: 'Back to top', hint: 'nav', run: () => scrollTo({ top: 0, behavior: 'smooth' }) },
]
const results = computed(() => {
  const s = q.value.trim().toLowerCase()
  return s ? commands.filter((c) => (c.label + ' ' + c.hint).toLowerCase().includes(s)) : commands
})
watch(results, () => (sel.value = 0))

watch(() => props.open, async (o) => {
  await nextTick()
  if (o && !dlg.value.open) { q.value = ''; dlg.value.showModal(); input.value.focus() }
  if (!o && dlg.value.open) dlg.value.close()
})
function exec(c) { dlg.value.close(); setTimeout(() => c?.run(), 60) }
function onKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); sel.value = (sel.value + 1) % results.value.length }
  if (e.key === 'ArrowUp') { e.preventDefault(); sel.value = (sel.value - 1 + results.value.length) % results.value.length }
  if (e.key === 'Enter') { e.preventDefault(); exec(results.value[sel.value]) }
}
</script>

<template>
  <dialog ref="dlg" class="pal" aria-label="Command palette" @close="emit('close')" @click.self="dlg.close()">
    <div class="box hud">
      <div class="in">
        <span class="mono lime">›</span>
        <input ref="input" v-model="q" placeholder="Type a command or search…" aria-label="Search commands" role="combobox" aria-controls="pal-list" :aria-activedescendant="'pal-' + sel" aria-expanded="true" @keydown="onKey" />
      </div>
      <ul id="pal-list" role="listbox">
        <li
          v-for="(c, i) in results"
          :id="'pal-' + i"
          :key="c.label"
          role="option"
          :aria-selected="i === sel"
          :class="{ on: i === sel }"
          @pointermove="sel = i"
          @click="exec(c)"
        >
          {{ c.label }}<span class="mono">{{ c.hint }}</span>
        </li>
        <li v-if="!results.length" class="none mono">No matches</li>
      </ul>
      <p class="foot mono"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> run · <kbd>Esc</kbd> close</p>
    </div>
  </dialog>
</template>

<style scoped>
.pal { width: min(580px, calc(100% - 24px)); margin: 12vh auto auto; }
.pal[open] { animation: p .3s var(--ease); }
@keyframes p { from { opacity: 0; transform: translateY(-10px) scale(.98); } }
.box { background: var(--panel-solid); }
.in { display: flex; align-items: center; gap: 12px; padding: 0 18px; border-bottom: 1px solid var(--line-2); }
.in input { flex: 1; padding: 18px 0; background: none; border: 0; outline: 0; font-size: 16px; color: var(--text); }
ul { list-style: none; margin: 0; padding: 8px; max-height: 360px; overflow-y: auto; }
li { display: flex; justify-content: space-between; gap: 12px; padding: 11px 12px; cursor: pointer; font-size: 15px; }
li span { font-size: 11px; color: var(--dim); text-transform: uppercase; letter-spacing: .08em; }
li.on { background: var(--lime); color: #06070a; }
li.on span { color: #06070a; }
.none { color: var(--dim); font-size: 13px; cursor: default; }
.foot { display: flex; gap: 6px; align-items: center; margin: 0; padding: 10px 16px; border-top: 1px solid var(--line-2); font-size: 11px; color: var(--dim); }
</style>
