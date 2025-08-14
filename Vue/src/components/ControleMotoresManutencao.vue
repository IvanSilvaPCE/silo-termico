<template>
   <b-overlay :show="buscandoManutencao" rounded="sm" class="overlay">
      <b-row>
         <b-col sm="12" md="4" class="mb-3" v-for="(item, index) in manutencao" :key="index">
            <b-card :border-variant="variantHeader(item[4], item[3])" :header="item[0]" :header-border-variant="variantHeader(item[4], item[3])" header-text-variant="white" :header-bg-variant="variantHeader(item[4], item[3])" align="center" class="mouse" @click="alteraVisualizacao">
               <p class="text-left texto">Revisão</p>
               <b-progress max="100" height="1.4rem" class="fundo">
                  <b-progress-bar :variant="variantProgress(item[4])" :value="item[4] || 0" class="text-center barra">
                     <span class="progresso-porcentagem" v-if="modo == 'porcentagem'">{{ item[4] || 0 }}%</span>
                     <span class="progresso" v-else>{{ calculaHoras(item[2], item[4]) || '-' }} / {{ item[2] || '-' }} h</span>
                  </b-progress-bar>
               </b-progress>
               <p class="text-left texto">Vida útil</p>
               <b-progress max="100" height="1.4rem" class="fundo">
                  <b-progress-bar :variant="variantProgress(item[3])" :value="item[3] || 0" class="text-center barra">
                     <span class="progresso-porcentagem" v-if="modo == 'porcentagem'">{{ item[3] || 0 }}%</span>
                     <span class="progresso" v-else>{{ calculaHoras(item[1], item[3]) || '-' }} / {{ item[1] || '-' }} h</span>
                  </b-progress-bar>
               </b-progress>
            </b-card>
         </b-col>
      </b-row>
   </b-overlay>
</template>

<script>
import client from '@/api'

export default {
   name: 'ControleMotoresManutencao',
   props: {
      tempoAtualizacao: Number
   },
   data() {
      return {
         buscandoManutencao: false,
         manutencao: {},
         modo: 'porcentagem',
         intervalId: null
      }
   },

   methods: {
      async buscarManutencao() {
         if (!this.idControle) {
            return
         }
         this.buscandoManutencao = true
         const dados = await client.get(`/controle/buscarmanutencao/${this.idControle}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar manutenção. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoManutencao = false
         })
         this.buscandoManutencao = false
         if (dados && dados.data) {
            this.manutencao = dados.data
         }
      },
      variantProgress(porcentagem) {
         if (porcentagem >= 80 && porcentagem <= 99) {
            return 'warning'
         } else if (porcentagem >= 100) {
            return 'danger'
         } else {
            return 'success'
         }
      },
      variantHeader(percentualRevisao, percentualVida) {
         if (percentualRevisao >= 100 || percentualVida >= 100) {
            return 'danger'
         } else {
            return 'success'
         }
      },
      calculaHoras(total, porcentagem) {
         if (total !== null && porcentagem !== null) {
            return (porcentagem / 100) * total
         }
      },
      alteraVisualizacao() {
         if (this.modo == 'porcentagem') {
            this.modo = 'hora'
         } else {
            this.modo = 'porcentagem'
         }
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarManutencao()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      }
   },

   mounted() {
      const idControleLocalStorage = localStorage.getItem('con')
      if (idControleLocalStorage && idControleLocalStorage != 'undefined') {
         this.idControle = idControleLocalStorage
      } else {
         this.idControle = this.$route.params.idControle
         localStorage.setItem('con', this.idControle)
      }
      this.buscarManutencao()
   },

   watch: {
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      }
   }
}
</script>

<style scoped>
.mouse {
   cursor: pointer;
}

.overlay {
   z-index: 0;
}

.valor {
   color: black;
   font-size: 16px;
   font-weight: 500;
}

.texto {
   color: black;
   font-size: 12px;
   font-weight: 400;
}

.barra {
   box-shadow: none;
}

.progresso {
   position: absolute;
   left: 40%;
   color: black;
   font-size: 12px;
   font-weight: 500;
}

.progresso-porcentagem {
   position: absolute;
   left: 45%;
   color: black;
   font-size: 12px;
   font-weight: 500;
}

.fundo {
   background-color: #eeeeee;
}

.card-body {
   padding: 6px;
}

.card-header {
   font-weight: 500;
}
</style>