<template>
   <div class="w-100 h-100">
      <l-map :zoom="zoom" :center="center" ref="mapa" class="mapa">
         <l-control-fullscreen position="topleft" :options="{ title: { false: 'Tela cheia', true: 'Tela normal' } }"></l-control-fullscreen>
         <l-tile-layer :url="url"></l-tile-layer>
         <l-marker-cluster v-if="filtro == 'unidade'" :options="{ iconCreateFunction: clusterCustomIcon }" ref="clusterRef">
            <l-marker v-for="(estrutura, index) in estruturas" :key="index" :lat-lng="getLatLng(estrutura?.local_estrutura)" @click="buscarImagem(estrutura?.pessoa?.logo), filtrarEquipamentos(estrutura)">
               <l-icon :icon-url="iconUnidade(estrutura.estrutura_equipamentos)" :icon-size="[35, 45]"> </l-icon>
               <l-popup style="width: 135px" @remove="popupFechado">
                  <b-row class="text-center">
                     <b-col cols="12">
                        <b-overlay v-if="estrutura?.pessoa?.logo" :show="!imagemCache[estrutura?.pessoa?.logo]" style="min-height: 40px">
                           <b-img v-if="estrutura?.pessoa?.logo" :src="imagemCache[estrutura?.pessoa?.logo]" fluid></b-img>
                        </b-overlay>
                     </b-col>
                  </b-row>
                  <b-row class="text-center mt-2">
                     <b-col cols="12">
                        <span>{{ estrutura.nm_estrutura_pessoa }}</span>
                     </b-col>
                  </b-row>
                  <b-row class="justify-content-center">
                     <b-col cols="4" class="mt-2" v-for="equipamento in estrutura.estrutura_equipamentos" :key="equipamento.id_equipamento">
                        <img :src="iconEquipamentoUnidade(equipamento)" width="45" v-b-tooltip.hover :title="equipamento.ds_equipamento" />
                     </b-col>
                     <b-col cols="12" class="text-center mt-2" v-if="!estrutura.estrutura_equipamentos || !estrutura.estrutura_equipamentos.length">
                        <span>Sem equipamentos</span>
                     </b-col>
                  </b-row>
                  <b-row>
                     <b-col class="text-center">
                        <p class="mb-0 mt-1 link" @click="verUnidade(estrutura.id_estrutura_pessoa, estrutura.nm_estrutura_pessoa)">Ver unidade</p>
                     </b-col>
                  </b-row>
               </l-popup>
            </l-marker>
         </l-marker-cluster>
         <l-marker-cluster v-else :options="{ iconCreateFunction: clusterCustomIconEquipamento }" ref="clusterRef">
            <l-marker v-for="(estrutura, index) in estruturas" :key="index" :lat-lng="getLatLng(estrutura?.estrutura_pessoa?.[0].local_estrutura)" @click="buscarImagem(estrutura?.estrutura_pessoa?.[0].pessoa.logo), filtrarEquipamentos(estrutura)">
               <l-icon :icon-url="iconEquipamento(estrutura)" :icon-size="[35, 45]"> </l-icon>
               <l-popup style="width: 135px" @remove="popupFechado">
                  <b-row class="text-center">
                     <b-col cols="12">
                        <b-overlay v-if="estrutura?.estrutura_pessoa?.[0].pessoa.logo" :show="!imagemCache[estrutura?.estrutura_pessoa?.[0].pessoa.logo]" style="min-height: 40px">
                           <b-img v-if="estrutura?.estrutura_pessoa?.[0].pessoa.logo" :src="imagemCache[estrutura?.estrutura_pessoa?.[0].pessoa.logo]" fluid></b-img>
                        </b-overlay>
                     </b-col>
                  </b-row>
                  <b-row class="text-center mt-2">
                     <b-col cols="12">
                        <span>{{ estrutura.estrutura_pessoa?.[0].nm_estrutura_pessoa }}</span>
                     </b-col>
                  </b-row>
                  <b-row class="text-center">
                     <b-col cols="12">
                        <span>{{ estrutura.ds_equipamento }}</span>
                     </b-col>
                  </b-row>
                  <b-row class="text-center">
                     <b-col cols="12">
                        <span>Tipo: {{ estrutura?.categoria?.ds_categoria_equipamento }}</span>
                     </b-col>
                  </b-row>
                  <b-row class="justify-content-center">
                     <b-col cols="4" class="mt-2" v-for="equipamento in estrutura.slave" :key="equipamento.id_equipamento">
                        <img :src="iconEquipamentoUnidade(equipamento)" width="45" v-b-tooltip.hover :title="equipamento.ds_equipamento" />
                     </b-col>
                  </b-row>
                  <b-row class="text-center">
                     <b-col cols="12">
                        <p class="mb-0 mt-1 link" @click="verEquipamento(estrutura)">Ver Equipamento</p>
                     </b-col>
                  </b-row>
               </l-popup>
            </l-marker>
         </l-marker-cluster>
      </l-map>
   </div>
