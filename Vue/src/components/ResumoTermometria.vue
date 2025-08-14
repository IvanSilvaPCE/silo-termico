<template>
   <div class="col-md-12" ref="chartContainer">
      <div class="white_shd full margin_bottom_30">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-row>
                  <b-col>
                     <h2>{{ termometrias?.estrutura_equipamentos?.length > 1 ? 'Termometrias' : 'Termometria' }}</h2>
                  </b-col>
                  <b-col class="text-right">
                     <div @click="ajuda"><b-icon-question-circle scale="1.8" class="mouse"></b-icon-question-circle></div>
                  </b-col>
               </b-row>
            </div>
         </div>
         <div class="map_section padding_infor_info contentTermo">
            <b-overlay :show="buscandoTermometrias" rounded="sm" class="overlay">
               <div class="map m_style1">
                  <div v-if="termometrias.estrutura_equipamentos?.length">
                     <div class="card-container mb-3" v-for="termometria in termometrias.estrutura_equipamentos" :key="termometria.id_equipamento">
                        <div class="d-flex flex-wrap">
                           <!--? Cards dos Termometria -->
                           <b-col cols="12" sm="6" md="3" lg="2" class="mb-3" style="min-width: 220px">
                              <b-card @click="detalheTermometria(termometria.id_equipamento)" :border-variant="corVariant(termometria.st_operacao)" :header-bg-variant="corVariant(termometria.st_operacao)" header-text-variant="white" align="center" class="cardMouse mouse" :style="{ 'min-height': '100%', 'max-height': '100%', opacity: termometria.st_operacao == 'OF' ? '0.5' : '' }">
                                 <template v-slot:header>
                                    <div style="font-size: 14px">{{ termometria.ds_equipamento }}</div>
                                 </template>
                                 <b-overlay :show="infoTermometria[termometria.id_equipamento]?.buscandoResumo" rounded="sm" class="overlay">
                                    <b-row class="mb-2 mt-0">
                                       <b-col style="margin: -12px 0 -3px">
                                          <h5 class="text-center">Armazenagem</h5>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row @click.stop="">
                                       <b-col>
                                          <apex-chart ref="chartNivel" type="radialBar" height="200" :options="construirGraficoOptions(getInfoTermometriaId(termometria.id_equipamento, 'PROD'))" :series="construirGraficoSeries(getInfoTermometriaId(termometria.id_equipamento, 'NIVE'))" style="margin-top: -20px; margin-bottom: -20px; margin-left: -20px; margin-right: -20px"></apex-chart>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row>
                                       <b-col>
                                          <p class="text-center">Produtos</p>
                                       </b-col>
                                    </b-row>
                                    <b-row class="align-items-center">
                                       <b-col style="margin-top: -16px; margin-bottom: 5px">
                                          <b-badge class="m-1 mt-2" :style="{ 'background-color': corProduto(index) }" pill v-for="(produto, index) in getInfoTermometriaId(termometria.id_equipamento, 'PROD')" :key="index">
                                             <small class="pt-1 pb-1 font12">{{ produto }}</small>
                                          </b-badge>
                                       </b-col>
                                    </b-row>
                                 </b-overlay>
                              </b-card>
                           </b-col>
                           <!--?  Cards dos produtos -->
                           <b-col cols="12" sm="6" md="3" lg="2" class="mb-3" style="min-width: 220px" v-for="silo in termometria.slave.filter((item) => item.id_categoria_equipamento == 3)" :key="silo.id_equipamento">
                              <b-card @click="detalheSilo(silo.id_equipamento)" :border-variant="corVariant(silo.st_operacao)" :header-bg-variant="corVariant(silo.st_operacao)" header-text-variant="white" align="center" class="cardMouse mouse" :style="{ 'min-height': '100%', 'max-height': '100%', opacity: silo.st_operacao == 'OF' ? '0.5' : '' }">
                                 <template v-slot:header>
                                    <div style="font-size: 14px">{{ silo.ds_equipamento }}</div>
                                 </template>
                                 <b-overlay :show="infoSilo[silo.id_equipamento]?.buscandoResumo" rounded="sm" class="overlay">
                                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 mb-1" style="margin-top: -10px">
                                       <h5 class="text-center">
                                          <img width="22" v-if="formatarProduto(getInfoSiloId(silo.id_equipamento, 'CUL')).svg" :src="formatarProduto(getInfoSiloId(silo.id_equipamento, 'CUL')).svg" alt="Produto" class="icone-produto" />
                                          {{ formatarProduto(getInfoSiloId(silo.id_equipamento, 'CUL')).nome }}
                                       </h5>
                                    </div>
                                    <hr class="m-0" />
                                    <b-row>
                                       <b-col cols="6" class="pr-0">
                                          <b-row class="justify-content-center mx-auto">
                                             <small> Temp. média </small>
                                          </b-row>
                                          <b-row class="justify-content-center mx-auto">
                                             <b-icon icon="thermometer-half" scale="1.8" class="mt-3 mr-1"></b-icon>
                                             <p class="negrito mt-2">{{ getInfoSiloId(silo.id_equipamento, 'TMS') != undefined && getInfoSiloId(silo.id_equipamento, 'TMS') != 0 ? getInfoSiloId(silo.id_equipamento, 'TMS').toFixed(1) : '-' }}°C</p>
                                          </b-row>
                                       </b-col>
                                       <b-col cols="6" class="p-0">
                                          <b-row class="justify-content-center mx-auto">
                                             <small> Ponto quente </small>
                                          </b-row>
                                          <b-row class="justify-content-center mx-auto">
                                             <b-icon icon="thermometer-half" scale="1.8" :variant="getInfoSiloId(silo.id_equipamento, 'NPQ') != 0 && getInfoSiloId(silo.id_equipamento, 'NPQ') != null ? 'danger' : 'secondary'" class="mt-3 mr-1"></b-icon>
                                             <p class="negrito mt-2">{{ getInfoSiloId(silo.id_equipamento, 'NPQ') != 0 && getInfoSiloId(silo.id_equipamento, 'NPQ') != null ? 'Sim' : 'Não' }}</p>
                                          </b-row>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row class="mt-0 mb-3" style="margin-top: -10px">
                                       <b-col>
                                          <small>Capacidade utilizada</small>
                                       </b-col>
                                    </b-row>
                                    <b-row>
                                       <b-col>
                                          <apex-chart type="radialBar" height="150" :options="construirGraficoSilo(getInfoSiloId(silo.id_equipamento, 'UMS'), getInfoSiloId(silo.id_equipamento, 'TMS'), getInfoSiloId(silo.id_equipamento, 'FSV'))" :series="construirSeriesSilo(getInfoSiloId(silo.id_equipamento, 'NIV'))" style="margin-top: -30px; margin-bottom: -20px"></apex-chart>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row class="justify-content-center mx-auto">
                                       <p class="m-0 font12">Estado da conservação</p>
                                    </b-row>
                                    <b-row>
                                       <b-col class="d-flex justify-content-center mb-2">
                                          <b-badge style="max-width: 38px" class="mt-2 p-1 d-flex justify-content-center align-items-center text-wrap" :style="{ 'background-color': buscarCorNivel(getInfoSiloId(silo.id_equipamento, 'UMS'), getInfoSiloId(silo.id_equipamento, 'TMS'), getInfoSiloId(silo.id_equipamento, 'FSV')) }" pill>
                                             <img width="25" :src="buscarImagemConservacao(calcularConservacao(getInfoSiloId(silo.id_equipamento, 'UMS'), getInfoSiloId(silo.id_equipamento, 'TMS')))" :alt="buscarConservacao(calcularConservacao(getInfoSiloId(silo.id_equipamento, 'UMS'), getInfoSiloId(silo.id_equipamento, 'TMS'))) || '-'" />
                                          </b-badge>
                                       </b-col>
                                    </b-row>
                                    <b-row class="justify-content-center mx-auto font12">
                                       <span>Última atualização:&nbsp; </span>
                                       <span>{{ formatarData(getInfoSiloId(silo.id_equipamento, 'DAT')) || 'Não Atualizado' }}</span>
                                    </b-row>
                                 </b-overlay>
                                 <b-card-text> </b-card-text>
                              </b-card>
                           </b-col>

                           <!--? Cards dos Armazenagens -->
                           <b-col cols="12" sm="6" md="3" lg="2" class="mb-3" style="min-width: 220px" v-for="armazem in termometria.slave.filter((item) => item.id_categoria_equipamento == 5)" :key="armazem.id_equipamento">
                              <b-card @click="detalheArmazem(armazem.id_equipamento)" :border-variant="corVariant(armazem.st_operacao)" :header-bg-variant="corVariant(armazem.st_operacao)" header-text-variant="white" align="center" class="cardMouse mouse" :style="{ 'min-height': '100%', 'max-height': '100%', opacity: armazem.st_operacao == 'OF' ? '0.5' : '' }">
                                 <template v-slot:header>
                                    <div style="font-size: 14px">{{ armazem.ds_equipamento }}</div>
                                 </template>
                                 <b-overlay :show="infoArmazem[armazem.id_equipamento]?.buscandoResumo" rounded="sm" class="overlay">
                                    <b-row class="mb-2 mt-0">
                                       <b-col style="margin: -12px 0 -3px">
                                          <h5 class="text-center">Armazenagem</h5>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row @click.stop="">
                                       <b-col>
                                          <apex-chart ref="chartNivel" type="radialBar" height="200" :options="construirGraficoOptions(getInfoArmazemId(armazem.id_equipamento, 'PROD'))" :series="construirGraficoSeries(getInfoArmazemId(armazem.id_equipamento, 'NIVE'))" style="margin-top: -20px; margin-bottom: -20px; margin-left: -20px; margin-right: -20px"></apex-chart>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row>
                                       <b-col>
                                          <p class="text-center">Produtos</p>
                                       </b-col>
                                    </b-row>
                                    <b-row class="align-items-center m-0">
                                       <b-col style="margin-top: -10px; margin-bottom: 5px">
                                          <b-badge class="m-1" :style="{ 'background-color': corProduto(index) }" pill v-for="(produto, index) in getInfoArmazemId(armazem.id_equipamento, 'PROD')" :key="index">
                                             <small class="pt-1 pb-1 font12">{{ produto }}</small>
                                          </b-badge>
                                       </b-col>
                                    </b-row>
                                 </b-overlay>
                              </b-card>
                           </b-col>

                           <!--? Cards dos Celulas -->
                           <b-col cols="12" sm="6" md="3" lg="2" class="mb-3" style="min-width: 220px" v-for="celula in termometria.slave.filter((item) => item.id_categoria_equipamento == 5).flatMap((celulas) => celulas.slave)" :key="celula.id_equipamento">
                              <b-card @click="detalheCelula(celula.id_equipamento_pai)" :border-variant="corVariant(celula.st_operacao)" :header-bg-variant="corVariant(celula.st_operacao)" header-text-variant="white" align="center" class="cardMouse mouse" :style="{ 'min-height': '100%', 'max-height': '100%', opacity: celula.st_operacao == 'OF' ? '0.5' : '' }">
                                 <template v-slot:header>
                                    <div style="font-size: 14px">{{ celula.ds_equipamento }}</div>
                                 </template>
                                 <b-overlay :show="infoCelula[celula.id_equipamento]?.buscandoResumo" rounded="sm" class="overlay">
                                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 mb-1" style="margin-top: -10px">
                                       <!-- <h5 class="text-center">{{ formatarProduto(getInfoCelulaId(celula.id_equipamento, 'CUL')) || '-' }} </h5> -->
                                       <h5 class="text-center">
                                          <img width="22" v-if="formatarProduto(getInfoCelulaId(celula.id_equipamento, 'CUL')).svg" :src="formatarProduto(getInfoCelulaId(celula.id_equipamento, 'CUL')).svg" alt="Produto" class="icone-produto" />
                                          {{ formatarProduto(getInfoCelulaId(celula.id_equipamento, 'CUL')).nome }}
                                       </h5>
                                    </div>
                                    <hr class="m-0" />
                                    <b-row>
                                       <b-col cols="6" class="pr-0">
                                          <b-row class="justify-content-center mx-auto">
                                             <small> Temp. média </small>
                                          </b-row>
                                          <b-row class="justify-content-center mx-auto">
                                             <b-icon icon="thermometer-half" scale="1.8" class="mt-3 mr-1"></b-icon>
                                             <p class="negrito mt-2">{{ getInfoCelulaId(celula.id_equipamento, 'TMS') != undefined && getInfoCelulaId(celula.id_equipamento, 'TMS') != 0 ? getInfoCelulaId(celula.id_equipamento, 'TMS').toFixed(1) : '-' }}°C</p>
                                          </b-row>
                                       </b-col>
                                       <b-col cols="6" class="p-0">
                                          <b-row class="justify-content-center mx-auto">
                                             <small> Ponto quente </small>
                                          </b-row>
                                          <b-row class="justify-content-center mx-auto">
                                             <b-icon icon="thermometer-half" scale="1.8" :variant="getInfoCelulaId(celula.id_equipamento, 'NPQ') != 0 && getInfoCelulaId(celula.id_equipamento, 'NPQ') != null ? 'danger' : 'secondary'" class="mt-3 mr-1"></b-icon>
                                             <p class="negrito mt-2">{{ getInfoCelulaId(celula.id_equipamento, 'NPQ') != 0 && getInfoCelulaId(celula.id_equipamento, 'NPQ') != null ? 'Sim' : 'Não' }}</p>
                                          </b-row>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row class="mt-0 mb-3" style="margin-top: -10px">
                                       <b-col>
                                          <small>Capacidade utilizada</small>
                                       </b-col>
                                    </b-row>
                                    <b-row>
                                       <b-col>
                                          <apex-chart type="radialBar" height="150" :options="construirGraficoSilo(getInfoCelulaId(celula.id_equipamento, 'UMC'), getInfoCelulaId(celula.id_equipamento, 'TMS'), getInfoCelulaId(celula.id_equipamento, 'FSV'))" :series="construirSeriesSilo(getInfoCelulaId(celula.id_equipamento, 'NIV'))" style="margin-top: -30px; margin-bottom: -20px"></apex-chart>
                                       </b-col>
                                    </b-row>
                                    <hr class="m-0" />
                                    <b-row class="justify-content-center mx-auto">
                                       <p class="m-0 font12">Estado da conservação</p>
                                    </b-row>
                                    <b-row>
                                       <b-col class="d-flex justify-content-center mb-2">
                                          <!-- <b-badge class="mr-2 mt-2" :style="{ 'background-color': buscarCorNivel(getInfoCelulaId(celula.id_equipamento, 'UMC'), getInfoCelulaId(celula.id_equipamento, 'TMS'), getInfoCelulaId(celula.id_equipamento, 'FSV')) }" pill>
                                             <small class="pt-1 pb-1">{{ buscarConservacao(calcularConservacao(getInfoCelulaId(celula.id_equipamento, 'UMC'), getInfoCelulaId(celula.id_equipamento, 'TMS'))) || '-' }}</small>
                                          </b-badge> -->
                                          <b-badge style="max-width: 38px" class="mt-2 p-1 text-wrap" :style="{ 'background-color': buscarCorNivel(getInfoCelulaId(celula.id_equipamento, 'UMC'), getInfoCelulaId(celula.id_equipamento, 'TMS'), getInfoCelulaId(celula.id_equipamento, 'FSV')) }" pill>
                                             <img width="25" :src="buscarImagemConservacao(calcularConservacao(getInfoCelulaId(celula.id_equipamento, 'UMC'), getInfoCelulaId(celula.id_equipamento, 'TMS')))" :alt="buscarConservacao(calcularConservacao(getInfoCelulaId(celula.id_equipamento, 'UMC'), getInfoCelulaId(celula.id_equipamento, 'TMS'))) || '-'" />
                                          </b-badge>
                                       </b-col>
                                    </b-row>
                                    <b-row class="justify-content-center mx-auto font12">
                                       <span>Última atualização:&nbsp; </span><span>{{ formatarData(getInfoCelulaId(celula.id_equipamento, 'DAT')) || 'Não Atualizado' }}</span>
                                    </b-row>
                                 </b-overlay>
                                 <b-card-text> </b-card-text>
                              </b-card>
                           </b-col>
                        </div>
                     </div>
                  </div>
                  <b-row v-else>
                     <b-col>
                        <p class="text-center">Nenhuma termometria para listar</p>
                     </b-col>
                  </b-row>
               </div>
            </b-overlay>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import sojaSVG from '@/assets/images/inicio/soja.svg'
