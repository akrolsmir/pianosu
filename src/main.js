import { createApp } from 'vue'
import App from './App.vue'

import Piano from './components/Piano.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: Piano },
  { path: '/songs/:id', component: Piano },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const app = createApp(App)
app.use(router).mount('#app')
