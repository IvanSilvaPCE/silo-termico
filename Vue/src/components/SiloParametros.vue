<template>
   <b-overlay :show="buscandoParametros" rounded="sm" class="overlay">
      <b-row>
         <b-col>
            <b-list-group horizontal>
               <b-list-group-item class="d-flex justify-content-between" v-b-tooltip.hover title="Controle de aeração">
                  <b-badge variant="primary" class="valor mr-1">Controle</b-badge>
                  <small class="valor">{{ this.parametros.CMA }}</small>
               </b-list-group-item>
            </b-list-group>
         </b-col>
         <!-- <b-col class="text-right">
            <b-dropdown id="dropdown-left" text="Editar programa" variant="outline-primary">
               <b-dropdown-item @click="editar('PPL')">Programa livre</b-dropdown-item>
               <b-dropdown-item @click="editar('PPC')">Programa conservação</b-dropdown-item>
               <b-dropdown-item @click="editar('PPS')">Programa secagem</b-dropdown-item>
               <b-dropdown-item @click="editar('PPR')">Programa resfriamento</b-dropdown-item>
            </b-dropdown>
         </b-col> -->
      </b-row>
      <div class="card-container mt-3">
         <div class="d-flex overflow-auto" ref="scrollContainer" v-on:wheel.prevent="handleWheelScroll">
            <b-col cols="12" sm="12" md="8" lg="5" class="p-1">
               <div class="card text-center mb-2" :class="{ ativo: this.parametros?.PRA == 1 }">
                  <span class="h6 w-60 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm">Programa livre</span>
                  <div class="bg-transparent card-header pt-0 border-0">
                     <h1 class="h1 font-weight-normal text-primary text-center mb-0">
                        <span class="h5 text-muted ml-2">{{ this.parametros?.PRA == 1 ? 'Ativo' : 'Não ativo' }}</span>
                     </h1>
                  </div>
                  <div class="card-body pt-0 pb-3">
                     <b-row>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade máxima</b></span>
                           <span class="float-right">{{ this.parametros.PPL?.[1] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade mínima</b></span>
                           <span class="float-right">{{ this.parametros.PPL?.[2] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Temperatura máxima</b></span>
                           <span class="float-right">{{ this.parametros.PPL?.[3] }} °C</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Temperatura mínima</b></span>
                           <span class="float-right">{{ this.parametros.PPL?.[4] }} °C</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Limite horas diárias</b></span>
                           <span class="float-right">{{ this.parametros.PPL?.[5] }} h</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Controle por temperatura</b></span>
                           <span class="float-right">{{ this.parametros.PPL?.[6] }}</span>
                        </b-col>
                     </b-row>
                  </div>
               </div>
            </b-col>
            <b-col cols="12" sm="12" md="8" lg="5" class="p-1">
               <div class="card text-center mb-2" :class="{ ativo: this.parametros?.PRA == 4 }">
                  <span class="h6 w-60 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm">Programa conservação</span>
                  <div class="bg-transparent card-header pt-0 border-0">
                     <h1 class="h1 font-weight-normal text-primary text-center mb-0">
                        <span class="h5 text-muted ml-2">{{ this.parametros?.PRA == 4 ? 'Ativo' : 'Não ativo' }}</span>
                     </h1>
                  </div>
                  <div class="card-body pt-0 pb-3">
                     <b-row>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade pretendida no grão</b></span>
                           <span class="float-right">{{ this.parametros.PPC?.[1] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Diferencial de temperatura</b></span>
                           <span class="float-right">{{ this.parametros.PPC?.[2] }} °C</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Temperatura pretendida no grão</b></span>
                           <span class="float-right">{{ this.parametros.PPC?.[3] }} °C</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Modo resfriamento</b></span>
                           <span class="float-right">{{ this.parametros.PPC?.[4] }}</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Sugere utilizar resfriamento</b></span>
                           <span class="float-right">{{ this.parametros.PPC?.[5] }}</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Temperatura fora conservação</b></span>
                           <span class="float-right">{{ this.parametros.PPC?.[6] }}</span>
                        </b-col>
                     </b-row>
                  </div>
               </div>
            </b-col>
            <b-col cols="12" sm="12" md="8" lg="5" class="p-1">
               <div class="card text-center mb-2" :class="{ ativo: this.parametros?.PRA == 2 }">
                  <span class="h6 w-60 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm">Programa secagem</span>
                  <div class="bg-transparent card-header pt-0 border-0">
                     <h1 class="h1 font-weight-normal text-primary text-center mb-0">
                        <span class="h5 text-muted ml-2">{{ this.parametros?.PRA == 2 ? 'Ativo' : 'Não ativo' }}</span>
                     </h1>
                  </div>
                  <div class="card-body pt-0 pb-3">
                     <b-row>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade topo</b></span>
                           <span class="float-right">{{ this.parametros.PPS?.[1] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade base</b></span>
                           <span class="float-right">{{ this.parametros.PPS?.[2] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade pretendida</b></span>
                           <span class="float-right">{{ this.parametros.PPS?.[3] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Tempo nova amostra</b></span>
                           <span class="float-right">{{ this.parametros.PPS?.[4] }} h</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Tempo restante nova amostra</b></span>
                           <span class="float-right">{{ this.parametros.PPS?.[5] }} h</span>
                        </b-col>
                     </b-row>
                  </div>
               </div>
            </b-col>
            <b-col cols="12" sm="12" md="8" lg="5" class="p-1">
               <div class="card text-center mb-2" :class="{ ativo: this.parametros?.PRA == 3 }">
                  <span class="h6 w-60 mx-auto px-4 py-1 rounded-bottom bg-primary text-white shadow-sm">Programa resfriamento</span>
                  <div class="bg-transparent card-header pt-0 border-0">
                     <h1 class="h1 font-weight-normal text-primary text-center mb-0">
                        <span class="h5 text-muted ml-2">{{ this.parametros?.PRA == 3 ? 'Ativo' : 'Não ativo' }}</span>
                     </h1>
                  </div>
                  <div class="card-body pt-0 pb-3">
                     <b-row>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade topo</b></span>
                           <span class="float-right">{{ this.parametros.PPR?.[1] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade base</b></span>
                           <span class="float-right">{{ this.parametros.PPR?.[2] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Umidade pretendida no grão</b></span>
                           <span class="float-right">{{ this.parametros.PPR?.[3] }} %</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Diferencial de temperatura</b></span>
                           <span class="float-right">{{ this.parametros.PPR?.[4] }} °C</span>
                        </b-col>
                        <b-col>
                           <hr class="m-2" />
                        </b-col>
                        <b-col cols="12">
                           <span class="float-left"><b>Temperatura pretendida no grão</b></span>
                           <span class="float-right">{{ this.parametros.PPR?.[5] }} °C</span>
                        </b-col>
                     </b-row>
                  </div>
               </div>
            </b-col>
         </div>
      </div>
      <b-row>
         <b-col cols="12" class="mt-4">
            <b-table-simple responsive bordered>
               <b-thead>
                  <b-tr>
                     <b-th colspan="8" class="text-center">Horário de ponta / timer</b-th>
                  </b-tr>
                  <b-tr>
                     <b-th></b-th>
                     <b-th class="text-center"><h5>D</h5></b-th>
                     <b-th class="text-center"><h5>S</h5></b-th>
                     <b-th class="text-center"><h5>T</h5></b-th>
                     <b-th class="text-center"><h5>Q</h5></b-th>
                     <b-th class="text-center"><h5>Q</h5></b-th>
                     <b-th class="text-center"><h5>S</h5></b-th>
                     <b-th class="text-center"><h5>S</h5></b-th>
                  </b-tr>
               </b-thead>
               <b-tbody>
                  <b-tr>
                     <b-td>
                        <h5>{{ this.parametros.HOP }}</h5>
                     </b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHO == 1 && this.parametros.DHP[6] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHO == 1 && this.parametros.DHP[6] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHO == 1 && this.parametros.DHP[0] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHO == 1 && this.parametros.DHP[0] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHO == 1 && this.parametros.DHP[1] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHO == 1 && this.parametros.DHP[1] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHO == 1 && this.parametros.DHP[2] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHO == 1 && this.parametros.DHP[2] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHO == 1 && this.parametros.DHP[3] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHO == 1 && this.parametros.DHP[3] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHO == 1 && this.parametros.DHP[4] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHO == 1 && this.parametros.DHP[4] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHO == 1 && this.parametros.DHP[5] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHO == 1 && this.parametros.DHP[5] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                  </b-tr>
                  <b-tr>
                     <b-td>
                        <h5>{{ this.parametros.HOA }}</h5>
                     </b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHD == 1 && this.parametros.DHP[6] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHD == 1 && this.parametros.DHP[6] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHD == 1 && this.parametros.DHP[0] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHD == 1 && this.parametros.DHP[0] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHD == 1 && this.parametros.DHP[1] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHD == 1 && this.parametros.DHP[1] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHD == 1 && this.parametros.DHP[2] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHD == 1 && this.parametros.DHP[2] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHD == 1 && this.parametros.DHP[3] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHD == 1 && this.parametros.DHP[3] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHD == 1 && this.parametros.DHP[4] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHD == 1 && this.parametros.DHP[4] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                     <b-td class="text-center"><b-icon :icon="this.parametros.HHD == 1 && this.parametros.DHP[5] == 1 ? 'check' : 'x'" scale="2" :variant="this.parametros.HHD == 1 && this.parametros.DHP[5] == 1 ? 'success' : 'danger'"></b-icon></b-td>
                  </b-tr>
               </b-tbody>
            </b-table-simple>
         </b-col>
      </b-row>
      <b-modal id="cadastro" :title="tituloModal" @ok="resetModal" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group v-for="key in Object.keys(this.objPrograma)" :key="key" :label="camposProgramas[programaSelecionado][key][0]">
               <b-form-input v-model="objPrograma[key]" type="number" v-if="camposProgramas[programaSelecionado][key][1] == 'input'"></b-form-input>
               <b-form-select v-model="objPrograma[key]" :options="camposProgramas[programaSelecionado][key][2]" type="number" v-else></b-form-select>
            </b-form-group>
         </form>
         <template #modal-footer="{ cancel, ok }">
            <b-button size="lg" variant="secondary" @click="cancel()"> Cancelar </b-button>
            <b-button :disabled="isSalvando" size="lg" variant="primary" @click="ok()">
               <span v-if="!isSalvando">Salvar</span>
               <div v-else>
                  <b-spinner small></b-spinner>
                  <span class="ml-1">Salvando...</span>
               </div>
            </b-button>
         </template>
      </b-modal>
   </b-overlay>
</template>

<script>
import client from '@/api'

export default {
   name: 'SiloParametros',
   data() {
      return {
         buscandoParametros: false,
         parametros: [],
         idSilo: null,
         objPrograma: {},
         camposProgramas: {},
         programaSelecionado: '',
         isSalvando: false,
         tituloModal: '',
         optionsBoolean: [
            { value: 'Sim', text: 'Sim' },
            { value: 'Não', text: 'Não' }
         ],
         optionsPPL6: [
            { value: 'Média', text: 'Média' },
            { value: 'Máxima', text: 'Máxima' }
         ]
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

      this.buscarParametros()
   },

   methods: {
      async buscarParametros() {
         if (!this.idSilo) {
            return
         }
         this.buscandoParametros = true
         const dados = await client.get(`/silo/buscarparametros/${this.idSilo}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar parâmetros. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoParametros = false
         })
         this.buscandoParametros = false
         if (dados && dados.data) {
            this.parametros = dados.data
         }
         const data = this.$moment(this.parametros?.DAT, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
         this.$emit('recebeData', data)
      },
      handleWheelScroll(event) {
         const scrollContainer = this.$refs.scrollContainer
         scrollContainer.scrollLeft += event.deltaY
         event.stopPropagation()
      },
      editar(programa) {
         const parametrosPrograma = Object.entries(this.parametros[programa]).reduce((acc, [key, value]) => {
            acc[key] = value == '-' ? '' : value
            return acc
         }, {})
         this.objPrograma = parametrosPrograma
         this.programaSelecionado = programa
         const programas = {
            PPL: 'programa livre',
            PPC: 'programa conservação',
            PPS: 'programa secagem',
            PPR: 'programa resfriamento'
         }
         this.camposProgramas = {
            PPL: {
               1: ['Umidade máxima', 'input'],
               2: ['Umidade mínima', 'input'],
               3: ['Temperatura máxima', 'input'],
               4: ['Temperatura mínima', 'input'],
               5: ['Limite horas diárias', 'input'],
               6: ['Controle por temperatura', 'select', this.optionsPPL6]
            },
            PPC: {
               1: ['Umidade pretendida no grão', 'input'],
               2: ['Diferencial de temperatura', 'input'],
               3: ['Temperatura pretendida no grão', 'input'],
               4: ['Modo resfriamento', 'select', this.optionsBoolean],
               5: ['Sugere utilizar resfriamento', 'select', this.optionsBoolean],
               6: ['Temperatura fora conservação', 'select', this.optionsBoolean]
            },
            PPS: {
               1: ['Umidade topo', 'input'],
               2: ['Umidade base', 'input'],
               3: ['Umidade pretendida', 'input'],
               4: ['Tempo nova amostra', 'input'],
               5: ['Tempo restante nova amostra', 'input']
            },
            PPR: {
               1: ['Umidade topo', 'input'],
               2: ['Umidade base', 'input'],
               3: ['Umidade pretendida no grão', 'input'],
               4: ['Diferencial de temperatura', 'input'],
               5: ['Temperatura pretendida no grão', 'input']
            }
         }
         this.tituloModal = `Editar ${programas[programa]}`
         this.$bvModal.show('cadastro')
      },
      resetModal() {}
   }
}
</script>

<style scoped>
.ativo {
   border: 3px solid #007bff;
}

.overlay {
   z-index: 0;
}

::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}
</style>