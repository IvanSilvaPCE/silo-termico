<template>
   <div>
      <b-row v-show="this.tipoLeitura && this.dataLeitura && this.dadoPendulos" class="text-center" style="margin-top: 5%">
         <b-col>
            <!-- Desenho SVG -->
            <svg :key="svgKey" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" version="1.0" :style="{ visibility: buscandoDados ? 'hidden' : 'visible', width: '90%', height: '50vh', 'shape-rendering': 'geometricPrecision', 'text-rendering': 'geometricPrecision', 'image-rendering': 'optimizeQuality', 'fill-rule': 'evenodd', 'clip-rule': 'evenodd' }" viewBox="0 0 138 134" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xodm="http://www.corel.com/coreldraw/odm/2003">
               <defs>
                  <radialGradient id="id0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.00886 -0 -0 1.00886 -1 -1)" cx="66.0188" cy="66.5965" r="65.1723" fx="66.0188" fy="66.5965">
                     <stop offset="0" style="stop-opacity: 1; stop-color: whitesmoke" />
                     <stop offset="1" style="stop-opacity: 1; stop-color: #999999" />
                  </radialGradient>
               </defs>
               <g id="Camada_x0020_1">
                  <!--fundo da imagem, topo do silo-->
                  <g id="desenho_fundo">
                     <path class="fil1 str0" d="M66.5965 0.8465c34.2065,0 62.3078,26.1228 65.453,59.5066l1.6233 0c1.6221,0 2.9493,1.3271 2.9493,2.9493l0 6.2908c0,1.6221 -1.3271,2.9493 -2.9493,2.9493l-1.597 0c-3.0059,33.5258 -31.1715,59.804 -65.4794,59.804 -36.3127,0 -65.75,-29.4373 -65.75,-65.75 0,-36.3127 29.4373,-65.75 65.75,-65.75z" />
                     <line class="fil2 str1" x1="68.7343" y1="130.9573" x2="68.7343" y2="2.2356" />
                     <line class="fil2 str1" x1="114.2443" y1="112.1064" x2="23.2243" y2="21.0865" />
                     <line class="fil2 str1" x1="68.7343" y1="66.5965" x2="4.3734" y2="66.5965" />
                     <line class="fil2 str1" x1="114.2443" y1="21.0865" x2="23.2243" y2="112.1064" />
                     <circle class="fil3 str1" cx="68.7343" cy="66.5965" r="13.9246" />
                     <circle class="fil2 str1" cx="68.7343" cy="66.5965" r="37.4435" />
                     <line class="fil2 str2" x1="136.6521" y1="64.1333" x2="83.6615" y2="64.1333" />
                     <line class="fil2 str2" x1="136.6521" y1="69.3398" x2="83.6615" y2="69.3398" />
                     <line class="fil2 str2" x1="86.055" y1="64.1333" x2="86.055" y2="69.3398" />
                     <line class="fil2 str2" x1="88.5675" y1="64.1333" x2="88.5675" y2="69.3398" />
                     <line class="fil2 str2" x1="91.0799" y1="64.1333" x2="91.0799" y2="69.3398" />
                     <line class="fil2 str2" x1="93.5925" y1="64.1333" x2="93.5925" y2="69.3398" />
                     <line class="fil2 str2" x1="96.1049" y1="64.1333" x2="96.1049" y2="69.3398" />
                     <line class="fil2 str2" x1="98.6175" y1="64.1333" x2="98.6175" y2="69.3398" />
                     <line class="fil2 str2" x1="101.1299" y1="64.1333" x2="101.1299" y2="69.3398" />
                     <line class="fil2 str2" x1="103.6424" y1="64.1333" x2="103.6424" y2="69.3398" />
                     <line class="fil2 str2" x1="106.1549" y1="64.1333" x2="106.1549" y2="69.3398" />
                     <line class="fil2 str2" x1="108.6674" y1="64.1333" x2="108.6674" y2="69.3398" />
                     <line class="fil2 str2" x1="111.1799" y1="64.1333" x2="111.1799" y2="69.3398" />
                     <line class="fil2 str2" x1="113.6924" y1="64.1333" x2="113.6924" y2="69.3398" />
                     <line class="fil2 str2" x1="116.2048" y1="64.1333" x2="116.2048" y2="69.3398" />
                     <line class="fil2 str2" x1="118.7174" y1="64.1333" x2="118.7174" y2="69.3398" />
                     <line class="fil2 str2" x1="121.2298" y1="64.1333" x2="121.2298" y2="69.3398" />
                     <line class="fil2 str2" x1="123.7424" y1="64.1333" x2="123.7424" y2="69.3398" />
                     <line class="fil2 str2" x1="126.2549" y1="64.1333" x2="126.2549" y2="69.3398" />
                     <line class="fil2 str2" x1="128.7673" y1="64.1333" x2="128.7673" y2="69.3398" />
                     <line class="fil2 str2" x1="131.2799" y1="64.1333" x2="131.2799" y2="69.3398" />
                     <line class="fil2 str2" x1="133.7923" y1="64.1333" x2="133.7923" y2="69.3398" />
                  </g>
                  <!--Cabos, máximo de 19 cabos-->
                  <g id="cabo_1" @click="enviarPendulo('P1')" class="mouse">
                     <circle id="pq_cabo_1" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_1" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_1" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P1</text>
                     <circle id="f_cabo_1" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_2" @click="enviarPendulo('P2')" class="mouse">
                     <circle id="pq_cabo_2" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_2" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_2" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P2</text>
                     <circle id="f_cabo_2" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_3" @click="enviarPendulo('P3')" class="mouse">
                     <circle id="pq_cabo_3" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_3" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_3" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P3</text>
                     <circle id="f_cabo_3" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_4" @click="enviarPendulo('P4')" class="mouse">
                     <circle id="pq_cabo_4" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_4" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_4" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P4</text>
                     <circle id="f_cabo_4" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_5" @click="enviarPendulo('P5')" class="mouse">
                     <circle id="pq_cabo_5" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_5" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_5" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P5</text>
                     <circle id="f_cabo_5" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_6" @click="enviarPendulo('P6')" class="mouse">
                     <circle id="pq_cabo_6" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_6" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_6" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P6</text>
                     <circle id="f_cabo_6" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_7" @click="enviarPendulo('P7')" class="mouse">
                     <circle id="pq_cabo_7" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_7" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_7" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P7</text>
                     <circle id="f_cabo_7" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_8" @click="enviarPendulo('P8')" class="mouse">
                     <circle id="pq_cabo_8" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_8" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_8" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P8</text>
                     <circle id="f_cabo_8" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_9" @click="enviarPendulo('P9')" class="mouse">
                     <circle id="pq_cabo_9" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_9" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_9" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P9</text>
                     <circle id="f_cabo_9" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_10" @click="enviarPendulo('P10')" class="mouse">
                     <circle id="pq_cabo_10" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_10" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_10" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P10</text>
                     <circle id="f_cabo_10" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_11" @click="enviarPendulo('P11')" class="mouse">
                     <circle id="pq_cabo_11" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_11" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_11" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P11</text>
                     <circle id="f_cabo_11" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_12" @click="enviarPendulo('P12')" class="mouse">
                     <circle id="pq_cabo_12" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_12" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_12" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P12</text>
                     <circle id="f_cabo_12" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_13" @click="enviarPendulo('P13')" class="mouse">
                     <circle id="pq_cabo_13" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_13" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_13" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P13</text>
                     <circle id="f_cabo_13" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_14" @click="enviarPendulo('P14')" class="mouse">
                     <circle id="pq_cabo_14" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_14" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_14" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P14</text>
                     <circle id="f_cabo_14" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_15" @click="enviarPendulo('P15')" class="mouse">
                     <circle id="pq_cabo_15" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_15" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_15" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P15</text>
                     <circle id="f_cabo_15" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_16" @click="enviarPendulo('P16')" class="mouse">
                     <circle id="pq_cabo_16" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_16" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_16" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P16</text>
                     <circle id="f_cabo_16" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_17" @click="enviarPendulo('P17')" class="mouse">
                     <circle id="pq_cabo_17" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_17" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_17" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P17</text>
                     <circle id="f_cabo_17" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_18" @click="enviarPendulo('P18')" class="mouse">
                     <circle id="pq_cabo_18" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_18" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_18" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P18</text>
                     <circle id="f_cabo_18" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
                  <g id="cabo_19" @click="enviarPendulo('P19')" class="mouse">
                     <circle id="pq_cabo_19" fill="red" cx="68.75" cy="66.5" r="8" visibility="hidden">
                        <animate attributeName="r" from="8" to="5" begin="0s" dur="1s" repeatCount="indefinite" />
                     </circle>
                     <circle id="c_cabo_19" cx="68.75" cy="66.5" r="5.7138" />
                     <text id="t_cabo_19" x="68.75" y="66.5" class="fnt0" text-anchor="middle" dominant-baseline="central">P19</text>
                     <circle id="f_cabo_19" fill="red" cx="68.75" cy="66.5" r="7" fill-opacity="0.6" visibility="hidden" />
                  </g>
               </g>
            </svg>
            <!-- Fim desenho SVG -->
         </b-col>
      </b-row>
   </div>
