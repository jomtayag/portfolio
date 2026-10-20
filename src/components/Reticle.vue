<script setup>
// HUD crosshair that trails the pointer and reports live coordinates. Desktop pointers only.
import { onMounted, onBeforeUnmount, ref } from 'vue'

const el = ref(null)
const pos = ref({ x: 0, y: 0 })
const hot = ref(false)
const enabled = ref(false)
let raf
const target = { x: -100, y: -100 }
const cur = { x: -100, y: -100 }

function onMove(e) {
  target.x = e.clientX
  target.y = e.clientY
  hot.value = !!e.target.closest?.('a, button, input, textarea, .hot')
}
function loop() {
  cur.x += (target.x - cur.x) * 0.22
  cur.y += (target.y - cur.y) * 0.22
  if (el.value) el.value.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`
  pos.value = { x: Math.round(target.x), y: Math.round(target.y + scrollY) }
  raf = requestAnimationFrame(loop)
}
onMounted(() => {
  enabled.value = matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!enabled.value) return
  addEventListener('pointermove', onMove, { passive: true })
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('pointermove', onMove)
})
</script>

<template>
  <div v-if="enabled" ref="el" class="reticle" :class="{ hot }" aria-hidden="true">
    <span class="ring"></span>
    <span class="xy">{{ String(pos.x).padStart(4, '0') }} · {{ String(pos.y).padStart(5, '0') }}</span>
  </div>
</template>

<style scoped>
.reticle { position: fixed; left: 0; top: 0; z-index: 90; pointer-events: none; }
.ring {
  position: absolute; left: -14px; top: -14px; width: 28px; height: 28px;
  border: 1px solid rgba(212, 255, 58, 0.55);
  transition: all .25s var(--ease);
}
.hot .ring { left: -20px; top: -20px; width: 40px; height: 40px; border-color: var(--lime); transform: rotate(45deg); }
.xy { position: absolute; left: 20px; top: 14px; font-family: var(--mono); font-size: 10px; color: var(--dim); white-space: nowrap; }
.hot .xy { color: var(--lime); }
</style>
