
<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- Painel de Controles -->
      <div class="col-lg-3 col-md-4 bg-light border-end p-3" style="height: 100vh; overflow-y: auto;">
        <h5 class="mb-3 text-primary">Configurações do Modelo</h5>
        
        <!-- Dimensões Básicas -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Dimensões Básicas</h6>
          </template>
          
          <b-form-group label="Profundidade da Base (pb)" label-for="pb">
            <b-form-input 
              id="pb" 
              v-model.number="config.pb" 
              type="number" 
              min="1" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Largura da Base (lb)" label-for="lb">
            <b-form-input 
              id="lb" 
              v-model.number="config.lb" 
              type="number" 
              min="1" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Altura da Base (hb)" label-for="hb">
            <b-form-input 
              id="hb" 
              v-model.number="config.hb" 
              type="number" 
              min="1" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Altura do Fundo (hf)" label-for="hf">
            <b-form-input 
              id="hf" 
              v-model.number="config.hf" 
              type="number" 
              min="1" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
        </b-card>

        <!-- Telhado -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Configurações do Telhado</h6>
          </template>
          
          <b-form-group label="Altura do Teto (ht)" label-for="ht">
            <b-form-input 
              id="ht" 
              v-model.number="config.ht" 
              type="number" 
              min="1" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Tipo de Telhado" label-for="tipo_telhado">
            <v-select 
              v-model="config.tipo_telhado"
              :options="tipoTelhadoOptions"
              label="label"
              :reduce="option => option.value"
              @input="updateSVG"
            ></v-select>
          </b-form-group>
          
          <b-form-group 
            v-if="config.tipo_telhado === 1" 
            label="Curvatura do Topo" 
            label-for="curvatura_topo"
          >
            <b-form-input 
              id="curvatura_topo" 
              v-model.number="config.curvatura_topo" 
              type="number" 
              min="1" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
        </b-card>

        <!-- Aeradores -->
        <b-card class="mb-3">
          <template #header>
            <h6 class="mb-0">Aeradores</h6>
          </template>
          
          <b-form-group label="Número de Aeradores" label-for="na">
            <b-form-input 
              id="na" 
              v-model.number="na" 
              type="number" 
              min="0" 
              max="10" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Distância entre Aeradores" label-for="da">
            <b-form-input 
              id="da" 
              v-model.number="da" 
              type="number" 
              min="1" 
              @input="updateSVG"
            ></b-form-input>
          </b-form-group>
          
          <b-form-group label="Estado dos Aeradores" label-for="estadoAeradores">
            <v-select 
              v-model="estadoAeradores"
              :options="estadoAeradoresOptions"
              label="label"
              :reduce="option => option.value"
              @input="updateSVG"
            ></v-select>
          </b-form-group>
        </b-card>

        <!-- Ações -->
        <div class="d-grid gap-2">
          <b-button variant="success" @click="salvarModelo">
            <b-icon icon="save"></b-icon> Salvar Modelo
          </b-button>
          <b-button variant="secondary" @click="resetarConfiguracao">
            <b-icon icon="arrow-clockwise"></b-icon> Resetar
          </b-button>
        </div>
      </div>

      <!-- Preview do SVG -->
      <div class="col-lg-9 col-md-8 d-flex align-items-center justify-content-center p-3">
        <b-card 
          class="w-100"
          :style="{ 
            maxWidth: '100%',
            minHeight: '400px',
            maxHeight: 'calc(100vh - 60px)',
            height: 'calc(100vh - 60px)'
          }"
        >
          <template #header>
            <h5 class="mb-0 text-white bg-primary p-2">Preview do Modelo SVG</h5>
          </template>
          
          <div 
            class="text-center d-flex align-items-center justify-content-center p-2"
            :style="{ 
              height: 'calc(100vh - 250px)', 
              overflow: 'auto',
              minHeight: '300px',
              maxHeight: 'calc(100vh - 250px)'
            }"
          >
            <svg
              ref="svgContainer"
              :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`"
              :style="{
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 320px)',
                minHeight: '250px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa'
              }"
              v-html="svgContent"
            >
            </svg>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModeladorSVG',
  data() {
    return {
      config: {
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        curvatura_topo: 30,
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0
      },
      na: 6,
      da: 35,
      estadoAeradores: 'parado',
      larguraSVG: 500,
      alturaSVG: 400,
      svgContent: '',
      tipoTelhadoOptions: [
        { label: 'Plano', value: 0 },
        { label: 'Curvo', value: 1 },
        { label: 'Triangular', value: 2 }
      ],
      estadoAeradoresOptions: [
        { label: 'Parado', value: 'parado' },
        { label: 'Girando', value: 'girando' }
      ]
    }
  },
  mounted() {
    this.updateSVG()
  },
  methods: {
    updateSVG() {
      this.generateSVG()
    },
    generateSVG() {
      const { pb, lb, hb, hf, ht, tipo_telhado, curvatura_topo } = this.config
      
      this.larguraSVG = lb + 100
      this.alturaSVG = hb + hf + ht + 100
      
      let svg = ''
      
      // Base do silo
      svg += `<rect x="50" y="${this.alturaSVG - hb - hf - 50}" width="${lb}" height="${hb}" fill="#d0d0d0" stroke="#000" stroke-width="2"/>`
      
      // Fundo
      svg += `<rect x="50" y="${this.alturaSVG - hf - 50}" width="${lb}" height="${hf}" fill="#a0a0a0" stroke="#000" stroke-width="2"/>`
      
      // Telhado
      const telhadoY = this.alturaSVG - hb - hf - ht - 50
      if (tipo_telhado === 0) {
        // Telhado plano
        svg += `<rect x="50" y="${telhadoY}" width="${lb}" height="${ht}" fill="#b0b0b0" stroke="#000" stroke-width="2"/>`
      } else if (tipo_telhado === 1) {
        // Telhado curvo
        const cp1x = 50 + lb * 0.3
        const cp1y = telhadoY + ht - curvatura_topo
        const cp2x = 50 + lb * 0.7
        const cp2y = telhadoY + ht - curvatura_topo
        
        svg += `<path d="M 50 ${telhadoY + ht} Q ${cp1x} ${cp1y} ${50 + lb/2} ${telhadoY} Q ${cp2x} ${cp2y} ${50 + lb} ${telhadoY + ht} L ${50 + lb} ${telhadoY + ht} L 50 ${telhadoY + ht} Z" fill="#b0b0b0" stroke="#000" stroke-width="2"/>`
      } else if (tipo_telhado === 2) {
        // Telhado triangular
        svg += `<polygon points="50,${telhadoY + ht} ${50 + lb/2},${telhadoY} ${50 + lb},${telhadoY + ht}" fill="#b0b0b0" stroke="#000" stroke-width="2"/>`
      }
      
      // Aeradores
      svg += this.generateAeradores()
      
      this.svgContent = svg
    },
    generateAeradores() {
      if (this.na === 0) return ''
      
      const { lb, hb, hf } = this.config
      const ds = this.da
      const posY = this.alturaSVG - hb - hf + 10
      const posX = lb + ds * 2 - 31
      
      let aeradores = ''
      const angles = [0, 60, 120, 180, 240, 300]
      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      
      for (let id = 1; id <= this.na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - ds})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - ds})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - ds * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - ds * 2})`
        
        const corFundo = this.estadoAeradores === 'girando' ? '#2ecc71' : '#e74c3c'
        const visParado = this.estadoAeradores === 'parado' ? 'visible' : 'hidden'
        const visGirando = this.estadoAeradores === 'girando' ? 'visible' : 'hidden'
        
        aeradores += `
          <g transform="${transform}">
            <circle cx="${70 + 12.5 + 3.5}" cy="24" r="10" fill="${corFundo}"/>
            <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD"/>
            <text x="${70 + 12.5 + 3.5}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
            <g style="visibility: ${visParado}">
              ${angles.map(angle => 
                `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`}/>`
              ).join('')}
            </g>
            <g style="visibility: ${visGirando}">
              <animateTransform attributeName="transform" type="rotate" dur="2s" values="0 86.35 24.05; 360 86.35 24.05;" repeatCount="indefinite"/>
              ${angles.map(angle => 
                `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`}/>`
              ).join('')}
            </g>
          </g>
        `
      }
      
      return aeradores
    },
    salvarModelo() {
      const modelo = {
        config: this.config,
        aeradores: {
          quantidade: this.na,
          distancia: this.da,
          estado: this.estadoAeradores
        },
        timestamp: new Date().getTime()
      }
      
      // Salvar no localStorage ou enviar para API
      localStorage.setItem(`modelo_${modelo.timestamp}`, JSON.stringify(modelo))
      
      this.$bvToast.toast('Modelo salvo com sucesso!', {
        title: 'Sucesso',
        variant: 'success',
        autoHideDelay: 3000
      })
    },
    resetarConfiguracao() {
      this.config = {
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        curvatura_topo: 30,
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0
      }
      this.na = 6
      this.da = 35
      this.estadoAeradores = 'parado'
      this.updateSVG()
    }
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.border-end {
  border-right: 1px solid #dee2e6 !important;
}

.card-header {
  background-color: #007bff;
  color: white;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
