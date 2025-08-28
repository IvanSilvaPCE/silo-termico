import Vue from 'vue'
import VueRouter from 'vue-router'
// import { jwtDecode } from 'jwt-decode' // Removido temporariamente

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "LoginView" */ '../views/LoginView.vue')
  },
  {
    path: '/',
    // name: 'home',
    component: () => import(/* webpackChunkName: "HomeView" */ '../views/HomeView.vue'),
    children: [
      {
        path: '/',
        name: 'resumo',
        component: () => import(/* webpackChunkName: "ResumoView" */ '../views/ResumoView.vue'),
        meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/minha-estrutura',
        name: 'estrutura',
        component: () => import(/* webpackChunkName: "EstruturaView" */ '../views/EstruturaView.vue'),
        meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/detalhe-equipamento',
        name: 'detalhe',
        component: () => import(/* webpackChunkName: "DetalheEquipamentoView" */ '../views/DetalheEquipamentoView.vue'),
        meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/mapa',
        name: 'mapa',
        component: () => import(/* webpackChunkName: "MapaGerenciaView" */ '../views/MapaGerenciaView.vue'),
        meta: { requiresAuth: ['GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/log-evento',
        name: 'log',
        component: () => import(/* webpackChunkName: "LogEventoView" */ '../views/LogEventoView.vue'),
        meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/configura-equipamento',
        name: 'configura',
        component: () => import(/* webpackChunkName: "ConfiguraEquipamentoView" */ '../views/ConfiguraEquipamentoView.vue'),
        meta: { requiresAuth: ['ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/ultimos-dados',
        name: 'dados',
        component: () => import(/* webpackChunkName: "UltimosDadosView" */ '../views/UltimosDadosView.vue'),
        meta: { requiresAuth: ['SUPORTTECN', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/push',
        name: 'push',
        component: () => import(/* webpackChunkName: "PushView" */ '../views/PushView.vue'),
        meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/cadastros',
        name: 'cadastros',
        component: () => import(/* webpackChunkName: "CadastrosView" */ '../views/CadastrosView.vue'),
        meta: { requiresAuth: ['ADMINFABRI', 'ADMINPORTA'], redirect: '/login' },
        children: [
          {
            path: '/cadastros/alarmes',
            name: 'alarmes',
            component: () => import(/* webpackChunkName: "AlarmesView" */ '../views/AlarmesView.vue'),
            meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/componentes',
            name: 'componentes',
            component: () => import(/* webpackChunkName: "ComponentesView" */ '../views/ComponentesView.vue'),
            meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/cidades',
            name: 'cidades',
            component: () => import(/* webpackChunkName: "CidadesView" */ '../views/CidadesView.vue'),
            meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/pessoas',
            name: 'pessoas',
            component: () => import(/* webpackChunkName: "PessoasView" */ '../views/PessoasView.vue'),
            meta: { requiresAuth: ['ADMINFABRI', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/equipamentos',
            name: 'equipamentos',
            component: () => import(/* webpackChunkName: "EquipamentosView" */ '../views/EquipamentosView.vue'),
            meta: { requiresAuth: ['ADMINFABRI', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/estruturas-mqtt',
            name: 'estruturas_mqtt',
            component: () => import(/* webpackChunkName: "EstruturasMqttView" */ '../views/EstruturasMqttView.vue'),
            meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/estruturas-pessoas',
            name: 'estruturas_pessoas',
            component: () => import(/* webpackChunkName: "EstruturasPessoasView" */ '../views/EstruturasPessoasView.vue'),
            meta: { requiresAuth: ['ADMINFABRI', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/produtos',
            name: 'produtos',
            component: () => import(/* webpackChunkName: "ProdutosView" */ '../views/ProdutosView.vue'),
            meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/cadastros/usuarios',
            name: 'usuarios',
            component: () => import(/* webpackChunkName: "UsuariosView" */ '../views/UsuariosView.vue'),
            meta: { requiresAuth: ['ADMINFABRI', 'ADMINPORTA'], redirect: '/login' },
          },
        ]
      },
      {
        path: '/equipamento',
        name: 'equipamento',
        component: () => import(/* webpackChunkName: "OutrosView" */ '../views/OutrosView.vue'),
        meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
        children: [
          {
            path: '/equipamento/secador',
            name: 'secador',
            component: () => import(/* webpackChunkName: "SecadorOnlineView" */ '../views/SecadorOnlineView.vue'),
            meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/equipamento/estacao',
            name: 'estacao',
            component: () => import(/* webpackChunkName: "EstacaoAutomaticaView" */ '../views/EstacaoAutomaticaView.vue'),
            meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/equipamento/silo',
            name: 'silo',
            component: () => import(/* webpackChunkName: "SiloView" */ '../views/SiloView.vue'),
            meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/equipamento/termometria',
            name: 'termometria',
            component: () => import(/* webpackChunkName: "TermometriaView" */ '../views/TermometriaView.vue'),
            meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/equipamento/armazem',
            name: 'armazem',
            component: () => import(/* webpackChunkName: "ArmazemView" */ '../views/ArmazemView.vue'),
            meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/equipamento/maquina-limpeza',
            name: 'limpeza',
            component: () => import(/* webpackChunkName: "LimpezaView" */ '../views/LimpezaView.vue'),
            meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
          },
          {
            path: '/equipamento/ccm',
            name: 'controle',
            component: () => import(/* webpackChunkName: "ControleMotoresView" */ '../views/ControleMotoresView.vue'),
            meta: { requiresAuth: ['SUPORTTECN', 'ADMINPORTA'], redirect: '/login' },
          },
        ]
      },
      {
        path: '/configuracoes',
        name: 'configuracoes',
        component: () => import(/* webpackChunkName: "ConfiguracoesView" */ '../views/ConfiguracoesView.vue'),
        meta: { requiresAuth: ['ADMINPORTA', 'SUPORTTECN'], redirect: '/login' },
        children: [
          {
            path: '/configuracoes/dashboard',
            name: 'dashboard',
            component: () => import(/* webpackChunkName: "DashboardView" */ '../views/DashboardView.vue'),
            meta: { requiresAuth: ['ADMINPORTA', 'SUPORTTECN'], redirect: '/login' },
          },
          {
            path: '/configuracoes/relatorio',
            name: 'relatorio',
            component: () => import(/* webpackChunkName: "RelatorioView" */ '../views/RelatorioView.vue'),
            meta: { requiresAuth: ['ADMINPORTA', 'SUPORTTECN'], redirect: '/login' },
          },
          // {
          //   path: '/configuracoes/modelador',
          //   name: 'modelador',
          //   component: () => import(/* webpackChunkName: "ModeladorSvgView" */ '../views/ModeladorSvgView.vue'),
          //   meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
          // },
          {
            path: '/configuracoes/modelador',
            name: 'modelador',
            component: () => import(/* webpackChunkName: "ModeladorSvgView" */ '../views/ModeladorSvgView.vue'),
            meta: { requiresAuth: ['ADMINPORTA'], redirect: '/login' },
            children: [
              {
                path: '',
                name: 'ModeladorSVG',
                component: () => import(/* webpackChunkName: "ModeladorSVG" */ '../components/modelador/ModeladorSVG.vue')
              },
              {
                path: 'silo-2d',
                name: 'Silo2D',
                component: () => import(/* webpackChunkName: "Silo2D" */ '../components/modelador/Silo2D.vue')
              },
              {
                path: 'silo-3d',
                name: 'Silo3D',
                component: () => import(/* webpackChunkName: "Silo3D" */ '../components/modelador/Silo3D.vue')
              },
              {
                path: 'armazem-2d',
                name: 'Armazem2D',
                component: () => import(/* webpackChunkName: "Armazem2D" */ '../components/modelador/Armazem2D.vue')
              },
              {
                path: 'armazem-3d',
                name: 'Armazem3D',
                component: () => import(/* webpackChunkName: "Armazem3D" */ '../components/modelador/Armazem3D.vue')
              },
              {
                path: '/teste3d',
                name: 'Teste3D',
                component: () => import(/* webpackChunkName: "Teste3D" */ '../components/modelador/teste3d/Teste3D.vue')
              },
              {
                path: 'silo-comp',
                name: 'SiloComp',
                component: () => import(/* webpackChunkName: "SiloComp" */ '../components/modelador/compModelador/SiloComponente.vue')
              },
              {
                path: 'armazem-comp',
                name: 'ArmazemComp',
                component: () => import(/* webpackChunkName: "ArmazemComp" */ '../components/modelador/compModelador/ArmazemComponente.vue')
              }
            ]
          }
        ]
      },
      {
        path: '/assistencia',
        name: 'assistencia',
        component: () => import(/* webpackChunkName: "AssistenciaView" */ '../views/AssistenciaView.vue'),
        meta: { requiresAuth: ['ADMINPORTA', 'SUPORTTECN'], redirect: '/login' },
        children: [
          {
            path: '/assistencia/alarmes',
            name: 'assistencia_alarmes',
            component: () => import(/* webpackChunkName: "AssistenciaAlarmesView" */ '../views/AssistenciaAlarmesView.vue'),
            meta: { requiresAuth: ['ADMINPORTA', 'SUPORTTECN'], redirect: '/login' },
          },
          {
            path: '/assistencia/manuais',
            name: 'assistencia_manuais',
            component: () => import(/* webpackChunkName: "AssistenciaManuaisView" */ '../views/AssistenciaManuaisView.vue')
          },
          {
            path: '/assistencia/manuais/criar',
            name: 'criar_manual',
            component: () => import(/* webpackChunkName: "CriarManualView" */ '../views/CriarManualView.vue'),
            meta: { requiresAuth: ['ADMINPORTA', 'SUPORTTECN'], redirect: '/login' },
          },
          {
            path: '/assistencia/manuais/detalhe',
            name: 'detalhe_manual',
            component: () => import(/* webpackChunkName: "DetalheManualView" */ '../views/DetalheManualView.vue')
          }
        ]
      },
      {
        path: '/perfil',
        name: 'perfil',
        component: () => import(/* webpackChunkName: "PerfilView" */ '../views/PerfilView.vue'),
        meta: { requiresAuth: ['USUARIOLOC', 'ADMINLOCAL', 'GERENEQUIP', 'ADMINGERAL', 'ASSISTTECN', 'ADMINFABRI', 'SUPORTTECN', 'ENGENHARIA', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '/lotes',
        name: 'lotes',
        component: () => import(/* webpackChunkName: "LotesView" */ '../views/LotesView.vue'),
        meta: { requiresAuth: ['ADMINLOCAL', 'ADMINGERAL', 'ADMINFABRI', 'SUPORTTECN', 'ADMINPORTA'], redirect: '/login' },
      },
      {
        path: '*',
        component: () => import(/* webpackChunkName: "NotFoundView" */ '../views/NotFoundView.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/cloud/web/',
  routes
})

let previousRoute = null

router.beforeEach((to, from, next) => {
  previousRoute = from
  const token = localStorage.getItem('token')
  const decodedToken = token && jwtDecode(token)
  const userProfiles = decodedToken && decodedToken.user && decodedToken.user.usuarios_perfis

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredProfiles = to.meta.requiresAuth

  if (!requiresAuth) {
    return next()
  }

  if (!token || !userProfiles) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  if (requiredProfiles && requiredProfiles.some(requiredProfile =>
    userProfiles.some(perfil => perfil.cd_perfil === requiredProfile))) {
    return next()
  }

  if (from.path !== to.meta.redirect) {
    return next({
      path: to.meta.redirect
    })
  }
})

Vue.prototype.$previousRoute = () => previousRoute
export default router
