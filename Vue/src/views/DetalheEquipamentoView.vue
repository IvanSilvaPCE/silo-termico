<template>
   <div>
      <div class="midde_cont">
         <div class="container-fluid">
            <div class="row column_title">
               <div class="col-md-12">
                  <div class="page_title">
                     <h2>Detalhes do equipamento</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="white_shd full margin_bottom_30">
         <div class="map_section padding_infor_info">
            <div class="map m_style1">
               <b-row>
                  <b-col sm="12" md="5" lg="5">
                     <b-overlay :show="buscandoProduto" class="overlay" rounded="sm">
                        <b-row>
                           <b-col>
                              <p class="titulo">Produto: {{ produto?.nm_produto }}</p>
                           </b-col>
                           <b-col class="text-right">
                              <p class="titulo">Modelo: {{ produto?.modelo }}</p>
                           </b-col>
                        </b-row>
                        <hr />
                        <b-row>
                           <b-col class="text-center">
                              <b-overlay :show="!imagemCache[produto?.imagem?.caminho] && !buscandoProduto" style="min-height: 50px">
                                 <img :src="imagemCache[produto?.imagem?.caminho]" class="imagem" />
                              </b-overlay>
                           </b-col>
                        </b-row>
                     </b-overlay>
                  </b-col>
                  <b-col sm="12" md="7" lg="7" class="rolagem">
                     <b-overlay :show="buscandoProduto" class="overlay" rounded="sm">
                        <b-card no-body class="overflow-hidden" v-for="produto in produto.produtos_componentes" :key="produto.id_componente">
                           <b-row no-gutters class="align-items-center">
                              <b-col sm="3" md="3" lg="2">
                                 <b-overlay :show="!imagemCache[produto?.imagem?.caminho]" style="min-height: 50px">
                                    <b-card-img :src="imagemCache[produto?.imagem?.caminho]"></b-card-img>
                                 </b-overlay>
                              </b-col>
                              <b-col sm="9" md="9" lg="10">
                                 <b-card-body>
                                    <p class="titulo">{{ produto.ds_componente }}</p>
                                    <p class="titulo">{{ produto.modelo_componente.ds_modelo_componente }}</p>
                                 </b-card-body>
                              </b-col>
                           </b-row>
                        </b-card>
                     </b-overlay>
                  </b-col>
               </b-row>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'DetalheEquipamentoView',
   data() {
      return {
         idProduto: null,
         buscandoProduto: false,
         produto: {},
         imagemCache: {}
      }
   },

   methods: {
      async buscarProduto() {
         if (!this.idProduto) {
            return
         }
         this.buscandoProduto = true
         const dados = await client.get(`/produto/componente/${this.idProduto}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar produto. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         this.buscandoProduto = false
         this.produto = dados.data
         this.carregarImagens(this.produto)
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
         const imagemNoCache = this.buscarImagemDoCache(imagem)
         if (imagemNoCache) {
            return
         } else {
            const dados = await client.get(`/imagem?caminho=${imagem}`).catch((err) => {
               this.$bvToast.toast(`Erro ao buscar imagem. ${err}`, {
                  title: 'Erro',
                  variant: 'warning',
                  autoHideDelay: 5000,
                  solid: true,
                  toaster: 'b-toaster-bottom-right'
               })
            })
            if (dados && dados.data) {
               this.$set(this.imagemCache, imagem, dados.data)
            }
         }
      },
      carregarImagens(produto) {
         if (!produto) {
            return
         }
         produto.produtos_componentes.forEach((componente) => {
            this.buscarImagem(componente.imagem.caminho)
         })
         this.buscarImagem(produto.imagem.caminho)
      },
      verificaIdProduto() {
         if (!this.idProduto) {
            this.$router.push('/')
         }
      },
      verificaPerfil() {
         if (!verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL']) && (!this.idProduto || this.idProduto === undefined)) {
            this.$router.push('/mapa')
         }
      },
      verificarPerfilOperacao
   },

   mounted() {
      const idProdutoStorage = localStorage.getItem('pro')

      if (idProdutoStorage && idProdutoStorage != 'undefined') {
         this.idProduto = idProdutoStorage
      } else {
         this.idProduto = this.$route.params.idProduto
         localStorage.setItem('pro', this.idProduto)
      }
      this.verificaIdProduto()
      this.buscarProduto()
   },

   beforeDestroy() {
      localStorage.removeItem('pro')
   }
}
</script>

<style scoped>
.rolagem {
   max-height: 63vh;
   overflow-y: auto;
}

.imagem {
   max-height: 55vh;
   max-width: 100%;
}

.titulo {
   font-size: 18px;
   font-weight: 500;
   color: #2b2b2bd2;
}

.overlay {
   min-height: 100px;
}
</style>
