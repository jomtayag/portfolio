<script setup>
// Short boot sequence shown once per browser session. Click or press any key to skip.
import { onMounted, onBeforeUnmount, ref } from 'vue'

const show = ref(false)
const lines = ref([])
const pct = ref(0)
const script = [
  'init  jomari.tayag/portfolio',
  'load  experience ........ 11 yrs',
  'load  stack ............. vue · laravel · ts',
  'link  ai.agents ......... claude · codex',
  'ready',
]
const timers = []

function done() {
  timers.forEach(clearTimeout)
  show.value = false
  removeEventListener('keydown', done)
}

onMounted(() => {
  let seen = false
  try {
    seen = sessionStorage.getItem('booted') === '1'
    sessionStorage.setItem('booted', '1')
  } catch {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  show.value = true
  addEventListener('keydown', done)
  script.forEach((l, i) =>
    timers.push(setTimeout(() => {
      lines.value.push(l)
      pct.value = ((i + 1) / script.length) * 100
    }, 140 + i * 220)),
  )
  timers.push(setTimeout(done, 140 + script.length * 220 + 380))
})
onBeforeUnmount(done)
</script>

<template>
  <Transition name="boot">
    <div v-if="show" class="boot" @click="done">
      <div class="boot-box mono">
        <p v-for="(l, i) in lines" :key="i"><span class="lime">›</span> {{ l }}</p>
        <div class="bar"><span :style="{ width: pct + '%' }"></span></div>
        <p class="skip">click or press any key to skip</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.boot { position: fixed; inset: 0; z-index: 200; display: grid; place-items: center; background: var(--bg); cursor: pointer; }
.boot-box { width: min(440px, calc(100% - 48px)); font-size: 13px; color: var(--muted); }
.boot-box p { margin: 0 0 6px; animation: ln .3s var(--ease); }
.bar { height: 2px; background: var(--line-2); margin: 18px 0 12px; }
.bar span { display: block; height: 100%; background: var(--lime); transition: width .25s; box-shadow: 0 0 10px var(--lime); }
.skip { color: var(--dim); font-size: 11px; }
@keyframes ln { from { opacity: 0; transform: translateX(-8px); } }
.boot-leave-active { transition: opacity .6s var(--ease), clip-path .7s var(--ease); }
.boot-leave-to { opacity: 0; clip-path: inset(50% 0 50% 0); }
</style>
