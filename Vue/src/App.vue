
<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="primary" class="mb-0">
      <b-navbar-brand href="#" class="d-flex align-items-center">
        <span class="fw-bold text-white">Sistema de Monitoramento</span>
      </b-navbar-brand>
      
      <b-navbar-toggle target="nav-collapse" class="d-lg-none"></b-navbar-toggle>
      
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="d-none d-lg-flex ms-auto">
          <b-nav-item 
            v-for="item in menuItems" 
            :key="item.id"
            :class="{ 'active': activeComponent === item.component }"
            @click="setActiveComponent(item.component)"
          >
            {{ item.name }}
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <!-- Menu Mobile -->
    <b-offcanvas 
      v-model="showMobileMenu"
      id="mobileMenu"
      title="Menu"
      placement="start"
      class="d-lg-none"
    >
      <b-list-group flush>
        <b-list-group-item 
          v-for="item in menuItems" 
          :key="item.id"
          button
          :class="{ 'active': activeComponent === item.component }"
          @click="setActiveComponentMobile(item.component)"
        >
          {{ item.name }}
        </b-list-group-item>
      </b-list-group>
    </b-offcanvas>

    <!-- Botão do Menu Mobile -->
    <b-button
      v-if="!showMobileMenu"
      variant="primary"
      class="d-lg-none position-fixed"
      style="top: 10px; left: 10px; z-index: 1040;"
      @click="showMobileMenu = true"
    >
      <b-icon icon="list"></b-icon>
    </b-button>

    <!-- Conteúdo Principal -->
    <div class="container-fluid p-0" style="height: calc(100vh - 56px);">
      <component :is="activeComponent" />
    </div>
  </div>
</template>

<script>
import ModeladorSVG from '@/components/ModeladorSVG.vue'
import Silo2D from '@/components/Silo2D.vue'
import Silo3D from '@/components/Silo3D.vue'
import Armazem2D from '@/components/Armazem2D.vue'
import Armazem3D from '@/components/Armazem3D.vue'

export default {
  name: 'App',
  components: {
    ModeladorSVG,
    Silo2D,
    Silo3D,
    Armazem2D,
    Armazem3D
  },
  data() {
    return {
      activeComponent: 'ModeladorSVG',
      showMobileMenu: false,
      menuItems: [
        { id: 1, name: 'Modelador SVG', component: 'ModeladorSVG' },
        { id: 2, name: 'Silo 2D', component: 'Silo2D' },
        { id: 3, name: 'Silo 3D', component: 'Silo3D' },
        { id: 4, name: 'Armazem 2D', component: 'Armazem2D' },
        { id: 5, name: 'Armazem 3D', component: 'Armazem3D' }
      ]
    }
  },
  methods: {
    setActiveComponent(component) {
      this.activeComponent = component
    },
    setActiveComponentMobile(component) {
      this.activeComponent = component
      this.showMobileMenu = false
    }
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  background-color: #f8f9fa;
}

.navbar-nav .nav-item {
  cursor: pointer;
}

.navbar-nav .nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-nav .nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.list-group-item.active {
  background-color: #007bff;
  border-color: #007bff;
}
</style>
