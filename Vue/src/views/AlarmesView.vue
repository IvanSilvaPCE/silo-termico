<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Alarmes</h2>
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
            <b-tab title="Alarmes" active class="margem">
               <cadastro-alarme></cadastro-alarme>
            </b-tab>
            <b-tab lazy title="Riscos" class="margem">
               <cadastro-risco></cadastro-risco>
            </b-tab>
            <b-tab lazy title="Tipos" class="margem">
               <cadastro-tipo-alarme></cadastro-tipo-alarme>
            </b-tab>
            <b-tab lazy title="Causas" class="margem">
               <cadastro-causa></cadastro-causa>
            </b-tab>
            <b-tab lazy title="Grupos" class="margem">
               <cadastro-grupo></cadastro-grupo>
            </b-tab>
            <b-tab lazy title="Produtos Alarmes" class="margem">
               <cadastro-produto-alarme></cadastro-produto-alarme>
            </b-tab>
            <b-tab lazy title="Componentes Alarmes" class="margem">
               <cadastro-componente-alarme></cadastro-componente-alarme>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Alarmes:</strong> São os alarmes que o equipamento ou componente possui. É composto por risco, tipo, causa e grupo.</p>
         <p><strong class="">Riscos:</strong> São os riscos que os alarmes possuem.</p>
         <p><strong class="">Tipos:</strong> São os tipos que os alarmes possuem.</p>
         <p><strong class="">Causas:</strong> São as causas que os alarmes possuem.</p>
         <p><strong class="">Grupos:</strong> São os grupos que os alarmes possuem.</p>
         <p><strong class="">Produtos Alarmes:</strong> São os alarmes que os produtos possuem. Após cadastrar os alarmes deve ser feita a associação entre os alarmes e o produto.</p>
         <p><strong class="">Componentes Alarmes:</strong> São os alarmes que os componentes possuem. Após cadastrar os alarmes deve ser feita a associação entre os alarmes e o componente se possuir alarmes.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import CadastroAlarme from '../components/CadastroAlarme.vue'
import CadastroRisco from '../components/CadastroRisco.vue'
import CadastroTipoAlarme from '../components/CadastroTipoAlarme.vue'
import CadastroCausa from '../components/CadastroCausa.vue'
import CadastroGrupo from '../components/CadastroGrupo.vue'
import CadastroProdutoAlarme from '../components/CadastroProdutoAlarme.vue'
import CadastroComponenteAlarme from '../components/CadastroComponenteAlarme.vue'

export default {
   name: 'AlarmesView',
   components: {
      CadastroAlarme,
      CadastroRisco,
      CadastroTipoAlarme,
      CadastroCausa,
      CadastroGrupo,
      CadastroProdutoAlarme,
      CadastroComponenteAlarme
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