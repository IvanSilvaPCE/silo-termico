
<template>
  <div class="container-fluid p-0" :style="{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }">
        <div class="card" :style="{
      maxWidth: '90vw',
      maxHeight: '90vh',
      minHeight: '500px',
      width: '100%'
    }">
      <div class="card-header bg-primary text-white text-center">
        <h4 class="mb-0">Preview - Silo</h4>
        <small class="text-white-50">
          Aeradores: {{ config.aeradores_ativo ? 'Ativo' : 'Inativo' }}
        </small>
      </div>

      <div class="card-body text-center d-flex align-items-center justify-content-center p-3" :style="{
        height: 'calc(90vh - 120px)',
        minHeight: '400px'
      }">
        <div class="svg-container-responsive w-100 h-100">
          <svg :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`" :style="{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            border: '1px solid #ddd',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            shapeRendering: 'geometricPrecision',
            textRendering: 'geometricPrecision',
            imageRendering: 'optimizeQuality'
          }" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" v-html="svgContent">
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SiloComponente',
  data() {
    return {
      config: {
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 5,
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35
      },
      larguraSVG: 400,
      alturaSVG: 300,
      svgContent: ''
    }
  },
  computed: {
    isMobile() {
      return typeof window !== 'undefined' && window.innerWidth <= 576
    }
  },
  mounted() {
    this.updateSVG()
  },
  methods: {
    updateSVG() {
      this.calcularDimensoesSVG()
      this.generateSVG()
    },

    calcularDimensoesSVG() {
      this.larguraSVG = this.config.lb + (this.config.aeradores_ativo ? this.config.ds * 2 + 68 : 0)
      this.alturaSVG = this.config.hs + this.config.hb * 1.75
    },

    generateSVG() {
      this.svgContent = this.renderSilo()
    },

    renderSilo() {
      const { lb, hs, hb, eb } = this.config
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`

      const transformSilo = this.config.aeradores_ativo ? `translate(${this.config.ds + 34}, 0)` : ""

      let svg = `
        <g transform="${transformSilo}">
          <polygon fill="#E7E7E7" points="${points}" />
          <path
            fill="#999999"
            d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
            transform="scale(${lb / 152}, ${hb / 15})"
          />
          <ellipse fill="#999999" cx="${lb / 2}" cy="${hs}" rx="${lb / 2}" ry="${hb}" />
          <ellipse fill="#CCCCCC" cx="${lb / 2}" cy="${hs - eb}" rx="${lb / 2}" ry="${hb}" />
        </g>
      `

      if (this.config.aeradores_ativo) {
        svg += this.renderAeradoresSilo()
      }

      return svg
    },

    renderAeradoresSilo() {
      const { na, ds, dy, da, lb, hs } = this.config
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      let aeradores = ''

      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      const angles = [0, 60, 120, 180, 240, 300]

      for (let id = 1; id <= na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`

        aeradores += `
          <g transform="${transform}">
            <circle cx="${70 + 12.5 + 3.5}" cy="24" r="10" fill="#c5c5c5" />
            <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
            <text x="${70 + 12.5 + 3.5}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
            <g>
              ${angles.map(angle =>
          `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`} />`
        ).join('')}
            </g>
          </g>
        `
      }

      return aeradores
    },

    resetarPadrao() {
      this.config = {
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 5,
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35
      }
      this.updateSVG()
      this.mostrarToast('Configuração resetada para valores padrão!', 'success')
    },

    salvarConfiguracao() {
      if (typeof localStorage !== 'undefined') {
        const configCompleta = {
          ...this.config,
          dimensoesSVG: {
            largura: this.larguraSVG,
            altura: this.alturaSVG
          },
          timestamp: new Date().toISOString(),
          versao: '1.0',
          tipo: 'configuracao_silo_componente'
        }

        localStorage.setItem('configSiloComponente', JSON.stringify(configCompleta))
        this.mostrarToast('Configuração salva com sucesso!', 'success')
      }
    },

    mostrarToast(mensagem, tipo = 'info') {
      const toast = document.createElement('div')
      const icones = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      const cores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
      }

      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || cores.info};
        color: ${tipo === 'warning' ? '#000' : '#fff'};
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99999;
        font-size: 14px;
        max-width: 350px;
        word-wrap: break-word;
      `

      toast.innerHTML = `${icones[tipo] || icones.info} ${mensagem}`
      document.body.appendChild(toast)

      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove()
        }
      }, 4000)
    }
  }
}
</script>

<style scoped>
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
