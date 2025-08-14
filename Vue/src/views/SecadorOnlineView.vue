<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <b-row class="align-items-center justify-content-center justify-content-md-start text-center text-md-left">
                     <b-col sm="12" md="8" lg="6">
                        <h2>Secador | {{ this.nomeUnidade }}</h2>
                     </b-col>
                     <b-col class="text-md-right">
                        <b-form-select v-model="tempoAtualizacao" :options="options" size="sm" style="max-width: 190px"></b-form-select>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>
         <div v-if="equipamento?.id_produto == 1">
            <div class="row column1">
               <div class="col-lg-12">
                  <secador-online-dados :tempoAtualizacao="tempoAtualizacao"></secador-online-dados>
               </div>
            </div>
            <div class="row">
               <div class="col-lg-12">
                  <secador-online-eventos :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao"></secador-online-eventos>
               </div>
            </div>
            <div class="row">
               <div class="col-lg-12">
                  <secador-relatorio></secador-relatorio>
               </div>
            </div>
         </div>
         <div v-if="equipamento?.id_produto == 11">
            <secador-horbach :tempoAtualizacao="tempoAtualizacao"></secador-horbach>
         </div>
         <div v-if="equipamento?.id_produto == 15">
            <secador-ads :tempoAtualizacao="tempoAtualizacao"></secador-ads>
         </div>
      </div>
   </div>
</template>

<script>
import SecadorOnlineDados from '../components/SecadorOnlineDados.vue'
import SecadorOnlineEventos from '../components/SecadorOnlineEventos.vue'
import SecadorHorbach from '../components/SecadorHorbach.vue'
import SecadorAds from '../components/SecadorAds.vue'
import SecadorRelatorio from '../components/SecadorRelatorio.vue'
import { mapState, mapActions } from 'vuex'
import client from '@/api'

export default {
   name: 'SecadorOnlineView',
   components: {
      SecadorOnlineDados,
      SecadorOnlineEventos,
      SecadorHorbach,
      SecadorAds,
      SecadorRelatorio
   },
   data() {
      return {
         selecionaGrafico: null,
         filtroGrafico: null,
         tempoAtualizacao: null,
         equipamento: {},
         options: [
            { value: null, text: 'Atualização automática' },
            { value: 30000, text: '30 segundos' },
            { value: 60000, text: '1 minuto' },
            { value: 120000, text: '2 minutos' },
            { value: 300000, text: '5 minutos' }
         ]
      }
   },

   computed: {
      ...mapState('unidade', ['nomeUnidade'])
   },

   methods: {
      ...mapActions('unidade', ['retrieveNomeUnidade']),
      verificaIdSecador() {
         const idSecadorLocalStorage = localStorage.getItem('sec')

         if (idSecadorLocalStorage && idSecadorLocalStorage != 'undefined') {
            this.idSecador = idSecadorLocalStorage
         } else {
            this.idSecador = this.$route.params.idSecador
         }

         if (!this.idSecador) {
            this.$router.push('/')
         }
      },
      async buscarEquipamento() {
         if (!this.idSecador) {
            this.$router.push('/')
         }
         const dados = await client.get(`/equipamento/${this.idSecador}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar secador. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         if (dados && dados.data) {
            this.equipamento = dados.data
         }
      }
   },

   mounted() {
      this.verificaIdSecador()
      this.buscarEquipamento()
      this.retrieveNomeUnidade()
   }
}
</script>

<style>
</style>