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

    <!-- Controles simples -->
    <div
      style="position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.9); padding: 10px; border-radius: 5px;">
      <label style="display: block; margin-bottom: 5px;">
        <input type="checkbox" v-model="autoRotate" />
        Rotação Automática
      </label>
      <label style="display: block; margin-bottom: 5px;">
        <input type="checkbox" v-model="mostrarLabels" />
        Mostrar Labels
      </label>
      <div style="margin-top: 10px;">
        <small style="display: block;">Sensores: {{ totalSensores }}</small>
        <small style="display: block;">Pêndulos: {{ totalPendulos }}</small>
        <small v-if="erroAPI" style="display: block; color: red;">Modo offline</small>
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

      // Configurações do armazém
      alturaArmazem: 6,
      larguraArmazem: 25,
      profundidadeArmazem: 12,

      // Configuração da API
      apiConfig: {
        url: 'https://cloud.pce-eng.com.br/cloud/api/public/api/armazem/buscardado/130?celula=1&leitura=1&data=2025-08-07%2008:03:36',
        token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0L2Nsb3VkL2FwaS9wdWJsaWMvYXBpL2xvZ2luIiwiaWF0IjoxNzU0NTY2MjAxLCJleHAiOjE3NTU3NzU4MDEsIm5iZiI6MTc1NDU2NjIwMSwianRpIjoiR3JlVEZ6dE83eWcxTE5aaiIsInN1YiI6IjEzIiwicHJ2IjoiNTg3MDg2M2Q0YTYyZDc5MTQ0M2ZhZjkzNmZjMzY4MDMxZDExMGM0ZiIsInVzZXIiOnsiaWRfdXN1YXJpbyI6MTMsIm5tX3VzdWFyaW8iOiJJdmFuIEphY3F1ZXMiLCJlbWFpbCI6Iml2YW4uc2lsdmFAcGNlLWVuZy5jb20uYnIiLCJ0ZWxlZm9uZSI6bnVsbCwiY2VsdWxhciI6bnVsbCwic3RfdXN1YXJpbyI6IkEiLCJpZF9pbWFnZW0iOjM4LCJsb2dhZG8iOiJTIiwidXN1YXJpb3NfcGVyZmlzIjpbeyJpZF9wZXJmaWwiOjEwLCJubV9wZXJmaWwiOiJBZG1pbmlzdHJhZG9yIGRvIFBvcnRhbCIsImNkX3BlcmZpbCI6IkFETUlOUE9SVEEiLCJ0cmFuc2Fjb2VzIjpbXX1dLCJpbWFnZW0iOnsiaWRfaW1hZ2VtIjozOCwidHBfaW1hZ2VtIjoiVSIsImRzX2ltYWdlbSI6bnVsbCwiY2FtaW5obyI6InVwbG9hZHMvdXN1YXJpb3MvMTcyOTc3MjA3OV9yYl80NzA3LnBuZyIsImV4dGVuc2FvIjoicG5nIn19fQ.GHXrVfXk1nIm4gKbFtIDRS97B5Evet0PQHxvDDtLBGg'
      },
    };
  },
  mounted() {
    this.carregarDados();
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

        // Fazer chamada à API
        const response = await axios.get(this.apiConfig.url, {
          params: this.apiConfig.params,
          headers: {
            'Authorization': this.apiConfig.token,
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
      this.scene.add(base);

      // Material das paredes
      const paredeMaterial = new THREE.MeshStandardMaterial({
        color: corParede,
        transparent: true,
        opacity: 0.4
      });

      // Paredes laterais (retas) - agora nas laterais esquerda e direita
      const paredeLateralGeometry = new THREE.BoxGeometry(this.larguraArmazem, this.alturaArmazem, espessuraParede);

      // Parede esquerda (lateral)
      const paredeEsquerda = new THREE.Mesh(paredeLateralGeometry, paredeMaterial);
      paredeEsquerda.position.set(0, this.alturaArmazem / 2, -this.profundidadeArmazem / 2);
      paredeEsquerda.castShadow = true;
      this.scene.add(paredeEsquerda);

      // Parede direita (lateral)
      const paredeDireita = new THREE.Mesh(paredeLateralGeometry, paredeMaterial);
      paredeDireita.position.set(0, this.alturaArmazem / 2, this.profundidadeArmazem / 2);
      paredeDireita.castShadow = true;
      this.scene.add(paredeDireita);

      // Paredes frontais triangulares (frente e fundo para alinhar com o telhado)
      this.buildParedesTriangulares(paredeMaterial, espessuraParede);

      // Telhado em duas águas
      this.buildTelhado(corTelhado);

      // Vigas estruturais
      this.buildVigas();
    },

    buildParedesTriangulares(paredeMaterial, espessuraParede) {
      const alturaTelhado = this.alturaArmazem + 0.6;
      const inclinacaoTelhado = Math.PI / 12;

      // Criar shape que segue exatamente o formato do telhado em V
      const shape = new THREE.Shape();

      // Começar da base esquerda
      shape.moveTo(-this.profundidadeArmazem / 2, 0);

      // Ir para base direita
      shape.lineTo(this.profundidadeArmazem / 2, 0);

      // Subir verticalmente até a altura da parede reta
      shape.lineTo(this.profundidadeArmazem / 2, this.alturaArmazem);

      // Calcular onde o telhado começa a inclinar (exatamente na borda do telhado)
      const inicioProfundidadeTelhado = this.profundidadeArmazem / 4; // Onde começa a inclinação

      // Altura no ponto onde começa a inclinação do telhado
      const alturaInicioInclinacao = alturaTelhado - (inicioProfundidadeTelhado * Math.tan(inclinacaoTelhado));

      // Seguir a inclinação do telhado do lado direito
      shape.lineTo(inicioProfundidadeTelhado, alturaInicioInclinacao);

      // Ir até o pico central (cumeeira)
      shape.lineTo(0, alturaTelhado);

      // Descer seguindo a inclinação do telhado do lado esquerdo
      shape.lineTo(-inicioProfundidadeTelhado, alturaInicioInclinacao);

      // Descer verticalmente até a altura da parede reta
      shape.lineTo(-this.profundidadeArmazem / 2, this.alturaArmazem);

      // Fechar voltando à base
      shape.lineTo(-this.profundidadeArmazem / 2, 0);

      // Geometria extrudada
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
      this.scene.add(paredeFrente);

      // Parede traseira
      const paredeTras = new THREE.Mesh(paredeTriangularGeometry, paredeMaterial);
      paredeTras.position.set(this.larguraArmazem / 2, 0, 0);
      paredeTras.rotation.y = -Math.PI / 2;
      paredeTras.castShadow = true;
      this.scene.add(paredeTras);
    },

    buildTelhado(cor) {
      // Ajustar as dimensões para ter melhor alinhamento
      const extensaoTelhado = 0.8; // Reduzir a extensão para não ultrapassar tanto
      const telhadoGeometry = new THREE.BoxGeometry(this.larguraArmazem + extensaoTelhado, 0.1, this.profundidadeArmazem / 2 + 0.2);
      const telhadoMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        metalness: 0.1,
        roughness: 0.8
      });

      const alturaTelhado = this.alturaArmazem + 0.6;
      const inclinacao = Math.PI / 12;

      // Primeira parte do telhado (inclinada)
      const telhado1 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado1.position.set(0, alturaTelhado, -this.profundidadeArmazem / 4);
      telhado1.rotation.x = -inclinacao;
      telhado1.castShadow = true;
      this.scene.add(telhado1);

      // Segunda parte do telhado (inclinada)
      const telhado2 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado2.position.set(0, alturaTelhado, this.profundidadeArmazem / 4);
      telhado2.rotation.x = inclinacao;
      telhado2.castShadow = true;
      this.scene.add(telhado2);

      // Cumeeira (linha central do telhado) - ajustar largura
      const cumeeiraGeometry = new THREE.BoxGeometry(this.larguraArmazem + extensaoTelhado + 0.1, 0.12, 0.15);
      const cumeeira = new THREE.Mesh(cumeeiraGeometry, telhadoMaterial);
      cumeeira.position.set(0, alturaTelhado + 0.2, 0);
      cumeeira.castShadow = true;
      this.scene.add(cumeeira);
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

      // Sensor redondo e maior
      const sensorGeometry = new THREE.SphereGeometry(0.08, 12, 8);
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
      sensor.userData = { temp: tempNum, arcoNum, penduloNum, sensorNum, ativo, falha };
      this.scene.add(sensor);

      // Armazenar para futuras atualizações
      this.sensores3D.push(sensor);

      // Label do sensor se mostrar labels estiver ativo
      if (this.mostrarLabels && temp !== undefined) {
        const textoLabel = falha ? "ERR" : `${tempNum.toFixed(1)}°C`;
        this.createTextSprite(textoLabel, {
          x: position + 0.1,
          y: posY,
          z: posZ
        }, 0.2);
      }
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
      // Criar superfície única e moldável como no Silo3D.vue
      this.createGrainSurfaceWithRelief(niveisPorPendulo);
    },

    createGrainSurfaceWithRelief(niveisPorPendulo) {
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
        0: 0xc5c5c5, // desligado
        1: 0xffeb3b, // startando
        3: 0x31dd0f, // ligado
        4: 0xff0000  // erro
      };

      // Base do motor
      const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.15, 12);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: cores[status] || cores[0],
        metalness: 0.3,
        roughness: 0.7
      });
      const baseMotor = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMotor.position.set(position[0], position[1], position[2]);
      baseMotor.castShadow = true;
      this.scene.add(baseMotor);

      // Grupo para rotação das hélices
      const heliceGroup = new THREE.Group();
      heliceGroup.position.set(position[0], position[1] + 0.1, position[2]);

      // Hélices (3 pás)
      for (let i = 0; i < 3; i++) {
        const angle = (i * 120 * Math.PI) / 180;
        const paGeometry = new THREE.BoxGeometry(0.2, 0.02, 0.04);
        const paMaterial = new THREE.MeshStandardMaterial({
          color: 0xf0f0f0,
          metalness: 0.1,
          roughness: 0.8
        });
        const pa = new THREE.Mesh(paGeometry, paMaterial);
        pa.position.set(
          Math.cos(angle) * 0.12,
          0,
          Math.sin(angle) * 0.12
        );
        pa.rotation.y = angle;
        pa.castShadow = true;
        heliceGroup.add(pa);
      }

      this.scene.add(heliceGroup);

      // Armazenar para rotação se ligado
      if (status === 3) {
        this.aeradorHélices.push(heliceGroup);
      }

      // Label
      if (this.mostrarLabels) {
        this.createTextSprite(`AE-${id}`, {
          x: position[0],
          y: position[1] + 0.3,
          z: position[2]
        });
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
        helice.rotation.y += 0.1;
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