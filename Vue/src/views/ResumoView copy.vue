<template>
   <div>
      <div class="midde_cont">
         <div class="container-fluid">
            <div class="row column_title">
               <div class="col-md-12">
                  <div class="page_title">
                     <h2>Resumo da unidade</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="col-md-12">
         <div class="white_shd full margin_bottom_30">
            <div class="full graph_head">
               <div class="heading1 margin_0">
                  <b-overlay :show="buscandoUnidade || buscandoSecadores || buscandoTermometrias" rounded="sm" class="overlay">
                     <h2>Unidade selecionada: {{ secadores.nm_estrutura_pessoa }}</h2>
                     <small>Data: {{ this.$moment().format('DD/MM/YYYY') }}</small>
                  </b-overlay>
               </div>
            </div>
            <div class="map_section padding_infor_info">
               <div class="map m_style1">
                  <p>{{ saudacao }} {{ user?.nm_usuario || 'Usuário' }}, aqui estão as informações dos equipamentos</p>
                  <!-- <p>Clima</p>
                     <p>Secadores</p>
                     <p>Armazenagem</p>
                     <p>Falhas e alertas</p> -->
               </div>
            </div>
         </div>
      </div>

      <resumo-situacao :unidade="unidade" @detalhe-equipamento="detalheEquipamento"></resumo-situacao>
      <resumo-estacao></resumo-estacao>
      <resumo-termometria :termometrias="termometrias" :buscandoTermometrias="buscandoTermometrias"></resumo-termometria>
      <resumo-secador :secadores="secadores" :buscandoSecadores="buscandoSecadores"></resumo-secador>
      <resumo-limpeza :limpezas="limpezas" :buscandoLimpezas="buscandoLimpezas"></resumo-limpeza>
      <resumo-controle v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])" :controles="controles" :buscandoControles="buscandoControles"></resumo-controle>
   </div>
</template>

<script>
import ResumoSituacao from '../components/ResumoSituacao.vue'
import ResumoEstacao from '../components/ResumoEstacao.vue'
import ResumoTermometria from '../components/ResumoTermometria.vue'
import ResumoSecador from '../components/ResumoSecador.vue'
import ResumoLimpeza from '../components/ResumoLimpeza.vue'
import ResumoControle from '../components/ResumoControle.vue'
import { mapState, mapActions } from 'vuex'
import { verificarPerfilOperacao } from '@/utils'
import client from '@/api'

export default {
   name: 'ResumoView',
   components: {
      ResumoSituacao,
      ResumoEstacao,
      ResumoTermometria,
      ResumoSecador,
      ResumoLimpeza,
      ResumoControle
   },
   data() {
      return {
         buscandoUnidade: false,
         buscandoSecadores: false,
         secadores: {},
         buscandoTermometrias: false,
         termometrias: {},
         limpezas: {},
         buscandoLimpezas: false,
         controles: {},
         buscandoControles: false
      }
   },

   computed: {
      ...mapState('user', ['user']),
      ...mapState('unidade', ['unidade']),
      saudacao() {
         const horaAtual = this.$moment().format('HH')
         if (horaAtual >= 5 && horaAtual < 12) {
            return 'Bom dia'
         } else if (horaAtual >= 12 && horaAtual < 18) {
            return 'Boa tarde'
         } else {
            return 'Boa noite'
         }
      }
   },

   methods: {
      ...mapActions('user', ['retrieveUser']),
      ...mapActions('unidade', ['retrieveUnidade', 'saveUnidade']),
      VerificaPerfil() {
         if (!verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL']) && (!this.unidade || this.unidade == '' || this.unidade === undefined)) {
            this.$router.push('/mapa')
         }
         this.buscarUnidade()
      },
      async buscarUnidade() {
         if (this.unidade && this.unidade !== null) {
            this.buscarSecadores()
            this.buscarTermometrias()
            this.buscarMaquinasLimpeza()
            this.buscarControleMotores()
            return
         }
         this.buscandoUnidade = true
         const dados = await client.get('/resumo/busca_unidade').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar unidade. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoUnidade = false
         })
         this.buscandoUnidade = false
         if (dados.data) {
            this.saveUnidade(dados.data)
            this.buscarSecadores()
            this.buscarTermometrias()
            this.buscarMaquinasLimpeza()
            this.buscarControleMotores()
         }
      },
      async buscarSecadores() {
         if (this.unidade == null || this.unidade === undefined || this.unidade == '') {
            return
         }
         this.buscandoSecadores = true
         const dados = await client.get(`/resumo/secadores/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar secadores. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoSecadores = false
         })
         this.buscandoSecadores = false
         if (dados && dados.data) {
            this.secadores = dados.data
         }
      },
      async buscarTermometrias() {
         if (this.unidade == null || this.unidade === undefined || this.unidade == '') {
            return
         }
         this.buscandoTermometrias = true
         const dados = await client.get(`/resumo/termometrias/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar termometrias. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoTermometrias = false
         })
         this.buscandoTermometrias = false
         if (dados && dados.data) {
            this.termometrias = dados.data
         }
      },
      async buscarMaquinasLimpeza() {
         if (this.unidade == null || this.unidade === undefined || this.unidade == '') {
            return
         }
         this.buscandoLimpezas = true
         const dados = await client.get(`/resumo/maquinaslimpeza/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar máquinas de limpeza. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoLimpezas = false
         })
         this.buscandoLimpezas = false
         if (dados && dados.data) {
            this.limpezas = dados.data
         }
      },
      async buscarControleMotores() {
         if (this.unidade == null || this.unidade === undefined || this.unidade == '') {
            return
         }
         this.buscandoControles = true
         const dados = await client.get(`/resumo/ccms/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar CCM. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoControles = false
         })
         this.buscandoControles = false
         if (dados && dados.data) {
            this.controles = dados.data
         }
      },
      detalheEquipamento(categoria) {
         let mobile = window.innerWidth < 1200
         let scrollValues = {
            1: { mobile: 2050, desktop: 1700 },
            2: { mobile: 1350, desktop: 1050 },
            3: { mobile: 1350, desktop: 1050 },
            4: { mobile: 650, desktop: 400 },
            5: { mobile: 1350, desktop: 1050 },
            7: { mobile: 2850, desktop: 2400 }
         }
         if (Object.prototype.hasOwnProperty.call(scrollValues, categoria)) {
            let scrollValue = mobile ? scrollValues[categoria].mobile : scrollValues[categoria].desktop
            window.scrollTo({ top: scrollValue, behavior: 'smooth' })
         }
      },
      verificarPerfilOperacao
   },

   mounted() {
      this.retrieveUser()
   },

   beforeMount() {
      this.retrieveUnidade()
      this.VerificaPerfil()
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
}
</style>