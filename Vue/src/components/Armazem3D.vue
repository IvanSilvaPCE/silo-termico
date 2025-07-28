
<template>
  <div style="width: 100%; height: 100vh;">
    <!-- Controles -->
    <div style="position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(0,0,0,0.8); color: white; padding: 15px; border-radius: 8px; font-size: 14px;">
      <div><strong>Armazém 3D - Dados Reais</strong></div>
      <hr style="margin: 10px 0;" />
      <div>Arcos: {{ totalArcos }}</div>
      <div>Pêndulos: {{ totalPendulos }}</div>
      <div>Sensores: {{ totalSensores }}</div>
      <div>Aeradores: {{ totalAeradores }}</div>
      <hr style="margin: 10px 0;" />
      <div><strong>Por Célula:</strong></div>
      <div>Célula 1: {{ totalSensoresPorCelula[1] }} sensores</div>
      <div>Célula 2: {{ totalSensoresPorCelula[2] }} sensores</div>
      <div>Célula 3: {{ totalSensoresPorCelula[3] }} sensores</div>

      <div style="margin-top: 15px;">
        <label>
          <input type="checkbox" v-model="autoRotate" />
          Rotação Automática
        </label>
        <button
          @click="sincronizarConfig"
          style="margin-left: 10px; padding: 5px 10px; font-size: 12px; color: black; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;"
        >
          Sincronizar com ModeladorSVG
        </button>
      </div>
    </div>

    <!-- Canvas 3D -->
    <div v-if="carregando" style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px;">
      Carregando Armazém 3D...
    </div>
    <div v-else ref="canvasContainer" style="height: 100%; background: linear-gradient(to bottom, #87CEEB, #E0F6FF);"></div>
  </div>
</template>

<script>
import * as THREE from 'three';

