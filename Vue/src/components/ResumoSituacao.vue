<template>
   <div class="map_section">
      <b-overlay :show="buscandoEquipamentos" rounded="sm" class="overlay">
         <div class="map m_style1 d-flex align-items-center">
            <div class="w-100">
               <div v-if="equipamentos.estrutura_equipamentos?.length" class="card-container">
                  <div class="d-flex flex-wrap card-Mobile justify-content-sm-center justify-content-md-start">
                     <b-col class="d-flex flex-column align-items-center" v-for="equipamento in equipamentos.estrutura_equipamentos" :key="equipamento.id_equipamento" @click="detalheEquipamento(equipamento.categoria.id_categoria_equipamento)" style="max-width: 95px">
                        <div :class="['imagemStatus', 'mouse', { 'box-selecionado': equipamentoSelecionado === equipamento.categoria.id_categoria_equipamento && equipamentoSelecionado !== null }]">
                           <img :src="iconeEquipamento(equipamento)" class="mouse iconesSVG_Resumo" />
                        </div>
                        <div class="d-flex justify-content-center w-100 mb-1 pt-1">
                           <p class="mb-0 text-center" style="padding-bottom: 0px">
                              {{ equipamento.categoria.id_categoria_equipamento != 7 ? equipamento.categoria.ds_categoria_equipamento.split(' ')[0] : 'Limpeza' }}
                           </p>
                        </div>
                     </b-col>
                  </div>
               </div>

               <b-row v-else>
                  <b-col>
                     <p class="text-center">Nenhum equipamento para listar</p>
                  </b-col>
               </b-row>
            </div>
         </div>
      </b-overlay>
   </div>
</template>

<script>
import client from '@/api'

export default {
   name: 'ResumoSituacao',
   props: {
      unidade: [String, Number],
      equipamentoSelecionado: Number
   },
   data() {
      return {
         buscandoEquipamentos: false,
         equipamentos: {}
      }
   },

   methods: {
      corBorda(st_operacao) {
         const bordas = {
            OF: 'gray',
            EF: 'red',
            EC: 'darkgray',
            EM: 'orange',
            ON: 'green'
         }
         return bordas[st_operacao] || 'transparent'
      },
      async buscarEquipamentos() {
         if (this.unidade == null || this.unidade === undefined || this.unidade == '') {
            return
         }
         this.buscandoEquipamentos = true
         const dados = await client.get(`/resumo/equipamentos/${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar secadores. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEquipamentos = false
         })
         this.buscandoEquipamentos = false
         if (dados && dados.data) {
            this.equipamentos = dados.data
         }
      },
      iconeEquipamento(equipamento) {
         if (!equipamento || equipamento.length === 0) {
            return
         }
         const categoria = equipamento?.id_categoria_equipamento
         const operacao = equipamento?.st_operacao

         const icones = {
            1: {
               OF: 'secador.svg',
               EF: 'secador.svg',
               EC: 'secador.svg',
               EM: 'secador.svg',
               ON: 'secador.svg'
            },
            // 2: {
            //    OF: 'termometria_offline_round.png',
            //    EF: 'termometria_falha_round.png',
            //    EC: 'termometria_configuracao_round.png',
            //    EM: 'termometria_manutencao_round.png',
            //    ON: 'termometria_online_round.png'
            // },
            2: {
               OF: 'termometria.svg',
               EF: 'termometria.svg',
               EC: 'termometria.svg',
               EM: 'termometria.svg',
               ON: 'termometria.svg'
            },
            3: {
               OF: 'silo_offline_round.png',
               EF: 'silo_falha_round.png',
               EC: 'silo_configuracao_round.png',
               EM: 'silo_manutencao_round.png',
               ON: 'silo_online_round.png'
            },
            4: {
               OF: 'estacao.svg',
               EF: 'estacao.svg',
               EC: 'estacao.svg',
               EM: 'estacao.svg',
               ON: 'estacao.svg'
            },
            5: {
               OF: 'armazem.svg',
               EF: 'armazem.svg',
               EC: 'armazem.svg',
               EM: 'armazem.svg',
               ON: 'armazem.svg'
            },
            7: {
               OF: 'maquinaLimpeza.svg',
               EF: 'maquinaLimpeza.svg',
               EC: 'maquinaLimpeza.svg',
               EM: 'maquinaLimpeza.svg',
               ON: 'maquinaLimpeza.svg'
            },
            8: {
               OF: 'CCM.svg',
               EF: 'CCM.svg',
               EC: 'CCM.svg',
               EM: 'CCM.svg',
               ON: 'CCM.svg'
            }
         }

         if (icones[categoria] && icones[categoria][operacao]) {
            return require(`@/assets/images/inicio/${icones[categoria][operacao]}`)
         }
         return
      },
      corVariant(st_operacao) {
         const variant = {
            OF: 'secondary',
            EF: 'danger',
            EC: 'dark',
            EM: 'warning',
            ON: 'success'
         }
         return variant[st_operacao]
      },
      detalheEquipamento(categoria) {
         if (categoria === 4) {
            this.$router.push({ name: 'estacao' })
         } else {
            this.$emit('detalhe-equipamento', categoria)
         }
      }
   },

   mounted() {
      this.buscarEquipamentos()
   },

   watch: {
      unidade() {
         this.buscarEquipamentos()
      }
   }
}
</script>

<style scoped>
.imagemStatus {
   border-radius: 50%;
   /* box-shadow: 0 0 0 8px #15283c; */
   box-shadow: 0 0 0 6px #007bff;
   height: 58px !important;
   width: 58px !important;
   display: flex;
   justify-content: center;
   align-content: center;
   align-items: center;
   padding: 5px;
   background-color: #fff;
   margin: 5px 0;
   transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.imagemStatus img {
   height: auto !important;
   width: auto !important;
   max-width: 58px;
   max-height: 58px;
   margin: 5px;
   /* max-width: 80%; */
   margin-bottom: 5px;
}

.imagemStatus:hover {
   /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); */
   box-shadow: 0 0px 0 5px #0065d1;
   transform: translateY(-10px);
   z-index: 1099;
}
.box-selecionado {
   /* box-shadow: 0 0px 0 6px red !important; */
   box-shadow: 0 0px 0 5px #015cbe !important;
   background-color: #eeeeee !important;
   transform: translateY(-10px);
   z-index: 1099;
}

.mouse {
   cursor: pointer;
}

.imagem_status {
   height: 80px;
}

::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}

.overlay {
   z-index: 0;
   min-height: 75px;
}
.card-Mobile {
   display: flex;
   flex-wrap: wrap;
   align-items: flex-start;
   justify-content: flex-start;
   width: 100%;
}

@media (max-width: 540px) {
   .card-Mobile {
      justify-content: center;
      text-align: center;
   }
   .card-Mobile > * {
      flex: 1 1 100%;
      max-width: 100%;
      text-align: center;
   }
}
</style>