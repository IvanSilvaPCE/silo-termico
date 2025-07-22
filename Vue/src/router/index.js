
import Vue from 'vue'
import VueRouter from 'vue-router'
import ModeladorSVG from '@/components/ModeladorSVG.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ModeladorSVG',
    component: ModeladorSVG
  },
  {
    path: '/silo2d',
    name: 'Silo2D',
    component: () => import('@/components/Silo2D.vue')
  },
  {
    path: '/silo3d',
    name: 'Silo3D',
    component: () => import('@/components/Silo3D.vue')
  },
  {
    path: '/armazem2d',
    name: 'Armazem2D',
    component: () => import('@/components/Armazem2D.vue')
  },
  {
    path: '/armazem3d',
    name: 'Armazem3D',
    component: () => import('@/components/Armazem3D.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
import Vue from 'vue'
import VueRouter from 'vue-router'
import ModeladorSvgView from '../views/ModeladorSvgView.vue'
import Silo2DView from '../views/Silo2DView.vue'
import Silo3DView from '../views/Silo3DView.vue'
import Armazem2DView from '../views/Armazem2DView.vue'
import Armazem3DView from '../views/Armazem3DView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/modelador'
  },
  {
    path: '/modelador',
    name: 'Modelador',
    component: ModeladorSvgView
  },
  {
    path: '/silo2d',
    name: 'Silo2D',
    component: Silo2DView
  },
  {
    path: '/silo3d',
    name: 'Silo3D',
    component: Silo3DView
  },
  {
    path: '/armazem2d',
    name: 'Armazem2D',
    component: Armazem2DView
  },
  {
    path: '/armazem3d',
    name: 'Armazem3D',
    component: Armazem3DView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
