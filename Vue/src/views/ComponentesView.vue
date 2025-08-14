<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Componentes</h2>
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
            <b-tab title="Componentes" active class="margem">
               <cadastro-componente></cadastro-componente>
            </b-tab>
            <b-tab lazy title="Tipos" class="margem">
               <cadastro-tipo-componente></cadastro-tipo-componente>
            </b-tab>
            <b-tab lazy title="Marcas" class="margem">
               <cadastro-marca></cadastro-marca>
            </b-tab>
            <b-tab lazy title="Modelos" class="margem">
               <cadastro-modelo></cadastro-modelo>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Componente:</strong> São os componentes que o produto possui. É composto por um modelo de componente.</p>
         <p><strong class="">Tipos:</strong> São os tipos que os modelos possuem.</p>
         <p><strong class="">Marcas:</strong> São as marcas que os modelos possuem.</p>
         <p><strong class="">Modelos:</strong> São os modelos que os componentes possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import CadastroComponente from '../components/CadastroComponente.vue'
import CadastroTipoComponente from '../components/CadastroTipoComponente.vue'
import CadastroMarca from '../components/CadastroMarca.vue'
import CadastroModelo from '../components/CadastroModelo.vue'

export default {
   name: 'ComponentesView',
   components: {
      CadastroComponente,
      CadastroTipoComponente,
      CadastroMarca,
      CadastroModelo
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