import Vue from 'vue'
import Vuex from 'vuex'

import unidadeModule from './unidade'
import userModule from './user'

Vue.use(Vuex)

const store = new Vuex.Store({
   modules: {
      unidade: unidadeModule,
      user: userModule
   },
})

export default store