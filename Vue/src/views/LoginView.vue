<template>
   <div class="full_container">
      <div class="container">
         <div class="center verticle_center full_height">
            <div class="login_section shadow gradient">
               <div class="logo_login">
                  <div class="center">
                     <img height="130" src="@/assets/images/logo/pce.png" alt="#" />
                  </div>
               </div>
               <div class="login_form">
                  <form @keyup.enter="login">
                     <fieldset>
                        <div class="field">
                           <label class="label_field">E-mail</label>
                           <b-form-input v-model="objLogin.email" placeholder="Insira seu e-mail" :state="validate('email')"></b-form-input>
                           <b-form-invalid-feedback class="text-right" id="email">{{ erros['email'] | parseErros }}</b-form-invalid-feedback>
                        </div>
                        <div class="field">
                           <label class="label_field">Senha</label>
                           <b-form-input type="password" v-model="objLogin.password" placeholder="Insira sua senha" :state="validate('password')"></b-form-input>
                           <b-form-invalid-feedback class="text-right" id="password">{{ erros['password'] | parseErros }}</b-form-invalid-feedback>
                        </div>
                        <div class="field">
                           <label class="label_field hidden">hidden label</label>
                           <label class="form-check-label"><input type="checkbox" v-model="objLogin.lembrar" class="form-check-input" /> Lembrar de mim</label>
                           <!-- <a class="forgot" href="">Esqueceu sua senha?</a> -->
                        </div>
                        <div class="field margin_0">
                           <label class="label_field hidden">hidden label</label>
                           <b-button class="main_bt" @click="login" :disabled="isEnviando">
                              <span v-if="!isEnviando">Log in</span>
                              <div v-else>
                                 <b-spinner small></b-spinner>
                                 <span class="ml-1">Enviando...</span>
                              </div>
                           </b-button>
                        </div>
                     </fieldset>
                  </form>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import client from '@/api'
import { jwtDecode } from 'jwt-decode'
import { mapActions } from 'vuex'

export default {
   name: 'LoginView',
   data() {
      return {
         objLogin: {},
         erros: [],
         isEnviando: false
      }
   },

   methods: {
      ...mapActions('user', ['saveUser']),
      async login() {
         this.isEnviando = true
         let msg = ''
         const payload = JSON.stringify(this.objLogin)
         const { status, data } = await client.post('/login', payload).catch((e) => e.response)
         switch (status) {
            case 200:
               msg = 'Logado com sucesso!'
               break
            case 400:
               msg = 'Credenciais inválidas!'
               break
            case 422:
               msg = 'Por favor corrija os erros apresentados'
               this.erros = data
               break
            default:
               msg = 'Erro desconhecido'
         }
         this.isEnviando = false
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
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('unm')
            localStorage.removeItem('un')
            localStorage.setItem('token', data.token)
            const decodedToken = jwtDecode(data.token)
            const user = decodedToken.user
            const userInfo = { nm_usuario: user.nm_usuario, email: user.email, telefone: user.telefone, celular: user.celular, imagem: user.imagem?.caminho || null }
            this.saveUser(userInfo)
            const redirect = this.$route.query.redirect || '/'
            this.$router.push(redirect)
         }
      },
      showMessage({ msg, title, variant }) {
         this.$bvToast.toast(msg, {
            title,
            toaster: 'b-toaster-bottom-right',
            variant,
            autoHideDelay: 3000,
            solid: false
         })
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
   }
}
</script>

<style scoped>
.full_container {
   background-color: #ececec;
}
/* .gradient {
   background: linear-gradient(to bottom, rgb(167, 167, 167), white 45%) !important;
} */
</style>