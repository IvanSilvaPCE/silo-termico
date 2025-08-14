<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <b-row>
                     <b-col sm="12" md="8" lg="6">
                        <h2>Estação Meteorológica | {{ this.nomeUnidade }}</h2>
                     </b-col>
                     <b-col class="text-right">
                        <b-form-select v-model="tempoAtualizacao" :options="options" size="sm" style="max-width: 190px"></b-form-select>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <estacao-automatica-dados @informacaoPrevisao="receberPrevisao" :tempoAtualizacao="tempoAtualizacao" @informacaoEstacao="receberEstacao"></estacao-automatica-dados>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <estacao-automatica-previsao :previsao="previsao"></estacao-automatica-previsao>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <estacao-automatica-historico :tempoAtualizacao="tempoAtualizacao"></estacao-automatica-historico>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <estacao-automatica-eventos :tempoAtualizacao="tempoAtualizacao" v-if="!this.estacaoAux"></estacao-automatica-eventos>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import EstacaoAutomaticaDados from '../components/EstacaoAutomaticaDados.vue'
import EstacaoAutomaticaPrevisao from '../components/EstacaoAutomaticaPrevisao.vue'
import EstacaoAutomaticaHistorico from '../components/EstacaoAutomaticaHistorico.vue'
import EstacaoAutomaticaEventos from '../components/EstacaoAutomaticaEventos.vue'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'EstacaoAutomaticaView',
   components: {
      EstacaoAutomaticaDados,
      EstacaoAutomaticaPrevisao,
      EstacaoAutomaticaHistorico,
      EstacaoAutomaticaEventos
   },
   data() {
      return {
         previsao: '',
         tempoAtualizacao: null,
         estacaoAux: false,
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
      receberPrevisao(info) {
         this.previsao = info
      },
      receberEstacao(estacao) {
         this.estacaoAux = estacao
      }
   }
}
</script>

<style>
</style>