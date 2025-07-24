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

        <TopoArmazem v-else-if="mostrarTopo" :arcoAtual="arcoAtual" @arcoSelecionado="handleArcoSelecionadoTopo"
          @fecharTopo="mostrarTopo = false" />

        <div v-else class="svg-container mb-1 mb-md-2"
          style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 220px); max-height: calc(100vh - 160px); overflow: auto;">
          <div ref="containerRef" class="d-flex justify-content-center" style="height: 70vh; min-height: 350px;" />
        </div>

        <div v-if="analiseArcos" class="row mb-3">
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">Controle de Arcos - Configuração Automática</h6>
              </div>
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <label class="form-label">Arco Atual:</label>
                    <div class="d-flex gap-2 align-items-center">
                      <button class="btn btn-outline-primary btn-sm" @click="mudarArco(Math.max(1, arcoAtual - 1))"
                        :disabled="arcoAtual <= 1">← Anterior</button>
                      <select class="form-select" v-model.number="arcoAtual" @change="mudarArco(arcoAtual)">
                        <option v-for="(arco, numeroArco) in analiseArcos.arcos" :key="numeroArco"
                          :value="parseInt(numeroArco)">
                          Arco {{ numeroArco }} - {{ arco.totalPendulos }} pêndulos, {{ arco.totalSensores }} sensores
                        </option>
                      </select>
                      <button class="btn btn-outline-primary btn-sm"
                        @click="mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1))"
                        :disabled="arcoAtual >= analiseArcos.totalArcos">Próximo →</button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-2 border rounded bg-light">
                      <small class="fw-bold">Estrutura do Arco {{ arcoAtual }}:</small>
                      <div class="mt-2">
                        <span v-for="pendulo in analiseArcos.arcos[arcoAtual]?.pendulos" :key="pendulo.numero"
                          class="badge bg-primary me-1 mb-1">P{{ pendulo.numero }}: {{ pendulo.totalSensores }}
                          sensores</span>
                      </div>
                      <hr class="my-2" />
                      <small class="text-muted">
                        <strong>Total Geral:</strong><br />
                        • {{ analiseArcos.totalArcos }} arcos<br />
                        • {{ analiseArcos.estatisticas.totalPendulos }} pêndulos<br />
                        • {{ analiseArcos.estatisticas.totalSensores }} sensores
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
import LayoutManager from "../utils/layoutManager";
import TopoArmazem from "./TopoArmazem.vue";

