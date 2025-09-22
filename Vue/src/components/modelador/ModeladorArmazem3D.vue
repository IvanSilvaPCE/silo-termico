<template>
  <div class="modelador-armazem-3d">
    <!-- Indicador de carregamento -->
    <div v-if="carregando" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <div class="mt-2">{{ mensagemCarregamento }}</div>
      </div>
    </div>

    <!-- Indicador de erro -->
    <div v-if="erro" class="error-overlay">
      <div class="error-content">
        <div class="text-danger mb-2">⚠️ Erro na Modelagem 3D</div>
        <div class="small">{{ erro }}</div>
        <button @click="resetarErro" class="btn btn-outline-primary btn-sm mt-2">
          🔄 Tentar Novamente
        </button>
      </div>
    </div>

    <!-- Controles flutuantes de navegação -->
    <div v-if="configuracao && !carregando && !erro" class="controles-flutuantes">
      <div class="card controle-card">
        <div class="card-header p-2">
          <h6 class="mb-0">🎮 Navegação 3D</h6>
        </div>
        <div class="card-body p-2">
          <!-- Info do arco atual -->
          <div v-if="analiseArcos" class="mb-2">
            <small class="fw-bold">Arco {{ arcoAtual }}/{{ analiseArcos.totalArcos }}</small><br>
            <small class="text-muted">{{ modeloAtualInfo }}</small>
          </div>
          
          <!-- Navegação rápida -->
          <div class="btn-group-sm d-flex gap-1 mb-2">
            <button 
              @click="navegarArco('anterior')"
              :disabled="arcoAtual <= 1"
              class="btn btn-outline-primary btn-sm flex-fill">
              ← Ant.
            </button>
            <button 
              @click="navegarArco('proximo')"
              :disabled="arcoAtual >= (analiseArcos?.totalArcos || 1)"
              class="btn btn-outline-primary btn-sm flex-fill">
              Próx. →
            </button>
          </div>
          
          <!-- Controles de visualização compactos -->
          <div class="form-check form-switch mb-1">
            <input 
              v-model="opcoesInternas.autoRotate" 
              @change="atualizarVisualizacao"
              class="form-check-input" 
              type="checkbox" 
              id="switchRotacao">
            <label class="form-check-label small" for="switchRotacao">🔄 Auto</label>
          </div>
          <div class="form-check form-switch mb-1">
            <input 
              v-model="opcoesInternas.mostrarLabels" 
              @change="toggleLabels"
              class="form-check-input" 
              type="checkbox" 
              id="switchLabels">
            <label class="form-check-label small" for="switchLabels">🏷️ Labels</label>
          </div>
          <div class="form-check form-switch">
            <input 
              v-model="opcoesInternas.mostrarSensores" 
              @change="atualizarVisualizacao"
              class="form-check-input" 
              type="checkbox" 
              id="switchSensores">
            <label class="form-check-label small" for="switchSensores">🌡️ Sensores</label>
          </div>
          <div class="form-check form-switch">
            <input 
              v-model="opcoesInternas.mostrarCabos" 
              @change="atualizarVisualizacao"
              class="form-check-input" 
              type="checkbox" 
              id="switchCabos">
            <label class="form-check-label small" for="switchCabos">🔗 Cabos</label>
          </div>
          
          <!-- Estatísticas compactas -->
          <div v-if="estatisticas" class="mt-2 pt-2 border-top">
            <div class="small text-muted">
              <div>📊 {{ estatisticas.totalSensores }} sensores</div>
              <div>⚖️ {{ estatisticas.totalPendulos }} pêndulos</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card de informações do objeto selecionado -->
    <div v-if="objetoSelecionado" class="info-objeto-card">
      <div class="card">
        <div class="card-header p-2 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">📊 {{ objetoSelecionado.nome }}</h6>
          <button @click="fecharInfoObjeto" class="btn-close btn-sm"></button>
        </div>
        <div class="card-body p-2">
          <div class="info-sensores" v-if="objetoSelecionado.sensores">
            <div 
              v-for="(sensor, index) in objetoSelecionado.sensores" 
              :key="index"
              class="sensor-info mb-1 p-2 rounded"
              :style="{ borderLeft: `4px solid ${getCorSensor(sensor)}` }">
              <div class="d-flex justify-content-between">
                <small><strong>Sensor {{ sensor.numero }}</strong></small>
                <small 
                  class="fw-bold"
                  :style="{ color: getCorSensor(sensor) }">
                  {{ sensor.falha ? 'ERR' : `${sensor.temperatura.toFixed(1)}°C` }}
                </small>
              </div>
              <div class="d-flex justify-content-between">
                <small class="text-muted">
                  {{ sensor.ativo ? (sensor.falha ? 'ERRO' : 'Ativo') : 'Inativo' }}
                </small>
                <small v-if="sensor.pontoQuente || sensor.preAlarme" class="text-warning">
                  {{ sensor.pontoQuente ? '🔥' : '' }}
                  {{ sensor.preAlarme ? '⚠️' : '' }}
                </small>
              </div>
            </div>
            <div class="mt-2 pt-2 border-top text-center">
              <small class="text-muted">
                Média: {{ calcularMediaTemperatura(objetoSelecionado.sensores) }}°C
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Container do canvas 3D -->
    <div ref="canvasContainer" class="canvas-3d-container"></div>
  </div>
