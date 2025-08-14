<template>
   <div class="full_container" @mouseleave="handleMouseLeave" @touchend="handleMouseLeave">
      <div class="inner_container">
         <nav :class="{ active: isSidebarActive }" id="sidebar" ref="sidebar">
            <div class="sidebar_blog_1">
               <div class="sidebar-header">
                  <div class="logo_section">
                     <!-- <router-link :to="{ path: '/' }"><img class="logo_icon img-responsive" src="@/assets/images/logo/pce_logo_menu.png" alt="Logo" /></router-link> -->
                  </div>
               </div>
               <router-link :to="{ name: 'perfil' }">
                  <div class="sidebar_user_info" @click="closeSidebar">
                     <div class="icon_setting"></div>
                     <div class="user_profle_side">
                        <b-overlay :show="user.imagem && buscandoImagem" rounded="circle">
                           <b-avatar :src="imagem ? imagem : require('@/assets/images/usuarios/user.png')" size="5rem" style="background: none"></b-avatar>
                        </b-overlay>
                        <div class="user_info">
                           <h6>{{ user?.nm_usuario || 'Usuário' }}</h6>
                           <p><span class="online_animation"></span> Online</p>
                        </div>
                     </div>
                  </div>
               </router-link>
            </div>
            <div class="sidebar_blog_2">
               <h4>Gerenciamento</h4>
               <ul class="list-unstyled components">
                  <li class="active" @click="closeSidebar">
                     <router-link :to="{ name: 'resumo' }">
                        <i class="fa fa-home yellow_color"></i>
                        <span>Home</span>
                     </router-link>
                  </li>
                  <li class="active" @click="closeSidebar" v-if="!verificarPerfilOperacao(['USUARIOLOC', 'ADMINLOCAL'])">
                     <router-link :to="{ name: 'mapa' }">
                        <i class="fa fa-map yellow_color"></i>
                        <span>Mapa</span>
                     </router-link>
                  </li>
                  <li @click="closeSidebar" v-if="!verificarPerfilOperacao(['ASSISTTECN', 'ADMINFABRI'])">
                     <router-link :to="{ name: 'estrutura' }">
                        <i class="fa fa-sitemap blue2_color"></i>
                        <span>Minha Estrutura</span>
                     </router-link>
                  </li>
                  <li @click="closeSidebar">
                     <router-link :to="{ name: 'log' }">
                        <i class="fa fa-clock-o orange_color"></i>
                        <span>Log de eventos</span>
                     </router-link>
                  </li>

                  <h4 v-if="verificarPerfilOperacao(['ADMINPORTA', 'ENGENHARIA', 'SUPORTTECN'])">Serviços PCE</h4>
                  <!-- <li v-if="verificarPerfilOperacao(['ADMINPORTA', 'ENGENHARIA'])">
                     <router-link to="">
                        <i class="fa fa-object-group blue2_color"></i>
                        <span>Update Equipamento</span>
                     </router-link>
                  </li> -->
                  <!-- <li v-if="verificarPerfilOperacao(['ADMINPORTA', 'ENGENHARIA'])">
                     <router-link to="">
                        <i class="fa fa-sliders blue1_color"></i>
                        <span>Engenharia</span>
                     </router-link>
                  </li> -->
                  <li @click="closeSidebar" v-if="verificarPerfilOperacao(['ADMINPORTA', 'ENGENHARIA', 'SUPORTTECN'])">
                     <router-link :to="{ name: 'assistencia' }">
                        <i class="fa fa-phone-square blue2_color"></i>
                        <span>Assistência</span>
                     </router-link>
                  </li>
                  <h4>Sistema</h4>
                  <li @click="closeSidebar" v-if="verificarPerfilOperacao(['ADMINPORTA', 'ADMINFABRI'])">
                     <router-link :to="{ name: 'cadastros' }">
                        <i class="fa fa-clone red_color"></i>
                        <span>Cadastros</span>
                     </router-link>
                  </li>
                  <li @click="closeSidebar" v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])">
                     <router-link :to="{ name: 'dados' }">
                        <i class="fa fa-database orange_color"></i>
                        <span>Últimos Dados</span>
                     </router-link>
                  </li>
                  <li @click="closeSidebar" v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN'])">
                     <router-link :to="{ name: 'configuracoes' }">
                        <i class="fa fa-cogs yellow_color"></i>
                        <span>Configurações</span>
                     </router-link>
                  </li>
                  <li @click="toggleDarkMode()" class="active">
                     <router-link to="">
                        <i class="yellow_color">
                           <b-icon-lightbulb v-if="isDarkMode"></b-icon-lightbulb>
                           <b-icon-lightbulb-off v-else></b-icon-lightbulb-off>
                        </i>
                        <span v-if="isDarkMode">Modo claro</span>
                        <span v-else>Modo escuro</span>
                     </router-link>
                  </li>
                  <li @click="logout">
                     <router-link to="">
                        <i class="fa fa-sign-out purple_color2"></i>
                        <div v-if="!isEnviando">
                           <span>Log Out</span>
                        </div>
                        <div v-else>
                           <b-spinner small></b-spinner>
                           <span class="ml-1">Saindo...</span>
                        </div>
                     </router-link>
                  </li>
               </ul>
            </div>
         </nav>
         <div id="content">
            <div class="topbar" :class="{ hide: isScrolled }">
               <nav class="navbar navbar-expand-lg navbar-light">
                  <div class="full">
                     <button type="button" @click="toggleSidebar" id="sidebarCollapse" class="sidebar_toggle"><i class="fa fa-bars"></i></button>
                     <div class="logo_section">
                        <router-link :to="{ path: '/' }"><img class="img-responsive" src="@/assets/images/logo/pce_logo_portal.png" alt="Logo" /></router-link>
                     </div>
                     <!-- <div class="right_topbar">
                        <div class="icon_info">
                           <ul class="user_profile_dd">
                              <li>
                                 <a class="dropdown-toggle" data-toggle="dropdown"><b-img class="img-responsive rounded-circle" :src="imagem ? imagem : require('@/assets/images/usuarios/user.png')" alt="#"></b-img><span class="name_user"></span></a>
                                 <div class="dropdown-menu">
                                    <router-link class="dropdown-item" :to="{ name: 'perfil' }">Meu perfil</router-link>
                                    <router-link class="dropdown-item" to="">Configurações</router-link>
                                    <router-link class="dropdown-item" to="">Documentação</router-link>
                                    <a class="dropdown-item" @click.stop="logout">
                                       <div v-if="!isEnviando">
                                          <span>Log Out</span>
                                          <i class="fa fa-sign-out ml-1"></i>
                                       </div>
                                       <div v-else>
                                          <b-spinner small></b-spinner>
                                          <span class="ml-1">Saindo...</span>
                                       </div>
                                    </a>
                                 </div>
                              </li>
                           </ul>
                        </div>
                     </div> -->
                  </div>
               </nav>
            </div>

            <!-- As rotas serão carregadas dentro do router view -->
            <router-view></router-view>
         </div>
      </div>
   </div>
