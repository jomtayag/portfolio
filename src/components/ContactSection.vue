<script setup>
// Contact form. Sends through Web3Forms when VITE_WEB3FORMS_KEY is set;
// otherwise opens the visitor's email app with the message pre-filled.
import { computed, inject, reactive, ref } from 'vue'
import { profile } from '../data/portfolio.js'

const notify = inject('notify')
const KEY = import.meta.env.VITE_WEB3FORMS_KEY
const topics = ['Full-time role', 'Contract / freelance', 'Collaboration', 'Just saying hi']

const form = reactive({ name: '', email: '', phone: '', topic: topics[0], message: '', botcheck: false })
const touched = reactive({})
const status = ref('idle') // idle | sending | sent | error
const errorMsg = ref('')

const errors = computed(() => ({
  name: form.name.trim().length < 2 ? 'Please enter your name.' : '',
  email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) ? 'Enter a valid email address.' : '',
  phone: form.phone && !/^[+\d][\d\s().-]{6,19}$/.test(form.phone.trim()) ? 'Enter a valid phone number.' : '',
  message: form.message.trim().length < 10 ? 'Tell me a bit more (10+ characters).' : '',
}))
const valid = computed(() => Object.values(errors.value).every((e) => !e))
const show = (f) => touched[f] && errors.value[f]

async function submit() {
  Object.keys(errors.value).forEach((k) => (touched[k] = true))
  if (!valid.value || form.botcheck) return
  const subject = `Portfolio: ${form.topic} — ${form.name.trim()}`
  const body = `${form.message.trim()}\n\n— ${form.name.trim()}\n${form.email.trim()}${form.phone ? '\n' + form.phone.trim() : ''}`

  if (!KEY) {
    location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    return
  }

  status.value = 'sending'
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: KEY,
        subject,
        from_name: 'Portfolio contact form',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || 'Not provided',
        topic: form.topic,
        message: form.message.trim(),
        botcheck: form.botcheck,
      }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.message || 'Request failed')
    status.value = 'sent'
  } catch (e) {
    status.value = 'error'
    errorMsg.value = 'Message didn’t go through. Please email me directly.'
  }
}
function reset() {
  Object.assign(form, { name: '', email: '', phone: '', topic: topics[0], message: '' })
  Object.keys(touched).forEach((k) => delete touched[k])
  status.value = 'idle'
}
async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); notify(`${label} copied`) } catch { notify(text) }
}
</script>

<template>
  <section id="contact" class="sec wrap">
    <div class="sec-head" v-reveal>
      <div class="sec-index"><b>07</b> / Contact</div>
      <div>
        <h2 class="sec-title">Let’s build<br /><em>something great.</em></h2>
        <p class="sec-sub">Hiring, contracting, or have a project in mind? Send a message, or reach me directly.</p>
      </div>
    </div>

    <div class="grid">
      <aside class="direct" v-reveal>
        <a class="channel hud" :href="'mailto:' + profile.email">
          <span class="mono lbl">Email</span>
          <span class="val">{{ profile.email }}</span>
          <button type="button" class="cp mono" @click.prevent="copy(profile.email, 'Email')">Copy</button>
        </a>
        <a class="channel hud" :href="'tel:' + profile.phone.replace(/\s/g, '')">
          <span class="mono lbl">Phone</span>
          <span class="val">{{ profile.phone }}</span>
          <button type="button" class="cp mono" @click.prevent="copy(profile.phone, 'Number')">Copy</button>
        </a>
        <div class="channel hud static">
          <span class="mono lbl">Location</span>
          <span class="val">{{ profile.location }}</span>
          <span class="mono tz">GMT+8 · open to remote</span>
        </div>
      </aside>

      <div class="form-wrap hud" v-reveal="120">
        <Transition name="swap" mode="out-in">
          <div v-if="status === 'sent'" key="sent" class="sent">
            <div class="check">✓</div>
            <h3>Message received.</h3>
            <p>Thanks, {{ form.name.split(' ')[0] }}. I’ll get back to you at {{ form.email }}.</p>
            <button type="button" class="btn" @click="reset">Send another</button>
          </div>

          <form v-else key="form" novalidate @submit.prevent="submit">
            <div class="row2">
              <label :class="{ bad: show('name') }">
                <span class="mono">Name *</span>
                <input v-model="form.name" type="text" name="name" autocomplete="name" placeholder="Your name" @blur="touched.name = true" />
                <small v-if="show('name')">{{ errors.name }}</small>
              </label>
              <label :class="{ bad: show('email') }">
                <span class="mono">Email *</span>
                <input v-model="form.email" type="email" name="email" autocomplete="email" placeholder="you@company.com" @blur="touched.email = true" />
                <small v-if="show('email')">{{ errors.email }}</small>
              </label>
            </div>
            <label :class="{ bad: show('phone') }">
              <span class="mono">Phone <i>(optional)</i></span>
              <input v-model="form.phone" type="tel" name="phone" autocomplete="tel" placeholder="+63 900 000 0000" @blur="touched.phone = true" />
              <small v-if="show('phone')">{{ errors.phone }}</small>
            </label>

            <fieldset>
              <legend class="mono">Topic</legend>
              <div class="topics">
                <label v-for="t in topics" :key="t" class="topic" :class="{ on: form.topic === t }">
                  <input v-model="form.topic" type="radio" name="topic" :value="t" />{{ t }}
                </label>
              </div>
            </fieldset>

            <label :class="{ bad: show('message') }">
              <span class="mono">Message * <i>{{ form.message.length }}/2000</i></span>
              <textarea v-model="form.message" name="message" rows="5" maxlength="2000" placeholder="Tell me about the role or project…" @blur="touched.message = true"></textarea>
              <small v-if="show('message')">{{ errors.message }}</small>
            </label>

            <input v-model="form.botcheck" type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

            <div class="actions">
              <button type="submit" class="btn solid" :disabled="status === 'sending'">
                {{ status === 'sending' ? 'Sending…' : 'Send message' }} <span class="arrow">→</span>
              </button>
              <p v-if="status === 'error'" class="err mono" role="alert">{{ errorMsg }}</p>
              <p v-else class="hint mono">{{ KEY ? 'Goes straight to my inbox.' : 'Opens your email app.' }}</p>
            </div>
          </form>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; align-items: start; padding-bottom: 60px; }
