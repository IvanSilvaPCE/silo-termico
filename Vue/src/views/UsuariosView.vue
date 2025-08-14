<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Usuários</h2>
                  </b-col>
                  <b-col class="text-right">
                     <div @click="ajuda" class="mouse"><b-icon-question-circle scale="2"></b-icon-question-circle></div>
                  </b-col>
               </b-row>
            </div>
         </div>
      </div>
      <b-card no-body>
         <b-tabs card>
            <b-tab title="Usuários" active class="margem">
               <cadastro-usuario></cadastro-usuario>
            </b-tab>
            <b-tab lazy title="Usuários Perfis" active class="margem">
               <cadastro-usuario-perfil></cadastro-usuario-perfil>
            </b-tab>
            <b-tab lazy title="Usuários Equipamentos" active class="margem">
               <cadastro-usuario-equipamento></cadastro-usuario-equipamento>
            </b-tab>
            <b-tab lazy title="Transações" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-transacao></cadastro-transacao>
            </b-tab>
            <b-tab lazy title="Transações Operações" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-transacao-operacao></cadastro-transacao-operacao>
            </b-tab>
            <b-tab lazy title="Perfis" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-perfil></cadastro-perfil>
            </b-tab>
            <b-tab lazy title="Perfis Permissões" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-perfil-permissao></cadastro-perfil-permissao>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Usuários:</strong> São os usuários do portal.</p>
         <p><strong class="">Usuários Perfis:</strong> São os perfis que os usuários possuem.</p>
         <p><strong class="">Usuários Equipamentos:</strong> São as restrições de acesso dos usuários(por empresa e equipamentos da empresa).</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Transações:</strong> São as transações(telas) que as transações operações possuem.</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Transações Operações:</strong> São as operações das transações(funções que a tela possui).</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Perfis:</strong> São os perfis que os perfis permissões possuem.</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Perfis Permissões:</strong> São as permissões que os perfis possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import { verificarPerfilOperacao } from '@/utils'
import CadastroUsuario from '../components/CadastroUsuario.vue'
import CadastroUsuarioPerfil from '../components/CadastroUsuarioPerfil.vue'
import CadastroUsuarioEquipamento from '../components/CadastroUsuarioEquipamento.vue'
import CadastroTransacao from '../components/CadastroTransacao.vue'
import CadastroTransacaoOperacao from '../components/CadastroTransacaoOperacao.vue'
import CadastroPerfil from '../components/CadastroPerfil.vue'
import CadastroPerfilPermissao from '../components/CadastroPerfilPermissao.vue'

export default {
   name: 'EquipamentosView',
   components: {
      CadastroUsuario,
      CadastroUsuarioPerfil,
      CadastroUsuarioEquipamento,
      CadastroTransacao,
      CadastroTransacaoOperacao,
      CadastroPerfil,
      CadastroPerfilPermissao
   },

   methods: {
      ajuda() {
         this.$bvModal.show('ajuda')
      },
      verificarPerfilOperacao
   }
}
</script>

<style scoped>
.mouse {
   cursor: pointer;
}

.margem {
   padding: 0px;
   margin: -15px;
}
</style>