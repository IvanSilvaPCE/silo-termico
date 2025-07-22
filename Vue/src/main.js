
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Importar Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Importar BootstrapVue CSS (se estiver usando BootstrapVue 3)
// import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

// Se estiver usando BootstrapVue 3, descomente as linhas abaixo:
// import { BootstrapVue3 } from 'bootstrap-vue-3'

const app = createApp(App)

// Se estiver usando BootstrapVue 3, descomente a linha abaixo:
// app.use(BootstrapVue3)

app.use(store)
app.use(router)

app.mount('#app')
