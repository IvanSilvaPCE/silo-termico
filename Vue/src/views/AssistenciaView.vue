<template>
   <div>
      <router-view v-if="$route.path.includes('/assistencia/')"></router-view>
      <div v-else class="midde_cont">
         <div class="container-fluid">
            <div class="row column_title">
               <div class="col-md-12">
                  <div class="page_title">
                     <b-row>
                        <b-col>
                           <h2>Assistência</h2>
                        </b-col>
                     </b-row>
                  </div>
               </div>
            </div>
            <b-row>
               <div class="col-md-6 col-lg-3" v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])">
                  <router-link :to="{ name: 'assistencia_alarmes' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-heartbeat green_color"></i>
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
               <div class="col-md-6 col-lg-3">
                  <router-link :to="{ name: 'assistencia_manuais' }">
                     <div class="full counter_section mt-2 mb-2">
                        <div class="couter_icon">
                           <div>
                              <i class="fa fa-book green_color"></i>
                           </div>
                        </div>
                        <div class="counter_no">
                           <div>
                              <p class="total_no">Manuais</p>
                           </div>
                        </div>
                     </div>
                  </router-link>
               </div>
            </b-row>
         </div>
      </div>
   </div>
</template>

<script>
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'AssistenciaView',
   methods: {
      verificarPerfilOperacao
   }
}
</script>

<style>
</style>