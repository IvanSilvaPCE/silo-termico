<template>
   <div ref="fullscreenDiv" class="mapa-tabela" style="background-color: white; color: black">
      <b-collapse :visible="collapseAtivo === 'empresa'" class="m-2">
         <b-row>
            <b-col cols="12" sm="12" md="12" lg="6">
               <b-form-group label="Empresa" v-if="verificarPerfilOperacao(['ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'])">
                  <b-overlay :show="overlayFabricantes" rounded="sm">
                     <v-select multiple v-model="filtroEmpresa" :options="optionsEmpresas" :reduce="(empresa) => empresa.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1 text-center">
               <b-button variant="outline-secondary" @click="cancelar('empresa')">Cancelar</b-button>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1">
               <b-button variant="outline-primary" class="" @click="buscar()">Buscar</b-button>
            </b-col>
         </b-row>
      </b-collapse>
      <b-collapse :visible="collapseAtivo === 'unidade'" class="m-2">
         <b-row>
            <b-col cols="12" sm="12" md="12" lg="6">
               <b-form-group label="Unidade">
                  <b-overlay :show="overlayUnidades" rounded="sm">
                     <v-select multiple v-model="filtroUnidade" :options="optionsUnidades" :reduce="(unidade) => unidade.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1 text-center">
               <b-button variant="outline-secondary" @click="cancelar('unidade')">Cancelar</b-button>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1">
               <b-button variant="outline-primary" class="" @click="buscar()">Buscar</b-button>
            </b-col>
         </b-row>
      </b-collapse>
      <b-collapse :visible="collapseAtivo === 'fabricante'" class="m-2">
         <b-row>
            <b-col cols="12" sm="12" md="12" lg="6">
               <b-form-group label="Fabricante" v-if="!verificarPerfilOperacao(['ASSISTTECN', 'ADMINFABRI'])">
                  <b-overlay :show="overlayFabricantes" rounded="sm">
                     <v-select multiple v-model="filtroFabricante" :options="optionsFabricantes" :reduce="(fabricante) => fabricante.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1 text-center">
               <b-button variant="outline-secondary" @click="cancelar('fabricante')">Cancelar</b-button>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1">
               <b-button variant="outline-primary" class="" @click="buscar()">Buscar</b-button>
            </b-col>
         </b-row>
      </b-collapse>
      <b-collapse :visible="collapseAtivo === 'status'" class="m-2">
         <b-row>
            <b-col cols="12" sm="12" md="12" lg="6">
               <b-form-group label="Situação">
                  <b-overlay :show="overlayStatus" rounded="sm">
                     <v-select multiple v-model="filtroStatus" :options="optionsStatus" :reduce="(status) => status.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1 text-center">
               <b-button variant="outline-secondary" @click="cancelar('status')">Cancelar</b-button>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1">
               <b-button variant="outline-primary" class="" @click="buscar()">Buscar</b-button>
            </b-col>
         </b-row>
      </b-collapse>
      <b-collapse :visible="collapseAtivo === 'categoria'" class="m-2">
         <b-row>
            <b-col cols="12" sm="12" md="12" lg="6">
               <b-form-group label="Equipamento">
                  <b-overlay :show="overlayCategorias" rounded="sm">
                     <v-select multiple v-model="filtroCategoria" :options="optionsCategorias" :reduce="(categoria) => categoria.value">
                        <template #no-options="">Nenhuma correspondência</template>
                     </v-select>
                  </b-overlay>
               </b-form-group>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1 text-center">
               <b-button variant="outline-secondary" @click="cancelar('categoria')">Cancelar</b-button>
            </b-col>
            <b-col cols="4" sm="4" md="2" lg="2" class="mt-lg-4 pt-lg-1">
               <b-button variant="outline-primary" class="" @click="buscar()">Buscar</b-button>
            </b-col>
         </b-row>
      </b-collapse>
      <b-table :items="equipamentos" :fields="fields" @row-clicked="verEquipamento" :current-page="currentPage" :per-page="perPage" sort-by="nm_estrutura_pessoa" ref="myTable" select-mode="single" responsive="sm" hover selectable>
         <template #cell(equipamento)="row">
            <img :src="iconEquipamento(row.item)" v-b-tooltip.hover :title="formatarStatus(row.item.st_operacao)" height="30" />
         </template>
         <template #head(nm_estrutura_pessoa)>
            <div class="text-nowrap">
               <span @click.stop="mostrarCollapse('unidade')">Unidade</span>
               <b-icon :icon="!filtroUnidade.length ? 'funnel' : 'funnel-fill'" class="ml-2" @click.stop="mostrarCollapse('unidade')"></b-icon>
            </div>
         </template>
         <template #head(empresa)>
            <div class="text-nowrap">
               <span @click.stop="mostrarCollapse('empresa')" class="mouse">Empresa</span>
               <b-icon :icon="filtroEmpresa == '' || filtroEmpresa == null ? 'funnel' : 'funnel-fill'" class="ml-2 mouse" @click.stop="mostrarCollapse('empresa')"></b-icon>
            </div>
         </template>
         <template #head(fabricante)>
            <div class="text-nowrap">
               <span @click.stop="mostrarCollapse('fabricante')" class="mouse">Fabricante</span>
               <b-icon :icon="filtroFabricante == '' || filtroFabricante == null ? 'funnel' : 'funnel-fill'" class="ml-2 mouse" @click.stop="mostrarCollapse('fabricante')"></b-icon>
            </div>
         </template>
         <template #head(equipamento)>
            <div class="text-nowrap">
               <span @click.stop="mostrarCollapse('status')" class="mouse">Situação</span>
               <b-icon :icon="filtroStatus == '' || filtroStatus == null ? 'funnel' : 'funnel-fill'" class="ml-2 mouse" @click.stop="mostrarCollapse('status')"></b-icon>
            </div>
         </template>
         <template #head(categoria)>
            <div class="text-nowrap">
               <span @click.stop="mostrarCollapse('categoria')">Equipamento</span>
               <b-icon :icon="filtroCategoria == '' || filtroCategoria == null ? 'funnel' : 'funnel-fill'" class="ml-2" @click.stop="mostrarCollapse('categoria')"></b-icon>
            </div>
         </template>
         <template #cell(equipamentos)="row" v-if="filtro == 'unidade'">
            <div>
               <b-img :src="iconUnidade(row.item.equipamentos)" height="30" v-b-tooltip.hover :title="tooltipUnidade(row.item.equipamentos)"></b-img>
            </div>
         </template>
         <template #cell(fabricante)="row" v-if="filtro == 'equipamento'">
            <b-overlay :show="!row.item.imagemCarregadaFabricante && !!row.item.logo_fabricante" style="min-height: 30px" rounded="sm">
               <div>
                  <b-img v-if="row.item.imagemCarregadaFabricante" :src="imagemCache[row.item.logo_fabricante]" height="30" v-b-tooltip.hover :title="row.item.fabricante"></b-img>
               </div>
            </b-overlay>
         </template>
         <template #cell(empresa)="row">
            <b-overlay :show="!row.item.imagemCarregadaEmpresa && !!row.item.logo_empresa" style="min-height: 30px" rounded="sm">
               <div>
                  <b-img v-if="row.item.imagemCarregadaEmpresa" :src="imagemCache[row.item.logo_empresa]" height="30" v-b-tooltip.hover :title="row.item.empresa"></b-img>
                  <span v-if="!row.item.logo_empresa">_</span>
               </div>
            </b-overlay>
         </template>
      </b-table>
      <p class="text-center" v-if="!this.equipamentos.length">Nenhum resultado para listar</p>
      <b-row class="pull-right">
         <b-col cols="3">
            <b-button variant="light" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
            <b-button variant="light" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
         </b-col>
         <b-col cols="9">
            <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0 mr-2 mb-sm-2"></b-pagination>
         </b-col>
      </b-row>
   </div>
