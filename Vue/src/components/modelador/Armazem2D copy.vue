
<template>
  <div class="container-fluid p-1 p-md-2" style="min-height: 100vh; overflow: auto;">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-1 mb-md-2 fs-4 fs-md-1">Armazém - Monitoramento de Temperatura</h1>

        <div v-if="carregandoModo" class="d-flex justify-content-center m-2">
          <div class="spinner-border" role="status">
            <span class="visually-hidden"></span>
          </div>
        </div>

        <TopoArmazem v-else-if="mostrarTopo" 
          :onArcoSelecionado="handleArcoSelecionadoTopo"
          :arcoAtual="arcoAtual"
          :onFecharTopo="() => mostrarTopo = false" />

        <div v-else class="svg-container mb-1 mb-md-2"
          style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 220px); max-height: calc(100vh - 160px); overflow: auto;">
          <div ref="containerRef" class="d-flex justify-content-center" style="height: 70vh; min-height: 350px;" />
        </div>

        <!-- Controles de Navegação entre Arcos -->
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
                      <button 
                        class="btn btn-outline-primary btn-sm"
                        @click="mudarArco(Math.max(1, arcoAtual - 1))"
                        :disabled="arcoAtual <= 1"
                      >
                        ← Anterior
                      </button>
                      <select 
                        class="form-select"
                        v-model.number="arcoAtual"
                        @change="mudarArco(arcoAtual)"
                      >
                        <option v-for="numeroArco in Object.keys(analiseArcos.arcos)" :key="numeroArco" :value="parseInt(numeroArco)">
                          Arco {{ numeroArco }} - {{ analiseArcos.arcos[numeroArco].totalPendulos }} pêndulos, {{ analiseArcos.arcos[numeroArco].totalSensores }} sensores
                        </option>
                      </select>
                      <button 
                        class="btn btn-outline-primary btn-sm"
                        @click="mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1))"
                        :disabled="arcoAtual >= analiseArcos.totalArcos"
                      >
                        Próximo →
                      </button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-2 border rounded bg-light">
                      <small class="fw-bold">Estrutura do Arco {{ arcoAtual }}:</small>
                      <div class="mt-2">
                        <span v-for="pendulo in analiseArcos.arcos[arcoAtual]?.pendulos || []" 
                              :key="pendulo.numero" 
                              class="badge text-white bg-primary me-1 mb-1">
                          P{{ pendulo.numero }}: {{ pendulo.totalSensores }} sensores
                        </span>
                      </div>
                      <hr class="my-2" />
                      <small class="text-muted">
                        <strong>Total Geral:</strong><br/>
                        • {{ analiseArcos.totalArcos }} arcos<br/>
                        • {{ analiseArcos.estatisticas.totalPendulos }} pêndulos<br/>
                        • {{ analiseArcos.estatisticas.totalSensores }} sensores
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seletor de Configurações do Armazém -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-info text-white">
                <h6 class="mb-0">⚙️ Configurações Salvas do Armazém</h6>
              </div>
              <div class="card-body">
                <div class="row align-items-end">
                  <div class="col-md-8 mb-2">
                    <label class="form-label">Selecionar Configuração:</label>
                    <select class="form-select" v-model="configuracaoSelecionada" @change="aplicarConfiguracao">
                      <option value="">Configuração Padrão</option>
                      <option v-for="config in configuracoesDisponiveis" :key="config" :value="config">
                        {{ config }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-4 mb-2">
                    <button 
                      class="btn btn-outline-primary w-100" 
                      @click="abrirModelador"
                      title="Abrir modelador para criar/editar configurações"
                    >
                      🛠️ Modelador
                    </button>
                  </div>
                </div>
                <div v-if="configuracoesDisponiveis.length === 0" class="alert alert-info mb-0">
                  <small>Nenhuma configuração de armazém salva. Use o Modelador para criar configurações personalizadas.</small>
                </div>
                <div v-else class="mt-2">
                  <small class="text-muted">{{ configuracoesDisponiveis.length }} configuração(ões) de armazém disponível(is)</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center py-2">
          <button class="btn btn-primary" @click="trocarModo">
            {{ modo === 'temperatura' ? 'Ver Mapa de Calor' : 'Ver Temperatura' }}
          </button>
          <button 
            class="btn ms-2" 
            :class="mostrarTopo ? 'btn-success' : 'btn-outline-info'"
            @click="mostrarTopo = !mostrarTopo"
          >
            {{ mostrarTopo ? 'Fechar Topo' : 'Vista de Topo' }}
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="alert alert-danger mt-3">
          <h6>Erro ao carregar dados:</h6>
          <p>{{ error }}</p>
          <button class="btn btn-outline-danger btn-sm" @click="carregarDadosAPI">
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopoArmazem from "./TopoArmazem.vue";
import LayoutManager from "./utils/layoutManager"
import axios from 'axios';

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
      dadosPortal: null,
      arcoAtual: 1,
      analiseArcos: null,
      layoutsAutomaticos: null,
      mostrarTopo: false,
      dimensoesSVG: { largura: 350, altura: 200 },
      error: null,
      apiConfig: {
        url: 'https://cloud.pce-eng.com.br/cloud/api/public/api/armazem/buscardado/130?celula=1&leitura=1&data=2025-08-13%2008:03:47',
        token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0L2Nsb3VkL2FwaS9wdWJsaWMvYXBpL2xvZ2luIiwiaWF0IjoxNzU4NTM3NzYwLCJleHAiOjE3NTg1NjY1NjAsIm5iZiI6MTc1ODUzNzc2MCwianRpIjoiUkFCeEpWdTRUemxVSnRkVCIsInN1YiI6IjEzIiwicHJ2IjoiNTg3MDg2M2Q0YTYyZDc5MTQ0M2ZhZjkzNmZjMzY4MDMxZDExMGM0ZiIsInVzZXIiOnsiaWRfdXN1YXJpbyI6MTMsIm5tX3VzdWFyaW8iOiJJdmFuIEphY3F1ZXMiLCJlbWFpbCI6Iml2YW4uc2lsdmFAcGNlLWVuZy5jb20uYnIiLCJ0ZWxlZm9uZSI6bnVsbCwiY2VsdWxhciI6bnVsbCwic3RfdXN1YXJpbyI6IkEiLCJpZF9pbWFnZW0iOjM4LCJsb2dhZG8iOiJTIiwidXN1YXJpb3NfcGVyZmlzIjpbeyJpZF9wZXJmaWwiOjEwLCJubV9wZXJmaWwiOiJBZG1pbmlzdHJhZG9yIGRvIFBvcnRhbCIsImNkX3BlcmZpbCI6IkFETUlOUE9SVEEiLCJ0cmFuc2Fjb2VzIjpbXX1dLCJpbWFnZW0iOnsiaWRfaW1hZ2VtIjozOCwidHBfaW1hZ2VtIjoiVSIsImRzX2ltYWdlbSI6bnVsbCwiY2FtaW5obyI6InVwbG9hZHMvdXN1YXJpb3MvMTcyOTc3MjA3OV9yYl80NzA3LnBuZyIsImV4dGVuc2FvIjoicG5nIn19fQ.kc6uQctEdY26347l6-hhniyLGEkhM_tO3Cj1e92RZtE'
      },
      configuracaoSelecionada: '',
      configuracoesDisponiveis: [],
      configuracaoAplicada: null
    };
  },
  async mounted() {
    await this.carregarDadosAPI();
    this.carregarConfiguracoesDisponiveis();
  },
  watch: {
    dadosLocal: {
      handler() {
        this.$nextTick(() => {
          this.renderizarSVG();
        });
      },
      deep: true
    },
    modo: {
      handler(novoModo) {
        this.$nextTick(() => {
          this.renderizarSVG();
        });
      },
      immediate: false
    },
    arcoAtual() {
      this.$nextTick(() => {
        this.renderizarSVG();
      });
    },
    layoutsAutomaticos() {
      this.$nextTick(() => {
        this.renderizarSVG();
      });
    }
  },
  methods: {
    async carregarDadosAPI() {
      try {
        this.carregandoModo = true;
        this.error = null;

        const response = await axios.get(this.apiConfig.url, {
          headers: {
            'Authorization': this.apiConfig.token,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        if (!response.data) {
          throw new Error('Resposta da API vazia');
        }
       
        // Armazenar dados originais da API
        this.dadosPortal = response.data;

        // Analisar estrutura dos arcos baseada na nova estrutura da API
        const analise = this.analisarEstruturaArcos(response.data);
        this.analiseArcos = analise;
        
        // Gerar layouts automáticos
        const layouts = LayoutManager.gerarLayoutAutomatico(analise);
        this.layoutsAutomaticos = layouts;
        
        // Calcular dimensões ideais
        const dimensoes = this.calcularDimensoesIdeais(analise);
        this.dimensoesSVG = dimensoes;

        // Converter dados para formato de renderização
        const dadosConvertidos = this.converterDadosParaRenderizacao(response.data, 1);
        this.dadosLocal = dadosConvertidos;
        
        // Forçar renderização inicial
        this.$nextTick(() => {
          this.renderizarSVG();
        });

      } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
        this.error = this.tratarErroAPI(error);
      } finally {
        this.carregandoModo = false;
      }
    },

    // Analisar estrutura dos arcos baseada na nova estrutura da API
    analisarEstruturaArcos(dados) {
      
      if (!dados.arcos) {
        return this.criarEstruturaMinima();
      }

      const estrutura = {
        totalArcos: 0,
        arcos: {},
        estatisticas: {
          totalPendulos: 0,
          totalSensores: 0
        }
      };

      // Processar cada arco
      Object.keys(dados.arcos).forEach(numeroArco => {
        const dadosArco = dados.arcos[numeroArco];
        const arcoNum = parseInt(numeroArco);
        
        estrutura.totalArcos = Math.max(estrutura.totalArcos, arcoNum);
        
        const infoArco = {
          numero: arcoNum,
          totalPendulos: 0,
          totalSensores: 0,
          pendulos: []
        };

        // Processar cada pêndulo no arco
        Object.keys(dadosArco).forEach(numeroPendulo => {
          const dadosPendulo = dadosArco[numeroPendulo];
          const penduloNum = parseInt(numeroPendulo);
          
          const infoPendulo = {
            numero: penduloNum,
            totalSensores: Object.keys(dadosPendulo).length
          };

          infoArco.pendulos.push(infoPendulo);
          infoArco.totalPendulos++;
          infoArco.totalSensores += infoPendulo.totalSensores;
        });

        // Ordenar pêndulos por número
        infoArco.pendulos.sort((a, b) => a.numero - b.numero);
        
        estrutura.arcos[arcoNum] = infoArco;
        estrutura.estatisticas.totalPendulos += infoArco.totalPendulos;
        estrutura.estatisticas.totalSensores += infoArco.totalSensores;
      });

      return estrutura;
    },

    // Converter dados da API para formato de renderização
    converterDadosParaRenderizacao(dadosAPI, numeroArco) {
      
      if (!dadosAPI.arcos || !dadosAPI.arcos[numeroArco]) {
        return { leitura: {} };
      }

      const dadosArco = dadosAPI.arcos[numeroArco];
      const leituraConvertida = {};

      // Converter estrutura: arcos[numeroArco][pendulo][sensor] -> leitura[pendulo][sensor]
      Object.keys(dadosArco).forEach(numeroPendulo => {
        const sensoresPendulo = dadosArco[numeroPendulo];
        leituraConvertida[numeroPendulo] = {};

        Object.keys(sensoresPendulo).forEach(numeroSensor => {
          const dadosSensor = sensoresPendulo[numeroSensor];
          // Manter o formato original do sensor: [temp, pontoQuente, preAlarme, falha, nivel]
          leituraConvertida[numeroPendulo][numeroSensor] = dadosSensor;
        });
      });

      const resultado = {
        leitura: leituraConvertida,
        arcoAtual: numeroArco,
        timestamp: new Date().toISOString()
      };

      return resultado;
    },

    criarEstruturaMinima() {
      return {
        totalArcos: 1,
        arcos: {
          1: {
            numero: 1,
            totalPendulos: 1,
            totalSensores: 1,
            pendulos: [{ numero: 1, totalSensores: 1 }]
          }
        },
        estatisticas: {
          totalPendulos: 1,
          totalSensores: 1
        }
      };
    },

    tratarErroAPI(error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return 'Token de autenticação inválido ou expirado. Verifique as credenciais.';
          case 403:
            return 'Acesso negado. Verifique as permissões do token.';
          case 404:
            return 'Endpoint da API não encontrado. Verifique a URL.';
          case 500:
            return 'Erro interno do servidor. Tente novamente mais tarde.';
          default:
            return `Erro HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        return 'Erro de conectividade. Verifique sua conexão com a internet.';
      } else {
        return error.message || 'Erro desconhecido ao carregar dados.';
      }
    },

    // Calcular dimensões ideais do SVG baseado na análise de todos os arcos
    calcularDimensoesIdeais(analiseArcos) {
      if (!analiseArcos) return { largura: 350, altura: 200 };

      let maxSensores = 0;
      let maxPendulos = 0;

      // Encontrar o máximo de sensores e pêndulos em todos os arcos
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
      const larguraCalculada = Math.max(larguraMinima, (maxPendulos * espacamentoPendulo) + 100);

      return {
        largura: larguraCalculada,
        altura: Math.max(alturaTotal, 250)
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

    renderizarSVG() {
           
      if (!this.dadosLocal) {
        console.log('Sem dados locais, abortando renderização');
        return;
      }

      const container = this.$refs.containerRef;
      if (!container) {
        console.log('Container não encontrado, abortando renderização');
        return;
      }

      // Limpar completamente o container
      container.innerHTML = '';

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

      // Desenhar fundo sempre
      this.desenhaFundo();
      
      // Desenhar conteúdo baseado no modo
      if (this.modo === "temperatura") {
        this.desenhaSensores();
        this.atualizarSensores(this.dadosLocal);
      } else if (this.modo === "mapa") {
        this.desenhaMapaCalor();
      }
      
    },

    desenhaFundo() {
      const svgEl = document.getElementById("des_arco_armazem");
      
      // Usar configuração aplicada se disponível, senão usar valores padrão
      const config = this.configuracaoAplicada || {}
      
      const pb = (config.pb || this.dimensoesSVG.altura - 50) + (this.dimensoesSVG.altura < 300 ? 0 : 50);
      const lb = config.lb || this.dimensoesSVG.largura;
      const hb = config.hb || 30;
      const hf = config.hf || 5;
      const lf = config.lf || Math.min(250, lb * 0.7);
      const le = config.le || 15;
      const ht = config.ht || 50;

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

      // Renderizar telhado baseado na configuração
      this.renderTelhadoComConfiguracao(svgEl, pb, lb, hb, hf, lf, le, ht, config);
      
      svgEl.appendChild(polBase);
    },

    renderTelhadoComConfiguracao(svgEl, pb, lb, hb, hf, lf, le, ht, config) {
      const tipo_telhado = config.tipo_telhado || 1;
      const curvatura_topo = config.curvatura_topo || 30;
      
      let pathTelhado = '';
      let elementTelhado;
      
      if (tipo_telhado === 1) {
        // Telhado pontudo
        const p1_ = [(lb - lf) / 2, pb - hf];
        const p2_ = [le, pb - hb];
        const p3_ = [le, pb - ht];
        const p4_ = [lb / 2, 1];
        const p5_ = [lb - le, pb - ht];
        const p6_ = [lb - le, pb - hb];
        const p7_ = [lb - ((lb - lf) / 2), pb - hf];
        pathTelhado = `${p1_.join(",")} ${p2_.join(",")} ${p3_.join(",")} ${p4_.join(",")} ${p5_.join(",")} ${p6_.join(",")} ${p7_.join(",")}`;
        
        elementTelhado = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        elementTelhado.setAttribute("points", pathTelhado);
      } else if (tipo_telhado === 2) {
        // Telhado arredondado
        pathTelhado = `
          M ${(lb - lf) / 2} ${pb - hf}
          L ${le} ${pb - hb}
          L ${le} ${pb - ht}
          Q ${lb / 2} ${1 - curvatura_topo} ${lb - le} ${pb - ht}
          L ${lb - le} ${pb - hb}
          L ${lb - (lb - lf) / 2} ${pb - hf}
          Z
        `;
        
        elementTelhado = document.createElementNS("http://www.w3.org/2000/svg", "path");
        elementTelhado.setAttribute("d", pathTelhado);
      } else if (tipo_telhado === 3) {
        // Telhado em arco
        pathTelhado = `
          M ${(lb - lf) / 2} ${pb - hf}
          L ${le} ${pb - hb}
          L ${le} ${pb - ht}
          A ${(lb - le * 2) / 2} ${curvatura_topo} 0 0 1 ${lb - le} ${pb - ht}
          L ${lb - le} ${pb - hb}
          L ${lb - (lb - lf) / 2} ${pb - hf}
          Z
        `;
        
        elementTelhado = document.createElementNS("http://www.w3.org/2000/svg", "path");
        elementTelhado.setAttribute("d", pathTelhado);
      }
      
      if (elementTelhado) {
        elementTelhado.setAttribute("fill", "#E6E6E6");
        elementTelhado.setAttribute("stroke", "#999999");
        elementTelhado.setAttribute("stroke-width", "1.7");
        elementTelhado.setAttribute("stroke-linecap", "round");
        elementTelhado.setAttribute("stroke-linejoin", "round");
        elementTelhado.setAttribute("stroke-miterlimit", "23");
        elementTelhado.setAttribute("id", "des_telhado");
        
        svgEl.appendChild(elementTelhado);
      }
    },

    desenhaSensores() {
      if (!this.layoutsAutomaticos || !this.analiseArcos) return;

      const svgEl = document.getElementById("des_arco_armazem");
      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`];

      if (!layoutArco) return;

      const arcoInfo = this.analiseArcos.arcos[this.arcoAtual];
      if (!arcoInfo) return;

      // Usar configuração aplicada se disponível
      const config = this.configuracaoAplicada || {}
      
      const escala_sensores = config.escala_sensores || 16;
      const dist_y_sensores = config.dist_y_sensores || 12;
      const dist_x_sensores = config.dist_x_sensores || 0;
      const posicao_horizontal = config.posicao_horizontal || 0;
      const posicao_vertical = config.posicao_vertical || 0;
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0;
      
      const pb = (config.pb || this.dimensoesSVG.altura - 50) + (this.dimensoesSVG.altura < 300 ? 0 : 50);
      const yPendulo = pb + 15 + posicao_vertical;

      const totalCabos = arcoInfo.pendulos.length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      arcoInfo.pendulos.forEach((pendulo, index) => {
        const xCaboBase = layoutArco.desenho_sensores.pos_x_cabo[index];
        const distanciaDoMeio = index - indiceCentral
        const deslocamentoX = distanciaDoMeio * dist_x_sensores
        const xCabo = xCaboBase + posicao_horizontal + deslocamentoX;
        const numSensores = pendulo.totalSensores;

        // Retângulo do nome do pêndulo
        const rectPendulo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rectPendulo.setAttribute("id", `C${index + 1}`);
        rectPendulo.setAttribute("x", xCabo - escala_sensores/2);
        rectPendulo.setAttribute("y", yPendulo);
        rectPendulo.setAttribute("width", escala_sensores);
        rectPendulo.setAttribute("height", escala_sensores/2);
        rectPendulo.setAttribute("rx", "2");
        rectPendulo.setAttribute("ry", "2");
        rectPendulo.setAttribute("fill", "#3A78FD");
        svgEl.appendChild(rectPendulo);

        // Texto do nome do pêndulo
        const textPendulo = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textPendulo.setAttribute("id", `TC${index + 1}`);
        textPendulo.setAttribute("x", xCabo);
        textPendulo.setAttribute("y", yPendulo + escala_sensores/4);
        textPendulo.setAttribute("text-anchor", "middle");
        textPendulo.setAttribute("dominant-baseline", "central");
        textPendulo.setAttribute("font-weight", "bold");
        textPendulo.setAttribute("font-size", escala_sensores * 0.4 - 0.5);
        textPendulo.setAttribute("font-family", "Arial");
        textPendulo.setAttribute("fill", "white");
        textPendulo.textContent = `P${pendulo.numero}`;
        svgEl.appendChild(textPendulo);

        // Sensores
        for (let s = 1; s <= numSensores; s++) {
          const ySensor = yPendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo;

          if (ySensor > 10 && ySensor < (this.dimensoesSVG.altura - 60)) {
            // Retângulo do sensor
            const rectSensor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectSensor.setAttribute("id", `C${index + 1}S${s}`);
            rectSensor.setAttribute("x", xCabo - escala_sensores/2);
            rectSensor.setAttribute("y", ySensor);
            rectSensor.setAttribute("width", escala_sensores);
            rectSensor.setAttribute("height", escala_sensores/2);
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
            textSensor.setAttribute("y", ySensor + escala_sensores/4);
            textSensor.setAttribute("text-anchor", "middle");
            textSensor.setAttribute("dominant-baseline", "central");
            textSensor.setAttribute("font-size", escala_sensores * 0.4 - 0.5);
            textSensor.setAttribute("font-family", "Arial");
            textSensor.textContent = "0";
            svgEl.appendChild(textSensor);

            // Nome do sensor
            const textNomeSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textNomeSensor.setAttribute("id", `TIND${index + 1}S${s}`);
            textNomeSensor.setAttribute("x", xCabo - escala_sensores/2 - 2);
            textNomeSensor.setAttribute("y", ySensor + escala_sensores/4);
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
      if (!svgEl) return;

      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`];
      const arcoInfo = this.analiseArcos.arcos[this.arcoAtual];

      if (!layoutArco || !arcoInfo) return;

      // Definir dimensões
      const largura = this.dimensoesSVG.largura;
      const altura = this.dimensoesSVG.altura;
      const resolucao = 160;
      const wCell = largura / resolucao;
      const hCell = altura / resolucao;

      // Coletar sensores e suas posições
      const sensores = [];
      if (this.dadosLocal?.leitura) {
        Object.entries(this.dadosLocal.leitura).forEach(([pendulo, sensoresData], penduloIndex) => {
          const xCabo = layoutArco.desenho_sensores.pos_x_cabo[penduloIndex] + 8; // +8 para centralizar no sensor
          const yCabo = this.dimensoesSVG.altura - 50 + 15;

          Object.entries(sensoresData).forEach(([sensorKey, dadosSensor]) => {
            if (!Array.isArray(dadosSensor) || dadosSensor.length < 5) return;
            
            const s = parseInt(sensorKey);
            const [temp, , , falha, nivel] = dadosSensor;
            const ySensor = yCabo - 12 * s - 25; // Ajustar posição Y

            sensores.push({
              x: xCabo,
              y: ySensor,
              t: parseFloat(temp) || -1000,
              ativo: nivel === true && !falha && temp != 0
            });
          });
        });
      }


      // Função IDW para interpolação
      const idw = (cx, cy) => {
        let somaPesos = 0;
        let somaTemp = 0;
        const power = 2;
        let temSensorAtivo = false;

        sensores.forEach(({ x, y, t, ativo }) => {
          if (t === -1000 || !ativo || t === 0) return;
          temSensorAtivo = true;
          const dist = Math.max(Math.hypot(x - cx, y - cy), 0.0001);
          const peso = 1 / Math.pow(dist, power);
          somaPesos += peso;
          somaTemp += t * peso;
        });

        return temSensorAtivo && somaPesos !== 0 ? somaTemp / somaPesos : null;
      };

      // Definir clip path para formato do armazém ANTES de gerar os blocos
      const lb = this.dimensoesSVG.largura;
      const pb = this.dimensoesSVG.altura - 50;
      const lf = Math.min(250, lb * 0.7);
      const le = 15, hb = 30, hf = 5, ht = 50;
      
      const p1 = [(lb - lf) / 2, pb - hf];
      const p2 = [le, pb - hb];  
      const p3 = [le, pb - ht];
      const p4 = [lb / 2, 1];
      const p5 = [lb - le, pb - ht];
      const p6 = [lb - le, pb - hb];
      const p7 = [lb - (lb - lf) / 2, pb - hf];
      
      const pathD = `M ${p1.join(",")} L ${p2.join(",")} L ${p3.join(",")} L ${p4.join(",")} L ${p5.join(",")} L ${p6.join(",")} L ${p7.join(",")} Z`;

      // Criar elementos de filtro e clip
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", "blurFilterArmazem");
      const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      blur.setAttribute("stdDeviation", "0.6");
      filter.appendChild(blur);
      defs.appendChild(filter);

      const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipPath.setAttribute("id", "clipArmazem");
      const pathClip = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathClip.setAttribute("d", pathD);
      clipPath.appendChild(pathClip);
      defs.appendChild(clipPath);

      svgEl.appendChild(defs);

      // Gerar grid de blocos
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("filter", "url(#blurFilterArmazem)");
      g.setAttribute("clip-path", "url(#clipArmazem)");

      for (let i = 0; i < resolucao; i++) {
        for (let j = 0; j < resolucao; j++) {
          const cx = i * wCell + wCell / 2;
          const cy = j * hCell + hCell / 2;
          const tempInterpolada = idw(cx, cy);
          
          // Se não há interpolação, usar cor de fundo
          const cor = tempInterpolada === null ? "#ffffff" : this.corFaixaExata(tempInterpolada);

          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", i * wCell);
          rect.setAttribute("y", j * hCell);
          rect.setAttribute("width", wCell);
          rect.setAttribute("height", hCell);
          rect.setAttribute("fill", cor);
          
          g.appendChild(rect);
        }
      }

      svgEl.appendChild(g);
    },

    atualizarSensores(dadosArco) {
      if (!dadosArco?.leitura || !this.analiseArcos || !this.layoutsAutomaticos) return;

      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`];
      if (!layoutArco) return;

      // Usar configuração aplicada se disponível
      const config = this.configuracaoAplicada || {}
      
      const escala_sensores = config.escala_sensores || 16;
      const dist_y_sensores = config.dist_y_sensores || 12;
      const dist_x_sensores = config.dist_x_sensores || 0;
      const posicao_horizontal = config.posicao_horizontal || 0;
      const posicao_vertical = config.posicao_vertical || 0;
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0;
      
      const pb = (config.pb || this.dimensoesSVG.altura - 50) + (this.dimensoesSVG.altura < 300 ? 0 : 50);
      const yPendulo = pb + 15 + posicao_vertical;

      const totalCabos = Object.keys(dadosArco.leitura).length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      Object.entries(dadosArco.leitura).forEach(([numeroPendulo, sensores], penduloIndex) => {
        const xCaboBase = layoutArco.desenho_sensores.pos_x_cabo[penduloIndex];
        const distanciaDoMeio = penduloIndex - indiceCentral
        const deslocamentoX = distanciaDoMeio * dist_x_sensores
        const xCabo = xCaboBase + posicao_horizontal + deslocamentoX;

        // Atualizar posição do pêndulo
        const pendulo = document.getElementById(`C${penduloIndex + 1}`);
        const textoPendulo = document.getElementById(`TC${penduloIndex + 1}`);
        if (pendulo && textoPendulo) {
          pendulo.setAttribute('x', xCabo - escala_sensores / 2);
          pendulo.setAttribute('y', yPendulo);
          textoPendulo.setAttribute('x', xCabo);
          textoPendulo.setAttribute('y', yPendulo + escala_sensores / 4);
          textoPendulo.setAttribute('font-size', escala_sensores * 0.4 - 0.5);
        }

        Object.entries(sensores).forEach(([numeroSensor, dadosSensor]) => {
          if (!Array.isArray(dadosSensor) || dadosSensor.length < 5) return;
          
          const s = parseInt(numeroSensor);
          const [temp, , , falha, nivel] = dadosSensor;
          const ySensor = yPendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo;

          const rec = document.getElementById(`C${penduloIndex + 1}S${numeroSensor}`);
          const txt = document.getElementById(`TC${penduloIndex + 1}S${numeroSensor}`);
          const nomeTexto = document.getElementById(`TIND${penduloIndex + 1}S${numeroSensor}`);
          
          if (!rec || !txt || !nomeTexto) return;

          // Atualizar posicionamento
          rec.setAttribute('x', xCabo - escala_sensores / 2);
          rec.setAttribute('y', ySensor);
          rec.setAttribute('width', escala_sensores);
          rec.setAttribute('height', escala_sensores / 2);

          txt.setAttribute('x', xCabo);
          txt.setAttribute('y', ySensor + escala_sensores / 4);
          txt.setAttribute('font-size', escala_sensores * 0.4 - 0.5);

          nomeTexto.setAttribute('x', xCabo - escala_sensores / 2 - 2);
          nomeTexto.setAttribute('y', ySensor + escala_sensores / 4);
          nomeTexto.setAttribute('font-size', escala_sensores * 0.4 - 1.5);

          // Atualizar dados
          txt.textContent = falha ? "ERRO" : (parseFloat(temp) || 0).toFixed(1);
          if (!nivel) {
            rec.setAttribute("fill", "#e6e6e6");
            txt.setAttribute("fill", "black");
          } else {
            const cor = this.corFaixaExata(parseFloat(temp) || 0);
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
        // Forçar renderização imediata após mudança de modo
        this.$nextTick(() => {
          this.renderizarSVG();
        });
      }, 100); // Reduzido tempo para resposta mais rápida
    },

    mudarArco(novoArco) {
      this.arcoAtual = novoArco;
      
      if (this.dadosPortal) {
        const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, novoArco);
        this.dadosLocal = dadosConvertidos;
      }

      // Se há uma configuração selecionada, aplicar o modelo correspondente ao novo arco
      if (this.configuracaoSelecionada) {
        this.aplicarConfiguracao();
      }
    },

    handleArcoSelecionadoTopo(numeroArco) {
      this.mudarArco(numeroArco);
      this.mostrarTopo = false;
      
      // Forçar renderização imediata após fechar o topo
      this.$nextTick(() => {
        this.renderizarSVG();
      });
    },

    carregarConfiguracoesDisponiveis() {
      const prefixo = 'configArmazem_'
      const configs = []

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const chave = localStorage.key(i)
          if (chave && chave.startsWith(prefixo)) {
            const nome = chave.replace(prefixo, '')
            configs.push(nome)
          }
        }
      }

      this.configuracoesDisponiveis = configs.sort()
    },

    aplicarConfiguracao() {
      if (!this.configuracaoSelecionada) {
        // Voltar para configuração padrão - limpar configuração aplicada
        this.configuracaoAplicada = null
        this.$nextTick(() => {
          this.renderizarSVG()
        })
        return
      }

      if (typeof localStorage !== 'undefined') {
        const chave = `configArmazem_${this.configuracaoSelecionada}`
        const configSalva = localStorage.getItem(chave)

        if (configSalva) {
          try {
            const configData = JSON.parse(configSalva)
            
            if (configData.tipo === 'configuracao_armazem_hierarquica' && configData.configModelos?.modelosDefinidos) {
              // Configuração hierárquica nova (v3.0+)
              const modeloParaArco = this.determinarModeloParaArcoComConfig(this.arcoAtual, configData.configModelos.modelosDefinidos, configData.configModelos.quantidadeModelos)
              
              if (modeloParaArco && modeloParaArco.configuracao) {
                this.aplicarConfiguracaoNaRenderizacao(modeloParaArco.configuracao)
                this.mostrarFeedbackModelo(modeloParaArco.nome, configData.configModelos.quantidadeModelos)
              }
            } else if (configData.tipo === 'configuracao_armazem_completa' && configData.modelosArcos) {
              // Configuração completa antiga (v2.0)
              const modeloParaArco = this.determinarModeloParaArcoComConfig(this.arcoAtual, configData.modelosArcos, configData.quantidadeModelos)
              
              if (modeloParaArco && modeloParaArco.config) {
                this.aplicarConfiguracaoNaRenderizacao(modeloParaArco.config)
                this.mostrarFeedbackModelo(modeloParaArco.nome, configData.quantidadeModelos)
              }
            } else {
              // Configuração simples (formato antigo)
              this.aplicarConfiguracaoNaRenderizacao(configData)
            }

          } catch (error) {
            console.error('Erro ao aplicar configuração:', error)
            alert('Erro ao carregar configuração. Verifique se o arquivo está correto.')
          }
        } else {
          alert('Configuração não encontrada!')
          this.configuracaoSelecionada = ''
        }
      }
    },

    determinarModeloParaArcoComConfig(numeroArco, modelosArcos, quantidadeModelos) {
      const totalArcos = this.analiseArcos?.totalArcos || 1
      // 1 modelo: todos os arcos usam o mesmo modelo
      if (quantidadeModelos === 1) {
        const modelo = Object.values(modelosArcos)[0] || null
        return modelo
      }

      // 2 modelos: começa com ímpar (1º, 3º, 5º...), depois par (2º, 4º, 6º...)
      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'
        const modelo = Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || Object.values(modelosArcos)[0] || null
        return modelo
      }

      // 3 modelos: 1º e último = frente_fundo, depois par e ímpar intercalados
      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          const modelo = Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === 'frente_fundo') || Object.values(modelosArcos)[0] || null
          return modelo
        }
        // Para arcos intermediários: a partir do 2º arco, par primeiro, depois ímpar
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        const modelo = Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || Object.values(modelosArcos)[0] || null
        return modelo
      }

      // 4 modelos: 1º = frente, último = fundo, intermediários par e ímpar intercalados
      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          const modelo = Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === 'frente') || Object.values(modelosArcos)[0] || null
          return modelo
        }
        if (numeroArco === totalArcos) {
          const modelo = Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === 'fundo') || Object.values(modelosArcos)[0] || null
          return modelo
        }
        // Para arcos intermediários: par primeiro, depois ímpar
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        const modelo = Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || Object.values(modelosArcos)[0] || null
        return modelo
      }

      const modeloPadrao = Object.values(modelosArcos)[0] || null
      return modeloPadrao
    },

    aplicarConfiguracaoNaRenderizacao(config) {
      // Armazenar a configuração para usar na renderização
      this.configuracaoAplicada = config
      
      // Aplicar configurações específicas do modelo ao arco atual
      this.aplicarConfiguracoesDoModelo(config)
      
      // Re-renderizar o SVG com a nova configuração
      this.$nextTick(() => {
        this.renderizarSVG()
      })
    },

    aplicarConfiguracoesDoModelo(config) {
      if (!config || !this.analiseArcos) return

      // Criar estrutura padrão adaptativa baseada no modelo
      const estruturaPadrao = this.criarEstruturaAdaptativa(config)
      
      // Atualizar dimensões do SVG baseado na configuração
      this.atualizarDimensoesSVG(config)
      
      // Atualizar layouts automáticos baseado na nova configuração
      this.atualizarLayoutsComConfiguracao(config, estruturaPadrao)
    },

    criarEstruturaAdaptativa(config) {
      const estrutura = {
        armazem: {
          // Dimensões básicas do modelo
          pb: config.pb || 185,
          lb: config.lb || 350,
          hb: config.hb || 30,
          hf: config.hf || 5,
          lf: config.lf || 250,
          le: config.le || 15,
          ht: config.ht || 50,
          
          // Configurações do telhado
          tipo_telhado: config.tipo_telhado || 1,
          curvatura_topo: config.curvatura_topo || 30,
          
          // Configurações do fundo
          tipo_fundo: config.tipo_fundo || 0,
          altura_fundo_reto: config.altura_fundo_reto || 10,
          altura_funil_v: config.altura_funil_v || 18,
          posicao_ponta_v: config.posicao_ponta_v || 0,
          largura_abertura_v: config.largura_abertura_v || 20,
          altura_duplo_v: config.altura_duplo_v || 22,
          posicao_v_esquerdo: config.posicao_v_esquerdo || -1,
          posicao_v_direito: config.posicao_v_direito || 1,
          largura_abertura_duplo_v: config.largura_abertura_duplo_v || 2,
          altura_plataforma_duplo_v: config.altura_plataforma_duplo_v || 0.3,
          largura_plataforma_duplo_v: config.largura_plataforma_duplo_v || 10,
          deslocamento_horizontal_fundo: config.deslocamento_horizontal_fundo || 0,
          deslocamento_vertical_fundo: config.deslocamento_vertical_fundo || -1,
          
          // Configurações dos sensores
          escala_sensores: config.escala_sensores || 16,
          dist_y_sensores: config.dist_y_sensores || 12,
          dist_x_sensores: config.dist_x_sensores || 0,
          posicao_horizontal: config.posicao_horizontal || 0,
          posicao_vertical: config.posicao_vertical || 0,
          afastamento_vertical_pendulo: config.afastamento_vertical_pendulo || 0
        }
      }
      
      return estrutura
    },

    atualizarDimensoesSVG(config) {
      // Calcular novas dimensões baseado na configuração
      const larguraBase = Math.max(config.lb || 350, 300)
      const alturaBase = Math.max((config.pb || 185) + (config.ht || 50) + 50, 200)
      
      this.dimensoesSVG = {
        largura: larguraBase,
        altura: alturaBase
      }
      
    },

   atualizarLayoutsComConfiguracao(config, estrutura) {
      if (!this.analiseArcos) return

      // Gerar novos layouts baseados na configuração
      const novosLayouts = {}
      
      Object.keys(this.analiseArcos.arcos).forEach(numeroArco => {
        const arcoInfo = this.analiseArcos.arcos[numeroArco]
        const layout = {
          desenho_sensores: {
            pos_x_cabo: []
          },
          configuracao: estrutura.armazem
        }

        // Calcular posições X dos cabos baseado na nova configuração
        const larguraTotal = config.lb || 350
        const margemLateral = (config.le || 15) + 35
        const larguraDisponivel = larguraTotal - (2 * margemLateral)
        const espacamento = arcoInfo.totalPendulos > 1 ? larguraDisponivel / (arcoInfo.totalPendulos - 1) : 0

        for (let i = 0; i < arcoInfo.totalPendulos; i++) {
          const posX = arcoInfo.totalPendulos === 1 
            ? larguraTotal / 2 
            : margemLateral + (i * espacamento)
          layout.desenho_sensores.pos_x_cabo.push(posX)
        }

        novosLayouts[`arco_${numeroArco}`] = layout
      })

      this.layoutsAutomaticos = novosLayouts
    },

    mostrarFeedbackModelo(nomeModelo, quantidadeModelos) {
      const toast = document.createElement('div')
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        font-size: 14px;
        max-width: 300px;
      `
      toast.innerHTML = `
        <strong>Modelo Aplicado</strong><br>
        ${nomeModelo}<br>
        <small>${quantidadeModelos} modelo(s) configurado(s)</small>
      `
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.remove()
      }, 3000)
    },

    abrirModelador() {
      // Preparar dados para o modelador
      if (typeof localStorage !== 'undefined') {
        const dadosParaModelador = {
          dadosPortal: this.dadosPortal,
          analiseArcos: this.analiseArcos,
          layoutsAutomaticos: this.layoutsAutomaticos,
          dadosConvertidos: this.dadosLocal,
          numeroArco: this.arcoAtual,
          tipoAtivo: 'armazem',
          origem: 'armazem_preview',
          timestamp: new Date().getTime()
        }

        localStorage.setItem('dadosArcoParaModelador', JSON.stringify(dadosParaModelador))
        localStorage.setItem('timestampArcoModelador', dadosParaModelador.timestamp.toString())
      }

      // Navegar para o modelador
      if (this.$router) {
        this.$router.push({ 
          name: 'ModeladorSVG',
          query: { 
            tipo: 'armazem',
            arco: this.arcoAtual,
            origem: 'preview'
          }
        })
      } else {
        // Fallback - abrir em nova aba se não há roteamento
        window.open(`/modelador?tipo=armazem&arco=${this.arcoAtual}&origem=preview`, '_blank')
      }
    }
  }
};
</script>

<style scoped>
.container-fluid {
  min-height: 100vh;
  overflow: auto;
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
