
<template>
  <div style="width: 100%; height: 100vh;">
    <!-- Controles simples -->
    <div style="position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.9); padding: 10px; border-radius: 5px;">
      <label>
        <input type="checkbox" v-model="autoRotate" />
        Rotação Automática
      </label>
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
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
      cameraRadius: 10,
      cameraTheta: 0,
      cameraPhi: Math.PI / 3,
      dados: null
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
        const dadosRotaSilo = await import('../rotaSilo.json')
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
      
      // Calcular o número máximo de sensores por cabo
      const maxSensores = Math.max(...Object.values(leitura).map(cabo => Object.keys(cabo).length));
      
      // Usar dados do layout para dimensionamento
      const distYSensores = layout.desenho_sensores?.dist_y_sensores || 12;
      const escalaSensores = layout.desenho_sensores?.escala_sensores || 16;
      
      // Calcular altura baseada nos sensores reais (conversão SVG para 3D)
      const alturaSilo = (maxSensores * (distYSensores / 10)) + 3; // Converter escala SVG para 3D
      
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

      // Controls
      this.setupControls(container);

      // Lighting
      this.setupLighting(raioSilo, alturaSilo);

      // Build silo structure
      this.buildSiloStructure(numCabos, alturaSilo, raioSilo);

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

      container.addEventListener('click', this.handleInteraction);
    },

    getAlturaSilo() {
      if (!this.dados?.leitura) return 10;
      
      // Encontrar o maior número de sensor em todos os pêndulos
      let maxNumeroSensor = 0;
      Object.values(this.dados.leitura).forEach(sensores => {
        Object.keys(sensores).forEach(sensorKey => {
          const numeroSensor = parseInt(sensorKey);
          if (numeroSensor > maxNumeroSensor) {
            maxNumeroSensor = numeroSensor;
          }
        });
      });
      
      const distYSensores = this.dados.dados_layout?.desenho_sensores?.dist_y_sensores || 12;
      const espacamentoSensores = (distYSensores / 10);
      
      // Altura calculada baseada no maior sensor + margem de segurança
      const alturaCalculada = 1.0 + (maxNumeroSensor * espacamentoSensores) + 2.0;
      
      // Garantir altura mínima razoável
      return Math.max(8, alturaCalculada);
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

      // Corpo principal do silo - cilindro
      const cylinderGeometry = new THREE.CylinderGeometry(raioSilo, raioSilo, alturaSilo, 48, 1, true);
      const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0xE5E5E5,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.8
      });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.position.y = alturaSilo / 2;
      cylinder.castShadow = true;
      cylinder.receiveShadow = true;
      this.scene.add(cylinder);

      // Base do silo
      const baseGeometry = new THREE.CylinderGeometry(raioSilo + 0.1, raioSilo + 0.1, 0.3, 48);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        metalness: 0.5,
        roughness: 0.5
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0;
      base.receiveShadow = true;
      this.scene.add(base);

      // Teto cônico do silo
      const coneGeometry = new THREE.ConeGeometry(raioSilo * 1.1, alturaTopo, 32);
      const coneMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        metalness: 0.3,
        roughness: 0.6
      });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.position.y = alturaSilo + alturaTopo / 2;
      cone.castShadow = true;
      this.scene.add(cone);

      // Tampa preta no topo do cone
      const capGeometry = new THREE.CylinderGeometry(raioSilo * 0.15, raioSilo * 0.18, 0.08, 16);
      const capMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.2
      });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.y = alturaSilo + alturaTopo - 0.02;
      this.scene.add(cap);
    },

    buildNivelGrao(alturaSilo, raioSilo) {
      if (!this.dados?.leitura) return;

      const leitura = this.dados.leitura;
      const distYSensores = this.dados.dados_layout?.desenho_sensores?.dist_y_sensores || 12;
      const espacamentoSensores = (distYSensores / 10);

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
      const alturaMedia = alturas.reduce((a, b) => a + b, 0) / alturas.length;

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
        const centroSuavizado = indicesPontosCentro[(pontoSuavizacao % pontosRadiais) + 1];
        const centroSuavizadoNext = indicesPontosCentro[((pontoSuavizacao + 1) % pontosRadiais) + 1];
        
        // Faces suavizadas
        indices.push(centroSuavizado, bordaCurr, bordaNext);
        indices.push(centroSuavizado, bordaNext, centroSuavizadoNext);
        
        // Faces invertidas para visibilidade
        indices.push(centroSuavizado, bordaNext, bordaCurr);
        indices.push(centroSuavizado, centroSuavizadoNext, bordaNext);
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
        opacity: 0.85,
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
        opacity: 0.15
      });
      const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
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
        this.createCable(position, alturaSilo);
        
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

    createCable(position, alturaSilo) {
      const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, alturaSilo - 0.3, 16);
      const cableMaterial = new THREE.MeshStandardMaterial({
        color: 0x2c2c2c,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x111111,
        emissiveIntensity: 0.1
      });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.set(position[0], (alturaSilo + 0.3) / 2, position[2]);
      cable.castShadow = true;
      cable.receiveShadow = true;
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
      const distYSensores = this.dados.dados_layout?.desenho_sensores?.dist_y_sensores || 12;
      const espacamentoSensores = (distYSensores / 10); // Converter escala SVG para 3D

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
          
          // Corpo do sensor
          this.createSensorBody(position, yPos, temp, alarme, falha, ativo);
          
          // Antena do sensor
          this.createSensorAntenna(position, yPos);
          
          // Texto da temperatura
          this.createTemperatureLabel(position, yPos, temp, falha, ativo, numero);
        }
      });
    },

    createSensorBody(position, yPos, temp, alarme, falha, ativo) {
      const cor = ativo ? this.corFaixaExata(temp) : 0xcccccc;
      
      const sensorGeometry = new THREE.BoxGeometry(0.25, 0.12, 0.12);
      const sensorMaterial = new THREE.MeshStandardMaterial({
        color: cor,
        emissive: alarme ? 0xff0000 : 0x000000,
        emissiveIntensity: alarme ? 0.3 : 0,
        metalness: 0.3,
        roughness: 0.7
      });
      const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
      sensor.position.set(position[0], yPos, position[2]);
      this.scene.add(sensor);
    },

    createSensorAntenna(position, yPos) {
      const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8);
      const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(position[0], yPos + 0.08, position[2]);
      this.scene.add(antenna);
    },

    createTemperatureLabel(position, yPos, temp, falha, ativo, numeroSensor) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;
      
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.fillStyle = falha ? '#ff0000' : '#00ff00';
      context.font = '20px Arial';
      context.textAlign = 'center';
      const texto = falha ? "ERR" : ativo ? `${temp.toFixed(1)}°C` : "OFF";
      context.fillText(texto, canvas.width / 2, canvas.height / 2 + 7);
      
      // Adicionar número do sensor
      context.fillStyle = 'white';
      context.font = '12px Arial';
      context.fillText(`S${numeroSensor}`, canvas.width / 2, 15);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(position[0] + 0.6, yPos, position[2]);
      sprite.scale.set(0.4, 0.2, 1);
      sprite.renderOrder = 1000;
      this.scene.add(sprite);
      this.textSprites.push(sprite);
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
        this.createAerator([x, y, z], i + 1, status);
      }
    },

    createAerator(position, id, status) {
      const cores = {
        0: 0xc5c5c5, // desligado
        1: 0xffeb3b, // startando
        3: 0x31dd0f, // ligado
        4: 0xff0000  // erro
      };

      // Base do motor
      const baseGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.2, 24);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.7,
        roughness: 0.3
      });
      const baseMotor = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMotor.position.set(position[0], position[1], position[2]);
      this.scene.add(baseMotor);

      // Corpo do motor
      const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: cores[status] || cores[0],
        metalness: 0.6,
        roughness: 0.4
      });
      const bodyMotor = new THREE.Mesh(bodyGeometry, bodyMaterial);
      bodyMotor.position.set(position[0], position[1] + 0.15, position[2]);
      this.scene.add(bodyMotor);

      // Aletas de refrigeração
      for (let j = 0; j < 4; j++) {
        const angle = (j * 90 * Math.PI) / 180;
        const finGeometry = new THREE.BoxGeometry(0.03, 0.25, 0.08);
        const finMaterial = new THREE.MeshStandardMaterial({
          color: 0x555555,
          metalness: 0.8,
          roughness: 0.2
        });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.set(
          position[0] + Math.cos(angle) * 0.32,
          position[1] + 0.15,
          position[2] + Math.sin(angle) * 0.32
        );
        fin.rotation.y = angle;
        this.scene.add(fin);
      }

      // Eixo do motor
      const axisGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
      const axisMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.9,
        roughness: 0.1
      });
      const axis = new THREE.Mesh(axisGeometry, axisMaterial);
      axis.position.set(position[0], position[1] + 0.35, position[2]);
      this.scene.add(axis);

      // Hélices
      const heliceGroup = new THREE.Group();
      heliceGroup.position.set(position[0], position[1] + 0.42, position[2]);

      // Hub central
      const hubGeometry = new THREE.CylinderGeometry(0.12, 0.08, 0.06, 8);
      const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0x2c2c2c,
        metalness: 0.9,
        roughness: 0.1
      });
      const hub = new THREE.Mesh(hubGeometry, hubMaterial);
      heliceGroup.add(hub);

      // Pás da hélice
      for (let j = 0; j < 5; j++) {
        const angle = (j * 72 * Math.PI) / 180;
        const bladeGeometry = new THREE.BoxGeometry(0.3, 0.03, 0.08);
        const bladeMaterial = new THREE.MeshStandardMaterial({
          color: 0xf0f0f0,
          metalness: 0.6,
          roughness: 0.3
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(
          Math.cos(angle) * 0.2,
          0,
          Math.sin(angle) * 0.2
        );
        blade.rotation.y = angle;
        blade.rotation.z = Math.PI / 8;
        heliceGroup.add(blade);
      }

      this.scene.add(heliceGroup);
      
      // Armazenar para animação se ligado
      if (status === 3) {
        this.aeradorHélices.push(heliceGroup);
      }

      // Placa de identificação
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;
      
      context.fillStyle = '#2E86AB';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.fillStyle = 'white';
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.fillText(`AE-${id}`, canvas.width / 2, canvas.height / 2 + 5);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(position[0], position[1] + 0.05, position[2] + 0.4);
      sprite.scale.set(0.3, 0.1, 1);
      this.scene.add(sprite);
      this.textSprites.push(sprite);

      // LED indicador
      const ledGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: cores[status] || cores[0],
        emissive: status === 3 ? cores[status] : 0x000000,
        emissiveIntensity: status === 3 ? 0.8 : 0
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(position[0], position[1] + 0.32, position[2] + 0.32);
      this.scene.add(led);
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

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    updateVisualization() {
      if (!this.scene) return;
      
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
      
      // Reconstruir
      if (this.dados) {
        const layout = this.dados.dados_layout;
        const leitura = this.dados.leitura;
        const numCabos = Object.keys(leitura).length;
        const maxSensores = Math.max(...Object.values(leitura).map(cabo => Object.keys(cabo).length));
        const distYSensores = layout.desenho_sensores?.dist_y_sensores || 12;
        const alturaSilo = (maxSensores * (distYSensores / 10)) + 3;
        const larguraBase = layout.desenho_corte_silo?.lb || 463;
        const raioSilo = Math.max(3, (larguraBase / 100) * 1.2);

        this.cameraRadius = raioSilo * 3;
        this.updateCameraPosition(alturaSilo);

        this.setupLighting(raioSilo, alturaSilo);
        this.buildSiloStructure(numCabos, alturaSilo, raioSilo);
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
