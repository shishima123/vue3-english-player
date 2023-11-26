import 'vue-slider-component/theme/antd.css'
import './assets/styles/style.css'

import { createApp } from 'vue'
import VueSlider from 'vue-slider-component'
import { ConfigProvider, TimePicker, Switch, Radio, Select, Tabs, Modal } from 'ant-design-vue'
import App from './App.vue'

const app = createApp(App)
app.component('VueSlider', VueSlider)
app.directive('scroll-element', {
  created: function (el, binding) {
    let f = function (evt) {
      if (binding.value(evt, el)) {
        el.removeEventListener('scroll', f)
      }
    }
    el.addEventListener('scroll', f)
  }
})

app.use(ConfigProvider)
app.use(TimePicker)
app.use(Switch)
app.use(Radio)
app.use(Select)
app.use(Tabs)
app.use(Modal)

app.mount('#app')
