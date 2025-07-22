
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
