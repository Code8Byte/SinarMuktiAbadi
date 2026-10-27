import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './app/router'
import { vCan } from './shared/directives/vCan'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('can', vCan)

app.mount('#app')
