<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Cidades</h2>
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
            <b-tab title="Cidades" active class="margem">
               <cadastro-cidade></cadastro-cidade>
            </b-tab>
            <b-tab lazy title="Países" class="margem">
               <cadastro-pais></cadastro-pais>
            </b-tab>
            <b-tab lazy title="UFs" class="margem">
               <cadastro-uf></cadastro-uf>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Cidades:</strong> São as cidades que os endereços de pessoas possuem. É composta por uma UF.</p>
         <p><strong class="">Países:</strong> São os países que as UFs possuem.</p>
         <p><strong class="">UFs:</strong> São as UFs que as cidades possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import CadastroCidade from '../components/CadastroCidade.vue'
import CadastroPais from '../components/CadastroPais.vue'
import CadastroUf from '../components/CadastroUf.vue'

export default {
   name: 'CidadesView',
   components: {
      CadastroCidade,
      CadastroPais,
      CadastroUf
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