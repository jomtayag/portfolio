<script setup>
// Generative "signal" artwork unique to each project, derived from its id.
import { computed } from 'vue'

const props = defineProps({ id: String, hue: Number, animated: Boolean })

const seed = computed(() => [...props.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7))
function rand(n) {
  let s = seed.value + n * 9973
  s = (s ^ (s << 13)) >>> 0
  s = (s ^ (s >>> 17)) >>> 0
  s = (s ^ (s << 5)) >>> 0
  return (s % 1000) / 1000
}
const color = computed(() => `hsl(${props.hue} 95% 62%)`)
const bars = computed(() => Array.from({ length: 28 }, (_, i) => 8 + rand(i) * 70))
const rings = computed(() => Array.from({ length: 4 }, (_, i) => ({ r: 22 + i * 16, dash: 4 + rand(i + 40) * 30, off: rand(i + 80) * 100 })))
</script>

<template>
  <svg class="glyph" :class="{ animated }" viewBox="0 0 240 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient :id="'g-' + id" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" :stop-color="color" stop-opacity=".9" />
        <stop offset="1" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="240" height="160" fill="#08090d" />
    <g :stroke="color" fill="none" opacity=".55">
      <circle v-for="(r, i) in rings" :key="i" cx="170" cy="62" :r="r.r" :stroke-dasharray="`${r.dash} 6`" :stroke-dashoffset="r.off" class="ring" :style="{ animationDuration: 8 + i * 4 + 's' }" />
    </g>
    <g :fill="`url(#g-${id})`">
      <rect v-for="(h, i) in bars" :key="i" :x="10 + i * 8" :y="150 - h" width="4" :height="h" class="b" :style="{ animationDelay: i * 40 + 'ms' }" />
    </g>
    <line x1="0" x2="240" y1="150" y2="150" :stroke="color" opacity=".6" />
    <text x="12" y="22" :fill="color" font-family="JetBrains Mono, monospace" font-size="10">SIG/{{ id.toUpperCase() }}</text>
  </svg>
</template>

<style scoped>
.glyph { display: block; width: 100%; height: auto; }
.ring { transform-origin: 170px 62px; }
.animated .ring { animation: rot linear infinite; }
.animated .b { animation: pulse 1.6s ease-in-out infinite alternate; transform-origin: bottom; transform-box: fill-box; }
@keyframes rot { to { transform: rotate(360deg); } }
@keyframes pulse { to { transform: scaleY(.55); } }
</style>
