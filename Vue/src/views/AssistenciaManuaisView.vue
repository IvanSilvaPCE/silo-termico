<template>
   <div>
      <div class="white_shd full margin_bottom_30 mt-4">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <h1>Manuais e documentos</h1>
            </div>
         </div>
         <div class="map_section padding_infor_info">
            <b-row>
               <b-col>
                  <b-alert variant="warning" show>funcionalidade disponível somente para administradores temporariamente</b-alert>
               </b-col>
            </b-row>
            <b-row>
               <b-col>
                  <p>Encontre nesta sessão os manuais, guias e documentações técnicas para ajudá-lo a tirar dúvidas, entender funcionalidades e aproveitar ao máximo os recursos do sistema.</p>
                  <p>Utilize a busca para localizar com mais facilidade o conteúdo que você precisa.</p>
               </b-col>
            </b-row>
            <b-row>
               <b-col class="text-center mt-2">
                  <span>Pesquisar por título ou descrição</span>
               </b-col>
            </b-row>
            <b-row class="justify-content-center">
               <b-col sm="12" lg="6">
                  <b-input-group class="mb-2 mt-3">
                     <b-form-input v-model="termoPesquisa" type="search"></b-form-input>
                     <b-input-group-append>
                        <b-button variant="primary" :disabled="!termoPesquisa || pesquisandoManual" @click="pesquisarManual()"><b-icon icon="search" class="mr-1" v-if="!pesquisandoManual"></b-icon><b-spinner small class="mr-1" v-if="pesquisandoManual"></b-spinner>Pesquisar</b-button>
                        <b-button variant="success" @click="criarManual()" v-b-tooltip.hover title="Criar manual" v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])"><b-icon icon="plus-lg"></b-icon></b-button>
                     </b-input-group-append>
                  </b-input-group>
               </b-col>
            </b-row>
            <b-row>
               <b-col>
                  <b-collapse id="collapse-1" class="mt-0 pt-0" :visible="mostrarResultados">
                     <b-card>
                        <p>Resultados: {{ pesquisa.length }}</p>
                        <ul class="list-unstyled">
                           <b-media tag="li" class="mb-3" v-for="(p, index) in pesquisa" :key="index">
                              <template #aside>
                                 <b-icon icon="card-text" scale="1.3" variant="primary" class="mt-1"></b-icon>
                              </template>
                              <b-link @click="detalheManual(p.id_manual)">{{ p.nm_manual }}</b-link>
                              <p class="mb-0">{{ truncateText(p.ds_manual) }}</p>
                              <small>{{ formatarData(p.dt_manual) }}</small>
                           </b-media>
                        </ul>
                     </b-card>
                  </b-collapse>
               </b-col>
            </b-row>
            <b-row>
               <b-col class="text-center mt-3 mb-1">
                  <h1>Índice</h1>
               </b-col>
            </b-row>
            <b-overlay :show="buscandoCategoria" rounded="sm" class="overlay">
               <b-row class="justify-content-center">
                  <b-col sm="12" lg="4" v-for="(column, index) in groupedItems" :key="index" class="text-center">
                     <ul>
                        <li v-for="(item, itemIndex) in column" :key="itemIndex">
                           <b-link v-b-toggle="'collapse-' + itemIndex">{{ item.ds_categoria_manual }}</b-link>
                           <b-collapse :id="`collapse-${itemIndex}`" class="mt-2">
                              <b-card>
                                 <b-row>
                                    <b-col cols="12" v-for="(manual, index) in item.manual" :key="index">
                                       <b-link @click="detalheManual(manual.id_manual)">{{ manual.nm_manual }}</b-link>
                                    </b-col>
                                 </b-row>
                              </b-card>
                           </b-collapse>
                        </li>
                     </ul>
                  </b-col>
               </b-row>
            </b-overlay>
            <b-row>
               <b-col>
                  <h1>Conteúdo mais recente</h1>
               </b-col>
            </b-row>
            <b-overlay :show="buscandoCategoria" rounded="sm" class="overlay">
               <b-row>
                  <b-col>
                     <ul class="list-unstyled">
                        <b-media tag="li" v-for="(recente, index) in recentes" :key="index">
                           <template #aside>
                              <b-icon icon="card-text" scale="1.3" variant="primary" class="mt-1"></b-icon>
                           </template>
                           <b-link @click="detalheManual(recente.id_manual)">{{ recente.nm_manual }}</b-link>
                           <br />
                           <small>{{ formatarData(recente.dt_manual) }}</small>
                        </b-media>
                     </ul>
                  </b-col>
               </b-row>
            </b-overlay>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'AssistenciaManuaisView',
   data() {
      return {
         termoPesquisa: null,
         buscandoCategoria: false,
         buscandoRecente: false,
         pesquisandoManual: false,
         mostrarResultados: false,
         categorias: [],
         recentes: [],
         pesquisa: []
      }
   },

   computed: {
      groupedItems() {
         const groupSize = 6
         const groups = []
         for (let i = 0; i < this.categorias.length; i += groupSize) {
            groups.push(this.categorias.slice(i, i + groupSize))
         }
         return groups
      }
   },
   methods: {
      criarManual() {
         localStorage.removeItem('man')
         this.$router.push({ name: 'criar_manual' })
      },
      detalheManual(manual) {
         localStorage.removeItem('man')
         const idManual = manual
         this.$router.push({ name: 'detalhe_manual', params: { idManual } })
      },
      async buscarCategorias() {
         this.buscandoCategoria = true
         const dados = await client.get(`/categoria_manual/manual`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar categorias. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoCategoria = false
         })
         this.buscandoCategoria = false
         if (dados && dados.data) {
            this.categorias = dados.data
         }
      },
      async buscarRecentes() {
         this.buscandoRecente = true
         const dados = await client.get(`/manual/recente`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar recentes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoRecente = false
         })
         this.buscandoRecente = false
         if (dados && dados.data) {
            this.recentes = dados.data
         }
      },
      async pesquisarManual() {
         this.pesquisandoManual = true
         this.mostrarResultados = false
         const dados = await client.get(`/manual/pesquisar?termo=${this.termoPesquisa}`).catch((err) => {
            this.$bvToast.toast(`Erro ao pesquisar. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.pesquisandoManual = false
            this.mostrarResultados = true
         })
         this.pesquisandoManual = false
         this.mostrarResultados = true
         if (dados && dados.data) {
            this.pesquisa = dados.data
         }
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY')
      },
      truncateText(text) {
         const maxLength = window.innerWidth < 768 ? 100 : 420
         return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
      },
      verificarPerfilOperacao
   },
   mounted() {
      this.buscarCategorias()
      this.buscarRecentes()
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
   min-height: 50px;
}
</style>