
import Vue from 'vue'
import VueRouter from 'vue-router'
import ModeladorSVG from '@/components/ModeladorSVG.vue'
import Silo from '@/components/Silo.vue'
import Armazem from '@/components/Armazem.vue'
import Silo3D from '@/components/Silo3D.vue'
import Armazem3D from '@/components/Armazem3D.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/modelador'
  },
  {
    path: '/modelador',
    name: 'ModeladorSVG',
    component: ModeladorSVG
  },
  {
    path: '/silo',
    name: 'Silo',
    component: Silo
  },
  {
    path: '/armazem',
    name: 'Armazem',
    component: Armazem
  },
  {
    path: '/silo3d',
    name: 'Silo3D',
    component: Silo3D
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
