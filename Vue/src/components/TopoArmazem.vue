
<template>
  <div class="container-fluid">
    <div class="row mb-3">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Vista de Topo - Armazém Completo</h5>
            <button class="btn btn-sm btn-light" @click="$emit('fecharTopo')">
              ✕ Fechar
            </button>
          </div>
          <div class="card-body">
            <div class="text-center mb-3">
              <h6>Clique em um arco para visualizá-lo em detalhes</h6>
              <small class="text-muted">Arco atual: {{ arcoAtual }}</small>
            </div>
            
            <!-- SVG de vista de topo -->
            <div class="d-flex justify-content-center">
              <svg
                width="800"
                height="400" 
                viewBox="0 0 600 400"
                style="border: 1px solid #ddd; background: #f8f9fa;"
              >
                <!-- Fundo do armazém -->
                <rect 
                  x="50" 
                  y="50" 
                  width="500" 
                  height="300" 
                  fill="#e9ecef" 
                  stroke="#6c757d" 
                  stroke-width="2"
                />
                
                <!-- Divisões das células -->
                <line x1="216" y1="50" x2="216" y2="350" stroke="#adb5bd" stroke-width="1" stroke-dasharray="5,5" />
                <line x1="383" y1="50" x2="383" y2="350" stroke="#adb5bd" stroke-width="1" stroke-dasharray="5,5" />
                
                <!-- Labels das células -->
                <text x="133" y="40" text-anchor="middle" font-size="14" font-weight="bold" fill="#495057">CÉLULA 1</text>
                <text x="300" y="40" text-anchor="middle" font-size="14" font-weight="bold" fill="#495057">CÉLULA 2</text>
                <text x="466" y="40" text-anchor="middle" font-size="14" font-weight="bold" fill="#495057">CÉLULA 3</text>
                
                <!-- Arcos (simulados) -->
                <g v-for="arco in arcosSimulados" :key="arco.numero">
                  <rect
                    :x="arco.x"
                    :y="arco.y"
                    :width="arco.width"
                    :height="arco.height"
                    :fill="arco.numero === arcoAtual ? '#007bff' : '#28a745'"
                    :stroke="arco.numero === arcoAtual ? '#0056b3' : '#1e7e34'"
                    stroke-width="2"
                    rx="3"
                    style="cursor: pointer;"
                    @click="selecionarArco(arco.numero)"
                  />
                  <text
                    :x="arco.x + arco.width / 2"
                    :y="arco.y + arco.height / 2"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size="12"
                    font-weight="bold"
                    fill="white"
                    style="cursor: pointer;"
                    @click="selecionarArco(arco.numero)"
                  >{{ arco.numero }}</text>
                </g>
                
                <!-- Pêndulos (simulados) -->
                <g v-for="pendulo in pendulosSimulados" :key="`pendulo-${pendulo.id}`">
                  <circle
                    :cx="pendulo.x"
                    :cy="pendulo.y"
                    r="3"
                    fill="#ffc107"
                    stroke="#e0a800"
                    stroke-width="1"
                  />
                </g>
                
                <!-- Aeradores (simulados) -->
                <g v-for="aerador in aeradores" :key="`aerador-${aerador.id}`">
                  <circle
                    :cx="aerador.x"
                    :cy="aerador.y"
                    r="6"
                    :fill="aerador.cor"
                    stroke="#343a40"
                    stroke-width="2"
                  />
                  <text
                    :x="aerador.x"
                    :y="aerador.y + 15"
                    text-anchor="middle"
                    font-size="8"
                    fill="#343a40"
                  >AE{{ aerador.id }}</text>
                </g>
              </svg>
            </div>
            
            <!-- Legenda -->
            <div class="row mt-3">
              <div class="col-md-12">
                <div class="d-flex justify-content-center flex-wrap gap-3">
                  <div class="d-flex align-items-center">
                    <div style="width: 20px; height: 15px; background: #28a745; margin-right: 5px; border-radius: 3px;"></div>
                    <small>Arco Normal</small>
                  </div>
                  <div class="d-flex align-items-center">
                    <div style="width: 20px; height: 15px; background: #007bff; margin-right: 5px; border-radius: 3px;"></div>
                    <small>Arco Selecionado</small>
                  </div>
                  <div class="d-flex align-items-center">
                    <div style="width: 12px; height: 12px; background: #ffc107; margin-right: 5px; border-radius: 50%;"></div>
                    <small>Pêndulo</small>
                  </div>
                  <div class="d-flex align-items-center">
                    <div style="width: 12px; height: 12px; background: #31dd0f; margin-right: 5px; border-radius: 50%;"></div>
                    <small>Aerador Ligado</small>
                  </div>
                  <div class="d-flex align-items-center">
                    <div style="width: 12px; height: 12px; background: #c5c5c5; margin-right: 5px; border-radius: 50%;"></div>
                    <small>Aerador Desligado</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopoArmazem',
  props: {
    arcoAtual: {
      type: Number,
      default: 1
    }
  },
  computed: {
    arcosSimulados() {
      const arcos = [];
      for (let i = 1; i <= 19; i++) {
        const x = 70 + (i - 1) * 22;
        arcos.push({
          numero: i,
          x: x,
          y: 80,
          width: 20,
          height: 240
        });
      }
      return arcos;
    },
    pendulosSimulados() {
      const pendulos = [];
      let id = 1;
      for (let arco = 1; arco <= 19; arco++) {
        const arcoX = 70 + (arco - 1) * 22 + 10;
        const numPendulos = Math.floor(Math.random() * 4) + 2; // 2-5 pêndulos por arco
        
        for (let p = 0; p < numPendulos; p++) {
          pendulos.push({
            id: id++,
            x: arcoX,
            y: 100 + p * 40,
            arco: arco
          });
        }
      }
      return pendulos;
    },
    aeradores() {
      const aeradores = [];
      const posicoes = [
        { x: 30, y: 100 }, { x: 570, y: 100 },
        { x: 30, y: 200 }, { x: 570, y: 200 },
        { x: 30, y: 300 }, { x: 570, y: 300 },
        { x: 150, y: 30 }, { x: 300, y: 30 }, { x: 450, y: 30 },
        { x: 150, y: 370 }, { x: 300, y: 370 }, { x: 450, y: 370 }
      ];
      
      posicoes.forEach((pos, index) => {
        const status = Math.random() > 0.5 ? 'ligado' : 'desligado';
        aeradores.push({
          id: index + 1,
          x: pos.x,
          y: pos.y,
          cor: status === 'ligado' ? '#31dd0f' : '#c5c5c5'
        });
      });
      
      return aeradores;
    }
  },
  methods: {
    selecionarArco(numeroArco) {
      this.$emit('arcoSelecionado', numeroArco);
    }
  }
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

svg {
  max-width: 100%;
  height: auto;
}

.gap-3 > * {
  margin: 0.25rem;
}
</style>
