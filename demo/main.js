import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '../src/style.css'
import App from './App.vue'
 
const app = createApp(App)
app.use(createPinia())
app.mount('#app') 