</template>

<script>
import L from 'leaflet'
import { Icon } from 'leaflet'
import client from '@/api'
import { mapActions } from 'vuex'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
   iconUrl: require('leaflet/dist/images/marker-icon.png'),
   shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
   name: 'MapaLeaflet',
   props: {
      estrutura: Array,
      filtro: String,
      imagens: Object
   },
   data() {
      return {
         imagemCarregada: false,
         estruturas: [],
         imagemCache: {},
         zoom: 3,
         center: [-18.235, -56.9253],
         url: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'
      }
   },
   methods: {
      ...mapActions('unidade', ['saveUnidade', 'saveNomeUnidade']),
      clusterCustomIcon(cluster) {
         const offlineIcon = cluster.getAllChildMarkers().some((marker) => {
            const iconUrl = marker.options.icon.options.iconUrl
            return iconUrl === require('@/assets/images/mapa/unidade_offline.png')
         })

         const falhaIcon = cluster.getAllChildMarkers().some((marker) => {
            const iconUrl = marker.options.icon.options.iconUrl
            return iconUrl === require('@/assets/images/mapa/unidade_falha.png')
         })

         const onlineIcon = cluster.getAllChildMarkers().some((marker) => {
            const iconUrl = marker.options.icon.options.iconUrl
            return iconUrl === require('@/assets/images/mapa/unidade_online.png')
         })

         const configuracaoIcon = cluster.getAllChildMarkers().some((marker) => {
            const iconUrl = marker.options.icon.options.iconUrl
            return iconUrl === require('@/assets/images/mapa/unidade_configuracao.png')
         })

         const manutencaoIcon = cluster.getAllChildMarkers().some((marker) => {
            const iconUrl = marker.options.icon.options.iconUrl
            return iconUrl === require('@/assets/images/mapa/unidade_manutencao.png')
         })

         let color
         if (falhaIcon) {
            color = 'rgb(237, 52, 52, 0.9)'
         } else if (offlineIcon) {
            color = 'rgb(145, 145, 145, 0.9)'
         } else if (manutencaoIcon) {
            color = 'rgb(242, 187, 5, 0.9)'
         } else if (onlineIcon) {
            color = 'rgb(110, 204, 57, 0.9)'
         } else if (configuracaoIcon) {
            color = 'rgb(94, 92, 92, 0.9)'
         }

         return L.divIcon({
            html: `<div style="border-color:red;background-color:${color};border-radius:50%;width:40px;height:40px;color:white;text-align:center;line-height:40px;">${cluster.getChildCount()}</div>`,
            className: 'mycluster',
            iconSize: L.point(40, 40)
         })
      },
      clusterCustomIconEquipamento(cluster) {
         const markers = cluster.getAllChildMarkers()
         const iconUrls = markers.map((marker) => marker.options.icon.options.iconUrl)

         const falhaSecador = iconUrls.includes(require('@/assets/images/mapa/secador_falha.png'))
         const offlineSecador = iconUrls.includes(require('@/assets/images/mapa/secador_offline.png'))
         const manutencaoSecador = iconUrls.includes(require('@/assets/images/mapa/secador_manutencao.png'))
         const configuracaoSecador = iconUrls.includes(require('@/assets/images/mapa/secador_configuracao.png'))
         const onlineSecador = iconUrls.includes(require('@/assets/images/mapa/secador_online.png'))

         const falhaTermometria = iconUrls.includes(require('@/assets/images/mapa/termometria_falha.png'))
         const offlineTermometria = iconUrls.includes(require('@/assets/images/mapa/termometria_offline.png'))
         const manutencaoTermometria = iconUrls.includes(require('@/assets/images/mapa/termometria_manutencao.png'))
         const configuracaoTermometria = iconUrls.includes(require('@/assets/images/mapa/termometria_configuracao.png'))
         const onlineTermometria = iconUrls.includes(require('@/assets/images/mapa/termometria_online.png'))

         const falhaSilo = iconUrls.includes(require('@/assets/images/mapa/silo_falha.png'))
         const offlineSilo = iconUrls.includes(require('@/assets/images/mapa/silo_offline.png'))
         const manutencaoSilo = iconUrls.includes(require('@/assets/images/mapa/silo_manutencao.png'))
         const configuracaoSilo = iconUrls.includes(require('@/assets/images/mapa/silo_configuracao.png'))
         const onlineSilo = iconUrls.includes(require('@/assets/images/mapa/silo_online.png'))

         const falhaEstacao = iconUrls.includes(require('@/assets/images/mapa/estacao_falha.png'))
         const offlineEstacao = iconUrls.includes(require('@/assets/images/mapa/estacao_offline.png'))
         const manutencaoEstacao = iconUrls.includes(require('@/assets/images/mapa/estacao_manutencao.png'))
         const configuracaoEstacao = iconUrls.includes(require('@/assets/images/mapa/estacao_configuracao.png'))
         const onlineEstacao = iconUrls.includes(require('@/assets/images/mapa/estacao_online.png'))

         const falhaArmazem = iconUrls.includes(require('@/assets/images/mapa/armazem_falha.png'))
         const offlineArmazem = iconUrls.includes(require('@/assets/images/mapa/armazem_offline.png'))
         const manutencaoArmazem = iconUrls.includes(require('@/assets/images/mapa/armazem_manutencao.png'))
         const configuracaoArmazem = iconUrls.includes(require('@/assets/images/mapa/armazem_configuracao.png'))
         const onlineArmazem = iconUrls.includes(require('@/assets/images/mapa/armazem_online.png'))

         const falhaLimpeza = iconUrls.includes(require('@/assets/images/mapa/limpeza_falha.png'))
         const offlineLimpeza = iconUrls.includes(require('@/assets/images/mapa/limpeza_offline.png'))
         const manutencaoLimpeza = iconUrls.includes(require('@/assets/images/mapa/limpeza_manutencao.png'))
         const configuracaoLimpeza = iconUrls.includes(require('@/assets/images/mapa/limpeza_configuracao.png'))
         const onlineLimpeza = iconUrls.includes(require('@/assets/images/mapa/limpeza_online.png'))

         const falhaCcm = iconUrls.includes(require('@/assets/images/mapa/ccm_falha.png'))
         const offlineCcm = iconUrls.includes(require('@/assets/images/mapa/ccm_offline.png'))
         const manutencaoCcm = iconUrls.includes(require('@/assets/images/mapa/ccm_manutencao.png'))
         const configuracaoCcm = iconUrls.includes(require('@/assets/images/mapa/ccm_configuracao.png'))
         const onlineCcm = iconUrls.includes(require('@/assets/images/mapa/ccm_online.png'))

         let color
         if (falhaSecador || falhaTermometria || falhaSilo || falhaEstacao || falhaArmazem || falhaLimpeza || falhaCcm) {
            color = 'rgb(237, 52, 52, 0.9)'
         } else if (offlineSecador || offlineTermometria || offlineSilo || offlineEstacao || offlineArmazem || offlineLimpeza || offlineCcm) {
            color = 'rgb(145, 145, 145, 0.9)'
         } else if (manutencaoSecador || manutencaoTermometria || manutencaoSilo || manutencaoEstacao || manutencaoArmazem || manutencaoLimpeza || manutencaoCcm) {
            color = 'rgb(242, 187, 5, 0.9)'
         } else if (onlineSecador || onlineTermometria || onlineSilo || onlineEstacao || onlineArmazem || onlineLimpeza || onlineCcm) {
            color = 'rgb(110, 204, 57, 0.9)'
         } else if (configuracaoSecador || configuracaoTermometria || configuracaoSilo || configuracaoEstacao || configuracaoArmazem || configuracaoLimpeza || configuracaoCcm) {
            color = 'rgb(94, 92, 92, 0.9)'
         }

         return L.divIcon({
            html: `<div style="border-color:red;background-color:${color};border-radius:50%;width:40px;height:40px;color:white;text-align:center;line-height:40px;">${cluster.getChildCount()}</div>`,
            className: 'mycluster',
            iconSize: L.point(40, 40)
         })
      },
      getLatLng(local) {
         if (!local) {
            return
         }
         const latitude = parseFloat(local.latitude)
         const longitude = parseFloat(local.longitude)
         return [latitude, longitude]
      },
      iconUnidade(equipamentos) {
         if (!equipamentos || equipamentos.length === 0) {
            return require('@/assets/images/mapa/unidade_configuracao.png')
         }

         const offline = equipamentos.every((equipamento) => equipamento.st_operacao === 'OF')
         const falha = equipamentos.some((equipamento) => equipamento.st_operacao === 'EF')
         const manutencao = equipamentos.some((equipamento) => equipamento.st_operacao === 'EM')
         const online = equipamentos.some((equipamento) => equipamento.st_operacao === 'ON')
         const configuracao = equipamentos.some((equipamento) => equipamento.st_operacao === 'EC')

         if (offline) {
            return require('@/assets/images/mapa/unidade_offline.png')
         } else if (falha) {
            return require('@/assets/images/mapa/unidade_falha.png')
         } else if (manutencao) {
            return require('@/assets/images/mapa/unidade_manutencao.png')
         } else if (online) {
            return require('@/assets/images/mapa/unidade_online.png')
         } else if (configuracao) {
            return require('@/assets/images/mapa/unidade_configuracao.png')
         }
         return require('@/assets/images/mapa/unidade_configuracao.png')
      },
      iconEquipamentoUnidade(equipamento) {
         if (!equipamento || equipamento.length === 0) {
            return require('@/assets/images/mapa/round/secador_configuracao_round.png')
         }
         const categoria = equipamento?.categoria?.ds_categoria_equipamento
         const operacao = equipamento.st_operacao

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
            Célula: {
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
         return require('@/assets/images/mapa/round/secador_configuracao_round.png')
      },
      iconEquipamento(equipamento) {
         if (!equipamento || equipamento.length === 0) {
            return require('@/assets/images/mapa/secador_configuracao.png')
         }
         const categoria = equipamento?.categoria?.ds_categoria_equipamento
         const operacao = equipamento.st_operacao

         const icones = {
            Secador: {
               OF: 'secador_offline.png',
               EF: 'secador_falha.png',
               EC: 'secador_configuracao.png',
               EM: 'secador_manutencao.png',
               ON: 'secador_online.png'
            },
            Termometria: {
               OF: 'termometria_offline.png',
               EF: 'termometria_falha.png',
               EC: 'termometria_configuracao.png',
               EM: 'termometria_manutencao.png',
               ON: 'termometria_online.png'
            },
            Silo: {
               OF: 'silo_offline.png',
               EF: 'silo_falha.png',
               EC: 'silo_configuracao.png',
               EM: 'silo_manutencao.png',
               ON: 'silo_online.png'
            },
            'Estação meteorológica': {
               OF: 'estacao_offline.png',
               EF: 'estacao_falha.png',
               EC: 'estacao_configuracao.png',
               EM: 'estacao_manutencao.png',
               ON: 'estacao_online.png'
            },
            Armazém: {
               OF: 'armazem_offline.png',
               EF: 'armazem_falha.png',
               EC: 'armazem_configuracao.png',
               EM: 'armazem_manutencao.png',
               ON: 'armazem_online.png'
            },
            'Máquina de limpeza': {
               OF: 'limpeza_offline.png',
               EF: 'limpeza_falha.png',
               EC: 'limpeza_configuracao.png',
               EM: 'limpeza_manutencao.png',
               ON: 'limpeza_online.png'
            },
            CCM: {
               OF: 'ccm_offline.png',
               EF: 'ccm_falha.png',
               EC: 'ccm_configuracao.png',
               EM: 'ccm_manutencao.png',
               ON: 'ccm_online.png'
            }
         }

         if (icones[categoria] && icones[categoria][operacao]) {
            return require(`@/assets/images/mapa/${icones[categoria][operacao]}`)
         }
         return require('@/assets/images/mapa/secador_configuracao.png')
      },
      buscarImagemDoCache(imagem) {
         const chaveCache = imagem
         if (this.imagemCache[chaveCache]) {
            return this.imagemCache[chaveCache]
         } else {
            return null
         }
      },

      async buscarImagem(imagem) {
         if (!imagem) return
         const imagemNoCache = this.buscarImagemDoCache(imagem)
         if (imagemNoCache) {
            this.imagemCarregada = true
            return
         } else {
            const dados = await client.get(`/imagem?caminho=${imagem}`).catch((err) => {
               this.$bvToast.toast(`Erro ao buscar a imagem. ${err}`, {
                  title: 'Erro',
                  variant: 'warning',
                  autoHideDelay: 5000,
                  solid: true,
                  toaster: 'b-toaster-bottom-right'
               })
            })
            if (dados && dados.data) {
               this.$set(this.imagemCache, imagem, dados.data)
               this.imagemCarregada = true
            }
         }
      },
      verUnidade(unidade, nomeUnidade) {
         localStorage.removeItem('lim')
         localStorage.removeItem('sec')
         localStorage.removeItem('arm')
         localStorage.removeItem('sil')
         this.saveUnidade(unidade)
         this.saveNomeUnidade(nomeUnidade)
         this.$router.push('/')
      },
      verEquipamento(equipamento) {
         const idUnidade = equipamento.estrutura_pessoa[0].id_estrutura_pessoa
         const nomeUnidade = equipamento.estrutura_pessoa[0].nm_estrutura_pessoa
         localStorage.removeItem('lim')
         localStorage.removeItem('sec')
         localStorage.removeItem('arm')
         localStorage.removeItem('sil')
         this.saveUnidade(idUnidade)
         this.saveNomeUnidade(nomeUnidade)
         if (equipamento.id_categoria_equipamento == 1) {
            const idSecador = equipamento.id_equipamento
            this.$router.push({ name: 'secador', params: { idSecador } })
         } else if (equipamento.id_categoria_equipamento == 2) {
            const idTermometria = equipamento.id_equipamento
            this.$router.push({ name: 'resumo', params: { idTermometria } })
         } else if (equipamento.id_categoria_equipamento == 3) {
            const idSilo = equipamento.id_equipamento
            this.$router.push({ name: 'silo', params: { idSilo } })
         } else if (equipamento.id_categoria_equipamento == 4) {
            const idEstacao = equipamento.id_equipamento
            this.$router.push({ name: 'estacao', params: { idEstacao, idUnidade } })
         } else if (equipamento.id_categoria_equipamento == 5) {
            const idArmazem = equipamento.id_equipamento
            this.$router.push({ name: 'armazem', params: { idArmazem } })
         } else if (equipamento.id_categoria_equipamento == 7) {
            const idLimpeza = equipamento.id_equipamento
            this.$router.push({ name: 'limpeza', params: { idLimpeza } })
         } else if (equipamento.id_categoria_equipamento == 8) {
            const idControle = equipamento.id_equipamento
            this.$router.push({ name: 'controle', params: { idControle } })
         }
      },
      filtrarEquipamentos(equipamentos) {
         this.$emit('equipamentosFiltrados', [equipamentos])
      },
      popupFechado() {
         this.$emit('equipamentosFiltrados', [])
      }
   },

   mounted() {
      this.estrutura.forEach((estrutura) => {
         const logo = estrutura?.pessoa?.logo || estrutura?.estrutura_pessoa?.[0]?.pessoa.logo
         this.buscarImagem(logo)
      })
   },

   watch: {
      estrutura: {
         handler(newVal) {
            this.estruturas = { ...newVal }
            newVal.forEach((estrutura) => {
               const logo = estrutura?.pessoa?.logo || estrutura?.estrutura_pessoa?.[0]?.pessoa.logo
               this.buscarImagem(logo)
            })
            setTimeout(() => this.$refs.clusterRef.mapObject.refreshClusters(), 100)
         },
         immediate: true
      }
   }
}
</script>

<style scoped>
.mapa {
   z-index: 1;
}

.link {
   color: #007bff;
   cursor: pointer;
}
</style>