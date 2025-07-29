<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fas fa-warehouse me-2"></i>
              Visualização Topo do Armazém
            </h5>
            <button class="btn btn-outline-light btn-sm" @click="$emit('fecharTopo')" title="Fechar Topo">
              <i class="fas fa-times"></i> Fechar Topo
            </button>
          </div>
          <div class="card-body">
            <div v-if="carregando" class="d-flex justify-content-center align-items-center" style="height: 750px">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Carregando vista de topo...</span>
              </div>
            </div>
            <div v-else ref="containerRef" class="d-flex justify-content-center" style="min-height: 750px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dadosArmazemPortal from "../dadosArmazem.json";
import LayoutManager from "../utils/layoutManager";

export default {
  name: "TopoArmazem",
  props: {
    arcoAtual: {
      type: Number,
      default: 1
    }
  },
  emits: ['fecharTopo', 'arcoSelecionado'],
  data() {
    return {
      dadosPendulos: null,
      arcoSelecionado: 1,
      celulaSelecionada: 1,
      layoutTopo: null,
      dadosTopo: null,
      carregando: true,
      maxAeradores: 30
    };
  },
  async mounted() {
    await this.processarDados();
    this.criarSVGTopo();
    this.atualizarVisualizacao();
  },
  watch: {
    arcoAtual: {
      handler(novoArco) {
        if (novoArco && novoArco !== this.arcoSelecionado) {
          this.setArcoSelecionado(novoArco);
          if (this.layoutTopo && this.layoutTopo[novoArco]) {
            this.celulaSelecionada = this.layoutTopo[novoArco].celula;
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    async processarDados() {
      try {
        this.carregando = true;

        // Usar dados importados diretamente
        const dadosJSON = dadosArmazemPortal;

        // Analisar estrutura dos arcos usando LayoutManager
        const analise = LayoutManager.analisarEstruturaArcos(dadosJSON);

        const layout = {
          celulas: {
            tamanho_svg: [600, 388],
            fundo: [5, 49, 590, 256],
            1: [5, 50, 188, 254],
            2: [197, 50, 206, 254],
            3: [407, 50, 188, 254]
          },
          aeradores: this.gerarPosicionamentoAeradores(),
        };

        const sensores = {};

        // Calcular distribuição dos arcos para manter dentro do fundo
        const totalArcos = Object.keys(analise.arcos).length;
        // Usar coordenadas exatas do fundo: x=5, largura=590
        const inicioFundo = 5;
        const larguraFundo = 590;
        const margemInterna = 20; // Margem pequena dentro do fundo
        const larguraUtilizavel = larguraFundo - (margemInterna * 2);
        const espacamentoArco = totalArcos > 1 ? larguraUtilizavel / (totalArcos - 1) : 0;

        // Processar arcos baseado na análise IGUAL ao React
        Object.entries(analise.arcos).forEach(([arcoId, arcoInfo]) => {
          const arcoNum = parseInt(arcoId);

          // Determinar célula baseado no número do arco IGUAL ao React
          let celula;
          if (arcoNum <= 6) celula = 1;
          else if (arcoNum <= 13) celula = 2;
          else celula = 3;

          const sensoresDoArco = {};

          // Processar pêndulos deste arco
          arcoInfo.pendulos.forEach((pendulo, index) => {
            const penduloId = pendulo.numero.toString();

            // Buscar dados do sensor/pêndulo nos dados originais
            const dadosSensor = this.buscarDadosSensor(dadosJSON, arcoNum, penduloId);
            if (dadosSensor) {
              // Posicionamento zigzag seguindo o padrão do HTML de referência
              // Baseado na célula onde o arco está localizado e o índice do pêndulo
              let posY;

              // Para arcos ímpares (1, 3, 5, etc.), pêndulos ficam mais no topo
              // Para arcos pares (2, 4, 6, etc.), pêndulos ficam mais embaixo
              if (arcoNum % 2 === 1) {
                // Arcos ímpares: posições mais altas (similar ao HTML: 75, 125, 175, 225, 275)
                const posicoesImpares = [75, 125, 175, 225, 275];
                posY = posicoesImpares[index % posicoesImpares.length];
              } else {
                // Arcos pares: posições mais baixas (similar ao HTML: 100, 150, 200, 250)
                const posicoesPares = [100, 150, 200, 250];
                posY = posicoesPares[index % posicoesPares.length];
              }

              sensoresDoArco[penduloId] = posY;
              sensores[penduloId] = dadosSensor;
            }
          });

          // Calcular posição X do arco para distribuição uniforme dentro do fundo
          const posX = inicioFundo + margemInterna + ((arcoNum - 1) * espacamentoArco);

          layout[arcoNum] = {
            celula: celula,
            pos_x: posX,
            sensores: sensoresDoArco,
          };
        });

        this.dadosPendulos = sensores;
        this.dadosTopo = sensores;
        this.layoutTopo = layout;
      } catch (error) {
        console.error("Erro ao processar dados:", error);

        // Usar layout automático como fallback
        const layoutFallback = this.gerarLayoutAutomatico({
          1: [false, false, true, 25],
        });
        this.layoutTopo = layoutFallback;
      } finally {
        this.carregando = false;
      }
    },

    buscarDadosSensor(dadosJSON, arcoNum, sensorId) {
      // Buscar nos arcos detalhados IGUAL ao React
      if (dadosJSON.arcos && dadosJSON.arcos[arcoNum]) {
        const arcoData = dadosJSON.arcos[arcoNum];
        // Buscar em cada pêndulo do arco
        for (const [penduloNum, sensores] of Object.entries(arcoData)) {
          if (sensores[sensorId]) {
            // Retornar no formato React: [temperatura, false, preAlarme, alarme, ativo]
            const dadosOriginais = sensores[sensorId];
            return [dadosOriginais[0] || 25, false, dadosOriginais[2] || false, dadosOriginais[3] || false, dadosOriginais[4] !== undefined ? dadosOriginais[4] : true];
          }
        }
      }

      // Buscar nos pêndulos básicos IGUAL ao React
      if (dadosJSON.pendulos && dadosJSON.pendulos[sensorId]) {
        const [alarme, preAlarme, ativo, tempMaxima] = dadosJSON.pendulos[sensorId];
        return [tempMaxima || 25, false, preAlarme, alarme, ativo];
      }

      // Valor padrão IGUAL ao React
      return [25, false, false, false, true];
    },

    gerarLayoutAutomatico(pendulos) {
      const totalPendulos = Object.keys(pendulos).length;
      const pendulosPorArco = 3;
      const totalArcos = Math.ceil(totalPendulos / pendulosPorArco);

      const layout = {
        celulas: {
          tamanho_svg: [600, 388],
          fundo: [5, 49, 590, 256],
          1: [10, 50, 188, 254],
          2: [207, 50, 186, 254],
          3: [402, 50, 188, 254],
        },
        aeradores: this.gerarPosicionamentoAeradores(),
      };

      const arcosParaCelula = Math.ceil(totalArcos / 3);
      const pendulosArray = Object.entries(pendulos);
      // Usar coordenadas exatas do fundo para layout automático
      const inicioFundo = 5;
      const larguraFundo = 590;
      const margemInterna = 20;
      const larguraUtilizavel = larguraFundo - (margemInterna * 2);
      const espacamentoArco = totalArcos > 1 ? larguraUtilizavel / (totalArcos - 1) : 0;

      for (let arco = 1; arco <= totalArcos; arco++) {
        let celula;
        if (arco <= arcosParaCelula) celula = 1;
        else if (arco <= arcosParaCelula * 2) celula = 2;
        else celula = 3;

        const pendulosDoArco = pendulosArray.slice(
          (arco - 1) * pendulosPorArco,
          arco * pendulosPorArco,
        );

        const sensores = {};
        pendulosDoArco.forEach(([id], index) => {
          // Posicionamento zigzag seguindo o padrão do HTML de referência
          let posY;

          if (pendulosDoArco.length === 1) {
            // Um pêndulo: posicionar no centro
            posY = 175; // Centro aproximado
          } else {
            // Posicionamento zigzag baseado no número do arco
            if (arco % 2 === 1) {
              // Arcos ímpares: posições mais altas
              const posicoesImpares = [75, 125, 175, 225, 275];
              posY = posicoesImpares[index % posicoesImpares.length];
            } else {
              // Arcos pares: posições mais baixas
              const posicoesPares = [100, 150, 200, 250];
              posY = posicoesPares[index % posicoesPares.length];
            }
          }

          sensores[id] = posY;
        });

        const posX = inicioFundo + margemInterna + ((arco - 1) * espacamentoArco);

        layout[arco] = {
          celula: celula,
          pos_x: posX,
          sensores: sensores,
        };
      }

      return layout;
    },

    gerarPosicionamentoAeradores() {
      // Usar posições fixas do JSON
      return {
        "1": [28, 305, 0],
        "2": [104, 305, 0],
        "3": [165, 305, 0],
        "4": [88, 340, 0],
        "5": [88, 0, 1],
        "6": [224, 305, 0],
        "7": [284, 305, 0],
        "8": [344, 305, 0],
        "9": [284, 340, 0],
        "10": [284, 0, 1],
        "11": [404, 305, 0],
        "12": [464, 305, 0],
        "13": [538, 305, 0],
        "14": [478, 340, 0],
        "15": [478, 0, 1]
      };
    },

    criarSVGTopo() {
      if (!this.layoutTopo || !this.$refs.containerRef) return;

      const container = this.$refs.containerRef;
      const svgExistente = container.querySelector("#des_topo_armazem");
      if (svgExistente) svgExistente.remove();

      const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgEl.setAttribute("id", "des_topo_armazem");
      svgEl.setAttribute("width", "100%");
      svgEl.setAttribute("height", "750px");
      svgEl.setAttribute("viewBox", `0 0 ${this.layoutTopo.celulas.tamanho_svg[0]} ${this.layoutTopo.celulas.tamanho_svg[1]}`);
      svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px; shape-rendering:geometricPrecision; text-rendering:geometricPrecision;");

      container.appendChild(svgEl);

      // Desenhar elementos na ordem correta
      this.desenharFundo();
      this.desenharCelulas();
      this.desenharArcos();
      this.desenharAeradores();

      // Adicionar eventos
      this.adicionarEventosClique();
    },

    desenharFundo() {
      const svgEl = document.getElementById("des_topo_armazem");
      const fundo = this.layoutTopo.celulas.fundo;

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("id", "rec_celula0");
      rect.setAttribute("x", fundo[0]);
      rect.setAttribute("y", fundo[1]);
      rect.setAttribute("width", fundo[2]);
      rect.setAttribute("height", fundo[3]);
      rect.setAttribute("fill", "#D3D3D3");
      rect.setAttribute("stroke", "#999999");
      rect.setAttribute("stroke-width", "2");
      rect.setAttribute("stroke-miterlimit", "23");
      rect.setAttribute("rx", "5");
      rect.setAttribute("ry", "5");

      svgEl.appendChild(rect);
    },

    desenharCelulas() {
      const svgEl = document.getElementById("des_topo_armazem");

      for (let celula = 1; celula <= 3; celula++) {
        const celulaData = this.layoutTopo.celulas[celula.toString()];

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("id", `rec_celula${celula}`);
        rect.setAttribute("x", celulaData[0]);
        rect.setAttribute("y", celulaData[1]);
        rect.setAttribute("width", celulaData[2]);
        rect.setAttribute("height", celulaData[3]);
        rect.setAttribute("fill", "#B3B3B3");
        rect.setAttribute("stroke", "#B3B3B3");
        rect.setAttribute("stroke-width", "2");
        rect.setAttribute("stroke-miterlimit", "23");
        rect.setAttribute("rx", "5");
        rect.setAttribute("ry", "5");
        rect.style.cursor = "pointer";

        svgEl.appendChild(rect);
      }
    },

    desenharArcos() {
      Object.keys(this.layoutTopo).forEach((key) => {
        if (key !== "celulas" && key !== "aeradores") {
          const arcoNum = parseInt(key);
          const arcoData = this.layoutTopo[key];
          this.desenharArco(arcoNum, arcoData);
        }
      });
    },

    desenharArco(idArco, dadosArco) {
      const svgEl = document.getElementById("des_topo_armazem");
      const posX = dadosArco.pos_x;

      // Grupo do arco
      const grupoArco = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupoArco.setAttribute("id", `arco_${idArco}`);
      grupoArco.style.cursor = "pointer";

      // Retângulo de seleção do arco
      const retanguloSelecao = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      retanguloSelecao.setAttribute("id", `rec_arco_${idArco}`);
      retanguloSelecao.setAttribute("x", posX - 8.5);
      retanguloSelecao.setAttribute("y", 49);
      retanguloSelecao.setAttribute("width", 17);
      retanguloSelecao.setAttribute("height", 254);
      retanguloSelecao.setAttribute("fill", "#B3B3B3");

      // Botão superior
      const botaoSup = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      botaoSup.setAttribute("id", `arco${idArco}_botsup`);
      botaoSup.setAttribute("x", posX - 8.5);
      botaoSup.setAttribute("y", 41);
      botaoSup.setAttribute("width", 17);
      botaoSup.setAttribute("height", 17);
      botaoSup.setAttribute("rx", 4.2);
      botaoSup.setAttribute("ry", 4.2);
      botaoSup.setAttribute("fill", "#999999");

      // Texto botão superior
      const textoSup = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textoSup.setAttribute("x", posX);
      textoSup.setAttribute("y", 49.5);
      textoSup.setAttribute("text-anchor", "middle");
      textoSup.setAttribute("dominant-baseline", "central");
      textoSup.setAttribute("font-weight", "bold");
      textoSup.setAttribute("font-size", "10.5");
      textoSup.setAttribute("font-family", "Arial");
      textoSup.setAttribute("fill", "white");
      textoSup.textContent = idArco;

      // Botão inferior
      const botaoInf = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      botaoInf.setAttribute("id", `arco${idArco}_botinf`);
      botaoInf.setAttribute("x", posX - 8.5);
      botaoInf.setAttribute("y", 295);
      botaoInf.setAttribute("width", 17);
      botaoInf.setAttribute("height", 17);
      botaoInf.setAttribute("rx", 4.2);
      botaoInf.setAttribute("ry", 4.2);
      botaoInf.setAttribute("fill", "#999999");

      // Texto botão inferior
      const textoInf = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textoInf.setAttribute("x", posX);
      textoInf.setAttribute("y", 303.5);
      textoInf.setAttribute("text-anchor", "middle");
      textoInf.setAttribute("dominant-baseline", "central");
      textoInf.setAttribute("font-weight", "bold");
      textoInf.setAttribute("font-size", "10.5");
      textoInf.setAttribute("font-family", "Arial");
      textoInf.setAttribute("fill", "white");
      textoInf.textContent = idArco;

      grupoArco.appendChild(retanguloSelecao);
      grupoArco.appendChild(botaoSup);
      grupoArco.appendChild(textoSup);
      grupoArco.appendChild(botaoInf);
      grupoArco.appendChild(textoInf);

      // Desenhar pêndulos (cabos) do arco
      if (dadosArco.sensores) {
        Object.entries(dadosArco.sensores).forEach(([penduloId, posY]) => {
          const cabo = this.desenharCabo(penduloId, posX, posY);
          grupoArco.appendChild(cabo);
        });
      }

      svgEl.appendChild(grupoArco);
    },

    desenharCabo(idCabo, posX, posY) {
      const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupo.setAttribute("id", `cabo_${idCabo}`);
      grupo.style.cursor = "pointer";

      // Círculo de ponto quente (oculto inicialmente) - deve vir primeiro para ficar atrás
      const circuloPQ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circuloPQ.setAttribute("id", `pq_cabo_${idCabo}`);
      circuloPQ.setAttribute("cx", posX);
      circuloPQ.setAttribute("cy", posY);
      circuloPQ.setAttribute("r", 13);
      circuloPQ.setAttribute("fill", "red");
      circuloPQ.setAttribute("visibility", "hidden");

      // Animação do ponto quente
      const animacao = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      animacao.setAttribute("attributeName", "r");
      animacao.setAttribute("begin", "0s");
      animacao.setAttribute("dur", "1s");
      animacao.setAttribute("from", "13");
      animacao.setAttribute("to", "8");
      animacao.setAttribute("repeatCount", "indefinite");
      circuloPQ.appendChild(animacao);

      // Círculo do cabo
      const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circulo.setAttribute("id", `c_cabo_${idCabo}`);
      circulo.setAttribute("cx", posX);
      circulo.setAttribute("cy", posY);
      circulo.setAttribute("r", 9);
      circulo.setAttribute("fill", "white");

      // Texto do cabo
      const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texto.setAttribute("id", `t_cabo_${idCabo}`);
      texto.setAttribute("x", posX);
      texto.setAttribute("y", posY);
      texto.setAttribute("text-anchor", "middle");
      texto.setAttribute("dominant-baseline", "central");
      texto.setAttribute("font-weight", "bold");
      texto.setAttribute("font-size", "7.75");
      texto.setAttribute("font-family", "Arial");
      texto.textContent = `P${idCabo}`;

      // Círculo de falha (oculto inicialmente)
      const circuloFalha = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circuloFalha.setAttribute("id", `f_cabo_${idCabo}`);
      circuloFalha.setAttribute("cx", posX);
      circuloFalha.setAttribute("cy", posY);
      circuloFalha.setAttribute("r", 11);
      circuloFalha.setAttribute("fill", "red");
      circuloFalha.setAttribute("fill-opacity", "0.6");
      circuloFalha.setAttribute("visibility", "hidden");

      // Ordem dos elementos: ponto quente, círculo, texto, falha
      grupo.appendChild(circuloPQ);
      grupo.appendChild(circulo);
      grupo.appendChild(texto);
      grupo.appendChild(circuloFalha);

      return grupo;
    },

    desenharAeradores() {
      Object.entries(this.layoutTopo.aeradores).forEach(([id, dados]) => {
        const [posX, posY, textoAcima] = dados;
        this.desenharAerador(parseInt(id), posX, posY, textoAcima);
      });
    },

    desenharAerador(idAerador, posX, posY, textoAcima) {
      const svgEl = document.getElementById("des_topo_armazem");

      // Criar grupo principal do aerador
      const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupo.setAttribute("id", `aerador_${idAerador}`);

      // Criar grupos para blade parada e girando
      const grupoBladePrado = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupoBladePrado.setAttribute("id", `blade_aerador_${idAerador}_parado`);

      const grupBladeGirando = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupBladeGirando.setAttribute("id", `blade_aerador_${idAerador}_girando`);

      // Retângulo do nome
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", 25);
      rect.setAttribute("height", 10);
      rect.setAttribute("rx", 6.4);
      rect.setAttribute("ry", 5);
      rect.setAttribute("fill", "#3A78FD");

      // Posicionar texto acima ou abaixo
      if (textoAcima === 1) {
        rect.setAttribute("x", 70 + 3.5);
        rect.setAttribute("y", 2);
      } else {
        rect.setAttribute("x", 70 + 3.5);
        rect.setAttribute("y", 36);
      }

      // Texto do nome
      const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texto.setAttribute("text-anchor", "middle");
      texto.setAttribute("dominant-baseline", "central");
      texto.setAttribute("font-weight", "bold");
      texto.setAttribute("font-size", "6.5");
      texto.setAttribute("font-family", "Arial");
      texto.setAttribute("fill", "white");
      texto.textContent = `AE-${idAerador}`;

      // Posicionar texto acima ou abaixo dos aeradores
      if (textoAcima === 1) {
        texto.setAttribute("x", 70 + 12.5 + 3.5);
        texto.setAttribute("y", 0 + 7);
      } else {
        texto.setAttribute("x", 70 + 12.5 + 3.5);
        texto.setAttribute("y", 0 + 5 + 36);
      }

      // Círculo principal
      const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circulo.setAttribute("id", `fundo_aerador_${idAerador}`);
      circulo.setAttribute("cx", 70 + 12.5 + 3.5);
      circulo.setAttribute("cy", 0 + 24);
      circulo.setAttribute("r", 10.5);
      circulo.setAttribute("fill", "#c5c5c5");

      // Definir path da blade (ajustado para ser centrado no círculo)
      const dBlade = "M86.35 14.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 -0.0599,-0.1627 -0.0927,-0.3386 -0.0927,-0.5221 0,-0.1159 0.0131,-0.2287 0.0378,-0.3371 -2.7913,-0.5199 -5.9807,-0.6695 -6.4392,-2.7909 -0.0128,-1.1872 0.2692,-1.9342 1.3353,-3.2209 1.8235,3.4167 3.7637,4.2185 5.4165,5.3813 0.1852,-0.2222 0.433,-0.3903 0.7163,-0.4775 -0.9455,-2.6773 -2.4105,-5.5141 -0.8027,-6.9719 1.0218,-0.6046 1.8097,-0.734 3.4571,-0.454 -2.0471,3.2874 -1.7715,5.3685 -1.9521,7.3812 0.2952,0.0506 0.5612,0.1868 0.7714,0.3822 1.8461,-2.1575 3.5703,-4.845 5.6368,-4.1814 1.0345,0.5826 1.5405,1.2002 2.1218,2.7669 -3.8705,-0.1291 -5.535,1.15 -7.3682,2 0.0599,0.1627 0.0927,0.3386 0.0927,0.5221z";

      // Blade parada
      const bladeParada = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bladeParada.setAttribute("d", dBlade);
      bladeParada.setAttribute("fill", "white");

      // Blade girando
      const bladeGirando = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bladeGirando.setAttribute("d", dBlade);
      bladeGirando.setAttribute("fill", "white");

      // Animação da blade girando (centrada no círculo)
      const animacao = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
      animacao.setAttribute("attributeName", "transform");
      animacao.setAttribute("type", "rotate");
      animacao.setAttribute("dur", "2s");
      animacao.setAttribute("values", "0 89.0 12; 360 89.0 12;");
      animacao.setAttribute("repeatCount", "indefinite");

      // Montar estrutura
      grupoBladePrado.appendChild(bladeParada);
      grupBladeGirando.appendChild(bladeGirando);
      grupBladeGirando.appendChild(animacao);

      grupo.appendChild(circulo);
      grupo.appendChild(rect);
      grupo.appendChild(texto);
      grupo.appendChild(grupoBladePrado);
      grupo.appendChild(grupBladeGirando);

      svgEl.appendChild(grupo);

      // Posicionar o aerador usando transform
      grupo.setAttribute("transform", `translate(${posX - 70}, ${posY})`);
    },

    atualizarVisualizacao() {
      if (!this.dadosTopo || !this.layoutTopo) return;

      // Atualizar seleções
      this.atualizarSelecoes();

      // Atualizar cabos com dados reais
      this.atualizarCabos();

      // Atualizar aeradores (estados fixos para demonstração)
      this.atualizarAeradores();
    },

    atualizarSelecoes() {
      // Primeiro: atualizar arcos baseado na célula selecionada (seguindo modelo React)
      Object.keys(this.layoutTopo).forEach((key) => {
        if (key !== "celulas" && key !== "aeradores") {
          const arcoNum = parseInt(key);
          const arcoRect = document.getElementById(`rec_arco_${arcoNum}`);

          if (arcoRect) {
            // Se o arco pertence à célula selecionada
            if (this.layoutTopo[key].celula === this.celulaSelecionada) {
              arcoRect.setAttribute("fill", "#E6E6E6");
            } else {
              arcoRect.setAttribute("fill", "#B3B3B3");
            }
          }
        }
      });

      // Segundo: destacar o arco selecionado especificamente
      const arcoSelecionadoRect = document.getElementById(`rec_arco_${this.arcoSelecionado}`);
      if (arcoSelecionadoRect) {
        arcoSelecionadoRect.setAttribute("fill", "#438AF6");
      }

      // Terceiro: atualizar botões dos arcos
      Object.keys(this.layoutTopo).forEach((key) => {
        if (key !== "celulas" && key !== "aeradores") {
          const arcoNum = parseInt(key);
          const botaoSup = document.getElementById(`arco${arcoNum}_botsup`);
          const botaoInf = document.getElementById(`arco${arcoNum}_botinf`);

          if (botaoSup && botaoInf) {
            const cor = arcoNum === this.arcoSelecionado ? "#33CC33" : "#999999";
            botaoSup.setAttribute("fill", cor);
            botaoInf.setAttribute("fill", cor);
          }
        }
      });

      // Quarto: atualizar células
      for (let celula = 1; celula <= 3; celula++) {
        const elemento = document.getElementById(`rec_celula${celula}`);
        if (elemento) {
          if (celula === this.celulaSelecionada) {
            elemento.setAttribute("fill", "#E6E6E6");
            elemento.setAttribute("stroke", "#438AF6");
          } else {
            elemento.setAttribute("fill", "#B3B3B3");
            elemento.setAttribute("stroke", "#B3B3B3");
          }
        }
      }
    },

    atualizarCabos() {
      Object.entries(this.dadosTopo).forEach(([idCabo, dados]) => {
        // Verificar se dados está no formato correto IGUAL ao React
        let temperatura, falha, pontoQuente, nivel;

        if (Array.isArray(dados)) {
          if (dados.length === 4) {
            // Formato antigo: [falha, pontoQuente, nivel, temperatura]
            [falha, pontoQuente, nivel, temperatura] = dados;
          } else if (dados.length === 5) {
            // Formato novo: [temperatura, false, preAlarme, alarme, ativo]
            [temperatura, , pontoQuente, falha, nivel] = dados;
          }
        } else {
          // Se não for array, usar valores padrão
          temperatura = 0;
          falha = false;
          pontoQuente = false;
          nivel = true;
        }

        const circulo = document.getElementById(`c_cabo_${idCabo}`);
        const texto = document.getElementById(`t_cabo_${idCabo}`);
        const falhaEl = document.getElementById(`f_cabo_${idCabo}`);
        const pontoQuenteEl = document.getElementById(`pq_cabo_${idCabo}`);

        if (circulo && texto) {
          let cor, corTexto;
          let opacidade = "1";
          let opacidadeTexto = "1";

          // Aplicar lógica de cores baseada na temperatura IGUAL ao React
          if (temperatura === 0 || temperatura === null || temperatura === undefined) {
            // Temperatura 0 ou inválida - cinza
            cor = "#c7c7c7";
            corTexto = "black";
          } else {
            // Usar função de cores para temperaturas normais IGUAL ao React
            const [corFundo, corFonte] = this.corTemperatura(parseFloat(temperatura));
            cor = corFundo;
            corTexto = corFonte;
          }

          // Se cabo estiver fora do nível, aplicar regra especial IGUAL ao React
          if (!nivel) {
            cor = "#c7c7c7";
            corTexto = "black";
            opacidade = "0.78";
            opacidadeTexto = "0.4";
          }

          circulo.setAttribute("fill", cor);
          circulo.setAttribute("fill-opacity", opacidade);
          texto.setAttribute("fill", corTexto);
          texto.setAttribute("fill-opacity", opacidadeTexto);

          // Controlar animações IGUAL ao React
          if (falhaEl) {
            falhaEl.style.visibility = falha ? "visible" : "hidden";
          }

          if (pontoQuenteEl) {
            pontoQuenteEl.style.visibility = pontoQuente && !falha ? "visible" : "hidden";
          }
        }
      });
    },

    atualizarAeradores() {
      const numAeradores = Object.keys(this.layoutTopo.aeradores).length;
      // Estados dos aeradores (seguindo padrão do modelo React)
      const estadosAeradores = [1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      for (let aeradorId = 1; aeradorId <= numAeradores; aeradorId++) {
        const estado = estadosAeradores[aeradorId - 1] || 0;
        this.setarEstadoAerador(aeradorId, estado);
      }
    },

    setarEstadoAerador(aeradorId, estado) {
      const fundo = document.getElementById(`fundo_aerador_${aeradorId}`);
      const bladePrado = document.getElementById(`blade_aerador_${aeradorId}_parado`);
      const bladeGirando = document.getElementById(`blade_aerador_${aeradorId}_girando`);

      if (!fundo || !bladePrado || !bladeGirando) return;

      let cor;
      let visParado, visGirando;

      switch (estado) {
        case 0: // desligado
          cor = "#c5c5c5";
          visParado = "visible";
          visGirando = "hidden";
          break;
        case 1: // ligado
          cor = "#31dd0f";
          visParado = "hidden";
          visGirando = "visible";
          break;
        case 2: // falha
          cor = "#ff0000";
          visParado = "visible";
          visGirando = "hidden";
          break;
        default:
          cor = "#c5c5c5";
          visParado = "visible";
          visGirando = "hidden";
      }

      fundo.setAttribute("fill", cor);
      bladePrado.style.visibility = visParado;
      bladeGirando.style.visibility = visGirando;
    },

    // Função de cores EXATAMENTE igual ao React
    corTemperatura(temp) {
      if (temp < 12) return ["#0384fc", "white"];
      else if (temp < 15) return ["#03e8fc", "black"];
      else if (temp < 17) return ["#03fcbe", "black"];
      else if (temp < 21) return ["#07fc03", "black"];
      else if (temp < 25) return ["#c3ff00", "black"];
      else if (temp < 27) return ["#fcf803", "black"];
      else if (temp < 30) return ["#ffb300", "black"];
      else if (temp < 35) return ["#ff2200", "white"];
      else if (temp < 50) return ["#ff0090", "white"];
      else return ["#f700ff", "white"];
    },

    adicionarEventosClique() {
      const svgEl = document.getElementById("des_topo_armazem");
      if (!svgEl) return;

      svgEl.addEventListener("click", (evento) => {
        const elemento = evento.target;
        const grupo = elemento.parentElement;

        if (grupo && grupo.id) {
          const [tipo, numero] = grupo.id.split("_");

          if (tipo === "arco") {
            const novoArco = parseInt(numero);
            this.setArcoSelecionado(novoArco);
            if (this.layoutTopo && this.layoutTopo[novoArco]) {
              this.celulaSelecionada = this.layoutTopo[novoArco].celula;
            }
            this.$emit('arcoSelecionado', novoArco);
          } else if (tipo === "cabo") {
            const caboNum = parseInt(numero);
            Object.entries(this.layoutTopo).forEach(([arcoKey, arcoData]) => {
              if (arcoKey !== "celulas" && arcoKey !== "aeradores") {
                if (arcoData.sensores && arcoData.sensores[caboNum]) {
                  const novoArco = parseInt(arcoKey);
                  this.setArcoSelecionado(novoArco);
                  this.celulaSelecionada = arcoData.celula;
                  this.$emit('arcoSelecionado', novoArco);
                }
              }
            });
          }
        }

        // Clique em células
        if (elemento.id && elemento.id.startsWith("rec_celula")) {
          const numeroCelula = parseInt(elemento.id.replace("rec_celula", ""));
          if (numeroCelula > 0) {
            this.celulaSelecionada = numeroCelula;
            this.atualizarVisualizacao();
          }
        }
      });
    },

    setArcoSelecionado(novoArco) {
      this.arcoSelecionado = novoArco;
      this.atualizarVisualizacao();
    }
  }
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-outline-light {
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}
</style>