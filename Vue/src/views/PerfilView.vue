<template>
   <div class="midde_cont">
      <div class="container-fluid">
         <div class="row column_title">
            <div class="col-md-12">
               <div class="page_title">
                  <h2>Perfil</h2>
               </div>
            </div>
         </div>
         <div class="row column1">
            <div class="col-md-2"></div>
            <div class="col-md-8">
               <div class="white_shd full margin_bottom_30">
                  <div class="full graph_head">
                     <div class="heading1 margin_0">
                        <h2>Meu perfil</h2>
                     </div>
                  </div>
                  <div class="full price_table padding_infor_info">
                     <b-overlay :show="isBusy" rounded="sm">
                        <div class="row">
                           <div class="col-lg-12">
                              <div class="full dis_flex center_text">
                                 <div class="profile_img text-center">
                                    <b-overlay :show="usuario.imagem && buscandoImagem" rounded="circle">
                                       <b-avatar :src="imagem ? imagem : require('@/assets/images/usuarios/user.png')" size="12rem" style="background: none"></b-avatar>
                                    </b-overlay>
                                 </div>
                                 <div class="profile_contant">
                                    <div class="contact_inner">
                                       <h3 class="mb-4">{{ usuario.nm_usuario }}</h3>
                                       <p class="mb-0"><i class="fa fa-envelope-o"></i><strong> Email: </strong>{{ usuario.email }}</p>
                                       <p class="mb-0"><i class="fa fa-phone"></i><strong> Telefone: </strong>{{ usuario.telefone }}</p>
                                       <p class="mb-0 ml-1"><i class="fa fa-mobile-phone"></i><strong> Celular: </strong>{{ usuario.celular }}</p>
                                       <b-button variant="outline-primary" size="sm" class="mt-2" @click="editar"> <b-icon-pencil-square></b-icon-pencil-square> Editar </b-button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </b-overlay>
                  </div>
               </div>
               <div class="col-md-2"></div>
            </div>
         </div>
      </div>
      <b-modal id="cadastro" ref="modal" title="Editar Perfil" ok-title="Salvar" @ok="salvarPerfil" @cancel="resetModal" cancel-title="Cancelar">
         <form>
            <b-form-group label="Nome">
               <b-form-input v-model="objUsuario.nm_usuario" :state="validate('nm_usuario')"></b-form-input>
               <b-form-invalid-feedback id="nm_usuario">{{ erros['nm_usuario'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Telefone">
               <b-form-input v-model="objUsuario.telefone" :state="validate('telefone')"></b-form-input>
               <b-form-invalid-feedback id="telefone">{{ erros['telefone'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Celular">
               <b-form-input v-model="objUsuario.celular" :state="validate('celular')"></b-form-input>
               <b-form-invalid-feedback id="celular">{{ erros['celular'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Imagem">
               <b-form-file v-model="objUsuario.imagem" :state="validate('imagem')" accept="image/*" placeholder="Nenhum arquivo escolhido" browse-text="Escolher"></b-form-file>
               <b-form-invalid-feedback id="imagem">{{ erros['imagem'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Senha">
               <b-form-input type="password" v-model="objUsuario.password" :state="validate('password')" placeholder="Deixe vazio para não alterar"></b-form-input>
               <b-form-invalid-feedback id="password">{{ erros['password'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group label="Confirmação da Senha">
               <b-form-input type="password" v-model="objUsuario.password_conf" :state="validate('password_conf')" :disabled="!objUsuario.password?.length"></b-form-input>
               <b-form-invalid-feedback id="password_conf">{{ erros['password_conf'] | parseErros }}</b-form-invalid-feedback>
            </b-form-group>
         </form>
         <template #modal-footer="{ cancel, ok }">
            <b-button size="lg" variant="secondary" @click="cancel()"> Cancelar </b-button>
            <b-button :disabled="isSalvando" size="lg" variant="primary" @click="ok()">
               <span v-if="!isSalvando">Salvar</span>
               <div v-else>
                  <b-spinner small></b-spinner>
                  <span class="ml-1">Salvando...</span>
               </div>
            </b-button>
         </template>
      </b-modal>
   </div>
</template>

<script>
import client from '@/api'
import { jwtDecode } from 'jwt-decode'
import { usuarioService } from '../services'

export default {
   name: 'PerfilView',
   data() {
      return {
         isSalvando: false,
         isBusy: false,
         objUsuario: {},
         usuario: {},
         imagem: null,
         buscandoImagem: false,
         erros: []
      }
   },

   methods: {
      editar() {
         this.$bvModal.show('cadastro')
      },
      async salvarPerfil(bvModalEvt) {
         this.isSalvando = true
         bvModalEvt.preventDefault()
         let msg = ''
         const { status, data } = await usuarioService.salvarPerfil(this.objUsuario)
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
            this.buscar()
            this.$nextTick(() => {
               this.$bvModal.hide('cadastro')
            })
         }
      },
      async buscar() {
         const token = localStorage.getItem('token')
         const decodedToken = jwtDecode(token)
         if (!decodedToken && !decodedToken.user) {
            console.log(decodedToken.user)
            return
         }

         this.isBusy = true
         const dados = await client.get(`/usuario/${decodedToken.user.id_usuario}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar usuário. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.isBusy = false
         })
         this.isBusy = false
         this.usuario = dados.data
         this.objUsuario = { ...this.usuario }
         delete this.objUsuario.imagem
      },
      async buscarImagem(imagem) {
         if (!imagem) {
            return
         }
         this.buscandoImagem = true
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
            this.imagem = dados.data
         }
         this.buscandoImagem = false
      },
      resetModal() {
         this.objUsuario = {}
         this.erros = []
      },
      validate(prop) {
         const keys = Object.keys(this.erros)
         if (keys.includes(prop)) {
            return false
         }
      }
   },

   filters: {
      parseErros(v) {
         if (!v) return
         return v.join(', ')
      }
   },

   mounted() {
      this.buscar()
   },

   watch: {
      'usuario.imagem'() {
         this.buscarImagem(this.usuario.imagem?.caminho)
      }
   }
}
</script>

<style>
</style>