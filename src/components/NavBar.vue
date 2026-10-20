<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

defineEmits(['palette'])
const links = [
  { id: 'about', label: 'About' },
  { id: 'career', label: 'Career' },
  { id: 'work', label: 'Work' },
  { id: 'lab', label: 'Lab' },
  { id: 'stack', label: 'Stack' },
  { id: 'ai', label: 'AI' },
  { id: 'contact', label: 'Contact' },
]
const active = ref('')
const menu = ref(false)
const scrolled = ref(false)
const clock = ref('')
let io, tick

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit' })
function updateClock() { clock.value = fmt.format(new Date()) }
function onScroll() { scrolled.value = scrollY > 20 }

onMounted(() => {
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) active.value = e.target.id })
  }, { rootMargin: '-45% 0px -50% 0px' })
  links.forEach((l) => { const s = document.getElementById(l.id); if (s) io.observe(s) })
  updateClock()
  tick = setInterval(updateClock, 1000)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => { io?.disconnect(); clearInterval(tick); removeEventListener('scroll', onScroll) })
</script>

<template>
  <header class="nav" :class="{ scrolled, open: menu }">
    <a href="#top" class="brand" aria-label="Back to top">
      <span class="mark">JT</span>
      <span class="mono brand-sub">MNL {{ clock }}</span>
    </a>
    <nav aria-label="Primary">
      <ul>
        <li v-for="(l, i) in links" :key="l.id">
          <a :href="'#' + l.id" :class="{ on: active === l.id }" @click="menu = false">
            <span class="mono n">0{{ i + 1 }}</span>{{ l.label }}
          </a>
        </li>
      </ul>
    </nav>
    <button class="k" type="button" aria-label="Open command palette" @click="$emit('palette')"><kbd>Ctrl</kbd><kbd>K</kbd></button>
    <a href="#contact" class="hire mono">Hire me</a>
    <button class="burger" type="button" :aria-expanded="menu" aria-label="Toggle menu" @click="menu = !menu"><span></span><span></span></button>
  </header>
</template>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 60;
  display: flex; align-items: center; gap: 20px;
  padding: 16px max(20px, calc((100% - 1200px) / 2));
  transition: background .3s, border-color .3s, padding .3s;
  border-bottom: 1px solid transparent;
}
.nav.scrolled { background: rgba(6, 7, 10, 0.82); backdrop-filter: blur(14px); border-color: var(--line-2); padding-top: 12px; padding-bottom: 12px; }
.brand { display: flex; align-items: center; gap: 12px; }
.mark {
  display: grid; place-items: center; width: 38px; height: 38px;
  font-family: var(--display); font-weight: 800; font-size: 13px; color: #06070a; background: var(--lime);
  clip-path: polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%);
}
.brand-sub { font-size: 11.5px; color: var(--dim); font-variant-numeric: tabular-nums; }
nav { margin-left: auto; }
ul { display: flex; gap: 2px; list-style: none; margin: 0; padding: 0; }
nav a { display: flex; align-items: baseline; gap: 6px; padding: 8px 12px; font-size: 14px; color: var(--muted); transition: color .2s; }
nav a .n { font-size: 10px; color: var(--dim); transition: color .2s; }
nav a:hover, nav a.on { color: var(--text); }
nav a.on .n { color: var(--lime); }
.k { display: flex; gap: 3px; background: none; border: 0; cursor: pointer; padding: 6px; }
.hire { padding: 9px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #06070a; background: var(--lime); transition: background .2s; }
.hire:hover { background: var(--text); }
.burger { display: none; width: 42px; height: 42px; background: none; border: 1px solid var(--line-2); cursor: pointer; position: relative; }
.burger span { position: absolute; left: 11px; right: 11px; height: 2px; background: var(--text); transition: transform .3s var(--ease); }
.burger span:first-child { top: 16px; }
.burger span:last-child { top: 24px; }
.open .burger span:first-child { transform: translateY(4px) rotate(45deg); }
.open .burger span:last-child { transform: translateY(-4px) rotate(-45deg); }

@media (max-width: 900px) {
  .k, .hire { display: none; }
  .burger { display: block; margin-left: auto; }
  nav { position: absolute; top: 100%; left: 0; right: 0; margin: 0; display: none; background: rgba(6, 7, 10, 0.97); border-bottom: 1px solid var(--line-2); }
  .open nav { display: block; }
  ul { flex-direction: column; padding: 8px 20px 18px; }
  nav a { padding: 14px 0; font-size: 18px; border-bottom: 1px solid var(--line-2); }
  .nav.open { background: rgba(6, 7, 10, 0.97); }
}
</style>
