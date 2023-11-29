import 'vue-slider-component/theme/antd.css'
import './assets/styles/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueSlider from 'vue-slider-component'
import { ConfigProvider, TimePicker, Switch, Radio, Select, Tabs, Modal } from 'ant-design-vue'
import App from './App.vue'

const app = createApp(App)

app.component('VueSlider', VueSlider)

app.use(createPinia())
app.use(ConfigProvider)
app.use(TimePicker)
app.use(Switch)
app.use(Radio)
app.use(Select)
app.use(Tabs)
app.use(Modal)

app.mount('#app')
