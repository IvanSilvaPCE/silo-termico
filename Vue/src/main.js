import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import App from './App.vue'
import router from './router'
import vSelect from 'vue-select'
import VueMask from 'v-mask'
import moment from 'moment'
import store from './store'
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from 'vue2-leaflet'
import LControlFullscreen from 'vue2-leaflet-fullscreen'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import Progress from 'easy-circular-progress'
import VueApexCharts from 'vue-apexcharts'
import html2pdf from "html2pdf.js"


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/css/style.css'
import './assets/css/responsive.css'
import './assets/css/bootstrap-select.css'
import './assets/css/perfect-scrollbar.css'
import 'vue-select/dist/vue-select.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.component('v-select', vSelect)
Vue.use(VueMask)
Vue.prototype.$moment = moment
Vue.component('l-map', LMap)
Vue.component('l-tile-layer', LTileLayer)
Vue.component('l-marker', LMarker)
Vue.component('l-popup', LPopup)
Vue.component('l-icon', LIcon)
Vue.component('l-control-fullscreen', LControlFullscreen)
Vue.component('l-marker-cluster', Vue2LeafletMarkerCluster)
Vue.component('v-progress', Progress)
Vue.component('apex-chart', VueApexCharts)
Vue.prototype.$html2pdf = html2pdf

if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
      navigator.serviceWorker.register('/cloud/web/service-worker.js')
         .catch((error) => {
            console.log('Falha ao registrar o Service Worker:', error)
         })
   })
}

new Vue({
   router,
   store,
   render: h => h(App)
}).$mount('#app')
