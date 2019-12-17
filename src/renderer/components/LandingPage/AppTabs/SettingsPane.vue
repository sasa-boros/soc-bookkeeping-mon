<template>
  <b-container fluid>
    <b-row>
      <b-col cols=3>
        <span class="zoomLevelText">{{ phrases.setDefaultZoomLevel }}:</span> 
      </b-col>
      <b-col>
        <b-btn id="decreaseZoomLevelButton" v-on:mouseleave="hideTooltip('decreaseZoomLevelButton')" @click.stop="decreaseZoomLevel()" variant="light" class="btn-lg">
          <img src="~@/assets/minus.png">
        </b-btn>
          {{ zoomLevelFormated }}
        <b-btn id="increaseZoomLevelButton" v-on:mouseleave="hideTooltip('increaseZoomLevelButton')" @click.stop="increaseZoomLevel()" variant="light" class="btn-lg">
          <img src="~@/assets/plus.png">
        </b-btn>
      </b-col>
    </b-row>
    <br>
    <!--<b-row>
      <b-col cols=4>
        {{ phrases.setDefaultPaymentSlip }}:
      </b-col>
      <b-col>
        <b-btn id="defaultPaymentSlipBtn" v-on:mouseleave="hideTooltip('defaultPaymentSlipBtn')" @click.stop="openDefaultPaymentSlipModal()" variant="light" class="btn-lg">
          <img src="~@/assets/payment-slip.png">
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols=4>
        {{ phrases.setDefaultReceipt }}:
      </b-col>
      <b-col>
        <b-btn id="defaultReceiptBtn" v-on:mouseleave="hideTooltip('defaultReceiptBtn')" @click.stop="openDefaultReceiptModal()" variant="light" class="btn-lg">
          <img src="~@/assets/receipt.png">
        </b-btn>
      </b-col>
    </b-row>-->
    <b-row>
      <b-col>
        <b-form ref="commonDataForm" @submit="createAnnualReportCommonData" novalidate no-validation>
          Дневник благајне Српског православног манастира&nbsp;
          <b-form-input id="churchMunicipalityInput" type="text" v-model="churchMunicipality" v-on:input="disableCommonSaveBtn = false" v-on:keypress="limitInputPerSize"/> у
          <b-form-input id="churchTownInput" type="text" v-model="churchTown" v-on:input="disableCommonSaveBtn = false" v-on:keypress="limitInputPerSize"/>.&nbsp;
          <b-button id="commonSaveBtn" ref="commonSaveBtn" :disabled="disableCommonSaveBtn" v-on:mouseleave="hideTooltip('commonSaveBtn')" type="submit" variant="light">
            <img src="~@/assets/save.png">
          </b-button>
        </b-form>
      </b-col>
    </b-row>

    <br>
    <code-pane v-on:updateDefaultPaymentSlip="updateDefaultPaymentSlip" v-on:updateDefaultReceipt="updateDefaultReceipt"></code-pane>

    <!-- Default slip modal -->
    <b-modal no-close-on-backdrop hide-footer hide-header size="a5" id="default-payment-slip-modal">
      <payment-slip-preview parentModal="default-payment-slip-modal" :defaultPaymentSlipPreview='true' v-on:updateDefaultPaymentSlip="updateDefaultPaymentSlip"></payment-slip-preview>
    </b-modal>

    <!-- Default receipt modal -->
    <b-modal no-close-on-backdrop hide-footer hide-header size="a5" id="default-receipt-modal">
      <receipt-preview parentModal="default-receipt-modal" :defaultReceiptPreview='true' v-on:updateDefaultReceipt="updateDefaultReceipt"></receipt-preview>
    </b-modal>

    <b-tooltip boundary='window' target="commonSaveBtn" triggers="hover" placement="top" ref="commonSaveBtnTooltip" v-on:hide.prevent>
        {{phrases.save}}
      </b-tooltip>
      
    <b-tooltip boundary='window' target="defaultPaymentSlipBtn" triggers="hover" placement="top" ref="defaultPaymentSlipBtnTooltip" v-on:hide.prevent>
      {{phrases.adaptPaymentSlips}}
    </b-tooltip>

    <b-tooltip boundary='window' target="defaultReceiptBtn" triggers="hover" placement="top" ref="defaultReceiptBtnTooltip" v-on:hide.prevent>
      {{phrases.adaptReceipts}}
    </b-tooltip>

    <b-tooltip boundary='window' target="increaseZoomLevelButton" triggers="hover" placement="top" ref="increaseZoomLevelButtonTooltip" v-on:hide.prevent>
      {{phrases.increase}}
    </b-tooltip>

    <b-tooltip boundary='window' target="decreaseZoomLevelButton" triggers="hover" placement="top" ref="decreaseZoomLevelButtonTooltip" v-on:hide.prevent>
      {{phrases.decrease}}
    </b-tooltip>
  </b-container>
</template>

