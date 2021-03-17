import { createApp } from 'vue'
import App from './App.vue'

import Piano from './components/Piano.vue'
import NewSong from './components/NewSong.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: Piano },
  { path: '/songs/:id', component: Piano },
  { path: '/songs/:id/:track', component: Piano },
  { path: '/edit/:id/:track', component: Piano, meta: { editMode: true } },
  { path: '/new', component: NewSong },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const app = createApp(App)
app.use(router).mount('#app')
