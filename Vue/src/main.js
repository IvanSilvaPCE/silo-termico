
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Bootstrap Vue
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// V-Mask
import VueMask from 'v-mask'

// Vue Select
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueMask)
Vue.component('v-select', vSelect)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
