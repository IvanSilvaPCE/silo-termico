<template>
  <div style="width: 100%; height: 100vh;">
    <!-- Controles simples -->
    <div
      style="position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.9); padding: 10px; border-radius: 5px;">
      <label>
        <input type="checkbox" v-model="autoRotate" />
        Rotação Automática
      </label>
    </div>

    <!-- Card de informações do silo (movível) -->
    <div
      ref="cardSilo"
      @mousedown="iniciarArrastoCardSilo"
      style="position: absolute; top: 120px; right: 10px; z-index: 1000; background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); min-width: 250px; font-family: Arial, sans-serif; cursor: move;">
      <h3 style="margin: 0 0 10px 0; color: #2E86AB; font-size: 16px; border-bottom: 2px solid #2E86AB; padding-bottom: 5px; cursor: move;">
        📊 Informações do Silo
      </h3>

      <!-- Nível -->
      <div style="margin-bottom: 10px;">
        <strong style="color: #333;">Nível:</strong>
        <span style="color: #2E86AB; font-weight: bold;">{{ dados?.dados?.nivel || 0 }}%</span>
      </div>

      <!-- Pêndulos -->
      <div style="margin-bottom: 10px;">
        <strong style="color: #333;">Pêndulos Ativos:</strong>
        <span style="color: #2E86AB; font-weight: bold;">{{ getNumPendulosAtivos() }}</span>
      </div>

      <!-- Aeradores -->
      <div style="margin-bottom: 10px;">
        <strong style="color: #333;">Aeradores:</strong>
      </div>
      <div style="margin-left: 10px;">
        <div v-for="(status, index) in getStatusAeradores()" :key="index"
             style="display: flex; align-items: center; margin-bottom: 5px;">
          <div
            :style="`width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; background-color: ${getCorAerador(status)};`">
          </div>
          <span style="font-size: 14px;">AE-{{ index + 1 }}: {{ getStatusTexto(status) }}</span>
        </div>
      </div>

      <!-- Temperatura Média -->
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
        <strong style="color: #333;">Temp. Média:</strong>
        <span style="color: #2E86AB; font-weight: bold;">{{ getTemperaturaMedia() }}°C</span>
      </div>
    </div>

    <!-- Card de informações do cabo (movível) -->
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
             :style="`border-left-color: ${getCorSensorComNivel(sensor.temperatura, sensor.ativo, sensor.falha, sensor.temGrao)}; background: rgba(0,0,0,0.05);`">

          <div>
            <strong style="color: #333;">Sensor {{ sensor.numero }}:</strong>
            <div style="font-size: 12px; color: #666; margin-top: 2px;">
              {{ getStatusSensor(sensor) }}
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: bold;"
                 :style="`color: ${getCorSensorComNivel(sensor.temperatura, sensor.ativo, sensor.falha, sensor.temGrao)};`">
              {{ getTextoTemperatura(sensor) }}
            </div>
            <div style="font-size: 10px; color: #888;">
              {{ sensor.alarme ? '🚨 Alarme' : '' }}
              {{ sensor.preAlarme ? '⚠️ Pré-Alarme' : '' }}
              {{ !sensor.temGrao && sensor.ativo && !sensor.falha ? '⬜ Sem nível' : '' }}
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 12px; color: #666;">
        <span>Total: {{ caboSelecionado.sensores.length }} sensores</span>
        <span>Temp. Média: {{ calcularMediaTemperatura(caboSelecionado.sensores) }}°C</span>
        <span>Com nível: {{ calcularSensoresComNivel(caboSelecionado.sensores) }}</span>
      </div>
    </div>

    <!-- Canvas 3D -->
    <div ref="canvasContainer" style="height: 100%; background: linear-gradient(to bottom, #87CEEB, #E0F6FF);"></div>
  </div>
</template>

<script>
import * as THREE from 'three';

