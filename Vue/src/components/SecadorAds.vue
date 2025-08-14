<template>
   <div>
      <b-row>
         <b-col lg="12">
            <secador-ads-dados :tempoAtualizacao="tempoAtualizacao"></secador-ads-dados>
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
import SecadorAdsDados from '../components/SecadorAdsDados.vue'
import SecadorOnlineEventos from '../components/SecadorOnlineEventos.vue'

export default {
   name: 'SecadorAds',
   props: {
      tempoAtualizacao: Number
   },
   components: {
      SecadorAdsDados,
      SecadorOnlineEventos
   }
}
</script>

<style>
</style>