const state = {
   user: localStorage.getItem('user') || null,
}

const mutations = {
   setUser(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
   },
}

const actions = {
   saveUser({ commit }, user) {
      commit('setUser', user)
   },
   retrieveUser({ commit }) {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
         commit('setUser', user)
      }
   },
}

const getters = {
   getUser: (state) => state.user,
}

export default {
   namespaced: true,
   state,
   mutations,
   actions,
   getters,
}