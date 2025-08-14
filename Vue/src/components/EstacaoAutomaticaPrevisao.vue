<template>
   <div class="white_shd full margin_bottom_30">
      <div class="full graph_head">
         <div class="heading1 margin_0">
            <h2>Previsão próximos dias</h2>
            <small>Data: {{ formatarDataHora(previsao?.current?.dt) }}</small>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-row v-if="Object.keys(previsao).length > 0" class="mt-3">
            <b-col sm="12" md="12" lg="12" class="card-container">
               <div class="d-flex overflow-auto" ref="scrollContainer" v-on:wheel.prevent="handleWheelScroll">
                  <b-col v-for="(p, index) in previsao?.daily" :key="index" style="padding: 20px; padding-right: 0px; min-width: 265px">
                     <b-card align="center" class="borda shadow" style="border: none; padding-right: 0">
                        <b-card-text>
                           <p class="valor" v-if="index == 0">Hoje</p>
                           <p class="valor" v-else>{{ formatarData(p.dt) }}</p>
                           <img :src="require('@/assets/images/clima/' + iconeClima(p?.weather[0]?.icon))" width="220" v-b-tooltip.hover :title="descricaoClima(p?.weather[0]?.id)" style="margin-top: -50px" />
                           <b-row>
                              <b-col cols="12">
                                 <b-row>
                                    <b-col style="padding-left: 0">
                                       <img src="@/assets/images/clima/maxima.png" width="30" v-b-tooltip.hover title="Máxmima" />
                                    </b-col>
                                    <b-col>
                                       <p class="valor">{{ Math.round(p?.temp?.max) }}°</p>
                                    </b-col>
                                    <b-col>
                                       <p class="valor">{{ Math.round(p?.temp?.min) }}°</p>
                                    </b-col>
                                    <b-col style="padding-right: 0">
                                       <img src="@/assets/images/clima/minima.png" width="30" v-b-tooltip.hover title="Mínima" />
                                    </b-col>
                                 </b-row>
                              </b-col>
                           </b-row>
                           <b-row class="mt-3">
                              <b-col style="padding-left: 0">
                                 <img src="@/assets/images/clima/gota.png" width="28" v-b-tooltip.hover title="Probabilidade de chuva" class="mr-2" />
                              </b-col>
                              <b-col>
                                 <p class="valor">{{ Math.round(p?.pop * 100) }}%</p>
                              </b-col>
                              <b-col>
                                 <p class="valor">{{ p?.rain ?? 0 }}</p>
                              </b-col>
                              <b-col style="padding: 0">
                                 <img src="@/assets/images/clima/pluviometro.png" height="30" v-b-tooltip.hover title="Precipitação mm" />
                              </b-col>
                           </b-row>
                        </b-card-text>
                     </b-card>
                  </b-col>
               </div>
            </b-col>
         </b-row>
         <b-row class="text-center" v-else>
            <b-col cols="12">
               <p>Não foi possível buscar a previsão</p>
            </b-col>
         </b-row>
      </div>
   </div>
</template>

<script>
export default {
   name: 'EstacaoAutomaticaPrevisao',
   props: ['previsao'],
   data() {
      return {}
   },

   methods: {
      formatarData(value) {
         if (!value) return
         const dia = this.$moment.unix(value).format('dddd')
         const diasSemana = {
            Sunday: 'Domingo',
            Monday: 'Segunda',
            Tuesday: 'Terça',
            Wednesday: 'Quarta',
            Thursday: 'Quinta',
            Friday: 'Sexta',
            Saturday: 'Sábado'
         }
         return diasSemana[dia]
      },
      formatarDataHora(value) {
         if (!value) return
         return this.$moment.unix(value).format('DD/MM/YYYY HH:mm:ss')
      },
      descricaoClima(id) {
         if (!id) return
         id = id.toString()
         const clima = {
            2: 'Tempestade',
            3: 'Chuva',
            5: 'Chuva',
            6: 'Neve',
            7: 'Encoberto',
            8: 'Nuvens'
         }
         if (id === '800') {
            return 'Limpo'
         }
         let descricao = clima[id.charAt(0)]
         return descricao
      },
      iconeClima(icon) {
         if (!icon) return
         const icones = {
            '01d': 'ensolarado.svg',
            '01n': 'lua.svg',
            '02d': 'dia-nublado.svg',
            '02n': 'nublado.svg',
            '03d': 'dia-nublado.svg',
            '03n': 'nublado.svg',
            '04d': 'dia-nublado.svg',
            '04n': 'nublado.svg',
            '09d': 'chuvoso.svg',
            '09n': 'chuvoso.svg',
            '10d': 'chuvoso.svg',
            '10n': 'chuvoso.svg',
            '11d': 'tempestade.svg',
            '11n': 'tempestade.svg',
            '13d': 'nevando.svg',
            '13n': 'nevando.svg',
            '50d': 'nublado.svg',
            '50n': 'nublado.svg'
         }
         return icones[icon]
      },
      handleWheelScroll(event) {
         const scrollContainer = this.$refs.scrollContainer
         scrollContainer.scrollLeft += event.deltaY
         event.stopPropagation()
      }
   }
}
</script>

<style scoped>
.borda {
   border-radius: 25px;
}

.valor {
   font-size: 20px;
   font-weight: 500;
   color: black;
}

::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}
</style>