<template>
   <div>
      <router-view v-if="$route.path.includes('/cadastros/')"></router-view>
      <div v-else class="midde_cont">
         <div class="container-fluid">
            <div class="row column_title">
               <div class="col-md-12">
                  <div class="page_title">
                     <b-row>
                        <b-col>
                           <h2>Cadastros de registros</h2>
                        </b-col>
                        <b-col class="text-right">
                           <div @click="ajuda" class="mouse"><b-icon-question-circle scale="2"></b-icon-question-circle></div>
                        </b-col>
                     </b-row>
                  </div>
               </div>
            </div>
            <b-row>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA'])">
                  <router-link :to="{ name: 'alarmes' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-warning green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Alarmes</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA'])">
                  <router-link :to="{ name: 'componentes' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-list-alt green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Componentes</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA'])">
                  <router-link :to="{ name: 'cidades' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-map-marker green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Cidades</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA', 'ADMINFABRI'])">
                  <router-link :to="{ name: 'equipamentos' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-calculator green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Equipamentos</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA'])">
                  <router-link :to="{ name: 'estruturas_mqtt' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-rss green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Estruturas MQTT</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA', 'ADMINFABRI'])">
                  <router-link :to="{ name: 'estruturas_pessoas' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-sitemap green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Estruturas Pessoas</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA', 'ADMINFABRI'])">
                  <router-link :to="{ name: 'pessoas' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-street-view green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Pessoas</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA'])">
                  <router-link :to="{ name: 'produtos' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-tablet green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Produtos</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
               <div class="col-md-6 col-lg-3 mt-2 mb-2" v-if="verificarPerfilOperacao(['ADMINPORTA', 'ADMINFABRI'])">
                  <router-link :to="{ name: 'usuarios' }">
                     <div class="full counter_section">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-users green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Usuários</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
            </b-row>
         </div>
      </div>
      <b-modal id="ajuda-cadastro" title="Ajuda" size="xl">
         <div id="accordionExample" class="accordion shadow-md mb-5">
            <div class="card">
               <div id="headingAlarmes" class="card-header bg-white shadow-sm border-0 page-title">
                  <h5 class="mb-0 font-weight-bold"><a href="#" data-toggle="collapse" data-target="#collapseAlarmes" aria-expanded="false" aria-controls="collapseAlarmes" class="d-block position-relative collapsed text-dark collapsible-link py-2">Cadastrar unidade</a></h5>
               </div>
               <div id="collapseAlarmes" aria-labelledby="headingAlarmes" data-parent="#accordionExample" class="collapse">
                  <div class="card-body">
                     <p>É chamada de unidade ou estrutura o local que possui equipamentos (silo, estação meteorológica, secador, etc.)</p>
                     <p>O primeiro passo para cadastrar uma unidade é cadastrar a pessoa (física ou jurídica) a qual a unidade pertence. Isso é feito no menu <router-link :to="{ name: 'pessoas' }" target="_blank">Pessoas</router-link></p>
                     <p>O segundo passo é cadastrar os equipamentos que a pessoa possui, no menu <router-link :to="{ name: 'equipamentos' }" target="_blank">Equipamentos</router-link></p>
                     <p>O terceiro passo é cadastrar a unidade e associar a pessoa, no menu <router-link :to="{ name: 'estruturas_pessoas' }" target="_blank">Estruturas Pessoas</router-link></p>
                     <p>O último passo é associar os equipamentos a unidade também no menu <router-link :to="{ name: 'estruturas_pessoas' }" target="_blank">Estruturas Pessoas</router-link></p>
                  </div>
               </div>
            </div>
         </div>

         <template #modal-footer="{ ok }">
            <b-button size="lg" variant="primary" @click="ok()"> Entendi </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'CadastrosView',
   methods: {
      verificarPerfilOperacao,
      ajuda() {
         this.$bvModal.show('ajuda-cadastro')
      }
   }
}
</script>

<style scoped>
.mouse {
   cursor: pointer;
}
.card {
   border: none;
}
.card-header {
   border-top: 1px solid #ddddddce !important;
   background-color: #f7f7f7ce !important;
}
.collapsible-link::before {
   content: '';
   width: 14px;
   height: 2px;
   background: #333;
   position: absolute;
   top: calc(50% - 1px);
   right: 1rem;
   display: block;
   transition: all 0.3s;
}
.collapsible-link::after {
   content: '';
   width: 2px;
   height: 14px;
   background: #333;
   position: absolute;
   top: calc(50% - 7px);
   right: calc(1rem + 6px);
   display: block;
   transition: all 0.3s;
}

.collapsible-link[aria-expanded='true']::after {
   transform: rotate(90deg) translateX(-1px);
}

.collapsible-link[aria-expanded='true']::before {
   transform: rotate(180deg);
}
</style>