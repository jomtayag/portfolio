<script setup>
// Background: a dot-matrix field that ripples over time and lights up around the cursor.
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref(null)
let raf, ctx, w, h, dpr
const gap = 28
const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2)
  w = innerWidth
  h = innerHeight
  canvas.value.width = w * dpr
  canvas.value.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (reduced) frame(0)
}

function frame(t) {
  const time = t * 0.0004
  mouse.x += (mouse.tx - mouse.x) * 0.12
  mouse.y += (mouse.ty - mouse.y) * 0.12
  ctx.clearRect(0, 0, w, h)
  const offY = (scrollY * 0.15) % gap
  for (let y = -gap; y < h + gap; y += gap) {
    for (let x = 0; x < w + gap; x += gap) {
      const py = y - offY
      const wave = Math.sin(x * 0.006 + time * 2) * Math.cos(py * 0.008 - time * 1.4)
      const dx = x - mouse.x
      const dy = py - mouse.y
      const d = Math.sqrt(dx * dx + dy * dy)
      const near = Math.max(0, 1 - d / 220)
      const r = 0.6 + (wave + 1) * 0.45 + near * 2.2
      const push = near * 10
      const px = x + (d ? (dx / d) * push : 0)
      const ppy = py + (d ? (dy / d) * push : 0)
      ctx.fillStyle = near > 0.02
        ? `rgba(212,255,58,${0.12 + near * 0.75})`
        : `rgba(160,172,190,${0.07 + (wave + 1) * 0.06})`
      ctx.fillRect(px - r / 2, ppy - r / 2, r, r)
    }
  }
  if (!reduced) raf = requestAnimationFrame(frame)
}

function onMove(e) { mouse.tx = e.clientX; mouse.ty = e.clientY }
function onLeave() { mouse.tx = mouse.ty = -9999 }

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resize()
  addEventListener('resize', resize)
  addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  if (!reduced) raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('resize', resize)
  removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <canvas ref="canvas" class="field" aria-hidden="true"></canvas>
</template>

<style scoped>
.field { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
</style>
