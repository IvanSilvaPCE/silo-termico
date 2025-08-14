<template>
   <div>
      <b-row> </b-row>
      <b-row>
         <b-col>
            <b-button-group class="mb-3">
               <b-button variant="outline-info" :class="{ active: filtro === 'S' }" @click="filtro = 'S'" :disabled="isBusy"> Alarmes Assistência </b-button>
               <b-button variant="outline-info" :class="{ active: filtro === 'N' }" @click="filtro = 'N'" :disabled="isBusy"> Todos Alarmes </b-button>
            </b-button-group>
         </b-col>
         <b-col >
            <b-alert variant="warning" show>Visualização exclusiva para assistência técnica</b-alert>
         </b-col>
      </b-row>
      <b-table :items="itemsTotalAlarmes" :fields="fields" :busy="isBusy" :current-page="currentPage" :per-page="perPage" select-mode="single" responsive="sm" sort-by="nm_estrutura_pessoa" hover selectable>
         <template #table-busy>
            <div class="text-center text-danger my-2">
               <b-spinner class="align-middle mr-1"></b-spinner>
               <strong>Carregando...</strong>
            </div>
         </template>
         <template #cell(total_alarmes)="row">
            <b-button :disabled="!row.item.total_alarmes" variant="outline-primary" size="sm" title="Ver Equipamentos" @click="row.toggleDetails()">
               <b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.total_alarmes }}</span>
            </b-button>
         </template>
         <template #row-details="row">
            <b-card>
               <b-row>
                  <b-col md="12">
                     <b-table :fields="fieldsDetalhe" :items="row.item.estrutura_equipamentos">
                        <template #cell(alarmes)="row">
                           <b-button :disabled="!row.item.alarmes" variant="outline-primary" size="sm" title="Ver Equipamentos" @click="info(row.item, row.index, $event.target)">
                              <b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.alarmes.length }}</span>
                           </b-button>
                        </template>
                     </b-table>
                  </b-col>
               </b-row>
            </b-card>
         </template>
      </b-table>
      <p class="text-center" v-if="!this.items.length && !isBusy">Nenhum resultado para listar</p>
      <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="right" class="my-0"></b-pagination>
      <b-modal size="xl" scrollable :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal">
         <b-table :fields="fieldsDetalheAlarme" :items="infoModal.content.alarmes" sort-by="tp_criticidade_alarme" sort-desc>
            <template #cell(tp_criticidade_alarme)="row">
               <b-badge class="p-2" :variant="criticidade(row.item.tp_criticidade_alarme)">{{ formatarCriticidade(row.item.tp_criticidade_alarme) }}</b-badge>
            </template>
            <template #cell(tempo)="row">
               <span>{{ calculaData(row.item.dt_inicio) }}</span>
            </template>
            <template #cell(dt_inicio)="row">
               <span>{{ formatarData(row.item.dt_inicio) }}</span>
            </template>
         </b-table>
         <p class="text-center" v-if="!infoModal.content?.alarmes?.length && !isBusy">Nenhum resultado para listar</p>
      </b-modal>
   </div>
</template>

<script>
import client from '@/api'

export default {
   name: 'AssistenciaAlarmes',
   data() {
      return {
         isBusy: false,
         items: [],
         totalRows: 1,
         currentPage: 1,
         perPage: 15,
         filtro: 'S',
         infoModal: {
            id: 'info-modal',
            title: '',
            content: ''
         },
         fields: [
            { key: 'nm_estrutura_pessoa', label: 'Unidade', sortable: true },
            { key: 'total_alarmes', label: 'Alarmes', sortable: true }
         ],
         fieldsDetalhe: [
            { key: 'ds_equipamento', label: 'Equipamento', sortable: true },
            { key: 'alarmes', label: 'Alarmes', sortable: true }
         ],
         fieldsDetalheAlarme: [
            { key: 'tp_criticidade_alarme', label: 'Criticidade' },
            { key: 'ds_alarme', label: 'Alarme' },
            { key: 'tempo', label: 'Duração' },
            { key: 'dt_inicio', label: 'Início' }
         ]
      }
   },

   computed: {
      itemsTotalAlarmes() {
         return this.items.map((item) => ({
            ...item,
            total_alarmes: item.estrutura_equipamentos.reduce((acc, equipamento) => acc + (equipamento.alarmes ? equipamento.alarmes.length : 0), 0)
         }))
      }
   },

   methods: {
      async buscar() {
         this.isBusy = true
         const dados = await client.get(`/assistencia/alarmes?assistencia=${this.filtro}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar alarmes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.isBusy = false
         this.items = dados.data
         this.totalRows = this.items.length
      },
      info(item, index, button) {
         this.infoModal.title = `Equipamento: ${item.ds_equipamento}`
         this.infoModal.content = item
         this.$root.$emit('bv::show::modal', this.infoModal.id, button)
      },
      resetInfoModal() {
         this.infoModal.title = ''
         this.infoModal.content = ''
      },
      criticidade(value) {
         if (value == 0) return 'info'
         if (value == 10) return 'primary'
         if (value == 25) return 'warning'
         if (value == 50) return 'danger'
      },
      formatarCriticidade(value) {
         if (value == 0) return 'Alerta'
         if (value == 10) return 'Baixo'
         if (value == 25) return 'Alto'
         if (value == 50) return 'Crítico'
         return value
      },
      formatarData(value) {
         if (!value) return '-'
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      },
      calculaData(dataInicio) {
         if (!dataInicio) return ''
         const inicio = this.$moment(dataInicio, 'YYYY/MM/DD HH:mm:ss')
         const agora = this.$moment()
         const duracao = this.$moment.duration(agora.diff(inicio))
         const diasEmHoras = Math.floor(duracao.asDays()) * 24
         const horas = duracao.hours() + diasEmHoras
         const minutos = duracao.minutes()
         return `${horas}h ${minutos}min`
      }
   },

   mounted() {
      this.buscar()
   },

   watch: {
      filtro(newVal) {
         if (newVal) {
            this.buscar()
         }
      }
   }
}
</script>

<style>
</style>