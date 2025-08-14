<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <b-row>
                     <b-col sm="12" md="8" lg="6">
                        <h2>Máquina de Limpeza | {{ this.nomeUnidade }}</h2>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>

         <div class="row column1">
            <div class="col-lg-12">
               <limpeza-dados></limpeza-dados>
            </div>
         </div>
         <div class="row column1">
            <div class="col-lg-12">
               <limpeza-eventos></limpeza-eventos>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import LimpezaDados from '../components/LimpezaDados.vue'
import LimpezaEventos from '../components/LimpezaEventos.vue'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'LimpezaView',
   components: {
      LimpezaDados,
      LimpezaEventos
   },
   data() {
      return {}
   },

   computed: {
      ...mapState('unidade', ['unidade', 'nomeUnidade'])
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade', 'retrieveNomeUnidade']),
      verificaIdLimpeza() {
         const idLimpezaLocalStorage = localStorage.getItem('lim')
         let idLimpeza = null

         if (idLimpezaLocalStorage && idLimpezaLocalStorage != 'undefined') {
            idLimpeza = idLimpezaLocalStorage
         } else {
            idLimpeza = this.$route.params.idLimpeza
         }

         if (!idLimpeza) {
            this.$router.push('/')
         }
      }
   },

   mounted() {
      this.verificaIdLimpeza()
   }
}
</script>

<style>
</style>