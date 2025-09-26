<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div v-if="carregando" class="d-flex justify-content-center align-items-center" style="height: 750px">
              <div class="spinner-border" role="status">
                <span class="visually-hidden"></span>
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
import axios from 'axios';

export default {
  name: "TopoArmazem",
  props: {
    arcoAtual: {
      type: Number,
      default: 1
    },
    onArcoSelecionado: {
      type: Function,
      default: null
    },
    onFecharTopo: {
      type: Function,
      default: null
    }
  },
  emits: ['fecharTopo', 'arcoSelecionado'],
  data() {
    return {
      dadosPendulos: null,
      dadosAPI: null,
      arcoSelecionado: 1,
      celulaSelecionada: 1,
      layoutTopo: null,
      dadosTopo: null,
      carregando: true,
      larguraSVG: 800,
      alturaSVG: 400,
      apiConfig: {
        url: 'https://cloud.pce-eng.com.br/cloud/api/public/api/armazem/buscardado/130?celula=1&leitura=4&data=2025-08-04%2007:02:22',
        get token() {
          const token = localStorage.getItem('token') || ''
          return token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : 'Bearer [TOKEN_REQUIRED]'
        }
      }
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

        console.log('=== CARREGANDO DADOS DA API PARA TOPO ===');

        // Obter token dinâmico do localStorage
        const token = localStorage.getItem('token') || ''
        const authToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''

        if (!authToken || authToken === 'Bearer ') {
          throw new Error('Token de autenticação não encontrado no localStorage')
        }

        // Carregar dados da API
        const response = await axios.get(this.apiConfig.url, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        this.dadosAPI = response.data;
        console.log('Dados API recebidos:', JSON.stringify(response.data, null, 2));

        // Processar pêndulos da API
        const pendulosProcessados = this.processarPendulosAPI(response.data);

        // Processar layout_topo da API
        const layoutProcessado = this.processarLayoutTopoAPI(response.data);

        // Processar sequência de células
        const celulasProcessadas = this.processarSequenciaCelulas(response.data);

        console.log('Pêndulos processados:', pendulosProcessados);
        console.log('Layout processado:', layoutProcessado);
        console.log('Células processadas:', celulasProcessadas);

        this.dadosPendulos = pendulosProcessados;
        this.dadosTopo = pendulosProcessados;
        this.layoutTopo = layoutProcessado;

        // Calcular dimensões baseadas nos dados reais
        this.calcularDimensoesDinamicas(layoutProcessado);

      } catch (error) {
        console.error("Erro ao processar dados:", error);
        // Usar dados de fallback em caso de erro
        this.criarDadosFallback();
      } finally {
        this.carregando = false;
      }
    },

    processarPendulosAPI(dadosAPI) {
      console.log('=== PROCESSANDO PÊNDULOS DA API ===');

      const pendulos = {};

      // Primeiro, processar pêndulos básicos se existirem
      if (dadosAPI.pendulos) {
        Object.entries(dadosAPI.pendulos).forEach(([penduloId, dados]) => {
          // dados = [falha, ponto_quente, ativo, temperatura_maxima]
          const [falha, pontoQuente, ativo, temperatura] = dados;

          pendulos[penduloId] = [
            temperatura || 0,    // temperatura para cor
            false,              // campo adicional
            pontoQuente || false, // ponto quente
            falha || false,     // falha
            ativo !== false     // ativo
          ];
        });
      }

      // Sobrescrever/complementar com dados detalhados dos arcos
      if (dadosAPI.arcos) {
        Object.entries(dadosAPI.arcos).forEach(([arcoId, pendulos_arco]) => {
          Object.entries(pendulos_arco).forEach(([penduloId, sensores]) => {
            // Calcular temperatura média dos sensores para cor do pêndulo
            let temperaturaMedia = 0;
            let totalSensores = 0;
            let temFalha = false;
            let temPontoQuente = false;
            let ativo = false;

            Object.entries(sensores).forEach(([sensorId, dadosSensor]) => {
              if (Array.isArray(dadosSensor) && dadosSensor.length >= 5) {
                const [temp, pq, preAlarme, falha, nivel] = dadosSensor;

                if (nivel) { // Só considerar sensores ativos
                  temperaturaMedia += parseFloat(temp) || 0;
                  totalSensores++;
                  ativo = true;
                }

                if (falha) temFalha = true;
                if (pq) temPontoQuente = true;
              }
            });

            temperaturaMedia = totalSensores > 0 ? temperaturaMedia / totalSensores : 0;

            pendulos[penduloId] = [
              temperaturaMedia,   // temperatura média para cor
              false,             // campo adicional  
              temPontoQuente,    // ponto quente
              temFalha,          // falha
              ativo              // ativo
            ];
          });
        });
      }

      console.log('Pêndulos processados final:', pendulos);
      return pendulos;
    },

    processarLayoutTopoAPI(dadosAPI) {
      console.log('=== PROCESSANDO LAYOUT TOPO DA API ===');

      // Se existe layout_topo na configuração, usar ele
      if (dadosAPI.configuracao?.layout_topo) {
        console.log('Usando layout_topo da configuração');
        return this.adaptarLayoutTopoExistente(dadosAPI.configuracao.layout_topo);
      }

      // Senão, gerar layout automático baseado nos dados
      console.log('Gerando layout automático');
      return this.gerarLayoutAutomaticoAPI(dadosAPI);
    },

    adaptarLayoutTopoExistente(layoutTopo) {
      const layout = {
        celulas: layoutTopo.celulas || {
          tamanho_svg: [800, 388],
          fundo: [5, 49, 790, 256],
          1: [10, 50, 260, 254],
          2: [275, 50, 260, 254],
          3: [540, 50, 250, 254]
        },
        aeradores: layoutTopo.aeradores || this.gerarAeradoresDefault()
      };

      // Processar pêndulos do layout
      Object.entries(layoutTopo).forEach(([key, dados]) => {
        if (key === 'celulas' || key === 'aeradores') return;

        const penduloId = parseInt(key);
        if (!isNaN(penduloId) && dados.celula && dados.pos_x) {
          layout[penduloId] = {
            celula: dados.celula,
            pos_x: dados.pos_x,
            sensores: dados.sensores || {}
          };
        }
      });

      return layout;
    },

    gerarLayoutAutomaticoAPI(dadosAPI) {
      console.log('Gerando layout automático baseado na API');

      const pendulos = Object.keys(dadosAPI.pendulos || {});
      const totalPendulos = pendulos.length;

      // Determinar número de células automaticamente
      const numeroCelulas = Math.min(3, Math.max(1, Math.ceil(totalPendulos / 20)));

      // Dimensões dinâmicas
      const larguraSVG = Math.max(600, totalPendulos * 12 + 100);
      const alturaSVG = 388;

      const layout = {
        celulas: {
          tamanho_svg: [larguraSVG, alturaSVG],
          fundo: [5, 49, larguraSVG - 10, 256]
        },
        aeradores: this.gerarAeradoresDefault()
      };

      // Configurar células dinamicamente
      const larguraPorCelula = Math.floor((larguraSVG - 10) / numeroCelulas);
      for (let i = 1; i <= numeroCelulas; i++) {
        const xInicio = 5 + (i - 1) * larguraPorCelula;
        const largura = i === numeroCelulas ? (larguraSVG - 10) - xInicio : larguraPorCelula - 3;
        layout.celulas[i] = [xInicio, 50, largura, 254];
      }

      // Distribuir pêndulos pelas células
      const pendulosPorCelula = Math.ceil(totalPendulos / numeroCelulas);
      const margemInterna = 10;
      const larguraUtilizavel = larguraSVG - 20;
      const espacamentoPendulo = totalPendulos > 1 ? larguraUtilizavel / (totalPendulos - 1) : 0;

      pendulos.forEach((penduloId, index) => {
        const penduloNum = parseInt(penduloId);
        const celula = Math.min(numeroCelulas, Math.ceil((index + 1) / pendulosPorCelula));
        const posX = 10 + (index * espacamentoPendulo);

        // Posição Y em padrão zigzag
        let posY;
        if (index % 2 === 0) {
          posY = 75 + (index % 4) * 50;
        } else {
          posY = 100 + (index % 4) * 50;
        }
        posY = Math.max(75, Math.min(275, posY));

        layout[penduloNum] = {
          celula: celula,
          pos_x: posX,
          sensores: {
            [penduloId]: posY
          }
        };
      });

      // Atualizar dimensões do componente
      this.larguraSVG = larguraSVG;
      this.alturaSVG = alturaSVG;

      return layout;
    },

    processarSequenciaCelulas(dadosAPI) {
      if (dadosAPI.configuracao?.sequencia_celulas) {
        return dadosAPI.configuracao.sequencia_celulas;
      }
      return null;
    },

    gerarAeradoresDefault() {
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

    calcularDimensoesDinamicas(layout) {
      if (layout?.celulas?.tamanho_svg) {
        this.larguraSVG = layout.celulas.tamanho_svg[0];
        this.alturaSVG = layout.celulas.tamanho_svg[1];
      }
    },

    criarDadosFallback() {
      console.log('Criando dados de fallback');

      this.dadosPendulos = {
        "1": [25, false, false, false, true],
        "2": [23, false, false, false, true],
        "3": [27, false, false, false, true]
      };

      this.layoutTopo = {
        celulas: {
          tamanho_svg: [600, 388],
          fundo: [5, 49, 590, 256],
          1: [10, 50, 188, 254],
          2: [207, 50, 186, 254],
          3: [402, 50, 188, 254]
        },
        aeradores: this.gerarAeradoresDefault(),
        1: {
          celula: 1,
          pos_x: 30,
          sensores: { "1": 175 }
        },
        2: {
          celula: 1,
          pos_x: 60,
          sensores: { "2": 175 }
        },
        3: {
          celula: 1,
          pos_x: 90,
          sensores: { "3": 175 }
        }
      };

      this.dadosTopo = this.dadosPendulos;
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
      svgEl.setAttribute("viewBox", `0 0 ${this.larguraSVG} ${this.alturaSVG}`);
      svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px; shape-rendering:geometricPrecision; text-rendering:geometricPrecision;");

      container.appendChild(svgEl);

      // Desenhar elementos na ordem correta
      this.desenharFundo();
      this.desenharCelulas();
      this.desenharPendulos();
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

      // Determinar número real de células baseado nos dados
      const celulasNumericas = Object.keys(this.layoutTopo.celulas)
        .filter(key => !isNaN(parseInt(key)))
        .map(key => parseInt(key))
        .sort((a, b) => a - b);

      celulasNumericas.forEach(celula => {
        const celulaData = this.layoutTopo.celulas[celula.toString()];
        if (!celulaData) return;

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
      });
    },

    desenharPendulos() {
      Object.keys(this.layoutTopo).forEach((key) => {
        if (key !== "celulas" && key !== "aeradores") {
          const penduloNum = parseInt(key);
          const penduloData = this.layoutTopo[key];
          this.desenharPendulo(penduloNum, penduloData);
        }
      });
    },

    desenharPendulo(idPendulo, dadosPendulo) {
      const svgEl = document.getElementById("des_topo_armazem");
      const posX = dadosPendulo.pos_x;

      // Desenhar arco (retângulo de seleção e botões)
      this.desenharArco(idPendulo, dadosPendulo);

      // Desenhar cada sensor do pêndulo
      Object.entries(dadosPendulo.sensores || {}).forEach(([sensorId, posY]) => {
        const cabo = this.desenharCabo(sensorId, posX, posY);
        svgEl.appendChild(cabo);
      });
    },

    desenharArco(idArco, dadosArco) {
      const svgEl = document.getElementById("des_topo_armazem");
      const posX = dadosArco.pos_x;

      // Criar grupo do arco
      const grupoArco = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupoArco.setAttribute("id", `arco_${idArco}`);
      grupoArco.style.cursor = "pointer";

      // Retângulo de seleção do arco
      const rectSelecao = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rectSelecao.setAttribute("id", `rec_arco_${idArco}`);
      rectSelecao.setAttribute("x", posX - 8.5);
      rectSelecao.setAttribute("y", 49);
      rectSelecao.setAttribute("width", 17);
      rectSelecao.setAttribute("height", 254);
      rectSelecao.setAttribute("fill", "#B3B3B3");
      // rectSelecao.setAttribute("stroke", "#B3B3B3");
      rectSelecao.setAttribute("stroke-width", "1");

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

      // Texto do botão superior
      const textoSup = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textoSup.setAttribute("x", posX);
      textoSup.setAttribute("y", 41 + 8.5);
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

      // Texto do botão inferior
      const textoInf = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textoInf.setAttribute("x", posX);
      textoInf.setAttribute("y", 295 + 8.5);
      textoInf.setAttribute("text-anchor", "middle");
      textoInf.setAttribute("dominant-baseline", "central");
      textoInf.setAttribute("font-weight", "bold");
      textoInf.setAttribute("font-size", "10.5");
      textoInf.setAttribute("font-family", "Arial");
      textoInf.setAttribute("fill", "white");
      textoInf.textContent = idArco;

      // Montar grupo
      grupoArco.appendChild(rectSelecao);
      grupoArco.appendChild(botaoSup);
      grupoArco.appendChild(textoSup);
      grupoArco.appendChild(botaoInf);
      grupoArco.appendChild(textoInf);

      svgEl.appendChild(grupoArco);
    },

    desenharCabo(idCabo, posX, posY) {
      const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grupo.setAttribute("id", `cabo_${idCabo}`);
      grupo.style.cursor = "pointer";

      // Círculo de ponto quente (oculto inicialmente)
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
      texto.textContent = `C${idCabo}`;

      // Círculo de falha (oculto inicialmente)
      const circuloFalha = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circuloFalha.setAttribute("id", `f_cabo_${idCabo}`);
      circuloFalha.setAttribute("cx", posX);
      circuloFalha.setAttribute("cy", posY);
      circuloFalha.setAttribute("r", 11);
      circuloFalha.setAttribute("fill", "red");
      circuloFalha.setAttribute("fill-opacity", "0.6");
      circuloFalha.setAttribute("visibility", "hidden");

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

      // Path da blade
      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 -0.0599,-0.1627 -0.0927,-0.3386 -0.0927,-0.5221 0,-0.1159 0.0131,-0.2287 0.0378,-0.3371 -2.7913,-0.5199 -5.9807,-0.6695 -6.4392,-2.7909 -0.0128,-1.1872 0.2692,-1.9342 1.3353,-3.2209 1.8235,3.4167 3.7637,4.2185 5.4165,5.3813 0.1852,-0.2222 0.433,-0.3903 0.7163,-0.4775 -0.9455,-2.6773 -2.4105,-5.5141 -0.8027,-6.9719 1.0218,-0.6046 1.8097,-0.734 3.4571,-0.454 -2.0471,3.2874 -1.7715,5.3685 -1.9521,7.3812 0.2952,0.0506 0.5612,0.1868 0.7714,0.3822 1.8461,-2.1575 3.5703,-4.845 5.6368,-4.1814 1.0345,0.5826 1.5405,1.2002 2.1218,2.7669 -3.8705,-0.1291 -5.535,1.15 -7.3682,2 0.0599,0.1627 0.0927,0.3386 0.0927,0.5221z";

      // Blade parada
      const bladeParada = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bladeParada.setAttribute("d", dBlade);
      bladeParada.setAttribute("fill", "white");

      // Blade girando
      const bladeGirando = document.createElementNS("http://www.w3.org/2000/svg", "path"); bladeGirando.setAttribute("d", dBlade);
      bladeGirando.setAttribute("fill", "white");

      // Animação da blade girando
      const animacao = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
      animacao.setAttribute("attributeName", "transform");
      animacao.setAttribute("type", "rotate");
      animacao.setAttribute("dur", "2s");
      animacao.setAttribute("values", "0 86.35 24.05; 360 86.35 24.05;");
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
      // Primeiro: atualizar arcos baseado na célula selecionada
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
      const celulasNumericas = Object.keys(this.layoutTopo.celulas)
        .filter(key => !isNaN(parseInt(key)))
        .map(key => parseInt(key));

      celulasNumericas.forEach(celula => {
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
      });
    },

    atualizarCabos() {
      Object.entries(this.dadosTopo).forEach(([idCabo, dados]) => {
        // dados = [temperatura, false, ponto_quente, falha, ativo]
        let temperatura, falha, pontoQuente, ativo;

        if (Array.isArray(dados) && dados.length >= 5) {
          [temperatura, , pontoQuente, falha, ativo] = dados;
        } else {
          // Fallback para formato antigo
          temperatura = 0;
          falha = false;
          pontoQuente = false;
          ativo = true;
        }

        const circulo = document.getElementById(`c_cabo_${idCabo}`);
        const texto = document.getElementById(`t_cabo_${idCabo}`);
        const falhaEl = document.getElementById(`f_cabo_${idCabo}`);
        const pontoQuenteEl = document.getElementById(`pq_cabo_${idCabo}`);

        if (circulo && texto) {
          let cor, corTexto;
          let opacidade = "1";
          let opacidadeTexto = "1";

          // Aplicar lógica de cores baseada na temperatura
          if (temperatura === 0 || temperatura === null || temperatura === undefined) {
            cor = "#c7c7c7";
            corTexto = "black";
          } else {
            const [corFundo, corFonte] = this.corTemperatura(parseFloat(temperatura));
            cor = corFundo;
            corTexto = corFonte;
          }

          // Se cabo estiver inativo
          if (!ativo) {
            cor = "#c7c7c7";
            corTexto = "black";
            opacidade = "0.78";
            opacidadeTexto = "0.4";
          }

          circulo.setAttribute("fill", cor);
          circulo.setAttribute("fill-opacity", opacidade);
          texto.setAttribute("fill", corTexto);
          texto.setAttribute("fill-opacity", opacidadeTexto);

          // Controlar animações
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
      const aeradorIds = Object.keys(this.layoutTopo.aeradores).map(id => parseInt(id)).sort((a, b) => a - b);

      // Estados dos aeradores baseados no AER da API ou padrão
      let estadosAeradores = [];

      if (this.dadosAPI?.AER) {
        const valoresAER = this.dadosAPI.AER.split(',').map(v => parseInt(v.trim()));
        estadosAeradores = valoresAER.map(valor => {
          if (valor > 0) return 1; // ligado
          else return 0; // desligado
        });
      } else {
        // Estados padrão
        estadosAeradores = [1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }

      aeradorIds.forEach((aeradorId, index) => {
        const estado = estadosAeradores[index] || 0;
        this.setarEstadoAerador(aeradorId, estado);
      });
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

    // Função de cores igual ao React
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
            this.arcoSelecionado = novoArco;
            if (this.layoutTopo && this.layoutTopo[novoArco]) {
              this.celulaSelecionada = this.layoutTopo[novoArco].celula;
            }
            // Usar prop function se disponível, senão emitir evento
            if (this.onArcoSelecionado) {
              this.onArcoSelecionado(novoArco);
            } else {
              this.$emit('arcoSelecionado', novoArco);
            }
            this.atualizarVisualizacao();
          } else if (tipo === "cabo") {
            // Encontrar qual arco pertence este cabo
            const caboNum = parseInt(numero);
            Object.entries(this.layoutTopo).forEach(([arcoKey, arcoData]) => {
              if (arcoKey !== "celulas" && arcoKey !== "aeradores") {
                if (arcoData.sensores && arcoData.sensores[caboNum]) {
                  const novoArco = parseInt(arcoKey);
                  this.arcoSelecionado = novoArco;
                  this.celulaSelecionada = arcoData.celula;
                  // Usar prop function se disponível, senão emitir evento
                  if (this.onArcoSelecionado) {
                    this.onArcoSelecionado(novoArco);
                  } else {
                    this.$emit('arcoSelecionado', novoArco);
                  }
                  this.atualizarVisualizacao();
                }
              }
            });
          }
        }

        // Clique em células
        if (elemento.id && elemento.id.startsWith("rec_celula")) {
          const numeroCelula = parseInt(elemento.id.replace("rec_celula", ""));
          if (numeroCelula > 0 && numeroCelula !== this.celulaSelecionada) {
            this.celulaSelecionada = numeroCelula;
            this.atualizarVisualizacao();
          }
        }
      });
    },

    setArcoSelecionado(novoArco) {
      if (novoArco !== this.arcoSelecionado) {
        this.arcoSelecionado = novoArco;
        this.atualizarVisualizacao();
      }
    },

    // Método para receber dados externos do componente pai
    receberDadosExternos(dadosPortal, analiseArcos, layoutsAutomaticos) {
      if (dadosPortal && analiseArcos) {
        console.log('Recebendo dados externos para TopoArmazem:', {
          dadosPortal: dadosPortal,
          analiseArcos: analiseArcos,
          layoutsAutomaticos: layoutsAutomaticos
        });

        // Usar dados do componente pai em vez de carregar da API
        this.dadosAPI = dadosPortal;
        
        // Processar dados usando a estrutura já analisada
        const pendulosProcessados = this.processarPendulosAPI(dadosPortal);
        const layoutProcessado = this.processarLayoutTopoExistente(layoutsAutomaticos, analiseArcos);

        this.dadosPendulos = pendulosProcessados;
        this.dadosTopo = pendulosProcessados;
        this.layoutTopo = layoutProcessado;

        // Calcular dimensões baseadas nos dados reais
        this.calcularDimensoesDinamicas(layoutProcessado);

        // Re-renderizar
        this.carregando = false;
        this.$nextTick(() => {
          this.criarSVGTopo();
          this.atualizarVisualizacao();
        });
      }
    },

    processarLayoutTopoExistente(layoutsAutomaticos, analiseArcos) {
      // Se já existe um layout automático, adaptar para visão topo
      if (layoutsAutomaticos && analiseArcos) {
        const layout = {
          celulas: {
            tamanho_svg: [this.larguraSVG, this.alturaSVG],
            fundo: [5, 49, this.larguraSVG - 10, 256]
          },
          aeradores: this.gerarAeradoresDefault()
        };

        // Configurar células dinamicamente baseado no número de arcos
        const totalArcos = analiseArcos.totalArcos;
        const numeroCelulas = Math.min(3, Math.max(1, Math.ceil(totalArcos / 10)));
        const larguraPorCelula = Math.floor((this.larguraSVG - 10) / numeroCelulas);

        for (let i = 1; i <= numeroCelulas; i++) {
          const xInicio = 5 + (i - 1) * larguraPorCelula;
          const largura = i === numeroCelulas ? (this.larguraSVG - 10) - xInicio : larguraPorCelula - 3;
          layout.celulas[i] = [xInicio, 50, largura, 254];
        }

        // Distribuir pêndulos/arcos pelas células usando dados da análise
        let contadorPendulo = 0;
        Object.entries(analiseArcos.arcos).forEach(([numeroArco, arcoInfo]) => {
          const arcoNum = parseInt(numeroArco);
          const celula = Math.min(numeroCelulas, Math.ceil(arcoNum / Math.ceil(totalArcos / numeroCelulas)));
          
          arcoInfo.pendulos.forEach((pendulo, index) => {
            contadorPendulo++;
            const posX = 20 + (contadorPendulo - 1) * 25;
            let posY = 75 + (contadorPendulo % 4) * 50;
            posY = Math.max(75, Math.min(275, posY));

            layout[pendulo.numero] = {
              celula: celula,
              pos_x: posX,
              sensores: {
                [pendulo.numero]: posY
              }
            };
          });
        });

        return layout;
      }

      // Fallback para layout padrão
      return this.layoutTopo || {
        celulas: {
          tamanho_svg: [600, 388],
          fundo: [5, 49, 590, 256],
          1: [10, 50, 188, 254],
          2: [207, 50, 186, 254],
          3: [402, 50, 188, 254]
        },
        aeradores: this.gerarAeradoresDefault()
      };
    },

    fecharTopo() {
      // Usar prop function se disponível, senão emitir evento
      if (this.onFecharTopo) {
        this.onFecharTopo();
      } else {
        this.$emit('fecharTopo');
      }
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

#des_topo_armazem {
  width: 100%;
  height: auto;
  max-height: 85vh;
  min-height: 350px;
}
</style>