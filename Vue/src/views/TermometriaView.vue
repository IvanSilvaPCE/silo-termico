<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <b-row>
                     <b-col sm="12" md="8" lg="6">
                        <h2>Termometria | {{ this.nomeUnidade }}</h2>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <termometria-dados></termometria-dados>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <termometria-eventos></termometria-eventos>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import TermometriaDados from '../components/TermometriaDados.vue'
import TermometriaEventos from '../components/TermometriaEventos.vue'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'TermometriaView',
   components: {
      TermometriaDados,
      TermometriaEventos
   },
   data() {
      return {}
   },

   computed: {
      ...mapState('unidade', ['unidade', 'nomeUnidade'])
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade', 'retrieveNomeUnidade'])
   },

   mounted() {
      this.retrieveNomeUnidade()
   }
}
</script>

<style>
</style>
