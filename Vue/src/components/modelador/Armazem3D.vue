<template>
  <div style="width: 100%; height: 100vh;">
    <!-- Indicador de carregamento -->
    <div v-if="carregandoDados"
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; text-align: center;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden"></span>
      </div>
      <div style="margin-top: 10px;">Carregando dados da API...</div>
    </div>

    <!-- Indicador de erro -->
    <div v-if="erroAPI"
      style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2000; background: rgba(220, 53, 69, 0.9); color: white; padding: 10px; border-radius: 5px; max-width: 80%;">
      <strong>Erro:</strong> {{ erroAPI }}
      <br><small>Usando dados de demonstração</small>
    </div>

    <!-- Controles de configuração do modelador -->
    <div ref="cardConfig"
         style="position: absolute; top: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; min-width: 280px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      
      <!-- Barra de título para arrastar -->
      <div @mousedown="iniciarArrastoCardConfig"
           style="margin: -15px -15px 10px -15px; padding: 10px 15px; background: rgba(0,0,0,0.05); border-radius: 8px 8px 0 0; cursor: move; user-select: none;">
        <h6 style="margin: 0; color: #333; font-weight: bold;">⚙️ Configurações do Modelador</h6>
      </div>

      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px; font-weight: 600;">Configuração:</label>
        <select
          v-model="configuracaoSelecionada"
          @change="aplicarConfiguracao3D"
          @mousedown.stop
          style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; cursor: pointer;"
        >
          <option value="">Configuração Padrão</option>
          <option v-for="config in configuracoesDisponiveis" :key="config" :value="config">
            {{ config }}
          </option>
        </select>
      </div>

      <div v-if="configuracaoModelador" style="margin-bottom: 10px;">
        <div style="margin-bottom: 5px;">
          <label style="display: block; margin-bottom: 2px; font-size: 12px; font-weight: 600;">Arco Atual:</label>
          <select
            v-model.number="arcoAtual"
            @change="mudarArco3D"
            @mousedown.stop
            style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; cursor: pointer;"
          >
            <option v-for="n in (analiseArcos?.totalArcos || 1)" :key="n" :value="n">
              Arco {{ n }}
            </option>
          </select>
        </div>
        <small style="display: block; color: #666; font-size: 11px;">
          Modelo: {{ getModeloAtualInfo() }}
        </small>
      </div>

      <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">

      <label style="display: block; margin-bottom: 5px; font-size: 12px; cursor: pointer;" @mousedown.stop>
        <input type="checkbox" v-model="autoRotate" @mousedown.stop />
        Rotação Automática
      </label>
      <label style="display: block; margin-bottom: 5px; font-size: 12px; cursor: pointer;" @mousedown.stop>
        <input type="checkbox" v-model="mostrarLabels" @mousedown.stop />
        Mostrar Labels
      </label>

      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
        <small style="display: block; font-size: 11px; color: #666;">Sensores: {{ totalSensores }}</small>
        <small style="display: block; font-size: 11px; color: #666;">Pêndulos: {{ totalPendulos }}</small>
        <small v-if="erroAPI" style="display: block; color: red; font-size: 11px;">Modo offline</small>
        <small v-if="configuracaoModelador" style="display: block; color: #28a745; font-size: 11px;">✓ Modelador ativo</small>
      </div>
    </div>

    <!-- Card de informações do cabo -->
    <div v-if="mostrarCardCabo && caboSelecionado"
         ref="cardCabo"
         @mousedown="iniciarArrastoCard"
         style="position: absolute; top: 80px; right: 20px; z-index: 2000; background: rgba(255,255,255,0.98); padding: 20px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 400px; font-family: Arial, sans-serif; cursor: move;">

      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px; cursor: move;">
        <h4 style="margin: 0; color: #2E86AB; font-size: 18px;">
          📊 {{ caboSelecionado.nome }}
        </h4>
        <button @click="fecharCardCabo"
                @mousedown.stop
                style="background: #ff4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px; margin-left: auto;">
          ×
        </button>
      </div>

      <div style="max-height: 300px; overflow-y: auto;">
        <div v-for="(sensor, index) in caboSelecionado.sensores" :key="index"
             style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid;"
             :style="`border-left-color: ${getCorSensor(sensor.temperatura, sensor.ativo, sensor.falha)}; background: rgba(0,0,0,0.05);`">

          <div>
            <strong style="color: #333;">Sensor {{ sensor.numero }}:</strong>
            <div style="font-size: 12px; color: #666; margin-top: 2px;">
              {{ sensor.ativo ? (sensor.falha ? 'ERRO' : 'Ativo') : 'Inativo' }}
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: bold;"
                 :style="`color: ${getCorSensor(sensor.temperatura, sensor.ativo, sensor.falha)};`">
              {{ sensor.falha ? 'ERR' : `${sensor.temperatura.toFixed(1)}°C` }}
            </div>
            <div style="font-size: 10px; color: #888;">
              {{ sensor.pontoQuente ? '🔥 Ponto Quente' : '' }}
              {{ sensor.preAlarme ? '⚠️ Pré-Alarme' : '' }}
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 12px; color: #666;">
        <span>Total: {{ caboSelecionado.sensores.length }} sensores</span>
        <span>Média: {{ calcularMediaTemperatura(caboSelecionado.sensores) }}°C</span>
      </div>
    </div>

    <!-- Canvas 3D -->
    <div ref="canvasContainer" style="height: 100%; background: linear-gradient(to bottom, #87CEEB, #E0F6FF);"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
import axios from 'axios';

