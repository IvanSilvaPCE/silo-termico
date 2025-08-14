<template>
   <div>
      <b-row>
         <b-col lg="12">
            <secador-horbach-dados :tempoAtualizacao="tempoAtualizacao"></secador-horbach-dados>
         </b-col>
      </b-row>
      <b-row>
         <b-col lg="12">
            <secador-online-eventos :tempoAtualizacao="tempoAtualizacao"></secador-online-eventos>
         </b-col>
      </b-row>
   </div>
</template>

<script>
import SecadorHorbachDados from '../components/SecadorHorbachDados.vue'
import SecadorOnlineEventos from '../components/SecadorOnlineEventos.vue'

export default {
   name: 'SecadorHorbach',
   props: {
      tempoAtualizacao: Number
   },
   components: {
      SecadorHorbachDados,
      SecadorOnlineEventos
   }
}
</script>

<style>
</style>