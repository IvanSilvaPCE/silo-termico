
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // Estado global da aplicação
    currentModel: null,
    siloData: {},
    armazemData: {}
  },
  mutations: {
    SET_CURRENT_MODEL(state, model) {
      state.currentModel = model
    },
    SET_SILO_DATA(state, data) {
      state.siloData = data
    },
    SET_ARMAZEM_DATA(state, data) {
      state.armazemData = data
    }
  },
  actions: {
    updateCurrentModel({ commit }, model) {
      commit('SET_CURRENT_MODEL', model)
    },
    updateSiloData({ commit }, data) {
      commit('SET_SILO_DATA', data)
    },
    updateArmazemData({ commit }, data) {
      commit('SET_ARMAZEM_DATA', data)
    }
  },
  modules: {
  }
})
