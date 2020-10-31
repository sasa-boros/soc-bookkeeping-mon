const state = {
  bookingYear: new Date().getFullYear(),
  churchMunicipality: 'Старо Хопово',  // naziv
  churchTown: 'Старом Хопову' // u
}

const mutations = {
  SET_BOOKING_YEAR (state, bookingYear) {
    state.bookingYear = bookingYear;
  }
}

const actions = {
  SET_BOOKING_YEAR ({ commit }, bookingYear) {
    commit('SET_BOOKING_YEAR', bookingYear);
  }
}

export default {
  state,
  mutations,
  actions
}
