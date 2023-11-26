import './assets/styles/style.css'
import 'vue-slider-component/theme/antd.css'
import 'vue-multiselect/dist/vue-multiselect.css'
import 'vue-final-modal/style.css'

import Multiselect from 'vue-multiselect'
import { createApp } from 'vue'
import VueSlider from 'vue-slider-component'
import { createVfm } from 'vue-final-modal'
import { TimePicker, Switch } from 'ant-design-vue'
import App from './App.vue'

const vfm = createVfm()

const app = createApp(App)
app.use(vfm)
app.use(TimePicker)
app.use(Switch)
app.component('VueSlider', VueSlider)
app.component('MultiSelect', Multiselect)
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

app.mount('#app')
