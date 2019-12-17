<template>
  <b-container fluid>
    <b-card no-body id="appTabsCard">
      <b-tabs card>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/annual-report.png" class="appTabsIcon">  
            {{phrases.annualReport}}
          </template>
          <annual-report-pane></annual-report-pane>
        </b-tab>
        <b-tab active class="appTab">
          <template slot="title">
            <img src="~@/assets/payment-slip.png" class="appTabsIcon">  
            {{phrases.paymentSlips}} 
            <span v-show="!arePaymentSlipsValid">
              &nbsp;
              <img id="invalidPsImg" v-on:mouseleave="hideTooltip('invalidPsImg')" src="~@/assets/invalid.png" class="invalidTabIcon">
              <b-tooltip boundary='window' target="invalidPsImg">
                  {{phrases.invalidPaymentSlipsExist}}
              </b-tooltip>
            </span>
          </template>
          <payment-slips-pane v-on:updateBookedYears="updateBookedYears" v-on:updateInvalidPaymentSlipsInfo="updateInvalidPaymentSlipsInfo"></payment-slips-pane>
        </b-tab>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/receipt.png" class="appTabsIcon">  
            {{phrases.receipts}}
            <span v-show="!areReceiptsValid">
              &nbsp;
              <img id="invalidRImg" v-on:mouseleave="hideTooltip('invalidRImg')" src="~@/assets/invalid.png" class="invalidTabIcon">
              <b-tooltip boundary='window' target="invalidRImg">
                  {{phrases.invalidReceiptsExist}}
              </b-tooltip>
            </span>
          </template>
          <receipts-pane v-on:updateBookedYears="updateBookedYears" v-on:updateInvalidReceiptsInfo="updateInvalidReceiptsInfo"></receipts-pane>
        </b-tab>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/share.png" class="appTabsIcon">  
            {{phrases.shares}}
          </template>
          <shares-pane v-on:updateBookedYears="updateBookedYears"></shares-pane>
        </b-tab>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/savings.png" class="appTabsIcon">  
            {{phrases.savings}}
          </template>
          <savings-pane v-on:updateBookedYears="updateBookedYears"></savings-pane>
        </b-tab>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/inventory.png" class="appTabsIcon">  
            {{phrases.inventory}}
          </template>
          <items-pane v-on:updateBookedYears="updateBookedYears"></items-pane>
        </b-tab>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/debt.png" class="appTabsIcon">  
            {{phrases.debts}}
          </template>
          <debts-pane v-on:updateBookedYears="updateBookedYears"></debts-pane>
        </b-tab>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/settings.png" class="appTabsIcon">  
            {{phrases.settings}}
          </template>
          <settings-pane v-on:updateDefaultPaymentSlip="updateDefaultPaymentSlip" v-on:updateDefaultReceipt="updateDefaultReceipt" v-on:updateZoomLevel="updateZoomLevel"></settings-pane>
        </b-tab>
        <b-tab class="appTab">
          <template slot="title">
            <img src="~@/assets/info.png" class="appTabsIcon">
            {{phrases.info}}  
          </template>
          <about-pane></about-pane>
        </b-tab>
      </b-tabs>
      <b-modal no-close-on-backdrop id="app-tabs-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('appTabsErrorModal')">
          <message-confirm-dialog ref="appTabsErrorModal" parentModal="app-tabs-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
      </b-modal>
    </b-card>
  </b-container>
</template>

