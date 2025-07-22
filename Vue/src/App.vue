<template>
  <div id="app">
    <!-- Navegação -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Sistema de Monitoramento</a>

        <button 
          class="navbar-toggler" 
          type="button" 
          @click="toggleNavbar"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div :class="['collapse', 'navbar-collapse', { show: showNavbar }]" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <button 
                :class="['btn', 'btn-sm', 'me-2', telaAtiva === 'modelador' ? 'btn-light' : 'btn-outline-light']"
                @click="mudarTela('modelador')"
              >
                🏗️ Modelador
              </button>
            </li>
            <li class="nav-item">
              <button 
                :class="['btn', 'btn-sm', 'me-2', telaAtiva === 'silo2d' ? 'btn-light' : 'btn-outline-light']"
                @click="mudarTela('silo2d')"
              >
                🌾 Silo 2D
              </button>
            </li>
            <li class="nav-item">
              <button 
                :class="['btn', 'btn-sm', 'me-2', telaAtiva === 'silo3d' ? 'btn-light' : 'btn-outline-light']"
                @click="mudarTela('silo3d')"
              >
                🎯 Silo 3D
              </button>
            </li>
            <li class="nav-item">
              <button 
                :class="['btn', 'btn-sm', 'me-2', telaAtiva === 'armazem2d' ? 'btn-light' : 'btn-outline-light']"
                @click="mudarTela('armazem2d')"
              >
                🏢 Armazém 2D
              </button>
            </li>
            <li class="nav-item">
              <button 
                :class="['btn', 'btn-sm', telaAtiva === 'armazem3d' ? 'btn-light' : 'btn-outline-light']"
                @click="mudarTela('armazem3d')"
              >
                🏭 Armazém 3D
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="flex-grow-1 overflow-hidden">
      <component :is="componenteAtivo" />
    </main>
  </div>
</template>

<script>
import ModeladorSVG from '@/components/modelador/ModeladorSVG.vue'
import Silo2D from '@/components/modelador/Silo2D.vue'
import Silo3D from '@/components/modelador/Silo3D.vue'
import Armazem2D from '@/components/modelador/Armazem2D.vue'
import Armazem3D from '@/components/modelador/Armazem3D.vue'

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
      telaAtiva: 'modelador',
      showNavbar: false
    }
  },
  computed: {
    componenteAtivo() {
      const componentes = {
        'modelador': 'ModeladorSVG',
        'silo2d': 'Silo2D',
        'silo3d': 'Silo3D', 
        'armazem2d': 'Armazem2D',
        'armazem3d': 'Armazem3D'
      }
      return componentes[this.telaAtiva] || 'ModeladorSVG'
    }
  },
  methods: {
    mudarTela(tela) {
      this.telaAtiva = tela
      this.showNavbar = false // Fechar navbar móvel após clique
    },
    toggleNavbar() {
      this.showNavbar = !this.showNavbar
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

/* Bootstrap overrides para melhor responsividade */
.navbar-brand {
  font-size: 1rem !important;
}

@media (min-width: 768px) {
  .navbar-brand {
    font-size: 1.25rem !important;
  }
}

/* Melhorias para botões da navegação */
.navbar-nav .btn {
  min-width: 80px;
  font-size: 0.875rem;
}

@media (min-width: 576px) {
  .navbar-nav .btn {
    min-width: 100px;
  }
}

@media (min-width: 992px) {
  .navbar-nav .btn {
    font-size: 0.9rem;
  }
}

/* Corrigir scroll duplo no mobile */
@media (max-width: 576px) {
  body {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .container-fluid {
    min-height: auto !important;
  }
}
</style>