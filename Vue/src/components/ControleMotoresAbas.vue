<template>
   <div class="white_shd full margin_bottom_30" ref="chartContainer">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <b-row>
               <b-col cols="9">
                  <h2 class="">Dados recebidos</h2>
               </b-col>
            </b-row>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-tabs content-class="mt-3" fill>
            <b-tab title="Energia">
               <controle-motores-energia :tempoAtualizacao="tempoAtualizacao"></controle-motores-energia>
            </b-tab>
            <b-tab title="Manutenção">
               <controle-motores-manutencao :tempoAtualizacao="tempoAtualizacao"></controle-motores-manutencao>
            </b-tab>
            <b-tab title="Segurança Patrimonial">
               <controle-motores-patrimonio @informacaoAtualizada="atualizarInformacao" :tempoAtualizacao="tempoAtualizacao"></controle-motores-patrimonio>
            </b-tab>
            <b-tab title="Segurança Operacional">
               <controle-motores-operacional :tempoAtualizacao="tempoAtualizacao"></controle-motores-operacional>
            </b-tab>
         </b-tabs>
      </div>
   </div>
</template>

<script>
import ControleMotoresManutencao from '../components/ControleMotoresManutencao.vue'
import ControleMotoresPatrimonio from '../components/ControleMotoresPatrimonio.vue'
import ControleMotoresOperacional from '../components/ControleMotoresOperacional.vue'
import ControleMotoresEnergia from '../components/ControleMotoresEnergia.vue'

export default {
   name: 'ControleMotoresAbas',
   props: {
      tempoAtualizacao: Number
   },
   components: {
      ControleMotoresManutencao,
      ControleMotoresPatrimonio,
      ControleMotoresOperacional,
      ControleMotoresEnergia
   },

   methods: {
      atualizarInformacao(info) {
         this.$emit('informacaoAtualizada', info)
      }
   }
}
</script>

<style>
</style>