export default {
  name: 'Armazem3D',
  data() {
    return {
      dados: null,
      carregando: true,
      autoRotate: true,
      config3D: null,
      scene: null,
      camera: null,
      renderer: null,
      animationId: null,
      alturaArmazem: 6
    };
  },
  computed: {
    layoutTopo() {
      return this.dados?.configuracao?.layout_topo;
    },
    totalArcos() {
      return this.layoutTopo ? 
        Object.keys(this.layoutTopo).filter(key => key !== 'celulas' && key !== 'aeradores').length : 0;
    },
    totalPendulos() {
      let total = 0;
      if (this.layoutTopo) {
        Object.entries(this.layoutTopo).forEach(([arcoKey, arcoData]) => {
          if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;
          const sensores = arcoData.sensores || {};
          total += Object.keys(sensores).length;
        });
      }
      return total;
    },
    totalSensores() {
      let count = 0;
      if (this.dados?.arcos) {
        Object.values(this.dados.arcos).forEach(arco => {
          Object.values(arco).forEach(pendulo => {
            count += Object.keys(pendulo).length;
          });
        });
      }
      return count;
    },
    totalAeradores() {
      return this.layoutTopo?.aeradores ? Object.keys(this.layoutTopo.aeradores).length : 0;
    },
    totalSensoresPorCelula() {
      const porCelula = { 1: 0, 2: 0, 3: 0 };
      if (this.layoutTopo) {
        Object.entries(this.layoutTopo).forEach(([arcoKey, arcoData]) => {
          if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;
          const sensores = arcoData.sensores || {};
          const celula = arcoData.celula;
          const numSensores = Object.keys(sensores).length;
          if (celula >= 1 && celula <= 3) {
            porCelula[celula] += numSensores;
          }
        });
      }
      return porCelula;
    },
    numeroArcos() {
      return this.dados?.arcos ? Object.keys(this.dados.arcos).length : 19;
    },
    larguraArmazem() {
      return Math.max(this.numeroArcos * 1.5, this.totalPendulos * 0.8, 15);
    }
  },
  mounted() {
    this.carregarDados();
  },
  beforeDestroy() {
    this.cleanup();
  },
  watch: {
    autoRotate(newVal) {
      // Implementar mudança na rotação automática se necessário
    }
  },
  methods: {
    async carregarDados() {
      try {
        this.carregando = true;
        const response = await fetch("/models/modeloRotaArmazemPortal_1751897945212.json");
        const dadosCarregados = await response.json();
        this.dados = dadosCarregados;

        const configArmazemSalva = localStorage.getItem("configArmazem");
        if (configArmazemSalva) {
          this.config3D = JSON.parse(configArmazemSalva);
        } else {
          this.config3D = {
            pb: 185,
            lb: 350,
            hb: 30,
            hf: 5,
            lf: 250,
            le: 15,
            ht: 50,
            tipo_telhado: 1,
            tipo_fundo: 0,
            intensidade_fundo: 20,
            curvatura_topo: 30,
          };
        }
        
        this.initThreeJS();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        this.carregando = false;
      }
    },

    initThreeJS() {
      if (!this.dados) return;

      const container = this.$refs.canvasContainer;
      if (!container) return;

      const profundidadeArmazem = 10;

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      this.camera.position.set(
        this.larguraArmazem * 0.8, 
        this.alturaArmazem * 1.5, 
        this.larguraArmazem * 0.5
      );

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);

      // Controls
      this.setupControls();

      // Lighting
      this.setupLighting();

      // Build armazem
      this.buildArmazemStructure(this.numeroArcos, this.alturaArmazem, this.larguraArmazem, profundidadeArmazem);
      this.buildPendulos();
      this.buildMotores();

      // Start animation
      this.animate();

      // Handle resize
      window.addEventListener('resize', this.onWindowResize);
    },

    setupControls() {
      // Implementação básica de controles
      let isMouseDown = false;
      let mouseX = 0;
      let mouseY = 0;

      const container = this.$refs.canvasContainer;

      container.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
      });

      container.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;

        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;

        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position);
        
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        this.camera.position.setFromSpherical(spherical);
        this.camera.lookAt(0, this.alturaArmazem / 2, 0);

        mouseX = event.clientX;
        mouseY = event.clientY;
      });

      container.addEventListener('mouseup', () => {
        isMouseDown = false;
      });

      container.addEventListener('wheel', (event) => {
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        this.camera.position.multiplyScalar(scale);
      });
    },

    setupLighting() {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      this.scene.add(ambientLight);

      // Directional lights
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight1.position.set(20, 15, 10);
      directionalLight1.castShadow = true;
      directionalLight1.shadow.mapSize.setSize(2048, 2048);
      this.scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xfff8dc, 0.5);
      directionalLight2.position.set(-10, 10, -5);
      this.scene.add(directionalLight2);

      // Point lights internos
      const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
      pointLight1.position.set(0, this.alturaArmazem * 0.8, 0);
      this.scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 15);
      pointLight2.position.set(-this.larguraArmazem / 4, this.alturaArmazem * 0.6, 0);
      this.scene.add(pointLight2);

      const pointLight3 = new THREE.PointLight(0xffffff, 0.3, 15);
      pointLight3.position.set(this.larguraArmazem / 4, this.alturaArmazem * 0.6, 0);
      this.scene.add(pointLight3);
    },

    buildArmazemStructure(numeroArcos, alturaArmazem, larguraArmazem, profundidadeArmazem) {
      const corTelhado = 0xE6E6E6;
      const corBase = 0x999999;
      const corParede = 0xD0D0D0;
      const espessuraParede = 0.15;

      // Base/Piso do armazém
      const baseGeometry = new THREE.BoxGeometry(
        larguraArmazem + espessuraParede, 
        0.1, 
        profundidadeArmazem + espessuraParede
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

      // Paredes laterais
      const paredeGeometry = new THREE.BoxGeometry(espessuraParede, alturaArmazem, profundidadeArmazem);
      const paredeMaterial = new THREE.MeshStandardMaterial({
        color: corParede,
        transparent: true,
        opacity: 0.3
      });

      // Parede esquerda
      const paredeEsquerda = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeEsquerda.position.set(-larguraArmazem / 2, alturaArmazem / 2, 0);
      paredeEsquerda.castShadow = true;
      paredeEsquerda.receiveShadow = true;
      this.scene.add(paredeEsquerda);

      // Parede direita
      const paredeDireita = new THREE.Mesh(paredeGeometry, paredeMaterial);
      paredeDireita.position.set(larguraArmazem / 2, alturaArmazem / 2, 0);
      paredeDireita.castShadow = true;
      paredeDireita.receiveShadow = true;
      this.scene.add(paredeDireita);

      // Paredes frontais
      const paredeFrontalGeometry = new THREE.BoxGeometry(larguraArmazem, alturaArmazem, espessuraParede);
      
      // Parede frente
      const paredeFrente = new THREE.Mesh(paredeFrontalGeometry, paredeMaterial);
      paredeFrente.position.set(0, alturaArmazem / 2, -profundidadeArmazem / 2);
      paredeFrente.castShadow = true;
      paredeFrente.receiveShadow = true;
      this.scene.add(paredeFrente);

      // Parede fundo
      const paredeFundo = new THREE.Mesh(paredeFrontalGeometry, paredeMaterial);
      paredeFundo.position.set(0, alturaArmazem / 2, profundidadeArmazem / 2);
      paredeFundo.castShadow = true;
      paredeFundo.receiveShadow = true;
      this.scene.add(paredeFundo);

      // Telhado em duas águas
      const telhadoGeometry = new THREE.BoxGeometry(larguraArmazem + 1.5, 0.1, profundidadeArmazem / 2 + 0.3);
      const telhadoMaterial = new THREE.MeshStandardMaterial({
        color: corTelhado,
        metalness: 0.1,
        roughness: 0.8
      });

      // Primeira parte do telhado
      const telhado1 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado1.position.set(0, alturaArmazem + 0.15, -profundidadeArmazem / 4);
      telhado1.rotation.x = -Math.PI / 12;
      telhado1.castShadow = true;
      this.scene.add(telhado1);

      // Segunda parte do telhado
      const telhado2 = new THREE.Mesh(telhadoGeometry, telhadoMaterial);
      telhado2.position.set(0, alturaArmazem + 0.15, profundidadeArmazem / 4);
      telhado2.rotation.x = Math.PI / 12;
      telhado2.castShadow = true;
      this.scene.add(telhado2);

      // Cumeeira do telhado
      const cumeeiraGeometry = new THREE.BoxGeometry(larguraArmazem + 1.6, 0.1, 0.15);
      const cumeeiraMaterial = new THREE.MeshStandardMaterial({
        color: corBase,
        metalness: 0.2,
        roughness: 0.7
      });
      const cumeeira = new THREE.Mesh(cumeeiraGeometry, cumeeiraMaterial);
      cumeeira.position.set(0, alturaArmazem + 0.25, 0);
      cumeeira.castShadow = true;
      this.scene.add(cumeeira);
    },

    buildPendulos() {
      if (!this.layoutTopo) return;

      const profundidadeArmazem = 10;

      Object.entries(this.layoutTopo).forEach(([arcoKey, arcoData]) => {
        if (arcoKey === 'celulas' || arcoKey === 'aeradores') return;

        const posXTopo = arcoData.pos_x;
        const sensoresArco = arcoData.sensores || {};

        // Converter posição X do topo para 3D
        const posX3D = -this.larguraArmazem / 2 + (posXTopo / 600) * this.larguraArmazem;

        Object.entries(sensoresArco).forEach(([penduloId, posYTopo]) => {
          const numeroPendulo = parseInt(penduloId);
          
          // Converter posição Y do topo para Z no 3D
          const posZ3D = -profundidadeArmazem / 2 + ((posYTopo - 50) / 250) * (profundidadeArmazem - 2) + 1;

          this.buildPendulo(posX3D, posZ3D, numeroPendulo, parseInt(arcoKey));
        });
      });
    },

    buildPendulo(posX, posZ, numeroPendulo, arcoNumero) {
      const alturaArmazem = 6;
      const alturaCabo = Math.max(2, 4 * 0.4 + 1.5); // Estimativa baseada em sensores
      const alturaMinima = 1.0;

      // Cabo principal
      const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, alturaCabo, 8);
      const cableMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.set(posX, alturaArmazem - (alturaCabo / 2), posZ);
      this.scene.add(cable);

      // Simular alguns sensores
      for (let i = 0; i < 4; i++) {
        const yPos = alturaArmazem - 0.2 - (i * 0.4);
        const temp = 20 + Math.random() * 10; // Temperatura simulada
        const cor = this.corFaixaExata(temp);

        const sensorGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.06);
        const sensorMaterial = new THREE.MeshStandardMaterial({ color: cor });
        const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        sensor.position.set(posX, yPos, posZ);
        this.scene.add(sensor);
      }

      // Peso na extremidade
      const weightGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.1, 8);
      const weightMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
      const weight = new THREE.Mesh(weightGeometry, weightMaterial);
      weight.position.set(posX, alturaArmazem - alturaCabo + alturaMinima, posZ);
      this.scene.add(weight);
    },

    buildMotores() {
      if (!this.layoutTopo?.aeradores) return;

      const profundidadeArmazem = 10;
      const margemExterna = 1.5;

      Object.entries(this.layoutTopo.aeradores).forEach(([aeradorId, dadosAerador]) => {
        const [posX2D, posY2D] = dadosAerador;

        // Posicionar motores fora do armazém
        let posX3D = this.larguraArmazem / 2 + margemExterna;
        let posZ3D = -profundidadeArmazem / 2 + (posY2D / 400) * profundidadeArmazem;

        if (parseInt(aeradorId) % 2 === 0) {
          posX3D = -this.larguraArmazem / 2 - margemExterna;
        }

        this.buildMotor(posX3D, posZ3D, parseInt(aeradorId));
      });
    },

    buildMotor(posX, posZ, id) {
      const status = Math.random() > 0.5 ? 3 : 0; // Status simulado
      const cores = {
        0: 0xc5c5c5,
        1: 0xffeb3b,
        3: 0x31dd0f,
        4: 0xff0000,
      };

      // Base do motor
      const motorGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 12);
      const motorMaterial = new THREE.MeshStandardMaterial({
        color: cores[status] || cores[0]
      });
      const motor = new THREE.Mesh(motorGeometry, motorMaterial);
      motor.position.set(posX, 0.3, posZ);
      this.scene.add(motor);

      // Hélice central
      const heliceGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.02, 6);
      const heliceMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const helice = new THREE.Mesh(heliceGeometry, heliceMaterial);
      helice.position.set(posX, 0.4, posZ);
      this.scene.add(helice);

      // Pás da hélice
      for (let i = 0; i < 3; i++) {
        const angle = (i * 120 * Math.PI) / 180;
        const paGeometry = new THREE.BoxGeometry(0.15, 0.015, 0.03);
        const paMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
        const pa = new THREE.Mesh(paGeometry, paMaterial);
        
        pa.position.set(
          posX + Math.cos(angle) * 0.1,
          0.4,
          posZ + Math.sin(angle) * 0.1
        );
        pa.rotation.y = angle;
        
        this.scene.add(pa);
      }
    },

    corFaixaExata(t) {
      if (t === -1000 || t === 0) return 0x666666;
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

    sincronizarConfig() {
      const configArmazemSalva = localStorage.getItem("configArmazem");
      if (configArmazemSalva) {
        this.config3D = JSON.parse(configArmazemSalva);
        alert("Configurações do ModeladorSVG recarregadas!");
      } else {
        alert("Nenhuma configuração encontrada no ModeladorSVG.");
      }
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate);
      
      if (this.autoRotate && this.camera) {
        const time = Date.now() * 0.0005;
        const radius = this.camera.position.length();
        this.camera.position.x = Math.cos(time) * radius;
        this.camera.position.z = Math.sin(time) * radius;
        this.camera.lookAt(0, this.alturaArmazem / 2, 0);
      }

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
        if (container && this.renderer.domElement) {
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
