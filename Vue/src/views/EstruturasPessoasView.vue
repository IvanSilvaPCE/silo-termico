<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Estruturas de Pessoas</h2>
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
            <b-tab title="Estruturas" active class="margem">
               <cadastro-estrutura-pessoa></cadastro-estrutura-pessoa>
            </b-tab>
            <b-tab lazy title="Estruturas Equipamentos" class="margem">
               <cadastro-estrutura-pessoa-equipamento></cadastro-estrutura-pessoa-equipamento>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Estruturas:</strong> São as estruturas que as pessoas possuem. Uma estrutura é equivalente a estrutura de uma unidade.</p>
         <p><strong class="">Estruturas Equipamentos:</strong> São os equipamentos que as estruturas possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import CadastroEstruturaPessoa from '../components/CadastroEstruturaPessoa.vue'
import CadastroEstruturaPessoaEquipamento from '../components/CadastroEstruturaPessoaEquipamento.vue'

export default {
   name: 'EstruturasPessoasView',
   components: {
      CadastroEstruturaPessoa,
      CadastroEstruturaPessoaEquipamento
   },

   methods: {
      ajuda() {
         this.$bvModal.show('ajuda')
      }
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