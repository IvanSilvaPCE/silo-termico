
<template>
  <div class="position-relative">
    <!-- Botão de Imagem de Fundo -->
    <button 
      type="button" 
      class="btn btn-sm btn-outline-light border-0 botao-sem-fundo" 
      :class="{ 'btn-warning': imagemFundo.url }"
      @click="toggleControles"
      title="Imagem de fundo"
      style="padding: 0.25rem 0.5rem;">
      <i class="fa fa-image" style="font-size: 0.875rem;"></i>
    </button>
    
    <!-- Controles da Imagem -->
    <div v-if="mostrarControles" class="position-absolute bg-white border rounded shadow-lg"
         style="top: 100%; right: 0; z-index: 1050; min-width: 250px; max-width: 300px; margin-top: 2px; max-height: 400px; overflow-y: auto; scroll-behavior: smooth;">
      
      <div class="p-3" style="padding: 12px;">
        <!-- Upload de Imagem -->
        <div class="mb-3 text-center">
          <label class="form-label small text-muted mb-2 d-block">📸 Selecionar Imagem</label>
          <input 
            type="file" 
            ref="inputImagem"
            @change="carregarImagem"
            accept="image/*"
            class="form-control form-control-sm text-center"
            style="font-size: 0.75rem;">
        </div>
        
        <div v-if="imagemFundo.url">
          <!-- Controles de Posição -->
          <div class="mb-3">
            <label class="form-label small text-muted mb-2 d-flex align-items-center justify-content-center">
              <i class="fa fa-arrows-alt me-1"></i>
              Posição
            </label>
            
            <!-- Controles de movimento com botões direcionais -->
            <div class="d-flex justify-content-center mb-2">
              <div class="text-center">
                <button 
                  type="button" 
                  class="btn btn-outline-primary btn-sm d-block mx-auto mb-1"
                  @click="moverImagem('up')"
                  style="width: 32px; height: 32px; font-size: 0.8rem;">
                  ↑
                </button>
                <div class="d-flex justify-content-center gap-1">
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm"
                    @click="moverImagem('left')"
                    style="width: 32px; height: 32px; font-size: 0.8rem;">
                    ←
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="centralizarImagem"
                    title="Centralizar"
                    style="width: 32px; height: 32px; font-size: 0.7rem;">
                    ⊙
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm"
                    @click="moverImagem('right')"
                    style="width: 32px; height: 32px; font-size: 0.8rem;">
                    →
                  </button>
                </div>
                <button 
                  type="button" 
                  class="btn btn-outline-primary btn-sm d-block mx-auto mt-1"
                  @click="moverImagem('down')"
                  style="width: 32px; height: 32px; font-size: 0.8rem;">
                  ↓
                </button>
              </div>
            </div>
            
            <!-- Inputs numéricos para posição exata -->
            <div class="row g-1">
              <div class="col-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text text-center" style="font-size: 0.7rem; min-width: 28px;">X</span>
                  <input 
                    type="number" 
                    v-model.number="imagemFundo.x"
                    @input="emitirMudanca"
                    class="form-control form-control-sm text-center"
                    style="font-size: 0.75rem;">
                </div>
              </div>
              <div class="col-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text text-center" style="font-size: 0.7rem; min-width: 28px;">Y</span>
                  <input 
                    type="number" 
                    v-model.number="imagemFundo.y"
                    @input="emitirMudanca"
                    class="form-control form-control-sm text-center"
                    style="font-size: 0.75rem;">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Controle de Zoom -->
          <div class="mb-3">
            <label class="form-label small text-muted mb-2 d-flex align-items-center justify-content-center">
              <i class="fa fa-search-plus me-1"></i>
              Zoom: {{ imagemFundo.scale }}x
            </label>
            <input 
              type="range" 
              v-model.number="imagemFundo.scale"
              @input="emitirMudanca"
              min="0.1" 
              max="3" 
              step="0.1"
              class="form-range form-range-sm w-100">
            <div class="d-flex justify-content-center gap-1 mt-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm"
                @click="ajustarZoom(0.5)"
                style="font-size: 0.7rem;">
                50%
              </button>
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm"
                @click="ajustarZoom(1.0)"
                style="font-size: 0.7rem;">
                100%
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm"
                @click="ajustarZoom(1.5)"
                style="font-size: 0.7rem;">
                150%
              </button>
            </div>
          </div>
          
          <!-- Controle de Transparência da Imagem -->
          <div class="mb-3">
            <label class="form-label small text-muted mb-2 d-flex align-items-center justify-content-center">
              <i class="fa fa-image me-1"></i>
              Transparência da Imagem: {{ Math.round(imagemFundo.opacity * 100) }}%
            </label>
            <input 
              type="range" 
              v-model.number="imagemFundo.opacity"
              @input="emitirMudanca"
              min="0.1" 
              max="1" 
              step="0.05"
              class="form-range form-range-sm w-100">
            <div class="d-flex justify-content-center gap-1 mt-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm"
                @click="ajustarTransparenciaImagem(0.2)"
                style="font-size: 0.7rem;">
                20%
              </button>
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm"
                @click="ajustarTransparenciaImagem(0.5)"
                style="font-size: 0.7rem;">
                50%
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm"
                @click="ajustarTransparenciaImagem(0.8)"
                style="font-size: 0.7rem;">
                80%
              </button>
            </div>
          </div>

          <!-- Controles de Opacidade do SVG -->
          <div class="mb-3">
            <label class="form-label small text-muted mb-2 d-flex align-items-center justify-content-center">
              <i class="fa fa-adjust me-1"></i>
              Opacidade do Componente SVG
            </label>
            
            <!-- Dropdown para seleção do tipo de controle -->
            <select 
              class="form-select form-select-sm mb-2" 
              v-model="tipoOpacidadeAtivo"
              style="font-size: 0.75rem;">
              <option value="geral"><i class="fa fa-crosshairs me-1"></i>SVG Completo</option>
              <option value="pendulos"><i class="fa fa-bar-chart me-1"></i>Apenas Pêndulos/Sensores</option>
              <option value="estrutura"><i class="fa fa-cubes me-1"></i>Apenas Estrutura</option>
            </select>

            <!-- Controle de Opacidade Geral do SVG -->
            <div v-if="tipoOpacidadeAtivo === 'geral'">
              <label class="small text-muted mb-1">
                <i class="fa fa-eye me-1"></i>
                SVG Completo: {{ Math.round(opacidadesSvg.geral * 100) }}%
              </label>
              <input 
                type="range" 
                v-model.number="opacidadesSvg.geral"
                @input="emitirMudancaOpacidade"
                min="0.1" 
                max="1" 
                step="0.05"
                class="form-range form-range-sm w-100">
            </div>

            <!-- Controle de Opacidade dos Pêndulos -->
            <div v-if="tipoOpacidadeAtivo === 'pendulos'">
              <label class="small text-muted mb-1">
                <i class="fa fa-thermometer-half me-1"></i>
                Pêndulos e Sensores: {{ Math.round(opacidadesSvg.pendulos * 100) }}%
              </label>
              <input 
                type="range" 
                v-model.number="opacidadesSvg.pendulos"
                @input="emitirMudancaOpacidade"
                min="0.1" 
                max="1" 
                step="0.05"
                class="form-range form-range-sm w-100">
            </div>

            <!-- Controle de Opacidade da Estrutura -->
            <div v-if="tipoOpacidadeAtivo === 'estrutura'">
              <label class="small text-muted mb-1">
                <i class="fa fa-building me-1"></i>
                Estrutura do Armazém: {{ Math.round(opacidadesSvg.estrutura * 100) }}%
              </label>
              <input 
                type="range" 
                v-model.number="opacidadesSvg.estrutura"
                @input="emitirMudancaOpacidade"
                min="0.1" 
                max="1" 
                step="0.05"
                class="form-range form-range-sm w-100">
            </div>

            <!-- Botões de preset -->
            <div class="d-flex justify-content-center gap-1 mt-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm"
                @click="ajustarOpacidadeSvg(0.3)"
                style="font-size: 0.7rem;">
                30%
              </button>
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm"
                @click="ajustarOpacidadeSvg(0.7)"
                style="font-size: 0.7rem;">
                70%
              </button>
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm"
                @click="ajustarOpacidadeSvg(1.0)"
                style="font-size: 0.7rem;">
                100%
              </button>
            </div>
          </div>
          
          <!-- Botões de Ação -->
          <div class="d-flex flex-column gap-1">
            <div class="d-flex gap-1 justify-content-center">
              <button 
                type="button" 
                class="btn btn-outline-secondary btn-sm flex-fill"
                @click="resetarPosicao"
                style="font-size: 0.7rem;">
                <i class="fa fa-refresh me-1"></i>
                Reset Imagem
              </button>
              <button 
                type="button" 
                class="btn btn-outline-danger btn-sm flex-fill"
                @click="removerImagem"
                style="font-size: 0.7rem;">
                <i class="fa fa-trash me-1"></i>
                Remover
              </button>
            </div>
            <button 
              type="button" 
              class="btn btn-outline-info btn-sm w-100"
              @click="resetarOpacidadesSvg"
              style="font-size: 0.7rem;">
              <i class="fa fa-eye me-1"></i>
              Reset Opacidades SVG
            </button>
          </div>
        </div>
        
        <div v-else class="text-center text-muted small py-4">
          <i class="fa fa-image fa-2x mb-2 d-block text-center"></i>
          Selecione uma imagem para usar como fundo de rascunho
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'ImagemFundo',
  props: {
    // Props para posicionamento da imagem
    containerDimensions: {
      type: Object,
      default: () => ({ width: '100%', height: '100%' })
    },
    // Props para configurações iniciais
    imagemInicial: {
      type: Object,
      default: () => ({
        url: null,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.3
      })
    },
    // Novo prop para tipo (Silo ou Armazém)
    tipoAtivo: {
      type: String,
      default: 'silo'
    }
  },
  data() {
    return {
      imagemFundo: {
        url: null,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.3
      },
      mostrarControles: false,
      // Controles de opacidade do SVG
      tipoOpacidadeAtivo: 'geral',
      opacidadesSvg: {
        geral: 1.0,
        pendulos: 1.0,
        estrutura: 1.0
      },
      // Armazenar imagens separadas por tipo
      imagensPorTipo: {
        silo: {
          url: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.3
        },
        armazem: {
          url: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.3
        }
      },
      // Armazenar opacidades separadas por tipo
      opacidadesPorTipo: {
        silo: {
          geral: 1.0,
          pendulos: 1.0,
          estrutura: 1.0
        },
        armazem: {
          geral: 1.0,
          pendulos: 1.0,
          estrutura: 1.0
        }
      }
    }
  },
  computed: {
    imagemContainerStyle() {
      return {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
    imagemStyle() {
      return {
        position: 'relative',
        left: this.imagemFundo.x + 'px',
        top: this.imagemFundo.y + 'px',
        transform: `scale(${this.imagemFundo.scale})`,
        transformOrigin: 'center center',
        opacity: this.imagemFundo.opacity,
        maxWidth: 'none',
        maxHeight: 'none',
        userSelect: 'none',
        pointerEvents: 'none',
        transition: 'all 0.3s ease-in-out'
      }
    }
  },
  watch: {
    imagemInicial: {
      handler(novaImagem) {
        if (novaImagem) {
          this.imagemFundo = { ...novaImagem }
        }
      },
      immediate: true,
      deep: true
    },
    tipoAtivo: {
      handler(novoTipo, tipoAnterior) {
        // Salvar imagem e opacidades atuais antes de trocar
        if (this.imagemFundo.url) {
          this.salvarImagemAtualPorTipo()
        }
        if (tipoAnterior) {
          this.opacidadesPorTipo[tipoAnterior] = { ...this.opacidadesSvg }
        }
        
        // Carregar imagem e opacidades do novo tipo
        this.carregarImagemPorTipo(novoTipo)
        this.carregarOpacidadesPorTipo(novoTipo)
      },
      immediate: true
    }
  },
  mounted() {
    // Adicionar eventos para controle por teclado e clique fora
    document.addEventListener('click', this.fecharControlesSeForaDoElemento)
    document.addEventListener('keydown', this.handleKeyboardMovement)
  },
  beforeDestroy() {
    // Remover eventos ao destruir o componente
    document.removeEventListener('click', this.fecharControlesSeForaDoElemento)
    document.removeEventListener('keydown', this.handleKeyboardMovement)
  },
  methods: {
    toggleControles() {
      this.mostrarControles = !this.mostrarControles
    },

    carregarImagem(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagemFundo.url = e.target.result
          // Salvar imagem específica para o tipo atual
          this.imagensPorTipo[this.tipoAtivo] = { ...this.imagemFundo }
          this.imagensPorTipo[this.tipoAtivo].url = e.target.result
          
          // Aguardar a imagem carregar para centralizar automaticamente
          this.$nextTick(() => {
            setTimeout(() => {
              this.centralizarImagemAutomaticamente()
            }, 100)
          })
          this.mostrarToast(`Imagem de fundo carregada para ${this.tipoAtivo.toUpperCase()}!`, 'success')
          this.emitirMudanca()
        }
        reader.readAsDataURL(file)
      } else {
        this.mostrarToast('Por favor, selecione um arquivo de imagem válido', 'warning')
      }
    },

    salvarImagemAtualPorTipo() {
      if (this.imagemFundo.url) {
        const tipoAnterior = this.tipoAtivo === 'silo' ? 'armazem' : 'silo'
        this.imagensPorTipo[tipoAnterior] = { ...this.imagemFundo }
      }
    },

    carregarImagemPorTipo(tipo) {
      const imagemTipo = this.imagensPorTipo[tipo]
      if (imagemTipo && imagemTipo.url) {
        this.imagemFundo = { ...imagemTipo }
      } else {
        // Resetar se não há imagem para este tipo
        this.imagemFundo = {
          url: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.3
        }
      }
      this.emitirMudanca()
    },

    carregarOpacidadesPorTipo(tipo) {
      const opacidadesTipo = this.opacidadesPorTipo[tipo]
      if (opacidadesTipo) {
        this.opacidadesSvg = { ...opacidadesTipo }
      } else {
        // Resetar para valores padrão
        this.opacidadesSvg = {
          geral: 1.0,
          pendulos: 1.0,
          estrutura: 1.0
        }
      }
      this.emitirMudancaOpacidade()
    },

    ajustarTamanhoImagemCentralizada() {
      // Centralizar automaticamente quando a imagem carrega
      this.centralizarImagemAutomaticamente()
      console.log('Imagem de fundo carregada e centralizada automaticamente')
    },

    centralizarImagemAutomaticamente() {
      // Resetar para posição padrão e centralizar
      this.imagemFundo.x = 0
      this.imagemFundo.y = 0
      this.imagemFundo.scale = 1
      this.imagemFundo.opacity = 0.3
      
      this.emitirMudanca()
    },

    moverImagem(direcao) {
      const passo = 10 // Pixels por movimento
      
      switch (direcao) {
        case 'up':
          this.imagemFundo.y -= passo
          break
        case 'down':
          this.imagemFundo.y += passo
          break
        case 'left':
          this.imagemFundo.x -= passo
          break
        case 'right':
          this.imagemFundo.x += passo
          break
      }
      this.emitirMudanca()
    },

    centralizarImagem() {
      // Resetar posição para centralizar no container
      this.imagemFundo.x = 0
      this.imagemFundo.y = 0
      
      this.mostrarToast('Imagem centralizada', 'success')
      this.emitirMudanca()
    },

    ajustarZoom(valor) {
      this.imagemFundo.scale = valor
      this.emitirMudanca()
    },

    ajustarTransparenciaImagem(valor) {
      this.imagemFundo.opacity = valor
      this.emitirMudanca()
    },

    ajustarOpacidadeSvg(valor) {
      this.opacidadesSvg[this.tipoOpacidadeAtivo] = valor
      this.emitirMudancaOpacidade()
    },

    emitirMudancaOpacidade() {
      // Salvar opacidades específicas para o tipo atual
      this.opacidadesPorTipo[this.tipoAtivo] = { ...this.opacidadesSvg }
      
      // Emitir evento para o componente pai com as opacidades do SVG
      this.$emit('opacidade-svg-mudou', { ...this.opacidadesSvg })
    },

    resetarPosicao() {
      this.imagemFundo.x = 0
      this.imagemFundo.y = 0
      this.imagemFundo.scale = 1
      this.imagemFundo.opacity = 0.3
      
      this.mostrarToast('Posição e transparência da imagem resetadas', 'info')
      this.emitirMudanca()
    },

    resetarOpacidadesSvg() {
      // Método separado para resetar apenas as opacidades do SVG
      this.opacidadesSvg = {
        geral: 1.0,
        pendulos: 1.0,
        estrutura: 1.0
      }
      this.opacidadesPorTipo[this.tipoAtivo] = { ...this.opacidadesSvg }
      
      this.mostrarToast('Opacidades do SVG resetadas', 'info')
      this.emitirMudancaOpacidade()
    },

    removerImagem() {
      this.imagemFundo.url = null
      this.imagemFundo.x = 0
      this.imagemFundo.y = 0
      this.imagemFundo.scale = 1
      this.imagemFundo.opacity = 0.3
      
      // Remover também da storage por tipo
      this.imagensPorTipo[this.tipoAtivo] = {
        url: null,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.3
      }
      
      this.mostrarControles = false
      this.mostrarToast(`Imagem de fundo removida do ${this.tipoAtivo.toUpperCase()}`, 'info')
      
      // Limpar o input file
      if (this.$refs.inputImagem) {
        this.$refs.inputImagem.value = ''
      }
      this.emitirMudanca()
      // Não resetar opacidades do SVG ao remover imagem
    },

    fecharControlesSeForaDoElemento(event) {
      // Verificar se o clique foi fora dos controles da imagem
      if (this.mostrarControles) {
        const controlesContainer = event.target.closest('.position-relative')
        const botaoImagem = event.target.closest('button')
        
        // Se clicou fora dos controles e não foi no botão da imagem
        if (!controlesContainer && !botaoImagem) {
          this.mostrarControles = false
        }
      }
    },

    handleKeyboardMovement(event) {
      // Só processar se há imagem de fundo e os controles estão visíveis
      if (!this.imagemFundo.url || !this.mostrarControles) return
      
      // Verificar se não está digitando em um input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return
      
      const passo = 10 // Pixels por movimento
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          this.imagemFundo.y -= passo
          this.emitirMudanca()
          break
        case 'ArrowDown':
          event.preventDefault()
          this.imagemFundo.y += passo
          this.emitirMudanca()
          break
        case 'ArrowLeft':
          event.preventDefault()
          this.imagemFundo.x -= passo
          this.emitirMudanca()
          break
        case 'ArrowRight':
          event.preventDefault()
          this.imagemFundo.x += passo
          this.emitirMudanca()
          break
        default:
          return // Não processar outras teclas
      }
    },

    emitirMudanca() {
      // Emitir evento para o componente pai quando houver mudanças
      this.$emit('imagem-mudou', { ...this.imagemFundo })
    },

    mostrarToast(mensagem, tipo = 'info') {
      // Emitir evento para o componente pai mostrar o toast
      this.$emit('mostrar-toast', { mensagem, tipo })
    }
  }
}
</script>

