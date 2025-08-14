<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <h2>Alarmes de assistência</h2>
               </div>
            </div>
         </div>
         <div class="row">
            <div class="col-lg-12">
               <div class="white_shd full margin_bottom_30">
                  <div class="map_section padding_infor_info">
                     <!-- <b-tabs justified>
                        <b-tab title="Alarmes" active> -->
                     <assistencia-alarmes></assistencia-alarmes>
                     <!-- </b-tab>
                        <b-tab title="Relatório"></b-tab>
                     </b-tabs> -->
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import AssistenciaAlarmes from '../components/AssistenciaAlarmes.vue'

export default {
   name: 'AssistenciaAlarmesView',
   components: {
      AssistenciaAlarmes
   }
}
</script>

<style>
</style>