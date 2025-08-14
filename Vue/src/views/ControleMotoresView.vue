<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <b-row>
                     <b-col sm="12" md="8" lg="6">
                        <h2>Controle de Motores | {{ this.nomeUnidade }}</h2>
                     </b-col>
                     <b-col class="text-right">
                        <b-form-select v-model="tempoAtualizacao" :options="options" size="sm" style="max-width: 190px"></b-form-select>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>

         <div class="row column1">
            <div class="col-lg-12">
               <controle-motores-dados :tempoAtualizacao="tempoAtualizacao" ref="controleDados"></controle-motores-dados>
            </div>
            <div class="col-lg-12">
               <controle-motores-abas :tempoAtualizacao="tempoAtualizacao" @informacaoAtualizada="atualizarInformacao"></controle-motores-abas>
            </div>
            <div class="col-lg-12">
               <controle-motores-eventos :tempoAtualizacao="tempoAtualizacao"></controle-motores-eventos>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import ControleMotoresDados from '../components/ControleMotoresDados.vue'
import ControleMotoresAbas from '../components/ControleMotoresAbas.vue'
import ControleMotoresEventos from '../components/ControleMotoresEventos.vue'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'MotoresView',
   components: {
      ControleMotoresDados,
      ControleMotoresAbas,
      ControleMotoresEventos
   },
   data() {
      return {
         tempoAtualizacao: null,
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
      verificaIdControle() {
         const idControleLocalStorage = localStorage.getItem('con')
         let idControle = null

         if (idControleLocalStorage && idControleLocalStorage != 'undefined') {
            idControle = idControleLocalStorage
         } else {
            idControle = this.$route.params.idControle
         }

         if (!idControle) {
            this.$router.push('/')
         }
      },
      atualizarInformacao(info) {
         if (info == true) {
            this.$refs.controleDados.buscarDados()
         }
      }
   },

   mounted() {
      this.verificaIdControle()
      this.retrieveNomeUnidade()
   }
}
</script>

<style>
</style>