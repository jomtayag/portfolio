<script setup>
import { onMounted, onBeforeUnmount, provide, ref } from 'vue'
import BootIntro from './components/BootIntro.vue'
import FieldCanvas from './components/FieldCanvas.vue'
import Reticle from './components/Reticle.vue'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import CareerSection from './components/CareerSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import ProductsSection from './components/ProductsSection.vue'
import ProjectModal from './components/ProjectModal.vue'
import SkillGraph from './components/SkillGraph.vue'
import AiSection from './components/AiSection.vue'
import ContactSection from './components/ContactSection.vue'
import CommandPalette from './components/CommandPalette.vue'
import { products, projects } from './data/portfolio.js'

const activeProject = ref(null)
const paletteOpen = ref(false)
const toast = ref('')
let toastTimer

function openProject(id) {
  activeProject.value = [...projects, ...products].find((p) => p.id === id) || null
}
function notify(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2400)
}

provide('openProject', openProject)
provide('notify', notify)

const progress = ref(0)
function onScroll() {
  const h = document.documentElement.scrollHeight - innerHeight
  progress.value = h > 0 ? scrollY / h : 0
}
function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    paletteOpen.value = !paletteOpen.value
  }
}
onMounted(() => {
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('keydown', onKey)
  onScroll()
})
onBeforeUnmount(() => {
  removeEventListener('scroll', onScroll)
  removeEventListener('keydown', onKey)
})
</script>

<template>
  <BootIntro />
  <FieldCanvas />
  <div class="scan" aria-hidden="true"></div>
  <Reticle />
  <div class="progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>

  <NavBar @palette="paletteOpen = true" />

  <main>
    <HeroSection />
    <AboutSection />
    <CareerSection />
    <ProjectsSection />
    <ProductsSection />
    <SkillGraph />
    <AiSection />
    <ContactSection />
  </main>

  <footer class="foot wrap">
    <span class="mono">© {{ new Date().getFullYear() }} Jomari Tayag</span>
    <button class="mono foot-k" type="button" @click="paletteOpen = true">Press <kbd>Ctrl</kbd> <kbd>K</kbd> to navigate</button>
    <a class="mono" href="#top">Back to top ↑</a>
  </footer>

  <ProjectModal :project="activeProject" @close="activeProject = null" />
  <CommandPalette :open="paletteOpen" @close="paletteOpen = false" />

  <Transition name="toast">
    <div v-if="toast" class="toast mono" role="status">{{ toast }}</div>
  </Transition>
</template>

<style scoped>
.scan {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 3px);
  mix-blend-mode: overlay;
}
.progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 70; }
.progress span { display: block; height: 100%; background: var(--lime); transform-origin: left; box-shadow: 0 0 10px var(--lime); }
main { position: relative; z-index: 2; }
.foot {
  position: relative; z-index: 2;
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px;
  padding: 30px 0 40px; border-top: 1px solid var(--line-2);
  font-size: 12.5px; color: var(--dim);
}
.foot a:hover { color: var(--lime); }
.foot-k { background: none; border: 0; color: inherit; cursor: pointer; font-size: inherit; }
.toast {
  position: fixed; left: 50%; bottom: 26px; z-index: 100; transform: translateX(-50%);
  padding: 10px 18px; font-size: 13px; color: #06070a; background: var(--lime);
}
.toast-enter-active, .toast-leave-active { transition: all .35s var(--ease); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 16px); }
</style>
