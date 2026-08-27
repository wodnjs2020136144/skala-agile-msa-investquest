import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
// 서체는 토큰보다 먼저. dynamic-subset 은 실제로 쓰인 글자 범위의 woff2 만 받는다.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import '@/assets/styles/global.css'
import '@/assets/styles/ui.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
