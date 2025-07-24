
import Vue from 'vue'
import VueRouter from 'vue-router'
import ModeladorSVG from '../components/ModeladorSVG.vue'
import Silo2D from '../components/Silo2D.vue'
import Silo3D from '../components/Silo3D.vue'
import Armazem2D from '../components/Armazem2D.vue'
import Armazem3D from '../components/Armazem3D.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ModeladorSVG',
    component: ModeladorSVG
  },
  {
    path: '/modelador',
    name: 'ModeladorSVG',
    component: ModeladorSVG
  },
  {
    path: '/silo2d',
    name: 'Silo2D',
    component: Silo2D
  },
  {
    path: '/silo3d',
    name: 'Silo3D',
    component: Silo3D
  },
  {
    path: '/armazem2d',
    name: 'Armazem2D',
    component: Armazem2D
  },
  {
    path: '/armazem3d',
    name: 'Armazem3D',
    component: Armazem3D
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
