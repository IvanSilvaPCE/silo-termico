<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Lotes</h2>
                  </b-col>
               </b-row>
            </div>
         </div>
      </div>
      <b-card no-body>
         <b-tabs card>
            <b-tab lazy title="Origem" active class="margem">
               <cadastro-lote-origem></cadastro-lote-origem>
            </b-tab>
            <b-tab lazy title="Destino" class="margem">
               <cadastro-lote-destino></cadastro-lote-destino>
            </b-tab>
         </b-tabs>
      </b-card>
   </div>
</template>

<script>
import CadastroLoteOrigem from '../components/CadastroLoteOrigem.vue'
import CadastroLoteDestino from '../components/CadastroLoteDestino.vue'

export default {
   name: 'LotesView',
   components: {
      CadastroLoteOrigem,
      CadastroLoteDestino
   },
   data() {
      return {
         idSecador: null
      }
   },

   mounted() {
      const idSecadorLocalStorage = localStorage.getItem('sec')

      if (idSecadorLocalStorage && idSecadorLocalStorage != 'undefined') {
         this.idSecador = idSecadorLocalStorage
      } else {
         this.$router.push('/')
      }
   }
}
</script>

<style scoped>
.margem {
   padding: 0px;
   margin: -15px;
}
</style>