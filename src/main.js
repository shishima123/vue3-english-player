import 'vue-slider-component/theme/antd.css'
import './assets/styles/style.css'

import {
  ConfigProvider,
  Dropdown,
  InputNumber,
  Menu,
  Modal,
  Radio,
  Select,
  Switch,
  Tabs,
  TimePicker
} from 'ant-design-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueSlider from 'vue-slider-component'
import App from './App.vue'

const app = createApp(App)

app.component('VueSlider', VueSlider)

app
  .use(createPinia())
  .use(ConfigProvider)
  .use(TimePicker)
  .use(Switch)
  .use(Radio)
  .use(Select)
  .use(Tabs)
  .use(Modal)
  .use(InputNumber)
  .use(Dropdown)
  .use(Menu)

app.mount('#app')

console.log('Build Date:', import.meta.env.PACKAGE_VERSION)