</template>

<script>
import * as THREE from 'three'

export default {
  name: 'ModeladorArmazem3D',
  props: {
    configuracao: {
      type: Object,
      default: null
    },
    arcoAtual: {
      type: Number,
      default: 1
    },
    opcoes: {
      type: Object,
      default: () => ({
        autoRotate: true,
        mostrarLabels: true,
        mostrarSensores: true,
        mostrarCabos: true
      })
    }
  },
  emits: [
    'arco-mudou',
    'estatisticas-atualizadas', 
    'erro',
    'configuracao-aplicada'
  ],
  data() {
    return {
      // Estado do Three.js
      scene: null,
      camera: null,
      renderer: null,
      animationId: null,
      raycaster: null,
      mouse: null,
      
      // Controles de câmera
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
      cameraRadius: 40,
      cameraTheta: 0,
      cameraPhi: Math.PI / 3,
      
      // Objetos 3D
      armazemGroup: null,
      sensores3D: [],
      cabos3D: [],
      pendulos3D: [],
      textSprites: [],
      
      // Estado da aplicação
      carregando: false,
      erro: null,
      mensagemCarregamento: 'Inicializando visualização 3D...',
      
      // Análise da configuração
      analiseArcos: null,
      modeloAtualInfo: 'Modelo Padrão',
      estatisticas: null,
      
      // Interação
      objetoSelecionado: null,
      
      // Opções internas (cópia das props para modificação local)
      opcoesInternas: {
        autoRotate: true,
        mostrarLabels: true,
        mostrarSensores: true,
        mostrarCabos: true
      }
    }
  },
  watch: {
    configuracao: {
      handler(novaConfig) {
        if (novaConfig) {
          this.aplicarConfiguracao3D(novaConfig)
        } else {
          this.limparCena()
        }
      },
      immediate: true
    },
    arcoAtual(novoArco) {
      if (this.configuracao) {
        this.navegarParaArco(novoArco)
      }
    },
    opcoes: {
      handler(novasOpcoes) {
        this.opcoesInternas = { ...novasOpcoes }
        this.atualizarVisualizacao()
      },
      deep: true
    }
  },
  mounted() {
    this.inicializarThreeJS()
  },
  beforeDestroy() {
    this.cleanup()
  },
  methods: {
    async aplicarConfiguracao3D(configuracao) {
      this.carregando = true
      this.erro = null
      this.mensagemCarregamento = 'Processando configuração...'
      
      try {
        // Analisar configuração
        this.analisarConfiguracao(configuracao)
        
        // Limpar cena anterior
        this.limparCena()
        
        // Aplicar nova configuração
        this.mensagemCarregamento = 'Construindo estrutura 3D...'
        await this.$nextTick()
        
        this.construirArmazem3D()
        this.construirPendulos()
        this.construirCabos()
        this.construirSensores()
        this.atualizarCamera()
        
        // Notificar aplicação da configuração
        this.$emit('configuracao-aplicada', {
          totalArcos: this.analiseArcos?.totalArcos || 1,
          configuracao: configuracao
        })
        
        this.mensagemCarregamento = ''
        
      } catch (error) {
        console.error('Erro ao aplicar configuração 3D:', error)
        this.erro = error.message || 'Erro desconhecido na aplicação da configuração'
        this.$emit('erro', this.erro)
      } finally {
        this.carregando = false
      }
    },

    analisarConfiguracao(configuracao) {
      this.analiseArcos = configuracao.analiseArcos || {
        totalArcos: 1,
        quantidadeModelos: 1,
        distribuicaoModelos: { 1: 1 }
      }
      
      // Calcular estatísticas
      let totalSensores = 0
      let totalPendulos = 0
      let totalCabos = 0
      
      if (configuracao.configModelos?.modelosDefinidos) {
        Object.values(configuracao.configModelos.modelosDefinidos).forEach(modelo => {
          totalPendulos += modelo.quantidadePendulos || 1
          totalCabos += modelo.quantidadePendulos || 1 // Um cabo por pêndulo
          
          // Estimar sensores por pêndulo (padrão 3 por pêndulo)
          const sensoresPorPendulo = 3
          totalSensores += (modelo.quantidadePendulos || 1) * sensoresPorPendulo
        })
      }
      
      this.estatisticas = {
        totalArcos: this.analiseArcos.totalArcos,
        totalPendulos: totalPendulos * this.analiseArcos.totalArcos,
        totalSensores: totalSensores * this.analiseArcos.totalArcos,
        totalCabos: totalCabos * this.analiseArcos.totalArcos,
        totalNiveis: this.calcularTotalNiveis(configuracao)
      }
      
      this.$emit('estatisticas-atualizadas', this.estatisticas)
      
      this.atualizarInfoModeloAtual()
    },

    atualizarInfoModeloAtual() {
      if (!this.analiseArcos?.distribuicaoModelos) {
        this.modeloAtualInfo = 'Modelo Padrão'
        return
      }
      
      const numeroModelo = this.analiseArcos.distribuicaoModelos[this.arcoAtual]
      const modelo = this.configuracao?.configModelos?.modelosDefinidos?.[numeroModelo]
      
      this.modeloAtualInfo = modelo ? modelo.nome : `Modelo ${numeroModelo || 1}`
    },

    calcularTotalNiveis(configuracao) {
      // Calcular níveis baseado na altura e configuração do armazém
      const estrutura = configuracao.estrutura3D
      if (!estrutura) return 1
      
      // Estimar níveis baseado na altura (cada nível ~3 metros)
      const alturaMediaNivel = 3
      const niveis = Math.max(1, Math.floor(estrutura.altura / alturaMediaNivel))
      
      return niveis
    },

    inicializarThreeJS() {
      const container = this.$refs.canvasContainer
      if (!container) return
      
      // Scene
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x87CEEB) // Cor do céu
      
      // Camera
      this.camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      )
      this.atualizarPosicaoCamera()
      
      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(container.clientWidth, container.clientHeight)
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      container.appendChild(this.renderer.domElement)
      
      // Raycaster para interação
      this.raycaster = new THREE.Raycaster()
      this.mouse = new THREE.Vector2()
      
      // Controles
      this.configurarControles(container)
      
      // Iluminação
      this.configurarIluminacao()
      
      // Grade do chão
      this.construirGrade()
      
      // Iniciar loop de animação
      this.animate()
      
      // Redimensionamento
      window.addEventListener('resize', this.onWindowResize)
    },

    atualizarPosicaoCamera() {
      const x = Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta) * this.cameraRadius
      const y = Math.cos(this.cameraPhi) * this.cameraRadius + 5
      const z = Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta) * this.cameraRadius
      
      this.camera.position.set(x, y, z)
      this.camera.lookAt(0, 3, 0)
    },

    configurarControles(container) {
      // Mouse down
      container.addEventListener('mousedown', (event) => {
        this.isMouseDown = true
        this.mouseX = event.clientX
        this.mouseY = event.clientY
      })
      
      // Mouse move
      container.addEventListener('mousemove', (event) => {
        if (!this.isMouseDown) return
        
        const deltaX = event.clientX - this.mouseX
        const deltaY = event.clientY - this.mouseY
        
        this.cameraTheta -= deltaX * 0.01
        this.cameraPhi += deltaY * 0.01
        this.cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraPhi))
        
        this.atualizarPosicaoCamera()
        
        this.mouseX = event.clientX
        this.mouseY = event.clientY
      })
      
      // Mouse up
      container.addEventListener('mouseup', () => {
        this.isMouseDown = false
      })
      
      // Click para interação
      container.addEventListener('click', (event) => {
        this.detectarCliqueObjeto(event, container)
      })
      
      // Wheel para zoom
      container.addEventListener('wheel', (event) => {
        event.preventDefault()
        const scale = event.deltaY > 0 ? 1.1 : 0.9
        this.cameraRadius *= scale
        this.cameraRadius = Math.max(10, Math.min(100, this.cameraRadius))
        this.atualizarPosicaoCamera()
      })
    },

    configurarIluminacao() {
      // Luz ambiente
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
      this.scene.add(ambientLight)
      
      // Luz direcional
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
      directionalLight.position.set(20, 20, 20)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      directionalLight.shadow.camera.near = 0.5
      directionalLight.shadow.camera.far = 100
      directionalLight.shadow.camera.left = -30
      directionalLight.shadow.camera.right = 30
      directionalLight.shadow.camera.top = 30
      directionalLight.shadow.camera.bottom = -30
      this.scene.add(directionalLight)
      
      // Luz pontual
      const pointLight = new THREE.PointLight(0xffffff, 0.6)
      pointLight.position.set(0, 15, 0)
      this.scene.add(pointLight)
    },

    construirGrade() {
      const size = 60
      const divisions = 20
      
      // Linhas da grade
      for (let i = 0; i <= divisions; i++) {
        const step = size / divisions
        const position = (i - divisions / 2) * step
        
        // Linhas horizontais
        const hGeo = new THREE.BoxGeometry(size, 0.02, 0.02)
        const hMat = new THREE.MeshBasicMaterial({ color: 0x666666 })
        const hLine = new THREE.Mesh(hGeo, hMat)
        hLine.position.set(0, -0.5, position)
        this.scene.add(hLine)
        
        // Linhas verticais
        const vGeo = new THREE.BoxGeometry(0.02, 0.02, size)
        const vMat = new THREE.MeshBasicMaterial({ color: 0x666666 })
        const vLine = new THREE.Mesh(vGeo, vMat)
        vLine.position.set(position, -0.5, 0)
        this.scene.add(vLine)
      }
    },

    construirArmazem3D() {
      if (!this.configuracao?.estrutura3D) return
      
      const estrutura = this.configuracao.estrutura3D
      
      // Grupo principal do armazém
      this.armazemGroup = new THREE.Group()
      this.scene.add(this.armazemGroup)
      
      // Base
      this.construirBase(estrutura)
      
      // Paredes
      this.construirParedes(estrutura)
      
      // Telhado
      this.construirTelhado(estrutura)
      
      // Vigas estruturais
      this.construirVigas(estrutura)
    },

    construirBase(estrutura) {
      const baseGeo = new THREE.BoxGeometry(
        estrutura.largura + 0.2,
        0.15,
        estrutura.profundidade + 0.2
      )
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.8,
        metalness: 0.2
      })
      const base = new THREE.Mesh(baseGeo, baseMat)
      base.position.set(0, 0, 0)
      base.receiveShadow = true
      this.armazemGroup.add(base)
    },

    construirParedes(estrutura) {
      const paredeMat = new THREE.MeshStandardMaterial({
        color: 0xD0D0D0,
        transparent: true,
        opacity: 0.6
      })
      
      // Paredes laterais
      const paredeLateralGeo = new THREE.BoxGeometry(estrutura.largura, estrutura.altura, 0.2)
      
      // Parede esquerda
      const paredeEsq = new THREE.Mesh(paredeLateralGeo, paredeMat)
      paredeEsq.position.set(0, estrutura.altura / 2, -estrutura.profundidade / 2)
      this.armazemGroup.add(paredeEsq)
      
      // Parede direita
      const paredeDir = new THREE.Mesh(paredeLateralGeo, paredeMat)
      paredeDir.position.set(0, estrutura.altura / 2, estrutura.profundidade / 2)
      this.armazemGroup.add(paredeDir)
      
      // Paredes frontais baseadas na configuração do telhado
      this.construirParedesFrontais(estrutura, paredeMat)
    },

    construirParedesFrontais(estrutura, material) {
      const tipoTelhado = estrutura.telhado?.tipo || 1
      const alturaTelhado = estrutura.altura + (estrutura.telhado?.altura || 0)
      
      if (tipoTelhado === 1) {
        // Telhado pontudo - paredes triangulares
        this.construirParedesTriangulares(estrutura, material, alturaTelhado)
      } else {
        // Telhado reto - paredes retangulares
        this.construirParedesRetangulares(estrutura, material)
      }
    },

    construirParedesTriangulares(estrutura, material, alturaTelhado) {
      // Criar geometria triangular para paredes frontais
      const shape = new THREE.Shape()
      shape.moveTo(-estrutura.profundidade / 2, 0)
      shape.lineTo(estrutura.profundidade / 2, 0)
      shape.lineTo(estrutura.profundidade / 2, estrutura.altura)
      shape.lineTo(0, alturaTelhado)
      shape.lineTo(-estrutura.profundidade / 2, estrutura.altura)
      shape.lineTo(-estrutura.profundidade / 2, 0)
      
      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: false
      }
      
      const paredeTriangularGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      
      // Parede frontal
      const paredeFrontal = new THREE.Mesh(paredeTriangularGeo, material)
      paredeFrontal.position.set(-estrutura.largura / 2, 0, 0)
      paredeFrontal.rotation.y = Math.PI / 2
      this.armazemGroup.add(paredeFrontal)
      
      // Parede traseira
      const paredeTraseira = new THREE.Mesh(paredeTriangularGeo, material)
      paredeTraseira.position.set(estrutura.largura / 2, 0, 0)
      paredeTraseira.rotation.y = -Math.PI / 2
      this.armazemGroup.add(paredeTraseira)
    },

    construirParedesRetangulares(estrutura, material) {
      const paredeFrontalGeo = new THREE.BoxGeometry(0.2, estrutura.altura, estrutura.profundidade)
      
      // Parede frontal
      const paredeFrontal = new THREE.Mesh(paredeFrontalGeo, material)
      paredeFrontal.position.set(-estrutura.largura / 2, estrutura.altura / 2, 0)
      this.armazemGroup.add(paredeFrontal)
      
      // Parede traseira
      const paredeTraseira = new THREE.Mesh(paredeFrontalGeo, material)
      paredeTraseira.position.set(estrutura.largura / 2, estrutura.altura / 2, 0)
      this.armazemGroup.add(paredeTraseira)
    },

    construirTelhado(estrutura) {
      const telhadoMat = new THREE.MeshStandardMaterial({
        color: 0xE6E6E6,
        roughness: 0.7,
        metalness: 0.3
      })
      
      const tipoTelhado = estrutura.telhado?.tipo || 1
      const alturaTelhado = estrutura.telhado?.altura || 3
      
      if (tipoTelhado === 1) {
        // Telhado pontudo
        this.construirTelhadoPontudo(estrutura, telhadoMat, alturaTelhado)
      } else {
        // Telhado plano
        this.construirTelhadoPlano(estrutura, telhadoMat)
      }
    },

    construirTelhadoPontudo(estrutura, material, altura) {
      // Duas faces do telhado em V
      const telhadoGeo = new THREE.PlaneGeometry(estrutura.largura, Math.sqrt(Math.pow(estrutura.profundidade / 2, 2) + Math.pow(altura, 2)))
      
      // Face esquerda
      const telhadoEsq = new THREE.Mesh(telhadoGeo, material)
      telhadoEsq.position.set(0, estrutura.altura + altura / 2, -estrutura.profundidade / 4)
      telhadoEsq.rotation.x = -Math.atan2(altura, estrutura.profundidade / 2)
      this.armazemGroup.add(telhadoEsq)
      
      // Face direita
      const telhadoDir = new THREE.Mesh(telhadoGeo, material)
      telhadoDir.position.set(0, estrutura.altura + altura / 2, estrutura.profundidade / 4)
      telhadoDir.rotation.x = Math.atan2(altura, estrutura.profundidade / 2)
      this.armazemGroup.add(telhadoDir)
    },

    construirTelhadoPlano(estrutura, material) {
      const telhadoGeo = new THREE.BoxGeometry(estrutura.largura, 0.1, estrutura.profundidade)
      const telhado = new THREE.Mesh(telhadoGeo, material)
      telhado.position.set(0, estrutura.altura, 0)
      this.armazemGroup.add(telhado)
    },

    construirVigas(estrutura) {
      const vigaMat = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.2
      })
      
      // Vigas horizontais principais
      for (let i = 0; i <= this.analiseArcos?.totalArcos || 1; i++) {
        const x = (i / ((this.analiseArcos?.totalArcos || 1) - 1) - 0.5) * estrutura.largura
        
        const vigaGeo = new THREE.BoxGeometry(0.1, 0.2, estrutura.profundidade)
        const viga = new THREE.Mesh(vigaGeo, vigaMat)
        viga.position.set(x, estrutura.altura - 0.1, 0)
        this.armazemGroup.add(viga)
      }
    },

    construirPendulos() {
      if (!this.configuracao?.configModelos?.modelosDefinidos || !this.opcoesInternas.mostrarSensores) return
      
      this.pendulos3D = []
      
      const estrutura = this.configuracao.estrutura3D
      const totalArcos = this.analiseArcos?.totalArcos || 1
      
      for (let arco = 1; arco <= totalArcos; arco++) {
        const numeroModelo = this.analiseArcos?.distribuicaoModelos?.[arco] || 1
        const modelo = this.configuracao.configModelos.modelosDefinidos[numeroModelo]
        
        if (modelo) {
          this.construirPendulosDoArco(arco, modelo, estrutura, totalArcos)
        }
      }
    },

    construirPendulosDoArco(numeroArco, modelo, estrutura, totalArcos) {
      const quantidadePendulos = modelo.quantidadePendulos || 3
      const x = ((numeroArco - 1) / (totalArcos - 1) - 0.5) * estrutura.largura
      
      for (let pendulo = 1; pendulo <= quantidadePendulos; pendulo++) {
        const z = ((pendulo - 1) / (quantidadePendulos - 1) - 0.5) * (estrutura.profundidade - 2)
        
        // Cabo do pêndulo
        const caboGeo = new THREE.CylinderGeometry(0.02, 0.02, estrutura.altura - 0.5, 8)
        const caboMat = new THREE.MeshStandardMaterial({ color: 0x444444 })
        const cabo = new THREE.Mesh(caboGeo, caboMat)
        cabo.position.set(x, estrutura.altura / 2, z)
        cabo.userData = {
          tipo: 'cabo',
          arco: numeroArco,
          pendulo: pendulo,
          modelo: modelo.nome
        }
        
        this.armazemGroup.add(cabo)
        this.cabos3D.push(cabo)
        this.pendulos3D.push({ arco: numeroArco, pendulo: pendulo, x, z })
      }
    },

    construirSensores() {
      if (!this.opcoesInternas.mostrarSensores) return
      
      this.sensores3D = []
      
      this.pendulos3D.forEach(penduloInfo => {
        this.construirSensoresDoPendulo(penduloInfo)
      })
    },

    construirSensoresDoPendulo(penduloInfo) {
      const numeroSensores = 3 // Padrão: 3 sensores por pêndulo
      const estrutura = this.configuracao.estrutura3D
      
      for (let sensor = 1; sensor <= numeroSensores; sensor++) {
        const y = (sensor / (numeroSensores + 1)) * (estrutura.altura - 1) + 0.5
        
        // Gerar dados simulados do sensor
        const dadosSensor = this.gerarDadosSimuladosDoSensor(penduloInfo.arco, penduloInfo.pendulo, sensor)
        
        // Cor baseada na temperatura
        const cor = this.corPorTemperatura(dadosSensor.temperatura, dadosSensor.falha, dadosSensor.ativo)
        
        const sensorGeo = new THREE.SphereGeometry(0.08, 8, 6)
        const sensorMat = new THREE.MeshStandardMaterial({
          color: cor,
          emissive: dadosSensor.falha ? 0x440000 : 0x000000,
          emissiveIntensity: dadosSensor.falha ? 0.3 : 0
        })
        
        const sensorMesh = new THREE.Mesh(sensorGeo, sensorMat)
        sensorMesh.position.set(penduloInfo.x + 0.1, y, penduloInfo.z)
        sensorMesh.userData = {
          tipo: 'sensor',
          arco: penduloInfo.arco,
          pendulo: penduloInfo.pendulo,
          numero: sensor,
          dadosSensor
        }
        
        this.armazemGroup.add(sensorMesh)
        this.sensores3D.push(sensorMesh)
        
        // Label do sensor
        if (this.opcoesInternas.mostrarLabels) {
          this.criarLabelSensor(sensorMesh.position, `S${sensor}`, dadosSensor.temperatura)
        }
      }
    },

    construirCabos() {
      if (!this.opcoesInternas.mostrarCabos) return
      
      // Limpar cabos anteriores
      this.limparCabos()
      
      this.cabos3D = []
      
      this.pendulos3D.forEach(penduloInfo => {
        this.construirCabosDoPendulo(penduloInfo)
      })
    },

    construirCabosDoPendulo(penduloInfo) {
      const estrutura = this.configuracao.estrutura3D
      
      // Cabo principal do pêndulo (vertical)
      const caboGeo = new THREE.CylinderGeometry(0.02, 0.02, estrutura.altura - 0.5, 8)
      const caboMat = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        metalness: 0.6,
        roughness: 0.4
      })
      const cabo = new THREE.Mesh(caboGeo, caboMat)
      cabo.position.set(penduloInfo.x, estrutura.altura / 2, penduloInfo.z)
      cabo.userData = {
        tipo: 'cabo',
        arco: penduloInfo.arco,
        pendulo: penduloInfo.pendulo,
        nome: `Arco ${penduloInfo.arco} - Pêndulo ${penduloInfo.pendulo}`
      }
      
      this.armazemGroup.add(cabo)
      this.cabos3D.push(cabo)
      
      // Conectores de cabo (pontos de fixação dos sensores)
      const numeroSensores = 3
      for (let sensor = 1; sensor <= numeroSensores; sensor++) {
        const y = (sensor / (numeroSensores + 1)) * (estrutura.altura - 1) + 0.5
        
        // Conector do sensor no cabo
        const conectorGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6)
        const conectorMat = new THREE.MeshStandardMaterial({ 
          color: 0x666666,
          metalness: 0.8,
          roughness: 0.2
        })
        const conector = new THREE.Mesh(conectorGeo, conectorMat)
        conector.position.set(penduloInfo.x, y, penduloInfo.z)
        conector.rotation.z = Math.PI / 2 // Horizontal
        
        this.armazemGroup.add(conector)
        
        // Cabo fino conectando sensor ao cabo principal
        const caboFinoGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 6)
        const caboFinoMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
        const caboFino = new THREE.Mesh(caboFinoGeo, caboFinoMat)
        caboFino.position.set(penduloInfo.x + 0.05, y, penduloInfo.z)
        caboFino.rotation.z = Math.PI / 2 // Horizontal
        
        this.armazemGroup.add(caboFino)
      }
      
      // Peso na extremidade do cabo
      const pesoGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8)
      const pesoMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        metalness: 0.9,
        roughness: 0.1
      })
      const peso = new THREE.Mesh(pesoGeo, pesoMat)
      peso.position.set(penduloInfo.x, 0.2, penduloInfo.z)
      
      this.armazemGroup.add(peso)
    },

    gerarDadosSimuladosDoSensor(arco, pendulo, sensor) {
      // Gerar dados simulados baseados em posição para consistência
      const seed = arco * 1000 + pendulo * 100 + sensor
      const random = (seed * 9301 + 49297) % 233280 / 233280
      
      const baseTemp = 20 + random * 15 // 20-35°C
      const ativo = random > 0.05 // 95% dos sensores ativos
      const falha = ativo && random < 0.02 // 2% de chance de falha
      const pontoQuente = ativo && !falha && baseTemp > 30
      const preAlarme = ativo && !falha && baseTemp > 28
      
      return {
        numero: sensor,
        temperatura: falha ? -1000 : baseTemp,
        ativo,
        falha,
        pontoQuente,
        preAlarme
      }
    },

    corPorTemperatura(temp, falha, ativo) {
      if (falha || temp === -1000) return 0xff0000
      if (!ativo) return 0xcccccc
      
      if (temp < 12) return 0x0384fc
      else if (temp < 15) return 0x03e8fc
      else if (temp < 17) return 0x03fcbe
      else if (temp < 21) return 0x07fc03
      else if (temp < 25) return 0xc3ff00
      else if (temp < 27) return 0xfcf803
      else if (temp < 30) return 0xffb300
      else if (temp < 35) return 0xff2200
      else if (temp < 50) return 0xff0090
      else return 0xf700ff
    },

    criarLabelSensor(posicao, texto, temperatura) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 128
      canvas.height = 64
      
      context.fillStyle = 'rgba(0, 0, 0, 0.7)'
      context.fillRect(0, 0, canvas.width, canvas.height)
      
      context.fillStyle = 'white'
      context.font = '12px Arial'
      context.textAlign = 'center'
      context.fillText(texto, canvas.width / 2, 20)
      context.fillText(`${temperatura.toFixed(1)}°C`, canvas.width / 2, 40)
      
      const texture = new THREE.CanvasTexture(canvas)
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.position.set(posicao.x + 0.3, posicao.y, posicao.z)
      sprite.scale.set(0.4, 0.2, 1)
      
      this.armazemGroup.add(sprite)
      this.textSprites.push(sprite)
    },

    detectarCliqueObjeto(event, container) {
      if (this.isMouseDown) return
      
      const rect = container.getBoundingClientRect()
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      this.raycaster.setFromCamera(this.mouse, this.camera)
      
      const intersects = this.raycaster.intersectObjects([...this.sensores3D, ...this.cabos3D])
      
      if (intersects.length > 0) {
        const objeto = intersects[0].object
        this.selecionarObjeto(objeto)
      } else {
        this.objetoSelecionado = null
      }
    },

    selecionarObjeto(objeto) {
      if (objeto.userData.tipo === 'sensor') {
        const sensoresDoMesmoPendulo = this.buscarSensoresDoMesmoPendulo(
          objeto.userData.arco,
          objeto.userData.pendulo
        )
        
        this.objetoSelecionado = {
          tipo: 'pendulo',
          nome: `Arco ${objeto.userData.arco} - Pêndulo ${objeto.userData.pendulo}`,
          sensores: sensoresDoMesmoPendulo
        }
      } else if (objeto.userData.tipo === 'cabo') {
        const sensores = this.buscarSensoresDoMesmoPendulo(
          objeto.userData.arco,
          objeto.userData.pendulo
        )
        
        this.objetoSelecionado = {
          tipo: 'cabo',
          nome: `${objeto.userData.modelo} - Arco ${objeto.userData.arco}`,
          sensores: sensores
        }
      }
    },

    buscarSensoresDoMesmoPendulo(arco, pendulo) {
      return this.sensores3D
        .filter(sensor => 
          sensor.userData.arco === arco && 
          sensor.userData.pendulo === pendulo
        )
        .map(sensor => sensor.userData.dadosSensor)
        .sort((a, b) => a.numero - b.numero)
    },

    navegarArco(direcao) {
      let novoArco = this.arcoAtual
      
      if (direcao === 'anterior' && this.arcoAtual > 1) {
        novoArco = this.arcoAtual - 1
      } else if (direcao === 'proximo' && this.arcoAtual < (this.analiseArcos?.totalArcos || 1)) {
        novoArco = this.arcoAtual + 1
      }
      
      if (novoArco !== this.arcoAtual) {
        this.$emit('arco-mudou', novoArco)
      }
    },

    navegarParaArco(numeroArco) {
      // Lógica específica para navegação de arco
      this.atualizarInfoModeloAtual()
      
      // Limpar elementos do arco anterior
      this.limparCabos()
      this.limparSensores()
      this.limparPendulos()
      this.limparLabels()
      
      // Reconstruir cabos e sensores para o novo arco
      this.atualizarVisualizacao()
      
      // Emitir evento de mudança de arco
      this.$emit('arco-mudou', numeroArco)
      
      // Destacar arco atual (opcional)
      this.destacarArcoAtual(numeroArco)
      
      // Emitir estatísticas atualizadas
      this.emitirEstatisticas()
    },

    destacarArcoAtual(numeroArco) {
      // Remover destaque anterior
      this.scene.traverse((child) => {
        if (child.userData.destaque) {
          child.material.emissive.setHex(0x000000)
          child.userData.destaque = false
        }
      })
      
      // Destacar novo arco
      if (this.configuracao?.estrutura3D) {
        const estrutura = this.configuracao.estrutura3D
        const totalArcos = this.analiseArcos?.totalArcos || 1
        const x = ((numeroArco - 1) / (totalArcos - 1) - 0.5) * estrutura.largura
        
        // Encontrar e destacar objetos do arco atual
        this.cabos3D.forEach(cabo => {
          if (cabo.userData.arco === numeroArco) {
            cabo.material.emissive.setHex(0x111111)
            cabo.userData.destaque = true
          }
        })
      }
    },

    toggleLabels() {
      this.textSprites.forEach(sprite => {
        sprite.visible = this.opcoesInternas.mostrarLabels
      })
    },

    atualizarVisualizacao() {
      if (this.configuracao) {
        this.construirPendulos()
        
        // Gerenciar visibilidade dos cabos
        if (this.opcoesInternas.mostrarCabos) {
          this.construirCabos()
        } else {
          this.limparCabos()
        }
        
        // Gerenciar visibilidade dos sensores
        if (this.opcoesInternas.mostrarSensores) {
          this.construirSensores()
        } else {
          this.limparSensores()
        }
        
        // Aplicar visibilidade em elementos existentes
        this.cabos3D.forEach(cabo => cabo.visible = this.opcoesInternas.mostrarCabos)
        this.sensores3D.forEach(sensor => sensor.visible = this.opcoesInternas.mostrarSensores)
        this.textSprites.forEach(sprite => sprite.visible = this.opcoesInternas.mostrarLabels)
        
        this.toggleLabels()
      }
    },

    atualizarCamera() {
      if (this.configuracao?.estrutura3D) {
        const estrutura = this.configuracao.estrutura3D
        // Ajustar câmera baseada no tamanho do armazém
        this.cameraRadius = Math.max(estrutura.largura, estrutura.profundidade) * 1.5
        this.atualizarPosicaoCamera()
      }
    },

    atualizarOpcoes(novasOpcoes) {
      this.opcoesInternas = { ...novasOpcoes }
      this.atualizarVisualizacao()
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate)
      
      // Rotação automática
      if (this.opcoesInternas.autoRotate && !this.isMouseDown) {
        this.cameraTheta += 0.005
        this.atualizarPosicaoCamera()
      }
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    limparCena() {
      if (!this.scene) return
      
      // Limpar cabos primeiro
      this.limparCabos()
      
      // Remover grupo do armazém se existir
      if (this.armazemGroup) {
        this.scene.remove(this.armazemGroup)
        this.armazemGroup = null
      }
      
      // Limpar arrays
      this.sensores3D = []
      this.cabos3D = []
      this.pendulos3D = []
      this.textSprites = []
      this.objetoSelecionado = null
    },

    limparCabos() {
      // Remover cabos existentes da cena
      this.cabos3D.forEach(cabo => {
        if (cabo.geometry) cabo.geometry.dispose()
        if (cabo.material) cabo.material.dispose()
        if (this.armazemGroup) {
          this.armazemGroup.remove(cabo)
        }
      })
      this.cabos3D = []
    },

    limparSensores() {
      // Remover sensores existentes da cena
      this.sensores3D.forEach(sensor => {
        if (sensor.geometry) sensor.geometry.dispose()
        if (sensor.material) sensor.material.dispose()
        if (this.armazemGroup) {
          this.armazemGroup.remove(sensor)
        }
      })
      this.sensores3D = []
    },

    limparPendulos() {
      // Remover pêndulos existentes da cena
      this.pendulos3D.forEach(pendulo => {
        if (pendulo.geometry) pendulo.geometry.dispose()
        if (pendulo.material) pendulo.material.dispose()
        if (this.armazemGroup) {
          this.armazemGroup.remove(pendulo)
        }
      })
      this.pendulos3D = []
    },

    limparLabels() {
      // Remover labels existentes da cena
      this.textSprites.forEach(sprite => {
        if (sprite.geometry) sprite.geometry.dispose()
        if (sprite.material) sprite.material.dispose()
        if (this.armazemGroup) {
          this.armazemGroup.remove(sprite)
        }
      })
      this.textSprites = []
    },

    atualizarInfoModeloAtual() {
      // Atualizar informações do modelo atual
      if (this.configuracao && this.configuracao.configModelos) {
        const modelos = this.configuracao.configModelos.modelosDefinidos
        if (modelos && modelos[this.arcoAtual]) {
          const modelo = modelos[this.arcoAtual]
          this.modeloAtualInfo = `Arco ${this.arcoAtual}: ${modelo.nome || 'Sem nome'}`
        } else {
          this.modeloAtualInfo = `Arco ${this.arcoAtual}: Indefinido`
        }
      }
    },

    emitirEstatisticas() {
      if (this.configuracao) {
        const stats = this.analisarConfiguracao(this.configuracao)
        this.$emit('estatisticas-atualizadas', stats)
      }
    },

    onWindowResize() {
      if (!this.camera || !this.renderer) return
      
      const container = this.$refs.canvasContainer
      if (!container) return
      
      this.camera.aspect = container.clientWidth / container.clientHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(container.clientWidth, container.clientHeight)
    },

    resetarErro() {
      this.erro = null
      if (this.configuracao) {
        this.aplicarConfiguracao3D(this.configuracao)
      }
    },

    fecharInfoObjeto() {
      this.objetoSelecionado = null
    },

    getCorSensor(sensor) {
      if (sensor.falha) return '#ff0000'
      if (!sensor.ativo) return '#cccccc'
      
      const temp = sensor.temperatura
      if (temp < 12) return '#0384fc'
      else if (temp < 15) return '#03e8fc'
      else if (temp < 17) return '#03fcbe'
      else if (temp < 21) return '#07fc03'
      else if (temp < 25) return '#c3ff00'
      else if (temp < 27) return '#fcf803'
      else if (temp < 30) return '#ffb300'
      else if (temp < 35) return '#ff2200'
      else if (temp < 50) return '#ff0090'
      else return '#f700ff'
    },

    calcularMediaTemperatura(sensores) {
      const sensoresAtivos = sensores.filter(s => s.ativo && !s.falha && s.temperatura !== -1000)
      if (sensoresAtivos.length === 0) return '--'
      
      const soma = sensoresAtivos.reduce((acc, sensor) => acc + sensor.temperatura, 0)
      return (soma / sensoresAtivos.length).toFixed(1)
    },

    cleanup() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
      }
      
      if (this.renderer) {
        const container = this.$refs.canvasContainer
        if (container && this.renderer.domElement) {
          container.removeChild(this.renderer.domElement)
        }
        this.renderer.dispose()
      }
      
      window.removeEventListener('resize', this.onWindowResize)
    }
  }
}
</script>

<style scoped>
.modelador-armazem-3d {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  border-radius: 10px;
}

.canvas-3d-container {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.canvas-3d-container:active {
  cursor: grabbing;
}

.loading-overlay, .error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content, .error-content {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.controles-flutuantes {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 100;
  max-width: 200px;
}

.controle-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.info-objeto-card {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 100;
  max-width: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.info-objeto-card .card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sensor-info {
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.sensor-info:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Responsividade */
@media (max-width: 768px) {
  .controles-flutuantes {
    max-width: 150px;
  }
  
  .info-objeto-card {
    max-width: 250px;
    max-height: 300px;
  }
  
  .modelador-armazem-3d {
    height: 400px;
  }
}

/* Scrollbar customizada */
.info-objeto-card::-webkit-scrollbar {
  width: 6px;
}

.info-objeto-card::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.info-objeto-card::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.info-objeto-card::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>