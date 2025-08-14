<template>
   <div>
      <div class="midde_cont">
         <div class="container-fluid">
            <div class="row column_title">
               <div class="col-md-12">
                  <div class="page_title">
                     <h2>Estrutura de equipamentos</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="white_shd full margin_bottom_30">
         <div class="map_section padding_infor_info">
            <div class="map m_style1">
               <div>
                  <h1>{{ hierarquia[0]?.nm_estrutura_pessoa }}</h1>
                  <b-overlay :show="overlayHierarquia" rounded="sm">
                     <template #overlay>
                        <div class="d-flex align-items-center mt-2">
                           <b-row>
                              <b-col cols="2">
                                 <b-spinner class="mr-1"></b-spinner>
                              </b-col>
                              <b-col cols="10">
                                 <span>Carregando estrutura...</span>
                              </b-col>
                           </b-row>
                        </div>
                     </template>
                     <p v-if="!hierarquia[0]?.equipamentos.length && !overlayHierarquia && !overlayEstrutura" class="text-center">Nenhum equipamento para listar</p>
                     <ul v-else class="wtree">
                        <template v-for="equipamento in hierarquia[0]?.equipamentos">
                           <li :key="equipamento.id_equipamento">
                              <div class="col-lg-5 shadow margem hoverable" @click="detalheEquipamento(equipamento.id_produto)">
                                 <div class="info_people">
                                    <div class="text-center align-items-center">
                                       <b-overlay :show="!imagemCache[equipamento?.imagem]" class="overlay">
                                          <img v-if="imagemCache[equipamento?.imagem]" :src="imagemCache[equipamento?.imagem]" height="100" alt="#" />
                                       </b-overlay>
                                    </div>
                                    <div class="user_info_cont">
                                       <h4>{{ equipamento?.ds_equipamento }}</h4>
                                       <p>Categoria: {{ equipamento?.categoria }}</p>
                                    </div>
                                 </div>
                              </div>
                              <ul v-if="equipamento.slave && equipamento.slave.length">
                                 <template v-for="primeiroNivel in equipamento.slave">
                                    <li :key="primeiroNivel.id_equipamento">
                                       <div class="col-lg-5 shadow margem hoverable" @click="detalheEquipamento(primeiroNivel.id_produto)">
                                          <div class="info_people">
                                             <div class="text-center align-items-center">
                                                <b-overlay :show="!imagemCache[primeiroNivel?.imagem]" class="overlay">
                                                   <img v-if="imagemCache[primeiroNivel?.imagem]" :src="imagemCache[primeiroNivel?.imagem]" height="100" alt="#" />
                                                </b-overlay>
                                             </div>
                                             <div class="user_info_cont">
                                                <h4>{{ primeiroNivel.ds_equipamento }}</h4>
                                                <p>Categoria: {{ primeiroNivel.categoria }}</p>
                                             </div>
                                          </div>
                                       </div>
                                       <ul v-if="primeiroNivel.slave && primeiroNivel.slave.length">
                                          <template v-for="segundoNivel in primeiroNivel.slave">
                                             <li :key="segundoNivel.id_equipamento">
                                                <div class="col-lg-5 shadow margem hoverable" @click="detalheEquipamento(segundoNivel.id_produto)">
                                                   <div class="info_people">
                                                      <div class="text-center align-items-center">
                                                         <b-overlay :show="!imagemCache[segundoNivel?.imagem]" class="overlay">
                                                            <img v-if="imagemCache[segundoNivel?.imagem]" :src="imagemCache[segundoNivel?.imagem]" height="100" alt="#" />
                                                         </b-overlay>
                                                      </div>
                                                      <div class="user_info_cont">
                                                         <h4>{{ segundoNivel.ds_equipamento }}</h4>
                                                         <p>Categoria: {{ segundoNivel.categoria }}</p>
                                                      </div>
                                                   </div>
                                                </div>
                                                <ul v-if="segundoNivel.slave && segundoNivel.slave.length">
                                                   <template v-for="terceiroNivel in segundoNivel.slave">
                                                      <li :key="terceiroNivel.id_equipamento">
                                                         <div class="col-lg-5 shadow margem hoverable" @click="detalheEquipamento(terceiroNivel.id_produto)">
                                                            <div class="info_people">
                                                               <div class="text-center align-items-center">
                                                                  <b-overlay :show="!imagemCache[terceiroNivel?.imagem]" class="overlay">
                                                                     <img v-if="imagemCache[terceiroNivel?.imagem]" :src="imagemCache[terceiroNivel?.imagem]" height="100" alt="#" />
                                                                  </b-overlay>
                                                               </div>
                                                               <div class="user_info_cont">
                                                                  <h4>{{ terceiroNivel.ds_equipamento }}</h4>
                                                                  <p>Categoria: {{ terceiroNivel.categoria }}</p>
                                                               </div>
                                                            </div>
                                                         </div>
                                                         <ul v-if="terceiroNivel.slave && terceiroNivel.slave.length">
                                                            <template v-for="quartoNivel in terceiroNivel.slave">
                                                               <li :key="quartoNivel.id_equipamento">
                                                                  <div class="col-lg-5 shadow margem hoverable" @click="detalheEquipamento(quartoNivel.id_produto)">
                                                                     <div class="info_people">
                                                                        <div class="text-center align-items-center">
                                                                           <b-overlay :show="!imagemCache[quartoNivel?.imagem]" class="overlay">
                                                                              <img v-if="imagemCache[quartoNivel?.imagem]" :src="imagemCache[quartoNivel?.imagem]" height="100" alt="#" />
                                                                           </b-overlay>
                                                                        </div>
                                                                        <div class="user_info_cont">
                                                                           <h4>{{ quartoNivel.ds_equipamento }}</h4>
                                                                           <p>Categoria: {{ quartoNivel.categoria }}</p>
                                                                        </div>
                                                                     </div>
                                                                  </div>
                                                               </li>
                                                            </template>
                                                         </ul>
                                                      </li>
                                                   </template>
                                                </ul>
                                             </li>
                                          </template>
                                       </ul>
                                    </li>
                                 </template>
                              </ul>
                           </li>
                        </template>
                     </ul>
                  </b-overlay>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import { mapState, mapActions } from 'vuex'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'EstruturaView',
   data() {
      return {
         id_estrutura_pessoa: null,
         overlayHierarquia: false,
         overlayEstrutura: false,
         hierarquia: [],
         estruturas: [],
         imagemCache: {}
      }
   },

   computed: {
      ...mapState('unidade', ['unidade']),
      optionsEstruturas() {
         if (!this.estruturas.length) {
            return
         }
         return this.estruturas.map((estruturas) => ({
            value: estruturas.id_estrutura_pessoa,
            label: estruturas.nm_estrutura_pessoa
         }))
      }
   },

   methods: {
      ...mapActions('unidade', ['retrieveUnidade']),
      verificaPerfil() {
         if (!verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL']) && (!this.unidade || this.unidade == '' || this.unidade === undefined)) {
            this.$router.push('/mapa')
         }
      },
      async buscarHierarquia() {
         if (!this.unidade) {
            return
         }
         this.overlayHierarquia = true
         const dados = await client.get(`/estrutura_pessoa/buscarhierarquia?estrutura=${this.unidade}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar hierarquia. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
         })
         this.overlayHierarquia = false
         this.hierarquia = dados.data
         this.carregaImagemEstrutura(this.hierarquia[0]?.equipamentos)
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
               this.$bvToast.toast(`Erro ao buscar imagem do equipamento. ${err}`, {
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
      carregaImagemEstrutura(equipamentos) {
         if (!equipamentos) {
            return
         }
         equipamentos.forEach((equipamento) => {
            this.buscarImagem(equipamento.imagem)
            if (equipamento.slave && equipamento.slave.length) {
               this.carregaImagemEstrutura(equipamento.slave)
            }
         })
      },
      verificarPerfilOperacao,
      detalheEquipamento(produto) {
         const idProduto = produto
         this.$router.push({ name: 'detalhe', params: { idProduto } })
      },
   },

   mounted() {
      this.buscarHierarquia()
   },

   beforeMount() {
      this.verificaPerfil()
   }
}
</script>

<style scoped>
.overlay {
   height: 100px;
}

ul {
   margin-left: 20px;
}

.wtree li {
   list-style-type: none;
   margin: 10px 0 10px 10px;
   position: relative;
}
.wtree li:before {
   content: '';
   position: absolute;
   top: -10px;
   left: -20px;
   border-left: 2px solid #ddd;
   border-bottom: 2px solid #ddd;
   width: 20px;
   height: 75px;
}
.wtree li:after {
   position: absolute;
   content: '';
   top: 5px;
   left: -20px;
   border-left: 2px solid #ddd;
   /* border-top: 1px solid #ddd; */
   width: 20px;
   height: 100%;
}

.wtree li:last-child:after {
   display: none;
}

.wtree li span {
   display: block;
   border: 1px solid #ddd;
   padding: 10px;
   color: #888;
   text-decoration: none;
}

.wtree li div.hoverable {
   border: 1px solid #ddd;
   cursor: pointer;
}

.wtree li div.hoverable:hover {
   background: #eee;
   transform: scale(1.02);
}

.wtree li div.hoverable:hover + ul li div.hoverable {
   background: #eee;
   transform: scale(1.02);
}

.margem {
   border: 1px solid #ddd;
}

@media (max-width: 767px) {
   .info_people {
      padding: 10px;
   }
}
</style>