<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Equipamentos</h2>
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
            <b-tab lazy title="Equipamentos" active class="margem">
               <cadastro-equipamento></cadastro-equipamento>
            </b-tab>
            <b-tab lazy title="Categorias" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-categoria></cadastro-categoria>
            </b-tab>
            <b-tab lazy title="Conexões" class="margem">
               <cadastro-conexao></cadastro-conexao>
            </b-tab>
            <b-tab lazy title="Equipamentos Componentes" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-equipamento-componente></cadastro-equipamento-componente>
            </b-tab>
            <b-tab lazy title="Componentes Versões" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-componente-versao></cadastro-componente-versao>
            </b-tab>
            <b-tab lazy title="Equipamentos Arquivos" v-if="verificarPerfilOperacao(['ADMINPORTA'])" class="margem">
               <cadastro-equipamento-arquivo></cadastro-equipamento-arquivo>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Equipamentos:</strong> São os equipamentos que as pessoas possuem. É composto por categoria e conexão.</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Categorias:</strong> São as categorias que os equipamentos possuem.</p>
         <p><strong class="">Conexões:</strong> São as conexões que os equipamentos possuem.</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Equipamentos Componentes:</strong> São os detalhes dos componentes que os equipamentos possuem.</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Componentes Versões:</strong> São as versões dos componentes que os equipamentos possuem.</p>
         <p v-if="verificarPerfilOperacao(['ADMINPORTA'])"><strong class="">Equipamentos Arquivos:</strong> São os arquivos de certificados que os equipamentos master possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import { verificarPerfilOperacao } from '@/utils'
import CadastroEquipamento from '../components/CadastroEquipamento.vue'
import CadastroCategoria from '../components/CadastroCategoria.vue'
import CadastroConexao from '../components/CadastroConexao.vue'
import CadastroEquipamentoComponente from '../components/CadastroEquipamentoComponente.vue'
import CadastroComponenteVersao from '../components/CadastroComponenteVersao.vue'
import CadastroEquipamentoArquivo from '../components/CadastroEquipamentoArquivo.vue'

export default {
   name: 'EquipamentosView',
   components: {
      CadastroEquipamento,
      CadastroCategoria,
      CadastroConexao,
      CadastroEquipamentoComponente,
      CadastroComponenteVersao,
      CadastroEquipamentoArquivo
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