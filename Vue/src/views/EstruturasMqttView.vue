<template>
   <div>
      <div class="row column_title">
         <div class="col-md-12">
            <div class="page_title">
               <b-row>
                  <b-col>
                     <h2>Estruturas MQTT</h2>
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
               <cadastro-estrutura-mqtt></cadastro-estrutura-mqtt>
            </b-tab>
            <b-tab lazy title="Tempos" class="margem">
               <cadastro-estrutura-mqtt-atu></cadastro-estrutura-mqtt-atu>
            </b-tab>
            <b-tab lazy title="Tópicos" class="margem">
               <cadastro-estrutura-mqtt-topico></cadastro-estrutura-mqtt-topico>
            </b-tab>
            <b-tab lazy title="Variáveis" class="margem">
               <cadastro-estrutura-mqtt-variavel></cadastro-estrutura-mqtt-variavel>
            </b-tab>
         </b-tabs>
      </b-card>
      <b-modal id="ajuda" title="Ajuda" size="xl">
         <p><strong class="">Estruturas:</strong> São as estruturas MQTT que os produtos possuem.</p>
         <p><strong class="">Tempos:</strong> São os tempos de atualização que os tópicos possuem.</p>
         <p><strong class="">Tópicos:</strong> São os tópicos que as estruturas MQTT possuem.</p>
         <p><strong class="">Variáveis:</strong> São as variáveis que os tópicos possuem.</p>
         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import CadastroEstruturaMqtt from '../components/CadastroEstruturaMqtt.vue'
import CadastroEstruturaMqttAtu from '../components/CadastroEstruturaMqttAtu.vue'
import CadastroEstruturaMqttTopico from '../components/CadastroEstruturaMqttTopico.vue'
import CadastroEstruturaMqttVariavel from '../components/CadastroEstruturaMqttVariavel.vue'

export default {
   name: 'EstruturasMqttView',
   components: {
      CadastroEstruturaMqtt,
      CadastroEstruturaMqttAtu,
      CadastroEstruturaMqttTopico,
      CadastroEstruturaMqttVariavel
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