</template>

<script>
import client from '@/api'

export default {
   name: 'SiloPendulos',
   data() {
      return {
         data: this.$moment().format('YYYY-MM-DD'),
         buscandoDados: false,
         dadoPendulos: [],
         mostrarTabela: true,
         visualizacaoVista: 'Vista dos pêndulos',
         visualizacaoLeitura: 'Selecionar Leitura',
         items: [],
         fields: [],
         erros: {},
         leiturasDia: {},
         tipoLeitura: null,
         dataLeitura: null,
         buscandoLeituras: false,
         svgKey: 0,
         datasOperacao: [],
         modeloSilo: 'PADRAO',
         idSilo: null
      }
   },

   computed: {
      getColumnHeaders() {
         if (!Array.isArray(this.items) || this.items.length === 0) {
            return []
         }
         return Object.keys(this.items[0]).filter((coluna) => coluna !== 'S')
      }
   },

   methods: {
      relatorio() {
         this.$bvModal.show('relatorioLeituraSilo')
      },
      marcaDatasOperacao(data) {
         const possuiData = this.datasOperacao.includes(data)
         return possuiData ? 'table-primary' : ''
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('HH:mm')
      },
      acionarBusca(tipo, data) {
         this.tipoLeitura = tipo
         this.dataLeitura = data
         this.dadoPendulos = []
         this.buscarPendulos()
      },
      async buscarPendulos() {
         this.svgKey++
         if (!this.idSilo) {
            return
         }
         this.buscandoDados = true
         const dados = await client.get(`/silo/buscarpendulo/${this.idSilo}?tipo=${this.tipoLeitura}&data=${this.dataLeitura}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar pendulos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoDados = false
         })
         this.buscandoDados = false
         if (dados && dados.data) {
            this.dadoPendulos = dados.data
            this.iniciar(this.dadoPendulos.quantidade, this.modeloSilo)
            this.escreveTempCabo(this.dadoPendulos.quantidade, this.dadoPendulos.pendulos)
            const data = this.$moment(this.dadoPendulos.DAT, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY')
            this.$emit('recebeData', data)
         }
      },
      calculateColorClass(value) {
         // value[0] = temperatura | value[1] = media | value[2] = p. quente | value[3] = falha | value[4] = nivel
         const colorMap = [
            { max: 12, color: 'background-color-blue' },
            { max: 15, color: 'background-color-lightblue' },
            { max: 17, color: 'background-color-lightgreen' },
            { max: 21, color: 'background-color-green' },
            { max: 25, color: 'background-color-greeng' },
            { max: 27, color: 'background-color-yellow' },
            { max: 30, color: 'background-color-orange' },
            { max: 35, color: 'background-color-red' },
            { max: 50, color: 'background-color-violet' },
            { max: Infinity, color: 'background-color-darkviolet' }
         ]

         let color = value[0] == null ? '' : colorMap.find((c) => value[0] < c.max).color
         let colorNivel = value[4] == 0 ? 'nivel' : ''
         let colorPontoQuente = value[4] == 1 && value[2] == 1 ? 'ponto_quente' : ''
         let colorErro = value[3] == 1 || value[0] == 0.0 ? 'erro' : ''

         return `${color} ${colorNivel} ${colorErro} ${colorPontoQuente}`
      },
      enviarPendulo(pendulo) {
         this.$emit('receberPendulo', pendulo)
      },
      receberModelo(modeloSilo) {
         const modelos = ['AGREX-9016', 'AGI-72C-26']
         this.modeloSilo = modelos.includes(modeloSilo) ? modeloSilo : 'PADRAO'
      },
      polarRetangular(raio, angulo) {
         let x, y // coordenadas retangulares
         let resposta // string com a resposta do translate
         // converte o ângulo de graus para radianos
         angulo = ((angulo * Math.PI) / 180) * -1
         // calcula o deslocamento em coordenadas retangulares
         x = raio * Math.cos(angulo)
         y = raio * Math.sin(angulo)
         // monta a resposta em formato de string pronta para a função
         resposta = 'translate(' + x + ',' + y + ')'
         return resposta
      },
      iniciar(ncabos, modelo = 'PADRAO') {
         var id //id auxiliar
         var i //usado no looping
         //oculta os cabos não utilizados
         for (i = 19; i > ncabos; i--) {
            id = 'cabo_' + i
            document.getElementById(id).style.visibility = 'hidden'
         }
         if (modelo == 'PADRAO') {
            switch (ncabos) {
               case 1:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(0, 0))
                  break
               case 3:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(37, 30))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(37, 150))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(37, 270))
                  break
               case 4:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(37, 75))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(37, 195))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(37, 315))
                  document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(0, 0))
                  break
               case 5:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(37, 15))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(37, 90))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(37, 180))
                  document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(37, 270))
                  document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(0, 0))
                  break
               case 6:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(37, 30))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(37, 102))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(37, 174))
                  document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(37, 246))
                  document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(37, 318))
                  document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(0, 0))
                  break
               case 7:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(37, 30))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(37, 90))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(37, 150))
                  document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(37, 210))
                  document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(37, 270))
                  document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(37, 330))
                  document.getElementById('cabo_7').setAttribute('transform', this.polarRetangular(0, 0))
                  break
               case 10:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(50, 30))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(50, 90))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(50, 150))
                  document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(50, 210))
                  document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(50, 270))
                  document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(50, 330))
                  document.getElementById('cabo_7').setAttribute('transform', this.polarRetangular(30, 60))
                  document.getElementById('cabo_8').setAttribute('transform', this.polarRetangular(30, 180))
                  document.getElementById('cabo_9').setAttribute('transform', this.polarRetangular(30, 300))
                  document.getElementById('cabo_10').setAttribute('transform', this.polarRetangular(0, 0))
                  break
               case 15:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(50, 40))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(50, 91.43))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(50, 142.86))
                  document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(50, 192.29))
                  document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(50, 245.72))
                  document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(50, 297.15))
                  document.getElementById('cabo_7').setAttribute('transform', this.polarRetangular(50, 348.58))
                  document.getElementById('cabo_8').setAttribute('transform', this.polarRetangular(30, 18))
                  document.getElementById('cabo_9').setAttribute('transform', this.polarRetangular(30, 69.43))
                  document.getElementById('cabo_10').setAttribute('transform', this.polarRetangular(30, 120.86))
                  document.getElementById('cabo_11').setAttribute('transform', this.polarRetangular(30, 172.29))
                  document.getElementById('cabo_12').setAttribute('transform', this.polarRetangular(30, 223.72))
                  document.getElementById('cabo_13').setAttribute('transform', this.polarRetangular(30, 275.15))
                  document.getElementById('cabo_14').setAttribute('transform', this.polarRetangular(30, 326.68))
                  document.getElementById('cabo_15').setAttribute('transform', this.polarRetangular(0, 0))
                  break
               case 19:
                  //Seta a posição dos cabos
                  document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(50, 15))
                  document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(50, 45))
                  document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(50, 75))
                  document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(50, 105))
                  document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(50, 135))
                  document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(50, 165))
                  document.getElementById('cabo_7').setAttribute('transform', this.polarRetangular(50, 195))
                  document.getElementById('cabo_8').setAttribute('transform', this.polarRetangular(50, 225))
                  document.getElementById('cabo_9').setAttribute('transform', this.polarRetangular(50, 255))
                  document.getElementById('cabo_10').setAttribute('transform', this.polarRetangular(50, 285))
                  document.getElementById('cabo_11').setAttribute('transform', this.polarRetangular(50, 315))
                  document.getElementById('cabo_12').setAttribute('transform', this.polarRetangular(50, 345))
                  document.getElementById('cabo_13').setAttribute('transform', this.polarRetangular(30, 30))
                  document.getElementById('cabo_14').setAttribute('transform', this.polarRetangular(30, 90))
                  document.getElementById('cabo_15').setAttribute('transform', this.polarRetangular(30, 150))
                  document.getElementById('cabo_16').setAttribute('transform', this.polarRetangular(30, 210))
                  document.getElementById('cabo_17').setAttribute('transform', this.polarRetangular(30, 270))
                  document.getElementById('cabo_18').setAttribute('transform', this.polarRetangular(30, 330))
                  document.getElementById('cabo_19').setAttribute('transform', this.polarRetangular(0, 0))
                  break
            }
         } else if (modelo == 'AGREX-9016') {
            //Seta a posição dos cabos
            document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(50, 20))
            document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(50, 56))
            document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(50, 92))
            document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(50, 128))
            document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(50, 164))
            document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(50, 200))
            document.getElementById('cabo_7').setAttribute('transform', this.polarRetangular(50, 236))
            document.getElementById('cabo_8').setAttribute('transform', this.polarRetangular(50, 272))
            document.getElementById('cabo_9').setAttribute('transform', this.polarRetangular(50, 308))
            document.getElementById('cabo_10').setAttribute('transform', this.polarRetangular(50, 344))
            document.getElementById('cabo_11').setAttribute('transform', this.polarRetangular(30, 45))
            document.getElementById('cabo_12').setAttribute('transform', this.polarRetangular(30, 135))
            document.getElementById('cabo_13').setAttribute('transform', this.polarRetangular(30, 225))
            document.getElementById('cabo_14').setAttribute('transform', this.polarRetangular(30, 315))
            document.getElementById('cabo_15').setAttribute('transform', this.polarRetangular(0, 0))
         } else if (modelo == 'AGI-72C-26') {
            //Seta a posição dos cabos
            document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(50, 55))
            document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(50, 127))
            document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(50, 199))
            document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(50, 271))
            document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(50, 343))
            document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(25, 25))
            document.getElementById('cabo_7').setAttribute('transform', this.polarRetangular(25, 125))
            document.getElementById('cabo_8').setAttribute('transform', this.polarRetangular(25, 245))
            document.getElementById('cabo_9').setAttribute('transform', this.polarRetangular(0, 0))
         } else if (modelo == 'SF-AGRICOLA-1') {
            //Seta a posição dos cabos
            document.getElementById('cabo_1').setAttribute('transform', this.polarRetangular(57, 115))
            document.getElementById('cabo_2').setAttribute('transform', this.polarRetangular(50, 180))
            document.getElementById('cabo_3').setAttribute('transform', this.polarRetangular(57, 245))
            document.getElementById('cabo_4').setAttribute('transform', this.polarRetangular(57, 295))
            document.getElementById('cabo_5').setAttribute('transform', this.polarRetangular(50, 0))
            document.getElementById('cabo_6').setAttribute('transform', this.polarRetangular(57, 65))
            document.getElementById('cabo_7').setAttribute('transform', this.polarRetangular(15, 135))
            document.getElementById('cabo_8').setAttribute('transform', this.polarRetangular(30, 250))
            document.getElementById('cabo_9').setAttribute('transform', this.polarRetangular(15, 315))
            document.getElementById('cabo_10').setAttribute('transform', this.polarRetangular(30, 70))
         }
      },
      escreveTempCabo(ncabos, dados) {
         let visual = ['white', 'black', 'black', '1', '1', '0.4']
         let valor = 0
         let nivel = 0
         let falha = 0
         let ponto_quente = 0
         let id
         for (let i = 1; i <= ncabos; i++) {
            falha = dados[String(i)][0]
            ponto_quente = dados[String(i)][1]
            nivel = dados[String(i)][2]
            valor = dados[String(i)][3]
            visual = ['white', 'black', 'black', '1', '1', '0.4']

            id = 'f_cabo_' + i
            document.getElementById(id).style.visibility = 'hidden'
            id = 'pq_cabo_' + i
            document.getElementById(id).style.visibility = 'hidden'

            if (valor < 12) {
               visual[0] = '#0384fc'
               visual[1] = 'white'
            } else if (valor < 15) {
               visual[0] = '#03e8fc'
               visual[1] = 'black'
            } else if (valor < 17) {
               visual[0] = '#03fcbe'
               visual[1] = 'black'
            } else if (valor < 21) {
               visual[0] = '#07fc03'
               visual[1] = 'black'
            } else if (valor < 25) {
               visual[0] = '#c3ff00'
               visual[1] = 'black'
            } else if (valor < 27) {
               visual[0] = '#fcf803'
               visual[1] = 'black'
            } else if (valor < 30) {
               visual[0] = '#ffb300'
               visual[1] = 'black'
            } else if (valor < 35) {
               visual[0] = '#ff2200'
               visual[1] = 'white'
            } else if (valor < 50) {
               visual[0] = '#ff0090'
               visual[1] = 'white'
            } else if (valor >= 50) {
               visual[0] = '#f700ff'
               visual[1] = 'white'
            }

            if (nivel == false) {
               visual[0] = '#c7c7c7'
               visual[1] = 'black'
               visual[2] = 'black'
               visual[3] = '0.78'
               visual[4] = '0.4'
            }

            if (ponto_quente == true) {
               id = 'pq_cabo_' + i
               document.getElementById(id).style.visibility = 'visible'
            }

            if (falha == true) {
               id = 'f_cabo_' + i
               document.getElementById(id).style.visibility = 'visible'

               id = 'pq_cabo_' + i
               document.getElementById(id).style.visibility = 'hidden'
            }

            id = 't_cabo_' + i
            document.getElementById(id).setAttribute('fill', visual[1])
            document.getElementById(id).setAttribute('fill-opacity', visual[4])

            id = 'c_cabo_' + i
            document.getElementById(id).setAttribute('fill', visual[0])
            document.getElementById(id).setAttribute('stroke', visual[2])
            document.getElementById(id).setAttribute('stroke-width', visual[5])
            document.getElementById(id).setAttribute('fill-opacity', visual[3])
         }
      }
   },

   mounted() {
      const idSiloLocalStorage = localStorage.getItem('sil')

      if (idSiloLocalStorage && idSiloLocalStorage != 'undefined') {
         this.idSilo = idSiloLocalStorage
      } else {
         this.idSilo = this.$route.params.idSilo
         localStorage.setItem('sil', this.idSilo)
      }
   }
}
</script>

<style>
.valor {
   font-size: 16px;
   font-weight: 400;
}

.mouse {
   cursor: pointer;
}

.overlay {
   z-index: 0;
}

.hidden {
   display: none;
}

/* css svg */
.str1 {
   stroke: #999999;
   stroke-width: 0.8465;
   stroke-miterlimit: 22.9256;
}

.str0 {
   stroke: #999999;
   stroke-width: 1.6929;
   stroke-miterlimit: 22.9256;
}

.str2 {
   stroke: gray;
   stroke-width: 0.8465;
   stroke-linecap: round;
   stroke-miterlimit: 22.9256;
}

.fil2 {
   fill: none;
}

.fil3 {
   fill: #e6e6e6;
}

/* .fil1 {
   fill: url(#id0);
} */

.fil1 {
   fill: #b9b9b9;
}

.fnt0 {
   font-weight: bold;
   font-size: 5px;
   font-family: 'Arial';
}
</style>