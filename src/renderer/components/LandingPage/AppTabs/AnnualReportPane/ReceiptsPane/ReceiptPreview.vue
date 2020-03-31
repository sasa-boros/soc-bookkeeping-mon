<template>       
  <b-container fluid id="receipt-preview-container" v-on:keyup.tab.exact="tabPressedHandler" v-on:keyup.shift.tab.exact="shiftTabPressedHandler">
    <b-form ref="form" @submit="onSubmit" novalidate no-validation>
      <b-button @click.stop="closeModal()" variant="link" class="ignoreInPrint btn-xs" id="modalCancelBtn">
        <img src="~@/assets/close.png" class="ignoreInPrint">
      </b-button>
      <div class="receipt-preview-text">
        <h1> ПРИЗНАНИЦА </h1>
        <br/>         На динара <b-form-input disabled id="outcomeInput" ref="outcomeInput" v-model="form.outcome" class="input-small numberInput" type="text"></b-form-input> и словима <b-form-input disabled class="input-small" id="outcomeAsText1" v-model="generatedOutcomeTextLine1"></b-form-input>
        <br/><b-form-input disabled class="input-small" id="outcomeAsText2" v-model="generatedOutcomeTextLine2"></b-form-input>
        <br/>примљених из благајне Српског православног манастира
у <b-form-input id="townInput" v-on:keypress="limitInputPerSize" v-model="form.town" class="input-small" type="text"></b-form-input> на име <b-form-input id="reasonInput" :autofocus="!receiptPreview" v-on:keypress="limitInputPerSize" v-on:mouseleave="disableReasonTooltip ? null : hideTooltip('reasonInput')" v-model="form.reason" class="input-small" v-bind:class="{ 'is-invalid': shouldValidate && missingReason }" type="text"></b-form-input>
                                                                                                                                         Примио,
                        Исплатио благајник,                                              <b-form-input v-on:keypress="limitInputPerSize"  v-model="form.received" class="input-small" id="receivedInput" type="text"></b-form-input>
<br><b-form-input disabled class="input-small" id="payedInput" type="text"></b-form-input>&nbsp;                       Да се исплати на терет расхода <b-form-input disabled id="yearInput" ref="yearInput" class="input-small" v-model="bookingYear"></b-form-input> год.                      
у <b-form-input id="townPayedInput" v-on:keypress="limitInputPerSize" v-model="form.townPayed" class="input-small" type="text"></b-form-input>&nbsp;         <span class="partText">Парт. </span><b-form-input id="firstPartInput"  type="text" v-model="formatedFirstPart" v-bind:class="{ 'is-invalid': !disableFirstPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableFirstPartTooltip ? null : hideTooltip('firstPartPosSelect')"><b-dropdown  id="firstPartPosSelect" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedFirstPartPos(option.value)" v-for="(option, index) in firstPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span> поз. <span v-on:mouseleave="disableFirstPosTooltip ? null : hideTooltip('firstPosInputWrapper')" id="firstPosInputWrapper"><b-form-input id="firstPosInput" v-model="form.firstPosition" v-bind:class="{ 'is-invalid': !disableFirstPosTooltip}" class="input-small" disabled/></span> дин. <span v-on:mouseleave="disableFirstOutcomeTooltip ? null : hideTooltip('firstOutcomeInputWrapper')" id="firstOutcomeInputWrapper"><b-form-input v-on:keypress.enter="adaptAutoNumericAmount('firstOutcome')" v-on:cut="updateAfterCut" id="firstOutcomeInput" v-model="form.firstOutcome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableFirstOutcomeTooltip }" :disabled="missingFirstPart || (selectedFirstOutcomeCode && selectedFirstOutcomeCode.tax)" type="text"></b-form-input></span>
<span v-on:mouseleave="disableDateTooltip ? null : hideTooltip('dateInput')"><datepicker id="dateInput" ref="dateInput" v-model="form.date" :input-class="{ 'is-invalid-date': shouldValidate && missingDate, 'receiptDatepickerInput': true }" :language="calendarLanguages.srCYRL" wrapper-class="receiptDatepickerWrapper" calendar-class="receiptDatepickerCalendar"></datepicker>год.</span>&nbsp;                                                             <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="secondPartInput" type="text"  v-model="formatedSecondPart" v-bind:class="{ 'is-invalid': !disableSecondPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableSecondPartTooltip ? null : hideTooltip('secondPartPosSelect')"><b-dropdown  id="secondPartPosSelect" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedSecondPartPos(option.value)" v-for="(option, index) in secondPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableSecondPosTooltip ? null : hideTooltip('secondPosInputWrapper')" id="secondPosInputWrapper"><b-form-input id="secondPosInput" v-model="form.secondPosition" v-bind:class="{ 'is-invalid': !disableSecondPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableSecondOutcomeTooltip ? null : hideTooltip('secondOutcomeInputWrapper')" id="secondOutcomeInputWrapper"><b-form-input v-on:keypress.enter="adaptAutoNumericAmount('secondOutcome')" v-on:cut="updateAfterCut" v-model="form.secondOutcome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableSecondOutcomeTooltip }" id="secondOutcomeInput" :disabled="missingSecondPart || (selectedSecondOutcomeCode && selectedSecondOutcomeCode.tax)" type="text"></b-form-input></span>
&nbsp;                                                                                               <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="thirdPartInput" type="text"  v-model="formatedThirdPart" v-bind:class="{ 'is-invalid': !disableThirdPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableThirdPartTooltip ? null : hideTooltip('thirdPartPosSelect')"><b-dropdown  id="thirdPartPosSelect" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedThirdPartPos(option.value)" v-for="(option, index) in thirdPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableThirdPosTooltip ? null : hideTooltip('thirdPosInputWrapper')" id="thirdPosInputWrapper"><b-form-input id="thirdPosInput" v-model="form.thirdPosition" v-bind:class="{ 'is-invalid': !disableThirdPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableThirdOutcomeTooltip ? null : hideTooltip('thirdOutcomeInputWrapper')" id="thirdOutcomeInputWrapper"><b-form-input v-on:keypress.enter="adaptAutoNumericAmount('thirdOutcome')" v-on:cut="updateAfterCut" v-model="form.thirdOutcome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableThirdOutcomeTooltip }" id="thirdOutcomeInput" :disabled="missingThirdPart || (selectedThirdOutcomeCode && selectedThirdOutcomeCode.tax)" type="text"></b-form-input></span>
&nbsp;                                                                                               <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="fourthPartInput" type="text"  v-model="formatedFourthPart" v-bind:class="{ 'is-invalid': !disableFourthPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableFourthPartTooltip ? null : hideTooltip('fourthPartPosSelect')"><b-dropdown  id="fourthPartPosSelect" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedFourthPartPos(option.value)" v-for="(option, index) in fourthPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFourthPosTooltip ? null : hideTooltip('fourthPosInputWrapper')" id="fourthPosInputWrapper"><b-form-input id="fourthPosInput" v-model="form.fourthPosition" v-bind:class="{ 'is-invalid': !disableFourthPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFourthOutcomeTooltip ? null : hideTooltip('fourthOutcomeInputWrapper')" id="fourthOutcomeInputWrapper"><b-form-input v-on:keypress.enter="adaptAutoNumericAmount('fourthOutcome')" v-on:cut="updateAfterCut" v-model="form.fourthOutcome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableFourthOutcomeTooltip }" id="fourthOutcomeInput" :disabled="missingFourthPart || (selectedFourthOutcomeCode && selectedFourthOutcomeCode.tax)" type="text"></b-form-input></span>
&nbsp;                                                                                               <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="fifthPartInput" type="text"  v-model="formatedFifthPart" v-bind:class="{ 'is-invalid': !disableFifthPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableFifthPartTooltip ? null : hideTooltip('fifthPartPosSelect')"><b-dropdown  id="fifthPartPosSelect" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedFifthPartPos(option.value)" v-for="(option, index) in fifthPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFifthPosTooltip ? null : hideTooltip('fifthPosInputWrapper')" id="fifthPosInputWrapper"><b-form-input id="fifthPosInput" v-model="form.fifthPosition" v-bind:class="{ 'is-invalid': !disableFifthPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFifthOutcomeTooltip ? null : hideTooltip('fifthOutcomeInputWrapper')" id="fifthOutcomeInputWrapper"><b-form-input v-on:keypress.enter="adaptAutoNumericAmount('fifthOutcome')" v-on:cut="updateAfterCut" v-model="form.fifthOutcome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableFifthOutcomeTooltip }" id="fifthOutcomeInput" :disabled="missingFifthPart || (selectedFifthOutcomeCode && selectedFifthOutcomeCode.tax)" type="text"></b-form-input></span>
                                                                                                                                             Свега дин. <span id="totalOutcomeInputWrapper"><b-form-input id="totalOutcomeInput" disabled v-model="form.outcome" class="input-small numberInput" type="text"></b-form-input></span>
                                                                                                                                    НАРЕДБОДАВАЦ
