<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <b-row>
                     <b-col sm="12" md="8" lg="6">
                        <h2>Silo | {{ this.nomeUnidade }}</h2>
                     </b-col>
                     <b-col class="text-right" v-if="!buscandoSilos && this.silos?.estrutura_equipamentos?.length > 1">
                        <b-form-select v-model="idSilo" :options="optionsSilos" size="sm" style="max-width: 200px"></b-form-select>
                     </b-col>
                  </b-row>
               </div>
            </div>
         </div>
         <div class="row align-items-center">
            <div class="col-lg-12">
               <silo-dados @alterar-tipo-grafico="alterarTipoGrafico" @receberPendulo="enviarPendulo" @mostrarAeracao="mostrarAeracao"></silo-dados>
            </div>
            <div class="col-lg-12">
               <silo-abas ref="abasRef" :showAeracao="showAeracao"></silo-abas>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import SiloDados from '../components/SiloDados.vue'
import SiloAbas from '../components/SiloAbas.vue'
import { mapState, mapActions } from 'vuex'
import client from '@/api'

export default {
   name: 'SiloView',
   components: {
      SiloDados,
      SiloAbas
   },
   data() {
      return {
         tipoGrafico: 'temperatura',
         buscandoSilos: true,
         silos: {},
         idSilo: 'null',
         showAeracao: null
      }
   },

   computed: {
      ...mapState('unidade', ['unidade', 'nomeUnidade']),
      optionsSilos() {
         const options = [
            {
               value: 'null',
               text: 'Selecionar silo'
            }
         ]
         return options.concat(
            this.silos?.estrutura_equipamentos?.map((estrutura) => ({
               value: estrutura.id_equipamento,
               text: estrutura.ds_equipamento
            }))
         )
      }
   },
   methods: {
      ...mapActions('unidade', ['retrieveUnidade', 'retrieveNomeUnidade']),
      alterarTipoGrafico(tipoGrafico) {
         this.tipoGrafico = tipoGrafico
         this.$refs.abasRef.alterarTipoGrafico(tipoGrafico)
      },
      verificaIdSilo() {
         const idSiloLocalStorage = localStorage.getItem('sil')
         let idSilo = null

         if (idSiloLocalStorage && idSiloLocalStorage != 'undefined') {
            idSilo = idSiloLocalStorage
         } else {
            idSilo = this.$route.params.idSilo
         }

         if (!idSilo) {
            this.$router.push('/')
         }
      },
      async buscarSilos() {
         if (this.unidade == null || this.unidade === undefined || this.unidade == '') {
            return
         }
         this.buscandoSilos = true
         const dados = await client.get(`/silo/buscarsilos/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar silos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoSilos = false
         })
         this.buscandoSilos = false
         if (dados && dados.data) {
            this.silos = dados.data
         }
      },
      enviarPendulo(pendulo) {
         this.$refs.abasRef.enviarPendulo(pendulo)
      },
      mostrarAeracao(valor) {
         this.showAeracao = valor
      }
   },

   mounted() {
      this.verificaIdSilo()
      this.buscarSilos()
      this.retrieveNomeUnidade()
   },

   watch: {
      idSilo(newValue) {
         if (newValue != null) {
            localStorage.setItem('sil', this.idSilo)
            window.location.reload()
         }
      }
   }
}
</script>

<style>
</style>
