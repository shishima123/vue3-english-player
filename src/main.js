import './assets/styles/style.css'
import 'vue-slider-component/theme/antd.css'
import 'vue-multiselect/dist/vue-multiselect.css'
import Multiselect from 'vue-multiselect'
import { library } from '@fortawesome/fontawesome-svg-core'

import { createApp } from 'vue'
import App from './App.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueSlider from 'vue-slider-component'

library.add(
  faPlay,
  faPause,
  faStepForward,
  faStepBackward,
  faTimes,
  faVolumeDown,
  faVolumeUp,
  faList,
  faMusic
)
import {
  faPlay,
  faPause,
  faStepForward,
  faStepBackward,
  faTimes,
  faVolumeDown,
  faVolumeUp,
  faList,
  faMusic
} from '@fortawesome/free-solid-svg-icons'

const app = createApp(App)
app.component('VueSlider', VueSlider)
app.component('MultiSelect', Multiselect)
app.component('FontAwesomeIcon', FontAwesomeIcon)
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
