<template>
   <b-modal id="cadastro-conexao" :title="tituloModal" @ok="salvarConexao" @cancel="resetModal" ok-title="Salvar" cancel-title="Cancelar">
      <form>
         <b-form-group label="Nome da Conexão">
            <b-form-input maxlength="255" v-model="objNovaConexaoLocal.nm_conexao" :state="validate('nm_conexao')"></b-form-input>
            <b-form-invalid-feedback id="nm_conexao">{{ erros['nm_conexao'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Pre-shared Key">
            <b-form-input maxlength="255" v-model="objNovaConexaoLocal.chave_compartilhada" :state="validate('chave_compartilhada')"></b-form-input>
            <b-form-invalid-feedback id="chave_compartilhada">{{ erros['chave_compartilhada'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="IP">
            <b-form-input maxlength="15" v-model="objNovaConexaoLocal.ip" :state="validate('ip')"></b-form-input>
            <b-form-invalid-feedback id="ip">{{ erros['ip'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Porta">
            <b-form-input type="number" v-model="objNovaConexaoLocal.porta" :state="validate('porta')"></b-form-input>
            <b-form-invalid-feedback id="porta">{{ erros['porta'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Usuário">
            <b-form-input v-model="objNovaConexaoLocal.usuario" :state="validate('usuario')"></b-form-input>
            <b-form-invalid-feedback id="usuario">{{ erros['usuario'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Senha">
            <b-input-group>
               <b-form-input :type="mostrarSenha ? 'text' : 'password'" v-model="objNovaConexaoLocal.senha" :state="validate('senha')"></b-form-input>
               <b-input-group-prepend>
                  <b-button @click="mostrarSenha = !mostrarSenha" type="button">
                     <b-icon-eye-fill v-if="!mostrarSenha"></b-icon-eye-fill>
                     <b-icon-eye-slash-fill v-else></b-icon-eye-slash-fill>
                  </b-button>
               </b-input-group-prepend>
               <b-form-invalid-feedback id="senha">{{ erros['senha'] | parseErros }}</b-form-invalid-feedback>
            </b-input-group>
         </b-form-group>
         <b-form-group label="Protocolo">
            <b-form-input v-model="objNovaConexaoLocal.protocolo" :state="validate('protocolo')"></b-form-input>
            <b-form-invalid-feedback id="protocolo">{{ erros['protocolo'] | parseErros }}</b-form-invalid-feedback>
         </b-form-group>
         <b-form-group label="Equipamento" v-if="!objNovaConexaoLocal.id_estrutura_pessoa">
            <b-overlay :show="overlayEquipamentos" rounded="sm">
               <v-select v-model="objNovaConexaoLocal.id_equipamento" :options="optionsEquipamentos" :state="validate('id_equipamento')" :reduce="(equipamento) => equipamento.value" :class="{ 'border-danger': validate('id_equipamento') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_equipamento'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
         <b-form-group label="Estrutura" v-if="!objNovaConexaoLocal.id_equipamento">
            <b-overlay :show="overlayEstruturas" rounded="sm">
               <v-select v-model="objNovaConexaoLocal.id_estrutura_pessoa" :options="optionsEstruturas" :state="validate('id_estrutura_pessoa')" :reduce="(estrutura) => estrutura.value" :class="{ 'border-danger': validate('id_estrutura_pessoa') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['id_estrutura_pessoa'] | parseErros }}</small>
            </b-overlay>
         </b-form-group>
      </form>
      <template #modal-footer="{ cancel, ok }">
         <b-button size="lg" variant="secondary" @click="cancel()"> Cancelar </b-button>
         <b-button :disabled="isSalvando" size="lg" variant="primary" @click="ok()">
            <span v-if="!isSalvando">Salvar</span>
            <div v-else>
               <b-spinner small></b-spinner>
               <span class="ml-1">Salvando...</span>
            </div>
         </b-button>
      </template>
   </b-modal>
</template>

<script>
import client from '@/api'
import { conexaoService } from '../services'

export default {
   name: 'ModalCadastroConexao',
   props: {
      objNovaConexao: Object,
      tituloModal: String
   },
   data() {
      return {
         overlayEquipamentos: false,
         overlayEstruturas: false,
         equipamento: [],
         estrutura: [],
         isSalvando: false,
         objNovaConexaoLocal: {},
         erros: [],
         mostrarSenha: false
      }
   },

   computed: {
      optionsEquipamentos() {
         if (!this.equipamento.length) {
            return
         }
         return this.equipamento.map((equipamento) => ({
            value: equipamento.id_equipamento,
            label: equipamento.ds_equipamento
         }))
      },
      optionsEstruturas() {
         if (!this.estrutura.length) {
            return
         }
         return this.estrutura.map((estrutura) => ({
            value: estrutura.id_estrutura_pessoa,
            label: estrutura.nm_estrutura_pessoa
         }))
      }
   },

   methods: {
      async salvarConexao(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await conexaoService.salvarConexao(this.objNovaConexaoLocal)
         switch (status) {
            case 200:
               msg = 'Registro editado com sucesso!'
               break
            case 201:
               msg = 'Registro criado com sucesso!'
               break
            case 422:
               msg = 'Por favor corrija os erros apresentados'
               this.erros = data
               break
            default:
               msg = 'Erro desconhecido'
         }
         this.isSalvando = false
         const deuErro = ![201].includes(status) && ![200].includes(status)

         this.erros = deuErro ? data : []

         this.$bvToast.toast(msg, {
            title: 'Resultado da ação',
            variant: deuErro ? 'danger' : 'success',
            autoHideDelay: 5000,
            solid: true,
            toaster: 'b-toaster-bottom-right'
         })

         if (!deuErro) {
            this.$emit('buscar')
            this.$nextTick(() => {
               this.$bvModal.hide('cadastro-conexao')
            })
         }
      },
      resetModal() {
         this.objNovaConexaoLocal = {}
         this.erros = []
      },
      async buscarEquipamentos() {
         this.overlayEquipamentos = true
         const dados = await client.get('/equipamento/buscarequipamento').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEquipamentos = false
         this.equipamento = dados.data
      },
      async buscarEstruturas() {
         this.overlayEstruturas = true
         const dados = await client.get('/estrutura_pessoa/buscarestrutura').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar equipamentos. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayEstruturas = false
         this.estrutura = dados.data
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      }
   },

   watch: {
      objNovaConexao: {
         handler(newVal) {
            this.objNovaConexaoLocal = { ...newVal }
         },
         immediate: true
      }
   },

   filters: {
      parseErros(v) {
         if (!v) return
         return v.join(', ')
      }
   },

   mounted() {
      this.buscarEquipamentos()
      this.buscarEstruturas()
   }
}
</script>

<style>
</style>