import milhoSVG from '@/assets/images/inicio/milho.svg'
import trigoSVG from '@/assets/images/inicio/trigo.svg'
import cevadaSVG from '@/assets/images/inicio/cevada.svg'
import feijaoSVG from '@/assets/images/inicio/cevada.svg'
import arrozSVG from '@/assets/images/inicio/arroz.svg'
import sorgoSVG from '@/assets/images/inicio/sorgo.svg'

export default {
   name: 'ResumoTermometria',
   props: {
      termometrias: Object,
      buscandoTermometrias: Boolean
   },
   data() {
      return {
         indiceTexto: 0,
         infoSilo: {},
         infoTermometria: {},
         infoArmazem: {},
         infoCelula: {},
         nivel: 0,
         chartOptions: {},
         series: [],
         mostrarMais: false
      }
   },

   mounted() {
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.chartContainer)

      window.addEventListener('resize', this.handleResize)
   },

   methods: {
      ajuda() {
         this.$bvModal.show('ajuda')
      },
      corProduto(index) {
         const cores = {
            0: 'rgba(0, 143, 251, 0.85)',
            1: 'rgba(0, 227, 150, 0.85)',
            2: 'rgba(254, 176, 25, 0.85)',
            3: 'rgba(255, 69, 96, 0.85)',
            4: 'rgba(119, 93, 208, 0.85)',
            5: 'rgba(0, 143, 251, 0.85)',
            6: 'rgba(0, 227, 150, 0.85)'
         }
         return cores[index]
      },
      handleResize() {
         if (this.chartNivel) {
            this.chartNivel.resize()
         }
      },
      converterSacas(grao, volume) {
         const densidades = {
            1: 750,
            2: 700,
            3: 750,
            4: 650,
            5: 760,
            6: 100,
            7: 300
         }
         const densidade = densidades[grao] || 700
         const pesoSaca = 60
         const massaTotal = volume * densidade
         const numeroSacas = Math.round(massaTotal / pesoSaca)
         return numeroSacas
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
      detalheTermometria(termometria) {
         const idTermometria = termometria
         this.$router.push({ name: 'termometria', params: { idTermometria } })
      },
      detalheSilo(silo) {
         const idSilo = silo
         this.$router.push({ name: 'silo', params: { idSilo } })
      },
      detalheArmazem(armazem) {
         const idTermometria = armazem
         this.$router.push({ name: 'termometria', params: { idTermometria } })
      },
      detalheCelula(armazem) {
         const idArmazem = armazem
         this.$router.push({ name: 'armazem', params: { idArmazem } })
      },
      async buscaResumoSilo(id) {
         if (!id) {
            return
         }
         this.$set(this.infoSilo, id, { buscandoResumo: true })

         const dados = await client.get(`/resumo/silo/${id}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar informações do silo. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(this.infoSilo, id, { buscandoResumo: false })
         })
         this.$set(this.infoSilo, id, { buscandoResumo: false })
         if (dados.data) {
            this.$set(this.infoSilo, id, { dados: dados.data })
         }
      },
      async buscaResumoTermometria(id) {
         if (!id) {
            return
         }
         this.$set(this.infoTermometria, id, { buscandoResumo: true })

         const dados = await client.get(`/resumo/termometria/${id}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar informações da termometria. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(this.infoTermometria, id, { buscandoResumo: false })
         })
         this.$set(this.infoTermometria, id, { buscandoResumo: false })
         if (dados.data) {
            this.$set(this.infoTermometria, id, { dados: dados.data })
         }
      },
      async buscaResumoArmazem(id) {
         if (!id) {
            return
         }
         this.$set(this.infoArmazem, id, { buscandoResumo: true })

         const dados = await client.get(`/resumo/armazem/${id}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar informações do armazém. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(this.infoArmazem, id, { buscandoResumo: false })
         })
         this.$set(this.infoArmazem, id, { buscandoResumo: false })
         if (dados.data) {
            this.$set(this.infoArmazem, id, { dados: dados.data })
         }
      },
      async buscaResumoCelula(id) {
         if (!id) {
            return
         }
         this.$set(this.infoCelula, id, { buscandoResumo: true })

         const dados = await client.get(`/resumo/celula/${id}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar informações da célula. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.$set(this.infoCelula, id, { buscandoResumo: false })
         })
         this.$set(this.infoCelula, id, { buscandoResumo: false })
         if (dados.data) {
            this.$set(this.infoCelula, id, { dados: dados.data })
         }
      },
      getInfoSiloId(idSilo, idVariavel) {
         const silo = this.infoSilo[idSilo]
         return silo && silo.dados ? silo.dados[idVariavel] : null
      },
      getInfoTermometriaId(idTermometria, idVariavel) {
         const termometria = this.infoTermometria[idTermometria]
         return termometria && termometria.dados ? termometria.dados[idVariavel] : null
      },
      getInfoArmazemId(idArmazem, idVariavel) {
         const armazem = this.infoArmazem[idArmazem]
         return armazem && armazem.dados ? armazem.dados[idVariavel] : null
      },
      getInfoCelulaId(idCelula, idVariavel) {
         const celula = this.infoCelula[idCelula]
         return celula && celula.dados ? celula.dados[idVariavel] : null
      },
      formatarProduto(value) {
         const produto = {
            1: { nome: 'Soja', svg: sojaSVG },
            2: { nome: 'Milho', svg: milhoSVG },
            3: { nome: 'Trigo', svg: trigoSVG },
            4: { nome: 'Cevada', svg: cevadaSVG },
            5: { nome: 'Feijão', svg: feijaoSVG },
            6: { nome: 'Arroz', svg: arrozSVG },
            7: { nome: 'Sorgo', svg: sorgoSVG }
         }
         return produto[value] || { nome: '-', svg: null }
      },
      formatarData(value) {
         if (!value) return null
         const data = this.$moment(value, 'YYYY/MM/DD HH:mm:ss')
         const agora = this.$moment()
         const diasPassados = agora.diff(data, 'days')

         if (diasPassados >= 1) {
            return `${diasPassados} dia${diasPassados > 1 ? 's' : ''}`
         } else {
            return data.format('DD/MM/YYYY HH:mm:ss')
         }
      },

      construirGraficoSeries(niveis) {
         if (!niveis) return []
         return niveis
      },
      construirGraficoOptions(produtos) {
         if (!produtos) return {}
         const chartOptions = {
            chart: { type: 'radialBar', offsetX: 0, offsetY: 0 },
            plotOptions: {
               radialBar: {
                  hollow: { margin: 10, padding: 0, size: '45%' },
                  dataLabels: {
                     name: { fontSize: '22px' },
                     value: {
                        fontSize: '14px',
                        offsetY: 1,
                        formatter: function (val) {
                           const parsedVal = parseFloat(val)
                           if (!isNaN(parsedVal)) {
                              return `${parsedVal.toFixed(1)}%`
                           } else {
                              return val
                           }
                        }
                     },
                     total: {
                        show: true,
                        label: 'Total',
                        formatter: function (s) {
                           const valores = s.config.series
                           let soma = valores.reduce((acc, curr) => acc + curr, 0)
                           if (soma == 0) {
                              return '--%'
                           }
                           soma = soma.toFixed(1)
                           return `${soma}%`
                        }
                     }
                  }
               }
            },
            labels: produtos
         }
         return chartOptions
      },
      construirGraficoSilo() {
         let optionsSilo = {
            chart: {
               type: 'radialBar'
            },
            colors: ['#7F8487'],
            plotOptions: {
               radialBar: {
                  hollow: { size: '45%' },
                  dataLabels: {
                     value: {
                        fontSize: '14px',
                        offsetY: -8,
                        formatter: function (val) {
                           const parsedVal = parseFloat(val)
                           if (parsedVal == 0) {
                              return '--%'
                           } else if (!isNaN(parsedVal)) {
                              return `${parsedVal.toFixed(1)}%`
                           } else {
                              return `${val.toFixed(1)}%`
                           }
                        }
                     }
                  }
               }
            },
            labels: ['']
         }
         return optionsSilo
      },
      construirSeriesSilo(nivel) {
         if (!nivel) return [0]
         return [nivel]
      },
      buscarCorNivel(umidade, temperatura, vazio) {
         if (vazio == 1) return '#adaaaa'
         const conservacao = this.calcularConservacao(umidade, temperatura)
         const conservacoes = {
            1: '#28a745',
            2: '#ffc107',
            3: '#ec7404',
            4: '#dc3545'
         }
         let cor = conservacoes[conservacao] || '#adaaaa'
         return cor
      },
      buscarConservacao(conservacao) {
         const conservacoes = {
            1: 'Grãos conservados',
            2: 'Proliferação de insetos',
            3: 'Proliferação de fungos',
            4: 'Alto risco'
         }
         return conservacoes[conservacao]
      },

      buscarImagemConservacao(conservacao) {
         const imagensConservacao = {
            1: require('@/assets/images/termometria/checked.svg'),
            2: require('@/assets/images/termometria/inseto.svg'),
            3: require('@/assets/images/termometria/mofo.svg'),
            4: require('@/assets/images/termometria/perigo.svg')
         }
         return imagensConservacao[conservacao] || require('@/assets/images/termometria/remove.svg')
      },

      titleAeracao(aer, ema) {
         if (aer == 0) {
            return 'Não possui'
         }
         return ema != 0 && ema != null ? 'Ligada' : 'Desligada'
      },
      calcularConservacao(umidade, temperatura) {
         // calculo de conservacao retirado do portal antigo
         if (!umidade || !temperatura) {
            return 0
         }
         umidade = Math.round(umidade)
         if (umidade < 5) {
            umidade = 5
         }
         if (umidade > 25) {
            umidade = 25
         }
         if (temperatura > 40) {
            temperatura = 40
         }
         if (
            (umidade >= 5 && umidade < 6 && temperatura >= 0 && temperatura <= 23) ||
            (umidade >= 6 && umidade < 7 && temperatura >= 0 && temperatura <= 22) ||
            (umidade >= 7 && umidade < 8 && temperatura >= 0 && temperatura <= 20) ||
            (umidade >= 8 && umidade < 9 && temperatura >= 0 && temperatura <= 19) ||
            (umidade >= 9 && umidade < 10 && temperatura >= 0 && temperatura <= 18) ||
            (umidade >= 10 && umidade < 11 && temperatura >= 0 && temperatura <= 18) ||
            (umidade >= 11 && umidade < 12 && temperatura >= 0 && temperatura <= 18) ||
            (umidade >= 12 && umidade < 13 && temperatura >= 0 && temperatura <= 18) ||
            (umidade >= 13 && umidade < 14 && temperatura >= 0 && temperatura <= 18) ||
            (umidade >= 14 && umidade < 15 && temperatura >= 0 && temperatura <= 17) ||
            (umidade >= 15 && umidade < 16 && temperatura >= 0 && temperatura <= 14) ||
            (umidade >= 16 && umidade < 17 && temperatura >= 0 && temperatura <= 12) ||
            (umidade >= 17 && umidade < 18 && temperatura >= 0 && temperatura <= 10) ||
            (umidade >= 18 && umidade < 19 && temperatura >= 0 && temperatura <= 8) ||
            (umidade >= 19 && umidade < 20 && temperatura >= 0 && temperatura <= 6) ||
            (umidade >= 20 && umidade < 21 && temperatura >= 0 && temperatura <= 4) ||
            (umidade >= 21 && umidade < 22 && temperatura >= 0 && temperatura <= 3) ||
            (umidade >= 22 && umidade < 23 && temperatura >= 0 && temperatura <= 1) ||
            (umidade >= 23 && umidade < 24 && temperatura >= 0 && temperatura <= 0)
         ) {
            return 1
         } else if (
            (umidade >= 5 && umidade < 6 && temperatura >= 23.1 && temperatura <= 37) ||
            (umidade >= 6 && umidade < 7 && temperatura >= 22.1 && temperatura <= 36.5) ||
            (umidade >= 7 && umidade < 8 && temperatura >= 20.1 && temperatura <= 36) ||
            (umidade >= 8 && umidade < 9 && temperatura >= 19.1 && temperatura <= 35) ||
            (umidade >= 9 && umidade < 10 && temperatura >= 18.1 && temperatura <= 34) ||
            (umidade >= 10 && umidade < 11 && temperatura >= 18.1 && temperatura <= 32) ||
            (umidade >= 11 && umidade < 12 && temperatura >= 18.1 && temperatura <= 30) ||
            (umidade >= 12 && umidade < 13 && temperatura >= 18.1 && temperatura <= 26) ||
            (umidade >= 13 && umidade < 14 && temperatura >= 18.1 && temperatura <= 21) ||
            (umidade >= 14 && umidade < 15 && temperatura >= 17.1 && temperatura <= 18)
         ) {
            return 2
         } else if (
            (umidade >= 5 && umidade < 6 && temperatura >= 37.1 && temperatura <= 40) ||
            (umidade >= 6 && umidade < 7 && temperatura >= 36.6 && temperatura <= 40) ||
            (umidade >= 7 && umidade < 8 && temperatura >= 36.1 && temperatura <= 40) ||
            (umidade >= 8 && umidade < 9 && temperatura >= 35.1 && temperatura <= 40) ||
            (umidade >= 9 && umidade < 10 && temperatura >= 34.1 && temperatura <= 40) ||
            (umidade >= 10 && umidade < 11 && temperatura >= 32.1 && temperatura <= 40) ||
            (umidade >= 11 && umidade < 12 && temperatura >= 30.1 && temperatura <= 40) ||
            (umidade >= 12 && umidade < 13 && temperatura >= 26.1 && temperatura <= 40) ||
            (umidade >= 13 && umidade < 14 && temperatura >= 21.1 && temperatura <= 25) ||
            (umidade >= 14 && umidade < 15 && temperatura >= 18.1 && temperatura <= 21) ||
            (umidade >= 15 && umidade < 16 && temperatura >= 18.1 && temperatura <= 18) ||
            (umidade >= 16 && umidade < 17 && temperatura >= 18.1 && temperatura <= 18) ||
            (umidade >= 17 && umidade < 18 && temperatura >= 9.1 && temperatura <= 18) ||
            (umidade >= 18 && umidade < 19 && temperatura >= 8.1 && temperatura <= 18) ||
            (umidade >= 19 && umidade < 20 && temperatura >= 6.1 && temperatura <= 18) ||
            (umidade >= 20 && umidade < 21 && temperatura >= 4.1 && temperatura <= 18) ||
            (umidade >= 21 && umidade < 22 && temperatura >= 3.1 && temperatura <= 18) ||
            (umidade >= 22 && umidade < 23 && temperatura >= 1.1 && temperatura <= 18) ||
            (umidade >= 23 && umidade < 24 && temperatura >= 0.1 && temperatura <= 18) ||
            (umidade >= 24 && umidade < 25 && temperatura >= 0.1 && temperatura <= 18) ||
            (umidade >= 25 && umidade < 26 && temperatura >= 0.1 && temperatura <= 18)
         ) {
            return 3
         } else if (
            (umidade >= 12 && umidade < 13 && temperatura >= 34.1 && temperatura <= 40) ||
            (umidade >= 13 && umidade < 14 && temperatura >= 25.1 && temperatura <= 40) ||
            (umidade >= 14 && umidade < 15 && temperatura >= 21.1 && temperatura <= 40) ||
            (umidade >= 15 && umidade < 16 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 16 && umidade < 17 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 17 && umidade < 18 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 18 && umidade < 19 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 19 && umidade < 20 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 20 && umidade < 21 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 21 && umidade < 22 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 22 && umidade < 23 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 23 && umidade < 24 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 24 && umidade < 25 && temperatura >= 18.1 && temperatura <= 40) ||
            (umidade >= 25 && umidade < 26 && temperatura >= 18.1 && temperatura <= 40)
         ) {
            return 4
         } else if (umidade < 5 && temperatura >= 0 && temperatura <= 23) {
            return 1
         } else if (umidade < 5 && temperatura >= 23.1 && temperatura <= 37) {
            return 2
         } else if (umidade < 5 && temperatura >= 37.1 && temperatura <= 40) {
            return 3
         } else if (umidade < 5 && temperatura >= 40) {
            return 4
         } else if (umidade > 25 && temperatura <= 19) {
            return 3
         } else if (umidade > 25 && temperatura >= 20) {
            return 4
         }
      }
   },

   watch: {
      termometrias(newVal) {
         if (newVal) {
            this.termometrias.estrutura_equipamentos.forEach((termometria) => {
               this.buscaResumoTermometria(termometria.id_equipamento)
               termometria.slave.forEach((slave) => {
                  if (slave.id_categoria_equipamento === 3) {
                     this.buscaResumoSilo(slave.id_equipamento)
                  } else if (slave.id_categoria_equipamento === 5) {
                     this.buscaResumoArmazem(slave.id_equipamento)
                     slave.slave.forEach((slave) => {
                        this.buscaResumoCelula(slave.id_equipamento)
                     })
                  }
               })
            })
         }
      }
   }
}
</script>

<style scoped>
.cardMouse {
   /* border-radius: 16px; */
   /* box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); */
   backdrop-filter: blur(5px);
   -webkit-backdrop-filter: blur(5px);
   /* border: 1px solid rgba(255, 255, 255, 0.3); */
}

.cardMouse:hover {
   box-shadow: 0 0px 10px 0px #9c9c9c;
   z-index: 99;
}

.contentTermo {
   position: relative;
   /* background-image: url('./../../src/assets/images/iconFundo/TermoIMG.png'); */
   background-size: 100% auto;
   background-position: bottom right;
   background-repeat: no-repeat;
}

.overlay {
   z-index: 0;
   min-height: 100px;
}

::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}

.negrito {
   font-weight: bold;
   font-size: 12px;
}

.font12 {
   font-size: 12px;
}

.mouse {
   cursor: pointer;
}

hr {
   background-color: #e9e9e9;
}
</style>