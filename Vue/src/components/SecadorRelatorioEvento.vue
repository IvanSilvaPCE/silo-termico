<template>
   <div v-if="evento?.dados">
      <b-row>
         <b-col>
            <b-table :items="evento.dados" :fields="fields" select-mode="single" responsive="sm" sort-by="tp_criticidade_alarme" sort-desc striped class="mt-4">
               <template #cell(tp_criticidade_alarme)="row">
                  <b-badge class="p-2" :variant="criticidade(row.item.tp_criticidade_alarme)" style="border: none">{{ formatarCriticidade(row.item.tp_criticidade_alarme) }}</b-badge>
               </template>
            </b-table>
            <p v-if="!evento?.dados || !evento?.dados?.length" class="text-center">Nenhum evento para listar</p>
         </b-col>
      </b-row>
   </div>
</template>

<script>
export default {
   name: 'SecadorRelatorioEvento',
   props: {
      evento: [Array, Object]
   },

   data() {
      return {
         fields: [
            { key: 'tp_criticidade_alarme', label: 'Criticidade' },
            { key: 'ds_alarme', label: 'Alarme' },
            { key: 'total_ativo', label: 'Quantidade' },
            { key: 'tempo_total', label: 'Tempo' }
         ]
      }
   },

   methods: {
      criticidade(value) {
         if (value == 0) return 'info'
         if (value == 10) return 'primary'
         if (value == 25) return 'warning'
         if (value == 50) return 'danger'
      },
      formatarCriticidade(value) {
         if (value == 0) return 'Alerta'
         if (value == 10) return 'Baixo'
         if (value == 25) return 'Alto'
         if (value == 50) return 'Crítico'
         return value
      }
   }
}
</script>

<style>
</style>