<template>
   <div class="col-md-12">
      <div class="white_shd full margin_bottom_30">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-row>
                  <b-col sm="12" md="6">
                     <h2>{{ limpezas?.estrutura_equipamentos?.length > 1 ? 'Máquinas de Limpeza' : 'Máquina de Limpeza' }}</h2>
                  </b-col>
                  <b-col sm="12" md="6" class="text-right">
                     <div @click="ajuda"><b-icon-question-circle scale="1.8" class="mouse"></b-icon-question-circle></div>
                  </b-col>
               </b-row>
            </div>
         </div>
         <div class="map_section padding_infor_info">
            <b-overlay :show="buscandoLimpezas" rounded="sm" class="overlay">
               <div class="map m_style1">
                  <div v-if="limpezas.estrutura_equipamentos?.length" class="card-container">
                     <div class="d-flex">
                        <b-col cols="12" sm="6" md="3" lg="2" class="mb-3" v-for="limpeza in limpezas.estrutura_equipamentos" :key="limpeza.id_equipamento" style="min-width: 220px">
                           <b-card @click="detalheMaquinaLimpeza(limpeza.id_equipamento)" :border-variant="corVariant(limpeza.st_operacao)" :header-bg-variant="corVariant(limpeza.st_operacao)" header-text-variant="white" align="center" class="cardMouse mouse" :style="{ 'min-height': '100%', 'max-height': '100%', opacity: limpeza.st_operacao == 'OF' ? '0.5' : '' }">
                              <template v-slot:header>
                                 <div style="font-size: 14px">{{ limpeza.ds_equipamento }}</div>
                              </template>
                              <b-overlay :show="infoLimpeza[limpeza.id_equipamento]?.buscandoResumo" rounded="sm" class="overlay">
                                 <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" style="margin: -10px 0 -6px">
                                    <h5 class="text-center">{{ formatarOperacao(getInfoLimpezaId(limpeza.id_equipamento, 'AC1')) || '-' }}</h5>
                                 </div>
                                 <hr />
                                 <b-row class="justify-content-center mx-auto">
                                    <img :src="imagemOperacao(getInfoLimpezaId(limpeza.id_equipamento, 'AC1'))" height="140" />
                                 </b-row>
                                 <hr />
                                 <b-row class="justify-content-center" style="margin: -10px">
                                    <p class="negrito">Operação e manutenção</p>
                                 </b-row>
                                 <b-row class="flex-wrap text-center justify-content-center" style="margin: -13px">
                                    <b-col cols="4" class="text-center">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Operação</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <b-iconstack font-scale="1.8">
                                             <b-icon stacked icon="exclamation" variant="danger" v-if="getInfoLimpezaId(limpeza.id_equipamento, 'AL1') && getInfoLimpezaId(limpeza.id_equipamento, 'AL1') != '0'"></b-icon>
                                             <b-icon stacked icon="check" variant="success" v-else></b-icon>
                                             <b-icon stacked icon="circle" :variant="getInfoLimpezaId(limpeza.id_equipamento, 'AL1') && getInfoLimpezaId(limpeza.id_equipamento, 'AL1') != '0' ? 'danger' : 'success'"></b-icon>
                                          </b-iconstack>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p class="font12 negrito mt-2" v-if="getInfoLimpezaId(limpeza.id_equipamento, 'AL1') && getInfoLimpezaId(limpeza.id_equipamento, 'AL1') != '0'">Alerta</p>
                                          <p class="font12 font-weight-bold mt-2" v-else>Normal</p>
                                       </b-row>
                                    </b-col>
                                    <b-col cols="4" class="text-center">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Revisão</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <b-iconstack font-scale="1.8">
                                             <b-icon stacked icon="wrench" :variant="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 5) ? 'warning' : 'success'" scale="0.55"></b-icon>
                                             <b-icon stacked icon="wrench" :variant="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 5) ? 'warning' : 'success'" scale="0.55" rotate="90"></b-icon>
                                             <b-icon stacked icon="circle" :variant="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 5) ? 'warning' : 'success'"></b-icon>
                                          </b-iconstack>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p class="font12 negrito mt-2" v-if="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 5)">Pendente</p>
                                          <p class="font12 font-weight-bold mt-2" v-else>Revisada</p>
                                       </b-row>
                                    </b-col>
                                    <b-col cols="4" class="text-center">
                                       <b-row class="justify-content-center mx-auto">
                                          <small class="text-nowrap">Ciclo vida</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <b-iconstack font-scale="2.3">
                                             <b-icon stacked icon="wrench" :variant="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 6) ? 'warning' : 'success'" scale="0.45"></b-icon>
                                             <b-icon stacked icon="wrench" :variant="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 6) ? 'warning' : 'success'" scale="0.45" rotate="90"></b-icon>
                                             <b-icon stacked icon="arrow-clockwise" :variant="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 6) ? 'warning' : 'success'" scale="1.1"></b-icon>
                                          </b-iconstack>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p class="font12 negrito" v-if="verificarBitNaPosicao(getInfoLimpezaId(limpeza.id_equipamento, 'AL1'), 6)">Substituir</p>
                                          <p class="font12 font-weight-bold" v-else>Normal</p>
                                       </b-row>
                                    </b-col>
                                 </b-row>
                                 <hr />
                                 <b-row>
                                    <b-col style="margin: -10px 0" class="font12">
                                       <span class="text-center">Última atualização:&nbsp;</span>
                                       <span>{{ formatarData(getInfoLimpezaId(limpeza.id_equipamento, 'DAT')) || 'Não Atualizado' }}</span>
                                    </b-col>
                                 </b-row>
                              </b-overlay>
                           </b-card>
                        </b-col>
                     </div>
                  </div>
                  <b-row v-else>
                     <b-col>
                        <p class="text-center">Nenhuma máquina de limpeza para listar</p>
                     </b-col>
                  </b-row>
               </div>
            </b-overlay>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'

