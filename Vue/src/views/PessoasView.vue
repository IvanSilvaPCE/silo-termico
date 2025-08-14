<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Pessoas Físicas e Jurídicas</h2>
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
            <b-tab title="Pessoas" active class="margem">
               <cadastro-pessoa></cadastro-pessoa>
            </b-tab>
            <b-tab lazy title="Contatos" class="margem">
               <cadastro-contato></cadastro-contato>
            </b-tab>
            <b-tab lazy title="Endereços" class="margem">
               <cadastro-endereco></cadastro-endereco>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Pessoas:</strong> São as empresas ou pessoas físicas. É composta por um ou mais endereços e contatos.</p>
         <p><strong class="">Contatos:</strong> São os contatos(funcionários ou responsáveis) que as empresas possuem.</p>
         <p><strong class="">Endereços:</strong> São os endereços que as empresas possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import CadastroPessoa from '../components/CadastroPessoa.vue'
import CadastroContato from '../components/CadastroContato.vue'
import CadastroEndereco from '../components/CadastroEndereco.vue'

export default {
   name: 'PessoasView',
   components: {
      CadastroPessoa,
      CadastroContato,
      CadastroEndereco
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