.direct { display: grid; gap: 14px; }
.channel { display: grid; gap: 4px; padding: 20px 22px; transition: border-color .3s; }
.channel:not(.static):hover { border-color: var(--lime); }
.lbl { font-size: 10.5px; color: var(--dim); text-transform: uppercase; letter-spacing: .1em; }
.val { font-family: var(--display); font-weight: 600; font-size: clamp(16px, 1.8vw, 20px); letter-spacing: -0.01em; word-break: break-all; }
.tz { font-size: 12px; color: var(--lime); }
.cp { position: absolute; top: 16px; right: 16px; padding: 4px 9px; font-size: 10.5px; text-transform: uppercase; letter-spacing: .08em; background: none; border: 1px solid var(--line-2); color: var(--muted); cursor: pointer; }
.cp:hover { color: #06070a; background: var(--lime); border-color: var(--lime); }

.form-wrap { padding: 28px; background: rgba(10, 12, 17, 0.88); }
form { display: grid; gap: 18px; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
label { display: grid; gap: 7px; }
label > span, legend { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; }
label i, legend i { font-style: normal; color: var(--dim); text-transform: none; letter-spacing: 0; float: right; }
input, textarea {
  width: 100%; padding: 13px 14px; background: rgba(255,255,255,0.025); border: 1px solid var(--line-2); border-radius: 0;
  color: var(--text); font-size: 16px; outline: none; transition: border-color .2s, background .2s; resize: vertical;
}
input::placeholder, textarea::placeholder { color: var(--dim); }
input:focus, textarea:focus { border-color: var(--lime); background: rgba(212, 255, 58, 0.03); }
.bad input, .bad textarea { border-color: var(--signal); }
small { color: var(--signal); font-size: 12.5px; }
fieldset { border: 0; padding: 0; margin: 0; }
legend { padding: 0; margin-bottom: 8px; }
.topics { display: flex; flex-wrap: wrap; gap: 8px; }
.topic { display: inline-flex; padding: 8px 12px; font-size: 13.5px; border: 1px solid var(--line-2); cursor: pointer; transition: all .2s; color: var(--muted); }
.topic input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.topic:hover { color: var(--text); }
.topic.on { color: #06070a; background: var(--lime); border-color: var(--lime); }
.topic:has(input:focus-visible) { outline: 2px solid var(--lime); outline-offset: 2px; }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.hint { font-size: 12px; color: var(--dim); margin: 0; }
.err { font-size: 12.5px; color: var(--signal); margin: 0; }

.sent { text-align: center; padding: 40px 10px; }
.check { width: 64px; height: 64px; margin: 0 auto 18px; display: grid; place-items: center; font-size: 28px; color: #06070a; background: var(--lime); clip-path: polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%); }
.sent h3 { font-family: var(--display); font-size: 26px; margin: 0 0 8px; }
.sent p { color: var(--muted); margin: 0 0 24px; }
.swap-enter-active, .swap-leave-active { transition: opacity .3s, transform .3s var(--ease); }
.swap-enter-from, .swap-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .row2 { grid-template-columns: 1fr; } .form-wrap { padding: 20px; } }
</style>