export default {
   name: 'ResumoLimpeza',
   props: {
      limpezas: Object,
      buscandoLimpezas: Boolean
   },
   data() {
      return {
         infoLimpeza: {}
      }
   },

   methods: {
      ajuda() {
         this.$bvModal.show('ajuda')
      },
      corVariant(st_operacao) {
         const variant = {
            OF: 'secondary',
            EF: 'danger',
            EC: 'dark',
            EM: 'warning',
            ON: 'success'
         }
         return variant[st_operacao]
      },
      detalheMaquinaLimpeza(limpeza) {
         const idLimpeza = limpeza
         this.$router.push({ name: 'limpeza', params: { idLimpeza } })
      },
      async buscaResumo(id) {
         if (!id) {
            return
         }
         this.$set(this.infoLimpeza, id, { buscandoResumo: true })

         const dados = await client.get(`/resumo/maquinalimpeza/${id}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar informações da máquina de limpeza. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(this.infoLimpeza, id, { buscandoResumo: false })
         })
         this.$set(this.infoLimpeza, id, { buscandoResumo: false })
         if (dados.data) {
            this.$set(this.infoLimpeza, id, { dados: dados.data })
         }
      },
      imagemOperacao(value) {
         if (this.verificarBitNaPosicao(value, 0)) {
            return require('@/assets/images/inicio/maquina_limpeza_ligada.png')
         } else if (this.verificarBitNaPosicao(value, 1)) {
            return require('@/assets/images/inicio/maquina_limpeza_ligada.png')
         } else if (!this.verificarBitNaPosicao(value, 0) && !this.verificarBitNaPosicao(value, 1)) {
            return require('@/assets/images/inicio/maquina_limpeza_desligada.png')
         } else {
            return require('@/assets/images/inicio/maquina_limpeza_desligada.png')
         }
      },
      getInfoLimpezaId(idLimpeza, idVariavel) {
         const limpeza = this.infoLimpeza[idLimpeza]
         return limpeza && limpeza.dados ? limpeza.dados[idVariavel] : null
      },
      formatarOperacao(value) {
         if (this.verificarBitNaPosicao(value, 0)) {
            return 'Ligado em manual'
         } else if (this.verificarBitNaPosicao(value, 1)) {
            return 'Ligado em automático'
         } else if (!this.verificarBitNaPosicao(value, 0) && !this.verificarBitNaPosicao(value, 1)) {
            return 'Desligado'
         } else {
            return '-'
         }
      },

      formatarData(value) {
         if (!value) return null
         const data = this.$moment(value, 'YYYY/MM/DD HH:mm:ss')
         const agora = this.$moment()
         const diasPassados = agora.diff(data, 'days')

         if (diasPassados >= 1) {
            return `${diasPassados} dia${diasPassados > 1 ? 's' : ''}`
         } else {
            return data.format('DD/MM/YYYY HH:mm:ss')
         }
      },
      verificarBitNaPosicao(binario, posicao) {
         if (!binario) return
         const posicaoInvertida = binario.length - 1 - posicao
         return binario.charAt(posicaoInvertida) === '1'
      }
   },

   watch: {
      limpezas(newVal) {
         if (newVal) {
            this.limpezas.estrutura_equipamentos.forEach((limpeza) => {
               this.buscaResumo(limpeza.id_equipamento)
            })
         }
      }
   }
}
</script>

<style scoped>
.mouse {
   cursor: pointer;
}

.overlay {
   z-index: 0;
   min-height: 150px;
}

::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}

.negrito {
   font-weight: bold;
   font-size: 12px;
}
.font12 {
   font-size: 12px;
}

.cardMouse:hover {
   box-shadow: 0 0px 10px 0px #9c9c9c;
   z-index: 99;
}
</style>