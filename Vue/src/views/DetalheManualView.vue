<template>
   <div>
      <div class="white_shd full margin_bottom_30 mt-4">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-overlay :show="buscandoManual" rounded="sm" class="overlay">
                  <b-row>
                     <b-col sm="12" md="10" lg="10">
                        <h1>{{ manual.nm_manual }}</h1>
                     </b-col>
                     <b-col sm="12" md="2" lg="2" class="text-right">
                        <b-button variant="outline-primary" @click="inicio()"><b-icon icon="house-door" class="mr-1"></b-icon>Início</b-button>
                     </b-col>
                  </b-row>
                  <b-row>
                     <b-col>
                        <small>Atualizado: {{ formatarData(manual.dt_manual) }}</small>
                     </b-col>
                  </b-row>
               </b-overlay>
            </div>
         </div>
         <div class="map_section padding_infor_info">
            <b-row v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN']) && this.manual?.id_manual == this.manual?.versao_recente">
               <b-col class="text-right">
                  <b-button variant="primary" @click="editarManual(idManual)"><b-icon icon="pencil" class="mr-1"></b-icon>Editar</b-button>
               </b-col>
            </b-row>
            <b-overlay :show="buscandoManual" rounded="sm" class="overlay">
               <p>{{ manual.ds_manual }}</p>
               <hr />
               <b-row v-for="(arquivo, index) in manual.manual_arquivos" :key="index">
                  <b-col>
                     <div>
                        <div v-if="arquivo.tp_arquivo === 'PDF' && arquivo.conteudo">
                           <b-button variant="primary" class="mb-2" @click="abrirPDF(arquivo.conteudo)"> <b-icon icon="file-earmark-pdf-fill"></b-icon> Abrir PDF </b-button>
                           <iframe v-if="!isMobile" :src="arquivo.conteudo" width="100%" height="1000px" frameborder="0"></iframe>
                        </div>

                        <div v-else-if="arquivo.tp_arquivo === 'VID' && arquivo.conteudo">
                           <video controls width="100%">
                              <source :src="arquivo.conteudo" type="video/mp4" />
                              Seu navegador não suporta o elemento de vídeo.
                           </video>
                        </div>

                        <div v-else-if="arquivo.carregando" class="text-center my-3">
                           <b-spinner label="Carregando..."></b-spinner>
                        </div>
                     </div>
                  </b-col>
               </b-row>
               <hr v-if="this.manual?.manual_arquivos?.length" />
               <b-row v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])">
                  <b-col>
                     <h1>Versões Anteriores</h1>
                  </b-col>
               </b-row>
               <b-overlay :show="buscandoVersoes" rounded="sm" class="overlay">
                  <b-row v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])">
                     <b-col>
                        <ul class="list-unstyled">
                           <b-media tag="li" v-for="(versao, index) in versoes" :key="index">
                              <template #aside>
                                 <b-icon icon="card-text" scale="1.3" variant="primary" class="mt-1"></b-icon>
                              </template>
                              <b-link @click="detalheManual(versao.id_manual)">{{ versao.nm_manual }}</b-link>
                              <br />
                              <small>{{ formatarData(versao.dt_manual) }}</small>
                           </b-media>
                        </ul>
                        <p v-if="!versoes.length">Nenhuma versão anterior</p>
                     </b-col>
                  </b-row>
               </b-overlay>
            </b-overlay>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'DetalheManualView',
   data() {
      return {
         idManual: null,
         buscandoManual: false,
         buscandoVersoes: false,
         manual: {},
         versoes: {},
         isMobile: false
      }
   },

   methods: {
      async buscarManual() {
         this.buscandoManual = true
         const dados = await client.get(`/manual/${this.idManual}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar manual. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoManual = false
         })
         this.buscandoManual = false
         if (dados && dados.data) {
            this.manual = dados.data
            this.carregarArquivos()
            this.buscarVersoes()
         }
      },
      async carregarArquivos() {
         if (!this.manual.manual_arquivos || this.manual.manual_arquivos.length === 0) return

         for (const [index, arquivo] of this.manual.manual_arquivos.entries()) {
            this.$set(this.manual.manual_arquivos[index], 'carregando', true)

            try {
               const response = await client.get(`/manual_arquivo/download?caminho=${arquivo.caminho}`, {
                  responseType: 'blob'
               })

               const blob = new Blob([response.data], {
                  type: arquivo.tp_arquivo === 'PDF' ? 'application/pdf' : 'video/mp4'
               })

               const url = window.URL.createObjectURL(blob)
               this.$set(this.manual.manual_arquivos[index], 'conteudo', url)
            } catch (err) {
               this.$bvToast.toast(`Erro ao carregar o arquivo ${arquivo.nm_original}. ${err}`, {
                  title: 'Erro',
                  variant: 'warning',
                  autoHideDelay: 5000,
                  solid: true,
                  toaster: 'b-toaster-bottom-right'
               })
               this.$set(this.manual.manual_arquivos[index], 'erro', true)
            } finally {
               this.$set(this.manual.manual_arquivos[index], 'carregando', false)
            }
         }
      },
      async buscarVersoes() {
         this.buscandoVersoes = true
         const dados = await client.get(`/manual/versoes?id_manual=${this.manual.id_manual}&id_manual_original=${this.manual.id_manual_original}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar versões anteriores. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoVersoes = false
         })
         this.buscandoVersoes = false
         if (dados && dados.data) {
            this.versoes = dados.data
         }
      },
      abrirPDF(pdfUrl) {
         const link = document.createElement('a')
         link.href = pdfUrl
         link.target = '_blank'
         link.rel = 'noopener noreferrer'
         link.click()
      },
      editarManual(idManual) {
         this.$router.push({ name: 'criar_manual', params: { idManual } })
      },
      formatarData(value) {
         if (!value) return
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY')
      },
      detalheManual(manual) {
         this.idManual = manual
         localStorage.setItem('man', this.idManual)
         this.buscarManual()
      },
      inicio() {
         this.$router.push({ name: 'assistencia_manuais' })
      },
      verificarPerfilOperacao
   },

   mounted() {
      const idManualLocalStorage = localStorage.getItem('man')

      if (idManualLocalStorage && idManualLocalStorage != 'undefined') {
         this.idManual = idManualLocalStorage
      } else {
         this.idManual = this.$route.params.idManual
         localStorage.setItem('man', this.idManual)
      }
      if (!this.idManual) {
         this.$router.push({ name: 'assistencia_manuais' })
      }
      this.buscarManual()
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
   },

   beforeDestroy() {
      // localStorage.removeItem('man')
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
   min-height: 30px;
}
</style>