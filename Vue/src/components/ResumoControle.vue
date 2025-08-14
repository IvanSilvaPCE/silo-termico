<template>
   <div class="col-md-12">
      <div class="white_shd full margin_bottom_30">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-row>
                  <b-col sm="12" md="6">
                     <h2>Controle de Motores</h2>
                  </b-col>
                  <b-col sm="12" md="6" class="text-right">
                     <div @click="ajuda"><b-icon-question-circle scale="1.8" class="mouse"></b-icon-question-circle></div>
                  </b-col>
               </b-row>
            </div>
         </div>
         <div class="map_section padding_infor_info">
            <b-overlay :show="buscandoControles" rounded="sm" class="overlay">
               <div class="map m_style1">
                  <div v-if="controles.estrutura_equipamentos?.length" class="card-container">
                     <div class="d-flex ">
                        <b-col cols="12" sm="6" md="6" lg="3" class="mb-3" v-for="controle in controles.estrutura_equipamentos" :key="controle.id_equipamento">
                           <b-card @click="detalheControle(controle.id_equipamento)" :border-variant="corVariant(controle.st_operacao)" :header-bg-variant="corVariant(controle.st_operacao)" header-text-variant="white" align="center" class="cardMouse mouse" :style="{ opacity: controle.st_operacao == 'OF' ? '0.5' : '' }">
                              <template v-slot:header>
                                 <div style="font-size: 18px">{{ controle.ds_equipamento }}</div>
                              </template>
                              <b-overlay :show="infoControle[controle.id_equipamento]?.buscandoResumo" rounded="sm" class="overlay">
                                 <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <h5 class="text-center">{{ formatarOperacao(getInfoControleId(controle.id_equipamento, 'MOP')) || '-' }}</h5>
                                 </div>
                                 <hr />
                                 <b-row>
                                    <b-col cols="12">
                                       <b-iconstack font-scale="12">
                                          <b-icon stacked icon="layout-three-columns"></b-icon>
                                          <b-icon stacked icon="caret-left-fill" scale="0.1" shift-h="-4"></b-icon>
                                          <b-icon stacked icon="caret-right-fill" scale="0.1" shift-h="-1"></b-icon>
                                          <b-icon stacked icon="caret-right-fill" scale="0.1" shift-h="4"></b-icon>
                                          <b-icon stacked icon="dash-lg" scale="0.9" shift-v="-8"></b-icon>
                                          <b-icon stacked icon="speedometer2" scale="0.12" shift-v="5"></b-icon>
                                          <b-icon stacked icon="speedometer2" scale="0.12" shift-h="-5" shift-v="5"></b-icon>
                                          <b-icon stacked icon="speedometer2" scale="0.12" shift-h="5" shift-v="5"></b-icon>
                                       </b-iconstack>
                                    </b-col>
                                 </b-row>
                                 <hr />
                                 <b-row>
                                    <b-col>
                                       <small class="text-center">Data: {{ formatarData(getInfoControleId(controle.id_equipamento, 'DAT')) || '-' }}</small>
                                    </b-col>
                                 </b-row>
                              </b-overlay>
                           </b-card>
                        </b-col>
                     </div>
                  </div>
                  <b-row v-else>
                     <b-col>
                        <p class="text-center">Nenhum controle de motores para listar</p>
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
   name: 'ResumoControle',
   props: {
      controles: Object,
      buscandoControles: Boolean
   },
   data() {
      return {
         infoControle: {}
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
      detalheControle(controle) {
         const idControle = controle
         this.$router.push({ name: 'controle', params: { idControle } })
      },
      async buscaResumo(id) {
         if (!id) {
            return
         }
         this.$set(this.infoControle, id, { buscandoResumo: true })

         const dados = await client.get(`/resumo/ccm/${id}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar informações do CCM. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(this.infoControle, id, { buscandoResumo: false })
         })
         this.$set(this.infoControle, id, { buscandoResumo: false })
         if (dados.data) {
            this.$set(this.infoControle, id, { dados: dados.data })
         }
      },
      getInfoControleId(idControle, idVariavel) {
         const controle = this.infoControle[idControle]
         return controle && controle.dados ? controle.dados[idVariavel] : null
      },
      formatarOperacao(value) {
         const controle = {
            0: 'Manual',
            1: 'Automático'
         }
         return controle[value]
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      }
   },

   watch: {
      controles(newVal) {
         if (newVal) {
            this.controles.estrutura_equipamentos.forEach((controle) => {
               this.buscaResumo(controle.id_equipamento)
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

.cardMouse:hover {
   box-shadow: 0 0px 10px 0px #9c9c9c;
   z-index: 99;
}
</style>