export default {
  name: 'Silo3D',
  data() {
    return {
      autoRotate: true,
      inactivityTimeout: null,
      isZoomedIn: false,
      lastInteractionTime: Date.now(),
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      animationId: null,
      aeradorHélices: [],
      textSprites: [],
      cabos3D: [],
      escadaGroup: null,
      raycaster: null,
      mouse: null,
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
      cameraRadius: 10,
      cameraTheta: 0,
      cameraPhi: Math.PI / 3,
      dados: null,

      // Card de informações do cabo
      caboSelecionado: null,
      mostrarCardCabo: false,

      // Arrastar card do cabo
      arrastando: false,
      offsetX: 0,
      offsetY: 0,

      // Arrastar card do silo
      arrastandoSilo: false,
      offsetXSilo: 0,
      offsetYSilo: 0
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
          if (this.scene) {
            this.updateVisualization();
          } else {
            this.initThreeJS();
          }
        }
      },
      deep: true
    },
    autoRotate(newVal) {
      // Rotação automática é controlada no loop de animação
    }
  },
  methods: {
    async carregarDados() {
      try {
        // Carregar dados do arquivo rotaSilo.json usando import
        const dadosRotaSilo = await import('./rotaSilo.json')
        const dadosReais = dadosRotaSilo.default || dadosRotaSilo

        // Reorganizar os dados para usar a sequência de pêndulos
        const sequenciaPendulos = dadosReais.configuracao.sequencia_pendulos
        const pendulosOriginais = dadosReais.pendulos

        // Reorganizar leitura baseada na sequência
        const leituraOrganizada = {}
        sequenciaPendulos.forEach(numeroPendulo => {
          const chavePendulo = `P${numeroPendulo}`
          if (pendulosOriginais[chavePendulo]) {
            leituraOrganizada[chavePendulo] = pendulosOriginais[chavePendulo]
          }
        })

        // Montar estrutura de dados compatível
        this.dados = {
          dados_layout: dadosReais.configuracao,
          leitura: leituraOrganizada,
          motor: { statusMotor: Array(dadosReais.configuracao.aeradores?.na || 0).fill(0).map(() => Math.floor(Math.random() * 4)) },
          dados: { nivel: 66.6 }
        }

      } catch (error) {
        console.error('Erro ao carregar dados do rotaSilo.json:', error)
        // Fallback para dados básicos se houver erro
        this.dados = {
          dados_layout: {
            tamanho_svg: [525, 188],
            desenho_corte_silo: { lb: 463, hs: 163, hb: 25, eb: 3 },
            desenho_sensores: {
              escala_sensores: 16,
              dist_y_sensores: 12,
              pos_y_cabo: [152],
              pos_x_cabo: [9, 30],
              pos_x_cabos_uniforme: 1,
              nome_sensores_direita: 0,
              nome_cabo_acima: 0,
              dist_y_nome_cabo: [0]
            },
            aeradores: { na: 4, ds: -4, dy: 0, da: 0 }
          },
          leitura: {},
          motor: { statusMotor: [] },
          dados: { nivel: 66.6 }
        }
      }
    },

    initThreeJS() {
      if (!this.dados) return;

      const container = this.$refs.canvasContainer;
      if (!container) return;

      // Calcular dimensões baseadas nos dados reais
      const layout = this.dados.dados_layout;
      const leitura = this.dados.leitura;
      const numCabos = Object.keys(leitura).length;

      // Calcular altura baseada no pêndulo central (método adaptativo)
      const alturaSilo = this.getAlturaSilo();

      // Calcular raio baseado no número de cabos e largura do silo
      const larguraBase = layout.desenho_corte_silo?.lb || 463;
      const raioSilo = Math.max(3, (larguraBase / 100) * 1.2); // Converter largura SVG para raio 3D

      this.cameraRadius = raioSilo * 3;

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      this.updateCameraPosition(alturaSilo);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setClearColor(0x87CEEB);
      container.appendChild(this.renderer.domElement);

      // Raycaster para detecção de cliques
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // Controls
      this.setupControls(container);

      // Lighting
      this.setupLighting(raioSilo, alturaSilo);

      // Build silo structure
      this.buildSiloStructure(numCabos, alturaSilo, raioSilo);

      // Build ladders near pendulum 1
      this.buildLadders(alturaSilo, raioSilo);

      // Build level
      this.buildNivelGrao(alturaSilo, raioSilo);

      // Build sensors and cables
      this.buildSensorsAndCables(alturaSilo, raioSilo);

      // Build aerators
      this.buildAerators(raioSilo);

      // Build ground grid
      this.buildGroundGrid(raioSilo);

      // Auto zoom setup
      this.setupAutoZoom(alturaSilo, raioSilo);

      // Start animation loop
      this.animate();

      // Handle window resize
      window.addEventListener('resize', this.onWindowResize);
    },

    updateCameraPosition(alturaSilo) {
      this.camera.position.set(
        Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta) * this.cameraRadius,
        Math.cos(this.cameraPhi) * this.cameraRadius + alturaSilo * 0.3,
        Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta) * this.cameraRadius
      );
      this.camera.lookAt(0, alturaSilo / 2, 0);
    },

    setupControls(container) {
      container.addEventListener('mousedown', (event) => {
        this.isMouseDown = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.handleInteraction();
      });

      container.addEventListener('mousemove', (event) => {
        if (!this.isMouseDown) return;

        const deltaX = event.clientX - this.mouseX;
        const deltaY = event.clientY - this.mouseY;

        this.cameraTheta -= deltaX * 0.01;
        this.cameraPhi += deltaY * 0.01;
        this.cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraPhi));

        const alturaSilo = this.getAlturaSilo();
        this.updateCameraPosition(alturaSilo);

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
        this.cameraRadius = Math.max(2, Math.min(50, this.cameraRadius));

        const alturaSilo = this.getAlturaSilo();
        this.updateCameraPosition(alturaSilo);
        this.handleInteraction();
      });

      container.addEventListener('click', (event) => {
        this.handleInteraction();
        this.detectarCliqueCabo(event, container);
      });
    },

    getAlturaSilo() {
      if (!this.dados?.leitura) return 10;

      const leitura = this.dados.leitura;
      const espacamentoSensores = 0.8; // Espaçamento fixo reduzido pela metade

      // Encontrar o pêndulo com mais sensores
      let penduloComMaisSensores = null;
      let maxSensores = 0;

      Object.entries(leitura).forEach(([pendulo, sensores]) => {
        const numSensores = Object.keys(sensores).length;
        if (numSensores > maxSensores) {
          maxSensores = numSensores;
          penduloComMaisSensores = pendulo;
        }
      });

      if (!penduloComMaisSensores) return 10;

      // Pegar o maior número de sensor do pêndulo central
      const sensoresCentral = leitura[penduloComMaisSensores];
      let maxNumeroSensorCentral = 0;

      Object.keys(sensoresCentral).forEach(sensorKey => {
        const numeroSensor = parseInt(sensorKey);
        if (numeroSensor > maxNumeroSensorCentral) {
          maxNumeroSensorCentral = numeroSensor;
        }
      });

      // Altura calculada baseada no sensor mais alto do pêndulo central + margem mínima
      const alturaCalculada = 1.0 + (maxNumeroSensorCentral * espacamentoSensores) + 0.2;

      // Garantir altura mínima razoável
      return Math.max(4, alturaCalculada);
    },

    getRaioSilo() {
      if (!this.dados?.dados_layout) return 3;
      const larguraBase = this.dados.dados_layout.desenho_corte_silo?.lb || 463;
      return Math.max(3, (larguraBase / 100) * 1.2);
    },

    setupLighting(raioSilo, alturaSilo) {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      this.scene.add(ambientLight);

      // Directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(raioSilo * 4, alturaSilo * 2, raioSilo * 2);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);

      // Point light
      const pointLight = new THREE.PointLight(0xffffff, 0.6);
      pointLight.position.set(0, alturaSilo, 0);
      this.scene.add(pointLight);
    },

    buildSiloStructure(numCabos, alturaSilo, raioSilo) {
      const alturaTopo = 1.2;

      // Corpo principal do silo - cilindro com aparência mais realista
      const cylinderGeometry = new THREE.CylinderGeometry(raioSilo, raioSilo, alturaSilo, 48, 1, true);
      const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0xE0E0E0, // Cinza claro metálico
        transparent: true,
        opacity: 0.4, // Menos transparente
        side: THREE.DoubleSide,
        metalness: 0.7, // Mais metálico
        roughness: 0.3  // Menos rugoso
      });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.position.y = alturaSilo / 2;
      cylinder.castShadow = true;
      cylinder.receiveShadow = true;
      this.scene.add(cylinder);

      // === ANÉIS HORIZONTAIS METÁLICOS (apenas alguns, mais simples) ===
      const numAneis = Math.min(4, Math.floor(alturaSilo / 2)); // Máximo 4 anéis, mais espaçados
      
      for (let i = 1; i <= numAneis; i++) {
        const alturaAnel = (i * alturaSilo) / (numAneis + 1);
        
        // Anel principal simples
        const anelGeometry = new THREE.TorusGeometry(raioSilo * 1.01, 0.04, 6, 24);
        const anelMaterial = new THREE.MeshStandardMaterial({
          color: 0x999999, // Cinza metálico
          metalness: 0.8,
          roughness: 0.2
        });
        const anel = new THREE.Mesh(anelGeometry, anelMaterial);
        anel.position.y = alturaAnel;
        anel.rotation.x = Math.PI / 2;
        anel.castShadow = true;
        this.scene.add(anel);
      }

      // === BASE MELHORADA (mais grossa para baixo e mais baixa) ===
      const baseGeometry = new THREE.CylinderGeometry(raioSilo + 0.15, raioSilo + 0.4, 0.4, 48);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777, // Cor de concreto
        metalness: 0.2,
        roughness: 0.7
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = -0.1; // Baixar a base para entrar um pouco no elemento geral
      base.receiveShadow = true;
      this.scene.add(base);

      // === TETO CÔNICO MELHORADO (mais simples e realista) ===
      const coneGeometry = new THREE.ConeGeometry(raioSilo * 1.05, alturaTopo, 32);
      const coneMaterial = new THREE.MeshStandardMaterial({
        color: 0xB0B0B0, // Cor mais clara e natural
        metalness: 0.7,   // Bem metálico
        roughness: 0.2    // Bem liso
      });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.position.y = alturaSilo + alturaTopo / 2;
      cone.castShadow = true;
      this.scene.add(cone);

      // Chapéu melhorado que acompanha o fluxo do teto cônico
      const capGeometry = new THREE.ConeGeometry(raioSilo * 0.15, 0.12, 16);
      const capMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.8,
        roughness: 0.1
      });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.y = alturaSilo + alturaTopo + 0.06; // Mais acima para ficar bem no topo
      cap.castShadow = true;
      this.scene.add(cap);
    },

    buildLadders(alturaSilo, raioSilo) {
      if (!this.dados?.leitura) return;

      // Remover escada anterior se existir
      if (this.escadaGroup) {
        this.scene.remove(this.escadaGroup);
        this.disposeGroup(this.escadaGroup);
        this.escadaGroup = null;
      }

      const leitura = this.dados.leitura;
      
      // Encontrar diretamente a posição do P1 usando a mesma lógica de calculateCablePositionsByLevels
      const cabosPositions = this.calculateCablePositionsByLevels(leitura, raioSilo);
      
      // Mapear posições por nome do pêndulo usando a mesma ordem de calculateCablePositionsByLevels
      const positionMap = {};
      const sequenciaPendulos = this.dados?.dados_layout?.sequencia_pendulos || Object.keys(leitura);
      
      // Usar a sequência original para garantir consistência
      const pendulosOrdenados = [];
      if (Array.isArray(sequenciaPendulos)) {
        sequenciaPendulos.forEach(numeroPendulo => {
          const chavePendulo = `P${numeroPendulo}`;
          if (leitura[chavePendulo]) {
            pendulosOrdenados.push(chavePendulo);
          }
        });
      } else {
        // Fallback para Object.keys se não tiver sequência
        pendulosOrdenados.push(...Object.keys(leitura));
      }
      
      pendulosOrdenados.forEach((pendulo, index) => {
        positionMap[pendulo] = cabosPositions[index];
      });
      
      let posicaoP1 = positionMap['P1'];
      
      // Se não encontrou P1, usar o primeiro cabo disponível
      if (!posicaoP1 && pendulosOrdenados.length > 0) {
        const primeiroPendulo = pendulosOrdenados[0];
        posicaoP1 = positionMap[primeiroPendulo];
      }

      if (!posicaoP1) return;

      // Posicionar a escada encostada na lateral do silo, próxima ao P1
      const anguloP1 = Math.atan2(posicaoP1[2], posicaoP1[0]);
      const profundidadeDegrau = 0.25;
      const distanciaDoSilo = raioSilo + (profundidadeDegrau / 2) + 0.01; // Mais preciso
      
      const posicaoEscada = {
        x: Math.cos(anguloP1) * distanciaDoSilo,
        z: Math.sin(anguloP1) * distanciaDoSilo,
        angulo: anguloP1
      };

      this.createSiloLadder(posicaoEscada, alturaSilo, raioSilo);
    },

    disposeGroup(group) {
      group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => {
              if (material.map) material.map.dispose();
              material.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      });
    },

    createSiloLadder(posicao, alturaSilo, raioSilo) {
      this.escadaGroup = new THREE.Group();
      
      // === ESTRUTURA PRINCIPAL DA ESCADA ===
      const larguraEscada = 0.8;
      const alturaTotal = alturaSilo + 0.5; // Um pouco acima do silo
      const numeroDegraus = Math.floor(alturaTotal / 0.25); // Degrau a cada 25cm
      
      // Materiais reutilizáveis
      const materialEstrutura = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.3
      });

      const materialDegrau = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.6,
        roughness: 0.4
      });

      // Geometrias reutilizáveis
      const longarinaGeometry = new THREE.BoxGeometry(0.08, alturaTotal, 0.12);
      const degrauGeometry = new THREE.BoxGeometry(larguraEscada - 0.08, 0.04, 0.25);
      const suporteGeometry = new THREE.BoxGeometry(0.03, 0.15, 0.03);
      const corrimaoGeometry = new THREE.CylinderGeometry(0.025, 0.025, alturaTotal + 0.2, 12);
      const parafusoGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8);

      // === LONGARINAS LATERAIS (suportes principais) ===
      // Longarina esquerda
      const longarinaEsq = new THREE.Mesh(longarinaGeometry, materialEstrutura);
      longarinaEsq.position.set(-larguraEscada/2 + 0.04, alturaTotal/2, 0);
      longarinaEsq.castShadow = true;
      this.escadaGroup.add(longarinaEsq);
      
      // Longarina direita
      const longarinaDir = new THREE.Mesh(longarinaGeometry, materialEstrutura);
      longarinaDir.position.set(larguraEscada/2 - 0.04, alturaTotal/2, 0);
      longarinaDir.castShadow = true;
      this.escadaGroup.add(longarinaDir);

      // === DEGRAUS ===
      for (let i = 0; i < numeroDegraus; i++) {
        const alturaDegrau = (i + 1) * (alturaTotal / numeroDegraus);
        
        // Degrau principal (reutilizando geometria)
        const degrau = new THREE.Mesh(degrauGeometry, materialDegrau);
        degrau.position.set(0, alturaDegrau, 0);
        degrau.castShadow = true;
        degrau.receiveShadow = true;
        this.escadaGroup.add(degrau);

        // Suportes do degrau (reutilizando geometria)
        const suporteEsq = new THREE.Mesh(suporteGeometry, materialEstrutura);
        suporteEsq.position.set(-larguraEscada/2 + 0.04, alturaDegrau - 0.1, 0);
        this.escadaGroup.add(suporteEsq);
        
        const suporteDir = new THREE.Mesh(suporteGeometry, materialEstrutura);
        suporteDir.position.set(larguraEscada/2 - 0.04, alturaDegrau - 0.1, 0);
        this.escadaGroup.add(suporteDir);
      }

      // === CORRIMÕES ===
      // Corrimão esquerdo (reutilizando geometria)
      const corrimaoEsq = new THREE.Mesh(corrimaoGeometry, materialEstrutura);
      corrimaoEsq.position.set(-larguraEscada/2 - 0.05, (alturaTotal + 0.2)/2, 0);
      corrimaoEsq.castShadow = true;
      this.escadaGroup.add(corrimaoEsq);
      
      // Corrimão direito (reutilizando geometria)
      const corrimaoDir = new THREE.Mesh(corrimaoGeometry, materialEstrutura);
      corrimaoDir.position.set(larguraEscada/2 + 0.05, (alturaTotal + 0.2)/2, 0);
      corrimaoDir.castShadow = true;
      this.escadaGroup.add(corrimaoDir);

      // === BASE DE FIXAÇÃO ===
      const baseGeometry = new THREE.BoxGeometry(larguraEscada + 0.2, 0.15, 0.4);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.3,
        roughness: 0.7
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0.075, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      this.escadaGroup.add(base);

      // === PARAFUSOS DE FIXAÇÃO ===
      for (let i = 0; i < 4; i++) {
        const x = (i % 2 === 0) ? -larguraEscada/2 : larguraEscada/2;
        const z = (i < 2) ? -0.15 : 0.15;
        
        const parafuso = new THREE.Mesh(parafusoGeometry, materialEstrutura);
        parafuso.position.set(x, 0.025, z);
        this.escadaGroup.add(parafuso);
      }

      // === PLACA DE SEGURANÇA ===
      const placaGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.01);
      const placaMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Amarelo de segurança
        metalness: 0.1,
        roughness: 0.8
      });
      const placa = new THREE.Mesh(placaGeometry, placaMaterial);
      placa.position.set(0, 1.5, -0.2);
      this.escadaGroup.add(placa);

      // === POSICIONAMENTO E ORIENTAÇÃO FINAL ===
      this.escadaGroup.position.set(posicao.x, 0, posicao.z);
      this.escadaGroup.rotation.y = posicao.angulo + Math.PI; // Escada virada para o silo
      
      this.scene.add(this.escadaGroup);
    },

    buildNivelGrao(alturaSilo, raioSilo) {
      if (!this.dados?.leitura) return;

      const leitura = this.dados.leitura;
      const espacamentoSensores = 0.8; // Espaçamento fixo reduzido pela metade

      // Calcular nível de grão por cabo baseado nos sensores com temGrao: true
      const niveisPorCabo = {};
      const cabosPositions = this.calculateCablePositionsByLevels(leitura, raioSilo);

      Object.entries(leitura).forEach(([pendulo, sensores], index) => {
        const position = cabosPositions[index];
        let nivelMaisAlto = 0;
        let temGraoNesteCabo = false;

        // Encontrar o sensor mais alto com grão (temGrao: true)
        Object.entries(sensores).forEach(([sensorKey, valores]) => {
          const numeroSensor = parseInt(sensorKey);
          const temGrao = valores[4]; // Último valor indica se tem grão
          const temp = parseFloat(valores[0]);
          const ativo = valores[4];

          if (temGrao && ativo && temp !== -1000 && temp !== 0) {
            const alturaDoSensor = 0.5 + (numeroSensor * espacamentoSensores);
            if (alturaDoSensor > nivelMaisAlto) {
              nivelMaisAlto = alturaDoSensor;
              temGraoNesteCabo = true;
            }
          }
        });

        if (temGraoNesteCabo) {
          niveisPorCabo[index] = {
            x: position[0],
            z: position[2],
            altura: nivelMaisAlto
          };
        }
      });

      // Se não há dados de grão, não criar superfície
      if (Object.keys(niveisPorCabo).length === 0) return;

      // Criar superfície de grão com relevo usando geometria personalizada
      this.createGrainSurfaceWithRelief(niveisPorCabo, raioSilo, alturaSilo);
    },

    createGrainSurfaceWithRelief(niveisPorCabo, raioSilo, alturaSilo) {
      const segmentos = 32;
      const segmentosAltura = 16;
      const vertices = [];
      const indices = [];
      const normals = [];
      const uvs = [];

      // Calcular altura média para casos onde não há dados
      const alturas = Object.values(niveisPorCabo).map(cabo => cabo.altura);
      const alturaMedia = alturas.length > 0 ? alturas.reduce((a, b) => a + b, 0) / alturas.length : 0.5;

      // Criar vértices em cilindro (círculo + altura) para superfície completa
      for (let i = 0; i <= segmentos; i++) {
        for (let j = 0; j <= segmentosAltura; j++) {
          const u = i / segmentos;
          const v = j / segmentosAltura;

          // Posição no círculo
          const angulo = u * Math.PI * 2;
          const distanciaDocentro = raioSilo * 0.95;

          const x = Math.cos(angulo) * distanciaDocentro;
          const z = Math.sin(angulo) * distanciaDocentro;

          // Interpolar altura baseada nos cabos próximos para o topo
          let alturaTopoInterpolada = this.interpolateHeightAtPosition(x, z, niveisPorCabo, alturaMedia);

          // Adicionar variação natural para relevo no topo
          const ruido = (Math.sin(x * 5) * Math.cos(z * 5)) * 0.05;
          alturaTopoInterpolada += ruido;

          // Altura varia do chão (0.3) até o topo interpolado
          const alturaAtual = 0.3 + (v * (alturaTopoInterpolada - 0.3));

          vertices.push(x, alturaAtual, z);

          // Normais aproximadas (apontando para fora do cilindro)
          const normalX = Math.cos(angulo);
          const normalZ = Math.sin(angulo);
          normals.push(normalX * 0.1, 0.9, normalZ * 0.1); // Principalmente para cima

          // UVs para textura
          uvs.push(u, v);
        }
      }

      // Criar índices para faces laterais (com orientação dupla para visibilidade)
      for (let i = 0; i < segmentos; i++) {
        for (let j = 0; j < segmentosAltura; j++) {
          const a = i * (segmentosAltura + 1) + j;
          const b = i * (segmentosAltura + 1) + j + 1;
          const c = ((i + 1) % (segmentos + 1)) * (segmentosAltura + 1) + j;
          const d = ((i + 1) % (segmentos + 1)) * (segmentosAltura + 1) + j + 1;

          // Faces para fora
          indices.push(a, b, c);
          indices.push(b, d, c);

          // Faces para dentro (para garantir visibilidade de baixo)
          indices.push(c, b, a);
          indices.push(c, d, b);
        }
      }

      // Adicionar vértices e faces para a superfície do chão (base)
      const centroChaoIndex = vertices.length / 3;
      vertices.push(0, 0.3, 0); // Centro do chão
      normals.push(0, 1, 0);
      uvs.push(0.5, 0.5);

      // Vértices da borda do chão
      for (let i = 0; i <= segmentos; i++) {
        const u = i / segmentos;
        const angulo = u * Math.PI * 2;
        const x = Math.cos(angulo) * raioSilo * 0.95;
        const z = Math.sin(angulo) * raioSilo * 0.95;

        vertices.push(x, 0.3, z);
        normals.push(0, 1, 0);
        uvs.push(u, 0);
      }

      // Faces do chão (triangulos do centro para a borda) - ambas direções
      const baseBordaStartIndex = centroChaoIndex + 1;
      for (let i = 0; i < segmentos; i++) {
        const curr = baseBordaStartIndex + i;
        const next = baseBordaStartIndex + ((i + 1) % (segmentos + 1));

        // Face para cima
        indices.push(centroChaoIndex, curr, next);
        // Face para baixo
        indices.push(centroChaoIndex, next, curr);
      }

      // Adicionar vértices e faces para a superfície superior (relevo)
      const centroTopoIndex = vertices.length / 3;

      // Centro do topo - suavizar usando múltiplos pontos
      const raioSuavizacao = raioSilo * 0.2; // Raio da área central suavizada
      const pontosRadiais = 8; // Pontos ao redor do centro
      const alturaCentroBase = this.interpolateHeightAtPosition(0, 0, niveisPorCabo, alturaMedia);

      // Centro principal
      vertices.push(0, alturaCentroBase, 0);
      normals.push(0, 1, 0);
      uvs.push(0.5, 0.5);

      // Pontos radiais para suavização
      const indicesPontosCentro = [centroTopoIndex];
      for (let i = 0; i < pontosRadiais; i++) {
        const angulo = (i / pontosRadiais) * Math.PI * 2;
        const x = Math.cos(angulo) * raioSuavizacao;
        const z = Math.sin(angulo) * raioSuavizacao;

        // Suavizar altura gradualmente do centro para as bordas
        const alturaInterpolada = this.interpolateHeightAtPosition(x, z, niveisPorCabo, alturaMedia);
        const fatorSuavizacao = 0.7; // Reduz picos no centro
        const alturaFinal = alturaCentroBase + ((alturaInterpolada - alturaCentroBase) * fatorSuavizacao);

        vertices.push(x, alturaFinal, z);
        normals.push(0, 1, 0);
        uvs.push(0.5 + (x / raioSilo), 0.5 + (z / raioSilo));

        indicesPontosCentro.push(vertices.length / 3 - 1);
      }

      // Vértices da borda do topo
      const topoBordaStartIndex = vertices.length / 3;
      for (let i = 0; i <= segmentos; i++) {
        const u = i / segmentos;
        const angulo = u * Math.PI * 2;
        const x = Math.cos(angulo) * raioSilo * 0.95;
        const z = Math.sin(angulo) * raioSilo * 0.95;

        let alturaInterpolada = this.interpolateHeightAtPosition(x, z, niveisPorCabo, alturaMedia);
        const ruido = (Math.sin(x * 5) * Math.cos(z * 5)) * 0.05;
        alturaInterpolada += ruido;

        vertices.push(x, alturaInterpolada, z);
        normals.push(0, 1, 0);
        uvs.push(u, 1);
      }

      // Faces do centro suavizado
      for (let i = 0; i < pontosRadiais; i++) {
        const curr = indicesPontosCentro[i + 1];
        const next = indicesPontosCentro[((i + 1) % pontosRadiais) + 1];

        // Face para cima
        indices.push(centroTopoIndex, curr, next);
        // Face para baixo
        indices.push(centroTopoIndex, next, curr);
      }

      // Faces do centro para as bordas (usando pontos de suavização)
      for (let i = 0; i < segmentos; i++) {
        const bordaCurr = topoBordaStartIndex + i;
        const bordaNext = topoBordaStartIndex + ((i + 1) % (segmentos + 1));

        // Encontrar ponto de suavização mais próximo
        const anguloSegmento = (i / segmentos) * Math.PI * 2;
        const pontoSuavizacao = Math.floor((anguloSegmento / (Math.PI * 2)) * pontosRadiais);
        const centroSuavizacao = indicesPontosCentro[(pontoSuavizacao % pontosRadiais) + 1];
        const centroSuavizacaoNext = indicesPontosCentro[((pontoSuavizacao + 1) % pontosRadiais) + 1];

        // Faces suavizadas
        indices.push(centroSuavizacao, bordaCurr, bordaNext);
        indices.push(centroSuavizacao, bordaNext, centroSuavizacaoNext);

        // Faces invertidas para visibilidade
        indices.push(centroSuavizacao, bordaNext, bordaCurr);
        indices.push(centroSuavizacao, centroSuavizacaoNext, bordaNext);
      }

      // Criar geometria personalizada
      const geometry = new THREE.BufferGeometry();
      geometry.setIndex(indices);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

      // Recalcular normais para iluminação correta
      geometry.computeVertexNormals();

      // Material do grão com ambos os lados visíveis
      const graoMaterial = new THREE.MeshStandardMaterial({
        color: 0xD4B886,
        transparent: true,
        opacity: 0.65,
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide, // Importante: ambos os lados visíveis
        depthWrite: false // Melhora a transparência
      });

      const graoMesh = new THREE.Mesh(geometry, graoMaterial);
      graoMesh.receiveShadow = true;
      graoMesh.castShadow = true;
      graoMesh.renderOrder = -1; // Renderizar antes de outros elementos transparentes
      this.scene.add(graoMesh);

      // Adicionar bordas do grão para melhor visualização (opcional)
      const edges = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0xB8A06B,
        transparent: true,
        opacity: 0.25
      });
      const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
      edgeLines.renderOrder = -2; // Atrás dos cabos
      this.scene.add(edgeLines);
    },

    interpolateHeightAtPosition(x, z, niveisPorCabo, alturaMedia) {
      const cabos = Object.values(niveisPorCabo);

      if (cabos.length === 0) return alturaMedia * 0.5;

      if (cabos.length === 1) return cabos[0].altura;

      // Usar interpolação IDW (Inverse Distance Weighting)
      let somaAlturas = 0;
      let somaPesos = 0;

      cabos.forEach(cabo => {
        const distancia = Math.sqrt(
          Math.pow(x - cabo.x, 2) + Math.pow(z - cabo.z, 2)
        );

        // Evitar divisão por zero e adicionar peso mínimo
        const distanciaSegura = Math.max(distancia, 0.1);
        const peso = 1 / Math.pow(distanciaSegura, 2);

        somaAlturas += cabo.altura * peso;
        somaPesos += peso;
      });

      const alturaInterpolada = somaPesos > 0 ? somaAlturas / somaPesos : alturaMedia;

      // Garantir que a altura seja razoável
      return Math.max(0.2, Math.min(alturaInterpolada, alturaMedia * 1.2));
    },

    buildSensorsAndCables(alturaSilo, raioSilo) {
      if (!this.dados?.leitura) return;

      const leitura = this.dados.leitura;
      const numCabos = Object.keys(leitura).length;

      // Calcular posições dos cabos baseado na distribuição por níveis
      const cabosPositions = this.calculateCablePositionsByLevels(leitura, raioSilo);

      // Criar cabos e sensores
      Object.entries(leitura).forEach(([pendulo, sensores], index) => {
        const position = cabosPositions[index];

        // Cabo principal
        this.createCable(position, alturaSilo, pendulo, sensores);

        // Nome do pêndulo
        this.createPendulumLabel(position, pendulo);

        // Sensores (agora de baixo para cima)
        this.createSensors(position, sensores, alturaSilo, pendulo);

        // Peso na extremidade
        this.createWeight(position);
      });
    },

    calculateCablePositionsByLevels(leitura, raioSilo) {
      const positions = [];

      // Agrupar pêndulos por número de sensores
      const pendulosPorTamanho = {};
      Object.entries(leitura).forEach(([pendulo, sensores]) => {
        const numSensores = Object.keys(sensores).length;
        if (!pendulosPorTamanho[numSensores]) {
          pendulosPorTamanho[numSensores] = [];
        }
        pendulosPorTamanho[numSensores].push(pendulo);
      });

      // Ordenar tamanhos do maior para o menor
      const tamanhos = Object.keys(pendulosPorTamanho)
        .map(t => parseInt(t))
        .sort((a, b) => b - a);

      // Calcular níveis de distribuição
      const niveis = tamanhos.map((tamanho, index) => ({
        tamanho,
        pendulos: pendulosPorTamanho[tamanho],
        raio: raioSilo * (0.2 + (index * 0.25)) // Centro para bordas
      }));

      // Distribuir posições por nível
      const positionsMap = {};

      niveis.forEach(nivel => {
        const { pendulos, raio } = nivel;
        const numPendulos = pendulos.length;

        if (numPendulos === 1) {
          // Se só tem um pêndulo neste nível, coloca no centro
          positionsMap[pendulos[0]] = [0, 0, 0];
        } else {
          // Distribuir em círculo
          pendulos.forEach((pendulo, index) => {
            const angle = (index / numPendulos) * Math.PI * 2;
            const x = Math.cos(angle) * raio;
            const z = Math.sin(angle) * raio;
            positionsMap[pendulo] = [x, 0, z];
          });
        }
      });

      // Retornar posições na ordem original
      Object.keys(leitura).forEach(pendulo => {
        positions.push(positionsMap[pendulo] || [0, 0, 0]);
      });

      return positions;
    },

    createCable(position, alturaSilo, penduloNome, sensores) {
      // Pêndulo mais fino como solicitado
      const cableGeometry = new THREE.CylinderGeometry(0.04, 0.04, alturaSilo - 0.3, 12);
      const cableMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x333333,
        emissiveIntensity: 0.2
      });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.set(position[0], (alturaSilo + 0.3) / 2, position[2]);
      cable.castShadow = true;
      cable.receiveShadow = true;

      // Armazenar dados do cabo para clique
      cable.userData = {
        tipo: 'cabo',
        nome: penduloNome,
        sensores: Object.entries(sensores).map(([sensorNum, dadosSensor]) => {
          const [temp, alarme, preAlarme, falha, ativo] = dadosSensor;
          return {
            numero: parseInt(sensorNum),
            temperatura: parseFloat(temp),
            alarme,
            preAlarme,
            falha,
            ativo,
            temGrao: ativo && temp !== -1000 && temp !== 0 && !falha // Determinar se tem grão
          };
        })
      };

      // Garantir que o cabo sempre fique visível
      cable.renderOrder = 1;
      cable.material.depthTest = true;
      cable.material.depthWrite = true;

      this.cabos3D.push(cable);
      this.scene.add(cable);
    },

    createPendulumLabel(position, pendulo) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;

      context.fillStyle = '#2E86AB';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = 'white';
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.fillText(pendulo, canvas.width / 2, canvas.height / 2 + 8);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(position[0], -0.5, position[2]);
      sprite.scale.set(0.6, 0.3, 1);
      this.scene.add(sprite);
      this.textSprites.push(sprite);
    },

    createSensors(position, sensores, alturaSilo, pendulo) {
      const sensoresArray = Object.entries(sensores);
      const espacamentoSensores = 0.8; // Espaçamento fixo reduzido pela metade

      // Ordenar sensores por número (de baixo para cima como no Silo.vue)
      const sensoresOrdenados = sensoresArray
        .map(([sensorKey, valores]) => ({
          numero: parseInt(sensorKey),
          valores
        }))
        .sort((a, b) => a.numero - b.numero);

      sensoresOrdenados.forEach(({ numero, valores }, sensorIndex) => {
        // Posição de baixo para cima: base + (número do sensor * espaçamento)
        // Usar exatamente a mesma lógica do Silo.vue
        const yPos = 0.5 + (numero * espacamentoSensores);

        if (yPos < alturaSilo - 1.0) { // Dar mais margem para evitar sensores no teto
          const [temp, alarme, preAlarme, falha, ativo] = valores;

          // Corpo do sensor (agora clicável)
          this.createSensorBody(position, yPos, temp, alarme, falha, ativo, pendulo, numero);

          // Antena do sensor
          this.createSensorAntenna(position, yPos);

          // Não criar mais labels de temperatura - removido
        }
      });
    },

    createSensorBody(position, yPos, temp, alarme, falha, ativo, pendulo, numero) {
      // Determinar se tem grão (nível)
      const temGrao = ativo && temp !== -1000 && temp !== 0 && !falha;

      // Cor: cinza se não tem nível, cor da temperatura se tem nível
      const cor = ativo ? (temGrao ? this.corFaixaExata(temp) : 0xcccccc) : 0xcccccc;

      // Sensor redondo como solicitado
      const sensorGeometry = new THREE.SphereGeometry(0.15, 16, 12);
      const sensorMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        emissive: alarme ? 0xff0000 : (temGrao ? cor : 0x444444),
        emissiveIntensity: alarme ? 0.4 : (temGrao ? 0.15 : 0.1),
        metalness: 0.4,
        roughness: 0.6
      });
      const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
      sensor.position.set(position[0], yPos, position[2]);

      // Tornar sensor clicável - adicionar dados do cabo correspondente
      sensor.userData = {
        tipo: 'sensor_clicavel',
        pendulo: pendulo,
        numero: numero,
        temperatura: parseFloat(temp),
        alarme,
        falha,
        ativo,
        temGrao
      };

      // Garantir que o sensor sempre fique visível
      sensor.renderOrder = 2;
      sensor.material.depthTest = true;
      sensor.material.depthWrite = true;

      // Adicionar à lista de objetos clicáveis
      this.cabos3D.push(sensor);
      
      this.scene.add(sensor);
    },

    createSensorAntenna(position, yPos) {
      const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8);
      const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(position[0], yPos + 0.08, position[2]);
      this.scene.add(antenna);
    },

    

    createWeight(position) {
      const weightGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.2, 16);
      const weightMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.3
      });
      const weight = new THREE.Mesh(weightGeometry, weightMaterial);
      weight.position.set(position[0], 0.3 + 0.1, position[2]);
      this.scene.add(weight);
    },

    buildAerators(raioSilo) {
      const layout = this.dados.dados_layout;
      if (!layout?.aeradores || layout.aeradores.na <= 0) return;

      const numAeradores = layout.aeradores.na;
      const motorStatus = this.dados.motor?.statusMotor || [];
      const raioAeradores = raioSilo * 1.3;

      for (let i = 0; i < numAeradores; i++) {
        const angle = (i / numAeradores) * Math.PI * 2;
        const x = Math.cos(angle) * raioAeradores;
        const z = Math.sin(angle) * raioAeradores;
        const y = 0.2;

        const status = motorStatus[i] || 0;
        this.createAerador([x, y, z], i + 1, status);
      }
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
      const baseGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.15, 16);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.3
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0.075, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      aeradorGroup.add(base);

      // Parafusos de fixação da base
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const parafusoGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8);
        const parafusoMaterial = new THREE.MeshStandardMaterial({
          color: 0x222222,
          metalness: 0.9,
          roughness: 0.1
        });
        const parafuso = new THREE.Mesh(parafusoGeometry, parafusoMaterial);
        parafuso.position.set(
          Math.cos(angle) * 0.35,
          0.165,
          Math.sin(angle) * 0.35
        );
        aeradorGroup.add(parafuso);
      }

      // Pernas de apoio robustas
      for (let i = 0; i < 4; i++) {
        const angle = (i * 90) * Math.PI / 180;
        const x = Math.cos(angle) * 0.3;
        const z = Math.sin(angle) * 0.3;

        // Perna principal (tubo estrutural)
        const pernaGeometry = new THREE.CylinderGeometry(0.025, 0.035, 0.2, 12);
        const pernaMaterial = new THREE.MeshStandardMaterial({
          color: 0x444444,
          metalness: 0.6,
          roughness: 0.4
        });
        const perna = new THREE.Mesh(pernaGeometry, pernaMaterial);
        perna.position.set(x, -0.1, z);
        perna.castShadow = true;
        aeradorGroup.add(perna);

        // Sapata de apoio
        const sapataGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.04, 8);
        const sapata = new THREE.Mesh(sapataGeometry, pernaMaterial);
        sapata.position.set(x, -0.2, z);
        sapata.castShadow = true;
        aeradorGroup.add(sapata);

        // Diagonal de reforço
        const diagonalGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8);
        const diagonal = new THREE.Mesh(diagonalGeometry, pernaMaterial);
        diagonal.position.set(x * 0.7, 0.05, z * 0.7);
        diagonal.rotation.x = Math.atan2(z, x) + Math.PI / 4;
        diagonal.rotation.z = -Math.PI / 6;
        aeradorGroup.add(diagonal);
      }

      // Carcaça do motor (formato industrial cilíndrico)
      const carcacaGeometry = new THREE.CylinderGeometry(0.12, 0.14, 0.35, 24);
      const carcacaMaterial = new THREE.MeshStandardMaterial({
        color: cores[status],
        metalness: 0.7,
        roughness: 0.3,
        emissive: status === 3 ? cores[status] : 0x000000,
        emissiveIntensity: status === 3 ? 0.1 : 0
      });
      const carcaca = new THREE.Mesh(carcacaGeometry, carcacaMaterial);
      carcaca.position.set(0, 0.33, 0);
      carcaca.castShadow = true;
      aeradorGroup.add(carcaca);

      // Aletas de refrigeração do motor
      for (let i = 0; i < 12; i++) {
        const aletaGeometry = new THREE.BoxGeometry(0.25, 0.015, 0.008);
        const aletaMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          metalness: 0.8,
          roughness: 0.2
        });
        const aleta = new THREE.Mesh(aletaGeometry, aletaMaterial);
        aleta.position.set(0, 0.33 + (i - 6) * 0.025, 0);
        aeradorGroup.add(aleta);
      }

      // Tampa superior do motor
      const tampaGeometry = new THREE.CylinderGeometry(0.13, 0.12, 0.05, 24);
      const tampaMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.8,
        roughness: 0.2
      });
      const tampa = new THREE.Mesh(tampaGeometry, tampaMaterial);
      tampa.position.set(0, 0.53, 0);
      tampa.castShadow = true;
      aeradorGroup.add(tampa);

      // Eixo do motor
      const eixoGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 12);
      const eixoMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.1
      });
      const eixo = new THREE.Mesh(eixoGeometry, eixoMaterial);
      eixo.position.set(0, 0.63, 0);
      eixo.castShadow = true;
      aeradorGroup.add(eixo);

      

      // Hélice realista horizontal (posição mais baixa)
      const heliceGroup = new THREE.Group();
      heliceGroup.position.set(0, 0.62, 0); // Posição mais baixa

      // Hub central da hélice (menor e cinza claro)
      const hubGeometry = new THREE.CylinderGeometry(0.045, 0.055, 0.08, 12); // Menor
      const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0xB0B0B0, // Cinza claro
        metalness: 0.6,
        roughness: 0.3
      });
      const hub = new THREE.Mesh(hubGeometry, hubMaterial);
      // Rotacionar o hub para ficar horizontal
      hub.rotation.z = Math.PI / 2;
      heliceGroup.add(hub);

      // Pás da hélice arredondadas menores e mais magras (3 pás)
      for (let j = 0; j < 3; j++) {
        const angle = (j * 120) * Math.PI / 180;

        // Criar pá arredondada usando geometria customizada menor e mais magra
        const paGroup = new THREE.Group();
        
        // Criar forma arredondada da pá usando menos segmentos e mais magra
        const segmentos = 5;
        const paMaterial = new THREE.MeshStandardMaterial({
          color: 0xC0C0C0, // Cinza claro
          metalness: 0.5,
          roughness: 0.3
        });

        for (let k = 0; k < segmentos; k++) {
          const t = k / (segmentos - 1);
          const raio = 0.02 + (0.03 * Math.sin(t * Math.PI)); // Menor e mais magra
          const distancia = 0.03 + (t * 0.12); // Menor alcance
          
          const segmentoGeometry = new THREE.SphereGeometry(raio, 8, 6);
          segmentoGeometry.scale(1, 0.12, 0.8); // Mais magra e achatada
          
          const segmento = new THREE.Mesh(segmentoGeometry, paMaterial);
          segmento.position.set(distancia, 0, 0);
          paGroup.add(segmento);
        }

        // Ponta arredondada da pá menor e mais magra
        const pontaGeometry = new THREE.SphereGeometry(0.03, 8, 6);
        pontaGeometry.scale(0.6, 0.12, 0.8); // Mais magra
        const ponta = new THREE.Mesh(pontaGeometry, paMaterial);
        ponta.position.set(0.18, 0, 0); // Menor alcance
        paGroup.add(ponta);

        // Posicionar e rotacionar a pá com mais espaço entre elas
        paGroup.position.set(
          Math.cos(angle) * 0.02, // Ligeiramente mais afastada do centro
          0,
          Math.sin(angle) * 0.02
        );
        paGroup.rotation.y = angle;
        paGroup.rotation.z = Math.PI / 20; // Inclinação mais sutil

        heliceGroup.add(paGroup);
      }

      // Parafusos do hub menores
      for (let j = 0; j < 6; j++) {
        const angle = (j * 60) * Math.PI / 180;
        const parafusoGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.015, 6);
        const parafuso = new THREE.Mesh(parafusoGeometry, hubMaterial);
        parafuso.position.set(
          Math.cos(angle) * 0.025,
          0,
          Math.sin(angle) * 0.025
        );
        parafuso.rotation.z = Math.PI / 2;
        heliceGroup.add(parafuso);
      }

      aeradorGroup.add(heliceGroup);

      // Armazenar para animação se ligado
      if (status === 3) {
        this.aeradorHélices.push(heliceGroup);
      }

      // Caixa de conexão elétrica
      const caixaGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.04);
      const caixaMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.3,
        roughness: 0.7
      });
      const caixa = new THREE.Mesh(caixaGeometry, caixaMaterial);
      caixa.position.set(0.18, 0.33, 0);
      caixa.castShadow = true;
      aeradorGroup.add(caixa);

      // Eletroduto
      const eletrodutoGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
      const eletroduto = new THREE.Mesh(eletrodutoGeometry, caixaMaterial);
      eletroduto.position.set(0.18, 0.15, 0);
      aeradorGroup.add(eletroduto);

      this.scene.add(aeradorGroup);

      // Placa de identificação (mais realista)
      const placaGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.005);
      const placaMaterial = new THREE.MeshStandardMaterial({
        color: 0x2E86AB,
        metalness: 0.1,
        roughness: 0.8
      });
      const placa = new THREE.Mesh(placaGeometry, placaMaterial);
      placa.position.set(0, 0.4, 0.15);
      aeradorGroup.add(placa);

      // Texto na placa
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;

      context.fillStyle = '#2E86AB';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = 'white';
      context.font = 'bold 16px Arial';
      context.textAlign = 'center';
      context.fillText(`AE-${id}`, canvas.width / 2, canvas.height / 2 - 5);
      
      context.font = '10px Arial';
      context.fillText(this.getStatusTexto(status), canvas.width / 2, canvas.height / 2 + 10);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(position[0], position[1] + 0.4, position[2] + 0.25);
      sprite.scale.set(0.2, 0.1, 1);
      this.scene.add(sprite);
      this.textSprites.push(sprite);

      // LED indicador de status (mais realista)
      const ledGeometry = new THREE.CylinderGeometry(0.008, 0.01, 0.02, 8);
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: cores[status],
        emissive: status === 3 ? cores[status] : 0x000000,
        emissiveIntensity: status === 3 ? 0.8 : 0,
        transparent: true,
        opacity: 0.9
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(0.06, 0.4, 0.15);
      aeradorGroup.add(led);

      // Efeito de luz quando ligado
      if (status === 3) {
        const luzLed = new THREE.PointLight(cores[status], 0.3, 1);
        luzLed.position.set(0.06, 0.4, 0.15);
        aeradorGroup.add(luzLed);
      }

      // Vibrações visuais quando ligado
      if (status === 3) {
        const originalPosition = aeradorGroup.position.clone();
        aeradorGroup.userData.originalPosition = originalPosition;
        aeradorGroup.userData.isVibrating = true;
      }
    },

    buildGroundGrid(raioSilo) {
      const gridSize = raioSilo * 12;
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

    setupAutoZoom(alturaSilo, raioSilo) {
      // Auto zoom após inatividade
      setInterval(() => {
        if (Date.now() - this.lastInteractionTime >= 15000 && !this.isZoomedIn) {
          this.zoomToCenter(alturaSilo, raioSilo);

          // Volta ao normal após 5 segundos
          setTimeout(() => {
            this.resetZoom(alturaSilo, raioSilo);
          }, 5000);
        }
      }, 15000);
    },

    zoomToCenter(alturaSilo, raioSilo) {
      this.isZoomedIn = true;
      this.cameraRadius = raioSilo * 0.8;
      this.updateCameraPosition(alturaSilo);
    },

    resetZoom(alturaSilo, raioSilo) {
      this.isZoomedIn = false;
      this.cameraRadius = raioSilo * 3;
      this.updateCameraPosition(alturaSilo);
    },

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

    handleInteraction() {
      this.lastInteractionTime = Date.now();
      if (this.isZoomedIn) {
        const alturaSilo = this.getAlturaSilo();
        const raioSilo = this.getRaioSilo();
        this.resetZoom(alturaSilo, raioSilo);
      }
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);

      // Rotação automática
      if (this.autoRotate && !this.isMouseDown) {
        this.cameraTheta += 0.005;
        const alturaSilo = this.getAlturaSilo();
        this.updateCameraPosition(alturaSilo);
      }

      // Animar hélices dos aeradores
      this.aeradorHélices.forEach(helice => {
        helice.rotation.y += 0.5;
      });

      // Animar vibrações dos aeradores ligados
      const time = Date.now() * 0.01;
      this.scene.traverse((child) => {
        if (child.userData && child.userData.isVibrating) {
          const originalPos = child.userData.originalPosition;
          child.position.x = originalPos.x + Math.sin(time * 2) * 0.002;
          child.position.y = originalPos.y + Math.cos(time * 1.7) * 0.001;
          child.position.z = originalPos.z + Math.sin(time * 2.3) * 0.002;
        }
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    updateVisualization() {
      if (!this.scene) return;

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
      this.cabos3D = [];

      // Reconstruir
      if (this.dados) {
        const layout = this.dados.dados_layout;
        const leitura = this.dados.leitura;
        const numCabos = Object.keys(leitura).length;
        const alturaSilo = this.getAlturaSilo();
        const larguraBase = layout.desenho_corte_silo?.lb || 463;
        const raioSilo = Math.max(3, (larguraBase / 100) * 1.2);

        this.cameraRadius = raioSilo * 3;
        this.updateCameraPosition(alturaSilo);

        this.setupLighting(raioSilo, alturaSilo);
        this.buildSiloStructure(numCabos, alturaSilo, raioSilo);
        this.buildLadders(alturaSilo, raioSilo);
        this.buildNivelGrao(alturaSilo, raioSilo);
        this.buildSensorsAndCables(alturaSilo, raioSilo);
        this.buildAerators(raioSilo);
        this.buildGroundGrid(raioSilo);
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

    getNumPendulosAtivos() {
      if (!this.dados?.leitura) return 0;

      let ativos = 0;
      Object.values(this.dados.leitura).forEach(sensores => {
        // Verificar se pelo menos um sensor está ativo
        const temSensorAtivo = Object.values(sensores).some(valores => {
          const temp = parseFloat(valores[0]);
          const ativo = valores[4];
          return ativo && temp !== -1000 && temp !== 0;
        });
        if (temSensorAtivo) ativos++;
      });

      return ativos;
    },

    getStatusAeradores() {
      const numAeradores = this.dados?.dados_layout?.aeradores?.na || 0;
      const motorStatus = this.dados?.motor?.statusMotor || [];

      // Garantir que temos status para todos os aeradores
      const status = [];
      for (let i = 0; i < numAeradores; i++) {
        status.push(motorStatus[i] || 0);
      }

      return status;
    },

    getCorAerador(status) {
      const cores = {
        0: '#c5c5c5', // desligado - cinza
        1: '#ffeb3b', // startando - amarelo
        3: '#31dd0f', // ligado - verde
        4: '#ff0000'  // erro - vermelho
      };
      return cores[status] || cores[0];
    },

    getStatusTexto(status) {
      const textos = {
        0: 'Desligado',
        1: 'Ligando',
        3: 'Ligado',
        4: 'Erro'
      };
      return textos[status] || 'Desconhecido';
    },

    getTemperaturaMedia() {
      if (!this.dados?.leitura) return '--';

      let somaTemp = 0;
      let countTemp = 0;

      Object.values(this.dados.leitura).forEach(sensores => {
        Object.values(sensores).forEach(valores => {
          const temp = parseFloat(valores[0]);
          const ativo = valores[4];

          if (ativo && temp !== -1000 && temp !== 0 && !isNaN(temp)) {
            somaTemp += temp;
            countTemp++;
          }
        });
      });

      return countTemp > 0 ? (somaTemp / countTemp).toFixed(1) : '--';
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
          // Clicou em um sensor individual - criar dados do cabo baseado no sensor
          this.mostrarInfoCaboDoSensor(objeto.userData);
        }
      }
    },

    mostrarInfoCaboDoSensor(dadosSensor) {
      // Encontrar os dados completos do cabo baseado no pêndulo do sensor clicado
      const caboCompleto = this.cabos3D.find(cabo => 
        cabo.userData.tipo === 'cabo' && cabo.userData.nome === dadosSensor.pendulo
      );

      if (caboCompleto) {
        // Mostrar informações do cabo completo
        this.mostrarInfoCabo(caboCompleto.userData);
      } else {
        // Fallback - criar dados básicos apenas com este sensor
        const dadosCabo = {
          tipo: 'cabo',
          nome: dadosSensor.pendulo,
          sensores: [{
            numero: dadosSensor.numero,
            temperatura: dadosSensor.temperatura,
            alarme: dadosSensor.alarme,
            preAlarme: false,
            falha: dadosSensor.falha,
            ativo: dadosSensor.ativo,
            temGrao: dadosSensor.temGrao
          }]
        };
        
        this.caboSelecionado = dadosCabo;
        this.mostrarCardCabo = true;
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

      // Usar mesma função corFaixaExata
      return `#${this.corFaixaExata(parseFloat(temperatura)).toString(16).padStart(6, '0')}`;
    },

    calcularMediaTemperatura(sensores) {
      const sensoresAtivos = sensores.filter(s => s.ativo && !s.falha && s.temperatura !== -1000);
      if (sensoresAtivos.length === 0) return '--';

      const soma = sensoresAtivos.reduce((acc, sensor) => acc + sensor.temperatura, 0);
      return (soma / sensoresAtivos.length).toFixed(1);
    },

    calcularSensoresComNivel(sensores) {
      const comNivel = sensores.filter(s => s.temGrao).length;
      return `${comNivel}/${sensores.length}`;
    },

    getCorSensorComNivel(temperatura, ativo, falha, temGrao) {
      if (falha) return '#ff0000';
      if (!ativo) return '#cccccc';
      if (!temGrao) return '#cccccc'; // Cinza se não tem nível

      // Se tem nível, usar cor baseada na temperatura
      return `#${this.corFaixaExata(parseFloat(temperatura)).toString(16).padStart(6, '0')}`;
    },

    getStatusSensor(sensor) {
      if (sensor.falha) return 'ERRO';
      if (!sensor.ativo) return 'Sem nível';
      if (!sensor.temGrao) return 'Sem nível';
      return 'Com nível - Ativo';
    },

    getTextoTemperatura(sensor) {
      if (sensor.falha) return 'ERR';
      // Sempre mostrar temperatura, independente do status de ativo/nível
      return `${sensor.temperatura.toFixed(1)}°C`;
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

    iniciarArrastoCardSilo(event) {
      this.arrastandoSilo = true;
      const rect = this.$refs.cardSilo.getBoundingClientRect();
      this.offsetXSilo = event.clientX - rect.left;
      this.offsetYSilo = event.clientY - rect.top;

      document.addEventListener('mousemove', this.arrastarCardSilo);
      document.addEventListener('mouseup', this.pararArrastoCardSilo);
      event.preventDefault();
    },

    arrastarCardSilo(event) {
      if (!this.arrastandoSilo) return;

      const card = this.$refs.cardSilo;
      if (!card) return;

      const x = event.clientX - this.offsetXSilo;
      const y = event.clientY - this.offsetYSilo;

      // Limitar às bordas da tela
      const maxX = window.innerWidth - card.offsetWidth;
      const maxY = window.innerHeight - card.offsetHeight;

      const limitedX = Math.max(0, Math.min(x, maxX));
      const limitedY = Math.max(0, Math.min(y, maxY));

      card.style.left = `${limitedX}px`;
      card.style.top = `${limitedY}px`;
      card.style.right = 'auto';
    },

    pararArrastoCardSilo() {
      this.arrastandoSilo = false;
      document.removeEventListener('mousemove', this.arrastarCardSilo);
      document.removeEventListener('mouseup', this.pararArrastoCardSilo);
    },

    cleanup() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      // Limpar escada se existir
      if (this.escadaGroup) {
        this.scene.remove(this.escadaGroup);
        this.disposeGroup(this.escadaGroup);
        this.escadaGroup = null;
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