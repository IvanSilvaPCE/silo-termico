
<template>
  <div class="container-fluid p-1 p-md-2" style="min-height: 100vh; overflow: auto;">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-1 mb-md-2 fs-4 fs-md-1">Armazém - Monitoramento de Temperatura</h1>

        <div v-if="carregandoModo" class="d-flex justify-content-center m-2">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>

        <TopoArmazem v-else-if="mostrarTopo" :arcoAtual="arcoAtual" :dados="dadosLocal"
          @arcoSelecionado="handleArcoSelecionadoTopo" @fecharTopo="mostrarTopo = false" />

        <div v-else class="svg-container mb-1 mb-md-2"
          style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 220px); max-height: calc(100vh - 160px); overflow: auto;">
          
          <!-- Debug info quando não há dados -->
          <div v-if="!dadosLocal || !layoutTopo" class="alert alert-info text-center">
            <div class="spinner-border mb-3" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <h5>Carregando dados do armazém...</h5>
            <div class="mt-3">
              <p class="mb-1">
                <strong>Status:</strong> 
                <span :class="dadosLocal ? 'text-success' : 'text-warning'">
                  {{ dadosLocal ? '✓ Dados carregados' : '⏳ Carregando dados' }}
                </span>
              </p>
              <p class="mb-1">
                <strong>Layout:</strong>
                <span :class="layoutTopo ? 'text-success' : 'text-warning'">
                  {{ layoutTopo ? '✓ Layout disponível' : '⏳ Processando layout' }}
                </span>
              </p>
              <p class="mb-0">
                <strong>Arcos:</strong> {{ totalArcos || 'Calculando...' }}
              </p>
            </div>
          </div>
          
          <!-- Container SVG -->
          <div v-else ref="containerRef" class="d-flex justify-content-center" style="height: 70vh; min-height: 350px;" />
        </div>

        <!-- Controles de Navegação entre Arcos -->
        <div v-if="layoutTopo" class="row mb-3">
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">Controle de Arcos - {{ totalArcos }} arcos em {{ totalCelulas }} células</h6>
              </div>
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <label class="form-label">Arco Atual:</label>
                    <div class="d-flex gap-2 align-items-center">
                      <button class="btn btn-outline-primary btn-sm" @click="mudarArco(Math.max(1, arcoAtual - 1))"
                        :disabled="arcoAtual <= 1">
                        ← Anterior
                      </button>
                      <select class="form-select" v-model.number="arcoAtual" @change="mudarArco(arcoAtual)">
                        <option v-for="numeroArco in totalArcos" :key="numeroArco" :value="numeroArco">
                          Arco {{ numeroArco }} - Célula {{ obterCelulaDoArco(numeroArco) }} - {{
                                                    obterTotalSensoresArco(numeroArco) }} sensores
                        </option>
                      </select>
                      <button class="btn btn-outline-primary btn-sm"
                        @click="mudarArco(Math.min(totalArcos, arcoAtual + 1))" :disabled="arcoAtual >= totalArcos">
                        Próximo →
                      </button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-2 border rounded bg-light">
                      <small class="fw-bold">Estrutura do Arco {{ arcoAtual }}:</small>
                      <div class="mt-2">
                        <span class="badge bg-success me-1 mb-1">
                          Célula {{ obterCelulaDoArco(arcoAtual) }}
                        </span>
                        <span class="badge bg-info me-1 mb-1">
                          {{ obterTotalSensoresArco(arcoAtual) }} sensores
                        </span>
                      </div>
                      <hr class="my-2" />
                      <small class="text-muted">
                        <strong>Total Geral:</strong><br />
                        • {{ totalArcos }} arcos<br />
                        • {{ totalCelulas }} células<br />
                        • {{ totalSensores }} sensores
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center py-2">
          <button class="btn btn-primary" @click="trocarModo">
            {{ modo === 'temperatura' ? 'Ver Mapa de Calor' : 'Ver Temperatura' }}
          </button>
          <button class="btn ms-2" :class="mostrarTopo ? 'btn-success' : 'btn-outline-info'"
                      @click="mostrarTopo = !mostrarTopo">
            {{ mostrarTopo ? 'Fechar Topo' : 'Vista de Topo' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopoArmazem from "./TopoArmazem.vue";

export default {
  name: "ArmazemSVG",
  props: {
    dados: {
      type: Object,
      default: null
    }
  },
  components: {
    TopoArmazem
  },
  data() {
    return {
      modo: "temperatura",
      carregandoModo: false,
      dadosLocal: null,
      arcoAtual: 1,
      layoutTopo: null,
      mostrarTopo: false,
      dimensoesSVG: { largura: 350, altura: 200 },
      totalArcos: 0,
      totalCelulas: 0,
      totalSensores: 0
    };
  },
  async mounted() {
    console.log('Componente Armazem montado');
    await this.inicializarDados();
    
    // Forçar renderização após carregamento dos dados
    this.$nextTick(() => {
      if (this.dadosLocal && this.layoutTopo) {
        console.log('Forçando renderização após carregamento dos dados');
        this.renderizarSVG();
        // Forçar atualização da interface
        this.$forceUpdate();
      }
    });

    // Backup: tentar renderizar novamente após um delay
    setTimeout(() => {
      if (this.dadosLocal && this.layoutTopo && !document.getElementById("des_arco_armazem")) {
        console.log('Renderização de backup executada');
        this.renderizarSVG();
      }
    }, 1000);
  },
  watch: {
    dadosLocal: {
      handler() {
        this.renderizarSVG();
      },
      deep: true
    },
    modo() {
      this.renderizarSVG();
    },
    arcoAtual() {
      this.renderizarSVG();
    }
  },
  methods: {
    async inicializarDados() {
      try {
        console.log('Iniciando carregamento de dados...');
        
        // Tentar carregar dados do modelo real primeiro
        let dados = null;
        
        try {
          const response = await fetch('/models/modeloRotaArmazemPortal_1751897945212.json');
          if (response.ok) {
            dados = await response.json();
            console.log('Dados carregados do modelo real:', dados);
          }
        } catch (modelError) {
          console.log('Erro ao carregar modelo real:', modelError);
        }

        // Fallback para dadosArmazem.json local
        if (!dados) {
          try {
            const response = await fetch('/Vue/src/dadosArmazem.json');
            if (response.ok) {
              dados = await response.json();
              console.log('Dados carregados do arquivo local:', dados);
            }
          } catch (localError) {
            console.log('Erro ao carregar arquivo local:', localError);
          }
        }

        // Se ainda não temos dados, criar dados de exemplo
        if (!dados) {
          console.log('Criando dados de exemplo...');
          dados = this.criarDadosExemplo();
        }

        this.dadosLocal = dados;

        // Extrair ou criar layout_topo
        if (dados.configuracao?.layout_topo) {
          this.layoutTopo = dados.configuracao.layout_topo;
        } else if (dados.arcos) {
          // Criar layout_topo baseado nos arcos existentes
          this.layoutTopo = this.criarLayoutTopoDosArcos(dados.arcos);
        } else {
          this.layoutTopo = this.criarLayoutTopoExemplo();
        }

        this.calcularEstatisticas();
        this.calcularDimensoesSVG();

        console.log('Inicialização concluída:', {
          dados: !!this.dadosLocal,
          layoutTopo: !!this.layoutTopo,
          totalArcos: this.totalArcos,
          totalCelulas: this.totalCelulas,
          totalSensores: this.totalSensores
        });

      } catch (error) {
        console.error('Erro fatal ao inicializar dados:', error);
        
        // Último recurso: dados mínimos
        this.dadosLocal = this.criarDadosExemplo();
        this.layoutTopo = this.criarLayoutTopoExemplo();
        this.calcularEstatisticas();
        this.calcularDimensoesSVG();
      }
    },

    criarDadosExemplo() {
      return {
        configuracao: {
          layout_topo: this.criarLayoutTopoExemplo()
        },
        pendulos: {
          "1": [false, false, true, 23.5],
          "2": [false, false, true, 24.1],
          "3": [false, false, true, 22.8],
          "4": [false, false, true, 25.2],
          "5": [false, false, true, 23.9]
        }
      };
    },

    criarLayoutTopoExemplo() {
      return {
        "1": { "celula": 1, "pos_x": 30, "sensores": { "1": 75, "2": 150, "3": 225 } },
        "2": { "celula": 1, "pos_x": 60, "sensores": { "4": 125, "5": 200 } },
        "3": { "celula": 2, "pos_x": 90, "sensores": { "6": 100, "7": 175, "8": 250 } },
        "4": { "celula": 2, "pos_x": 120, "sensores": { "9": 125, "10": 200 } },
        "5": { "celula": 3, "pos_x": 150, "sensores": { "11": 75, "12": 150, "13": 225 } }
      };
    },

    criarLayoutTopoDosArcos(arcos) {
      const layout = {};
      let arcoNumero = 1;
      
      Object.entries(arcos).forEach(([arcoKey, arcoData]) => {
        const sensores = {};
        let sensorIndex = 1;
        
        Object.entries(arcoData).forEach(([penduloId, penduloData]) => {
          sensores[penduloId] = 75 + (sensorIndex * 50); // Distribuir sensores verticalmente
          sensorIndex++;
        });

        layout[arcoNumero] = {
          celula: Math.ceil(arcoNumero / 2), // 2 arcos por célula
          pos_x: 30 + (arcoNumero * 30),
          sensores: sensores
        };
        
        arcoNumero++;
      });

      return layout;
    },

    calcularEstatisticas() {
      if (!this.layoutTopo) return;

      const arcos = {};
      const celulas = new Set();
      let totalSensores = 0;

      // Analisar cada entrada do layout_topo
      Object.entries(this.layoutTopo).forEach(([key, value]) => {
        if (key === 'aeradores' || key === 'celulas') return;

        const numeroArco = parseInt(key);
        const celula = value.celula;
        const sensores = value.sensores || {};
        const numSensores = Object.keys(sensores).length;

        arcos[numeroArco] = {
          celula: celula,
          sensores: numSensores,
          posX: value.pos_x
        };

        celulas.add(celula);
        totalSensores += numSensores;
      });

      this.totalArcos = Object.keys(arcos).length;
      this.totalCelulas = celulas.size;
      this.totalSensores = totalSensores;
    },

    calcularDimensoesSVG() {
      // Dimensões baseadas no arco atual
      const larguraBase = 400;
      const alturaBase = 250;

      if (this.layoutTopo && this.layoutTopo[this.arcoAtual]) {
        const sensoresArco = this.layoutTopo[this.arcoAtual].sensores || {};
        const numSensores = Object.keys(sensoresArco).length;

        // Ajustar altura baseado no número de sensores
        const alturaCalculada = Math.max(alturaBase, 150 + (numSensores * 15));

        this.dimensoesSVG = {
          largura: larguraBase,
          altura: alturaCalculada
        };
      }
    },

    obterCelulaDoArco(numeroArco) {
      if (!this.layoutTopo || !this.layoutTopo[numeroArco]) return 1;
      return this.layoutTopo[numeroArco].celula;
    },

    obterTotalSensoresArco(numeroArco) {
      if (!this.layoutTopo || !this.layoutTopo[numeroArco]) return 0;
      return Object.keys(this.layoutTopo[numeroArco].sensores || {}).length;
    },

    renderizarSVG() {
      if (!this.dadosLocal || !this.layoutTopo) return;

      const container = this.$refs.containerRef;
      if (!container) return;

      const svgExistente = container.querySelector("#des_arco_armazem");
      if (svgExistente) svgExistente.remove();

      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.setAttribute("id", "des_arco_armazem");
      svgEl.setAttribute("xml", "preserve");
      svgEl.setAttribute("version", "1.0");
      svgEl.setAttribute(
        "style",
        "shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
      );
      svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      svgEl.setAttribute("width", "100%");
      svgEl.setAttribute("height", "70vh");
      svgEl.setAttribute("viewBox", `0 0 ${this.dimensoesSVG.largura} ${this.dimensoesSVG.altura}`);
      container.appendChild(svgEl);

      // Desenhar fundo e conteúdo
      this.desenhaFundo();
      if (this.modo === "temperatura") {
        this.desenhaSensores();
        this.atualizarSensores();
      } else {
        this.desenhaMapaCalor();
      }
    },

    corFaixaExata(t) {
      if (t === -1000) return "#ff0000";
      if (t < 12) return "#0384fc";
      else if (t < 15) return "#03e8fc";
      else if (t < 17) return "#03fcbe";
      else if (t < 21) return "#07fc03";
      else if (t < 25) return "#c3ff00";
      else if (t < 27) return "#fcf803";
      else if (t < 30) return "#ffb300";
      else if (t < 35) return "#ff2200";
      else if (t < 50) return "#ff0090";
      else return "#f700ff";
    },

    desenhaFundo() {
      const svgEl = document.getElementById("des_arco_armazem");
      const pb = this.dimensoesSVG.altura - 50;
      const lb = this.dimensoesSVG.largura;
      const hb = 30, hf = 5;
      const lf = Math.min(250, lb * 0.7);
      const le = 15, ht = 50;

      // Base
      const p1 = [lb, pb - hb],
        p2 = [lb - le, pb - hb],
        p3 = [lb - ((lb - lf) / 2), pb - hf],
        p4 = [(lb - lf) / 2, pb - hf],
        p5 = [le, pb - hb],
        p6 = [0, pb - hb],
        p7 = [0, pb],
        p8 = [lb, pb];
      const pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;

      const polBase = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polBase.setAttribute("fill", "#999999");
      polBase.setAttribute("id", "des_fundo");
      polBase.setAttribute("points", pathBase);

      // Telhado
      const p1_ = [(lb - lf) / 2, pb - hf],
        p2_ = [le, pb - hb],
        p3_ = [le, pb - ht],
        p4_ = [lb / 2, 1],
        p5_ = [lb - le, pb - ht],
        p6_ = [lb - le, pb - hb],
        p7_ = [lb - ((lb - lf) / 2), pb - hf];
      const pathTelhado = `${p1_.join(",")} ${p2_.join(",")} ${p3_.join(",")} ${p4_.join(",")} ${p5_.join(",")} ${p6_.join(",")} ${p7_.join(",")}`;

      const polTelhado = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polTelhado.setAttribute("fill", "#E6E6E6");
      polTelhado.setAttribute("stroke", "#999999");
      polTelhado.setAttribute("stroke-width", "1.7");
      polTelhado.setAttribute("stroke-linecap", "round");
      polTelhado.setAttribute("stroke-linejoin", "round");
      polTelhado.setAttribute("stroke-miterlimit", "23");
      polTelhado.setAttribute("id", "des_telhado");
      polTelhado.setAttribute("points", pathTelhado);

      svgEl.appendChild(polTelhado);
      svgEl.appendChild(polBase);
    },

    desenhaSensores() {
      if (!this.layoutTopo || !this.layoutTopo[this.arcoAtual]) return;

      const svgEl = document.getElementById("des_arco_armazem");
      const arcoData = this.layoutTopo[this.arcoAtual];
      const sensoresArco = arcoData.sensores || {};

      const escala_sensores = 16;
      const dist_y_sensores = 12;
      const pb = this.dimensoesSVG.altura - 50;
      const posXArco = arcoData.pos_x || 100; // Posição X do arco

      // Desenhar cabo principal do arco
      const xCabo = (this.dimensoesSVG.largura / 2); // Centralizar cabo
      const yInicioCabo = pb + 10;
      const yFinalCabo = 30;

      // Linha do cabo principal
      const linhaCabo = document.createElementNS("http://www.w3.org/2000/svg", "line");
      linhaCabo.setAttribute("x1", xCabo);
      linhaCabo.setAttribute("y1", yInicioCabo);
      linhaCabo.setAttribute("x2", xCabo);
      linhaCabo.setAttribute("y2", yFinalCabo);
      linhaCabo.setAttribute("stroke", "#2c2c2c");
      linhaCabo.setAttribute("stroke-width", "3");
      svgEl.appendChild(linhaCabo);

      // Retângulo do arco
      const rectArco = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rectArco.setAttribute("id", `ARCO${this.arcoAtual}`);
      rectArco.setAttribute("x", xCabo - escala_sensores / 2);
      rectArco.setAttribute("y", pb + 10);
      rectArco.setAttribute("width", escala_sensores);
      rectArco.setAttribute("height", escala_sensores / 2);
      rectArco.setAttribute("rx", "2");
      rectArco.setAttribute("ry", "2");
      rectArco.setAttribute("fill", "#1a5490");
      svgEl.appendChild(rectArco);

      // Texto do arco
      const textArco = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textArco.setAttribute("x", xCabo);
      textArco.setAttribute("y", pb + 10 + escala_sensores / 4);
      textArco.setAttribute("text-anchor", "middle");
      textArco.setAttribute("dominant-baseline", "central");
      textArco.setAttribute("font-weight", "bold");
      textArco.setAttribute("font-size", escala_sensores * 0.4 - 0.5);
      textArco.setAttribute("font-family", "Arial");
      textArco.setAttribute("fill", "white");
      textArco.textContent = `A${this.arcoAtual}`;
      svgEl.appendChild(textArco);

      // Desenhar sensores
      Object.entries(sensoresArco).forEach(([sensorId, posY], index) => {
        const ySensor = pb - 20 - (index * dist_y_sensores * 2); // Espaçamento vertical entre sensores

        // Retângulo do sensor
        const rectSensor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rectSensor.setAttribute("id", `S${sensorId}`);
        rectSensor.setAttribute("x", xCabo - escala_sensores / 2);
        rectSensor.setAttribute("y", ySensor);
        rectSensor.setAttribute("width", escala_sensores);
        rectSensor.setAttribute("height", escala_sensores / 2);
        rectSensor.setAttribute("rx", "2");
        rectSensor.setAttribute("ry", "2");
        rectSensor.setAttribute("fill", "#ccc");
        rectSensor.setAttribute("stroke", "black");
        rectSensor.setAttribute("stroke-width", "1");
        svgEl.appendChild(rectSensor);

        // Texto do valor do sensor
        const textSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textSensor.setAttribute("id", `TS${sensorId}`);
        textSensor.setAttribute("x", xCabo);
        textSensor.setAttribute("y", ySensor + escala_sensores / 4);
        textSensor.setAttribute("text-anchor", "middle");
        textSensor.setAttribute("dominant-baseline", "central");
        textSensor.setAttribute("font-size", escala_sensores * 0.3);
        textSensor.setAttribute("font-family", "Arial");
        textSensor.textContent = "0°C";
        svgEl.appendChild(textSensor);

        // Nome do sensor (ID do pêndulo)
        const textNomeSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textNomeSensor.setAttribute("id", `TIND${sensorId}`);
        textNomeSensor.setAttribute("x", xCabo - escala_sensores / 2 - 5);
        textNomeSensor.setAttribute("y", ySensor + escala_sensores / 4);
        textNomeSensor.setAttribute("text-anchor", "end");
        textNomeSensor.setAttribute("dominant-baseline", "central");
        textNomeSensor.setAttribute("font-size", escala_sensores * 0.35);
        textNomeSensor.setAttribute("font-family", "Arial");
        textNomeSensor.setAttribute("fill", "black");
        textNomeSensor.textContent = `P${sensorId}`;
        svgEl.appendChild(textNomeSensor);

        // Linha conectora do sensor ao cabo principal
        const linhaConectora = document.createElementNS("http://www.w3.org/2000/svg", "line");
        linhaConectora.setAttribute("x1", xCabo);
        linhaConectora.setAttribute("y1", ySensor + escala_sensores / 2);
        linhaConectora.setAttribute("x2", xCabo);
        linhaConectora.setAttribute("y2", pb - 20);
        linhaConectora.setAttribute("stroke", "#666");
        linhaConectora.setAttribute("stroke-width", "1");
        svgEl.appendChild(linhaConectora);
      });
    },

    desenhaMapaCalor() {
      if (!this.layoutTopo || !this.layoutTopo[this.arcoAtual] || !this.dadosLocal) return;

      const svgEl = document.getElementById("des_arco_armazem");
      const arcoData = this.layoutTopo[this.arcoAtual];
      const sensoresArco = arcoData.sensores || {};

      const largura = this.dimensoesSVG.largura;
      const altura = this.dimensoesSVG.altura;
      const resolucao = 80;
      const wCell = largura / resolucao;
      const hCell = altura / resolucao;

      // Coletar sensores e suas posições com dados reais
      const sensores = [];
      const xCabo = largura / 2;
      const pb = altura - 50;

      Object.entries(sensoresArco).forEach(([sensorId, posY], index) => {
        const ySensor = pb - 20 - (index * 24);

        // Buscar dados reais do pêndulo nos arcos
        let temperatura = 25; // valor padrão
        let ativo = true;

        if (this.dadosLocal.arcos) {
          // Buscar nos arcos detalhados
          Object.values(this.dadosLocal.arcos).forEach(arco => {
            if (arco[sensorId]) {
              Object.values(arco[sensorId]).forEach(sensorData => {
                if (sensorData && sensorData[0] !== undefined) {
                  temperatura = sensorData[0];
                  ativo = sensorData[4] !== false;
                }
              });
            }
          });
        } else if (this.dadosLocal.pendulos?.[sensorId]) {
          // Buscar nos pêndulos básicos
          const [falha, pontoQuente, ativoValue, tempMaxima] = this.dadosLocal.pendulos[sensorId];
          temperatura = tempMaxima || 25;
          ativo = ativoValue;
        }

        sensores.push({
          x: xCabo,
          y: ySensor,
          t: temperatura,
          ativo: ativo
        });
      });

      // Função IDW para interpolação
      const idw = (cx, cy) => {
        let somaPesos = 0;
        let somaTemp = 0;
        const power = 2;
        let temSensorAtivo = false;

        sensores.forEach(({ x, y, t, ativo }) => {
          if (!ativo) return;
          temSensorAtivo = true;
          const dist = Math.max(Math.hypot(x - cx, y - cy), 0.0001);
          const peso = 1 / Math.pow(dist, power);
          somaPesos += peso;
          somaTemp += t * peso;
        });

        return temSensorAtivo && somaPesos !== 0 ? somaTemp / somaPesos : null;
      };

      // Gerar grid de blocos
      for (let i = 0; i < resolucao; i++) {
        for (let j = 0; j < resolucao; j++) {
          const cx = i * wCell + wCell / 2;
          const cy = j * hCell + hCell / 2;
          const tempInterpolada = idw(cx, cy);
          const cor = tempInterpolada === null ? "#ffffff" : this.corFaixaExata(tempInterpolada);

          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", i * wCell);
          rect.setAttribute("y", j * hCell);
          rect.setAttribute("width", wCell);
          rect.setAttribute("height", hCell);
          rect.setAttribute("fill", cor);
          rect.setAttribute("opacity", "0.7");
          svgEl.appendChild(rect);
        }
      }
    },

    atualizarSensores() {
      if (!this.dadosLocal || !this.layoutTopo || !this.layoutTopo[this.arcoAtual]) {
        console.log('Dados não disponíveis para atualizar sensores');
        return;
      }

      const sensoresArco = this.layoutTopo[this.arcoAtual].sensores || {};
      console.log('Atualizando sensores do arco:', this.arcoAtual, sensoresArco);

      Object.entries(sensoresArco).forEach(([sensorId, posY]) => {
        const rec = document.getElementById(`S${sensorId}`);
        const txt = document.getElementById(`TS${sensorId}`);
        if (!rec || !txt) {
          console.log(`Elementos não encontrados para sensor ${sensorId}`);
          return;
        }

        let temperatura = 25;
        let falha = false;
        let ativo = true;

        // Buscar dados reais do pêndulo nos arcos detalhados
        if (this.dadosLocal.arcos) {
          Object.values(this.dadosLocal.arcos).forEach(arco => {
            if (arco[sensorId]) {
              Object.values(arco[sensorId]).forEach(sensorData => {
                if (sensorData && Array.isArray(sensorData) && sensorData[0] !== undefined) {
                  temperatura = sensorData[0];
                  falha = sensorData[3] || false;
                  ativo = sensorData[4] !== false;
                }
              });
            }
          });
        } else if (this.dadosLocal.pendulos?.[sensorId]) {
          // Buscar nos pêndulos básicos
          const pendulo = this.dadosLocal.pendulos[sensorId];
          if (Array.isArray(pendulo)) {
            falha = pendulo[0] || false;
            ativo = pendulo[2] !== false;
            temperatura = pendulo[3] || 25;
          }
        }

        txt.textContent = falha ? "ERRO" : `${temperatura.toFixed(1)}°C`;

        if (!ativo) {
          rec.setAttribute("fill", "#e6e6e6");
          txt.setAttribute("fill", "black");
        } else {
          const cor = this.corFaixaExata(temperatura);
          rec.setAttribute("fill", cor);
          txt.setAttribute("fill", cor === "#ff2200" ? "white" : "black");
        }
      });
    },

    trocarModo() {
      this.carregandoModo = true;
      setTimeout(() => {
        this.modo = this.modo === "temperatura" ? "mapa" : "temperatura";
        this.carregandoModo = false;
      }, 600);
    },

    mudarArco(novoArco) {
      if (novoArco >= 1 && novoArco <= this.totalArcos) {
        this.arcoAtual = novoArco;
        this.calcularDimensoesSVG();
      }
    },

    handleArcoSelecionadoTopo(numeroArco) {
      this.mudarArco(numeroArco);
      this.mostrarTopo = false;
    }
  }
};
</script>

<style scoped>
.svg-container {
  width: 100%;
  height: 100%;
}

.card-header {
  padding: 0.75rem 1rem;
}

.card-body {
  padding: 1rem;
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.badge {
  font-size: 0.75em;
}

.btn {
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

@media (max-width: 768px) {
  .container-fluid {
    padding: 0.5rem;
  }

  .fs-4 {
    font-size: 1.25rem !important;
  }

  .d-flex.gap-2 {
    flex-wrap: wrap;
    gap: 0.5rem !important;
  }

  .btn-sm {
    padding: 0.125rem 0.25rem;
    font-size: 0.7rem;
  }
}
</style>
