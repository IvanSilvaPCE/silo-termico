<template>
   <div>
      <div class="white_shd full margin_bottom_30 mt-4">
         <div class="full graph_head">
            <div class="heading1 margin_0">
               <b-row>
                  <b-col sm="12" md="10" lg="10">
                     <h1>Criação de Manual</h1>
                  </b-col>
                  <b-col sm="12" md="2" lg="2" class="text-right">
                     <b-button variant="outline-primary" @click="inicio()"><b-icon icon="house-door" class="mr-1"></b-icon>Início</b-button>
                  </b-col>
               </b-row>
            </div>
         </div>
         <div class="map_section padding_infor_info">
            <b-overlay :show="buscandoManual" rounded="sm" class="overlay">
               <b-row>
                  <b-col class="text-right">
                     <b-button variant="primary" @click="formCategoria()"><b-icon icon="plus"></b-icon>Categoria</b-button>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col lg="6">
                     <b-form-group label="Visível">
                        <v-select v-model="objNovoManual.fl_visivel" :options="optionsVisivel" :state="validate('fl_visivel')" :reduce="(visivel) => visivel.value" :class="{ 'border-danger': validate('fl_visivel') == false }">
                           <template #no-options="">Nenhuma correspondência</template>
                        </v-select>
                        <small class="text-danger">{{ erros['fl_visivel'] | parseErros }}</small>
                     </b-form-group>
                  </b-col>
                  <b-col lg="6">
                     <b-form-group label="Categoria">
                        <b-overlay :show="overlayCategorias" rounded="sm">
                           <v-select v-model="objNovoManual.id_categoria_manual" :options="optionsCategoria" :state="validate('id_categoria_manual')" :reduce="(categoria) => categoria.value" :class="{ 'border-danger': validate('id_categoria_manual') == false }">
                              <template #no-options="">Nenhuma correspondência</template>
                           </v-select>
                        </b-overlay>
                        <small class="text-danger">{{ erros['id_categoria_manual'] | parseErros }}</small>
                     </b-form-group>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col>
                     <b-form-group label="Título">
                        <b-form-input v-model="objNovoManual.nm_manual" :state="validate('nm_manual')" maxlength="150" placeholder="Título do manual"></b-form-input>
                        <b-form-invalid-feedback id="nm_manual">{{ erros['nm_manual'] | parseErros }}</b-form-invalid-feedback>
                     </b-form-group>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col>
                     <b-form-group label="Descrição">
                        <b-form-textarea v-model="objNovoManual.ds_manual" :state="validate('ds_manual')" maxlength="5000" rows="7" placeholder="Descrição do manual..."></b-form-textarea>
                        <b-form-invalid-feedback id="ds_manual">{{ erros['ds_manual'] | parseErros }}</b-form-invalid-feedback>
                     </b-form-group>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col>
                     <b-button :disabled="isSalvando" size="lg" variant="primary" @click="salvarManual()">
                        <span v-if="!isSalvando">Salvar</span>
                        <div v-else>
                           <b-spinner small></b-spinner>
                           <span class="ml-1">Salvando...</span>
                        </div>
                     </b-button>
                  </b-col>
               </b-row>
               <hr />
               <div v-if="this.idManual">
                  <b-row>
                     <b-col>
                        <h1>Arquivos</h1>
                     </b-col>
                  </b-row>
                  <b-row>
                     <b-col>
                        <b-button variant="primary" @click="formNovo()">Novo Arquivo</b-button>
                     </b-col>
                  </b-row>
                  <b-row v-for="(arquivo, index) in objNovoManual.manual_arquivos" :key="index">
                     <b-col class="mb-1">
                        <b-link class="mr-2" @click="abrirArquivo(arquivo.caminho, arquivo.tp_arquivo)" :disabled="abrindoArquivo">{{ arquivo.nm_original }}</b-link>
                        <b-spinner small v-show="abrindoArquivo"></b-spinner>
                        <b-button variant="danger" :id="`btn-excluir-${arquivo.id_arquivo}`"><b-icon icon="trash"></b-icon></b-button>
                        <b-popover variant="" triggers="click" :target="`btn-excluir-${arquivo.id_arquivo}`" title="Excluir Arquivo?">
                           <div class="mt-2">
                              {{ arquivo.nm_original }}
                              <hr />
                              <b-button variant="danger" @click="fecharPopover()">Não</b-button>
                              <b-button class="ml-2" :disabled="excluindoArquivo" @click="excluirArquivo(arquivo.id_arquivo)" variant="success">
                                 <b-spinner v-if="excluindoArquivo" small class="mr-1"></b-spinner>
                                 <span>Sim</span>
                              </b-button>
                           </div>
                        </b-popover>
                     </b-col>
                  </b-row>
               </div>
            </b-overlay>
         </div>
      </div>
      <b-modal id="cadastro-arquivo" ref="modal" title="Adicionar Arquivo" @ok="salvarManualArquivo" ok-title="Salvar" cancel-title="Cancelar">
         <form>
            <b-form-group label="Arquivo">
               <b-form-file v-model="objNovoArquivo.arquivo" :state="validate('arquivo')" accept=".pdf,.mp4" placeholder="Nenhum arquivo escolhido (máximo 50MB)" browse-text="Escolher"></b-form-file>
               <b-form-invalid-feedback id="arquivo">{{ erros['arquivo'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Descrição">
               <b-form-input v-model="objNovoArquivo.ds_arquivo" :state="validate('ds_arquivo')"></b-form-input>
               <b-form-invalid-feedback id="ds_arquivo">{{ erros['ds_arquivo'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Tipo">
               <v-select v-model="objNovoArquivo.tp_arquivo" :options="optionsTipo" :state="validate('tp_arquivo')" :reduce="(tipo) => tipo.value" :class="{ 'border-danger': validate('tp_arquivo') == false }">
                  <template #no-options="">Nenhuma correspondência</template>
               </v-select>
               <small class="text-danger">{{ erros['tp_arquivo'] | parseErros }}</small>
            </b-form-group>
            <b-form-input v-model="objNovoArquivo.id_manual" style="display: none"></b-form-input>
         </form>
         <template #modal-footer="{ ok }">
            <b-button :disabled="salvandoArquivo" size="lg" variant="primary" @click="ok()">
               <span v-if="!salvandoArquivo">Salvar</span>
               <div v-else>
                  <b-spinner small></b-spinner>
                  <span class="ml-1">Salvando...</span>
               </div>
            </b-button>
         </template>
      </b-modal>
      <modal-cadastro-categoria-manual></modal-cadastro-categoria-manual>
   </div>
</template>

<script>
import client from '@/api'
import { manualService } from '../services'
import { manualArquivoService } from '../services'
import ModalCadastroCategoriaManual from '../components/ModalCadastroCategoriaManual.vue'

export default {
   name: 'CriarManualView',
   components: {
      ModalCadastroCategoriaManual
   },
   data() {
      return {
         overlayCategorias: false,
         buscandoManual: false,
         categorias: [],
         isSalvando: false,
         salvandoArquivo: false,
         objNovoManual: {
            fl_visivel: 'N'
         },
         objNovoArquivo: {},
         erros: [],
         excluindoArquivo: false,
         abrindoArquivo: false,
         idManual: null,
         popovers: {
            excluir: false
         },
         optionsVisivel: [
            { value: 'S', label: 'Sim' },
            { value: 'N', label: 'Não' }
         ],
         optionsTipo: [
            { value: 'PDF', label: 'Arquivo PDF' },
            { value: 'VID', label: 'Vídeo' }
         ]
      }
   },

   computed: {
      optionsCategoria() {
         if (!this.categorias.length) {
            return
         }
         return this.categorias.map((categoria) => ({
            value: categoria.id_categoria_manual,
            label: categoria.ds_categoria_manual
         }))
      }
   },

   methods: {
      async salvarManual() {
         this.isSalvando = true
         let msg = ''
         const { status, data } = await manualService.salvarManual(this.objNovoManual)
         switch (status) {
            case 200:
               msg = 'Registro editado com sucesso!'
               break
            case 201:
               msg = 'Registro criado com sucesso!'
               break
            case 422:
               msg = 'Por favor corrija os erros apresentados'
               this.erros = data
               break
            default:
               msg = 'Erro desconhecido'
         }
         this.isSalvando = false
         const deuErro = ![201].includes(status) && ![200].includes(status)

         this.erros = deuErro ? data : []

         this.$bvToast.toast(msg, {
            title: 'Resultado da ação',
            variant: deuErro ? 'danger' : 'success',
            autoHideDelay: 5000,
            solid: true,
            toaster: 'b-toaster-bottom-right'
         })

         if (!deuErro) {
            this.buscarManual(data.id_manual)
         }
      },
      async salvarManualArquivo(bvModalEvt) {
         this.salvandoArquivo = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await manualArquivoService.salvarManualArquivo(this.objNovoArquivo)
         switch (status) {
            case 200:
               msg = 'Registro editado com sucesso!'
               break
            case 201:
               msg = 'Registro criado com sucesso!'
               break
            case 413:
               msg = 'Arquivo excede 50MB!'
               break
            case 422:
               msg = 'Por favor corrija os erros apresentados'
               this.erros = data
               break
            default:
               msg = 'Erro desconhecido'
         }
         this.salvandoArquivo = false
         const deuErro = ![201].includes(status) && ![200].includes(status)
         this.erros = deuErro ? data : []
         this.$bvToast.toast(msg, {
            title: 'Resultado da ação',
            variant: deuErro ? 'danger' : 'success',
            autoHideDelay: 5000,
            solid: true,
            toaster: 'b-toaster-bottom-right'
         })
         if (!deuErro) {
            this.buscarManual(this.idManual)
            this.$nextTick(() => {
               this.$bvModal.hide('cadastro-arquivo')
            })
         }
      },
      async buscarManual(id) {
         if (!id) return
         this.objNovoManual = {}
         this.buscandoManual = true
         const dados = await client.get(`/manual/${id}`).catch((err) => {
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
         this.objNovoManual = dados.data
         this.objNovoArquivo.id_manual = dados.data.id_manual
      },
      async buscarCategorias() {
         this.overlayCategorias = true
         const dados = await client.get('/categoria_manual').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar categorias. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayCategorias = false
         this.categorias = dados.data
      },
      async excluirArquivo(arquivo) {
         this.excluindoArquivo = true
         const result = await client.delete(`/manual_arquivo/${arquivo}`)
         if (result.data == true) {
            this.showMessage({
               title: 'Arquivo',
               msg: 'Excluído com sucesso',
               variant: 'success'
            })
         }
         this.excluindoArquivo = false
         this.fecharPopover()
         this.buscarManual(this.idManual)
      },
      async abrirArquivo(caminho, tipo) {
         this.abrindoArquivo = true
         try {
            const response = await client.get(`/manual_arquivo/download?caminho=${caminho}`, {
               responseType: 'blob'
            })

            let blob, url

            if (tipo === 'PDF') {
               blob = new Blob([response.data], { type: 'application/pdf' })
               url = window.URL.createObjectURL(blob)
               window.open(url, '_blank')
            } else if (tipo === 'VID') {
               blob = new Blob([response.data], { type: 'video/mp4' })
               url = window.URL.createObjectURL(blob)
               window.open(url, '_blank')
            } else {
               throw new Error('Tipo de arquivo não suportado')
            }
         } catch (err) {
            this.$bvToast.toast(`Erro ao abrir o arquivo. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.abrindoArquivo = false
         }
         this.abrindoArquivo = false
      },
      formNovo() {
         this.$bvModal.show('cadastro-arquivo')
      },
      formCategoria() {
         this.$bvModal.show('cadastro-categoria')
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      },
      fecharPopover() {
         this.$root.$emit('bv::hide::popover')
      },
      inicio() {
         this.$router.push({ name: 'assistencia_manuais' })
      }
   },

   filters: {
      parseErros(v) {
         if (!v) return
         return v.join(', ')
      }
   },

   mounted() {
      const idManualLocalStorage = localStorage.getItem('man')

      if (idManualLocalStorage && idManualLocalStorage != 'undefined') {
         this.idManual = idManualLocalStorage
      } else {
         this.idManual = this.$route.params.idManual
         localStorage.setItem('man', this.idManual)
      }
      this.buscarCategorias()
      this.buscarManual(this.idManual)
   },

   beforeDestroy() {
      // localStorage.removeItem('man')
   }
}
</script>

<style scoped>
.border-danger {
   border: 1.5px solid red;
   border-radius: 4px;
}

.overlay {
   z-index: 0;
}
</style>