Књижено у Дневник благајне                                                                              Настојатељ манастира,
бр. <span v-on:mouseleave="hideTooltip('ordinalInputWrapper')" id="ordinalInputWrapper"><b-form-input disabled v-model="form.ordinal" class="input-small" id="ordinalInput" type="text"></b-form-input></span> страна <span v-on:mouseleave="hideTooltip('annualReportPageInputWrapper')" id="annualReportPageInputWrapper"><b-form-input disabled v-model="form.annualReportPage" class="input-small" id="annualReportPageInput" type="text"></b-form-input></span>&nbsp;                                                         <b-form-input disabled class="input-small" id="municipalityPresidentInput" type="text"></b-form-input>
      </div>
      <div id="downloadPrintBtnsDiv">
        <b-button v-on:mouseleave="hideTooltip('receiptDownloadBtn')" ref="receiptDownloadBtn" id="receiptDownloadBtn" @click.stop="downloadReceipt()" variant="light" class="ignoreInPrint btn-lg" :disabled="disablePrintAndDownload">
          <img src="~@/assets/download.png" class="ignoreInPrint">
        </b-button>
        &nbsp;
        <b-button v-on:mouseleave="hideTooltip('receiptPrintBtn')" ref="receiptPrintBtn" id="receiptPrintBtn" @click.stop="printReceipt()" variant="light" class="ignoreInPrint btn-lg" :disabled="disablePrintAndDownload">
          <img src="~@/assets/print.png" class="ignoreInPrint">
        </b-button>
      </div>
      <div id="clearSaveBtnsDiv">
        <b-button v-on:mouseleave="hideTooltip('receiptSaveBtn')" ref="receiptSaveBtn" id="receiptSaveBtn" type="submit" variant="light" class="ignoreInPrint btn-lg">
          <img src="~@/assets/save.png" class="ignoreInPrint">
        </b-button>
        <b-button v-on:mouseleave="hideTooltip('receiptClearBtn')" ref="receiptClearBtn" id="receiptClearBtn" @click.stop="clearForm()" variant="light" class="ignoreInPrint btn-lg">
          <img src="~@/assets/clear.png" class="ignoreInPrint">
        </b-button>
      </div>
    </b-form>

    <b-tooltip boundary='window' target="reasonInput" triggers="hover" placement="top" ref="reasonInputTooltip" :disabled.sync="disableReasonTooltip" v-on:hide.prevent>
      {{phrases.enterReason}}
    </b-tooltip>

    <b-tooltip boundary='window' target="firstPartPosSelect" triggers="hover" placement="top" ref="firstPartInputTooltip" :disabled.sync="disableFirstPartTooltip" v-on:hide.prevent>
      {{firstPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="firstPosInputWrapper" triggers="hover" placement="top" ref="firstPosInputTooltip" :disabled.sync="disableFirstPosTooltip" v-on:hide.prevent>
      {{firstPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="firstOutcomeInputWrapper" triggers="hover" placement="top" ref="firstOutcomeInputTooltip" :disabled.sync="disableFirstOutcomeTooltip" v-on:hide.prevent>
      {{firstOutcomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="secondPartPosSelect" triggers="hover" placement="top" ref="secondPartInputTooltip" :disabled.sync="disableSecondPartTooltip" v-on:hide.prevent>
      {{secondPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="secondPosInputWrapper" triggers="hover" placement="top" ref="secondPosInputTooltip" :disabled.sync="disableSecondPosTooltip" v-on:hide.prevent>
      {{secondPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="secondOutcomeInputWrapper" triggers="hover" placement="top" ref="secondOutcomeInputTooltip" :disabled.sync="disableSecondOutcomeTooltip" v-on:hide.prevent>
      {{secondOutcomeTooltipText}}
    </b-tooltip>
    
    <b-tooltip boundary='window' target="thirdPartPosSelect" triggers="hover" placement="top" ref="thirdPartInputTooltip" :disabled.sync="disableThirdPartTooltip" v-on:hide.prevent>
      {{thirdPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="thirdPosInputWrapper" triggers="hover" placement="top" ref="thirdPosInputTooltip" :disabled.sync="disableThirdPosTooltip" v-on:hide.prevent>
      {{thirdPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="thirdOutcomeInputWrapper" triggers="hover" placement="top" ref="thirdOutcomeInputTooltip" :disabled.sync="disableThirdOutcomeTooltip" v-on:hide.prevent>
      {{thirdOutcomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fourthPartPosSelect" triggers="hover" placement="top" ref="fourthPartInputTooltip" :disabled.sync="disableFourthPartTooltip" v-on:hide.prevent>
      {{fourthPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fourthPosInputWrapper" triggers="hover" placement="top" ref="fourthPosInputTooltip" :disabled.sync="disableFourthPosTooltip" v-on:hide.prevent>
      {{fourthPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fourthOutcomeInputWrapper" triggers="hover" placement="top" ref="fourthOutcomeInputTooltip" :disabled.sync="disableFourthOutcomeTooltip" v-on:hide.prevent>
      {{fourthOutcomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fifthPartPosSelect" triggers="hover" placement="top" ref="fifthPartInputTooltip" :disabled.sync="disableFifthPartTooltip" v-on:hide.prevent>
      {{fifthPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fifthPosInputWrapper" triggers="hover" placement="top" ref="fifthPosInputTooltip" :disabled.sync="disableFifthPosTooltip" v-on:hide.prevent>
      {{fifthPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fifthOutcomeInputWrapper" triggers="hover" placement="top" ref="fifthOutcomeInputTooltip" :disabled.sync="disableFifthOutcomeTooltip" v-on:hide.prevent>
      {{fifthOutcomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="dateInput" triggers="hover" placement="top" ref="dateInputTooltip" :disabled.sync="disableDateTooltip" v-on:hide.prevent>
      {{phrases.pickDate}}
    </b-tooltip>

    <b-tooltip boundary='window' target="annualReportPageInputWrapper" triggers="hover" placement="top" ref="annualReportPageInputTooltip" v-on:hide.prevent>
      {{phrases.automaticallyGeneratedAfterSave}}
    </b-tooltip>

    <b-tooltip boundary='window' target="ordinalInputWrapper" triggers="hover" placement="top" ref="ordinalInputTooltip" v-on:hide.prevent>
      {{phrases.automaticallyGeneratedAfterSave}}
    </b-tooltip>

    <b-tooltip boundary='window' target="receiptDownloadBtn" triggers="hover" placement="top" ref="receiptDownloadBtnTooltip" v-on:hide.prevent>
      {{phrases.download}}
    </b-tooltip>

    <b-tooltip boundary='window' target="receiptPrintBtn" triggers="hover" placement="top" ref="receiptPrintBtnTooltip" v-on:hide.prevent>
      {{phrases.print}}
    </b-tooltip>

    <b-tooltip boundary='window' target="receiptSaveBtn" triggers="hover" placement="top" ref="receiptSaveBtnTooltip" v-on:hide.prevent>
      {{phrases.save}}
    </b-tooltip>

    <b-tooltip boundary='window' target="receiptClearBtn" triggers="hover" placement="top" ref="receiptClearBtnTooltip" v-on:hide.prevent>
      {{phrases.clear}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="receipt-preview-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('receiptPreviewErrorModal')">
        <message-confirm-dialog ref="receiptPreviewErrorModal" parentModal="receipt-preview-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import Datepicker from 'vuejs-datepicker'
  import { sr, srCYRL } from 'vuejs-datepicker/dist/locale'
  import MessageConfirmDialog from '../../../../MessageConfirmDialog'
  
  const annualReportController = require('../../../../../controllers/annualReportController')
  const outcomeCodeController = require('../../../../../controllers/outcomeCodeController')
  const receiptController = require('../../../../../controllers/receiptController')
  const { asRoman, numberToSerbianDinars, getCodeCombinations, mapReceiptToReceiptForm, mapReceiptFormToReceipt, saveAs, asFloat, asFormatedString, amountNumberOptions, largeAmountNumberOptions } = require('../../../../../utils/utils')
  const i18n = require('../../../../../../translations/i18n')
  const AutoNumeric = require('autonumeric')
  const Mousetrap = require('mousetrap')
  const Big = require('big.js')

  export default {
    store: store,
    props: {
      receipt: {
        type: Object,
        default: null
      },
      receiptPreview: {
        type: Boolean,
        default: false
      },
      parentModal: {
        type: String,
        default: null
      }
    },
    data () {
      return {
        form: null,
        shouldValidate: false,
        preDatepickerJustBlurred: false,
        postDatepickerJustBlurred: false,
        outcomeCodes: null,
        errorText: "",
        phrases: {
          save: i18n.getTranslation('Save'),
          print: i18n.getTranslation('Print'),
          clear: i18n.getTranslation('Clear'),
          enterAmount: i18n.getTranslation('Enter amount'),
          enterReason: i18n.getTranslation('Enter reason'),
          pickDate: i18n.getTranslation('Pick a date'),
          atLeastOnePartPosAmount: i18n.getTranslation('Enter at least one partition, position, amount'),
          ok: i18n.getTranslation('Ok'),
          download: i18n.getTranslation('Download'),
          receiptFileName: i18n.getTranslation('receipt'),
          automaticallyGeneratedAfterSave: i18n.getTranslation('Automatically generated after save'),
          saveError: i18n.getTranslation('Failed saving error'),
          unexistingPartitionAndPosition: i18n.getTranslation('Unexisting partition and position')
        },
        calendarLanguages: {
          sr: sr,
          srCYRL: srCYRL
        },
        disabledDates: {
          from: null,
          to: null
        },
        alreadyPressed: false,
        disablePrintAndDownload: true,
        tooltipTimeouts: [],
        formatedFirstPart: null,
        formatedSecondPart: null,
        formatedThirdPart: null,
        formatedFourthPart: null,
        formatedFifthPart: null,
        commonData: null,
        selectedFirstOutcomeCode: null,
        selectedSecondOutcomeCode: null,
        selectedThirdOutcomeCode: null,
        selectedFourthOutcomeCode: null,
        selectedFifthOutcomeCode: null,
        initialPartPosOptions: null,
        openDate: null
      }
    },
    created () {
      var now = new Date()
      if (this.bookingYear == now.getFullYear()) {
        this.openDate = now
      } else {
        this.openDate = new Date(this.bookingYear, 0, 1, 0, 0, 0);
      }
      this.disabledDates.to = new Date(this.bookingYear, 0, 1, 0, 0, 0);
      this.disabledDates.from = new Date(this.bookingYear, 11, 31, 23, 59, 59)
      this.loadAnnualReportCommon()
      if(this.receiptPreview) {
        var receipt = JSON.parse(JSON.stringify(this.receipt));
        this.form = mapReceiptToReceiptForm(receipt);
        if (!this.form.isValid) {
          this.shouldValidate = true;
        } else {
          this.disablePrintAndDownload = false
        }
      } else {
        this.form = mapReceiptToReceiptForm({});
      } 
      const self = this;
      outcomeCodeController.getOutcomeCodes(this.bookingYear).then(function (res) {
        if (!res.err) {
          self.outcomeCodes = res.data ? res.data : []
          self.initialPartPosOptions = self.getInitialPartPosOptions()
          self.determineSelectedCodes()
        } else {
          self.openErrorModal(res.err)
        }
      })
      const unwatch = this.$watch('form', () => {
        self.disablePrintAndDownload = true
        unwatch()
      }, {deep: true})
      this.$watch('form.firstPartition', () => {
        self.formatedFirstPart = asRoman(self.form.firstPartition)
      }, {immediate: true})
      this.$watch('form.secondPartition', () => {
        self.formatedSecondPart = asRoman(self.form.secondPartition)
      }, {immediate: true})
      this.$watch('form.thirdPartition', () => {
        self.formatedThirdPart = asRoman(self.form.thirdPartition)
      }, {immediate: true})
      this.$watch('form.fourthPartition', () => {
        self.formatedFourthPart = asRoman(self.form.fourthPartition)
      }, {immediate: true})
      this.$watch('form.fifthPartition', () => {
        self.formatedFifthPart = asRoman(self.form.fifthPartition)
      }, {immediate: true})
      this.$watch('selectedFirstOutcomeCode', () => {
        self.calculateTax()
      })
      this.$watch('selectedSecondOutcomeCode', () => {
        self.calculateTax()
      })
      this.$watch('selectedThirdOutcomeCode', () => {
        self.calculateTax()
      })
      this.$watch('selectedFourthOutcomeCode', () => {
        self.calculateTax()
      })
      this.$watch('selectedFifthOutcomeCode', () => {
        self.calculateTax()
      })
      this.$watch('form.firstOutcome', () => {
        self.calculateTax()
        self.calculateTotalOutcome()
      })
      this.$watch('form.secondOutcome', () => {
        self.calculateTax()
        self.calculateTotalOutcome()
      })
      this.$watch('form.thirdOutcome', () => {
        self.calculateTax()
        self.calculateTotalOutcome()
      })
      this.$watch('form.fourthOutcome', () => {
        self.calculateTax()
        self.calculateTotalOutcome()
      })
      this.$watch('form.fifthOutcome', () => {
        self.calculateTax()
        self.calculateTotalOutcome()
      })
    },
    mounted () {
      new AutoNumeric('#firstOutcomeInput', amountNumberOptions)
      new AutoNumeric('#secondOutcomeInput', amountNumberOptions)
      new AutoNumeric('#thirdOutcomeInput', amountNumberOptions)
      new AutoNumeric('#fourthOutcomeInput', amountNumberOptions)
      new AutoNumeric('#fifthOutcomeInput', amountNumberOptions)
      this.bindKeys()
    },
    beforeDestroy () {
      this.unbindKeys()
    },
    computed: {
      ...mapState(
        {
          bookingYear: state => state.CommonValues.bookingYear
        }
      ),
      generatedOutcomeText: {
        get: function () {
          var placeholder = ''
          if (this.form) {
            var generatedText = numberToSerbianDinars(asFloat(this.form.outcome, largeAmountNumberOptions))
            if (!generatedText) {
              return placeholder
            } else {
              return generatedText
            }
          } else {
            return placeholder
          }
        },
        set: function (newValue) {
        }
      },
      generatedOutcomeTextLine1: {
        get: function () {
          if (this.generatedOutcomeText.length <= 52) {
            return this.generatedOutcomeText
          }
          const firstSubstring = this.generatedOutcomeText.substring(0, 52)
          const spaceInd = firstSubstring.lastIndexOf(' ')
          if (spaceInd !== -1) {
            return this.generatedOutcomeText.substring(0, spaceInd)
          } else {
            return this.generatedOutcomeText.substring(0, 52)
          }
        },
        set: function (newValue) {
        }
      },
      generatedOutcomeTextLine2: {
        get: function () {
          if (this.generatedOutcomeText.length <= 52) {
            return ''
          }
          const firstSubstring = this.generatedOutcomeText.substring(0, 52)
          const spaceInd = firstSubstring.lastIndexOf(' ')
          if (spaceInd !== -1) {
            return this.generatedOutcomeText.substring(spaceInd)
          } else {
            return this.generatedOutcomeText.substring(52)
          }
        },
        set: function (newValue) {
        }
      },
      firstPartTooltipText: function () {
        if (this.invalidFirstCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      firstPosTooltipText: function () {
        if (this.invalidFirstCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      firstOutcomeTooltipText: function () {
        if(!this.missingFirstPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      secondPosTooltipText: function () {
        if (this.invalidSecondCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      secondPartTooltipText: function () {
        if (this.invalidSecondCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      secondOutcomeTooltipText: function () {
        if(!this.missingSecondPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      thirdPosTooltipText: function () {
        if (this.invalidThirdCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      thirdPartTooltipText: function () {
        if (this.invalidThirdCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      thirdOutcomeTooltipText: function () {
        if(!this.missingThirdPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fourthPosTooltipText: function () {
        if (this.invalidFourthCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fourthPartTooltipText: function () {
        if (this.invalidFourthCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fourthOutcomeTooltipText: function () {
        if(!this.missingFourthPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fifthPosTooltipText: function () {
        if (this.invalidFifthCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fifthPartTooltipText: function () {
        if (this.invalidFifthCode) {
          return this.phrases.unexistingPartitionAndPosition
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fifthOutcomeTooltipText: function () {
        if(!this.missingFifthPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      disableReasonTooltip: {
        get: function () {
          return !this.missingReason || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('reasonInput')
          }
        }
      },
      disableFirstPartTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingFirstPart) && !this.invalidFirstCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('firstPartPosSelect')
          }
        }
      },
      disableFirstPosTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingFirstPos) && !this.invalidFirstCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('firstPosInputWrapper')
          }
        }
      },
      disableFirstOutcomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingFirstPart && this.missingFirstOutcome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('firstOutcomeInputWrapper')
          }
        }
      },
      disableSecondPartTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingSecondPart) && !this.invalidSecondCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('secondPartPosSelect')
          }
        }
      },
      disableSecondPosTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingSecondPos) && !this.invalidSecondCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('secondPosInputWrapper')
          }
        }
      },
      disableSecondOutcomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingSecondPart && this.missingSecondOutcome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('secondOutcomeInputWrapper')
          }
        }
      },
      disableThirdPartTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingThirdPart) && !this.invalidThirdCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('thirdPartPosSelect')
          }
        }
      },
      disableThirdPosTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingThirdPos) && !this.invalidThirdCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('thirdPosInputWrapper')
          }
        }
      },
      disableThirdOutcomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingThirdPart && this.missingThirdOutcome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('thirdOutcomeInputWrapper')
          }
        }
      },
      disableFourthPartTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingFourthPart) && !this.invalidFourthCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fourthPartPosSelect')
          }
        }
      },
      disableFourthPosTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingFourthPos) && !this.invalidFourthCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fourthPosInputWrapper')
          }
        }
      },
      disableFourthOutcomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingFourthPart && this.missingFourthOutcome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fourthOutcomeInputWrapper')
          }
        }
      },
      disableFifthPartTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingFifthPart) && !this.invalidFifthCode) || !this.shouldValidate 
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fifthPartPosSelect')
          }
        }
      },
      disableFifthPosTooltip: {
        get: function () {
          return ((!this.atLeastOnePartPosNotSet || !this.missingFifthPos) && !this.invalidFifthCode) || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fifthPosInputWrapper')
          }
        }
      },
      disableFifthOutcomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingFifthPart && this.missingFifthOutcome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fifthOutcomeInputWrapper')
          }
        }
      },
      disableDateTooltip: {
        get: function () {
          return !this.missingDate || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('dateInput')
          }
        }
      },
      firstPartPosOptions: function() {
        if (!this.initialPartPosOptions) {
          return
        }
        var options = this.initialPartPosOptions.slice()
        var indexesToRemove = []
        for (let i=0; i<options.length; i++) {
          let option = options[i]
          if (!option.value) {
            continue
          }
          if ((option.value.partition == this.form.secondPartition && option.value.position == this.form.secondPosition)
          ||  (option.value.partition == this.form.thirdPartition && option.value.position == this.form.thirdPosition)
          ||  (option.value.partition == this.form.fourthPartition && option.value.position == this.form.fourthPosition)
          ||  (option.value.partition == this.form.fifthPartition && option.value.position == this.form.fifthPosition)) {
            indexesToRemove.push(i)
          }
        }
        for (let i = indexesToRemove.length -1; i >= 0; i--) {
          options.splice(indexesToRemove[i], 1)
        }
        return options
      },
      secondPartPosOptions: function() {
        if (!this.initialPartPosOptions) {
          return
        }
        var options = this.initialPartPosOptions.slice()
        var indexesToRemove = []
        for (let i=0; i<options.length; i++) {
          let option = options[i]
          if (!option.value) {
            continue
          }
          if ((option.value.partition == this.form.firstPartition && option.value.position == this.form.firstPosition)
          ||  (option.value.partition == this.form.thirdPartition && option.value.position == this.form.thirdPosition)
          ||  (option.value.partition == this.form.fourthPartition && option.value.position == this.form.fourthPosition)
          ||  (option.value.partition == this.form.fifthPartition && option.value.position == this.form.fifthPosition)) {
            indexesToRemove.push(i)
          }
        }
        for (let i = indexesToRemove.length -1; i >= 0; i--) {
          options.splice(indexesToRemove[i], 1)
        }
        return options
      },
      thirdPartPosOptions: function() {
        if (!this.initialPartPosOptions) {
          return
        }
        var options = this.initialPartPosOptions.slice()
        var indexesToRemove = []
        for (let i=0; i<options.length; i++) {
          let option = options[i]
          if (!option.value) {
            continue
          }
          if ((option.value.partition == this.form.firstPartition && option.value.position == this.form.firstPosition)
          ||  (option.value.partition == this.form.secondPartition && option.value.position == this.form.secondPosition)
          ||  (option.value.partition == this.form.fourthPartition && option.value.position == this.form.fourthPosition)
          ||  (option.value.partition == this.form.fifthPartition && option.value.position == this.form.fifthPosition)) {
            indexesToRemove.push(i)
          }
        }
        for (let i = indexesToRemove.length -1; i >= 0; i--) {
          options.splice(indexesToRemove[i], 1)
        }
        return options
      },
      fourthPartPosOptions: function() {
        if (!this.initialPartPosOptions) {
          return
        }
        var options = this.initialPartPosOptions.slice()
        var indexesToRemove = []
        for (let i=0; i<options.length; i++) {
          let option = options[i]
          if (!option.value) {
            continue
          }
          if ((option.value.partition == this.form.firstPartition && option.value.position == this.form.firstPosition)
          ||  (option.value.partition == this.form.secondPartition && option.value.position == this.form.secondPosition)
          ||  (option.value.partition == this.form.thirdPartition && option.value.position == this.form.thirdPosition)
          ||  (option.value.partition == this.form.fifthPartition && option.value.position == this.form.fifthPosition)) {
            indexesToRemove.push(i)
          }
        }
        for (let i = indexesToRemove.length -1; i >= 0; i--) {
          options.splice(indexesToRemove[i], 1)
        }
        return options
      },
      fifthPartPosOptions: function() {
        if (!this.initialPartPosOptions) {
          return
        }
        var options = this.initialPartPosOptions.slice()
        var indexesToRemove = []
        for (let i=0; i<options.length; i++) {
          let option = options[i]
          if (!option.value) {
            continue
          }
          if ((option.value.partition == this.form.firstPartition && option.value.position == this.form.firstPosition)
          ||  (option.value.partition == this.form.secondPartition && option.value.position == this.form.secondPosition)
          ||  (option.value.partition == this.form.thirdPartition && option.value.position == this.form.thirdPosition)
          ||  (option.value.partition == this.form.fourthPartition && option.value.position == this.form.fourthPosition)) {
            indexesToRemove.push(i)
          }
        }
        for (let i = indexesToRemove.length -1; i >= 0; i--) {
          options.splice(indexesToRemove[i], 1)
        }
        return options
      },
      missingReason: function () {
        return !this.form.reason || this.form.reason.toString().trim() === ''
      },
      missingFirstPart: function () {
        return !(this.form.firstPartition || this.form.firstPartition == 0) || this.form.firstPartition.toString().trim() === ''
      },
      missingFirstPos: function () {
        return !(this.form.firstPosition || this.form.firstPosition == 0)
      },
      missingFirstOutcome: function () {
        return !this.form.firstOutcome || this.form.firstOutcome.trim() === ''
      },
      missingSecondPart: function () {
        return !(this.form.secondPartition || this.form.secondPartition == 0) || this.form.secondPartition.toString().trim() === ''
      },
      missingSecondPos: function () {
        return !(this.form.secondPosition || this.form.secondPosition == 0)
      },
      missingSecondOutcome: function () {
        return !this.form.secondOutcome || this.form.secondOutcome.trim() === ''
      },
      missingThirdPart: function () {
        return !(this.form.thirdPartition || this.form.thirdPartition == 0) || this.form.thirdPartition.toString().trim() === ''
      },
      missingThirdPos: function () {
        return !(this.form.thirdPosition || this.form.thirdPosition == 0)
      },
      missingThirdOutcome: function () {
        return !this.form.thirdOutcome || this.form.thirdOutcome.trim() === ''
      },
      missingFourthPart: function () {
        return !(this.form.fourthPartition || this.form.fourthPartition == 0) || this.form.fourthPartition.toString().trim() === ''
      },
      missingFourthPos: function () {
        return !(this.form.fourthPosition || this.form.fourthPosition == 0)
      },
      missingFourthOutcome: function () {
        return !this.form.fourthOutcome || this.form.fourthOutcome.trim() === ''
      },
      missingFifthPart: function () {
        return !(this.form.fifthPartition || this.form.fifthPartition == 0) || this.form.fifthPartition.toString().trim() === ''
      },
      missingFifthPos: function () {
        return !(this.form.fifthPosition || this.form.fifthPosition == 0)
      },
      missingFifthOutcome: function () {
        return !this.form.fifthOutcome || this.form.fifthOutcome.trim() === ''
      },
      invalidFirstCode: function () {
        return this.form.firstCodeValid == false
      },
      invalidSecondCode: function () {
        return this.form.secondCodeValid == false
      },
      invalidThirdCode: function () {
        return this.form.thirdCodeValid == false
      },
      invalidFourthCode: function () {
        return this.form.fourthCodeValid == false
      },
      invalidFifthCode: function () {
        return this.form.fifthCodeValid == false
      },
      missingDate: function () {
        return !this.form.date
      },
      atLeastOnePartPosNotSet: function () {
        const firstCombinationNotSet = this.missingFirstPart || this.missingFirstPos || this.missingFirstOutcome
        const secondCombinationNotSet = this.missingSecondPart || this.missingSecondPos || this.missingSecondOutcome
        const thirdCombinationNotSet = this.missingThirdPart || this.missingThirdPos || this.missingThirdOutcome
        const fourthCombinationNotSet = this.missingFourthPart || this.missingFourthPos || this.missingFourthOutcome
        const fifthCombinationNotSet = this.missingFifthPart || this.missingFifthPos || this.missingFifthOutcome
        return firstCombinationNotSet && secondCombinationNotSet && thirdCombinationNotSet && fourthCombinationNotSet && fifthCombinationNotSet
      },
      validForm: function () {
        if (this.missingReason ||
            this.missingDate ||
            this.atLeastOnePartPosNotSet ||
            (!this.missingFirstPart && this.missingFirstOutcome) ||
            (!this.missingSecondPart && this.missingSecondOutcome) ||
            (!this.missingThirdPart && this.missingThirdOutcome) ||
            (!this.missingFourthPart && this.missingFourthOutcome) ||
            (!this.missingFifthPart && this.missingFifthOutcome) ||
            this.invalidFirstCode ||
            this.invalidSecondCode ||
            this.invalidThirdCode ||
            this.invalidFourthCode ||
            this.invalidFifthCode) {
          return false
        }
        return true
      }
    },
    methods: {
      adaptAutoNumericAmount (formField) {
        if (this.form[formField] && !this.form[formField].includes(',')) {
          this.form[formField] = this.form[formField] + ',00'
        }
      },
      updateAfterCut (e) {
        if (e && e.target && e.target.id) {
          setTimeout(() => {
            const updatedDocEl = document.getElementById(e.target.id);
            const el = AutoNumeric.getAutoNumericElement('#' + e.target.id)
            if (el && updatedDocEl) {
              el.set(updatedDocEl.value)
            }
          }, 100)
        }
      },
      determineSelectedCodes () {
        if (this.outcomeCodes) {
          for (let i=0; i<this.outcomeCodes.length; i++) {
            const outcomeCode = this.outcomeCodes[i]
            if (this.form.firstPartition == outcomeCode.partition && this.form.firstPosition == outcomeCode.position) {
              this.selectedFirstOutcomeCode = outcomeCode
            } else if (this.form.secondPartition == outcomeCode.partition && this.form.secondPosition == outcomeCode.position) {
              this.selectedSecondOutcomeCode = outcomeCode
            } else if (this.form.thirdPartition == outcomeCode.partition && this.form.thirdPosition == outcomeCode.position) {
              this.selectedThirdOutcomeCode = outcomeCode
            } else if (this.form.fourthPartition == outcomeCode.partition && this.form.fourthPosition == outcomeCode.position) {
              this.selectedFourthOutcomeCode = outcomeCode
            } else if (this.form.fifthPartition == outcomeCode.partition && this.form.fifthPosition == outcomeCode.position) {
              this.selectedFifthOutcomeCode = outcomeCode
            }
          }
        }
      },
      calculateTax () {
        if (this.selectedFirstOutcomeCode && this.selectedFirstOutcomeCode.tax) {
          var secondOutcomeTax = this.form.secondOutcome ? Big(asFloat(this.form.secondOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var thirdOutcomeTax = this.form.thirdOutcome ? Big(asFloat(this.form.thirdOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fourthOutcomeTax = this.form.fourthOutcome ? Big(asFloat(this.form.fourthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fifthOutcomeTax = this.form.fifthOutcome ? Big(asFloat(this.form.fifthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var totalOutcomeTax = parseFloat(secondOutcomeTax.plus(thirdOutcomeTax).plus(fourthOutcomeTax).plus(fifthOutcomeTax))
          this.form.firstOutcome = asFormatedString(totalOutcomeTax, largeAmountNumberOptions)
        } else if (this.selectedSecondOutcomeCode && this.selectedSecondOutcomeCode.tax) {
          var firstOutcomeTax = this.form.firstOutcome ? Big(asFloat(this.form.firstOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var thirdOutcomeTax = this.form.thirdOutcome ? Big(asFloat(this.form.thirdOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fourthOutcomeTax = this.form.fourthOutcome ? Big(asFloat(this.form.fourthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fifthOutcomeTax = this.form.fifthOutcome ? Big(asFloat(this.form.fifthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var totalOutcomeTax = parseFloat(firstOutcomeTax.plus(thirdOutcomeTax).plus(fourthOutcomeTax).plus(fifthOutcomeTax))
          this.form.secondOutcome = asFormatedString(totalOutcomeTax, largeAmountNumberOptions)
        } else if (this.selectedThirdOutcomeCode && this.selectedThirdOutcomeCode.tax) {
          var firstOutcomeTax = this.form.firstOutcome ? Big(asFloat(this.form.firstOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var secondOutcomeTax = this.form.secondOutcome ? Big(asFloat(this.form.secondOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fourthOutcomeTax = this.form.fourthOutcome ? Big(asFloat(this.form.fourthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fifthOutcomeTax = this.form.fifthOutcome ? Big(asFloat(this.form.fifthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var totalOutcomeTax = parseFloat(firstOutcomeTax.plus(secondOutcomeTax).plus(fourthOutcomeTax).plus(fifthOutcomeTax)) 
          this.form.thirdOutcome = asFormatedString(totalOutcomeTax, largeAmountNumberOptions)
        } else if (this.selectedFourthOutcomeCode && this.selectedFourthOutcomeCode.tax) {
          var firstOutcomeTax = this.form.firstOutcome ? Big(asFloat(this.form.firstOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var secondOutcomeTax = this.form.secondOutcome ? Big(asFloat(this.form.secondOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var thirdOutcomeTax = this.form.thirdOutcome ? Big(asFloat(this.form.thirdOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fifthOutcomeTax = this.form.fifthOutcome ? Big(asFloat(this.form.fifthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var totalOutcomeTax = parseFloat(firstOutcomeTax.plus(secondOutcomeTax).plus(thirdOutcomeTax).plus(fifthOutcomeTax)) 
          this.form.fourthOutcome = asFormatedString(totalOutcomeTax, largeAmountNumberOptions)
        } else if (this.selectedFifthOutcomeCode && this.selectedFifthOutcomeCode.tax) {
          var firstOutcomeTax = this.form.firstOutcome ? Big(asFloat(this.form.firstOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var secondOutcomeTax = this.form.secondOutcome ? Big(asFloat(this.form.secondOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var thirdOutcomeTax = this.form.thirdOutcome ? Big(asFloat(this.form.thirdOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var fourthOutcomeTax = this.form.fourthOutcome ? Big(asFloat(this.form.fourthOutcome, amountNumberOptions)).times(Big(0.04)) : Big(0.0)
          var totalOutcomeTax = parseFloat(firstOutcomeTax.plus(secondOutcomeTax).plus(thirdOutcomeTax).plus(fourthOutcomeTax)) 
          this.form.fifthOutcome = asFormatedString(totalOutcomeTax, largeAmountNumberOptions)
        }
      },
      calculateTotalOutcome () {
        const firstOutcome = this.missingFirstOutcome ? Big(0.0) : Big(asFloat(this.form.firstOutcome, amountNumberOptions))
        const secondOutcome = this.missingSecondOutcome ? Big(0.0) : Big(asFloat(this.form.secondOutcome, amountNumberOptions))
        const thirdOutcome = this.missingThirdOutcome ? Big(0.0) : Big(asFloat(this.form.thirdOutcome, amountNumberOptions))
        const fourthOutcome = this.missingFourthOutcome ? Big(0.0) : Big(asFloat(this.form.fourthOutcome, amountNumberOptions))
        const fifthOutcome = this.missingFifthOutcome ? Big(0.0) : Big(asFloat(this.form.fifthOutcome, amountNumberOptions))
        if (firstOutcome.eq(Big(0.0)) && secondOutcome.eq(Big(0.0)) && thirdOutcome.eq(Big(0.0)) && fourthOutcome.eq(Big(0.0)) && fifthOutcome.eq(Big(0.0))) {
          this.form.outcome = null
        } else {
          this.form.outcome = asFormatedString(parseFloat(firstOutcome.plus(secondOutcome).plus(thirdOutcome).plus(fourthOutcome).plus(fifthOutcome)), largeAmountNumberOptions)
        }
      },
      tabPressedHandler (evt) {
        if (this.preDatepickerJustBlurred) {
          /* Manually put focus on the datepicker object */
          this.$refs.dateInput.showCalendar()
          evt.preventDefault()
        }
        this.postDatepickerJustBlurred = false
        this.preDatepickerJustBlurred = false
      },
      shiftTabPressedHandler (evt) {
        if (this.postDatepickerJustBlurred) {
          /* Manually put focus on the datepicker object */
          this.$refs.dateInput.showCalendar()
          evt.preventDefault()
        }
        this.postDatepickerJustBlurred = false
        this.preDatepickerJustBlurred = false
      },
      preDatepickerOnBlur (evt) {
        this.preDatepickerJustBlurred = true
      },
      postDatepickerOnBlur (evt) {
        this.postDatepickerJustBlurred = true
      },
      loadAnnualReportCommon () {
        const self = this
        annualReportController.getAnnualReportCommon().then((res) => {
          if (!res.err) {
            if(!self.receiptPreview) {
              self.form.churchMunicipality = res.data ? res.data.churchMunicipality : null
              self.form.town = res.data ? res.data.churchTown : null
              self.form.townPayed = self.form.town
            }
            self.commonData = res.data
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
      },
      bindKeys() {
        const self = this
        Mousetrap.bind(['command+p', 'ctrl+p'], function(e) {
            if (!self.disablePrintAndDownload) {
              self.printReceipt()
            }
          return false
        })
        Mousetrap.bind(['command+d', 'ctrl+d'], function(e) {
          if (!self.disablePrintAndDownload) {
            self.downloadReceipt()
          }
          return false
        })
        Mousetrap.bind(['command+e', 'ctrl+e'], function(e) {
          self.clearForm()
          return false
        })
        Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
          self.$refs.receiptSaveBtn.click()
          return false
        })
        Mousetrap.prototype.stopCallback = function () {
          return false;
        }
      },
      unbindKeys() {
        Mousetrap.unbind(['command+p', 'ctrl+p'])
        Mousetrap.unbind(['command+d', 'ctrl+d'])
        Mousetrap.unbind(['command+e', 'ctrl+e'])
        Mousetrap.unbind(['command+s', 'ctrl+s'])
      },
      getInitialPartPosOptions() {
        if (!this.outcomeCodes) {
          return []
        }
        var options = []
        options.push({html: '&nbsp', value: null})
        this.outcomeCodes.forEach(oc => {
          options.push({html: '<span class="partPosOptionText">' + asRoman(oc.partition) + '/' + oc.position + '</span><span class="descriptionOptionText">' + (oc.description ? oc.description : '') + '</span>', value: oc})
        })
        return options
      },
      setSelectedFirstPartPos (selectedCode) {
        this.selectedFirstOutcomeCode = selectedCode
        if (selectedCode) {
          this.form.firstPartition = selectedCode.partition
          this.form.firstPosition = selectedCode.position
          this.form.firstCodeValid = true
        } else {
          this.form.firstPartition = null
          this.form.firstPosition = null
          this.form.firstOutcome = null
          this.form.firstCodeValid = true
        }
      },
      setSelectedSecondPartPos (selectedCode) {
        this.selectedSecondOutcomeCode = selectedCode
        if (selectedCode) {
          this.form.secondPartition = selectedCode.partition
          this.form.secondPosition = selectedCode.position
          this.form.secondCodeValid = true
        } else {
          this.form.secondPartition = null
          this.form.secondPosition = null
          this.form.secondOutcome = null
          this.form.secondCodeValid = true
        }
      },
      setSelectedThirdPartPos (selectedCode) {
        this.selectedThirdOutcomeCode = selectedCode
        if (selectedCode) {
          this.form.thirdPartition = selectedCode.partition
          this.form.thirdPosition = selectedCode.position
          this.form.thirdCodeValid = true
        } else {
          this.form.thirdPartition = null
          this.form.thirdPosition = null
          this.form.thirdOutcome = null
          this.form.thirdCodeValid = true
        }
      },
      setSelectedFourthPartPos (selectedCode) {
        this.selectedFourthOutcomeCode = selectedCode
        if (selectedCode) {
          this.form.fourthPartition = selectedCode.partition
          this.form.fourthPosition = selectedCode.position
          this.form.fourthCodeValid = true
        } else {
          this.form.fourthPartition = null
          this.form.fourthPosition = null
          this.form.fourthOutcome = null
          this.form.fourthCodeValid = true
        }
      },
      setSelectedFifthPartPos (selectedCode) {
        this.selectedFifthOutcomeCode = selectedCode
        if (selectedCode) {
          this.form.fifthPartition = selectedCode.partition
          this.form.fifthPosition = selectedCode.position
          this.form.fifthCodeValid = true
        } else {
          this.form.fifthPartition = null
          this.form.fifthPosition = null
          this.form.fifthOutcome = null
          this.form.fifthCodeValid = true
        }
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
      showInvalidTooltips () {
        if (this.missingReason) {
          this.showTooltip('reasonInput')
        } else if (this.missingDate) {
          this.showTooltip('dateInput')
        } else if (this.atLeastOnePartPosNotSet) {
          this.showTooltip('firstPartPosSelect')
        } else if (!this.missingFirstPart && this.missingFirstOutcome) {
          this.showTooltip('firstOutcomeInputWrapper')
        } else if (!this.missingSecondPart && this.missingSecondOutcome) {
          this.showTooltip('secondOutcomeInputWrapper')
        } else if (!this.missingThirdPart && this.missingThirdOutcome) {
          this.showTooltip('thirdOutcomeInputWrapper')
        } else if (!this.missingFourthPart && this.missingFourthOutcome) {
          this.showTooltip('fourthOutcomeInputWrapper')
        } else if (!this.missingFifthPart && this.missingFifthOutcome) {
          this.showTooltip('fifthOutcomeInputWrapper')
        } else if (this.invalidFirstCode) {
          this.showTooltip('firstPartPosSelect')
        } else if (this.invalidSecondCode) {
          this.showTooltip('secondPartPosSelect')
        } else if (this.invalidThirdCode) {
          this.showTooltip('thirdPartPosSelect')
        } else if (this.invalidFourthCode) {
          this.showTooltip('fourthPartPosSelect')
        } else if (this.invalidFifthCode) {
          this.showTooltip('fifthPartPosSelect')
        }
      },
      showTooltip (elementId) {
        this.$root.$emit('bv::show::tooltip', elementId)
        clearTimeout(this.tooltipTimeouts[elementId])
        const self = this
        this.tooltipTimeouts[elementId] = setTimeout(() => {
          self.$root.$emit('bv::hide::tooltip', elementId)
        }, 2500)
      },
      hideTooltip (elementId) {
        this.$root.$emit('bv::hide::tooltip', elementId)
      },
      onSubmit (evt) {
        evt.preventDefault()
        if(this.alreadyPressed) {
          return
        }
        const self = this;
        this.shouldValidate = true;
        if (!this.validForm) {
          this.showInvalidTooltips()
          return
        }
        if (this.receiptPreview) {
          this.alreadyPressed = true
          receiptController.updateReceipt(mapReceiptFormToReceipt(this.form, this.outcomeCodes, true)).then((res) => {
            if (!res.err) {
              self.$emit('updateReceiptTable')
              self.closeModal();
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        } else {
          this.alreadyPressed = true
          receiptController.createReceipt(mapReceiptFormToReceipt(this.form, this.outcomeCodes, true)).then((res) => {
            if (!res.err) {
              self.$emit('updateReceiptTable')
              self.closeModal();
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        }
      },
      clearForm () {
        this.form.firstOutcome = null;
        this.form.secondOutcome = null;
        this.form.thirdOutcome = null;
        this.form.fourthOutcome = null;
        this.form.fifthOutcome = null;
        this.form.outcome = null;
        var firstOutcomeInputEl = AutoNumeric.getAutoNumericElement('#firstOutcomeInput')
        var secondOutcomeInputEl = AutoNumeric.getAutoNumericElement('#secondOutcomeInput')
        var thirdOutcomeInputEl = AutoNumeric.getAutoNumericElement('#thirdOutcomeInput')
        var fourthOutcomeInputEl = AutoNumeric.getAutoNumericElement('#fourthOutcomeInput')
        var fifthOutcomeInputEl = AutoNumeric.getAutoNumericElement('#fifthOutcomeInput')
        if (firstOutcomeInputEl) {
          firstOutcomeInputEl.clear()
        }
        if (secondOutcomeInputEl) {
          secondOutcomeInputEl.clear()
        }
        if (thirdOutcomeInputEl) {
          thirdOutcomeInputEl.clear()
        }
        if (fourthOutcomeInputEl) {
          fourthOutcomeInputEl.clear()
        }
        if (fifthOutcomeInputEl) {
          fifthOutcomeInputEl.clear()
        }
        this.selectedFirstOutcomeCode = null
        this.selectedSecondOutcomeCode = null
        this.selectedThirdOutcomeCode = null
        this.selectedFourthOutcomeCode = null
        this.selectedFifthOutcomeCode = null
        this.form.ordinal = null
        this.form.annualReportPage = null
        this.form.date = null
        this.form.firstPartition = null
        this.form.firstPosition = null
        this.form.firstCodeValid = null
        this.form.secondPartition = null
        this.form.secondPosition = null
        this.form.secondCodeValid = null
        this.form.thirdPartition = null
        this.form.thirdPosition = null
        this.form.thirdCodeValid = null
        this.form.fourthPartition = null
        this.form.fourthPosition = null
        this.form.fourthCodeValid = null
        this.form.fifthPartition = null
        this.form.fifthPosition = null
        this.form.fifthCodeValid = null
        this.form.reason = null
        this.form.received = null
        this.form.churchMunicipality = this.commonData ? this.commonData.churchMunicipality : null
        this.form.town = this.commonData ? this.commonData.churchTown : null
        this.form.townPayed = this.form.town
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'receipt-preview-error-modal')
      },
      printReceipt () {
        if (this.alreadyPressed) {
          return
        }
        const section = this.preparePrintSection()
        document.body.appendChild(section)
        try {
          this.alreadyPressed = true
          window.print()
        } finally {
          this.alreadyPressed = false
          document.body.removeChild(section)
        }
      },
      async downloadReceipt () {
        if (this.alreadyPressed) {
          return
        }
        const section = this.preparePrintSection()
        document.body.appendChild(section)
        try {
          this.alreadyPressed = true
          const res = await receiptController.createReceiptPdf()
          if (!res.err) {
            const self = this
            const date = new Date(this.form.date)
            saveAs('/receipt.pdf', this.phrases.receiptFileName + '-' + date.getUTCDate()  + '-' + (date.getUTCMonth() +1) + '-' + date.getUTCFullYear() + '.pdf', err => {
              if (err) {
                self.openErrorModal(self.phrases.saveError)
              }
            })
          } else {
            this.openErrorModal(res.err)       
          }
        }
        finally {
          this.alreadyPressed = false
          document.body.removeChild(section)
        }
      },
      preparePrintSection () {
        const modal = document.getElementById('receipt-preview-container')
        const cloned = modal.cloneNode(true)
        var section = document.createElement('div')
        section.id = 'print-receipt'
        section.innerHTML = ''
        section.appendChild(cloned)

        return section
      },
      closeModal () {
          this.$root.$emit('bv::hide::modal', this.parentModal)
      }
    },
    components: { Datepicker, MessageConfirmDialog }
  }
</script>

<style scoped>
  input {
    text-align: center;
    /* Immitate the underline in the real receipt */
    border-bottom: .5pt solid black !important;
    border-radius: 0 !important;
    font-family: "Times New Roman";
    font-size: 90%;
    letter-spacing: 95%;
  }
  select {
    text-align-last:left;
    font-family: "Times New Roman";
    font-size: 90%;
    letter-spacing: 95%;
    -webkit-appearance: none;
    -webkit-border-radius: 0px;
  }
  #receipt-preview-container {
    width: 794px;
    height: 595px;
    position:relative;
  }
  .receipt-preview-text {
    white-space: pre;
    width: 670px;
    height: 560px;
    /*border-style: solid;
    border-color: blue;*/
    color: black;
    line-height: 2;
    margin: 0;
    position: relative;
    left: 49px;
    top: 20px;
  }
  h1 {
    text-align: center;
    font-weight: bold;
    font-size: 25px;
    margin: 0px;
    padding: 0px;
    font-family: "Times New Roman";
    letter-spacing: 95%;
  }
  .input-small {
    border-style: none;
    font-weight: bold;
    display: inline;
    height: 20px;
    margin: 0px;
    color: black;
  }
  .select-small {
    border-style: none;
    font-weight: bold;
    display: inline;
    margin: 0px;
    padding: 0px;
    height: 20px;
    max-height: 20px;
    color: black;
  }
  #yearInput {
    width: 70px;
  }
  #outcomeInput {
    width: 140px;
  }
  #outcomeAsTextInput {
    width: 411px;
  }
  #outcomeAsTextInputPt2 {
    width: 255px;
  }
  #churchMunicipalityInput {
    width: 305px;
  }
  #townInput {
    width: 320px;
  }
  #reasonInput {
    width: 290px;
  }
  #receivedInput {
    width: 289px;
  }
  #townPayedInput {
    width: 278px;
  }
  #payedInput {
    width: 290px;
  }
  #firstPartPosSelect {
    width: 50px;
    height: 20px;
  }
  #secondPartPosSelect {
    width: 50px;
    height: 20px;
  }
  #thirdPartPosSelect {
    width: 50px;
    height: 20px;
  }
  #fourthPartPosSelect {
    width: 50px;
    height: 20px;
  }
  #fifthPartPosSelect {
    width: 50px;
    height: 20px;
  }
  .partText {
    position: relative;
    left: 50px;
  }
  #firstPartInput {
    width: 50px;
    position:relative;
    left:50px;
    pointer-events: none;
    z-index: 1;
    padding:0px;
  }
  #firstPosInput {
    width: 50px;
  }
  #secondPartInput {
    width: 50px;
    position:relative;
    left:50px;
    pointer-events: none;
    z-index: 1;
    padding:0px;
  }
  #secondPosInput {
    width: 50px;
  }
  #thirdPartInput {
    width: 50px;
    position:relative;
    left:50px;
    pointer-events: none;
    z-index: 1;
    padding:0px;
  }
  #thirdPosInput {
    width: 50px;
  }
  #fourthPartInput {
    width: 50px;
    position:relative;
    left:50px;
    pointer-events: none;
    z-index: 1;
    padding:0px;
  }
  #fourthPosInput {
    width: 50px;
  }
  #fifthPartInput {
    width: 50px;
    position:relative;
    left:50px;
    pointer-events: none;
    z-index: 1;
    padding:0px;
  }
  #fifthPosInput {
    width: 50px;
  }
  #firstOutcomeInput {
    width: 90px;
  }
  #secondOutcomeInput {
    width: 90px;
  }
  #thirdOutcomeInput {
    width: 90px;
  }
  #fourthOutcomeInput {
    width: 90px;
  }
  #fifthOutcomeInput {
    width: 90px;
  }
  #totalOutcomeInput {
    width: 90px;
  }
  #annualReportPageInput {
    width: 50px;
  }
  #ordinalInput {
    width: 50px;
  }
  #municipalityPresidentInput {
    width: 290px;
  }
  #modalCancelBtn {
    position: absolute;
    right: 3%;
    top:4%;
  }
  #clearSaveBtnsDiv {
    position: absolute;
    top: 93%;
    right: 7.5%;
  }
  #downloadPrintBtnsDiv {
    position: absolute;
    top:93%;
    left: 7.5%;
  }

  .partPosOption {
    overflow: hidden;
  }

  .partPosOption >>> .partPosOptionText {
    float:left;
    min-width:80px;
    width:80px;
  }

  .partPosOption >>> .descriptionOptionText {
    overflow: auto;
    margin-right: 80px;
  }

  .outcomeAsTextDivWrapper {
    display: inline;
    font-weight: bold;
    color: black;
    white-space: nowrap;
    border-bottom: solid;
    border-width: 1px;
    display: inline-block;
    margin: 0;
  }
  #outcomeAsText1 {
    width: 362px;
    white-space: nowrap;
    overflow: hidden;
    display: inline-block;
  }
  #outcomeAsText2 {
    width: 670px;
    white-space: nowrap;
    overflow: hidden;
  }
</style>

<style>
  .receiptDatepickerInput {
    display: inline;
    border-style: none;
    border-bottom: .5pt solid black;
    text-align: center;

    white-space: nowrap;
    width: 95px;
    max-height: 20px;
    padding: 0px;
    margin: 0px;
    font-weight: bold;
    color: black;
  }
  .disabledDatepicker .receiptDatepickerInput {
    background-color: rgb(235, 236, 238);
  }
  .is-invalid-date {   
    outline: dotted 1px red !important;   
    background-image: url('~@/assets/invalid-red.png');
    background-repeat: no-repeat;
    background-position: center right calc(2.25rem / 4);
    background-size: calc(2.25rem / 2) calc(2.25rem / 2);
  }
  .receiptDatepickerWrapper {
    display: inline;
    white-space: normal;
    height: 20px;
    margin: 0px;
    padding: 0px;
    width: 95px;
  }
  .receiptDatepickerWrapper > div:first-child {
    display: inline;
    width: 95px;
    margin: 0px;
    padding: 0px;
  }
  .receiptDatepickerCalendar {
    font-size: 120%;
    white-space: normal;
    z-index: 100;
    -webkit-transform: scale(0.8, 0.8) translate(-70px, -70px); /* Safari and Chrome */
  }

   .receiptDatepickerCalendar span:hover  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
  .receiptDatepickerCalendar span.selected  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }

   .receiptDatepickerCalendar div span:hover  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
     
  .receiptDatepickerCalendar header span:hover  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }

  @media screen {
    #print-receipt {
      display: none;
    }
  }
  @media print {
    #print-receipt, #print-receipt * {
      visibility:visible;
    }
    #print-receipt {
      position: absolute;
      top:0px;
      left:0px;
    }
    #receipt-preview-container {
      top:285px;
      left:390px;
      transform: scale(2.1);
    }
    .ignoreInPrint {
      visibility:hidden !important;
    }
    input {
      padding:0px !important;
    }
  }
</style>