</template>

<script>
import PerfectScrollbar from 'perfect-scrollbar'
import { mapState, mapActions } from 'vuex'
import client from '@/api'
import { verificarPerfilOperacao } from '@/utils'

export default {
   name: 'HomeView',
   data() {
      return {
         isSidebarActive: false,
         mostrarModal: false,
         isScrolled: false,
         isEnviando: false,
         imagem: null,
         buscandoImagem: false,
         heartbeatInterval: null,
         isDarkMode: localStorage.getItem('darkMode') === 'true'
      }
   },

   computed: {
      ...mapState('user', ['user'])
   },

   methods: {
      startHeartbeat() {
         this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat('S')
         }, 60000)
      },
      stopHeartbeat() {
         clearInterval(this.heartbeatInterval)
      },
      handleMouseLeave() {
         this.sendHeartbeat('N')
      },
      sendHeartbeat(logado) {
         client.post(`/heartbeat?logado=${logado}`)
      },
      toggleDarkMode() {
         this.isDarkMode = !this.isDarkMode
         this.applyDarkMode()
      },
      applyDarkMode() {
         if (this.isDarkMode) {
            document.body.classList.add('dark-mode')
            localStorage.setItem('darkMode', 'true')
         } else {
            document.body.classList.remove('dark-mode')
            localStorage.setItem('darkMode', 'false')
         }
      },
      async logout() {
         this.isEnviando = true
         let msg = ''
         const { status, data } = await client.post('/logout').catch((e) => e.response)
         switch (status) {
            case 200:
               msg = 'Desconectado com sucesso!'
               break
            case 500:
               msg = 'Ocorreu um erro ao desconectar!'
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
            localStorage.removeItem('un')
            this.$router.push('/login')
         }
      },
      toggleSidebar() {
         this.isSidebarActive = !this.isSidebarActive
      },
      closeSidebar() {
         if (window.innerWidth < 1200) {
            this.isSidebarActive = false
         }
      },
      handleScroll() {
         const tolerance = 60
         const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
         if (Math.abs(currentScrollPosition - this.lastScrollPosition) <= tolerance) {
            return
         }
         if (currentScrollPosition < this.lastScrollPosition) {
            this.isScrolled = false
         } else {
            this.isScrolled = true
         }
         this.lastScrollPosition = currentScrollPosition <= 62 ? 62 : currentScrollPosition
      },
      ...mapActions('user', ['retrieveUser']),
      verificarPerfilOperacao,
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
      registraLog(to) {
         const url = window.location.href
         const urlObj = new URL(url)
         const hostname = urlObj.hostname
         const caminho = to.fullPath
         const nome = to.name
         const idUnidade = localStorage.getItem('un') || null
         const parametro = Object.values(to.params)[0] || null
         let idEquipamento = null
         const nomeRota = {
            secador: 'sec',
            silo: 'sil',
            armazem: 'arm',
            limpeza: 'lim',
            controle: 'con'
         }
         if (nomeRota[to.name]) {
            idEquipamento = localStorage.getItem(nomeRota[to.name]) || parametro
         }
         client.post(
            '/log_acesso',
            JSON.stringify({
               hostname: hostname,
               caminho: caminho,
               nome: nome,
               id_equipamento: idEquipamento,
               id_estrutura_pessoa: idUnidade
            })
         )
      }
   },

   mounted() {
      this.ps = new PerfectScrollbar(this.$refs.sidebar)
      window.addEventListener('scroll', this.handleScroll)
      this.retrieveUser()
      this.buscarImagem(this.user.imagem)

      this.applyDarkMode()
      this.startHeartbeat()
      this.sendHeartbeat('S')
      this.registraLog(this.$route)
   },

   beforeMount() {
      if (window.innerWidth > 1200) {
         this.toggleSidebar()
      }
   },

   beforeDestroy() {
      this.ps.destroy()
      window.removeEventListener('scroll', this.handleScroll)
      this.stopHeartbeat()
      this.sendHeartbeat('N')
   },

   watch: {
      $route(to) {
         this.registraLog(to)
      }
   }
}
</script>

<style>
@import url('@/assets/css/dark-mode.css');

#sidebar {
   overflow: hidden;
}

.hide {
   transform: translateY(-100%);
}

.topbar {
   z-index: 9;
}
</style>