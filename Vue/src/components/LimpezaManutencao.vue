<template>
   <b-overlay :show="buscandoManutencao" rounded="sm" class="overlay">
      <b-row>
         <b-col sm="12" md="6" class="mb-3" v-for="(manutencao, index) in manutencao.manutencao" :key="index">
            <b-card :border-variant="variantHeader(manutencao.percentualRevisao, manutencao.percentualVida)" :header="manutencao.equipamento" :header-border-variant="variantHeader(manutencao.percentualRevisao, manutencao.percentualVida)" header-text-variant="white" :header-bg-variant="variantHeader(manutencao.percentualRevisao, manutencao.percentualVida)" align="center" class="mouse" @click="alteraVisualizacao">
               <p class="text-left texto">Revisão</p>
               <b-progress max="100" height="1.4rem" class="fundo">
                  <b-progress-bar :variant="variantProgress(manutencao.percentualRevisao)" :value="manutencao.percentualRevisao || 0" class="text-center barra">
                     <span class="progresso-porcentagem" v-if="modo == 'porcentagem'">{{ manutencao.percentualRevisao || 0 }}%</span>
                     <span class="progresso" v-else>{{ calculaHoras(manutencao.horasRevisao, manutencao.percentualRevisao) || '-' }} / {{ manutencao.horasRevisao || '-' }} h</span>
                  </b-progress-bar>
               </b-progress>
               <p class="text-left texto">Vida útil</p>
               <b-progress max="100" height="1.4rem" class="fundo">
                  <b-progress-bar :variant="variantProgress(manutencao.percentualVida)" :value="manutencao.percentualVida || 0" class="text-center barra">
                     <span class="progresso-porcentagem" v-if="modo == 'porcentagem'">{{ manutencao.percentualVida || 0 }}%</span>
                     <span class="progresso" v-else>{{ calculaHoras(manutencao.horasVida, manutencao.percentualVida) || '-' }} / {{ manutencao.horasVida || '-' }} h</span>
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
   name: 'LimpezaManutencao',
   data() {
      return {
         buscandoManutencao: false,
         manutencao: {},
         modo: 'porcentagem'
      }
   },

   mounted() {
      const idLimpezaLocalStorage = localStorage.getItem('lim')
      if (idLimpezaLocalStorage && idLimpezaLocalStorage != 'undefined') {
         this.idLimpeza = idLimpezaLocalStorage
      } else {
         this.idLimpeza = this.$route.params.idLimpeza
         localStorage.setItem('lim', this.idLimpeza)
      }
      this.buscarManutencao()
   },

   methods: {
      async buscarManutencao() {
         if (!this.idLimpeza) {
            return
         }
         this.buscandoManutencao = true
         const dados = await client.get(`/limpeza/buscarmanutencao/${this.idLimpeza}`).catch((err) => {
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
            const data = this.$moment(this.manutencao.variaveis.DAT, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
            this.$emit('recebeData', data)
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
      }
   },

   watch: {
      manutencao() {
         if (this.manutencao.variaveis.CPE == 0) {
            this.manutencao.manutencao = this.manutencao.manutencao.filter((item) => item.equipamento !== 'Motor Ciclone')
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