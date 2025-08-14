<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <h2>Últimos dados do equipamento</h2>
               </div>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <div class="white_shd full margin_bottom_30">
                  <div class="map_section padding_infor_info">
                     <div>
                        <b-row>
                           <b-col sm="12" md="6" lg="6">
                              <b-form-group label="Equipamento">
                                 <b-overlay :show="overlayEquipamentos" rounded="sm">
                                    <v-select v-model="chaveEquipamento" :options="optionsEquipamentos" :reduce="(equipamento) => equipamento.value">
                                       <template #no-options="">Nenhuma correspondência</template>
                                    </v-select>
                                 </b-overlay>
                              </b-form-group>
                              <small>A consulta pode demorar devido a quantidade de dados</small>
                           </b-col>
                        </b-row>
                        <b-row>
                           <b-col sm="12" md="6" lg="6">
                              <b-row class="mb-3">
                                 <b-col>
                                    <div class="full graph_head">
                                       <div class="heading1 margin_0">
                                          <h2>Dados recebidos</h2>
                                       </div>
                                    </div>
                                 </b-col>
                              </b-row>
                              <b-row>
                                 <b-col>
                                    <b-overlay :show="overlayDados" rounded="sm" style="min-height: 100px">
                                       <div v-for="(dado, index) in dados.json" :key="index" class="mb-4">
                                          <h6>{{ formatarData(dado.created_at) }}</h6>
                                          <b-form-textarea :value="formataJSON(dado.tx_json)" rows="10" readonly style="background-color: white"></b-form-textarea>
                                       </div>
                                    </b-overlay>
                                 </b-col>
                              </b-row>
                           </b-col>
                           <b-col sm="12" md="6" lg="6">
                              <b-row class="mb-3">
                                 <b-col>
                                    <div class="full graph_head">
                                       <div class="heading1 margin_0">
                                          <h2>Dados processados</h2>
                                       </div>
                                    </div>
                                 </b-col>
                              </b-row>

                              <b-row>
                                 <b-col>
                                    <b-overlay :show="overlayDados" rounded="sm" style="min-height: 100px">
                                       <b-list-group>
                                          <b-list-group-item class="d-flex justify-content-between align-items-center" v-for="(dado, index) in dados.view" :key="index">
                                             {{ dado.nm_variavel + ':' }}
                                             <p class="mb-0">{{ dado.vl_dado }}</p>
                                          </b-list-group-item>
                                       </b-list-group>
                                    </b-overlay>
                                 </b-col>
                              </b-row>
                           </b-col>
                        </b-row>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'

export default {
   name: 'UltimosDadosView',
   data() {
      return {
         overlayEquipamentos: false,
         overlayDados: false,
         equipamento: [],
         dados: [],
         chaveEquipamento: null
      }
   },

   computed: {
      optionsEquipamentos() {
         if (!this.equipamento.length) {
            return
         }
         return this.equipamento.map((equipamento) => ({
            value: equipamento.chave,
            label: equipamento.chave + ' | ' + equipamento.ds_equipamento + ' | ' + (equipamento?.cliente?.natureza == 'J' ? equipamento?.cliente?.nm_fantasia : equipamento?.cliente?.nm_pessoa)
         }))
      }
   },

   methods: {
      async buscarEquipamentos() {
         this.overlayEquipamentos = true
         const dados = await client.get('/equipamento/buscarequipamento').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEquipamentos = false
         this.equipamento = dados.data
      },
      async buscarDados() {
         this.dados = []
         this.overlayDados = true
         const dados = await client.get(`/dado/${this.chaveEquipamento}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar últimos dados. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayDados = false
         this.dados = dados.data
      },
      formataJSON(string) {
         try {
            const parsed = JSON.parse(string)
            return JSON.stringify(parsed, null, 3)
         } catch (error) {
            return string
         }
      },
      formatarData(value) {
         if (!value) return '-'
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      }
   },

   mounted() {
      this.buscarEquipamentos()
   },

   watch: {
      chaveEquipamento(newValue) {
         if (newValue) {
            this.buscarDados()
         }
      }
   }
}
</script>

<style>
</style>