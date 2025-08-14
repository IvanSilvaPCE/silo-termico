<template>
   <b-modal size="xl" id="modal-dashboard">
      <b-tabs content-class="mt-3" justified>
         <b-tab title="Acessos Hoje" active>
            <b-table :fields="fieldsAcessos" :items="itemsAcessos" :busy="buscandoAcessos" select-mode="single" responsive="sm" sort-by="id_alarme" hover selectable style="max-height: 60svh">
               <template #table-busy>
                  <div class="text-center text-danger my-2">
                     <b-spinner class="align-middle mr-1"></b-spinner>
                     <strong>Carregando...</strong>
                  </div>
               </template>
               <template #cell(data)="row">
                  <span>{{ formatarData(row.item.data) }}</span>
               </template>
            </b-table>
         </b-tab>
         <b-tab title="Consultar Histórico">
            <b-row>
               <b-col lg="6" class="mb-4">
                  <b-overlay :show="buscandoUsuariosLog" rounded="sm">
                     <v-select v-model="id_usuario" :options="optionsUsuarios" :reduce="(usuario) => usuario.value" @input="buscarLogAcesso(), buscarDatasAcesso()">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-overlay>
               </b-col>
               <b-col lg="4">
                  <b-form-datepicker v-model="data" @input="buscarLogAcesso()" :date-info-fn="marcaDatasAcesso" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-col>
            </b-row>
            <b-row>
               <b-col lg="12">
                  <b-table :fields="fieldsLog" :items="itemsLog" :busy="buscandoLogAcesso" select-mode="single" responsive="sm" sort-by="id_alarme" hover selectable style="max-height: 55svh">
                     <template #table-busy>
                        <div class="text-center text-danger my-2">
                           <b-spinner class="align-middle mr-1"></b-spinner>
                           <strong>Carregando...</strong>
                        </div>
                     </template>
                     <template #cell(id_equipamento)="row">
                        <span>{{ formatarEquipamento(row) }}</span>
                     </template>
                     <template #cell(id_estrutura_pessoa)="row">
                        <span>{{ formatarUnidade(row) }}</span>
                     </template>
                     <template #cell(data)="row">
                        <span>{{ formatarData(row.item.data) }}</span>
                     </template>
                  </b-table>
               </b-col>
            </b-row>
         </b-tab>
         <b-tab title="Relatório">
            <b-row>
               <b-col lg="4" class="mb-4">
                  <v-select v-model="filtro" @input="buscarRelatorio()" :options="optionsFiltro" :reduce="(filtro) => filtro.value">
                     <template #no-options="">Nenhuma correspondência</template>
                  </v-select>
               </b-col>
               <b-col lg="4">
                  <b-form-datepicker v-model="dataInicio" @input="buscarRelatorio()" :min="dataMinima" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-col>
               <b-col lg="4">
                  <b-form-datepicker v-model="dataFim" @input="buscarRelatorio()" :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }" label-help="Use as setas para navegar pelas datas" label-no-date-selected="Nenhuma data selecionada"></b-form-datepicker>
               </b-col>
            </b-row>
            <b-row>
               <b-col>
                  <b-table :fields="fieldsRelatorio" :items="itemsRelatorio" :busy="buscandoRelatorio" select-mode="single" responsive="sm" sort-by="id_alarme" hover selectable style="max-height: 55svh">
                     <template #table-busy>
                        <div class="text-center text-danger my-2">
                           <b-spinner class="align-middle mr-1"></b-spinner>
                           <strong>Carregando...</strong>
                        </div>
                     </template>
                     <template #cell(detalhe)="row">
                        <b-button :disabled="!row.item.log_acessos_count" variant="outline-primary" size="sm" title="Ver Acessos" @click="row.toggleDetails()">
                           <b-icon-eye-fill class="mr-2"></b-icon-eye-fill><span>{{ row.item.log_acessos_count }}</span>
                        </b-button>
                     </template>
                     <template #row-details="row">
                        <b-card>
                           <b-row>
                              <b-col md="12">
                                 <b-table :fields="fieldsDetalhe" :items="row.item.log_acessos">
                                    <template #cell(data)="row">
                                       {{ formatarData(row.item.data) }}
                                    </template>
                                 </b-table>
                              </b-col>
                           </b-row>
                        </b-card>
                     </template>
                  </b-table>
               </b-col>
            </b-row>
         </b-tab>
      </b-tabs>
      <template #modal-footer="{ ok }">
         <b-button variant="primary" @click="ok()"> Fechar </b-button>
      </template>
   </b-modal>
</template>

<script>
import client from '@/api'