export default {
  name: "ArmazemSVG",
  props: {
    dados: Object,
  },
  components: { TopoArmazem },
  data() {
    return {
      modo: "temperatura",
      carregandoModo: false,
      dadosLocal: null,
      dadosPortal: null,
      arcoAtual: 1,
      analiseArcos: null,
      layoutsAutomaticos: null,
      mostrarTopo: false,
      dimensoesSVG: { largura: 350, altura: 200 },
    };
  },
  mounted() {
    this.inicializarDados();
  },
  watch: {
    dadosLocal() {
      this.renderizarSVG();
    },
    modo() {
      this.renderizarSVG();
    },
    arcoAtual() {
      this.renderizarSVG();
    },
    layoutsAutomaticos() {
      this.renderizarSVG();
    },
  },
  methods: {
    async inicializarDados() {
      try {
        const response = await fetch("/models/modeloRotaArmazemPortal_1751897945212.json");
        const dadosArmazemPortal = await response.json();
        this.dadosPortal = dadosArmazemPortal;
        this.analiseArcos = LayoutManager.analisarEstruturaArcos(dadosArmazemPortal);
        this.layoutsAutomaticos = LayoutManager.gerarLayoutAutomatico(this.analiseArcos);
        this.dimensoesSVG = this.calcularDimensoesIdeais(this.analiseArcos);
        this.dadosLocal = LayoutManager.converterDadosPortalParaArmazem(dadosArmazemPortal, 1);
      } catch (error) {
        console.error("Erro ao inicializar dados:", error);
      }
    },
    renderizarSVG() {
      if (!this.dadosLocal) return;
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

      this.desenhaFundo();
      if (this.modo === "temperatura") {
        this.desenhaSensores();
        this.atualizarSensores(this.dadosLocal);
      } else {
        this.desenhaMapaCalor();
      }
    },
    calcularDimensoesIdeais(analiseArcos) {
      if (!analiseArcos) return { largura: 350, altura: 200 };
      let maxSensores = 0;
      let maxPendulos = 0;
      Object.values(analiseArcos.arcos).forEach(arco => {
        maxPendulos = Math.max(maxPendulos, arco.totalPendulos);
        arco.pendulos.forEach(pendulo => {
          maxSensores = Math.max(maxSensores, pendulo.totalSensores);
        });
      });
      const escala_sensores = 16;
      const dist_y_sensores = 12;
      const margemSuperior = 30;
      const margemInferior = 50;
      const margemPendulo = 20;
      const alturaBaseTelhado = 185;
      const alturaSensores = maxSensores * dist_y_sensores + escala_sensores;
      const alturaTotal = Math.max(
        alturaBaseTelhado,
        margemSuperior + alturaSensores + margemInferior + margemPendulo
      );
      const larguraMinima = 350;
      const espacamentoPendulo = 50;
      const larguraCalculada = Math.max(larguraMinima, maxPendulos * espacamentoPendulo + 100);
      return {
        largura: larguraCalculada,
        altura: Math.max(alturaTotal, 250),
      };
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
      if (!this.layoutsAutomaticos || !this.analiseArcos) return;

      const svgEl = document.getElementById("des_arco_armazem");
      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`];

      if (!layoutArco) return;

      const arcoInfo = this.analiseArcos.arcos[this.arcoAtual];
      if (!arcoInfo) return;

      const escala_sensores = 16;
      const dist_y_sensores = 12;
      const pb = this.dimensoesSVG.altura - 50;
      const yPendulo = pb + 15;

      arcoInfo.pendulos.forEach((pendulo, index) => {
        const xCabo = layoutArco.desenho_sensores.pos_x_cabo[index];
        const numSensores = pendulo.totalSensores;

        // Retângulo do nome do pêndulo
        const rectPendulo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rectPendulo.setAttribute("id", `C${index + 1}`);
        rectPendulo.setAttribute("x", xCabo - escala_sensores / 2);
        rectPendulo.setAttribute("y", yPendulo);
        rectPendulo.setAttribute("width", escala_sensores);
        rectPendulo.setAttribute("height", escala_sensores / 2);
        rectPendulo.setAttribute("rx", "2");
        rectPendulo.setAttribute("ry", "2");
        rectPendulo.setAttribute("fill", "#3A78FD");
        svgEl.appendChild(rectPendulo);

        // Texto do nome do pêndulo
        const textPendulo = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textPendulo.setAttribute("id", `TC${index + 1}`);
        textPendulo.setAttribute("x", xCabo);
        textPendulo.setAttribute("y", yPendulo + escala_sensores / 4);
        textPendulo.setAttribute("text-anchor", "middle");
        textPendulo.setAttribute("dominant-baseline", "central");
        textPendulo.setAttribute("font-weight", "bold");
        textPendulo.setAttribute("font-size", escala_sensores * 0.4 - 0.5);
        textPendulo.setAttribute("font-family", "Arial");
        textPendulo.setAttribute("fill", "white");
        textPendulo.textContent = `P${pendulo.numero}`;
        svgEl.appendChild(textPendulo);

        // Sensores - ajustar posicionamento para ficar dentro do SVG
        for (let s = 1; s <= numSensores; s++) {
          const ySensor = yPendulo - dist_y_sensores * s - 25;

          // Garantir que o sensor está dentro dos limites do SVG
          if (ySensor > 10 && ySensor < (this.dimensoesSVG.altura - 60)) {
            // Retângulo do sensor
            const rectSensor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectSensor.setAttribute("id", `C${index + 1}S${s}`);
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
            textSensor.setAttribute("id", `TC${index + 1}S${s}`);
            textSensor.setAttribute("x", xCabo);
            textSensor.setAttribute("y", ySensor + escala_sensores / 4);
            textSensor.setAttribute("text-anchor", "middle");
            textSensor.setAttribute("dominant-baseline", "central");
            textSensor.setAttribute("font-size", escala_sensores * 0.4 - 0.5);
            textSensor.setAttribute("font-family", "Arial");
            textSensor.textContent = "0";
            svgEl.appendChild(textSensor);

            // Nome do sensor
            const textNomeSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textNomeSensor.setAttribute("id", `TIND${index + 1}S${s}`);
            textNomeSensor.setAttribute("x", xCabo - escala_sensores / 2 - 2);
            textNomeSensor.setAttribute("y", ySensor + escala_sensores / 4);
            textNomeSensor.setAttribute("text-anchor", "end");
            textNomeSensor.setAttribute("dominant-baseline", "central");
            textNomeSensor.setAttribute("font-size", escala_sensores * 0.4 - 1.5);
            textNomeSensor.setAttribute("font-family", "Arial");
            textNomeSensor.setAttribute("fill", "black");
            textNomeSensor.textContent = `S${s}`;
            svgEl.appendChild(textNomeSensor);
          }
        }
      });
    },

    desenhaMapaCalor() {
      if (!this.layoutsAutomaticos || !this.analiseArcos || !this.dadosLocal) return;

      const svgEl = document.getElementById("des_arco_armazem");
      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`];
      const arcoInfo = this.analiseArcos.arcos[this.arcoAtual];

      if (!layoutArco || !arcoInfo) return;

      const largura = this.dimensoesSVG.largura, altura = this.dimensoesSVG.altura;
      const resolucao = 160;
      const wCell = largura / resolucao;
      const hCell = altura / resolucao;

      // Coletar sensores e suas posições
      const sensores = [];
      Object.entries(this.dadosLocal.leitura).forEach(([pendulo, sensoresData], penduloIndex) => {
        const xCabo = layoutArco.desenho_sensores.pos_x_cabo[penduloIndex];
        const yCabo = this.dimensoesSVG.altura - 50 + 15;
        Object.entries(sensoresData).forEach(([sensorKey, dadosSensor]) => {
          const s = parseInt(sensorKey);
          const [temp, , , , ativo] = dadosSensor;
          const ySensor = yCabo - 12 * s - 12;

          sensores.push({
            x: xCabo,
            y: ySensor,
            t: parseFloat(temp) || -1000,
            ativo: ativo === true
          });
        });
      });

      // Função IDW para interpolação
      function idw(cx, cy) {
        let somaPesos = 0;
        let somaTemp = 0;
        const power = 2;
        let temSensorAtivo = false;

        sensores.forEach(({ x, y, t, ativo }) => {
          if (t === -1000 || !ativo) return;
          temSensorAtivo = true;
          const dist = Math.max(Math.hypot(x - cx, y - cy), 0.0001);
          const peso = 1 / Math.pow(dist, power);
          somaPesos += peso;
          somaTemp += t * peso;
        });

        return temSensorAtivo && somaPesos !== 0 ? somaTemp / somaPesos : null;
      }

      // Gerar grid de blocos
      const blocos = [];
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
          blocos.push(rect);
        }
      }

      // Definir clip path para formato do armazém
      const lb = this.dimensoesSVG.largura;
      const pb = this.dimensoesSVG.altura - 50;
      const lf = Math.min(250, lb * 0.7);
      const le = 15, hb = 30, hf = 5, ht = 50;
      const p1 = [(lb - lf) / 2, pb - hf],
        p2 = [le, pb - hb],
        p3 = [le, pb - ht],
        p4 = [lb / 2, 1],
        p5 = [lb - le, pb - ht],
        p6 = [lb - le, pb - hb],
        p7 = [lb - (lb - lf) / 2, pb - hf];
      const pathD = `M ${p1.join(",")} L ${p2.join(",")} L ${p3.join(",")} L ${p4.join(",")} L ${p5.join(",")} L ${p6.join(",")} L ${p7.join(",")} Z`;

      // Criar elementos de filtro e clip
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "blurFilter");
      const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      blur.setAttribute("stdDeviation", "0.4");
      filter.appendChild(blur);
      defs.appendChild(filter);

      const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipPath.setAttribute("id", "clipArmazem");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathD);
      clipPath.appendChild(path);
      defs.appendChild(clipPath);

      svgEl.appendChild(defs);

      // Adicionar blocos com filtros
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("filter", "url(#blurFilter)");
      g.setAttribute("clip-path", "url(#clipArmazem)");
      blocos.forEach((bloco) => g.appendChild(bloco));
      svgEl.appendChild(g);
    },
    atualizarSensores(dadosArco) {
      if (!dadosArco?.leitura || !this.analiseArcos) return;

      Object.entries(dadosArco.leitura).forEach(([idCabo, sensores], penduloIndex) => {
        Object.entries(sensores).forEach(([s, [temp, , , falha, nivel]]) => {
          const rec = document.getElementById(`C${penduloIndex + 1}S${s}`);
          const txt = document.getElementById(`TC${penduloIndex + 1}S${s}`);
          if (!rec || !txt) return;

          txt.textContent = falha ? "ERRO" : temp.toFixed(1);
          if (!nivel) {
            rec.setAttribute("fill", "#e6e6e6");
            txt.setAttribute("fill", "black");
          } else {
            const cor = this.corFaixaExata(temp);
            rec.setAttribute("fill", cor);
            txt.setAttribute("fill", cor === "#ff2200" ? "white" : "black");
          }
        });
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
      this.arcoAtual = novoArco;
      if (this.dadosPortal) {
        this.dadosLocal = LayoutManager.converterDadosPortalParaArmazem(this.dadosPortal, novoArco);
      }
    },
    handleArcoSelecionadoTopo(numeroArco) {
      this.mudarArco(numeroArco);
      this.mostrarTopo = false;
    },
  },
};
</script>
