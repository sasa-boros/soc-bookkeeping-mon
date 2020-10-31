<template>
  <b-container fluid>
    <b-row class="text-center">
      <b-col>
        <span>Година књижења:</span>
        <datepicker
          minimum-view="year"
          maximum-view="year"
          format="yyyy."
          v-model="year"
          v-on:input="setBookingYear"
          :language="calendarLanguages.srCYRL"
          input-class="bookingYearDatepickerInput"
          wrapper-class="bookingYearDatepickerWrapper"
          calendar-class="bookingYearDatepickerCalendar"
          id="bookingYearDatepicker"
        ></datepicker>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span>Прикажи дневник:</span>
        <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="annualReportBtn" ref="annualReportBtn" v-on:mouseleave="hideTooltip('annualReportBtn')" v-on:click="createAnnualReport" variant="light" class="btn-lg">
          <img src="~@/assets/annual-report.png">
        </b-button>
      </b-col>
    </b-row>
    <b-tabs card fill no-fade pills>
      <b-tab class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.codes}}</span>
        </template>
        <codes-pane></codes-pane>
      </b-tab>
      <b-tab class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.general}}</span>
        </template>
        <general-pane></general-pane>
      </b-tab>
      <b-tab active class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.paymentSlips}}</span>
          <span v-show="!arePaymentSlipsValid">
            &nbsp;
            <img
              id="invalidPsImg"
              v-on:mouseleave="hideTooltip('invalidPsImg')"
              src="~@/assets/invalid.png"
              class="invalidTabIcon"
            />
            <b-tooltip boundary="window" target="invalidPsImg">{{phrases.invalidPaymentSlipsExist}}</b-tooltip>
          </span>
        </template>
        <payment-slips-pane v-on:updateInvalidPaymentSlipsInfo="updateInvalidPaymentSlipsInfo"></payment-slips-pane>
      </b-tab>
      <b-tab class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.receipts}}</span>
          <span v-show="!areReceiptsValid">
            &nbsp;
            <img
              id="invalidRImg"
              v-on:mouseleave="hideTooltip('invalidRImg')"
              src="~@/assets/invalid.png"
              class="invalidTabIcon"
            />
            <b-tooltip boundary="window" target="invalidRImg">{{phrases.invalidReceiptsExist}}</b-tooltip>
          </span>
        </template>
        <receipts-pane v-on:updateInvalidReceiptsInfo="updateInvalidReceiptsInfo"></receipts-pane>
      </b-tab>
      <b-tab class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.shares}}</span>
        </template>
        <shares-pane></shares-pane>
      </b-tab>
      <b-tab class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.savings}}</span>
        </template>
        <savings-pane></savings-pane>
      </b-tab>
      <b-tab class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.inventory}}</span>
        </template>
        <items-pane></items-pane>
      </b-tab>
      <b-tab class="appTab" v-on:click="scrollToTop">
        <template slot="title">
          <span class="navText">{{phrases.debts}}</span>
        </template>
        <debts-pane></debts-pane>
      </b-tab>
    </b-tabs>

    <b-tooltip boundary='window' target="annualReportBtn" triggers="hover" placement="top" ref="annualReportBtnTooltip" v-on:hide.prevent>
      {{phrases.showAnnualReport}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="annual-report-pane-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('annualReportPaneErrorModal')">
      <message-confirm-dialog ref="annualReportPaneErrorModal" parentModal="annual-report-pane-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop hide-footer hide-header id="annual-report-preview-modal" size="ar">
      <annual-report-preview :annualReport="annualReport" :year="bookingYear" :annualReportPages='annualReportPages' parentModal="annual-report-preview-modal" ref="annualReportPreviewModal"></annual-report-preview>
    </b-modal>

    <b-modal no-close-on-backdrop id="annual-report-preview-failed-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('annualReportPreviewFailedModal')">
      <message-confirm-dialog ref="annualReportPreviewFailedModal" parentModal="annual-report-preview-failed-modal" type="warning" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

  </b-container>
</template>

<script>
import store from "@/store";
import { mapState } from "vuex";

import AnnualReportPreview from "./AnnualReportPane/AnnualReportPreview";
import CodesPane from "./AnnualReportPane/CodesPane";
import GeneralPane from "./AnnualReportPane/GeneralPane";
import PaymentSlipsPane from "./AnnualReportPane/PaymentSlipsPane";
import ReceiptsPane from "./AnnualReportPane/ReceiptsPane";
import SharesPane from "./AnnualReportPane/SharesPane";
import SavingsPane from "./AnnualReportPane/SavingsPane";
import ItemsPane from "./AnnualReportPane/ItemsPane";
import DebtsPane from "./AnnualReportPane/DebtsPane";
import MessageConfirmDialog from "../../MessageConfirmDialog";

import Datepicker from "vuejs-datepicker";
import { sr, srCYRL } from "vuejs-datepicker/dist/locale";

const i18n = require('../../../../translations/i18n')
const annualReportController = require('../../../controllers/annualReportController')
const paymentSlipController = require('../../../controllers/paymentSlipController')
const receiptController = require('../../../controllers/receiptController')

export default {
  data() {
    return {
      phrases: {
        codes: i18n.getTranslation('Codes'),
        general:  i18n.getTranslation('General'),
        paymentSlips: i18n.getTranslation('Payment slips'),
        receipts: i18n.getTranslation('Receipts'),
        shares: i18n.getTranslation('Shares'),
        savings: i18n.getTranslation('Savings'),
        inventory: i18n.getTranslation('Inventory'),
        debts: i18n.getTranslation('Debts'),
        incomeAndOutcomeCodes: i18n.getTranslation('Income and outcome codes'),
        invalidPaymentSlipsExist: i18n.getTranslation('Invalid payment slips exist'),
        invalidReceiptsExist: i18n.getTranslation('Invalid receipts exist'),
        invalidPaymentSlipsOrReceiptsFound: i18n.getTranslation('Invalid payment slips or receipts found'),
        showAnnualReport: i18n.getTranslation('Show annual report'),
        ok: i18n.getTranslation('Ok'),
        save: i18n.getTranslation('Save')
      },
      arePaymentSlipsValid: true,
      areReceiptsValid: true,
      errorText: "",
      calendarLanguages: {
        sr: sr,
        srCYRL: srCYRL
      },
      alreadyPressed: false,
      year: new Date(),
      annualReport: null,
      annualReportPages: []
    };
  },
  created () {
    this.setBookingYear()
    const self = this
    this.$watch('bookingYear', () => {
      self.updateInvalidPaymentSlipsInfo()
      self.updateInvalidReceiptsInfo()
    }, {immediate: true})
  },
  computed: {
    ...mapState(
      {
        bookingYear: state => state.CommonValues.bookingYear
      }
    ),
  },
  methods: {
    unfocusElementOnNonKeyboardEvent (e) {
      if (!e.relatedTarget) {
        e.target.blur()
      }
    },
    scrollToTop () {
      window.scrollTo({ top: 0});
    },
    setBookingYear() {
      this.$store.dispatch('SET_BOOKING_YEAR', this.year.getFullYear())
    },
    createAnnualReport: function () {
      if (this.alreadyPressed) {
        return
      }
      const self = this
      annualReportController.getAnnualReport(this.bookingYear).then(function (res) {
        if (!res.err) {
            const annualReport = res.data
            self.annualReport = annualReport
            annualReportController.getAnnualReportPages(res.data).then(function (res) {
              self.alreadyPressed = false
              if (!res.err) {
                self.annualReportPages = res.data ? res.data : []
                self.hideTooltip('annualReportBtn')
                self.openAnnualReportPreviewModal()
              } else {
                self.openErrorModal(res.err)
              }
            })
        } else {
          self.alreadyPressed = false
          if (res.err == 'Invalid payment slips or receipts found') {
            self.openAnnualReportPreviewFailedModal(self.phrases.invalidPaymentSlipsOrReceiptsFound)
          } else {
            self.openErrorModal(res.err)
          }
        }
      })
    },
    updateInvalidPaymentSlipsInfo () {
      const self = this
      paymentSlipController.checkPaymentSlipsValidity(this.bookingYear).then(function (res) {
        if (!res.err) {
          self.arePaymentSlipsValid = res.data
        } else {
          self.openErrorModal(res.err)
        }
      })
    },
    updateInvalidReceiptsInfo () {
      const self = this
      receiptController.checkReceiptsValidity(this.bookingYear).then(function (res) {
        if (!res.err) {
          self.areReceiptsValid = res.data
        } else {
          self.openErrorModal(res.err)
        }
      })
    },
    limitInputPerSize(evt) {
      if (evt.key == 'Enter') {
        return
      }
      const highlightedText = window.getSelection().toString()
      if (evt.target.scrollWidth > evt.target.clientWidth && (!highlightedText || highlightedText == '')) {
        evt.preventDefault()
      } 
    },
    hideTooltip (elementId) {
      if (elementId) {
        this.$root.$emit('bv::hide::tooltip', elementId)
      } else {
        this.$root.$emit('bv::hide::tooltip')
      }
    },
    focusModalCloseButton (modalRef) {
      this.$refs[modalRef].$refs.closeButton.focus()
    },
    openErrorModal(error) {
      this.errorText = error
      this.$root.$emit('bv::show::modal', 'annual-report-pane-error-modal')
    },
    openAnnualReportPreviewFailedModal(error) {
      this.errorText = error
      this.$root.$emit('bv::show::modal', 'annual-report-preview-failed-modal')
    },
    openAnnualReportPreviewModal() {
      this.$root.$emit('bv::show::modal', 'annual-report-preview-modal')
    }
  },
  components: { AnnualReportPreview, CodesPane, GeneralPane, PaymentSlipsPane, ReceiptsPane, SharesPane, SavingsPane, ItemsPane, DebtsPane, MessageConfirmDialog, Datepicker }
};
</script>

<style scoped>
  input {
    text-align: center;
    font-family: "Times New Roman";
    font-size: 90%;
    letter-spacing: 95%;
    height:20px;
    font-weight: bold;
    border-bottom: .5pt solid black !important;
    border-radius: 0 !important;
  }
  .hidden {
    visibility:hidden;
  }
  .invalidTabIcon {
    height: 25px;
    width: auto;
  }
  
</style>

<style>
  .modal .modal-ar {
    max-width: 1280px;
    width: 1280px;
    max-height:985px;
    height:985px;
    overflow: hidden;
  }
  .bookingYearDatepickerInput {
    display: inline;
    border-style: none;
    border-bottom: .5pt solid black;
    text-align: center;
    white-space: nowrap;
    width:50px;
    max-height: 20px;
    font-weight: bold;
    color: black;
  }
  .bookingYearDatepickerWrapper {
    display: inline;
    white-space: normal;
    height: 20px;
    width: 95px;
  }
  .bookingYearDatepickerWrapper > div:first-child {
    display: inline;
    width: 95px;
  }
  .bookingYearDatepickerCalendar {
    left:0px;
    font-size: 120%;
    white-space: normal;
    z-index: 1000;
    -webkit-transform: scale(0.8, 0.8) translate(-70px, -70px); /* Safari and Chrome */
  }
  .bookingYearDatepickerCalendar span:hover  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
  .bookingYearDatepickerCalendar span.selected  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
</style>