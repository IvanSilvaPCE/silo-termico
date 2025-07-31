<template>
  <div style="width: 100%; height: 100vh;">
    <!-- Controles -->
    <div style="position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 8px; font-size: 13px; max-width: 300px;">
      <div><strong>🏭 Armazém 3D - Monitoramento Real</strong></div>
      <hr style="margin: 8px 0; border-color: #444;" />

      <!-- Dados Globais -->
      <div><strong>📊 Estatísticas:</strong></div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 5px 0;">
        <div>Arcos: <span style="color: #4CAF50;">{{ totalArcos }}</span></div>
        <div>Pêndulos: <span style="color: #2196F3;">{{ totalPendulos }}</span></div>
        <div>Sensores: <span style="color: #FF9800;">{{ totalSensores }}</span></div>
        <div>Aeradores: <span style="color: #9C27B0;">{{ totalAeradores }}</span></div>
      </div>

      <!-- Dados Portal -->
      <hr style="margin: 8px 0; border-color: #444;" />
      <div><strong>🌡️ Portal:</strong></div>
      <div style="font-size: 12px; margin: 5px 0;">
        <div>Nível: <span style="color: #00BCD4;">{{ dadosPortal?.NIV || 0 }}</span> | Volume: <span style="color: #607D8B;">{{ dadosPortal?.VOL || 0 }}</span></div>
        <div>Umidade: <span style="color: #8BC34A;">{{ dadosPortal?.UMC || 0 }}%</span> | Temp: <span style="color: #FFC107;">{{ dadosPortal?.TMS || 0 }}°C</span></div>
        <div>Aeradores: <span style="color: #E91E63;">{{ dadosPortal?.AER || 'N/A' }}</span></div>
      </div>

      <!-- Controles -->
      <hr style="margin: 8px 0; border-color: #444;" />
      <div style="margin-top: 10px;">
        <label style="display: flex; align-items: center; margin-bottom: 8px;">
          <input type="checkbox" v-model="autoRotate" style="margin-right: 8px;" />
          🔄 Rotação Automática
        </label>
        <div style="margin-top: 8px;">
          <label style="display: flex; align-items: center; margin-bottom: 5px;">
            <input type="checkbox" v-model="mostrarGrid" style="margin-right: 8px;" />
            📐 Mostrar Grid
          </label>
          <label style="display: flex; align-items: center;">
            <input type="checkbox" v-model="mostrarLabels" style="margin-right: 8px;" />
            🏷️ Mostrar Labels
          </label>
        </div>
      </div>

      <!-- Status -->
      <div style="margin-top: 8px; font-size: 11px; color: #888;">
        Última atualização: {{ dadosPortal?.DAT || 'N/A' }}
      </div>
    </div>

    <!-- Canvas 3D -->
    <div v-if="carregando" style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px; background: linear-gradient(to bottom, #87CEEB, #E0F6FF);">
      🔄 Carregando Armazém 3D...
    </div>
    <div v-show="!carregando" ref="canvasContainer" style="height: 100%; width: 100%; background: linear-gradient(to bottom, #87CEEB, #E0F6FF);"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
import dadosArmazemPortal from '../dadosArmazem.json';

export default {
  name: 'Armazem3D',
  data() {
    return {
      dadosPortal: null,
      carregando: true,
      autoRotate: true,
      mostrarGrid: false,
      mostrarLabels: true,
      scene: null,
      camera: null,
      renderer: null,
      animationId: null,

      // Configurações do armazém
      alturaArmazem: 6,
      larguraArmazem: 25,
      profundidadeArmazem: 12,

      // Layout processado
      layoutTopo: null,

      // Controles da câmera
      cameraControls: {
        spherical: new THREE.Spherical(30, Math.PI / 3, 0),
        target: new THREE.Vector3(0, 3, 0),
        autoRotateSpeed: 0.01
      },

      // Arrays para animações
      motoresRotativos: [],
      pendulosData: []
    };
  },
  computed: {
    totalArcos() {
      return this.layoutTopo ? 
        Object.keys(this.layoutTopo).filter(key => key !== 'celulas' && key !== 'aeradores').length : 0;
    },
    totalPendulos() {
      return this.dadosPortal?.pendulos ? Object.keys(this.dadosPortal.pendulos).length : 0;
    },
    totalSensores() {
      let count = 0;
      if (this.dadosPortal?.arcos) {
        Object.values(this.dadosPortal.arcos).forEach(arco => {
          Object.values(arco).forEach(pendulo => {
            count += Object.keys(pendulo).length;
          });
        });
      }
      return count;
    },
    totalAeradores() {
      return this.layoutTopo?.aeradores ? Object.keys(this.layoutTopo.aeradores).length : 0;
    }
  },
  async mounted() {
    await this.processarDados();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    async processarDados() {
      try {
        this.carregando = true;

        // Usar dados do arquivo diretamente
        this.dadosPortal = dadosArmazemPortal;

        console.log('=== PROCESSANDO DADOS PARA 3D ===');
        console.log('Dados Portal:', this.dadosPortal);

        // Processar layout baseado na configuração existente
        if (this.dadosPortal.configuracao?.layout_topo) {
          this.layoutTopo = this.dadosPortal.configuracao.layout_topo;
          console.log('✓ Layout topo carregado:', this.layoutTopo);
        } else {
          console.log('⚠ Criando layout básico');
          this.layoutTopo = this.criarLayoutBasico();
        }

        // Processar dados dos pêndulos para posicionamento 3D
        this.processarPendulosParaTopo();

        await this.$nextTick();
        this.inicializarThreeJS();

      } catch (error) {
        console.error("❌ Erro ao processar dados:", error);
        this.carregando = false;
      }
    },

    processarPendulosParaTopo() {
      console.log('=== PROCESSANDO PÊNDULOS PARA 3D ===');
      this.pendulosData = [];

      if (!this.layoutTopo) return;

      const tamanhoSVG = this.layoutTopo.celulas?.tamanho_svg || [600, 388];

      Object.entries(this.layoutTopo).forEach(([arcoKey, arcoData]) => {
        if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;

        const arcoNumero = parseInt(arcoKey);
        const posXTopo = arcoData.pos_x;
        const sensoresArco = arcoData.sensores || {};

        // Converter posição X do topo para 3D
        const posX3D = -this.larguraArmazem / 2 + (posXTopo / tamanhoSVG[0]) * this.larguraArmazem;

        Object.entries(sensoresArco).forEach(([penduloId, posYTopo]) => {
          // Converter posição Y do topo para Z no 3D
          const posZ3D = -this.profundidadeArmazem / 2 + ((posYTopo - 50) / (tamanhoSVG[1] - 100)) * (this.profundidadeArmazem - 2) + 1;

          // Buscar dados do pêndulo
          const dadosPendulo = this.buscarDadosPendulo(arcoNumero, penduloId);

          this.pendulosData.push({
            id: penduloId,
            arco: arcoNumero,
            posicao: [posX3D, posZ3D],
            dados: dadosPendulo
          });

          console.log(`Pêndulo ${penduloId} - Arco ${arcoNumero}: (${posX3D.toFixed(2)}, ${posZ3D.toFixed(2)})`);
        });
      });

      console.log(`=== ${this.pendulosData.length} pêndulos processados ===`);
    },

    buscarDadosPendulo(arcoNumero, penduloId) {
      // Buscar nos arcos detalhados primeiro
      if (this.dadosPortal?.arcos?.[arcoNumero]) {
        const arcoData = this.dadosPortal.arcos[arcoNumero];
        for (const [penduloNum, sensores] of Object.entries(arcoData)) {
          if (sensores[penduloId]) {
            return {
              tipo: 'detalhado',
              sensores: sensores,
              pendulo: penduloNum,
              sensorId: penduloId,
              dadosSensor: sensores[penduloId]
            };
          }
        }
      }

      // Buscar nos pêndulos básicos
      if (this.dadosPortal?.pendulos?.[penduloId]) {
        const [alarme, preAlarme, ativo, tempMaxima] = this.dadosPortal.pendulos[penduloId];
        return {
          tipo: 'basico',
          alarme,
          preAlarme,
          ativo,
          temperatura: tempMaxima || 25
        };
      }

      // Dados padrão
      return {
        tipo: 'padrao',
        ativo: true,
        temperatura: 25,
        alarme: false,
        preAlarme: false
      };
    },

    criarLayoutBasico() {
      console.log('=== CRIANDO LAYOUT BÁSICO ===');

      const layout = {
        celulas: {
          tamanho_svg: [600, 388],
          fundo: [5, 49, 590, 256],
          1: [5, 50, 188, 254],
          2: [197, 50, 206, 254],
          3: [407, 50, 188, 254]
        },
        aeradores: {}
      };

      // Criar aeradores baseados no AER
      if (this.dadosPortal.AER) {
        const valoresAER = this.dadosPortal.AER.split(',');
        const posicoesAeradores = [
          [50, 340, 0],
          [200, 340, 0], 
          [350, 340, 0],
          [500, 340, 0]
        ];

        valoresAER.forEach((valor, index) => {
          if (index < 4) {
            layout.aeradores[index + 1] = posicoesAeradores[index];
          }
        });
      }

      // Criar arcos básicos se houver dados
      if (this.dadosPortal.arcos) {
        let posX = 30;
        Object.entries(this.dadosPortal.arcos).forEach(([arcoNum, pendulos]) => {
          const arcoKey = arcoNum;
          const celula = Math.ceil(parseInt(arcoNum) / 7);

          layout[arcoKey] = {
            pos_x: posX,
            celula: celula,
            sensores: {}
          };

          let posY = 80;
          Object.keys(pendulos).forEach((penduloNum, penduloIndex) => {
            Object.keys(pendulos[penduloNum]).forEach((sensorId) => {
              layout[arcoKey].sensores[sensorId] = posY + (penduloIndex * 30);
            });
          });

          posX += 30;
        });
      }

      return layout;
    },

    inicializarThreeJS() {
      const container = this.$refs.canvasContainer;
      if (!container) {
        console.error('Container não encontrado');
        return;
      }

      console.log('Inicializando Three.js...');

      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB);

      // Camera
      this.camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );

      this.camera.position.setFromSpherical(this.cameraControls.spherical);
      this.camera.lookAt(this.cameraControls.target);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false
      });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setClearColor(0x87CEEB, 1);

      container.appendChild(this.renderer.domElement);

      // Setup
      this.setupControls();
      this.setupLighting();
      this.buildArmazemStructure();
      this.buildPendulos();
      this.buildAeradores();

      if (this.mostrarGrid) {
        this.addGrid();
      }

      console.log('Three.js inicializado com', this.scene.children.length, 'objetos');

      this.animate();
      window.addEventListener('resize', this.onWindowResize);
      this.carregando = false;
    },

    setupControls() {
      const container = this.$refs.canvasContainer;
      let isMouseDown = false;
      let previousMouseX = 0;
      let previousMouseY = 0;

      container.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
        container.style.cursor = 'grabbing';
      });

      container.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;

        const deltaX = event.clientX - previousMouseX;
        const deltaY = event.clientY - previousMouseY;

        this.cameraControls.spherical.theta -= deltaX * 0.01;
        this.cameraControls.spherical.phi += deltaY * 0.01;

        this.cameraControls.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraControls.spherical.phi));

        this.camera.position.setFromSpherical(this.cameraControls.spherical);
        this.camera.lookAt(this.cameraControls.target);

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
      });

      container.addEventListener('mouseup', () => {
        isMouseDown = false;
        container.style.cursor = 'grab';
      });

      container.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        this.cameraControls.spherical.radius *= scale;
        this.cameraControls.spherical.radius = Math.max(8, Math.min(80, this.cameraControls.spherical.radius));

        this.camera.position.setFromSpherical(this.cameraControls.spherical);
        this.camera.lookAt(this.cameraControls.target);
      });

      container.style.cursor = 'grab';
    },

    setupLighting() {
      // Luz ambiente
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      // Luz direcional principal
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(20, 20, 20);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.setSize(2048, 2048);
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 100;
      directionalLight.shadow.camera.left = -30;
      directionalLight.shadow.camera.right = 30;
      directionalLight.shadow.camera.top = 30;
      directionalLight.shadow.camera.bottom = -30;
      this.scene.add(directionalLight);

      // Luz de preenchimento
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-20, 10, -10);
      this.scene.add(fillLight);

      // Luzes pontuais internas
      const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 25);
      pointLight1.position.set(0, this.alturaArmazem * 0.8, 0);
      this.scene.add(pointLight1);
    },

    buildArmazemStructure() {
      const corTelhado = 0xE6E6E6;
      const corBase = 0x999999;
      const corParede = 0xD0D0D0;
      const espessuraParede = 0.2;

      // Base do armazém (inspirada no SVG)
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

      // Paredes laterais (transparentes como no SVG)
      const paredeGeometry = new THREE.BoxGeometry(espessuraParede, this.alturaArmazem, this.profundidadeArmazem);
      const paredeMaterial = new THREE.MeshStandardMaterial({
        color: corParede,
        transparent: true,
        opacity: 0.4
      });

      // Parede esquerda
      const paredeEsquerda = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeEsquerda.position.set(-this.larguraArmazem / 2, this.alturaArmazem / 2, 0);
      paredeEsquerda.castShadow = true;
      this.scene.add(paredeEsquerda);

      // Parede direita
      const paredeDireita = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeDireita.position.set(this.larguraArmazem / 2, this.alturaArmazem / 2, 0);
      paredeDireita.castShadow = true;
      this.scene.add(paredeDireita);

      // Paredes frontais
      const paredeFrontalGeometry = new THREE.BoxGeometry(this.larguraArmazem, this.alturaArmazem, espessuraParede);
      const paredeFrente = new THREE.Mesh(paredeFrontalGeometry, paredeMaterial);
      paredeFrente.position.set(0, this.alturaArmazem / 2, -this.profundidadeArmazem / 2);
      this.scene.add(paredeFrente);

      const paredeFundo = new THREE.Mesh(paredeFrontalGeometry, paredeMaterial);
      paredeFundo.position.set(0, this.alturaArmazem / 2, this.profundidadeArmazem / 2);
      this.scene.add(paredeFundo);

      // Telhado em duas águas (inspirado no SVG pontudo)
      this.buildTelhado(corTelhado);

      // Vigas estruturais
      this.buildVigas();

      if (this.mostrarLabels) {
        this.addArcoLabels();
      }
    },

    buildTelhado(cor) {
      // Telhado pontudo em duas águas (baseado no SVG do armazém)
      const telhadoGeometry = new THREE.BoxGeometry(this.larguraArmazem + 1.5, 0.1, this.profundidadeArmazem / 2 + 0.3);
      const telhadoMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        metalness: 0.1,
        roughness: 0.8
      });

      // Primeira parte do telhado
      const telhado1 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado1.position.set(0, this.alturaArmazem + 0.2, -this.profundidadeArmazem / 4);
      telhado1.rotation.x = -Math.PI / 12;
      telhado1.castShadow = true;
      this.scene.add(telhado1);

      // Segunda parte do telhado
      const telhado2 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado2.position.set(0, this.alturaArmazem + 0.2, this.profundidadeArmazem / 4);
      telhado2.rotation.x = Math.PI / 12;
      telhado2.castShadow = true;
      this.scene.add(telhado2);

      // Cumeeira
      const cumeeiraGeometry = new THREE.BoxGeometry(this.larguraArmazem + 1.6, 0.1, 0.2);
      const cumeeira = new THREE.Mesh(cumeeiraGeometry, telhadoMaterial);
      cumeeira.position.set(0, this.alturaArmazem + 0.3, 0);
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

      // Adicionar vigas estruturais baseadas na quantidade de arcos
      const numVigas = Math.min(8, this.totalArcos);
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
      console.log('=== CONSTRUINDO PÊNDULOS 3D ===');

      this.pendulosData.forEach(pendulo => {
        this.buildPendulo(pendulo);
      });

      console.log(`=== ${this.pendulosData.length} pêndulos construídos ===`);
    },

    buildPendulo(pendulo) {
      const [posX, posZ] = pendulo.posicao;
      const dados = pendulo.dados;

      // Determinar cor e estado baseado nos dados
      let cor, emissive, emissiveIntensity;
      if (dados.tipo === 'detalhado' && dados.dadosSensor) {
        const [temp, pontoQuente, preAlarme, falha, ativo] = dados.dadosSensor;
        cor = falha ? 0xff0000 : !ativo ? 0x666666 : this.corPorTemperatura(temp);
        emissive = falha ? 0xff0000 : pontoQuente ? 0xffaa00 : 0x000000;
        emissiveIntensity = falha ? 0.4 : pontoQuente ? 0.2 : 0;
      } else if (dados.tipo === 'basico') {
        cor = dados.alarme ? 0xff0000 : dados.preAlarme ? 0xffaa00 : dados.ativo ? this.corPorTemperatura(dados.temperatura) : 0x666666;
        emissive = dados.alarme ? 0xff0000 : dados.preAlarme ? 0xffaa00 : 0x000000;
        emissiveIntensity = dados.alarme ? 0.4 : dados.preAlarme ? 0.2 : 0;
      } else {
        cor = 0x00ff00;
        emissive = 0x000000;
        emissiveIntensity = 0;
      }

      // Cabo principal
      const alturaCabo = 4;
      const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, alturaCabo, 8);
      const cableMaterial = new THREE.MeshStandardMaterial({ 
        color: cor,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity
      });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.set(posX, this.alturaArmazem - (alturaCabo / 2), posZ);
      cable.castShadow = true;
      this.scene.add(cable);

      // Sensor principal
      const sensorGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.06);
      const sensorMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        metalness: 0.3,
        roughness: 0.7
      });
      const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
      sensor.position.set(posX, this.alturaArmazem - alturaCabo * 0.7, posZ);
      sensor.castShadow = true;
      this.scene.add(sensor);

      // Peso na extremidade
      const weightGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.1, 8);
      const weightMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity * 0.5,
        metalness: 0.6,
        roughness: 0.4
      });
      const weight = new THREE.Mesh(weightGeometry, weightMaterial);
      weight.position.set(posX, this.alturaArmazem - alturaCabo + 0.5, posZ);
      weight.castShadow = true;
      this.scene.add(weight);

      // Label do pêndulo se habilitado
      if (this.mostrarLabels) {
        const statusIcon = dados.alarme ? "🚨" : dados.preAlarme ? "⚠️" : "✅";
        this.createTextSprite(`${statusIcon} P${pendulo.id}`, {
          x: posX,
          y: this.alturaArmazem - alturaCabo + 0.2,
          z: posZ
        }, 0.06, 0xffffff);
      }
    },

    buildAeradores() {
      if (!this.layoutTopo?.aeradores) return;

      console.log('=== CONSTRUINDO AERADORES 3D ===');

      const valoresAER = this.dadosPortal?.AER?.split(',') || ['0', '0', '0', '0'];
      const tamanhoSVG = this.layoutTopo.celulas?.tamanho_svg || [600, 388];

      Object.entries(this.layoutTopo.aeradores).forEach(([aeradorId, dados]) => {
        const [posX2D, posY2D] = dados;

        // Converter coordenadas 2D para 3D
        const posX3D = -this.larguraArmazem / 2 + (posX2D / tamanhoSVG[0]) * this.larguraArmazem;
        const posZ3D = -this.profundidadeArmazem / 2 + (posY2D / tamanhoSVG[1]) * this.profundidadeArmazem;

        // Posicionar fora do armazém
        const margemExterna = 2;
        const cantos = [
          [-this.larguraArmazem / 2 - margemExterna, -this.profundidadeArmazem / 2 - margemExterna],
          [this.larguraArmazem / 2 + margemExterna, -this.profundidadeArmazem / 2 - margemExterna],
          [-this.larguraArmazem / 2 - margemExterna, this.profundidadeArmazem / 2 + margemExterna],
          [this.larguraArmazem / 2 + margemExterna, this.profundidadeArmazem / 2 + margemExterna]
        ];

        const indiceAerador = parseInt(aeradorId) - 1;
        let posX3DFinal = posX3D;
        let posZ3DFinal = posZ3D;

        if (indiceAerador < 4) {
          [posX3DFinal, posZ3DFinal] = cantos[indiceAerador];
        }

        this.buildAerador(posX3DFinal, posZ3DFinal, parseInt(aeradorId), valoresAER);
      });
    },

    buildAerador(posX, posZ, id, valoresAER) {
      const indiceAerador = (id - 1) % valoresAER.length;
      const valorAER = parseInt(valoresAER[indiceAerador]) || 0;
      const status = valorAER > 0 ? 3 : 0; // 3 = ligado, 0 = desligado

      const cores = {
        0: 0xc5c5c5, // desligado
        1: 0xffeb3b, // startando
        3: 0x31dd0f, // ligado
        4: 0xff0000, // erro
      };

      // Base do motor
      const motorGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.15, 12);
      const motorMaterial = new THREE.MeshStandardMaterial({
        color: cores[status] || cores[0],
        metalness: 0.3,
        roughness: 0.7
      });
      const motor = new THREE.Mesh(motorGeometry, motorMaterial);
      motor.position.set(posX, 0.4, posZ);
      motor.castShadow = true;
      this.scene.add(motor);

      // Grupo para rotação das hélices
      const heliceGroup = new THREE.Group();
      heliceGroup.position.set(posX, 0.5, posZ);

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
        this.motoresRotativos.push(heliceGroup);
      }

      // Label
      if (this.mostrarLabels) {
        const statusTexto = status === 3 ? `ON (${valorAER})` : 'OFF';
        this.createTextSprite(`AE-${id} ${statusTexto}`, {
          x: posX,
          y: 0.4,
          z: posZ + 0.3
        }, 0.04, 0xffffff);
      }
    },

    corPorTemperatura(temp) {
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

    createTextSprite(text, position, size, color) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = 512;
      canvas.height = 128;

      context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      context.font = `bold ${size * 800}px Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;

      const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(position.x, position.y, position.z);
      sprite.scale.set(size * 8, size * 4, 1);

      this.scene.add(sprite);
      return sprite;
    },

    addGrid() {
      const gridHelper = new THREE.GridHelper(
        Math.max(this.larguraArmazem, this.profundidadeArmazem) + 5, 
        20, 
        0x444444, 
        0x888888
      );
      gridHelper.position.y = 0.01;
      this.scene.add(gridHelper);
    },

    addArcoLabels() {
      // Adicionar labels dos arcos no teto
      for (let i = 1; i <= this.totalArcos; i++) {
        const espacamento = this.larguraArmazem / (this.totalArcos + 1);
        const x = -this.larguraArmazem / 2 + i * espacamento;

        this.createTextSprite(`Arco ${i}`, {
          x: x,
          y: this.alturaArmazem + 0.8,
          z: 0
        }, 0.05, 0x333333);
      }
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);

      // Rotação automática da câmera
      if (this.autoRotate && this.camera) {
        this.cameraControls.spherical.theta += this.cameraControls.autoRotateSpeed;
        this.camera.position.setFromSpherical(this.cameraControls.spherical);
        this.camera.lookAt(this.cameraControls.target);
      }

      // Rotação dos motores ligados
      this.motoresRotativos.forEach(motor => {
        motor.rotation.y += 0.1;
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
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
        if (container && this.renderer.domElement && container.contains(this.renderer.domElement)) {
          container.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
      }

      window.removeEventListener('resize', this.onWindowResize);
    }
  }
};
</script>

<style scoped>
/* Estilos específicos do componente */
</style>