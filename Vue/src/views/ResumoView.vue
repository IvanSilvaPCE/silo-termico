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
                     <h2 class="text-center text-md-left">Unidade selecionada: {{ secadores.nm_estrutura_pessoa }}</h2>
                  </b-overlay>
               </div>
            </div>
            <div class="map_section padding_infor_info">
               <div class="map m_style1">
                  <resumo-situacao :unidade="unidade" @detalhe-equipamento="detalheEquipamento" :equipamento-selecionado="equipamentoSelecionado"> </resumo-situacao>
               </div>
            </div>
         </div>
      </div>
      <div class="" id="section-2">
         <b-collapse v-model="mostrarTermometria" class="mt-2">
            <resumo-termometria :termometrias="termometrias" :buscandoTermometrias="buscandoTermometrias"></resumo-termometria>
         </b-collapse>
      </div>

      <div class="" id="section-1">
         <b-collapse v-model="mostrarSecador" class="mt-2">
            <resumo-secador :secadores="secadores" :buscandoSecadores="buscandoSecadores"></resumo-secador>
         </b-collapse>
      </div>

      <div class="" id="section-4">
         <b-collapse v-model="mostrarLimpeza" class="mt-2">
            <resumo-limpeza :limpezas="limpezas" :buscandoLimpezas="buscandoLimpezas"></resumo-limpeza>
         </b-collapse>
      </div>

      <div class="" v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])" id="section-5">
         <b-collapse v-model="mostrarControle" class="mt-2">
            <resumo-controle :controles="controles" :buscandoControles="buscandoControles"></resumo-controle>
         </b-collapse>
      </div>

      <resumo-estacao></resumo-estacao>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p>A cor do card é uma forma visual de representar um resumo do estado de operação do equipamento, considerando os dados recebidos pelo Portal PCE DEEPCE. Existem três possíveis estados (cores):</p>
         <div class="d-flex">
            <b-badge class="pr-4 pb-3 mr-1" style="background-color: #28a745">&nbsp;</b-badge>
            <p class="m-0 mr-1">Online</p>
         </div>
         <p class="m-0">Recebendo dados. Funcionamento normal</p>
         <hr />
         <div class="d-flex">
            <b-badge class="pr-4 pb-3 mr-1" style="background-color: #dc3545">&nbsp;</b-badge>
            <p class="m-0 mr-1">Alerta</p>
         </div>
         <p class="m-0">Os dados recebidos indicam alguma condição que merece atenção. Recomendado acessar a página do equipamento para visualizar o que está acontecendo</p>
         <hr />
         <div class="d-flex">
            <b-badge class="pr-4 pb-3 mr-1" style="background-color: #6c757d">&nbsp;</b-badge>
            <p class="m-0 mr-1">Offline</p>
         </div>
         <p class="m-0">Não recebeu dados nos últimos 30 minutos. Pode ocorrer por instabilidade da conexão com a internet no local onde o equipamento está instalado ou o próprio equipamento pode estar desligado</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
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
         buscandoControles: false,

         mostrarEstacao: false,
         mostrarTermometria: false,
         mostrarSecador: false,
         mostrarLimpeza: false,
         mostrarControle: false,
         equipamentoSelecionado: null
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
         if (this.equipamentoSelecionado === categoria) {
            this.equipamentoSelecionado = null
         } else {
            this.equipamentoSelecionado = categoria
         }

         if (categoria === 1) {
            this.mostrarSecador = !this.mostrarSecador
            this.mostrarEstacao = false
            this.mostrarTermometria = false
            this.mostrarLimpeza = false
            this.mostrarControle = false
         } else if (categoria === 4) {
            this.mostrarEstacao = !this.mostrarEstacao
            this.mostrarSecador = false
            this.mostrarTermometria = false
            this.mostrarLimpeza = false
            this.mostrarControle = false
         } else if (categoria === 7) {
            this.mostrarLimpeza = !this.mostrarLimpeza
            this.mostrarEstacao = false
            this.mostrarSecador = false
            this.mostrarTermometria = false
            this.mostrarControle = false
         } else if (categoria === 2 || categoria === 5) {
            this.mostrarTermometria = !this.mostrarTermometria
            this.mostrarEstacao = false
            this.mostrarSecador = false
            this.mostrarLimpeza = false
            this.mostrarControle = false
         } else if (categoria === 8) {
            this.mostrarControle = !this.mostrarControle
            this.mostrarEstacao = false
            this.mostrarSecador = false
            this.mostrarTermometria = false
            this.mostrarLimpeza = false
         }

         // let mobile = window.innerWidth < 1200;
         // let scrollTarget = mobile ? 650 : 400;

         // let scrollAtual = window.scrollY;
         // let novoScroll = scrollAtual + scrollTarget;

         // setTimeout(() => {
         //    window.scrollTo({ top: novoScroll, behavior: 'smooth' });
         // }, 800);
      },
      verificarPerfilOperacao
   },

   mounted() {
      this.retrieveUser()
      localStorage.removeItem('lim')
      localStorage.removeItem('sec')
      localStorage.removeItem('arm')
      localStorage.removeItem('sil')
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

@media (min-width: 576px) {
   .text-md-start {
      text-align: left !important;
   }
}
</style>