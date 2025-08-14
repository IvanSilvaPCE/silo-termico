const state = {
   unidade: localStorage.getItem('un') || null,
   nomeUnidade: localStorage.getItem('unm') || null,
}

const mutations = {
   setUnidade(state, unidade) {
      state.unidade = unidade
      localStorage.setItem('un', unidade)
   },
   setNomeUnidade(state, nomeUnidade) {
      state.nomeUnidade = nomeUnidade
      localStorage.setItem('unm', nomeUnidade)
   },
}

const actions = {
   saveUnidade({ commit }, unidade) {
      commit('setUnidade', unidade)
   },
   saveNomeUnidade({ commit }, nomeUnidade) {
      commit('setNomeUnidade', nomeUnidade)
   },
   retrieveUnidade({ commit }) {
      const unidade = localStorage.getItem('un')
      if (unidade) {
         commit('setUnidade', unidade)
      }
   },
   retrieveNomeUnidade({ commit }) {
      const nomeUnidade = localStorage.getItem('unm')
      if (nomeUnidade) {
         commit('setNomeUnidade', nomeUnidade)
      }
   },
}

const getters = {
   getUnidade: (state) => state.unidade,
   getNomeUnidade: (state) => state.nomeUnidade,
}

export default {
   namespaced: true,
   state,
   mutations,
   actions,
   getters,
}