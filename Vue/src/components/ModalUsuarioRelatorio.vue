<template>
   <b-modal size="xl" id="modal-media-usuarios">
      <b-table :fields="fields" :items="items" :busy="buscandoMedia" select-mode="single" responsive="sm" hover selectable style="max-height: 55svh">
         <template #table-busy>
            <div class="text-center text-danger my-2">
               <b-spinner class="align-middle mr-1"></b-spinner>
               <strong>Carregando...</strong>
            </div>
         </template>
      </b-table>
      <template #modal-footer="{ ok }">
         <b-button variant="primary" @click="ok()"> Fechar </b-button>
      </template>
   </b-modal>
</template>

<script>
import client from '@/api'

export default {
   name: 'ModalRelatorio',
   props: {
      data: String
   },
   data() {
      return {
         items: [],
         buscandoMedia: false,
         fields: [
            { key: 'created_user', label: 'Usuário' },
            { key: 'tempo_medio', label: 'Média sessão (min)' },
            { key: 'tempo_total', label: 'Tempo Total (min)' }
         ]
      }
   },

   methods: {
      async buscarMediaUsuarios() {
         this.buscandoMedia = true
         const dados = await client.get(`/relatorio/mediausuarios?data=${this.data}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar média de usuários. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoMedia = false
         })
         this.buscandoMedia = false
         this.items = dados.data
      }
   },

   mounted() {
      this.buscarMediaUsuarios()
   },

   watch: {
      data() {
         this.buscarMediaUsuarios()
      }
   }
}
</script>

<style>
</style>