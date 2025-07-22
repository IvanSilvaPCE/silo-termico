
<template>
  <div id="app">
    <!-- Navbar -->
    <b-navbar toggleable="lg" variant="primary" type="dark">
      <b-navbar-brand href="/">
        <b-icon icon="thermometer-half"></b-icon>
        Silo Térmico
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item :to="{ name: 'ModeladorSVG' }" exact-active-class="active">
            <b-icon icon="tools"></b-icon> Modelador SVG
          </b-nav-item>
          <b-nav-item :to="{ name: 'Silo2D' }" exact-active-class="active">
            <b-icon icon="grid-3x3"></b-icon> Silo 2D
          </b-nav-item>
          <b-nav-item :to="{ name: 'Silo3D' }" exact-active-class="active">
            <b-icon icon="cube"></b-icon> Silo 3D
          </b-nav-item>
          <b-nav-item :to="{ name: 'Armazem2D' }" exact-active-class="active">
            <b-icon icon="building"></b-icon> Armazém 2D
          </b-nav-item>
          <b-nav-item :to="{ name: 'Armazem3D' }" exact-active-class="active">
            <b-icon icon="box"></b-icon> Armazém 3D
          </b-nav-item>
        </b-navbar-nav>

        <!-- Menu Mobile -->
        <b-navbar-nav class="ml-auto d-lg-none">
          <b-nav-item-dropdown text="Menu" right>
            <b-dropdown-item :to="{ name: 'ModeladorSVG' }">Modelador SVG</b-dropdown-item>
            <b-dropdown-item :to="{ name: 'Silo2D' }">Silo 2D</b-dropdown-item>
            <b-dropdown-item :to="{ name: 'Silo3D' }">Silo 3D</b-dropdown-item>
            <b-dropdown-item :to="{ name: 'Armazem2D' }">Armazém 2D</b-dropdown-item>
            <b-dropdown-item :to="{ name: 'Armazem3D' }">Armazém 3D</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- Status do Sistema -->
        <b-navbar-nav class="ml-auto d-none d-lg-flex">
          <b-nav-text class="d-flex align-items-center">
            <b-icon 
              :icon="sistemaStatus.online ? 'wifi' : 'wifi-off'" 
              :variant="sistemaStatus.online ? 'success' : 'danger'"
            ></b-icon>
            <span class="ml-1">{{ sistemaStatus.online ? 'Online' : 'Offline' }}</span>
          </b-nav-text>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <router-view/>
    </main>

    <!-- Footer -->
    <footer class="footer mt-auto py-2 bg-light text-center">
      <div class="container-fluid">
        <small class="text-muted">
          Sistema de Monitoramento Térmico © 2024 | 
          Última atualização: {{ ultimaAtualizacao }}
        </small>
      </div>
    </footer>
  </div>
</template>

<script>
// Importar os componentes
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
      sistemaStatus: {
        online: true
      },
      ultimaAtualizacao: ''
    }
  },
  mounted() {
    this.initApp()
    this.updateTime()
    
    // Atualizar horário a cada minuto
    setInterval(this.updateTime, 60000)
    
    // Verificar status do sistema
    setInterval(this.checkSystemStatus, 30000)
  },
  methods: {
    initApp() {
      // Configurações iniciais da aplicação
      this.updateTime()
      this.checkSystemStatus()
      
      // Log para debugging
      console.log('Aplicação Vue iniciada com sucesso!')
      console.log('Vuex Store:', this.$store.state)
    },
    updateTime() {
      this.ultimaAtualizacao = new Date().toLocaleString()
    },
    checkSystemStatus() {
      // Simular verificação de status do sistema
      // Em produção, isso seria uma chamada real para API
      this.sistemaStatus.online = navigator.onLine
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
}

.footer {
  margin-top: auto;
}

/* Estilos globais */
body {
  margin: 0;
  padding: 0;
}

/* Responsividade para mobile */
@media (max-width: 768px) {
  .navbar-brand {
    font-size: 1rem;
  }
  
  .nav-link {
    padding: 0.25rem 0.5rem;
  }
}

/* Animações */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Cores personalizadas */
.bg-primary {
  background-color: #007bff !important;
}

.text-primary {
  color: #007bff !important;
}

/* Melhorias visuais */
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
}

.btn {
  border-radius: 0.25rem;
}

/* Loading styles */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>