<script>
  import store from '@/store'
  import ReceiptsPane from './AppTabs/ReceiptsPane'
  import PaymentSlipsPane from './AppTabs/PaymentSlipsPane'
  import SharesPane from './AppTabs/SharesPane'
  import SavingsPane from './AppTabs/SavingsPane'
  import ItemsPane from './AppTabs/ItemsPane'
  import DebtsPane from './AppTabs/DebtsPane'
  import AnnualReportPane from './AppTabs/AnnualReportPane'
  import CodePane from './AppTabs/CodePane'
  import SettingsPane from './AppTabs/SettingsPane'
  import AboutPane from './AppTabs/AboutPane'
  import MessageConfirmDialog from '../MessageConfirmDialog'

  const {webFrame} = require('electron')
  const Big = require('big.js')

  const i18n = require('../../../translations/i18n')
  const paymentSlipController = require('../../controllers/paymentSlipController')
  const defaultPaymentSlipController = require('../../controllers/defaultPaymentSlipController')
  const receiptController = require('../../controllers/receiptController')
  const defaultReceiptController = require('../../controllers/defaultReceiptController')
  const commonController = require('../../controllers/commonController')

  export default {
    data () {
      return {
        phrases: {
          annualReport: i18n.getTranslation('Annual report'),
          paymentSlips: i18n.getTranslation('Payment slips'),
          receipts: i18n.getTranslation('Receipts'),
          shares: i18n.getTranslation('Shares'),
          savings: i18n.getTranslation('Savings'),
          inventory: i18n.getTranslation('Inventory'),
          debts: i18n.getTranslation('Debts'),
          incomeAndOutcomeCodes: i18n.getTranslation('Income and outcome codes'),
          settings: i18n.getTranslation('Settings'),
          invalidPaymentSlipsExist: i18n.getTranslation('Invalid payment slips exist'),
          invalidReceiptsExist: i18n.getTranslation('Invalid receipts exist'),
          ok: i18n.getTranslation('Ok'),
          info: i18n.getTranslation('Information')
        },
        arePaymentSlipsValid: true,
        areReceiptsValid: true,
        errorText: "",
        zoomLevel: Big(1.3)
      }
    },
    created () {
      this.updateInvalidPaymentSlipsInfo()
      this.updateInvalidReceiptsInfo()
      this.updateDefaultPaymentSlip();
      this.updateDefaultReceipt();
      this.updateBookedYears();
    },
    mounted () {
      this.bindKeys()
    },
    beforeDestroy () {
      this.unbindKeys()
    },
    methods: {
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
      },
      bindKeys() {
        const self = this
        Mousetrap.bind(['command+=', 'ctrl+='], function(e) {
          e.preventDefault()
          self.increaseZoomLevel()
          return false
        });
        Mousetrap.bind(['command+-', 'ctrl+-'], function(e) {
          e.preventDefault()
          self.decreaseZoomLevel()
          return false
        });
        Mousetrap.prototype.stopCallback = function () {
          return false
        }
      },
      unbindKeys() {
        Mousetrap.unbind(['command+=', 'ctrl+='])
        Mousetrap.unbind(['command+-', 'ctrl+-'])
      },
      updateInvalidPaymentSlipsInfo () {
        const self = this
        paymentSlipController.arePaymentSlipsValid().then(function (res) {
          if (!res.err) {
            self.arePaymentSlipsValid = res.data
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      updateInvalidReceiptsInfo () {
        const self = this
        receiptController.areReceiptsValid().then(function (res) {
          if (!res.err) {
            self.areReceiptsValid = res.data
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      updateDefaultPaymentSlip () {
        const self = this
        defaultPaymentSlipController.getDefaultPaymentSlip().then(function (res) {
          if (!res.err) {
            const defaultPaymentSlip = res.data
            self.$store.dispatch('SET_DEFAULT_PAYMENT_SLIP', defaultPaymentSlip)
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      updateDefaultReceipt () {
        const self = this
        defaultReceiptController.getDefaultReceipt().then(function (res) {
          if (!res.err) {
            const defaultReceipt = res.data
            self.$store.dispatch('SET_DEFAULT_RECEIPT', defaultReceipt)
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      updateBookedYears () {
        const self = this
        commonController.getBookedYears().then(function (res) {
          if (!res.err) {
            var bookedYears = (res.data || [])
            self.$store.dispatch('SET_BOOKED_YEARS', bookedYears)
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      increaseZoomLevel () {
        if(!this.zoomLevel.gte(1.8)) {
          this.zoomLevel = this.zoomLevel.plus(0.1)
          webFrame.setZoomFactor(parseFloat(this.zoomLevel))
        }
      },
      decreaseZoomLevel () {
        if(!this.zoomLevel.lte(0.8)) {
          this.zoomLevel = this.zoomLevel.minus(0.1)
          webFrame.setZoomFactor(parseFloat(this.zoomLevel))
        }
      },
      updateZoomLevel (zoomLevel) {
        this.zoomLevel = Big(zoomLevel)
        const newZoomLevel = parseFloat(this.zoomLevel)
        if (webFrame.getZoomFactor() != newZoomLevel) {
          webFrame.setZoomFactor(newZoomLevel)
        }
      },
      hideTooltip (elementId) {
        if (elementId) {
          this.$root.$emit('bv::hide::tooltip', elementId)
        } else {
          this.$root.$emit('bv::hide::tooltip')
        }
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'app-tabs-error-modal')
      }
    },
    components: { ReceiptsPane, PaymentSlipsPane, SharesPane, SavingsPane, ItemsPane, DebtsPane, AnnualReportPane, CodePane, SettingsPane, AboutPane, MessageConfirmDialog }
  }
</script>

<style scoped>
  .input-small {
    border-style: none;
    width: 100px;
    height: 15px;
    margin: 0px;
    color: black;
  }
  .appTab {
    display: block;
    overflow: auto;
  }
  .appTabsIcon {
    width: auto;
    margin-right: 5px;
  }
  .invalidTabIcon {
    height: 25px;
    width: auto;
  }
</style>