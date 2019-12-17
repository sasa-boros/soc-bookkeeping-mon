const state = {
  defaultPaymentSlip: {},
  defaultReceipt: {},
  bookedYears: []
}

const mutations = {
  SET_DEFAULT_PAYMENT_SLIP (state, paymentSlip) {
    state.defaultPaymentSlip = paymentSlip ? paymentSlip : {};
  },
  SET_DEFAULT_RECEIPT (state, receipt) {
    state.defaultReceipt = receipt ? receipt : {};
  },
  SET_BOOKED_YEARS (state, bookedYears) {
    state.bookedYears = bookedYears;
  }
}

const actions = {
  SET_DEFAULT_PAYMENT_SLIP ({ commit }, paymentSlip) {
    commit('SET_DEFAULT_PAYMENT_SLIP', paymentSlip);
  },
  SET_DEFAULT_RECEIPT ({ commit }, receipt) {
    commit('SET_DEFAULT_RECEIPT', receipt);
  },
  SET_BOOKED_YEARS ({ commit }, bookedYears) {
    commit('SET_BOOKED_YEARS', bookedYears);
  }
}

export default {
  state,
  mutations,
  actions
}