<style scoped>
.imagem-fundo-container {
  pointer-events: none;
}

.form-range {
  width: 100%;
}

.form-range-sm {
  height: 1rem;
}

/* Melhorar aparência dos controles */
.btn-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  /* Remover todas as transições/animações do botão */
  transition: none !important;
  animation: none !important;
}

/* Botão de imagem de fundo - sem animações */
.btn-outline-light,
.btn-warning {
  transition: none !important;
  animation: none !important;
  transform: none !important;
}

.btn-outline-light:hover,
.btn-warning:hover,
.btn-outline-light:focus,
.btn-warning:focus,
.btn-outline-light:active,
.btn-warning:active {
  transition: none !important;
  animation: none !important;
  transform: none !important;
}

.input-group-sm .form-control,
.input-group-sm .input-group-text {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

/* Remover COMPLETAMENTE todos os efeitos de background do botão */
.botao-sem-fundo,
.botao-sem-fundo *,
.botao-sem-fundo::before,
.botao-sem-fundo::after {
  background: none !important;
  background-image: none !important;
  background-color: transparent !important;
  background-attachment: unset !important;
  background-origin: unset !important;
  background-clip: unset !important;
  background-size: unset !important;
  background-repeat: unset !important;
  background-position: unset !important;
  box-shadow: none !important;
  filter: none !important;
  backdrop-filter: none !important;
  background-blend-mode: normal !important;
  mix-blend-mode: normal !important;
}

.botao-sem-fundo:hover,
.botao-sem-fundo:focus,
.botao-sem-fundo:active,
.botao-sem-fundo:hover *,
.botao-sem-fundo:focus *,
.botao-sem-fundo:active *,
.botao-sem-fundo:hover::before,
.botao-sem-fundo:hover::after,
.botao-sem-fundo:focus::before,
.botao-sem-fundo:focus::after,
.botao-sem-fundo:active::before,
.botao-sem-fundo:active::after {
  background: none !important;
  background-image: none !important;
  background-color: transparent !important;
  background-attachment: unset !important;
  background-origin: unset !important;
  background-clip: unset !important;
  background-size: unset !important;
  background-repeat: unset !important;
  background-position: unset !important;
  box-shadow: none !important;
  filter: none !important;
  backdrop-filter: none !important;
  background-blend-mode: normal !important;
  mix-blend-mode: normal !important;
}

/* Força a cor amarela APENAS quando tem a classe btn-warning */
.botao-sem-fundo.btn-warning,
.botao-sem-fundo.btn-warning:hover,
.botao-sem-fundo.btn-warning:focus,
.botao-sem-fundo.btn-warning:active {
  background: #ffc107 !important;
  background-image: none !important;
  background-color: #ffc107 !important;
  border-color: #ffc107 !important;
  color: #212529 !important;
  background-attachment: unset !important;
  background-origin: unset !important;
  background-clip: unset !important;
  background-size: unset !important;
  background-repeat: unset !important;
  background-position: unset !important;
}

/* Reset completo para o ícone dentro do botão */
.botao-sem-fundo i,
.botao-sem-fundo:hover i,
.botao-sem-fundo:focus i,
.botao-sem-fundo:active i {
  background: none !important;
  background-image: none !important;
  background-color: transparent !important;
}

/* Estilo para mobile */
@media (max-width: 576px) {
  .position-absolute {
    position: fixed !important;
    top: 10px !important;
    right: 10px !important;
    left: auto !important;
    max-width: calc(100vw - 20px);
  }
}
</style>
