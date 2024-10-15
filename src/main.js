import 'vue-slider-component/theme/antd.css'
import './assets/styles/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueSlider from 'vue-slider-component'
import {
  ConfigProvider,
  TimePicker,
  Switch,
  Radio,
  Select,
  Tabs,
  Modal,
  InputNumber,
  Dropdown,
  Menu
} from 'ant-design-vue'
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

console.log('v', import.meta.env.PACKAGE_VERSION)