<script>
  import PaymentSlipPreview from './PaymentSlipsPane/PaymentSlipPreview'
  import ReceiptPreview from './ReceiptsPane/ReceiptPreview'
  import CodePane from './CodePane'

  const Big = require('big.js')
  const i18n = require('../../../../translations/i18n')
  const annualReportController = require('../../../controllers/annualReportController')
  const settingsController = require('../../../controllers/settingsController')

  export default {
    data () {
      return {
        phrases: {
          setDefaultPaymentSlip: i18n.getTranslation('Default values for payment slips'),
          setDefaultReceipt: i18n.getTranslation('Default values for receipts'),
          setDefaultZoomLevel: i18n.getTranslation('Default zoom level'),
          adaptPaymentSlips: i18n.getTranslation('Adapt payment slips'),
          adaptReceipts: i18n.getTranslation('Adapt receipts'),
          increase: i18n.getTranslation('Increase'),
          decrease: i18n.getTranslation('Decrease'),
          save: i18n.getTranslation('Save'),
          alreadyPressed: false
        },
        churchMunicipality: null,
        churchTown: null,
        zoomLevel: Big(1.3),
        commonDataSaveTimeout: null,
        disableCommonSaveBtn: true
      }
    },
    created () {
      this.loadAnnualReportCommon()
      this.loadSettings()
    },
    computed: {
      zoomLevelFormated: function() {
        if(!this.zoomLevel) {
          return null;
        }
        var formatedZoomLevel = this.zoomLevel.times(100).minus(30)
        return formatedZoomLevel.toString() + ' %'
      }
    },
    methods: {
      loadAnnualReportCommon () {
        const self = this
        annualReportController.getAnnualReportCommonData().then((res) => {
          if (!res.err) {
            self.churchMunicipality = res.data ? res.data.churchMunicipality : null
            self.churchTown = res.data ? res.data.churchTown : null
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      createAnnualReportCommonData (evt) {
        evt.preventDefault()
        if (this.alreadyPressed) {
          return
        }
        this.hideTooltip('commonSaveBtn')
        const self = this
        this.alreadyPressed = true
        annualReportController.createAnnualReportCommonData({churchMunicipality: self.churchMunicipality, churchTown: self.churchTown}).then(function(res) {
          self.alreadyPressed = false
          if (!res.err) {
            self.disableCommonSaveBtn = true
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      loadSettings () {
        const self = this
        settingsController.getSettings().then(function (res) {
          if (!res.err) {
            self.zoomLevel = Big(res.data && res.data.zoomLevel ? res.data.zoomLevel : 1.3)
            self.$emit('updateZoomLevel', parseFloat(self.zoomLevel))
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
      updateDefaultPaymentSlip () {
        this.$emit('updateDefaultPaymentSlip')
      },
      updateDefaultReceipt () {
        this.$emit('updateDefaultReceipt')
      },
      updateDefaultShare () {
        this.$emit('updateDefaultShare')
      },
      updateDefaultSaving () {
        this.$emit('updateDefaultSaving')
      },
      openDefaultPaymentSlipModal () {
        this.hideTooltip('defaultPaymentSlipBtn')
        this.$root.$emit('bv::show::modal', 'default-payment-slip-modal')
      },
      openDefaultReceiptModal () {
        this.hideTooltip('defaultReceiptBtn')
        this.$root.$emit('bv::show::modal', 'default-receipt-modal')
      },
      increaseZoomLevel () {
        if(!this.zoomLevel.gte(1.8)) {
          this.zoomLevel = this.zoomLevel.plus(0.1)
          this.updateZoomLevel()
        }
      },
      decreaseZoomLevel () {
        if(!this.zoomLevel.lte(0.8)) {
          this.zoomLevel = this.zoomLevel.minus(0.1)
          this.updateZoomLevel()
        }
      },
      updateZoomLevel () {
        const self = this
        settingsController.createSettings({zoomLevel: parseFloat(self.zoomLevel)}).then(function (res) {
          if (!res.err) {
            self.$emit('updateZoomLevel', parseFloat(self.zoomLevel))
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      hideTooltip (elementId) {
        if (elementId) {
          this.$root.$emit('bv::hide::tooltip', elementId)
        } else {
          this.$root.$emit('bv::hide::tooltip')
        }
      }
    },
    components: { PaymentSlipPreview, ReceiptPreview, CodePane }
  }
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

  #churchMunicipalityInput {
    width: 440px;
    max-width: 440px;
    border-style: none;
    display:inline;
  }

  #churchTownInput {
    width: 278px;
    max-width: 278px;
    border-style: none;
    display:inline;
  }

  #zoomLevelInput {
    width: 60px;
  }
  .input-small {
    border-style: none;
    font-weight: bold;
    display: inline;
    height: 20px;
    margin: 0px;
    color: black;
  }
  input {
    /* Immitate the underline in the real payment slip */
    border-bottom: .5pt solid black !important;
    border-radius: 0 !important;
    text-align:center;
    font-family: "Times New Roman";
    font-size: 90%;
    letter-spacing: 95%;
  }

  .zoomLevelText {
    position: relative;
    top:13px;
  }
</style>
