
<template>
  <div class="d-flex flex-column" style="min-height: 100vh;">
    <!-- Navegação -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Sistema de Monitoramento Térmico</a>
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a 
                class="nav-link" 
                :class="{ active: telaAtiva === 'modelador' }"
                href="#" 
                @click.prevent="mudarTela('modelador')"
              >
                Modelador SVG
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                :class="{ active: telaAtiva === 'silo' }"
                href="#" 
                @click.prevent="mudarTela('silo')"
              >
                Silo 2D
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                :class="{ active: telaAtiva === 'silo3d' }"
                href="#" 
                @click.prevent="mudarTela('silo3d')"
              >
                Silo 3D
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                :class="{ active: telaAtiva === 'armazem' }"
                href="#" 
                @click.prevent="mudarTela('armazem')"
              >
                Armazém 2D
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                :class="{ active: telaAtiva === 'armazem3d' }"
                href="#" 
                @click.prevent="mudarTela('armazem3d')"
              >
                Armazém 3D
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="flex-grow-1 overflow-hidden">
      <div v-if="carregando" class="d-flex justify-content-center align-items-center" style="height: 100vh;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      </div>
      <component 
        v-else
        :is="componenteAtivo" 
        :dados="dadosComponente"
      />
    </main>
  </div>
</template>

<script>
import ModeladorSVG from './components/ModeladorSVG.vue';
import Silo from './components/Silo.vue';
import Silo3D from './components/Silo3D.vue';
import Armazem from './components/Armazem.vue';
import Armazem3D from './components/Armazem3D.vue';

export default {
  name: 'App',
  components: {
    ModeladorSVG,
    Silo,
    Silo3D,
    Armazem,
    Armazem3D
  },
  data() {
    return {
      telaAtiva: 'modelador',
      carregando: false,
      dadosSilo: null,
      dadosArmazem: null
    };
  },
  computed: {
    componenteAtivo() {
      const componentes = {
        'modelador': 'ModeladorSVG',
        'silo': 'Silo',
        'silo3d': 'Silo3D',
        'armazem': 'Armazem',
        'armazem3d': 'Armazem3D'
      };
      return componentes[this.telaAtiva] || 'ModeladorSVG';
    },
    dadosComponente() {
      if (this.telaAtiva === 'silo' || this.telaAtiva === 'silo3d') {
        return this.dadosSilo;
      } else if (this.telaAtiva === 'armazem' || this.telaAtiva === 'armazem3d') {
        return this.dadosArmazem;
      }
      return null;
    }
  },
  async mounted() {
    await this.carregarDados();
  },
  methods: {
    mudarTela(novaTela) {
      this.telaAtiva = novaTela;
    },
    async carregarDados() {
      this.carregando = true;
      try {
        // Simular dados do silo
        this.dadosSilo = {
          dados_layout: {
            desenho_corte_silo: {
              lb: 200,
              hs: 300,
              hb: 15,
              eb: 10
            },
            desenho_sensores: {
              escala_sensores: 16,
              dist_y_sensores: 12,
              pos_y_cabo: [250, 250],
              pos_x_cabo: [50, 150],
              pos_x_cabos_uniforme: 0,
              nome_sensores_direita: 0,
              nome_cabo_acima: 1,
              dist_y_nome_cabo: [10, 10]
            },
            tamanho_svg: [200, 350],
            aeradores: {
              na: 2,
              dy: 20,
              ds: 30,
              da: 40
            }
          },
          leitura: {
            'P1': {
              '1': [25.5, false, false, false, true],
              '2': [24.8, false, false, false, true],
              '3': [26.2, false, false, false, true]
            },
            'P2': {
              '1': [23.1, false, false, false, true],
              '2': [22.9, false, false, false, true],
              '3': [24.5, false, false, false, true]
            }
          },
          motor: {
            statusMotor: [3, 0]
          }
        };

        // Dados do armazém serão carregados pelo próprio componente
        this.dadosArmazem = {};
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        this.carregando = false;
      }
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.navbar-brand {
  font-weight: bold;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}
</style>