export default {
  name: 'Armazem3D',
  data() {
    return {
      autoRotate: true,
      mostrarLabels: true,
      scene: null,
      camera: null,
      renderer: null,
      animationId: null,
      aeradorHélices: [],
      textSprites: [],
      sensores3D: [],
      cabos3D: [],
      raycaster: null,
      mouse: null,
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
      cameraRadius: 30,
      cameraTheta: 0,
      cameraPhi: Math.PI / 3,
      dados: null,
      nivelAtual: 0,
      totalSensores: 0,
      totalPendulos: 0,
      carregandoDados: true,
      erroAPI: null,

      // Card de informações do cabo
      caboSelecionado: null,
      mostrarCardCabo: false,

      // Arrastar card
      arrastando: false,
      offsetX: 0,
      offsetY: 0,

      // Arrastar card de configurações
      arrastandoConfig: false,
      offsetXConfig: 0,
      offsetYConfig: 0,

      // Configurações do armazém (padrão)
      alturaArmazem: 6,
      larguraArmazem: 25,
      profundidadeArmazem: 12,

      // Configuração da API
      apiConfig: {
        url: 'https://cloud.pce-eng.com.br/cloud/api/public/api/armazem/buscardado/130?celula=1&leitura=1&data=2025-08-13%2008:03:47',
        get token() {
          const token = localStorage.getItem('token') || ''
          return token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : 'Bearer [TOKEN_REQUIRED]'
        }
      },

      // Configurações do modelador 3D
      configuracaoModelador: null,
      arcoAtual: 1,
      configuracoesDisponiveis: [],
      configuracaoSelecionada: '',
      analiseArcos: null,
    };
  },
  mounted() {
    this.carregarDados();
    this.carregarConfiguracoesDisponiveis();
  },
  beforeDestroy() {
    this.cleanup();
  },
  watch: {
    dados: {
      handler(newVal) {
        if (newVal) {
          this.calcularEstatisticas();
          if (this.scene) {
            this.updateVisualization();
          } else {
            this.initThreeJS();
          }
        }
      },
      deep: true
    },
    mostrarLabels() {
      this.toggleLabels();
    }
  },
  methods: {
    async carregarDados() {
      try {
        this.carregandoDados = true;
        this.erroAPI = null;

        // Obter token dinâmico do localStorage
        const token = localStorage.getItem('token') || ''
        const authToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''

        if (!authToken || authToken === 'Bearer ') {
          throw new Error('Token de autenticação não encontrado no localStorage')
        }

        // Fazer chamada à API
        const response = await axios.get(this.apiConfig.url, {
          params: this.apiConfig.params,
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        if (!response.data) {
          throw new Error('Dados não recebidos da API');
        }

        this.dados = response.data;
        // Validar estrutura essencial
        this.validarEstruturaDados(this.dados);

        // Inicializar análise de arcos se disponível
        if (this.dados.arcos) {
          this.analiseArcos = this.analisarEstruturaArcos(this.dados);
        }

      } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
        this.erroAPI = this.tratarErroAPI(error);

        // Usar dados de fallback
        this.dados = await this.gerarDadosFallback();
      } finally {
        this.carregandoDados = false;
      }
    },

    validarEstruturaDados(dados) {
      if (!dados || typeof dados !== 'object') {
        throw new Error('Dados inválidos recebidos da API');
      }

      // Validar estruturas essenciais
      if (!dados.configuracao && !dados.arcos && !dados.pendulos) {
        console.warn('Estrutura de dados não reconhecida, adaptando automaticamente');
      }
    },

    analisarEstruturaArcos(dados) {
      if (!dados.arcos) {
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

    tratarErroAPI(error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;

        if (status === 401) {
          return 'Token de autenticação inválido';
        } else if (status === 500) {
          return 'Erro interno do servidor';
        } else if (status === 404) {
          return 'Endpoint não encontrado';
        } else {
          return `Erro ${status}: ${message}`;
        }
      } else if (error.request) {
        return 'Erro de conexão com a API. Verifique sua conexão de internet.';
      } else {
        return `Erro ao fazer requisição: ${error.message}`;
      }
    },

    async gerarDadosFallback() {
      console.warn('Usando dados de fallback devido a erro na API');

      return {
        configuracao: {
          layout_topo: {
            celulas: { tamanho_svg: [600, 388] },
            aeradores: {
              1: [50, 340, 0],
              2: [200, 340, 0],
              3: [350, 340, 0],
              4: [500, 340, 0]
            }
          }
        },
        arcos: {
          1: {
            1: {
              1: [25.0, false, false, false, true],
              2: [24.5, false, false, false, true],
              3: [26.0, false, false, false, true]
            }
          }
        },
        pendulos: {
          1: [false, false, true, 25.0]
        },
        AER: "1,0,1,0",
        NIV: 50.0
      };
    },

    calcularEstatisticas() {
      if (!this.dados) return;

      // Calcular nível atual
      this.nivelAtual = this.dados.NIV || 0;

      // Contar sensores
      let sensores = 0;
      if (this.dados.arcos) {
        Object.values(this.dados.arcos).forEach(arco => {
          Object.values(arco).forEach(pendulo => {
            sensores += Object.keys(pendulo).length;
          });
        });
      }
      this.totalSensores = sensores;

      // Contar pêndulos
      this.totalPendulos = this.dados.pendulos ? Object.keys(this.dados.pendulos).length : 0;

      // Ajustar largura baseada no número de arcos
      const numeroArcos = this.dados.arcos ? Object.keys(this.dados.arcos).length : 10;
      this.larguraArmazem = Math.max(numeroArcos * 1.3, 20);
    },

    initThreeJS() {
      if (!this.dados) return;

      const container = this.$refs.canvasContainer;
      if (!container) return;

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      this.updateCameraPosition();

      // Raycaster para detecção de cliques
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setClearColor(0x87CEEB);
      container.appendChild(this.renderer.domElement);

      // Controls
      this.setupControls(container);

      // Lighting
      this.setupLighting();

      // Build structures
      this.buildArmazemStructure();
      this.buildPendulos();
      this.buildAeradores();
      this.buildGroundGrid();
      this.buildNivelVisual();

      // Start animation loop
      this.animate();

      // Handle window resize
      window.addEventListener('resize', this.onWindowResize);
    },

    updateCameraPosition() {
      this.camera.position.set(
        Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta) * this.cameraRadius,
        Math.cos(this.cameraPhi) * this.cameraRadius + this.alturaArmazem * 0.3,
        Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta) * this.cameraRadius
      );
      this.camera.lookAt(0, this.alturaArmazem / 2, 0);
    },

    setupControls(container) {
      container.addEventListener('mousedown', (event) => {
        this.isMouseDown = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
      });

      container.addEventListener('mousemove', (event) => {
        if (!this.isMouseDown) return;

        const deltaX = event.clientX - this.mouseX;
        const deltaY = event.clientY - this.mouseY;

        this.cameraTheta -= deltaX * 0.01;
        this.cameraPhi += deltaY * 0.01;
        this.cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraPhi));

        this.updateCameraPosition();

        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
      });

      container.addEventListener('mouseup', () => {
        this.isMouseDown = false;
      });

      // Adicionar evento de clique para detecção de cabos
      container.addEventListener('click', (event) => {
        this.detectarCliqueCabo(event, container);
      });

      container.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        this.cameraRadius *= scale;
        this.cameraRadius = Math.max(8, Math.min(80, this.cameraRadius));

        this.updateCameraPosition();
      });
    },

    setupLighting() {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      this.scene.add(ambientLight);

      // Directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(20, 20, 20);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 100;
      directionalLight.shadow.camera.left = -30;
      directionalLight.shadow.camera.right = 30;
      directionalLight.shadow.camera.top = 30;
      directionalLight.shadow.camera.bottom = -30;
      this.scene.add(directionalLight);

      // Point light
      const pointLight = new THREE.PointLight(0xffffff, 0.6);
      pointLight.position.set(0, this.alturaArmazem, 0);
      this.scene.add(pointLight);
    },

    buildArmazemStructure() {
      const config = this.getConfiguracao3DAtual();

      const corTelhado = 0xE6E6E6;
      const corBase = 0x999999;
      const corParede = 0xD0D0D0;
      const espessuraParede = 0.2;

      // Base do armazém
      const baseGeometry = new THREE.BoxGeometry(
        this.larguraArmazem + espessuraParede,
        0.15,
        this.profundidadeArmazem + espessuraParede
      );
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: corBase,
        roughness: 0.8,
        metalness: 0.2
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0, 0);
      base.receiveShadow = true;
      base.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(base);

      // Material das paredes
      const paredeMaterial = new THREE.MeshStandardMaterial({
        color: corParede,
        transparent: true,
        opacity: 0.4
      });

      // Paredes laterais (retas) - laterais esquerda e direita
      const paredeLateralGeometry = new THREE.BoxGeometry(this.larguraArmazem, this.alturaArmazem, espessuraParede);

      // Parede esquerda (lateral)
      const paredeEsquerda = new THREE.Mesh(paredeLateralGeometry, paredeMaterial);
      paredeEsquerda.position.set(0, this.alturaArmazem / 2, -this.profundidadeArmazem / 2);
      paredeEsquerda.castShadow = true;
      paredeEsquerda.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeEsquerda);

      // Parede direita (lateral)
      const paredeDireita = new THREE.Mesh(paredeLateralGeometry, paredeMaterial);
      paredeDireita.position.set(0, this.alturaArmazem / 2, this.profundidadeArmazem / 2);
      paredeDireita.castShadow = true;
      paredeDireita.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeDireita);

      // Paredes frontais baseadas na configuração do modelador
      this.buildParedesComConfiguracao(paredeMaterial, espessuraParede, config);

      // Telhado baseado na configuração do modelador
      this.buildTelhadoComConfiguracao(corTelhado, config);

      // Fundo baseado na configuração do modelador
      this.buildFundoComConfiguracao(corBase, config);

      // Vigas estruturais
      this.buildVigas();
    },

    buildParedesComConfiguracao(paredeMaterial, espessuraParede, config) {
      const tipo_telhado = config.tipo_telhado || 1;
      const curvatura_topo = config.curvatura_topo || 30;
      const ht = (config.ht || 50) / 100 * 12; // Converter para escala 3D

      const alturaTelhado = this.alturaArmazem + (ht / 10); // Ajustar altura do telhado

      if (tipo_telhado === 1) {
        // Telhado pontudo - paredes triangulares
        this.buildParedesTriangularesPontudas(paredeMaterial, espessuraParede, alturaTelhado, config);
      } else if (tipo_telhado === 2) {
        // Telhado arredondado - paredes com topo curvado
        this.buildParedesArredondadas(paredeMaterial, espessuraParede, alturaTelhado, curvatura_topo);
      } else if (tipo_telhado === 3) {
        // Telhado em arco - paredes com formato de arco
        this.buildParedesArco(paredeMaterial, espessuraParede, alturaTelhado, curvatura_topo);
      }
    },

    buildParedesTriangularesPontudas(paredeMaterial, espessuraParede, alturaTelhado, config) {
      const pontas_redondas = config.pontas_redondas || false;
      const raio_pontas = (config.raio_pontas || 15) / 100; // Converter para escala 3D
      const estilo_laterais = config.estilo_laterais || 'reta';
      const curvatura_laterais = (config.curvatura_laterais || 0) / 100;

      const shape = new THREE.Shape();

      // Base da parede
      shape.moveTo(-this.profundidadeArmazem / 2, 0);
      shape.lineTo(this.profundidadeArmazem / 2, 0);
      shape.lineTo(this.profundidadeArmazem / 2, this.alturaArmazem);

      if (estilo_laterais === 'curvatura_lateral' && curvatura_laterais !== 0) {
        // Aplicar curvatura lateral
        const pontoControle = this.profundidadeArmazem / 4 + curvatura_laterais;
        shape.quadraticCurveTo(pontoControle, (this.alturaArmazem + alturaTelhado) / 2, 0, alturaTelhado);
      } else {
        // Linha reta até o topo
        shape.lineTo(0, alturaTelhado);
      }

      if (pontas_redondas) {
        // Aplicar curvatura no topo
        shape.quadraticCurveTo(-raio_pontas, alturaTelhado - raio_pontas, -this.profundidadeArmazem / 4, this.alturaArmazem);
      }

      shape.lineTo(-this.profundidadeArmazem / 2, this.alturaArmazem);
      shape.lineTo(-this.profundidadeArmazem / 2, 0);

      const extrudeSettings = {
        depth: espessuraParede,
        bevelEnabled: false
      };

      const paredeTriangularGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // Parede frontal
      const paredeFrente = new THREE.Mesh(paredeTriangularGeometry, paredeMaterial);
      paredeFrente.position.set(-this.larguraArmazem / 2, 0, 0);
      paredeFrente.rotation.y = Math.PI / 2;
      paredeFrente.castShadow = true;
      paredeFrente.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeFrente);

      // Parede traseira
      const paredeTras = new THREE.Mesh(paredeTriangularGeometry, paredeMaterial);
      paredeTras.position.set(this.larguraArmazem / 2, 0, 0);
      paredeTras.rotation.y = -Math.PI / 2;
      paredeTras.castShadow = true;
      paredeTras.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeTras);
    },

    buildParedesArredondadas(paredeMaterial, espessuraParede, alturaTelhado, curvatura_topo) {
      const alturaMaxima = alturaTelhado - (curvatura_topo / 100 * 2); // Ajustar altura baseada na curvatura

      const shape = new THREE.Shape();
      shape.moveTo(-this.profundidadeArmazem / 2, 0);
      shape.lineTo(this.profundidadeArmazem / 2, 0);
      shape.lineTo(this.profundidadeArmazem / 2, this.alturaArmazem);

      // Curva arredondada no topo
      shape.quadraticCurveTo(0, alturaMaxima, -this.profundidadeArmazem / 2, this.alturaArmazem);
      shape.lineTo(-this.profundidadeArmazem / 2, 0);

      const extrudeSettings = {
        depth: espessuraParede,
        bevelEnabled: false
      };

      const paredeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // Parede frontal
      const paredeFrente = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeFrente.position.set(-this.larguraArmazem / 2, 0, 0);
      paredeFrente.rotation.y = Math.PI / 2;
      paredeFrente.castShadow = true;
      paredeFrente.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeFrente);

      // Parede traseira
      const paredeTras = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeTras.position.set(this.larguraArmazem / 2, 0, 0);
      paredeTras.rotation.y = -Math.PI / 2;
      paredeTras.castShadow = true;
      paredeTras.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeTras);
    },

    buildParedesArco(paredeMaterial, espessuraParede, alturaTelhado, curvatura_topo) {
      const raio = curvatura_topo / 100 * this.profundidadeArmazem; // Ajustar raio baseado na curvatura

      const shape = new THREE.Shape();
      shape.moveTo(-this.profundidadeArmazem / 2, 0);
      shape.lineTo(this.profundidadeArmazem / 2, 0);
      shape.lineTo(this.profundidadeArmazem / 2, this.alturaArmazem);

      // Arco no topo usando arc()
      shape.arc(-this.profundidadeArmazem / 2, 0, raio, 0, Math.PI, false);
      shape.lineTo(-this.profundidadeArmazem / 2, this.alturaArmazem);
      shape.lineTo(-this.profundidadeArmazem / 2, 0);

      const extrudeSettings = {
        depth: espessuraParede,
        bevelEnabled: false
      };

      const paredeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // Parede frontal
      const paredeFrente = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeFrente.position.set(-this.larguraArmazem / 2, 0, 0);
      paredeFrente.rotation.y = Math.PI / 2;
      paredeFrente.castShadow = true;
      paredeFrente.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeFrente);

      // Parede traseira
      const paredeTras = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeTras.position.set(this.larguraArmazem / 2, 0, 0);
      paredeTras.rotation.y = -Math.PI / 2;
      paredeTras.castShadow = true;
      paredeTras.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(paredeTras);
    },

    buildTelhadoComConfiguracao(cor, config) {
      const tipo_telhado = config.tipo_telhado || 1;
      const curvatura_topo = config.curvatura_topo || 30;
      const ht = (config.ht || 50) / 100 * 12;

      const alturaTelhado = this.alturaArmazem + (ht / 10);
      const extensaoTelhado = 0.8;

      const telhadoMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        metalness: 0.1,
        roughness: 0.8
      });

      if (tipo_telhado === 1) {
        // Telhado pontudo (duas águas)
        this.buildTelhadoPontudo(telhadoMaterial, alturaTelhado, extensaoTelhado, curvatura_topo);
      } else if (tipo_telhado === 2) {
        // Telhado arredondado
        this.buildTelhadoArredondado(telhadoMaterial, alturaTelhado, extensaoTelhado, curvatura_topo);
      } else if (tipo_telhado === 3) {
        // Telhado em arco
        this.buildTelhadoArco(telhadoMaterial, alturaTelhado, extensaoTelhado, curvatura_topo);
      }
    },

    buildTelhadoPontudo(telhadoMaterial, alturaTelhado, extensaoTelhado, curvatura_topo) {
      const inclinacao = Math.PI / 12 + (curvatura_topo / 1000); // Ajustar inclinação baseada na curvatura
      const telhadoGeometry = new THREE.BoxGeometry(this.larguraArmazem + extensaoTelhado, 0.1, this.profundidadeArmazem / 2 + 0.2);

      // Primeira parte do telhado (inclinada)
      const telhado1 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado1.position.set(0, alturaTelhado, -this.profundidadeArmazem / 4);
      telhado1.rotation.x = -inclinacao;
      telhado1.castShadow = true;
      telhado1.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(telhado1);

      // Segunda parte do telhado (inclinada)
      const telhado2 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado2.position.set(0, alturaTelhado, this.profundidadeArmazem / 4);
      telhado2.rotation.x = inclinacao;
      telhado2.castShadow = true;
      telhado2.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(telhado2);

      // Cumeeira (linha central do telhado)
      const cumeeiraGeometry = new THREE.BoxGeometry(this.larguraArmazem + extensaoTelhado + 0.1, 0.12, 0.15);
      const cumeeira = new THREE.Mesh(cumeeiraGeometry, telhadoMaterial);
      cumeeira.position.set(0, alturaTelhado + 0.2, 0);
      cumeeira.castShadow = true;
      cumeeira.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(cumeeira);
    },

    buildTelhadoArredondado(telhadoMaterial, alturaTelhado, extensaoTelhado, curvatura_topo) {
      // Criar telhado curvo usando geometria customizada
      const largura = this.larguraArmazem + extensaoTelhado;
      const profundidade = this.profundidadeArmazem;
      const segments = 32;

      const geometry = new THREE.CylinderGeometry(
        profundidade / 2,
        profundidade / 2,
        largura,
        segments,
        1,
        true,
        0,
        Math.PI
      );

      const telhado = new THREE.Mesh(geometry, telhadoMaterial);
      telhado.position.set(0, alturaTelhado + (curvatura_topo / 200), 0);
      telhado.rotation.z = Math.PI / 2;
      telhado.castShadow = true;
      telhado.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(telhado);
    },

    buildTelhadoArco(telhadoMaterial, alturaTelhado, extensaoTelhado, curvatura_topo) {
      const largura = this.larguraArmazem + extensaoTelhado;
      const raio = curvatura_topo / 100 * this.profundidadeArmazem;
      const segments = 24;

      // Criar arco usando TorusGeometry parcial
      const geometry = new THREE.CylinderGeometry(
        raio,
        raio,
        largura,
        segments,
        1,
        true,
        0,
        Math.PI
      );

      const telhado = new THREE.Mesh(geometry, telhadoMaterial);
      telhado.position.set(0, alturaTelhado + (raio / 4), 0);
      telhado.rotation.z = Math.PI / 2;
      telhado.castShadow = true;
      telhado.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(telhado);
    },

    buildFundoComConfiguracao(corBase, config) {
      const tipo_fundo = config.tipo_fundo || 0;

      if (tipo_fundo === 0) {
        // Fundo reto - não adicionar nada especial além da base
        this.buildFundoReto(corBase, config);
      } else if (tipo_fundo === 1) {
        // Fundo funil V
        this.buildFundoFunilV(corBase, config);
      } else if (tipo_fundo === 2) {
        // Fundo duplo V
        this.buildFundoDuploV(corBase, config);
      }
    },

    buildFundoReto(corBase, config) {
      const altura_fundo_reto = (config.altura_fundo_reto || 10) / 100 * 0.5; // Converter para escala 3D

      if (altura_fundo_reto > 0.1) {
        const fundoGeometry = new THREE.BoxGeometry(
          this.larguraArmazem * 0.8,
          altura_fundo_reto,
          this.profundidadeArmazem * 0.8
        );
        const fundoMaterial = new THREE.MeshStandardMaterial({
          color: corBase,
          roughness: 0.9,
          metalness: 0.1
        });

        const fundo = new THREE.Mesh(fundoGeometry, fundoMaterial);
        fundo.position.set(0, altura_fundo_reto / 2 + 0.15, 0);
        fundo.castShadow = true;
        fundo.receiveShadow = true;
        fundo.userData = { tipo: 'estrutura_armazem' };
        this.scene.add(fundo);
      }
    },

    buildFundoFunilV(corBase, config) {
      const altura_funil_v = (config.altura_funil_v || 18) / 100 * 1.2; // Converter para escala 3D
      const largura_abertura_v = (config.largura_abertura_v || 20) / 100 * 1.0;
      const posicao_ponta_v = (config.posicao_ponta_v || 0) * this.larguraArmazem * 0.1;

      // Criar geometria de funil em V
      const vertices = [];
      const indices = [];
      const normals = [];

      // Base retangular
      const baseVertices = [
        [-this.larguraArmazem/2, 0.15, -this.profundidadeArmazem/2],
        [this.larguraArmazem/2, 0.15, -this.profundidadeArmazem/2],
        [this.larguraArmazem/2, 0.15, this.profundidadeArmazem/2],
        [-this.larguraArmazem/2, 0.15, this.profundidadeArmazem/2]
      ];

      // Ponto do funil (ajustado pela posição)
      const pontaFunil = [posicao_ponta_v, 0.15 - altura_funil_v, 0];

      // Abertura do funil
      const abertura = [
        [pontaFunil[0] - largura_abertura_v/2, pontaFunil[1], pontaFunil[2] - largura_abertura_v/4],
        [pontaFunil[0] + largura_abertura_v/2, pontaFunil[1], pontaFunil[2] - largura_abertura_v/4],
        [pontaFunil[0] + largura_abertura_v/2, pontaFunil[1], pontaFunil[2] + largura_abertura_v/4],
        [pontaFunil[0] - largura_abertura_v/2, pontaFunil[1], pontaFunil[2] + largura_abertura_v/4]
      ];

      // Adicionar vértices
      baseVertices.forEach(v => vertices.push(...v));
      abertura.forEach(v => vertices.push(...v));

      // Criar faces conectando base à abertura
      const baseIndices = [
        [0, 1, 5], [0, 5, 4],  // Face lateral 1
        [1, 2, 6], [1, 6, 5],  // Face lateral 2
        [2, 3, 7], [2, 7, 6],  // Face lateral 3
        [3, 0, 4], [3, 4, 7],  // Face lateral 4
        [4, 5, 6], [4, 6, 7]   // Face do fundo (abertura)
      ];

      baseIndices.forEach(face => indices.push(...face));

      const geometry = new THREE.BufferGeometry();
      geometry.setIndex(indices);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals(); // Computa normais iniciais

      const fundoMaterial = new THREE.MeshStandardMaterial({
        color: corBase,
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide
      });

      const fundo = new THREE.Mesh(geometry, fundoMaterial);
      fundo.castShadow = true;
      fundo.receiveShadow = true;
      fundo.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(fundo);
    },

    buildFundoDuploV(corBase, config) {
      const altura_duplo_v = (config.altura_duplo_v || 22) / 100 * 1.4;
      const largura_abertura_duplo_v = (config.largura_abertura_duplo_v || 2) / 100 * 0.8;
      const posicao_v_esquerdo = (config.posicao_v_esquerdo || -1) * this.larguraArmazem * 0.2;
      const posicao_v_direito = (config.posicao_v_direito || 1) * this.larguraArmazem * 0.2;
      const largura_plataforma_duplo_v = (config.largura_plataforma_duplo_v || 10) / 100 * 2.0;
      const altura_plataforma_duplo_v = (config.altura_plataforma_duplo_v || 0.3) * altura_duplo_v;

      // Criar base plana primeiro
      const baseGeometry = new THREE.BoxGeometry(
        this.larguraArmazem * 0.9,
        0.1,
        this.profundidadeArmazem * 0.9
      );
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: corBase,
        roughness: 0.9,
        metalness: 0.1
      });

      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0.2, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      base.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(base);

      // Plataforma central
      const plataformaGeometry = new THREE.BoxGeometry(
        largura_plataforma_duplo_v,
        altura_plataforma_duplo_v,
        this.profundidadeArmazem * 0.6
      );

      const plataforma = new THREE.Mesh(plataformaGeometry, baseMaterial);
      plataforma.position.set(0, 0.25 + altura_plataforma_duplo_v/2, 0);
      plataforma.castShadow = true;
      plataforma.receiveShadow = true;
      plataforma.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(plataforma);

      // Funis laterais (simplificados como cones)
      const funilGeometry = new THREE.ConeGeometry(largura_abertura_duplo_v, altura_duplo_v, 8);

      // Funil esquerdo
      const funilEsquerdo = new THREE.Mesh(funilGeometry, baseMaterial);
      funilEsquerdo.position.set(posicao_v_esquerdo, 0.25 - altura_duplo_v/2, 0);
      funilEsquerdo.castShadow = true;
      funilEsquerdo.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(funilEsquerdo);

      // Funil direito
      const funilDireito = new THREE.Mesh(funilGeometry, baseMaterial);
      funilDireito.position.set(posicao_v_direito, 0.25 - altura_duplo_v/2, 0);
      funilDireito.castShadow = true;
      funilDireito.userData = { tipo: 'estrutura_armazem' };
      this.scene.add(funilDireito);
    },

    buildVigas() {
      const vigaGeometry = new THREE.BoxGeometry(0.1, this.alturaArmazem, 0.1);
      const vigaMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.6,
        roughness: 0.4
      });

      // Adicionar vigas estruturais
      const numVigas = 8;
      for (let i = 0; i < numVigas; i++) {
        const espacamento = this.larguraArmazem / (numVigas + 1);
        const x = -this.larguraArmazem / 2 + (i + 1) * espacamento;

        const viga = new THREE.Mesh(vigaGeometry, vigaMaterial);
        viga.position.set(x, this.alturaArmazem / 2, 0);
        viga.castShadow = true;
        viga.userData = { tipo: 'estrutura_armazem' };
        this.scene.add(viga);
      }
    },

    buildPendulos() {
      if (!this.dados) return;

      // Verificar se existe configuração de layout_topo
      const layoutTopo = this.dados?.configuracao?.layout_topo;

      if (layoutTopo) {
        // Usar layout_topo se disponível
        this.buildPendulosComLayoutTopo(layoutTopo);
      } else {
        // Gerar posicionamento automático baseado nos dados disponíveis
        this.buildPendulosAutomatico();
      }
    },

    buildPendulosComLayoutTopo(layoutTopo) {
      Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
        if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;

        const arcoNum = parseInt(arcoKey);
        const posXTopo = arcoData.pos_x;
        const sensoresArco = arcoData.sensores || {};

        // Converter posição X do topo para 3D
        const tamanhoSVG = layoutTopo.celulas?.tamanho_svg || [600, 388];
        const posX = -this.larguraArmazem / 2 + (posXTopo / tamanhoSVG[0]) * this.larguraArmazem;

        // Processar cada sensor do arco baseado na posição Y do topo
        Object.entries(sensoresArco).forEach(([penduloId, posYTopo]) => {
          const posZ = -this.profundidadeArmazem / 2 + ((posYTopo - 50) / 250) * (this.profundidadeArmazem - 2) + 1;
          const sensores = this.dados?.arcos?.[arcoNum]?.[penduloId] || {};
          this.buildPendulo(posX, posZ, arcoNum, penduloId, sensores);
        });
      });
    },

    buildPendulosAutomatico() {
      // Gerar posicionamento automático baseado nos dados dos arcos
      if (this.dados.arcos) {
        const arcosIds = Object.keys(this.dados.arcos).map(id => parseInt(id)).sort((a, b) => a - b);
        const totalArcos = arcosIds.length;

        arcosIds.forEach((arcoId, arcoIndex) => {
          const arcoData = this.dados.arcos[arcoId];
          const posX = -this.larguraArmazem / 2 + (arcoIndex / Math.max(totalArcos - 1, 1)) * this.larguraArmazem;

          const pendulosIds = Object.keys(arcoData).map(id => parseInt(id)).sort((a, b) => a - b);
          const totalPendulos = pendulosIds.length;

          pendulosIds.forEach((penduloId, penduloIndex) => {
            const posZ = -this.profundidadeArmazem / 2 + (penduloIndex / Math.max(totalPendulos - 1, 1)) * this.profundidadeArmazem;
            const sensores = arcoData[penduloId] || {};
            this.buildPendulo(posX, posZ, arcoId, penduloId, sensores);
          });
        });
      } else if (this.dados.pendulos) {
        // Fallback para dados de pêndulos simples
        const pendulosIds = Object.keys(this.dados.pendulos).map(id => parseInt(id)).sort((a, b) => a - b);
        const totalPendulos = pendulosIds.length;

        pendulosIds.forEach((penduloId, index) => {
          const posX = -this.larguraArmazem / 2 + (index / Math.max(totalPendulos - 1, 1)) * this.larguraArmazem;
          const posZ = 0; // Centralizado
          const sensores = { 1: this.dados.pendulos[penduloId] };
          this.buildPendulo(posX, posZ, 1, penduloId, sensores);
        });
      }
    },

    buildPendulo(posX, posZ, arcoNum, penduloNum, sensores) {
      const sensoresArray = Object.entries(sensores);
      const numSensores = sensoresArray.length;

      // Calcular comprimento do cabo baseado na quantidade de sensores
      // Mínimo 1.5m, máximo altura do armazém - 0.2m
      // Cada sensor adiciona ~0.4m ao comprimento
      const comprimentoBase = 1.5;
      const incrementoPorSensor = 0.4;
      const comprimentoMaximo = this.alturaArmazem - 0.2;

      let alturaCabo = comprimentoBase + (numSensores * incrementoPorSensor);
      alturaCabo = Math.min(alturaCabo, comprimentoMaximo);

      // Posição Y do cabo (sempre começa do topo)
      const posYCabo = this.alturaArmazem - (alturaCabo / 2) - 0.1;

      // Criar cabo com comprimento ajustado
      const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, alturaCabo, 8);
      const cableMaterial = new THREE.MeshStandardMaterial({
        color: 0x2c2c2c,
        metalness: 0.7,
        roughness: 0.3
      });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.set(posX, posYCabo, posZ);
      cable.castShadow = true;

      // Armazenar dados do cabo para clique
      cable.userData = {
        tipo: 'cabo',
        arcoNum,
        penduloNum,
        nome: `Arco ${arcoNum} - Pêndulo ${penduloNum}`,
        sensores: Object.entries(sensores).map(([sensorNum, dadosSensor]) => {
          const [temp, pontoQuente, preAlarme, falha, ativo] = dadosSensor;
          return {
            numero: parseInt(sensorNum),
            temperatura: parseFloat(temp),
            pontoQuente,
            preAlarme,
            falha,
            ativo
          };
        })
      };

      this.cabos3D.push(cable);
      this.scene.add(cable);

      // Construir sensores distribuídos ao longo do cabo
      const espacamentoSensores = numSensores > 1 ? alturaCabo / (numSensores + 1) : alturaCabo / 2;

      // Inverter ordem dos sensores - começar de baixo para cima
      sensoresArray.forEach(([sensorNum, dadosSensor], sensorIndex) => {
        const [temp, pontoQuente, preAlarme, falha, ativo] = dadosSensor;

        // Posição Y do sensor (de baixo para cima)
        const posY = this.alturaArmazem - alturaCabo - 0.1 + ((sensorIndex + 1) * espacamentoSensores);

        this.buildSensor(posX, posY, posZ, temp, pontoQuente, preAlarme, falha, ativo, arcoNum, penduloNum, sensorNum);
      });

      // Label do pêndulo (sempre no topo)
      if (this.mostrarLabels) {
        this.createTextSprite(`A${arcoNum}-P${penduloNum}`, {
          x: posX,
          y: this.alturaArmazem - 0.05,
          z: posZ
        });
      }

      // Peso na extremidade (na ponta do cabo)
      const posYPeso = this.alturaArmazem - alturaCabo - 0.1;
      const weightGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.1, 8);
      const weightMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.6,
        roughness: 0.4
      });
      const weight = new THREE.Mesh(weightGeometry, weightMaterial);
      weight.position.set(posX, Math.max(posYPeso, 0.15), posZ); // Não deixar abaixo do chão
      weight.castShadow = true;
      this.scene.add(weight);
    },

    buildSensor(position, posY, posZ, temp, pontoQuente, preAlarme, falha, ativo, arcoNum, penduloNum, sensorNum) {
      // Usar a função corFaixaExata para cores precisas (igual ao Silo3D)
      const tempNum = parseFloat(temp);
      const cor = ativo ? this.corFaixaExata(tempNum) : 0xcccccc;

      // Sensor redondo e maior para facilitar cliques
      const sensorGeometry = new THREE.SphereGeometry(0.12, 16, 12);
      const sensorMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        emissive: falha ? 0xff0000 : pontoQuente ? 0xffaa00 : 0x000000,
        emissiveIntensity: falha ? 0.4 : pontoQuente ? 0.2 : 0,
        metalness: 0.3,
        roughness: 0.7
      });
      const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
      sensor.position.set(position, posY, posZ);
      sensor.castShadow = true;

      // Adicionar userData completo para permitir clique no sensor individual
      sensor.userData = {
        tipo: 'sensor_clicavel',
        arcoNum,
        penduloNum,
        sensorNum,
        temp: tempNum,
        pontoQuente,
        preAlarme,
        falha,
        ativo,
        // Criar dados do cabo correspondente para mostrar no card
        caboCompleto: {
          tipo: 'cabo',
          arcoNum,
          penduloNum,
          nome: `Arco ${arcoNum} - Pêndulo ${penduloNum}`,
          sensores: [{
            numero: parseInt(sensorNum),
            temperatura: tempNum,
            pontoQuente,
            preAlarme,
            falha,
            ativo
          }]
        }
      };

      // Adicionar à lista de objetos clicáveis
      this.cabos3D.push(sensor);
      this.scene.add(sensor);

      // Armazenar para futuras atualizações
      this.sensores3D.push(sensor);

      // Criar área invisível maior ao redor do sensor para facilitar cliques
      const areaClickGeometry = new THREE.SphereGeometry(0.2, 8, 6);
      const areaClickMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        visible: false
      });
      const areaClick = new THREE.Mesh(areaClickGeometry, areaClickMaterial);
      areaClick.position.set(position, posY, posZ);
      
      // Copiar userData do sensor para a área de clique
      areaClick.userData = { ...sensor.userData };
      
      // Adicionar à lista de objetos clicáveis
      this.cabos3D.push(areaClick);
      this.scene.add(areaClick);
    },

    buildNivelVisual() {
      if (!this.dados?.arcos) return;

      // Coletar dados de nível de todos os pêndulos usando sistema modular igual ao Silo3D
      const niveisPorPendulo = {};
      const pendulosPositions = this.calculatePenduloPositions();

      let temNivelDetectado = false;
      let penduloIndex = 0;

      Object.entries(this.dados.arcos).forEach(([arcoId, arcoData]) => {
        Object.entries(arcoData).forEach(([penduloId, sensores]) => {
          let nivelMaisAlto = 0;
          let temGraoNestePendulo = false;

          // Encontrar o sensor mais alto com grão (valor true no último índice do array)
          Object.entries(sensores).forEach(([sensorKey, valores]) => {
            const numeroSensor = parseInt(sensorKey);
            const [temp, pontoQuente, preAlarme, falha, temGrao] = valores;

            // Verificar se tem grão (último valor true) e temperatura válida
            if (temGrao && temp !== -1000 && temp !== 0 && temp !== null) {
              // Altura baseada no número do sensor * espaçamento fixo
              const alturaDoSensor = 0.5 + (numeroSensor * 0.4); // Mesmo espaçamento dos sensores
              if (alturaDoSensor > nivelMaisAlto) {
                nivelMaisAlto = alturaDoSensor;
                temGraoNestePendulo = true;
                temNivelDetectado = true;
              }
            }
          });

          if (temGraoNestePendulo && pendulosPositions[penduloIndex]) {
            const position = pendulosPositions[penduloIndex];
            niveisPorPendulo[penduloIndex] = {
              x: position[0],
              z: position[2],
              altura: nivelMaisAlto,
              pendulo: penduloId,
              arco: arcoId
            };
          }

          penduloIndex++;
        });
      });

      // Se não há nível detectado, não renderizar
      if (!temNivelDetectado || Object.keys(niveisPorPendulo).length === 0) {
        console.log('Nenhum sensor com nível detectado. Não renderizando visualização de grãos.');
        return;
      }

      // Criar visualização modular de grão (cada pêndulo independente)
      this.createModularGrainVisualization(niveisPorPendulo);
    },

    calculatePenduloPositions() {
      // Calcular posições dos pêndulos baseado no layout atual
      const positions = [];

      if (this.dados?.configuracao?.layout_topo) {
        const layoutTopo = this.dados.configuracao.layout_topo;
        Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
          if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;

          const sensoresArco = arcoData.sensores || {};
          const posXTopo = arcoData.pos_x;
          const tamanhoSVG = layoutTopo.celulas?.tamanho_svg || [600, 388];
          const posX = -this.larguraArmazem / 2 + (posXTopo / tamanhoSVG[0]) * this.larguraArmazem;

          Object.entries(sensoresArco).forEach(([penduloId, posYTopo]) => {
            const posZ = -this.profundidadeArmazem / 2 + ((posYTopo - 50) / 250) * (this.profundidadeArmazem - 2) + 1;
            positions.push([posX, 0, posZ]);
          });
        });
      } else {
        // Fallback para distribuição automática
        const numPendulos = Object.keys(this.dados?.arcos || {}).length;
        for (let i = 0; i < numPendulos; i++) {
          const posX = -this.larguraArmazem / 2 + (i / Math.max(numPendulos - 1, 1)) * this.larguraArmazem;
          positions.push([posX, 0, 0]);
        }
      }

      return positions;
    },

    createModularGrainVisualization(niveisPorPendulo) {
      // Criar um único elemento modular com volume baseado nos dados dos pêndulos
      this.createModularGrainVolume(niveisPorPendulo, 0.2); // Altura mínima do chão
    },

    createModularGrainVolume(niveisPorPendulo, alturaMinima) {
      const resolucaoX = 32;
      const resolucaoZ = 24;
      const vertices = [];
      const indices = [];
      const normals = [];
      const uvs = [];

      // Grid de altura baseado na presença de grão (true/false)
      const gridAlturas = [];

      for (let i = 0; i <= resolucaoX; i++) {
        gridAlturas[i] = [];
        for (let j = 0; j <= resolucaoZ; j++) {
          const u = i / resolucaoX;
          const v = j / resolucaoZ;

          // Posição no armazém
          const x = (-this.larguraArmazem / 2) + (u * this.larguraArmazem);
          const z = (-this.profundidadeArmazem / 2) + (v * this.profundidadeArmazem);

          // Verificar se há grão nesta posição baseado nos pêndulos
          const alturaGrao = this.calculateModularHeightAtPosition(x, z, niveisPorPendulo, alturaMinima);
          gridAlturas[i][j] = alturaGrao;
        }
      }

      // Criar vértices do chão (base sempre presente)
      for (let i = 0; i <= resolucaoX; i++) {
        for (let j = 0; j <= resolucaoZ; j++) {
          const u = i / resolucaoX;
          const v = j / resolucaoZ;
          const x = (-this.larguraArmazem / 2) + (u * this.larguraArmazem);
          const z = (-this.profundidadeArmazem / 2) + (v * this.profundidadeArmazem);

          // Vértice do chão
          vertices.push(x, alturaMinima, z);
          normals.push(0, 1, 0);
          uvs.push(u, v);
        }
      }

      // Criar vértices do topo (modulares baseados em grão)
      for (let i = 0; i <= resolucaoX; i++) {
        for (let j = 0; j <= resolucaoZ; j++) {
          const u = i / resolucaoX;
          const v = j / resolucaoZ;
          const x = (-this.larguraArmazem / 2) + (u * this.larguraArmazem);
          const z = (-this.profundidadeArmazem / 2) + (v * this.profundidadeArmazem);

          // Vértice do topo modular
          const alturaModular = gridAlturas[i][j];
          vertices.push(x, alturaModular, z);

          // Normal suavizada baseada nos vizinhos
          let normalX = 0;
          let normalZ = 0;
          if (i > 0 && i < resolucaoX) {
            normalX = (gridAlturas[i + 1][j] - gridAlturas[i - 1][j]);
          }
          if (j > 0 && j < resolucaoZ) {
            normalZ = (gridAlturas[i][j + 1] - gridAlturas[i][j - 1]);
          }
          const normalY = 1.0; // Normal para cima no topo

          const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
          normals.push(normalX / length, normalY / length, normalZ / length);
          uvs.push(u, v);
        }
      }

      const totalPontos = (resolucaoX + 1) * (resolucaoZ + 1);

      // Criar faces da base (chão)
      for (let i = 0; i < resolucaoX; i++) {
        for (let j = 0; j < resolucaoZ; j++) {
          const a = i * (resolucaoZ + 1) + j;
          const b = i * (resolucaoZ + 1) + j + 1;
          const c = (i + 1) * (resolucaoZ + 1) + j;
          const d = (i + 1) * (resolucaoZ + 1) + j + 1;

          // Faces da base (voltadas para baixo)
          indices.push(a, c, b);
          indices.push(b, c, d);
        }
      }

      // Criar faces do topo (modulares)
      for (let i = 0; i < resolucaoX; i++) {
        for (let j = 0; j < resolucaoZ; j++) {
          const a = totalPontos + i * (resolucaoZ + 1) + j;
          const b = totalPontos + i * (resolucaoZ + 1) + j + 1;
          const c = totalPontos + (i + 1) * (resolucaoZ + 1) + j;
          const d = totalPontos + (i + 1) * (resolucaoZ + 1) + j + 1;

          // Faces do topo (voltadas para cima)
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }

      // Criar faces laterais conectando chão ao topo
      for (let i = 0; i < resolucaoX; i++) {
        for (let j = 0; j < resolucaoZ; j++) {
          // Índices do chão
          const chaoA = i * (resolucaoZ + 1) + j;
          const chaoB = i * (resolucaoZ + 1) + j + 1;
          const chaoC = (i + 1) * (resolucaoZ + 1) + j;
          const chaoD = (i + 1) * (resolucaoZ + 1) + j + 1;

          // Índices do topo
          const topoA = totalPontos + chaoA;
          const topoB = totalPontos + chaoB;
          const topoC = totalPontos + chaoC;
          const topoD = totalPontos + chaoD;

          // Faces laterais (quads divididos em triangulos)
          // Lateral direita
          if (i === resolucaoX - 1) {
            indices.push(chaoC, topoC, chaoD);
            indices.push(topoC, topoD, chaoD);
          }
          // Lateral esquerda
          if (i === 0) {
            indices.push(chaoA, chaoB, topoA);
            indices.push(chaoB, topoB, topoA);
          }
          // Lateral frente
          if (j === 0) {
            indices.push(chaoA, topoA, chaoC);
            indices.push(topoA, topoC, chaoC);
          }
          // Lateral fundo
          if (j === resolucaoZ - 1) {
            indices.push(chaoB, chaoD, topoB);
            indices.push(chaoD, topoD, topoB);
          }
        }
      }

      // Criar geometria
      const geometry = new THREE.BufferGeometry();
      geometry.setIndex(indices);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

      // Recalcular normais para iluminação suave
      geometry.computeVertexNormals();

      // Material do grão modular
      const graoMaterial = new THREE.MeshStandardMaterial({
        color: 0xD4B886,
        transparent: true,
        opacity: 0.85,
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide
      });

      const graoMesh = new THREE.Mesh(geometry, graoMaterial);
      graoMesh.receiveShadow = true;
      graoMesh.castShadow = true;
      this.scene.add(graoMesh);

      // Bordas sutis para definir melhor a forma
      const edges = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0xB8A06B,
        transparent: true,
        opacity: 0.1
      });
      const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
      this.scene.add(edgeLines);
    },

    calculateModularHeightAtPosition(x, z, niveisPorPendulo, alturaMinima) {
      const pendulos = Object.values(niveisPorPendulo);

      if (pendulos.length === 0) {
        return alturaMinima; // Sem dados, mantém altura mínima (chão)
      }

      // Encontrar pêndulos próximos e calcular influência
      let somaAlturas = 0;
      let somaPesos = 0;
      let temInfluencia = false;

      pendulos.forEach(pendulo => {
        const distancia = Math.sqrt(
          Math.pow(x - pendulo.x, 2) + Math.pow(z - pendulo.z, 2)
        );

        // Raio de influência baseado na densidade de pêndulos
        const raioInfluencia = Math.min(this.larguraArmazem, this.profundidadeArmazem) * 0.25;

        if (distancia <= raioInfluencia) {
          temInfluencia = true;
          const distanciaSegura = Math.max(distancia, 0.1);
          const peso = 1 / Math.pow(distanciaSegura, 1.5); // Suavizar transição

          somaAlturas += pendulo.altura * peso;
          somaPesos += peso;
        }
      });

      if (!temInfluencia || somaPesos === 0) {
        return alturaMinima; // Área sem influência = chão apenas
      }

      // Altura interpolada com transição suave
      const alturaInterpolada = somaAlturas / somaPesos;

      // Garantir altura mínima e máxima razoável
      return Math.max(alturaMinima, Math.min(alturaInterpolada, this.alturaArmazem * 0.7));
    },

    interpolateHeightAtPosition(x, z, niveisPorPendulo, alturaMedia) {
      const pendulos = Object.values(niveisPorPendulo);

      if (pendulos.length === 0) return alturaMedia * 0.5;
      if (pendulos.length === 1) return pendulos[0].altura;

      // Usar interpolação IDW (Inverse Distance Weighting)
      let somaAlturas = 0;
      let somaPesos = 0;

      pendulos.forEach(pendulo => {
        const distancia = Math.sqrt(
          Math.pow(x - pendulo.x, 2) + Math.pow(z - pendulo.z, 2)
        );

        // Evitar divisão por zero
        const distanciaSegura = Math.max(distancia, 0.1);
        const peso = 1 / Math.pow(distanciaSegura, 2);

        somaAlturas += pendulo.altura * peso;
        somaPesos += peso;
      });

      const alturaInterpolada = somaPesos > 0 ? somaAlturas / somaPesos : alturaMedia;

      // Garantir altura razoável
      return Math.max(0.2, Math.min(alturaInterpolada, alturaMedia * 1.5));
    },

    gerarAeradoresAutomatico() {
      // Gerar aeradores em posições padrão se não existirem na API
      const aeradores = {};
      const numAeradores = 4; // Número padrão de aeradores

      for (let i = 1; i <= numAeradores; i++) {
        const posX = (i - 1) * (this.larguraArmazem / (numAeradores - 1));
        const posY = 305;
        const textoAcima = i % 2;
        aeradores[i] = [posX, posY, textoAcima];
      }

      return aeradores;
    },

    buildAeradores() {
      let aeradores = {};

      // Verificar se existe configuração de aeradores na API
      if (this.dados?.configuracao?.layout_topo?.aeradores) {
        aeradores = this.dados.configuracao.layout_topo.aeradores;
      } else {
        // Gerar posicionamento automático de aeradores
        aeradores = this.gerarAeradoresAutomatico();
        console.warn('Aeradores não encontrados na API, usando posicionamento automático');
      }

      if (Object.keys(aeradores).length === 0) {
        console.log('Nenhum aerador para construir');
        return;
      }
      const totalAeradores = Object.keys(aeradores).length;
      // Se não há aeradores, sair
      if (totalAeradores === 0) {
        console.log('Nenhum aerador para construir');
        return;
      }

      // Obter estados dos aeradores do campo AER
      let estadosAeradores = [];
      if (this.dados.AER) {
        const valoresAER = this.dados.AER.split(',').map(v => parseInt(v.trim()));
        estadosAeradores = valoresAER;
      }

      // Calcular distâncias para distribuição externa
      const margemExterna = 2.5;
      const perimetroTotal = 2 * (this.larguraArmazem + this.profundidadeArmazem);
      const espacamentoPerimetro = perimetroTotal / totalAeradores;

      Object.entries(aeradores).forEach(([aeradorId, posicao], index) => {
        const [posX2D, posY2D, textoAcima] = posicao;

        // Estratégia de posicionamento baseada na quantidade
        let posX3D, posZ3D;

        if (totalAeradores <= 4) {
          // Poucos aeradores: distribuir nos cantos
          const cantos = [
            [-this.larguraArmazem / 2 - margemExterna, -this.profundidadeArmazem / 2 - margemExterna], // Canto superior esquerdo
            [this.larguraArmazem / 2 + margemExterna, -this.profundidadeArmazem / 2 - margemExterna],  // Canto superior direito
            [this.larguraArmazem / 2 + margemExterna, this.profundidadeArmazem / 2 + margemExterna],   // Canto inferior direito
            [-this.larguraArmazem / 2 - margemExterna, this.profundidadeArmazem / 2 + margemExterna]   // Canto inferior esquerdo
          ];
          [posX3D, posZ3D] = cantos[index % 4];

        } else if (totalAeradores <= 8) {
          // Quantidade média: distribuir nos cantos e meio das bordas
          const posicoes = [
            // Cantos
            [-this.larguraArmazem / 2 - margemExterna, -this.profundidadeArmazem / 2 - margemExterna],
            [this.larguraArmazem / 2 + margemExterna, -this.profundidadeArmazem / 2 - margemExterna],
            [this.larguraArmazem / 2 + margemExterna, this.profundidadeArmazem / 2 + margemExterna],
            [-this.larguraArmazem / 2 - margemExterna, this.profundidadeArmazem / 2 + margemExterna],
            // Meio das bordas
            [0, -this.profundidadeArmazem / 2 - margemExterna], // Meio topo
            [this.larguraArmazem / 2 + margemExterna, 0],       // Meio direita
            [0, this.profundidadeArmazem / 2 + margemExterna],  // Meio fundo
            [-this.larguraArmazem / 2 - margemExterna, 0]       // Meio esquerda
          ];
          [posX3D, posZ3D] = posicoes[index % 8];

        } else {
          // Muitos aeradores: distribuir uniformemente ao redor do perímetro
          const distanciaPerimetro = index * espacamentoPerimetro;

          // Determinar em qual lado do armazém o aerador ficará
          const ladoTopo = this.larguraArmazem;
          const ladoDireita = this.profundidadeArmazem;
          const ladoFundo = this.larguraArmazem;
          const ladoEsquerda = this.profundidadeArmazem;

          if (distanciaPerimetro <= ladoTopo) {
            // Lado superior
            posX3D = -this.larguraArmazem / 2 + distanciaPerimetro;
            posZ3D = -this.profundidadeArmazem / 2 - margemExterna;
          } else if (distanciaPerimetro <= ladoTopo + ladoDireita) {
            // Lado direito
            posX3D = this.larguraArmazem / 2 + margemExterna;
            posZ3D = -this.profundidadeArmazem / 2 + (distanciaPerimetro - ladoTopo);
          } else if (distanciaPerimetro <= ladoTopo + ladoDireita + ladoFundo) {
            // Lado inferior
            posX3D = this.larguraArmazem / 2 - (distanciaPerimetro - ladoTopo - ladoDireita);
            posZ3D = this.profundidadeArmazem / 2 + margemExterna;
          } else {
            // Lado esquerdo
            posX3D = -this.larguraArmazem / 2 - margemExterna;
            posZ3D = this.profundidadeArmazem / 2 - (distanciaPerimetro - ladoTopo - ladoDireita - ladoFundo);
          }
        }

        // Usar estado do AER ou padrão
        const estado = estadosAeradores[index] !== undefined ? estadosAeradores[index] : 0;
        const statusAerador = estado > 0 ? 3 : 0; // 3 = ligado, 0 = desligado

        this.createAerador([posX3D, 0.3, posZ3D], parseInt(aeradorId), statusAerador);
      });
    },

    createAerador(position, id, status) {
      const cores = {
        0: 0x4682B4, // desligado - azul padrão do motor
        1: 0xffeb3b, // startando - amarelo
        3: 0x31dd0f, // ligado - verde
        4: 0xff0000  // erro - vermelho
      };

      // Grupo principal do aerador
      const aeradorGroup = new THREE.Group();
      aeradorGroup.position.set(position[0], position[1], position[2]);

      // Base robusta do aerador (formato industrial real)
      const baseGeometry = new THREE.CylinderGeometry(0.5, 0.55, 0.18, 20);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.3
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0.09, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      aeradorGroup.add(base);

      // Parafusos de fixação da base
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const parafusoGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8);
        const parafusoMaterial = new THREE.MeshStandardMaterial({
          color: 0x222222,
          metalness: 0.9,
          roughness: 0.1
        });
        const parafuso = new THREE.Mesh(parafusoGeometry, parafusoMaterial);
        parafuso.position.set(
          Math.cos(angle) * 0.45,
          0.2,
          Math.sin(angle) * 0.45
        );
        aeradorGroup.add(parafuso);
      }

      // Pernas de apoio robustas - formato industrial
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * Math.PI / 180;
        const x = Math.cos(angle) * 0.4;
        const z = Math.sin(angle) * 0.4;

        // Perna principal (tubo estrutural)
        const pernaGeometry = new THREE.CylinderGeometry(0.035, 0.045, 0.25, 12);
        const pernaMaterial = new THREE.MeshStandardMaterial({
          color: 0x444444,
          metalness: 0.6,
          roughness: 0.4
        });
        const perna = new THREE.Mesh(pernaGeometry, pernaMaterial);
        perna.position.set(x, -0.125, z);
        perna.castShadow = true;
        aeradorGroup.add(perna);

        // Sapata de apoio reforçada
        const sapataGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.05, 10);
        const sapata = new THREE.Mesh(sapataGeometry, pernaMaterial);
        sapata.position.set(x, -0.25, z);
        sapata.castShadow = true;
        aeradorGroup.add(sapata);

        // Diagonal de reforço estrutural
        const diagonalGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
        const diagonal = new THREE.Mesh(diagonalGeometry, pernaMaterial);
        diagonal.position.set(x * 0.7, 0.05, z * 0.7);
        diagonal.rotation.x = Math.atan2(z, x) + Math.PI / 4;
        diagonal.rotation.z = -Math.PI / 6;
        aeradorGroup.add(diagonal);

        // Reforços triangulares
        const reforcoGeometry = new THREE.ConeGeometry(0.06, 0.1, 6);
        const reforco = new THREE.Mesh(reforcoGeometry, pernaMaterial);
        reforco.position.set(x * 0.8, 0, z * 0.8);
        reforco.rotation.x = Math.PI;
        aeradorGroup.add(reforco);
      }

      // Carcaça do motor (formato industrial cilíndrico maior)
      const carcacaGeometry = new THREE.CylinderGeometry(0.15, 0.17, 0.45, 32);
      const carcacaMaterial = new THREE.MeshStandardMaterial({
        color: cores[status],
        metalness: 0.7,
        roughness: 0.3,
        emissive: status === 3 ? cores[status] : 0x000000,
        emissiveIntensity: status === 3 ? 0.1 : 0
      });
      const carcaca = new THREE.Mesh(carcacaGeometry, carcacaMaterial);
      carcaca.position.set(0, 0.405, 0);
      carcaca.castShadow = true;
      aeradorGroup.add(carcaca);

      // Aletas de refrigeração do motor mais detalhadas
      for (let i = 0; i < 16; i++) {
        const aletaGeometry = new THREE.BoxGeometry(0.32, 0.02, 0.01);
        const aletaMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          metalness: 0.8,
          roughness: 0.2
        });
        const aleta = new THREE.Mesh(aletaGeometry, aletaMaterial);
        aleta.position.set(0, 0.405 + (i - 8) * 0.025, 0);
        aeradorGroup.add(aleta);
      }

      // Tampa superior do motor com detalhes
      const tampaGeometry = new THREE.CylinderGeometry(0.16, 0.15, 0.06, 32);
      const tampaMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.8,
        roughness: 0.2
      });
      const tampa = new THREE.Mesh(tampaGeometry, tampaMaterial);
      tampa.position.set(0, 0.66, 0);
      tampa.castShadow = true;
      aeradorGroup.add(tampa);

      // Eixo do motor mais robusto
      const eixoGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 16);
      const eixoMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.1
      });
      const eixo = new THREE.Mesh(eixoGeometry, eixoMaterial);
      eixo.position.set(0, 0.82, 0);
      eixo.castShadow = true;
      aeradorGroup.add(eixo);

      

      // Hélice realista de grande porte horizontal (posição mais baixa)
      const heliceGroup = new THREE.Group();
      heliceGroup.position.set(0, 0.85, 0); // Posição mais baixa

      // Hub central da hélice menor e cinza claro
      const hubGeometry = new THREE.CylinderGeometry(0.06, 0.075, 0.1, 16); // Menor
      const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0xB0B0B0, // Cinza claro
        metalness: 0.6,
        roughness: 0.3
      });
      const hub = new THREE.Mesh(hubGeometry, hubMaterial);
      // Rotacionar o hub para ficar horizontal
      hub.rotation.z = Math.PI / 2;
      heliceGroup.add(hub);

      // Pás da hélice arredondadas industriais menores e mais magras (3 pás)
      for (let j = 0; j < 3; j++) {
        const angle = (j * 120) * Math.PI / 180;

        // Criar pá arredondada usando geometria customizada menor e mais magra
        const paGroup = new THREE.Group();
        
        // Material das pás cinza claro
        const paMaterial = new THREE.MeshStandardMaterial({
          color: 0xC0C0C0, // Cinza claro
          metalness: 0.5,
          roughness: 0.3
        });

        // Criar forma arredondada da pá usando menos segmentos e mais magra
        const segmentos = 8;
        for (let k = 0; k < segmentos; k++) {
          const t = k / (segmentos - 1);
          const raio = 0.03 + (0.06 * Math.sin(t * Math.PI)); // Menor e mais magra
          const distancia = 0.05 + (t * 0.22); // Menor alcance
          
          const segmentoGeometry = new THREE.SphereGeometry(raio, 12, 8);
          segmentoGeometry.scale(1, 0.1, 1.2); // Mais magra e achatada
          
          const segmento = new THREE.Mesh(segmentoGeometry, paMaterial);
          segmento.position.set(distancia, 0, 0);
          segmento.castShadow = true;
          paGroup.add(segmento);
        }

        // Ponta arredondada da pá menor e mais magra
        const pontaGeometry = new THREE.SphereGeometry(0.05, 12, 8);
        pontaGeometry.scale(0.6, 0.1, 1.2); // Mais magra
        const ponta = new THREE.Mesh(pontaGeometry, paMaterial);
        ponta.position.set(0.28, 0, 0); // Menor alcance
        ponta.castShadow = true;
        paGroup.add(ponta);

        // Base da pá menor e mais magra
        const baseGeometry = new THREE.SphereGeometry(0.03, 8, 6);
        baseGeometry.scale(1, 0.15, 1.0); // Mais magra
        const base = new THREE.Mesh(baseGeometry, paMaterial);
        base.position.set(0.025, 0, 0);
        base.castShadow = true;
        paGroup.add(base);

        // Posicionar e rotacionar a pá com mais espaço entre elas
        paGroup.position.set(
          Math.cos(angle) * 0.03, // Mais afastada do centro
          0,
          Math.sin(angle) * 0.03
        );
        paGroup.rotation.y = angle;
        paGroup.rotation.z = Math.PI / 18; // Inclinação mais sutil

        heliceGroup.add(paGroup);
      }

      // Parafusos do hub menores
      for (let j = 0; j < 8; j++) {
        const angle = (j * 45) * Math.PI / 180;
        const parafusoGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6);
        const parafuso = new THREE.Mesh(parafusoGeometry, hubMaterial);
        parafuso.position.set(
          Math.cos(angle) * 0.04,
          0,
          Math.sin(angle) * 0.04
        );
        parafuso.rotation.z = Math.PI / 2;
        heliceGroup.add(parafuso);
      }

      // Anel de reforço do hub menor
      const anelGeometry = new THREE.TorusGeometry(0.045, 0.005, 6, 16);
      const anel = new THREE.Mesh(anelGeometry, hubMaterial);
      anel.rotation.x = Math.PI / 2;
      heliceGroup.add(anel);

      aeradorGroup.add(heliceGroup);

      // Armazenar para animação se ligado
      if (status === 3) {
        this.aeradorHélices.push(heliceGroup);
      }

      // Caixa de conexão elétrica mais detalhada
      const caixaGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.06);
      const caixaMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.3,
        roughness: 0.7
      });
      const caixa = new THREE.Mesh(caixaGeometry, caixaMaterial);
      caixa.position.set(0.25, 0.4, 0);
      caixa.castShadow = true;
      aeradorGroup.add(caixa);

      // Tampa da caixa elétrica
      const tampaCaixaGeometry = new THREE.BoxGeometry(0.13, 0.02, 0.07);
      const tampaCaixa = new THREE.Mesh(tampaCaixaGeometry, caixaMaterial);
      tampaCaixa.position.set(0.25, 0.45, 0);
      aeradorGroup.add(tampaCaixa);

      // Eletrodutos múltiplos
      for (let i = 0; i < 2; i++) {
        const eletrodutoGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8);
        const eletroduto = new THREE.Mesh(eletrodutoGeometry, caixaMaterial);
        eletroduto.position.set(0.25 + (i * 0.03), 0.18, 0);
        aeradorGroup.add(eletroduto);
      }

      // Fundação de concreto
      const fundacaoGeometry = new THREE.CylinderGeometry(0.6, 0.65, 0.1, 16);
      const fundacaoMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1
      });
      const fundacao = new THREE.Mesh(fundacaoGeometry, fundacaoMaterial);
      fundacao.position.set(0, -0.3, 0);
      fundacao.receiveShadow = true;
      aeradorGroup.add(fundacao);

      this.scene.add(aeradorGroup);

      // Placa de identificação industrial
      const placaGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.008);
      const placaMaterial = new THREE.MeshStandardMaterial({
        color: 0x2E86AB,
        metalness: 0.1,
        roughness: 0.8
      });
      const placa = new THREE.Mesh(placaGeometry, placaMaterial);
      placa.position.set(0, 0.5, 0.18);
      aeradorGroup.add(placa);

      // LED indicador de status mais realista
      const ledGeometry = new THREE.CylinderGeometry(0.01, 0.012, 0.025, 8);
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: cores[status],
        emissive: status === 3 ? cores[status] : 0x000000,
        emissiveIntensity: status === 3 ? 0.8 : 0,
        transparent: true,
        opacity: 0.9
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(0.08, 0.5, 0.18);
      aeradorGroup.add(led);

      // Efeito de luz quando ligado
      if (status === 3) {
        const luzLed = new THREE.PointLight(cores[status], 0.4, 1.5);
        luzLed.position.set(0.08, 0.5, 0.18);
        aeradorGroup.add(luzLed);

        // Luz adicional na hélice
        const luzHelice = new THREE.PointLight(0xffffff, 0.2, 2);
        luzHelice.position.set(0, 1.0, 0);
        aeradorGroup.add(luzHelice);
      }

      // Vibrações visuais quando ligado
      if (status === 3) {
        const originalPosition = aeradorGroup.position.clone();
        aeradorGroup.userData.originalPosition = originalPosition;
        aeradorGroup.userData.isVibrating = true;
      }
    },

    buildGroundGrid() {
      const gridSize = Math.max(this.larguraArmazem, this.profundidadeArmazem) * 2;
      const divisions = 20;
      const step = gridSize / divisions;

      // Linhas horizontais
      for (let i = 0; i <= divisions; i++) {
        const geometry = new THREE.BoxGeometry(gridSize, 0.02, 0.02);
        const material = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const line = new THREE.Mesh(geometry, material);
        line.position.set(0, -0.5, (i - divisions / 2) * step);
        this.scene.add(line);
      }

      // Linhas verticais
      for (let i = 0; i <= divisions; i++) {
        const geometry = new THREE.BoxGeometry(0.02, 0.02, gridSize);
        const material = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const line = new THREE.Mesh(geometry, material);
        line.position.set((i - divisions / 2) * step, -0.5, 0);
        this.scene.add(line);
      }
    },

    corPorTemperatura(temp, falha, ativo) {
      // Usar exatamente a mesma lógica do Silo3D.vue
      if (falha || temp === -1000) return 0xff0000;
      if (!ativo) return 0xcccccc;

      // Lógica de faixas exatas igual ao Silo3D
      if (temp < 12) return 0x0384fc;
      else if (temp < 15) return 0x03e8fc;
      else if (temp < 17) return 0x03fcbe;
      else if (temp < 21) return 0x07fc03;
      else if (temp < 25) return 0xc3ff00;
      else if (temp < 27) return 0xfcf803;
      else if (temp < 30) return 0xffb300;
      else if (temp < 35) return 0xff2200;
      else if (temp < 50) return 0xff0090;
      else return 0xf700ff;
    },

    // Adicionar função para criar cores exatas (igual ao Silo3D)
    corFaixaExata(t) {
      if (t === -1000) return 0xff0000;
      if (t < 12) return 0x0384fc;
      else if (t < 15) return 0x03e8fc;
      else if (t < 17) return 0x03fcbe;
      else if (t < 21) return 0x07fc03;
      else if (t < 25) return 0xc3ff00;
      else if (t < 27) return 0xfcf803;
      else if (t < 30) return 0xffb300;
      else if (t < 35) return 0xff2200;
      else if (t < 50) return 0xff0090;
      else return 0xf700ff;
    },

    createTextSprite(text, position, scale = 0.4) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;

      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = 'white';
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.fillText(text, canvas.width / 2, canvas.height / 2 + 5);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(position.x, position.y, position.z);
      sprite.scale.set(scale, scale * 0.5, 1);
      sprite.renderOrder = 1000;
      this.scene.add(sprite);
      this.textSprites.push(sprite);
    },

    toggleLabels() {
      this.textSprites.forEach(sprite => {
        sprite.visible = this.mostrarLabels;
      });
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);

      // Rotação automática
      if (this.autoRotate && !this.isMouseDown) {
        this.cameraTheta += 0.005;
        this.updateCameraPosition();
      }

      // Animar hélices dos aeradores
      this.aeradorHélices.forEach(helice => {
        helice.rotation.y += 0.8; // Velocidade aumentada para aeradores industriais
      });

      // Animar vibrações dos aeradores ligados
      const time = Date.now() * 0.01;
      this.scene.traverse((child) => {
        if (child.userData && child.userData.isVibrating) {
          const originalPos = child.userData.originalPosition;
          child.position.x = originalPos.x + Math.sin(time * 2.2) * 0.003;
          child.position.y = originalPos.y + Math.cos(time * 1.8) * 0.002;
          child.position.z = originalPos.z + Math.sin(time * 2.5) * 0.003;
        }
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    updateVisualization() {
      // Limpar cena
      while (this.scene.children.length > 0) {
        const child = this.scene.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
        this.scene.remove(child);
      }

      // Limpar arrays
      this.aeradorHélices = [];
      this.textSprites = [];
      this.sensores3D = [];
      this.cabos3D = [];

      // Reconstruir
      this.setupLighting();
      this.buildArmazemStructure();
      this.buildPendulos();
      this.buildAeradores();
      this.buildGroundGrid();
      this.buildNivelVisual();
    },

    onWindowResize() {
      if (!this.camera || !this.renderer) return;

      const container = this.$refs.canvasContainer;
      if (!container) return;

      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    },

    carregarConfiguracoesDisponiveis() {
      const prefixo = 'configArmazem_';
      const configs = [];

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const chave = localStorage.key(i);
          if (chave && chave.startsWith(prefixo)) {
            const nome = chave.replace(prefixo, '');
            configs.push(nome);
          }
        }
      }

      this.configuracoesDisponiveis = configs.sort();
    },

    aplicarConfiguracao3D() {
      if (!this.configuracaoSelecionada) {
        this.configuracaoModelador = null;
        this.reconstruirArmazem3D();
        return;
      }

      if (typeof localStorage !== 'undefined') {
        const chave = `configArmazem_${this.configuracaoSelecionada}`;
        const configSalva = localStorage.getItem(chave);

        if (configSalva) {
          try {
            const configData = JSON.parse(configSalva);
            this.configuracaoModelador = configData;

            // Aplicar dimensões baseadas na configuração
            this.aplicarDimensoes3D(configData);

            // Reconstruir armazém com nova configuração
            this.reconstruirArmazem3D();

            console.log('Configuração 3D aplicada:', configData.nome);
          } catch (error) {
            console.error('Erro ao aplicar configuração 3D:', error);
          }
        }
      }
    },

    aplicarDimensoes3D(configData) {
      // Extrair configuração baseada no modelo ou usar padrão
      let config;

      if (configData.tipo === 'configuracao_armazem_hierarquica') {
        config = configData.configuracaoPadrao || {};
      } else if (configData.configuracaoPadrao) {
        config = configData.configuracaoPadrao;
      } else {
        config = configData;
      }

      // Converter dimensões 2D para 3D (escala 1:100)
      this.larguraArmazem = (config.lb || 350) / 100 * 7; // 350px = ~25m
      this.profundidadeArmazem = (config.pb || 185) / 100 * 6.5; // 185px = ~12m
      this.alturaArmazem = (config.ht || 50) / 100 * 12; // 50px = ~6m

      console.log('Dimensões 3D aplicadas:', {
        largura: this.larguraArmazem,
        profundidade: this.profundidadeArmazem,
        altura: this.alturaArmazem
      });
    },

    mudarArco3D() {
      console.log('Mudando para arco 3D:', this.arcoAtual);
      // Lógica específica para mudança de arco no 3D pode ser implementada aqui
      // Por enquanto, apenas log para debug
    },

    getModeloAtualInfo() {
      if (!this.configuracaoModelador) return 'Padrão';

      if (this.configuracaoModelador.tipo === 'configuracao_armazem_hierarquica') {
        const modeloParaArco = this.determinarModeloParaArco3D(this.arcoAtual);
        return modeloParaArco ? modeloParaArco.nome : 'Modelo Padrão';
      }

      return this.configuracaoModelador.nome || 'Configuração Aplicada';
    },

    determinarModeloParaArco3D(numeroArco) {
      if (!this.configuracaoModelador || !this.configuracaoModelador.configModelos) {
        return null;
      }

      const configModelos = this.configuracaoModelador.configModelos;
      const quantidadeModelos = configModelos.quantidadeModelos || 1;
      const totalArcos = this.analiseArcos?.totalArcos || 1;

      if (quantidadeModelos === 1) {
        return Object.values(configModelos.modelosDefinidos || {})[0] || null;
      }

      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1;
        const posicaoProcurada = isImpar ? 'impar' : 'par';
        return Object.values(configModelos.modelosDefinidos || {}).find(modelo =>
          modelo && modelo.posicao === posicaoProcurada
        ) || null;
      }

      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          return Object.values(configModelos.modelosDefinidos || {}).find(modelo =>
            modelo && modelo.posicao === 'frente_fundo'
          ) || null;
        }
        const isParIntermediario = numeroArco % 2 === 0;
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar';
        return Object.values(configModelos.modelosDefinidos || {}).find(modelo =>
          modelo && modelo.posicao === posicaoProcurada
        ) || null;
      }

      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          return Object.values(configModelos.modelosDefinidos || {}).find(modelo =>
            modelo && modelo.posicao === 'frente'
          ) || null;
        }
        if (numeroArco === totalArcos) {
          return Object.values(configModelos.modelosDefinidos || {}).find(modelo =>
            modelo && modelo.posicao === 'fundo'
          ) || null;
        }
        const isParIntermediario = numeroArco % 2 === 0;
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar';
        return Object.values(configModelos.modelosDefinidos || {}).find(modelo =>
          modelo && modelo.posicao === posicaoProcurada
        ) || null;
      }

      return null;
    },

    reconstruirArmazem3D() {
      if (!this.scene) return;

      // Limpar estruturas existentes (exceto sensores e nível para preservar dados)
      const objetosParaRemover = [];
      this.scene.traverse((child) => {
        if (child.userData && child.userData.tipo === 'estrutura_armazem') {
          objetosParaRemover.push(child);
        }
      });

      objetosParaRemover.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
        this.scene.remove(obj);
      });

      // Reconstruir apenas a estrutura
      this.buildArmazemStructure();
    },

    getConfiguracao3DAtual() {
      if (!this.configuracaoModelador) {
        return {
          // Configuração padrão
          pb: 185, lb: 350, hb: 30, hf: 6, lf: 250, le: 15, ht: 50,
          tipo_telhado: 1, curvatura_topo: 30, pontas_redondas: false,
          raio_pontas: 15, estilo_laterais: 'reta', curvatura_laterais: 0,
          tipo_fundo: 0, altura_fundo_reto: 10
        };
      }

      if (this.configuracaoModelador.tipo === 'configuracao_armazem_hierarquica') {
        const modeloParaArco = this.determinarModeloParaArco3D(this.arcoAtual);
        if (modeloParaArco && modeloParaArco.configuracao) {
          return modeloParaArco.configuracao;
        }
        return this.configuracaoModelador.configuracaoPadrao || {};
      }

      return this.configuracaoModelador.configuracaoPadrao || this.configuracaoModelador;
    },

    detectarCliqueCabo(event, container) {
      if (this.isMouseDown) return; // Ignorar se estava arrastando

      const rect = container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Verificar interseção com cabos e sensores
      const intersects = this.raycaster.intersectObjects(this.cabos3D);

      if (intersects.length > 0) {
        const objeto = intersects[0].object;
        
        if (objeto.userData.tipo === 'cabo') {
          // Clicou no cabo - mostrar informações do cabo completo
          this.mostrarInfoCabo(objeto.userData);
        } else if (objeto.userData.tipo === 'sensor_clicavel') {
          // Clicou em um sensor individual - usar dados do cabo correspondente
          if (objeto.userData.caboCompleto) {
            // Buscar todos os sensores do mesmo pêndulo para mostrar informações completas
            this.mostrarInfoCaboDoSensor(objeto.userData);
          } else {
            // Fallback - mostrar apenas este sensor
            this.mostrarInfoCabo(objeto.userData.caboCompleto || {
              tipo: 'cabo',
              nome: `Arco ${objeto.userData.arcoNum} - Pêndulo ${objeto.userData.penduloNum}`,
              sensores: [{
                numero: objeto.userData.sensorNum,
                temperatura: objeto.userData.temp,
                pontoQuente: objeto.userData.pontoQuente,
                preAlarme: objeto.userData.preAlarme,
                falha: objeto.userData.falha,
                ativo: objeto.userData.ativo
              }]
            });
          }
        }
      }
    },

    mostrarInfoCaboDoSensor(dadosSensor) {
      // Buscar todos os sensores do mesmo pêndulo nos dados originais
      const arcoNum = dadosSensor.arcoNum;
      const penduloNum = dadosSensor.penduloNum;
      
      if (this.dados?.arcos?.[arcoNum]?.[penduloNum]) {
        const sensoresCompletos = this.dados.arcos[arcoNum][penduloNum];
        
        const caboCompleto = {
          tipo: 'cabo',
          arcoNum,
          penduloNum,
          nome: `Arco ${arcoNum} - Pêndulo ${penduloNum}`,
          sensores: Object.entries(sensoresCompletos).map(([sensorNum, dadosSensor]) => {
            const [temp, pontoQuente, preAlarme, falha, ativo] = dadosSensor;
            return {
              numero: parseInt(sensorNum),
              temperatura: parseFloat(temp),
              pontoQuente,
              preAlarme,
              falha,
              ativo
            };
          })
        };
        
        this.mostrarInfoCabo(caboCompleto);
      } else {
        // Fallback - usar dados do sensor individual
        this.mostrarInfoCabo(dadosSensor.caboCompleto);
      }
    },

    mostrarInfoCabo(dadosCabo) {
      this.caboSelecionado = dadosCabo;
      this.mostrarCardCabo = true;
    },

    fecharCardCabo() {
      this.mostrarCardCabo = false;
      this.caboSelecionado = null;
    },

    getCorSensor(temperatura, ativo, falha) {
      if (falha) return '#ff0000';
      if (!ativo) return '#cccccc';

      // Usar mesma lógica de cores dos outros componentes
      const temp = parseFloat(temperatura);
      if (temp < 12) return '#0384fc';
      else if (temp < 15) return '#03e8fc';
      else if (temp < 17) return '#03fcbe';
      else if (temp < 21) return '#07fc03';
      else if (temp < 25) return '#c3ff00';
      else if (temp < 27) return '#fcf803';
      else if (temp < 30) return '#ffb300';
      else if (temp < 35) return '#ff2200';
      else if (temp < 50) return '#ff0090';
      else return '#f700ff';
    },

    calcularMediaTemperatura(sensores) {
      const sensoresAtivos = sensores.filter(s => s.ativo && !s.falha && s.temperatura !== -1000);
      if (sensoresAtivos.length === 0) return '--';

      const soma = sensoresAtivos.reduce((acc, sensor) => acc + sensor.temperatura, 0);
      return (soma / sensoresAtivos.length).toFixed(1);
    },

    iniciarArrastoCard(event) {
      this.arrastando = true;
      const rect = this.$refs.cardCabo.getBoundingClientRect();
      this.offsetX = event.clientX - rect.left;
      this.offsetY = event.clientY - rect.top;

      document.addEventListener('mousemove', this.arrastarCard);
      document.addEventListener('mouseup', this.pararArrastoCard);
      event.preventDefault();
    },

    arrastarCard(event) {
      if (!this.arrastando) return;

      const card = this.$refs.cardCabo;
      if (!card) return;

      const x = event.clientX - this.offsetX;
      const y = event.clientY - this.offsetY;

      // Limitar às bordas da tela
      const maxX = window.innerWidth - card.offsetWidth;
      const maxY = window.innerHeight - card.offsetHeight;

      const limitedX = Math.max(0, Math.min(x, maxX));
      const limitedY = Math.max(0, Math.min(y, maxY));

      card.style.left = `${limitedX}px`;
      card.style.top = `${limitedY}px`;
      card.style.right = 'auto';
    },

    pararArrastoCard() {
      this.arrastando = false;
      document.removeEventListener('mousemove', this.arrastarCard);
      document.removeEventListener('mouseup', this.pararArrastoCard);
    },

    iniciarArrastoCardConfig(event) {
      this.arrastandoConfig = true;
      const rect = this.$refs.cardConfig.getBoundingClientRect();
      this.offsetXConfig = event.clientX - rect.left;
      this.offsetYConfig = event.clientY - rect.top;

      document.addEventListener('mousemove', this.arrastarCardConfig);
      document.addEventListener('mouseup', this.pararArrastoCardConfig);
      event.preventDefault();
    },

    arrastarCardConfig(event) {
      if (!this.arrastandoConfig) return;

      const card = this.$refs.cardConfig;
      if (!card) return;

      const x = event.clientX - this.offsetXConfig;
      const y = event.clientY - this.offsetYConfig;

      // Limitar às bordas da tela
      const maxX = window.innerWidth - card.offsetWidth;
      const maxY = window.innerHeight - card.offsetHeight;

      const limitedX = Math.max(0, Math.min(x, maxX));
      const limitedY = Math.max(0, Math.min(y, maxY));

      card.style.left = `${limitedX}px`;
      card.style.top = `${limitedY}px`;
      card.style.right = 'auto';
    },

    pararArrastoCardConfig() {
      this.arrastandoConfig = false;
      document.removeEventListener('mousemove', this.arrastarCardConfig);
      document.removeEventListener('mouseup', this.pararArrastoCardConfig);
    },

    cleanup() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      if (this.renderer) {
        const container = this.$refs.canvasContainer;
        if (container && this.renderer.domElement) {
          container.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
      }

      // Limpar texturas
      this.textSprites.forEach(sprite => {
        if (sprite.material.map) {
          sprite.material.map.dispose();
        }
        sprite.material.dispose();
      });

      window.removeEventListener('resize', this.onWindowResize);
    }
  }
};
</script>

<style scoped>
canvas {
  display: block;
}

label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

input[type="checkbox"] {
  margin: 0;
}
</style>