export default {
   name: 'ModalDashboard',
   data() {
      return {
         buscandoAcessos: false,
         buscandoUsuariosLog: false,
         buscandoLogAcesso: false,
         buscandoRelatorio: false,
         itemsAcessos: [],
         usuariosLog: [],
         itemsLog: [],
         itemsRelatorio: [],
         datasAcesso: [],
         filtro: 'unidade',
         id_usuario: 'null',
         data: this.$moment().format('YYYY-MM-DD'),
         dataInicio: this.$moment().subtract(15, 'days').format('YYYY-MM-DD'),
         dataFim: this.$moment().format('YYYY-MM-DD'),
         fieldsAcessos: [
            { key: 'created_user', label: 'Usuário' },
            { key: 'data', label: 'Última interação', sortable: true }
         ],
         fieldsLog: [
            { key: 'caminho', label: 'URL' },
            { key: 'nome', label: 'Página' },
            { key: 'id_equipamento', label: 'Equipamento' },
            { key: 'id_estrutura_pessoa', label: 'Unidade' },
            { key: 'data', label: 'Data', sortable: true }
         ],
         fieldsDetalhe: [
            { key: 'caminho', label: 'URL' },
            { key: 'nome', label: 'Página' },
            { key: 'created_user', label: 'Usuário' },
            { key: 'data', label: 'Data', sortable: true }
         ],
         optionsFiltro: [
            { value: 'unidade', label: 'Unidade' },
            { value: 'usuario', label: 'Usuário' }
         ]
      }
   },

   computed: {
      optionsUsuarios() {
         const options = [
            {
               value: 'null',
               label: 'Selecione um usuário'
            }
         ]
         return options.concat(
            this.usuariosLog.map((usuario) => ({
               value: usuario.id_usuario,
               label: usuario.created_user + ' | ' + usuario.usuario.email
            }))
         )
      },
      dataMinima() {
         return this.$moment(this.dataFinal).subtract(30, 'days').format('YYYY-MM-DD')
      },
      fieldsRelatorio() {
         if (this.filtro == 'unidade') {
            return [
               { key: 'id_estrutura_pessoa', label: 'ID' },
               { key: 'nm_estrutura_pessoa', label: 'Unidade' },
               { key: 'detalhe', label: 'Acessos', sortable: true }
            ]
         } else if (this.filtro == 'usuario') {
            return [
               { key: 'id_usuario', label: 'ID' },
               { key: 'nm_usuario', label: 'Usuário' },
               { key: 'detalhe', label: 'Acessos' }
            ]
         }
         return []
      }
   },

   methods: {
      async buscarAcessos() {
         this.buscandoAcessos = true
         const dados = await client.get('/dashboard/acessos').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar acessos de hoje. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoAcessos = false
         })
         this.buscandoAcessos = false
         this.itemsAcessos = dados.data
      },
      async buscarUsuariosLog() {
         this.buscandoUsuariosLog = true
         const dados = await client.get('/dashboard/usuarioslog').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar usuários. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoUsuariosLog = false
         })
         this.buscandoUsuariosLog = false
         this.usuariosLog = dados.data
      },
      async buscarLogAcesso() {
         if (this.id_usuario == 'null') return
         this.buscandoLogAcesso = true
         const dados = await client.get(`/dashboard/logacesso?usuario=${this.id_usuario}&data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar histórico. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLogAcesso = false
         })
         this.buscandoLogAcesso = false
         this.itemsLog = dados.data
      },
      async buscarDatasAcesso() {
         this.datasAcesso = []
         const dados = await client.get(`/dashboard/dataacesso?usuario=${this.id_usuario}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar datas de acesso. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         this.datasAcesso = dados.data
      },
      async buscarRelatorio() {
         this.buscandoRelatorio = true
         const dados = await client.get(`/dashboard/relatorio?filtro=${this.filtro}&inicio=${this.dataInicio}&fim=${this.dataFim}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar relatório. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRelatorio = false
         })
         this.buscandoRelatorio = false
         this.itemsRelatorio = dados.data
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      },
      formatarEquipamento(row) {
         if (!row.item?.equipamento?.id_equipamento) return null
         return row.item.equipamento.id_equipamento + ' - ' + row.item.equipamento.ds_equipamento
      },
      formatarUnidade(row) {
         if (!row.item?.estrutura_pessoa?.id_estrutura_pessoa) return null
         return row.item.estrutura_pessoa.id_estrutura_pessoa + ' - ' + row.item.estrutura_pessoa.nm_estrutura_pessoa
      },
      marcaDatasAcesso(data) {
         const possuiData = this.datasAcesso.includes(data)
         return possuiData ? 'table-primary' : ''
      }
   },

   mounted() {
      this.buscarAcessos()
      this.buscarUsuariosLog()
      this.buscarRelatorio()
   }
}
</script>

<style>
</style>