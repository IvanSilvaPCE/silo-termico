<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Produtos</h2>
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
            <b-tab title="Produtos" active class="margem">
               <cadastro-produto></cadastro-produto>
            </b-tab>
            <b-tab lazy title="Famílias" class="margem">
               <cadastro-familia></cadastro-familia>
            </b-tab>
            <b-tab lazy title="Subfamílias" class="margem">
               <cadastro-subfamilia></cadastro-subfamilia>
            </b-tab>
            <b-tab lazy title="Produtos Componentes" class="margem">
               <cadastro-produto-componente></cadastro-produto-componente>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Produtos:</strong> São os produtos que os equipamentos possuem.</p>
         <p><strong class="">Famílias:</strong> São as famílias que as subfamílias possuem.</p>
         <p><strong class="">Subfamílias:</strong> São as subfamílias que as famílias possuem.</p>
         <p><strong class="">Produtos Componentes:</strong> São os componentes que os produtos possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import CadastroProduto from '../components/CadastroProduto.vue'
import CadastroFamilia from '../components/CadastroFamilia.vue'
import CadastroSubfamilia from '../components/CadastroSubfamilia.vue'
import CadastroProdutoComponente from '../components/CadastroProdutoComponente.vue'

export default {
   name: 'EstruturasPessoasView',
   components: {
      CadastroProduto,
      CadastroFamilia,
      CadastroSubfamilia,
      CadastroProdutoComponente
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