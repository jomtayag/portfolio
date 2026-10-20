import { createApp } from 'vue'
import App from './App.vue'
import { reveal } from './composables/reveal.js'
import './styles/main.css'

createApp(App).directive('reveal', reveal).mount('#app')
