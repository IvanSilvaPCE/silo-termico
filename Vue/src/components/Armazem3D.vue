
<template>
  <div style="width: 100%; height: 100vh;">
    <!-- Controles simples -->
    <div style="position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.9); padding: 10px; border-radius: 5px;">
      <label style="display: block; margin-bottom: 5px;">
        <input type="checkbox" v-model="autoRotate" />
        Rotação Automática
      </label>
      <label style="display: block; margin-bottom: 5px;">
        <input type="checkbox" v-model="mostrarLabels" />
        Mostrar Labels
      </label>
      <div style="margin-top: 10px;">
        <small style="display: block;">Nível: {{ nivelAtual.toFixed(1)}}</small>
        <small style="display: block;">Sensores: {{ totalSensores }}</small>
        <small style="display: block;">Pêndulos: {{ totalPendulos }}</small>
      </div>
    </div>

    <!-- Canvas 3D -->
    <div ref="canvasContainer" style="height: 100%; background: linear-gradient(to bottom, #87CEEB, #E0F6FF);"></div>
  </div>
</template>

<script>
import * as THREE from 'three';

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

      // Configurações do armazém
      alturaArmazem: 6,
      larguraArmazem: 25,
      profundidadeArmazem: 12
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
        // Carregar dados do arquivo dadosArmazem.json
        const dadosArmazem = await import('../dadosArmazem.json');
        this.dados = dadosArmazem.default || dadosArmazem;
        console.log('Dados carregados:', this.dados);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Dados de fallback
        this.dados = {
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
          arcos: {},
          pendulos: {},
          AER: "1,0,1,0",
          NIV: 50.0
        };
      }
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

      console.log('Inicializando Three.js para Armazém');

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

      // Paredes laterais (retas)
      const paredeGeometry = new THREE.BoxGeometry(espessuraParede, this.alturaArmazem, this.profundidadeArmazem);

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

      // Paredes frontais triangulares (seguindo o formato do telhado)
      this.buildParedesTriangulares(paredeMaterial, espessuraParede);

      // Telhado em duas águas
      this.buildTelhado(corTelhado);

      // Vigas estruturais
      this.buildVigas();
    },

    buildParedesTriangulares(paredeMaterial, espessuraParede) {
      // Altura do pico do telhado
      const alturaPico = this.alturaArmazem + 0.8;
      
      // Criar geometria triangular para as paredes frontais
      const pontos = [
        // Base da parede (retângulo)
        new THREE.Vector3(-this.larguraArmazem / 2, 0, 0),
        new THREE.Vector3(this.larguraArmazem / 2, 0, 0),
        new THREE.Vector3(this.larguraArmazem / 2, this.alturaArmazem, 0),
        new THREE.Vector3(-this.larguraArmazem / 2, this.alturaArmazem, 0),
        // Pico triangular
        new THREE.Vector3(0, alturaPico, 0)
      ];

      // Criar shape para a parede frontal
      const shape = new THREE.Shape();
      shape.moveTo(-this.larguraArmazem / 2, 0);
      shape.lineTo(this.larguraArmazem / 2, 0);
      shape.lineTo(this.larguraArmazem / 2, this.alturaArmazem);
      shape.lineTo(0, alturaPico); // Pico do triângulo
      shape.lineTo(-this.larguraArmazem / 2, this.alturaArmazem);
      shape.lineTo(-this.larguraArmazem / 2, 0);

      // Geometria extrudada para dar espessura à parede
      const extrudeSettings = {
        depth: espessuraParede,
        bevelEnabled: false
      };

      const paredeTriangularGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // Parede frontal
      const paredeFrente = new THREE.Mesh(paredeTriangularGeometry, paredeMaterial);
      paredeFrente.position.set(0, 0, -this.profundidadeArmazem / 2 - espessuraParede / 2);
      paredeFrente.castShadow = true;
      this.scene.add(paredeFrente);

      // Parede traseira (rotacionada 180 graus)
      const paredeTras = new THREE.Mesh(paredeTriangularGeometry, paredeMaterial);
      paredeTras.position.set(0, 0, this.profundidadeArmazem / 2 + espessuraParede / 2);
      paredeTras.rotation.y = Math.PI;
      paredeTras.castShadow = true;
      this.scene.add(paredeTras);
    },

    buildTelhado(cor) {
      const telhadoGeometry = new THREE.BoxGeometry(this.larguraArmazem + 1.5, 0.1, this.profundidadeArmazem / 2 + 0.3);
      const telhadoMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        metalness: 0.1,
        roughness: 0.8
      });

      const alturaTelhado = this.alturaArmazem + 0.6;

      // Primeira parte do telhado (inclinada)
      const telhado1 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado1.position.set(0, alturaTelhado, -this.profundidadeArmazem / 4);
      telhado1.rotation.x = -Math.PI / 12;
      telhado1.castShadow = true;
      this.scene.add(telhado1);

      // Segunda parte do telhado (inclinada)
      const telhado2 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado2.position.set(0, alturaTelhado, this.profundidadeArmazem / 4);
      telhado2.rotation.x = Math.PI / 12;
      telhado2.castShadow = true;
      this.scene.add(telhado2);

      // Cumeeira (linha central do telhado)
      const cumeeiraGeometry = new THREE.BoxGeometry(this.larguraArmazem + 1.6, 0.1, 0.2);
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
      if (!this.dados?.arcos) return;

      console.log('Construindo pêndulos:', this.dados.arcos);

      // Usar o mesmo padrão do TopoArmazem.vue baseado no layout_topo
      const layoutTopo = this.dados?.configuracao?.layout_topo;
      if (!layoutTopo) {
        console.warn('Layout topo não encontrado, usando posicionamento básico');
        return;
      }

      // Processar arcos baseado no layout_topo (igual ao TopoArmazem.vue)
      Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
        if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;

        const arcoNum = parseInt(arcoKey);
        const posXTopo = arcoData.pos_x;
        const sensoresArco = arcoData.sensores || {};

        // Converter posição X do topo para 3D (igual ao React)
        const tamanhoSVG = layoutTopo.celulas?.tamanho_svg || [600, 388];
        const posX = -this.larguraArmazem / 2 + (posXTopo / tamanhoSVG[0]) * this.larguraArmazem;

        // Processar cada sensor do arco baseado na posição Y do topo
        Object.entries(sensoresArco).forEach(([penduloId, posYTopo]) => {
          // Converter posição Y do topo para posição Z no 3D (igual ao React)
          // Posições Y no topo (50-300) representam profundidade no 3D
          const posZ = -this.profundidadeArmazem / 2 + ((posYTopo - 50) / 250) * (this.profundidadeArmazem - 2) + 1;

          // Buscar dados dos sensores nos arcos detalhados
          const sensores = this.dados?.arcos?.[arcoNum]?.[penduloId] || {};

          this.buildPendulo(posX, posZ, arcoNum, penduloId, sensores);
        });
      });
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
      
      sensoresArray.forEach(([sensorNum, dadosSensor], sensorIndex) => {
        const [temp, pontoQuente, preAlarme, falha, ativo] = dadosSensor;
        
        // Posição Y do sensor (do topo para baixo)
        const posY = this.alturaArmazem - 0.1 - ((sensorIndex + 1) * espacamentoSensores);

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

    buildSensor(posX, posY, posZ, temp, pontoQuente, preAlarme, falha, ativo, arcoNum, penduloNum, sensorNum) {
      const cor = this.corPorTemperatura(temp, falha, ativo);

      const sensorGeometry = new THREE.BoxGeometry(0.08, 0.04, 0.04);
      const sensorMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        emissive: falha ? 0xff0000 : pontoQuente ? 0xffaa00 : 0x000000,
        emissiveIntensity: falha ? 0.4 : pontoQuente ? 0.2 : 0,
        metalness: 0.3,
        roughness: 0.7
      });
      const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
      sensor.position.set(posX, posY, posZ);
      sensor.castShadow = true;
      sensor.userData = { temp, arcoNum, penduloNum, sensorNum };
      this.scene.add(sensor);

      // Armazenar para futuras atualizações
      this.sensores3D.push(sensor);

      // Label do sensor se mostrar labels estiver ativo
      if (this.mostrarLabels && temp !== undefined) {
        this.createTextSprite(`${temp}°C`, {
          x: posX + 0.1,
          y: posY,
          z: posZ
        }, 0.2);
      }
    },

    buildNivelVisual() {
      if (!this.nivelAtual) return;

      // Calcular altura do nível em relação ao armazém
      const percentualNivel = this.nivelAtual / 100;
      const alturaNivel = percentualNivel * this.alturaArmazem * 0.8; // 80% da altura máxima

      // Criar plano representando o nível do material - SEMPRE VISÍVEL
      const nivelGeometry = new THREE.PlaneGeometry(this.larguraArmazem * 0.9, this.profundidadeArmazem * 0.9);
      const nivelMaterial = new THREE.MeshStandardMaterial({
        color: 0xD2B48C, // Cor de grão
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false, // Evita conflitos de profundidade
        depthTest: true
      });
      const nivelPlane = new THREE.Mesh(nivelGeometry, nivelMaterial);
      nivelPlane.rotation.x = -Math.PI / 2;
      nivelPlane.position.set(0, alturaNivel + 0.1, 0);
      nivelPlane.renderOrder = 1; // Garantir que seja renderizado
      this.scene.add(nivelPlane);

      // Label do nível
      if (this.mostrarLabels) {
        this.createTextSprite(`Nível: ${this.nivelAtual.toFixed(1)}%`, {
          x: this.larguraArmazem / 2 - 2,
          y: alturaNivel + 0.5,
          z: this.profundidadeArmazem / 2 - 1
        });
      }
    },

    buildAeradores() {
      if (!this.dados?.configuracao?.layout_topo?.aeradores) {
        console.warn('Dados de aeradores não encontrados');
        return;
      }

      // Usar TODOS os aeradores dos dados
      const aeradores = this.dados.configuracao.layout_topo.aeradores;
      console.log('Construindo aeradores:', aeradores);

      // Obter estados dos aeradores do campo AER
      let estadosAeradores = [];
      if (this.dados.AER) {
        const valoresAER = this.dados.AER.split(',').map(v => parseInt(v.trim()));
        estadosAeradores = valoresAER;
      }

      Object.entries(aeradores).forEach(([aeradorId, posicao], index) => {
        const [posX2D, posY2D, textoAcima] = posicao;
        
        // Converter coordenadas 2D para 3D
        const tamanhoSVG = this.dados.configuracao?.layout_topo?.celulas?.tamanho_svg || [600, 388];
        let posX3D = -this.larguraArmazem / 2 + (posX2D / tamanhoSVG[0]) * this.larguraArmazem;
        let posZ3D = -this.profundidadeArmazem / 2 + (posY2D / tamanhoSVG[1]) * this.profundidadeArmazem;
        
        // GARANTIR que motores fiquem FORA das paredes
        const margemExterna = 2.0;
        
        // Empurrar para fora se estiver muito próximo das paredes
        if (Math.abs(posX3D) < this.larguraArmazem / 2 + 1) {
          if (posX3D >= 0) {
            posX3D = this.larguraArmazem / 2 + margemExterna;
          } else {
            posX3D = -this.larguraArmazem / 2 - margemExterna;
          }
        }
        
        if (Math.abs(posZ3D) < this.profundidadeArmazem / 2 + 1) {
          if (posZ3D >= 0) {
            posZ3D = this.profundidadeArmazem / 2 + margemExterna;
          } else {
            posZ3D = -this.profundidadeArmazem / 2 - margemExterna;
          }
        }

        // Usar estado do AER ou padrão
        const estado = estadosAeradores[index] || 0;
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
      if (falha || temp === -1000) return 0xff0000;
      if (!ativo) return 0xcccccc;

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
      while(this.scene.children.length > 0) {
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