</template>

<script>
import client from '@/api'
import { mapActions } from 'vuex'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'MapaTabela',
   props: {
      estrutura: Array,
      filtro: String
   },
   data() {
      return {
         fullscreen: false,
         currentPage: 1,
         perPage: 5,
         tabelaCarregada: false,
         imagemCache: {},
         imagemUrl: null,
         collapseAtivo: null,
         overlayFabricantes: false,
         overlayUnidades: false,
         overlayStatus: false,
         overlayCategorias: false,
         filtroEmpresa: '',
         filtroUnidade: '',
         filtroFabricante: '',
         filtroStatus: '',
         filtroCategoria: [1, 2, 7],
         fabricante: [],
         unidade: [],
         status: [],
         categoria: []
      }
   },
   computed: {
      equipamentos() {
         if (!this.estrutura || this.estrutura.length === 0) {
            return []
         }
         if (this.filtro === 'equipamento') {
            return this.estrutura.map((estruturaItem) => ({
               id_equipamento: estruturaItem.id_equipamento,
               ds_equipamento: estruturaItem.ds_equipamento,
               st_operacao: estruturaItem.st_operacao,
               fabricante: estruturaItem.fabricante ? estruturaItem.fabricante.nm_fantasia : '',
               empresa: estruturaItem.estrutura_pessoa?.[0] ? estruturaItem.estrutura_pessoa[0].pessoa.nm_fantasia : '',
               id_estrutura_pessoa: estruturaItem.estrutura_pessoa?.[0] ? estruturaItem.estrutura_pessoa[0].id_estrutura_pessoa : '',
               nm_estrutura_pessoa: estruturaItem.estrutura_pessoa?.[0] ? estruturaItem.estrutura_pessoa[0].nm_estrutura_pessoa : '',
               logo_fabricante: estruturaItem.fabricante ? estruturaItem.fabricante.logo : '',
               logo_empresa: estruturaItem.estrutura_pessoa?.[0] ? estruturaItem.estrutura_pessoa[0].pessoa.logo : '',
               categoria: estruturaItem.categoria ? estruturaItem.categoria.ds_categoria_equipamento : '',
               imagemUrlFabricante: null,
               imagemCarregadaFabricante: false,
               imagemUrlEmpresa: null,
               imagemCarregadaEmpresa: false
            }))
         } else if (this.filtro === 'unidade') {
            return this.estrutura.map((estruturaItem) => ({
               equipamentos: estruturaItem.estrutura_equipamentos ? estruturaItem.estrutura_equipamentos : '',
               empresa: estruturaItem.pessoa ? estruturaItem.pessoa.nm_fantasia : '',
               id_estrutura_pessoa: estruturaItem.id_estrutura_pessoa ? estruturaItem.id_estrutura_pessoa : '',
               nm_estrutura_pessoa: estruturaItem.nm_estrutura_pessoa ? estruturaItem.nm_estrutura_pessoa : '',
               categoria: estruturaItem.categoria ? estruturaItem.categoria.ds_categoria_equipamento : '',
               logo_empresa: estruturaItem.pessoa ? estruturaItem.pessoa.logo : ''
            }))
         } else {
            return []
         }
      },
      fields() {
         if (this.filtro === 'equipamento') {
            return [
               { key: 'equipamento', label: 'Situação', class: 'text-center' },
               { key: 'categoria', label: 'Equipamento', sortable: true },
               { key: 'nm_estrutura_pessoa', label: 'Unidade', sortable: true },
               { key: 'empresa', label: 'Empresa' },
               { key: 'fabricante', label: 'Fabricante' }
            ]
         } else if (this.filtro === 'unidade') {
            return [
               { key: 'equipamentos', label: 'Situação', class: 'text-center' },
               { key: 'nm_estrutura_pessoa', label: 'Nome', sortable: true },
               { key: 'empresa', label: 'Empresa' }
            ]
         }
         return []
      },
      totalRows() {
         return this.equipamentos.length
      },
      optionsEmpresas() {
         if (!this.fabricante.length) {
            return
         }
         return this.fabricante
            .filter((fabricante) => fabricante.tp_pessoa !== 'FA')
            .map((fabricante) => ({
               value: fabricante.id_pessoa,
               label: fabricante.natureza == 'J' ? fabricante.nm_fantasia + ' | ' + fabricante.cnpj : fabricante.nm_pessoa + ' | ' + fabricante.cpf
            }))
      },
      optionsUnidades() {
         if (!this.unidade.length) {
            return
         }
         return this.unidade.map((unidade) => ({
            value: unidade.id_estrutura_pessoa,
            label: unidade.nm_estrutura_pessoa
         }))
      },
      optionsFabricantes() {
         if (!this.fabricante.length) {
            return
         }
         return this.fabricante
            .filter((fabricante) => fabricante.tp_pessoa === 'FA')
            .map((fabricante) => ({
               value: fabricante.id_pessoa,
               label: fabricante.nm_fantasia + ' | ' + fabricante.cnpj
            }))
      },
      optionsStatus() {
         if (!this.status.length) {
            return
         }
         return this.status.map((status) => ({
            value: status.cd_dominio,
            label: status.ds_dominio
         }))
      },
      optionsCategorias() {
         if (!this.categoria.length) {
            return
         }
         return this.categoria
            .filter((categoria) => categoria.id_categoria_equipamento != 6)
            .map((categoria) => ({
               value: categoria.id_categoria_equipamento,
               label: categoria.ds_categoria_equipamento
            }))
      }
   },

   methods: {
      ...mapActions('unidade', ['saveUnidade', 'saveNomeUnidade']),
      iconEquipamento(equipamento) {
         if (!equipamento || equipamento.length === 0) {
            return
         }
         const categoria = equipamento?.categoria
         const operacao = equipamento?.st_operacao

         const icones = {
            Secador: {
               OF: 'secador_offline_round.png',
               EF: 'secador_falha_round.png',
               EC: 'secador_configuracao_round.png',
               EM: 'secador_manutencao_round.png',
               ON: 'secador_online_round.png'
            },
            Termometria: {
               OF: 'termometria_offline_round.png',
               EF: 'termometria_falha_round.png',
               EC: 'termometria_configuracao_round.png',
               EM: 'termometria_manutencao_round.png',
               ON: 'termometria_online_round.png'
            },
            Silo: {
               OF: 'silo_offline_round.png',
               EF: 'silo_falha_round.png',
               EC: 'silo_configuracao_round.png',
               EM: 'silo_manutencao_round.png',
               ON: 'silo_online_round.png'
            },
            'Estação meteorológica': {
               OF: 'estacao_offline_round.png',
               EF: 'estacao_falha_round.png',
               EC: 'estacao_configuracao_round.png',
               EM: 'estacao_manutencao_round.png',
               ON: 'estacao_online_round.png'
            },
            Armazém: {
               OF: 'armazem_offline_round.png',
               EF: 'armazem_falha_round.png',
               EC: 'armazem_configuracao_round.png',
               EM: 'armazem_manutencao_round.png',
               ON: 'armazem_online_round.png'
            },
            'Máquina de limpeza': {
               OF: 'limpeza_offline_round.png',
               EF: 'limpeza_falha_round.png',
               EC: 'limpeza_configuracao_round.png',
               EM: 'limpeza_manutencao_round.png',
               ON: 'limpeza_online_round.png'
            },
            CCM: {
               OF: 'ccm_offline_round.png',
               EF: 'ccm_falha_round.png',
               EC: 'ccm_configuracao_round.png',
               EM: 'ccm_manutencao_round.png',
               ON: 'ccm_online_round.png'
            }
         }

         if (icones[categoria] && icones[categoria][operacao]) {
            return require(`@/assets/images/mapa/round/${icones[categoria][operacao]}`)
         }
         return
      },
      buscarImagemDoCache(imagem) {
         const chaveCache = imagem
         if (this.imagemCache[chaveCache]) {
            return this.imagemCache[chaveCache]
         } else {
            return null
         }
      },
      async buscarImagem(row, imagem, urlProp, carregadaProp) {
         if (row[carregadaProp] || !imagem) {
            return
         }

         const imagemNoCache = this.buscarImagemDoCache(imagem)
         if (imagemNoCache) {
            this.$set(row, urlProp, imagemNoCache)
            this.$set(row, carregadaProp, true)
         } else {
            const dados = await client.get(`/imagem?caminho=${imagem}`).catch((err) => {
               this.$bvToast.toast(`Erro ao buscar a imagem. ${err}`, {
                  title: 'Erro',
                  variant: 'warning',
                  autoHideDelay: 5000,
                  solid: true,
                  toaster: 'b-toaster-bottom-right'
               })
               this.$set(row, carregadaProp, true)
            })

            if (dados && dados.data) {
               this.imagemCache[imagem] = dados.data
               this.$set(row, urlProp, imagem)
               this.$set(row, carregadaProp, true)
            }
         }
      },
      async buscarImagens(row) {
         await this.buscarImagem(row, row.logo_fabricante, 'imagemUrlFabricante', 'imagemCarregadaFabricante')
         await this.buscarImagem(row, row.logo_empresa, 'imagemUrlEmpresa', 'imagemCarregadaEmpresa')
      },
      handleResize() {
         const screenHeight = window.innerHeight

         if (screenHeight <= 600) {
            this.perPage = 3
         } else if (screenHeight > 600 && screenHeight < 768) {
            this.perPage = 4
         } else if (screenHeight === 768) {
            this.perPage = 6
         } else if (screenHeight >= 800 && screenHeight <= 900) {
            this.perPage = 7
         } else if (screenHeight > 900 && screenHeight <= 1080) {
            this.perPage = 10
         } else if (screenHeight > 1080 && screenHeight <= 1440) {
            this.perPage = 18
         } else if (screenHeight > 1440 && screenHeight <= 2560) {
            this.perPage = 26
         }
      },
      formatarStatus(value) {
         if (value === 'OF') return 'Offline'
         if (value === 'EF') return 'Alerta'
         if (value === 'EC') return 'Em configuração'
         if (value === 'EM') return 'Em manutenção'
         if (value === 'CM') return 'Com mensagem'
         if (value === 'ON') return 'Online'
         return value
      },
      toggleFullScreen() {
         const elem = this.$refs.fullscreenDiv
         this.fullscreen = true

         if (!this.fullscreenElement) {
            if (elem.requestFullscreen) {
               elem.requestFullscreen()
            } else if (elem.mozRequestFullScreen) {
               elem.mozRequestFullScreen()
            } else if (elem.webkitRequestFullscreen) {
               elem.webkitRequestFullscreen()
            } else if (elem.msRequestFullscreen) {
               elem.msRequestFullscreen()
            }

            this.fullscreenElement = elem
         } else {
            if (document.exitFullscreen) {
               document.exitFullscreen()
            } else if (document.mozCancelFullScreen) {
               document.mozCancelFullScreen()
            } else if (document.webkitExitFullscreen) {
               document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
               document.msExitFullscreen()
            }

            this.fullscreenElement = null
            this.fullscreen = false
         }
      },
      exitFullScreen() {
         if (document.exitFullscreen) {
            document.exitFullscreen()
         } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
         } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
         } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
         }

         this.fullscreenElement = null
         this.fullscreen = false
      },
      verEquipamento(item) {
         localStorage.removeItem('lim')
         localStorage.removeItem('sec')
         localStorage.removeItem('arm')
         localStorage.removeItem('sil')
         this.saveUnidade(item.id_estrutura_pessoa)
         this.saveNomeUnidade(item.nm_estrutura_pessoa)
         if (item.categoria == 'Secador') {
            const idSecador = item.id_equipamento
            this.$router.push({ name: 'secador', params: { idSecador } })
         } else if (item.categoria == 'Termometria') {
            const idTermometria = item.id_equipamento
            this.$router.push({ name: 'resumo', params: { idTermometria } })
         } else if (item.categoria == 'Silo') {
            const idSilo = item.id_equipamento
            this.$router.push({ name: 'silo', params: { idSilo } })
         } else if (item.categoria == 'Estação meteorológica') {
            const idEstacao = item.id_equipamento
            const idUnidade = item.id_estrutura_pessoa
            this.$router.push({ name: 'estacao', params: { idEstacao, idUnidade } })
         } else if (item.categoria == 'Armazém') {
            const idArmazem = item.id_equipamento
            this.$router.push({ name: 'armazem', params: { idArmazem } })
         } else if (item.categoria == 'Máquina de limpeza') {
            const idLimpeza = item.id_equipamento
            this.$router.push({ name: 'limpeza', params: { idLimpeza } })
         } else if (item.categoria == 'CCM') {
            const idControle = item.id_equipamento
            this.$router.push({ name: 'controle', params: { idControle } })
         } else {
            this.$router.push({ name: 'resumo' })
         }
      },
      iconUnidade(equipamentos) {
         if (!equipamentos || equipamentos.length === 0) {
            return
         }
         const offline = equipamentos.every((equipamento) => equipamento.st_operacao === 'OF')
         const falha = equipamentos.some((equipamento) => equipamento.st_operacao === 'EF')
         const manutencao = equipamentos.some((equipamento) => equipamento.st_operacao === 'EM')
         const online = equipamentos.some((equipamento) => equipamento.st_operacao === 'ON')
         const configuracao = equipamentos.some((equipamento) => equipamento.st_operacao === 'EC')
         if (offline) {
            return require('@/assets/images/mapa/round/unidade_offline_round.png')
         } else if (falha) {
            return require('@/assets/images/mapa/round/unidade_falha_round.png')
         } else if (manutencao) {
            return require('@/assets/images/mapa/round/unidade_manutencao_round.png')
         } else if (online) {
            return require('@/assets/images/mapa/round/unidade_online_round.png')
         } else if (configuracao) {
            return require('@/assets/images/mapa/round/unidade_configuracao_round.png')
         }
         return require('@/assets/images/mapa/round/unidade_configuracao_round.png')
      },
      tooltipUnidade(equipamentos) {
         if (!equipamentos || equipamentos.length === 0) {
            return
         }
         const offline = equipamentos.every((equipamento) => equipamento.st_operacao === 'OF')
         const falha = equipamentos.some((equipamento) => equipamento.st_operacao === 'EF')
         const manutencao = equipamentos.some((equipamento) => equipamento.st_operacao === 'EM')
         const online = equipamentos.some((equipamento) => equipamento.st_operacao === 'ON')
         const configuracao = equipamentos.some((equipamento) => equipamento.st_operacao === 'EC')
         if (offline) {
            return 'Offline'
         } else if (falha) {
            return 'Alerta'
         } else if (manutencao) {
            return 'Em manutenção'
         } else if (online) {
            return 'Online'
         } else if (configuracao) {
            return 'Em configuração'
         }
         return 'Offline'
      },
      limparFiltros() {
         this.filtroEmpresa = ''
         this.filtroUnidade = ''
         this.filtroFabricante = ''
         this.filtroStatus = ''
         this.filtroCategoria = [1, 2, 7]
         this.collapseAtivo = null
      },
      cancelar(filtro) {
         if (filtro == 'empresa') {
            this.filtroEmpresa = ''
         } else if (filtro == 'unidade') {
            this.filtroUnidade = ''
         } else if (filtro == 'fabricante') {
            this.filtroFabricante = ''
         } else if (filtro == 'status') {
            this.filtroStatus = ''
         } else if (filtro == 'categoria') {
            this.filtroCategoria = [1, 2, 7]
         }
         this.collapseAtivo = null
         this.buscar()
      },
      buscar() {
         localStorage.setItem('filtroFabricante', this.filtroFabricante)
         localStorage.setItem('filtroEmpresa', this.filtroEmpresa)
         localStorage.setItem('filtroUnidade', this.filtroUnidade)
         localStorage.setItem('filtroCategoria', this.filtroCategoria)
         localStorage.setItem('filtroStatus', this.filtroStatus)
         this.$emit('acionarBusca')
      },
      buscarFiltros() {
         this.filtroFabricante = localStorage.getItem('filtroFabricante')
            ? localStorage
                 .getItem('filtroFabricante')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => parseInt(item.trim()))
            : ''
         this.filtroEmpresa = localStorage.getItem('filtroEmpresa')
            ? localStorage
                 .getItem('filtroEmpresa')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => parseInt(item.trim()))
            : ''
         this.filtroUnidade = localStorage.getItem('filtroUnidade')
            ? localStorage
                 .getItem('filtroUnidade')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => parseInt(item.trim()))
            : ''
         this.filtroCategoria = localStorage
            .getItem('filtroCategoria')
            ?.split(',')
            .map((item) => parseInt(item.trim())) || [1, 2, 7]
         this.filtroStatus = localStorage.getItem('filtroStatus')
            ? localStorage
                 .getItem('filtroStatus')
                 .split(',')
                 .filter((item) => item.trim() !== '')
                 .map((item) => item.trim())
            : ''
      },
      mostrarCollapse(collapse) {
         this.collapseAtivo = this.collapseAtivo === collapse ? null : collapse
      },
      async buscarFabricantes() {
         this.overlayFabricantes = true
         const dados = await client.get('/pessoa/buscarpessoa').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar fabricantes. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayFabricantes = false
         this.fabricante = dados.data
      },
      async buscarUnidades() {
         this.overlayUnidades = true
         const dados = await client.get('/estrutura_pessoa').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar unidades. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayUnidades = false
         this.unidade = dados.data
      },
      async buscarStatus() {
         this.overlayStatus = true
         const dados = await client.get('/equipamento/stoperacao').catch((err) => {
            this.$bvToast.toast(`Erro ao buscar situações. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.overlayStatus = false
         this.status = dados.data
      },
      async buscarCategorias() {
         this.overlayCategorias = true
         const dados = await client.get('/categoria_equipamento').catch((err) => {
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
         this.categoria = dados.data
      },
      verificarPerfilOperacao
   },

   mounted() {
      this.$refs.myTable.filteredItems.forEach((row) => {
         this.buscarImagens(row)
      })
      window.addEventListener('resize', this.handleResize)
      this.handleResize()
      this.buscarFiltros()
      this.buscarFabricantes()
      this.buscarUnidades()
      this.buscarStatus()
      this.buscarCategorias()
   },

   watch: {
      equipamentos: {
         handler() {
            this.tabelaCarregada = true
            this.$nextTick(() => {
               this.$refs.myTable.filteredItems.forEach((row) => {
                  this.buscarImagens(row)
               })
            })
         },
         immediate: true
      },
      imagemCache: {
         handler(newValue) {
            this.$emit('imagens', newValue)
         },
         immediate: true
      }
   },

   beforeDestroy() {
      window.removeEventListener('resize', this.handleResize)
   }
}
</script>

<style scoped>
.mouse {
   cursor: pointer;
}

@media (min-width: 350px) {
   .mb-sm-2 {
      margin-bottom: 1.2rem !important;
   }
}
</style>