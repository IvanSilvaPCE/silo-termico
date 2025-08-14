<template>
   <div class="col-md-12">
      <div class="white_shd full margin_bottom_30">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-row>
                  <b-col>
                     <h2>{{ secadores?.estrutura_equipamentos?.length > 1 ? 'Secadores' : 'Secador' }}</h2>
                  </b-col>
                  <b-col class="text-right">
                     <div @click="ajuda"><b-icon-question-circle scale="1.8" class="mouse"></b-icon-question-circle></div>
                  </b-col>
               </b-row>
            </div>
         </div>
         <div class="map_section padding_infor_info">
            <b-overlay :show="buscandoSecadores" rounded="sm" class="overlay">
               <div class="map m_style1">
                  <div v-if="secadores.estrutura_equipamentos?.length" class="card-container">
                     <div class="d-flex flex-wrap">
                        <b-col cols="12" sm="6" md="3" lg="2" class="mb-3" v-for="secador in secadores.estrutura_equipamentos" :key="secador.id_equipamento" style="min-width: 220px">
                           <b-card @click="detalheSecador(secador.id_equipamento)" :border-variant="corVariant(secador.st_operacao)" :header-bg-variant="corVariant(secador.st_operacao)" header-text-variant="white" align="center" class="mouse cardMouse" :style="{ 'min-height': '100%', 'max-height': '100%', opacity: secador.st_operacao == 'OF' ? '0.5' : '' }">
                              <template v-slot:header>
                                 <div style="font-size: 14px">{{ secador.ds_equipamento }}</div>
                              </template>
                              <b-overlay :show="infoSecador[secador.id_equipamento]?.buscandoResumo" rounded="sm" class="overlay">
                                 <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" style="margin: -10px 0 -6px">
                                    <h5 v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1" class="text-center">{{ formatarProduto(getInfoSecadorId(secador.id_equipamento, 'GG')) || '-' }}</h5>
                                    <h5 v-if="secador.id_fabricante == 46" class="text-center">{{ formatarProdutoHorbach(getInfoSecadorId(secador.id_equipamento, 'CUL')) || '-' }}</h5>
                                    <h5 v-if="secador.id_fabricante == 47" class="text-center">{{ formatarProdutoAds(getInfoSecadorId(secador.id_equipamento, 'CUL')) || '-' }}</h5>
                                 </div>
                                 <hr />
                                 <b-row style="margin-top: -12px; margin-bottom: -25px" class="justify-content-center">
                                    <!-- <b-col cols="4" class="pr-0">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Operação</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p class="negrito">{{ formatarOperacao(getInfoSecadorId(secador.id_equipamento, 'OP')) || '-' }}</p>
                                       </b-row>
                                    </b-col> -->
                                    <b-col cols="6" v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1 || secador.id_fabricante == 47" class="p-0 m-0">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Controle</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1" class="negrito">{{ formatarControle(getInfoSecadorId(secador.id_equipamento, 'CT')) || '-' }}</p>
                                          <p v-if="secador.id_fabricante == 47" class="negrito">{{ formatarControleAds(getInfoSecadorId(secador.id_equipamento, 'CT')) || '-' }}</p>
                                       </b-row>
                                    </b-col>
                                    <b-col cols="6" class="pl-0">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Ris. incêndio</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <b-icon icon="exclamation-triangle-fill" scale="1.5" variant="danger" class="mt-1 mr-1" v-if="getInfoSecadorId(secador.id_equipamento, 'RIN') == 'Sim'"></b-icon>
                                          <p class="negrito" :class="{ 'text-danger': getInfoSecadorId(secador.id_equipamento, 'RIN') == 'Sim' }">
                                             {{ getInfoSecadorId(secador.id_equipamento, 'RIN') || '-' }}
                                          </p>
                                       </b-row>
                                    </b-col>
                                 </b-row>
                                 <hr />
                                 <b-row class="justify-content-center" style="margin: -10px 0">
                                    <img v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1" :src="imagemOperacao(getInfoSecadorId(secador.id_equipamento, 'OP'), secador.id_fabricante)" height="140" />
                                    <img v-if="secador.id_fabricante == 46" :src="imagemOperacao(getInfoSecadorId(secador.id_equipamento, 'MOP'), secador.id_fabricante)" height="140" />
                                    <img v-if="secador.id_fabricante == 47" :src="imagemOperacaoAds(getInfoSecadorId(secador.id_equipamento, 'OP'))" height="140" />
                                 </b-row>
                                 <hr />
                                 <b-row class="justify-content-center" style="margin: -8px 0">
                                    <p class="negrito">Temperaturas</p>
                                 </b-row>
                                 <b-row class="justify-content-center" style="margin-bottom: -20px">
                                    <b-col cols="4">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Entrada de ar</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <b-icon v-if="secador.id_fabricante != 47" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'T1'), getInfoSecadorId(secador.id_equipamento, 'TA1'), getInfoSecadorId(secador.id_equipamento, 'TB1'))"></b-icon>
                                          <b-icon v-if="secador.id_fabricante == 47" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'S1'), getInfoSecadorId(secador.id_equipamento, 'TA1'), getInfoSecadorId(secador.id_equipamento, 'TB1'))"></b-icon>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p v-if="secador.id_fabricante != 47" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'T1') || '-' }}&nbsp;°C</p>
                                          <p v-if="secador.id_fabricante == 47" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'S1') || '-' }}&nbsp;°C</p>
                                       </b-row>
                                    </b-col>
                                    <b-col cols="4" v-if="(secador.id_fabricante == 47 && getInfoSecadorId(secador.id_equipamento, 'S4')) || secador.id_fabricante != 47">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Massa grãos</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <b-icon v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'T2'), getInfoSecadorId(secador.id_equipamento, 'TA2'), getInfoSecadorId(secador.id_equipamento, 'TB2'))"></b-icon>
                                          <b-icon v-if="secador.id_fabricante == 46" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'T3M'), getInfoSecadorId(secador.id_equipamento, 'TA3'), getInfoSecadorId(secador.id_equipamento, 'TB3'))"></b-icon>
                                          <b-icon v-if="secador.id_fabricante == 47 && getInfoSecadorId(secador.id_equipamento, 'S4')" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'S4'), getInfoSecadorId(secador.id_equipamento, 'TA4'), getInfoSecadorId(secador.id_equipamento, 'TB4'))"></b-icon>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'T2') || '-' }}&nbsp;°C</p>
                                          <p v-if="secador.id_fabricante == 46" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'T3M') || '-' }}&nbsp;°C</p>
                                          <p v-if="secador.id_fabricante == 47" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'S4') || '-' }}&nbsp;°C</p>
                                       </b-row>
                                    </b-col>
                                    <b-col cols="4">
                                       <b-row class="justify-content-center mx-auto">
                                          <small>Saída exaust.</small>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <b-icon v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'T3'), getInfoSecadorId(secador.id_equipamento, 'TA3'), getInfoSecadorId(secador.id_equipamento, 'TB3'))"></b-icon>
                                          <b-icon v-if="secador.id_fabricante == 46" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'T4'), getInfoSecadorId(secador.id_equipamento, 'TA4'), getInfoSecadorId(secador.id_equipamento, 'TB4'))"></b-icon>
                                          <b-icon v-if="secador.id_fabricante == 47" icon="thermometer-half" scale="1.8" class="mt-2 mb-1" :style="calculaCor(getInfoSecadorId(secador.id_equipamento, 'S3'), getInfoSecadorId(secador.id_equipamento, 'TA3'), getInfoSecadorId(secador.id_equipamento, 'TB3'))"></b-icon>
                                       </b-row>
                                       <b-row class="justify-content-center mx-auto">
                                          <p v-if="secador.id_fabricante == 7 || secador.id_fabricante == 1" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'T3') || '-' }}&nbsp;°C</p>
                                          <p v-if="secador.id_fabricante == 46" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'T4') || '-' }}&nbsp;°C</p>
                                          <p v-if="secador.id_fabricante == 47" class="negrito mt-2">{{ getInfoSecadorId(secador.id_equipamento, 'S3') || '-' }}&nbsp;°C</p>
                                       </b-row>
                                    </b-col>
                                 </b-row>
                                 <hr />
                                 <b-row class="justify-content-center mx-auto" style="font-size: 12px; margin-top: -6px; margin-bottom: -5px">
                                    <span class="text-center">Última atualização:&nbsp;</span>
                                    <span> {{ formatarData(getInfoSecadorId(secador.id_equipamento, 'DAT')) || 'Não Atualizado' }}</span>
                                 </b-row>
                              </b-overlay>
                           </b-card>
                        </b-col>
                     </div>
                  </div>
                  <b-row v-else>
                     <b-col>
                        <p class="text-center">Nenhum secador para listar</p>
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
   name: 'ResumoSecador',
   props: {
      secadores: Object,
      buscandoSecadores: Boolean
   },
   data() {
      return {
         infoSecador: {}
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
      detalheSecador(secador) {
         const idSecador = secador
         this.$router.push({ name: 'secador', params: { idSecador } })
      },
      async buscaResumo(id, id_fabricante) {
         if (!id) {
            return
         }
         let url = ''
         if (id_fabricante == 7 || id_fabricante == 1) {
            url = `/resumo/secador/${id}`
         } else if (id_fabricante == 46) {
            url = `/resumo/secador_horbach/${id}`
         } else if (id_fabricante == 47) {
            url = `/resumo/secador_ads/${id}`
         }
         this.$set(this.infoSecador, id, { buscandoResumo: true })

         const dados = await client.get(`${url}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar informações do secador. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(this.infoSecador, id, { buscandoResumo: false })
         })
         this.$set(this.infoSecador, id, { buscandoResumo: false })
         if (dados.data) {
            this.$set(this.infoSecador, id, { dados: dados.data })
         }
      },
      imagemOperacao(operacao, fabricante) {
         const imagens = {
            7: 'op',
            1: 'op',
            46: 'h_op'
         }

         const operacoes = {
            1: 'carga',
            2: 'secagem',
            3: 'descarga',
            4: 'desligado',
            5: 'carregado'
         }

         const prefixo = imagens[fabricante] || 'op'
         const nomeImagem = operacoes[operacao] || 'desligado'

         return require(`@/assets/images/inicio/${prefixo}_${nomeImagem}.png`)
      },
      imagemOperacaoAds(operacao) {
         if (operacao == 1) {
            return require('@/assets/images/inicio/a_op_desligado.png')
         } else if (operacao == 2) {
            return require('@/assets/images/inicio/a_op_carga.png')
         } else if (operacao == 3) {
            return require('@/assets/images/inicio/a_op_secagem.png')
         } else if (operacao == 4) {
            return require('@/assets/images/inicio/a_op_descarga.png')
         }
         return require('@/assets/images/inicio/a_op_desligado.png')
      },
      getInfoSecadorId(idSecador, idVariavel) {
         const secador = this.infoSecador[idSecador]
         return secador && secador.dados ? secador.dados[idVariavel] : null
      },
      formatarProduto(value) {
         const produto = {
            1: 'Soja',
            2: 'Milho',
            3: 'Trigo',
            4: 'Arroz',
            5: 'Semente',
            6: 'Outro'
         }
         return produto[value]
      },
      formatarProdutoHorbach(value) {
         const produto = {
            1: 'Soja',
            2: 'Milho',
            3: 'Trigo',
            4: 'Arroz',
            6: 'Outros',
            7: 'Semente Soja',
            8: 'Semente Milho',
            9: 'Semente Trigo',
            10: 'Semente Arroz',
            11: 'Outras Sementes'
         }
         return produto[value]
      },
      formatarProdutoAds(value) {
         const produto = {
            0: '-',
            1: 'Soja',
            2: 'Milho',
            3: 'Trigo',
            4: 'Arroz',
            5: 'Outros'
         }
         return produto[value]
      },
      formatarOperacao(value) {
         const operacao = {
            1: 'Carga',
            2: 'Secagem',
            3: 'Descarga',
            4: 'Desligado',
            5: 'Em carga',
            6: 'Carregado'
         }
         return operacao[value]
      },
      formatarControle(value) {
         const controle = {
            0: 'Manual',
            1: 'Semi-auto',
            2: 'Automático'
         }
         return controle[value]
      },
      formatarControleAds(value) {
         const controle = {
            0: '-',
            1: 'Manual',
            2: 'Semi-auto',
            3: 'Automático'
         }
         return controle[value]
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

      calculaCor(dado, maximo, minimo) {
         if (dado > maximo) {
            return 'fill: red'
         } else if (dado < minimo) {
            return 'fill: blue'
         } else {
            return 'fill: green'
         }
      }
   },

   watch: {
      secadores(newVal) {
         if (newVal) {
            this.secadores.estrutura_equipamentos.forEach((secador) => {
               this.buscaResumo(secador.id_equipamento, secador.id_fabricante)
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