<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <b-row>
                     <b-col sm="12" md="8" lg="6">
                        <h2>Armazém | {{ this.nomeUnidade }}</h2>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <armazem-dados ref="dadoRef" @receberCelula="enviaCelula" @dadosArco="enviaDados" @dadosEstacao="enviaEstacao"></armazem-dados>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <armazem-abas ref="abaRef"></armazem-abas>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import ArmazemDados from '../components/ArmazemDados.vue'
import ArmazemAbas from '../components/ArmazemAbas.vue'
import { mapState, mapActions } from 'vuex'

export default {
   name: 'ArmazemView',
   components: {
      ArmazemDados,
      ArmazemAbas
   },
   data() {
      return {
         idArmazem: 'null'
      }
   },

   computed: {
      ...mapState('unidade', ['unidade', 'nomeUnidade'])
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade', 'retrieveNomeUnidade']),
      enviaArco(arco) {
         this.$refs.dadoRef.selecionaCelula(arco > 4 ? 2 : 1)
         this.$refs.dadoRef.selecionaArco(arco)
      },
      enviaDados(dadosArco) {
         this.$refs.abaRef.recebeDadosArco(dadosArco)
      },
      enviaEstacao(dadosEstacao) {
         this.$refs.abaRef.recebeDadosEstacao(dadosEstacao)
      },
      enviaCelula(celula) {
         this.$refs.abaRef.recebeCelula(celula)
      },
      verificaIdArmazem() {
         const idArmazemLocalStorage = localStorage.getItem('arm')
         let idArmazem = null

         if (idArmazemLocalStorage && idArmazemLocalStorage != 'undefined') {
            idArmazem = idArmazemLocalStorage
         } else {
            idArmazem = this.$route.params.idArmazem
         }

         if (!idArmazem) {
            this.$router.push('/')
         }
      }
   },

   mounted() {
      this.verificaIdArmazem()
   },

   watch: {
      idArmazem(newValue) {
         if (newValue != null) {
            localStorage.setItem('arm', this.idArmazem)
            window.location.reload()
         }
      }
   }
}
</script>

<style>
</style>