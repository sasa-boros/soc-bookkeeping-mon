<template>       
  <b-container fluid id="payment-slip-preview-container" v-on:keyup.tab.exact="tabPressedHandler" v-on:keyup.shift.tab.exact="shiftTabPressedHandler">
    <b-form ref="form" @submit="onSubmit" novalidate no-validation>
      <b-button @click.stop="closeModal()" variant="link" class="ignoreInPrint btn-xs" id="modalCancelBtn">
        <img src="~@/assets/close.png" class="ignoreInPrint">
      </b-button>
      <div class="payment-slip-preview-text">
        <h1> УПЛАТНИЦА </h1>
        <br/>         На динара <b-form-input id="incomeInput" ref="incomeInput" :disabled="defaultPaymentSlipPreview" v-on:mouseleave="disableIncomeTooltip ? null : hideTooltip('incomeInput')" v-model="form.income" class="input-small number-input" v-bind:class="{ 'is-invalid': shouldValidate && missingIncome }" type="text" :autofocus="!paymentSlipPreview"></b-form-input> и словима <b-form-input type="text" disabled class="input-small" id="IncomeAsText1" v-model="generatedIncomeTextLine1"></b-form-input>
        <br/><b-form-input disabled class="input-small" id="IncomeAsText2" v-model="generatedIncomeTextLine2"></b-form-input>
        <br/>колико сам данас уплатио у благајну Српског православног манастира
у <b-form-input id="townInput" v-on:keypress="limitInputPerSize" ref="townInput" v-model="form.town" class="input-small" type="text"></b-form-input> на име <b-form-input id="reasonInput" v-on:keypress="limitInputPerSize" ref="reasonInput" v-on:mouseleave="disableReasonTooltip ? null : hideTooltip('reasonInput')" :disabled="defaultPaymentSlipPreview" v-model="form.reason" class="input-small" v-bind:class="{ 'is-invalid': shouldValidate && missingReason}" type="text"></b-form-input>
                                                                                                                                           Уплатио,
                         Примио благајник,                                                <b-form-input id="payedInput" :disabled="defaultPaymentSlipPreview" v-on:keypress="limitInputPerSize" ref="payedInput" v-model="form.payed" class="input-small" type="text"></b-form-input> 
<br/><b-form-input disabled class="input-small" id="receivedInput" type="text"></b-form-input>                        Књижити у корист буџета за     <b-form-input disabled id="yearInput" ref="yearInput" class="input-small" v-model="year"></b-form-input> год.
у <b-form-input id="townReceivedInput" v-on:keypress="limitInputPerSize" ref="townReceivedInput" v-model="form.townReceived" class="input-small" type="text"></b-form-input>&nbsp;          <span class="partText">Парт. </span><b-form-input id="firstPartInput" :disabled="defaultPaymentSlipPreview" type="text" v-model="formatedFirstPart" v-bind:class="{ 'is-invalid': !disableFirstPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableFirstPartTooltip ? null : hideTooltip('firstPartPosSelect')"><b-dropdown id="firstPartPosSelect" :disabled="defaultPaymentSlipPreview" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedFirstPartPos(option.value)" v-for="(option, index) in firstPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span> поз. <span v-on:mouseleave="disableFirstPosTooltip ? null : hideTooltip('firstPosInputWrapper')" id="firstPosInputWrapper"><b-form-input id="firstPosInput" v-model="form.firstPosition" v-bind:class="{ 'is-invalid': !disableFirstPosTooltip}" class="input-small" disabled/></span> дин. <span v-on:mouseleave="disableFirstIncomeTooltip ? null : hideTooltip('firstIncomeInputWrapper')" id="firstIncomeInputWrapper"><b-form-input id="firstIncomeInput" v-model="form.firstIncome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableFirstIncomeTooltip }" :disabled="missingFirstPart" type="text"></b-form-input></span>
<span v-on:mouseleave="disableDateTooltip ? null : hideTooltip('dateInput')"><datepicker id="dateInput" ref="dateInput" v-model="form.date" v-bind:class="{ 'is-invalid': shouldValidate && missingDate, 'disabledDatepicker': defaultPaymentSlipPreview}" :language="calendarLanguages.srCYRL" :disabled="defaultPaymentSlipPreview" input-class="paymentSlipDatepickerInput" wrapper-class="paymentSlipDatepickerWrapper" calendar-class="paymentSlipDatepickerCalendar"></datepicker> год. </span>&nbsp;                                                            <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="secondPartInput" :disabled="defaultPaymentSlipPreview" type="text" v-model="formatedSecondPart" v-bind:class="{ 'is-invalid': !disableSecondPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableSecondPartTooltip ? null : hideTooltip('secondPartPosSelect')"><b-dropdown id="secondPartPosSelect" :disabled="defaultPaymentSlipPreview" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedSecondPartPos(option.value)" v-for="(option, index) in secondPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableSecondPosTooltip ? null : hideTooltip('secondPosInputWrapper')" id="secondPosInputWrapper"><b-form-input id="secondPosInput" v-model="form.secondPosition" v-bind:class="{ 'is-invalid': !disableSecondPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableSecondIncomeTooltip ? null : hideTooltip('secondIncomeInputWrapper')" id="secondIncomeInputWrapper"><b-form-input v-model="form.secondIncome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableSecondIncomeTooltip }" id="secondIncomeInput" :disabled="missingSecondPart" type="text"></b-form-input></span>
&nbsp;                                                                                                <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="thirdPartInput" :disabled="defaultPaymentSlipPreview" type="text" v-model="formatedThirdPart" v-bind:class="{ 'is-invalid': !disableThirdPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableThirdPartTooltip ? null : hideTooltip('thirdPartPosSelect')"><b-dropdown id="thirdPartPosSelect" :disabled="defaultPaymentSlipPreview" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedThirdPartPos(option.value)" v-for="(option, index) in thirdPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableThirdPosTooltip ? null : hideTooltip('thirdPosInputWrapper')" id="thirdPosInputWrapper"><b-form-input id="thirdPosInput" v-model="form.thirdPosition" v-bind:class="{ 'is-invalid': !disableThirdPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableThirdIncomeTooltip ? null : hideTooltip('thirdIncomeInputWrapper')" id="thirdIncomeInputWrapper"><b-form-input v-model="form.thirdIncome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableThirdIncomeTooltip }" id="thirdIncomeInput" :disabled="missingThirdPart" type="text"></b-form-input></span>
&nbsp;                                                                                                <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="fourthPartInput" :disabled="defaultPaymentSlipPreview" type="text" v-model="formatedFourthPart" v-bind:class="{ 'is-invalid': !disableFourthPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableFourthPartTooltip ? null : hideTooltip('fourthPartPosSelect')"><b-dropdown id="fourthPartPosSelect" :disabled="defaultPaymentSlipPreview" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedFourthPartPos(option.value)" v-for="(option, index) in fourthPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFourthPosTooltip ? null : hideTooltip('fourthPosInputWrapper')" id="fourthPosInputWrapper"><b-form-input id="fourthPosInput" v-model="form.fourthPosition" v-bind:class="{ 'is-invalid': !disableFourthPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFourthIncomeTooltip ? null : hideTooltip('fourthIncomeInputWrapper')" id="fourthIncomeInputWrapper"><b-form-input v-model="form.fourthIncome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableFourthIncomeTooltip }" id="fourthIncomeInput" :disabled="missingFourthPart" type="text"></b-form-input></span>
&nbsp;                                                                                                <span class="partText">”&nbsp;&nbsp;&nbsp;</span><b-form-input id="fifthPartInput" :disabled="defaultPaymentSlipPreview" type="text" v-model="formatedFifthPart" v-bind:class="{ 'is-invalid': !disableFifthPartTooltip}" class="input-small" tabindex="-1"/><span v-on:mouseleave="disableFifthPartTooltip ? null : hideTooltip('fifthPartPosSelect')"><b-dropdown id="fifthPartPosSelect" :disabled="defaultPaymentSlipPreview" :no-caret="true" class="ignoreInPrint" variant="link"><b-dropdown-item class="partPosOption" v-on:click="setSelectedFifthPartPos(option.value)" v-for="(option, index) in fifthPartPosOptions" v-bind:key="index"><span v-html="option.html"></span></b-dropdown-item></b-dropdown></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFifthPosTooltip ? null : hideTooltip('fifthPosInputWrapper')" id="fifthPosInputWrapper"><b-form-input id="fifthPosInput" v-model="form.fifthPosition" v-bind:class="{ 'is-invalid': !disableFifthPosTooltip }" class="input-small" disabled/></span>&nbsp;&nbsp;&nbsp;”&nbsp;&nbsp;&nbsp;&nbsp;<span v-on:mouseleave="disableFifthIncomeTooltip ? null : hideTooltip('fifthIncomeInputWrapper')" id="fifthIncomeInputWrapper"><b-form-input v-model="form.fifthIncome" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableFifthIncomeTooltip }" id="fifthIncomeInput" :disabled="missingFifthPart" type="text"></b-form-input></span>
                                                                                                                                              Свега дин. <span v-on:mouseleave="disableTotalIncomeTooltip ? null : hideTooltip('totalIncomeInputWrapper')" id="totalIncomeInputWrapper"><b-form-input id="totalIncomeInput" disabled v-model="form.income" class="input-small numberInput" v-bind:class="{ 'is-invalid': !disableTotalIncomeTooltip }"></b-form-input></span>
                                                                                                                                  НАРЕДБОДАВАЦ
Књижено у Дневник благајне                                                                             Настојатељ манастира,
страна <span v-on:mouseleave="hideTooltip('annualReportPageInputWrapper')" id="annualReportPageInputWrapper"><b-form-input disabled v-model="form.annualReportPage" class="input-small" id="annualReportPageInput" type="text"></b-form-input></span> бр. <span v-on:mouseleave="hideTooltip('ordinalInputWrapper')" id="ordinalInputWrapper"><b-form-input disabled v-model="form.ordinal" class="input-small" id="ordinalInput" type="text"></b-form-input></span>&nbsp;                                                         <b-form-input disabled class="input-small" id="municipalityPresidentInput" type="text"></b-form-input>
      

      </div>
      <div id="downloadPrintBtnsDiv">
        <b-button v-on:mouseleave="hideTooltip('paymentSlipDownloadBtn')" ref="paymentSlipDownloadBtn" id="paymentSlipDownloadBtn" @click.stop="downloadPaymentSlip()" variant="light" class="ignoreInPrint btn-lg" :class="{ 'displayNone' : defaultPaymentSlipPreview }" :disabled="disablePrintAndDownload">
          <img src="~@/assets/download.png" class="ignoreInPrint">
        </b-button>
        &nbsp;
        <b-button v-on:mouseleave="hideTooltip('paymentSlipPrintBtn')" ref="paymentSlipPrintBtn" id="paymentSlipPrintBtn" @click.stop="printPaymentSlip()" variant="light" class="ignoreInPrint btn-lg" :class="{ 'displayNone' : defaultPaymentSlipPreview }" :disabled="disablePrintAndDownload">
          <img src="~@/assets/print.png" class="ignoreInPrint">
        </b-button>
      </div>
      <div id="clearSaveBtnsDiv">
        <b-button v-on:mouseleave="hideTooltip('paymentSlipSaveBtn')" ref="paymentSlipSaveBtn" id="paymentSlipSaveBtn" type="submit" variant="light" class="ignoreInPrint btn-lg">
          <img src="~@/assets/save.png" class="ignoreInPrint">
        </b-button>
        <b-button v-on:mouseleave="hideTooltip('paymentSlipClearBtn')" ref="paymentSlipClearBtn" id="paymentSlipClearBtn" @click.stop="clearForm()" variant="light" class="ignoreInPrint btn-lg">
          <img src="~@/assets/clear.png" class="ignoreInPrint">
        </b-button>
      </div>
    </b-form>

    <b-tooltip boundary='window' target="incomeInput" triggers="hover" placement="top" ref="incomeInputTooltip" :disabled.sync="disableIncomeTooltip" v-on:hide.prevent>
      {{phrases.enterAmount}}
    </b-tooltip>

    <b-tooltip boundary='window' target="reasonInput" triggers="hover" placement="top" ref="reasonInputTooltip" :disabled.sync="disableReasonTooltip" v-on:hide.prevent>
      {{phrases.enterReason}}
    </b-tooltip>

    <b-tooltip boundary='window' target="firstPartPosSelect" triggers="hover" placement="top" ref="firstPartInputTooltip" :disabled.sync="disableFirstPartTooltip" v-on:hide.prevent>
      {{firstPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="firstPosInputWrapper" triggers="hover" placement="top" ref="firstPosInputTooltip" :disabled.sync="disableFirstPosTooltip" v-on:hide.prevent>
      {{firstPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="firstIncomeInputWrapper" triggers="hover" placement="top" ref="firstIncomeInputTooltip" :disabled.sync="disableFirstIncomeTooltip" v-on:hide.prevent>
      {{firstIncomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="secondPartPosSelect" triggers="hover" placement="top" ref="secondPartInputTooltip" :disabled.sync="disableSecondPartTooltip" v-on:hide.prevent>
      {{secondPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="secondPosInputWrapper" triggers="hover" placement="top" ref="secondPosInputTooltip" :disabled.sync="disableSecondPosTooltip" v-on:hide.prevent>
      {{secondPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="secondIncomeInputWrapper" triggers="hover" placement="top" ref="secondIncomeInputTooltip" :disabled.sync="disableSecondIncomeTooltip" v-on:hide.prevent>
      {{secondIncomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="thirdPartPosSelect" triggers="hover" placement="top" ref="thirdPartInputTooltip" :disabled.sync="disableThirdPartTooltip" v-on:hide.prevent>
      {{thirdPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="thirdPosInputWrapper" triggers="hover" placement="top" ref="thirdPosInputTooltip" :disabled.sync="disableThirdPosTooltip" v-on:hide.prevent>
      {{thirdPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="thirdIncomeInputWrapper" triggers="hover" placement="top" ref="thirdIncomeInputTooltip" :disabled.sync="disableThirdIncomeTooltip" v-on:hide.prevent>
      {{thirdIncomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fourthPartPosSelect" triggers="hover" placement="top" ref="fourthPartInputTooltip" :disabled.sync="disableFourthPartTooltip" v-on:hide.prevent>
      {{fourthPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fourthPosInputWrapper" triggers="hover" placement="top" ref="fourthPosInputTooltip" :disabled.sync="disableFourthPosTooltip" v-on:hide.prevent>
      {{fourthPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fourthIncomeInputWrapper" triggers="hover" placement="top" ref="fourthIncomeInputTooltip" :disabled.sync="disableFourthIncomeTooltip" v-on:hide.prevent>
      {{fourthIncomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fifthPartPosSelect" triggers="hover" placement="top" ref="fifthPartInputTooltip" :disabled.sync="disableFifthPartTooltip" v-on:hide.prevent>
      {{fifthPartTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fifthPosInputWrapper" triggers="hover" placement="top" ref="fifthPosInputTooltip" :disabled.sync="disableFifthPosTooltip" v-on:hide.prevent>
      {{fifthPosTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="fifthIncomeInputWrapper" triggers="hover" placement="top" ref="fifthIncomeInputTooltip" :disabled.sync="disableFifthIncomeTooltip" v-on:hide.prevent>
      {{fifthIncomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="totalIncomeInputWrapper" triggers="hover" placement="top" ref="totalIncomeInputTooltip" :disabled.sync="disableTotalIncomeTooltip" v-on:hide.prevent>
      {{totalIncomeTooltipText}}
    </b-tooltip>

    <b-tooltip boundary='window' target="dateInput" triggers="hover" placement="top" ref="dateInputTooltip" :disabled.sync="disableDateTooltip" v-on:hide.prevent>
      {{phrases.pickDate}}
    </b-tooltip>

    <b-tooltip boundary='window' target="annualReportPageInputWrapper" triggers="hover" placement="top" ref="annualReportPageInputTooltip" :disabled.sync="defaultPaymentSlipPreview" v-on:hide.prevent>
      {{phrases.automaticallyGeneratedAfterSave}}
    </b-tooltip>

    <b-tooltip boundary='window' target="ordinalInputWrapper" triggers="hover" placement="top" ref="ordinalInputTooltip" :disabled.sync="defaultPaymentSlipPreview" v-on:hide.prevent>
      {{phrases.automaticallyGeneratedAfterSave}}
    </b-tooltip>

    <b-tooltip boundary='window' target="paymentSlipDownloadBtn" triggers="hover" placement="top" ref="paymentSlipDownloadBtnTooltip" v-on:hide.prevent>
      {{phrases.download}}
    </b-tooltip>

    <b-tooltip boundary='window' target="paymentSlipPrintBtn" triggers="hover" placement="top" ref="paymentSlipPrintBtnTooltip" v-on:hide.prevent>
      {{phrases.print}}
    </b-tooltip>

    <b-tooltip boundary='window' target="paymentSlipSaveBtn" triggers="hover" placement="top" ref="paymentSlipSaveBtnTooltip" v-on:hide.prevent>
      {{phrases.save}}
    </b-tooltip>

    <b-tooltip boundary='window' target="paymentSlipClearBtn" triggers="hover" placement="top" ref="paymentSlipClearBtnTooltip" v-on:hide.prevent>
      {{phrases.clear}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="payment-slip-preview-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('paymentSlipPreviewErrorModal')">
        <message-confirm-dialog ref="paymentSlipPreviewErrorModal" parentModal="payment-slip-preview-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import Datepicker from 'vuejs-datepicker'
  import { sr, srCYRL } from 'vuejs-datepicker/dist/locale'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'

  const annualReportController = require('../../../../controllers/annualReportController')
  const incomeCodeController = require('../../../../controllers/incomeCodeController')
  const paymentSlipController = require('../../../../controllers/paymentSlipController')
  const defaultPaymentSlipController = require('../../../../controllers/defaultPaymentSlipController')
  const { asRoman, numberToSerbianDinars, mapPaymentSlipToPaymentSlipForm, mapPaymentSlipFormToPaymentSlip, saveAs, asFloat, amountNumberOptions } = require('../../../../utils/utils')
  const i18n = require('../../../../../translations/i18n')
  const AutoNumeric = require('autonumeric')
  const Mousetrap = require('mousetrap')
  const Big = require('big.js')

  export default {
    store: store,
    props: {
      paymentSlip: {
        type: Object,
        default: null,
      },
      paymentSlipPreview: {
        type: Boolean,
        default: false
      },
      defaultPaymentSlipPreview: {
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
        incomeCodes: null,
        incomeCodeCombinations: null,
        errorText: "",
        phrases: {
          save: i18n.getTranslation('Save'),
          print: i18n.getTranslation('Print'),
          clear: i18n.getTranslation('Clear'),
          enterAmount: i18n.getTranslation('Enter amount'),
          enterReason: i18n.getTranslation('Enter reason'),
          pickDate: i18n.getTranslation('Pick a date'),
          atLeastOnePartPosAmount: i18n.getTranslation('Enter at least one partition, position, amount'),
          needsToBeEqualToSum: i18n.getTranslation('Needs to equal to sum of amount by partitions and position'),
          ok: i18n.getTranslation('Ok'),
          download: i18n.getTranslation('Download'),
          permissionDenied: i18n.getTranslation('Permission denied.'),
          paymentSlipFileName: i18n.getTranslation('payment-slip'),
          automaticallyGeneratedAfterSave: i18n.getTranslation('Automatically generated after save')
        },
        calendarLanguages: {
          sr: sr,
          srCYRL: srCYRL
        },
        incomeInputAutonumeric: null,
        firstIncomeInputAutonumeric: null,
        secondIncomeInputAutonumeric: null,
        thirdIncomeInputAutonumeric: null,
        fourthIncomeInputAutonumeric: null,
        fifthIncomeInputAutonumeric: null,
        totalIncomeInputAutonumeric: null,
        alreadyPressed: false,
        disablePrintAndDownload: true,
        tooltipTimeouts: [],
        formatedFirstPart: null,
        formatedSecondPart: null,
        formatedThirdPart: null,
        formatedFourthPart: null,
        formatedFifthPart: null
      }
    },
    created () {
      if(this.paymentSlipPreview) {
        var paymentSlip = JSON.parse(JSON.stringify(this.paymentSlip))
        this.form = mapPaymentSlipToPaymentSlipForm(paymentSlip)
        if (!this.form.isValid) {
          this.shouldValidate = true
        } else {
          this.disablePrintAndDownload = false
        }
      } else {
        var defaultPaymentSlip = JSON.parse(JSON.stringify(this.defaultPaymentSlip))
        defaultPaymentSlip._id = undefined
        this.form = mapPaymentSlipToPaymentSlipForm(defaultPaymentSlip)
        this.loadAnnualReportCommon()
      }
      const self = this;
      incomeCodeController.getIncomeCodes().then(function (res) {
        if (!res.err) {
          self.incomeCodes = res.data ? res.data : []
        } else {
          self.openErrorModal(res.err)
        }
      })
      const unwatch = this.$watch('form', () => {
        self.disablePrintAndDownload = true
        unwatch()
      }, {deep: true})
      this.formatedFirstPart = asRoman(this.form.firstPartition)
      this.$watch('form.firstPartition', () => {
        self.formatedFirstPart = asRoman(self.form.firstPartition)
      })
      this.formatedSecondPart = asRoman(this.form.secondPartition)
      this.$watch('form.secondPartition', () => {
        self.formatedSecondPart = asRoman(self.form.secondPartition)
      })
      this.formatedThirdPart = asRoman(this.form.thirdPartition)
      this.$watch('form.thirdPartition', () => {
        self.formatedThirdPart = asRoman(self.form.thirdPartition)
      })
      this.formatedFourthPart = asRoman(this.form.fourthPartition)
      this.$watch('form.fourthPartition', () => {
        self.formatedFourthPart = asRoman(self.form.fourthPartition)
      })
      this.formatedFifthPart = asRoman(this.form.fifthPartition)
      this.$watch('form.fifthPartition', () => {
        self.formatedFifthPart = asRoman(self.form.fifthPartition)
      })
    },
    mounted () {
      this.incomeInputAutonumeric = new AutoNumeric('#incomeInput', amountNumberOptions)
      this.firstIncomeInputAutonumeric = new AutoNumeric('#firstIncomeInput', amountNumberOptions)
      this.secondIncomeInputAutonumeric = new AutoNumeric('#secondIncomeInput', amountNumberOptions)
      this.thirdIncomeInputAutonumeric = new AutoNumeric('#thirdIncomeInput', amountNumberOptions)
      this.fourthIncomeInputAutonumeric = new AutoNumeric('#fourthIncomeInput', amountNumberOptions)
      this.fifthIncomeInputAutonumeric = new AutoNumeric('#fifthIncomeInput', amountNumberOptions)
      this.totalIncomeInputAutonumeric = new AutoNumeric('#totalIncomeInput', amountNumberOptions)
      this.bindKeys()
    },
    beforeDestroy () {
      this.unbindKeys()
    },
    computed: {
      ...mapState(
        {
          defaultPaymentSlip: state => state.CommonValues.defaultPaymentSlip
        }
      ),
      generatedIncomeText: {
        get: function () {
          var placeholder = ''
          if (this.form) {
            var generatedText = numberToSerbianDinars(asFloat(this.form.income, amountNumberOptions))
            if (!generatedText) {
              return placeholder
            } else {
              this.form.incomeAsText = generatedText
              return generatedText
            }
          } else {
            return placeholder
          }
        },
        set: function (newValue) {
        }
      },
      generatedIncomeTextLine1: {
        get: function () {
          if (this.generatedIncomeText.length <= 52) {
            return this.generatedIncomeText
          }
          const firstSubstring = this.generatedIncomeText.substring(0, 52)
          const spaceInd = firstSubstring.lastIndexOf(' ')
          if (spaceInd !== -1) {
            return this.generatedIncomeText.substring(0, spaceInd)
          } else {
            return this.generatedIncomeText.substring(0, 52)
          }
        },
        set: function (newValue) {
        }
      },
      generatedIncomeTextLine2: {
        get: function () {
          if (this.generatedIncomeText.length <= 52) {
            return ''
          }
          const firstSubstring = this.generatedIncomeText.substring(0, 52)
          const spaceInd = firstSubstring.lastIndexOf(' ')
          if (spaceInd !== -1) {
            return this.generatedIncomeText.substring(spaceInd)
          } else {
            return this.generatedIncomeText.substring(52)
          }
        },
        set: function (newValue) {
        }
      },
      year: {
        get: function () {
          if (this.form.date) {
            return new Date(this.form.date).getUTCFullYear()
          } 
          return null
        },
        set: function (newValue) {
        }
      },
      firstPartTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      firstPosTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      firstIncomeTooltipText: function () {
        if(!this.missingFirstPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      secondPosTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      secondPartTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      secondIncomeTooltipText: function () {
        if(!this.missingSecondPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      thirdPosTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      thirdPartTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      thirdIncomeTooltipText: function () {
        if(!this.missingThirdPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fourthPosTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      fourthPartTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      fourthIncomeTooltipText: function () {
        if(!this.missingFourthPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      fifthPosTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      fifthPartTooltipText: function () {
        return this.phrases.atLeastOnePartPosAmount
      },
      fifthIncomeTooltipText: function () {
        if(!this.missingFifthPart) {
          return this.phrases.enterAmount
        }
        return this.phrases.atLeastOnePartPosAmount
      },
      totalIncomeTooltipText: function () {
        if (this.totalIncomeNotValid) {
          return this.phrases.needsToBeEqualToSum
        } else {
          return this.phrases.enterValue
        }
      },
      disableIncomeTooltip: {
        get: function () {
          return !this.missingIncome || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('incomeInput')
          }
        }
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
          return !this.atLeastOnePartPosNotSet || !this.missingFirstPart || !this.shouldValidate
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
          return !this.atLeastOnePartPosNotSet || !this.missingFirstPos || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('firstPosInputWrapper')
          }
        }
      },
      disableFirstIncomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingFirstPart && this.missingFirstIncome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('firstIncomeInputWrapper')
          }
        }
      },
      disableSecondPartTooltip: {
        get: function () {
          return !this.atLeastOnePartPosNotSet || !this.missingSecondPart || !this.shouldValidate 
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
          return !this.atLeastOnePartPosNotSet || !this.missingSecondPos || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('secondPosInputWrapper')
          }
        }
      },
      disableSecondIncomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingSecondPart && this.missingSecondIncome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('secondIncomeInputWrapper')
          }
        }
      },
      disableThirdPartTooltip: {
        get: function () {
          return !this.atLeastOnePartPosNotSet || !this.missingThirdPart || !this.shouldValidate 
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
          return !this.atLeastOnePartPosNotSet || !this.missingThirdPos || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('thirdPosInputWrapper')
          }
        }
      },
      disableThirdIncomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingThirdPart && this.missingThirdIncome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('thirdIncomeInputWrapper')
          }
        }
      },
      disableFourthPartTooltip: {
        get: function () {
          return !this.atLeastOnePartPosNotSet || !this.missingFourthPart || !this.shouldValidate 
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
          return !this.atLeastOnePartPosNotSet || !this.missingFourthPos || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fourthPosInputWrapper')
          }
        }
      },
      disableFourthIncomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingFourthPart && this.missingFourthIncome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fourthIncomeInputWrapper')
          }
        }
      },
      disableFifthPartTooltip: {
        get: function () {
          return !this.atLeastOnePartPosNotSet || !this.missingFifthPart || !this.shouldValidate 
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
          return !this.atLeastOnePartPosNotSet || !this.missingFifthPos || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fifthPosInputWrapper')
          }
        }
      },
      disableFifthIncomeTooltip: {
        get: function () {
          if (this.atLeastOnePartPosNotSet && this.shouldValidate) {
            return false
          }
          if (!this.missingFifthPart && this.missingFifthIncome && this.shouldValidate) {
            return false
          }
          return true
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('fifthIncomeInputWrapper')
          }
        }
      },
      disableTotalIncomeTooltip: {
        get: function () {
          return !this.totalIncomeNotValid || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('totalIncomeInputWrapper')
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
        var options = this.getInitialPartPosOptions()
        if(this.form.secondPartition || this.form.secondPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.secondPartition + '/' + this.form.secondPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.thirdPartition || this.form.thirdPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.thirdPartition + '/' + this.form.thirdPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fourthPartition || this.form.fourthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fourthPartition + '/' + this.form.fourthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fifthPartition || this.form.fifthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fifthPartition + '/' + this.form.fifthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        return options
      },
      secondPartPosOptions: function() {
        var options = this.getInitialPartPosOptions()
        if(this.form.firstPartition || this.form.firstPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.firstPartition + '/' + this.form.firstPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.thirdPartition || this.form.thirdPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.thirdPartition + '/' + this.form.thirdPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fourthPartition || this.form.fourthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fourthPartition + '/' + this.form.fourthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fifthPartition || this.form.fifthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fifthPartition + '/' + this.form.fifthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        return options
      },
      thirdPartPosOptions: function() {
        var options = this.getInitialPartPosOptions()
        if(this.form.firstPartition || this.form.firstPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.firstPartition + '/' + this.form.firstPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.secondPartition || this.form.secondPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.secondPartition + '/' + this.form.secondPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fourthPartition || this.form.fourthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fourthPartition + '/' + this.form.fourthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fifthPartition || this.form.fifthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fifthPartition + '/' + this.form.fifthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        return options
      },
      fourthPartPosOptions: function() {
        var options = this.getInitialPartPosOptions()
        if(this.form.firstPartition || this.form.firstPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.firstPartition + '/' + this.form.firstPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.secondPartition || this.form.secondPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.secondPartition + '/' + this.form.secondPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.thirdPartition || this.form.thirdPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.thirdPartition + '/' + this.form.thirdPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fifthPartition || this.form.fifthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fifthPartition + '/' + this.form.fifthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        return options
      },
      fifthPartPosOptions: function() {
        var options = this.getInitialPartPosOptions()
        if(this.form.firstPartition || this.form.firstPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.firstPartition + '/' + this.form.firstPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.secondPartition || this.form.secondPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.secondPartition + '/' + this.form.secondPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.thirdPartition || this.form.thirdPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.thirdPartition + '/' + this.form.thirdPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        if(this.form.fourthPartition || this.form.fourthPartition == 0) {
          for (let i=0; i<options.length; i++) {
            if (options[i].value == (this.form.fourthPartition + '/' + this.form.fourthPosition)) {
              options.splice(i, 1)
              break
            }
          }
        }
        return options
      },
      missingReason: function () {
        return !this.form.reason || this.form.reason.toString().trim() === ''
      },
      missingIncome: function () {
        return !this.form.income || this.form.income.trim() === ''
      },
      missingFirstPart: function () {
        return !(this.form.firstPartition || this.form.firstPartition == 0) || this.form.firstPartition.toString().trim() === ''
      },
      missingFirstPos: function () {
        return !(this.form.firstPosition || this.form.firstPosition == 0)
      },
      missingFirstIncome: function () {
        return !this.form.firstIncome || this.form.firstIncome.trim() === ''
      },
      missingSecondPart: function () {
        return !(this.form.secondPartition || this.form.secondPartition == 0) || this.form.secondPartition.toString().trim() === ''
      },
      missingSecondPos: function () {
        return !(this.form.secondPosition || this.form.secondPosition == 0)
      },
      missingSecondIncome: function () {
        return !this.form.secondIncome || this.form.secondIncome.trim() === ''
      },
      missingThirdPart: function () {
        return !(this.form.thirdPartition || this.form.thirdPartition == 0) || this.form.thirdPartition.toString().trim() === ''
      },
      missingThirdPos: function () {
        return !(this.form.thirdPosition || this.form.thirdPosition == 0)
      },
      missingThirdIncome: function () {
        return !this.form.thirdIncome || this.form.thirdIncome.trim() === ''
      },
      missingFourthPart: function () {
        return !(this.form.fourthPartition || this.form.fourthPartition == 0) || this.form.fourthPartition.toString().trim() === ''
      },
      missingFourthPos: function () {
        return !(this.form.fourthPosition || this.form.fourthPosition == 0)
      },
      missingFourthIncome: function () {
        return !this.form.fourthIncome || this.form.fourthIncome.trim() === ''
      },
      missingFifthPart: function () {
        return !(this.form.fifthPartition || this.form.fifthPartition == 0) || this.form.fifthPartition.toString().trim() === ''
      },
      missingFifthPos: function () {
        return !(this.form.fifthPosition || this.form.fifthPosition == 0)
      },
      missingFifthIncome: function () {
        return !this.form.fifthIncome || this.form.fifthIncome.trim() === ''
      },
      missingTotalIncome: function () {
        return !this.form.income || this.form.income.trim() === ''
      },
      totalIncomeNotValid: function () {
        if (!this.missingIncome) {
          const totalIncome = Big(asFloat(this.form.income, amountNumberOptions))
          const firstIncome = this.missingFirstIncome ? Big(0.0) : Big(asFloat(this.form.firstIncome, amountNumberOptions))
          const secondIncome = this.missingSecondIncome ? Big(0.0) : Big(asFloat(this.form.secondIncome, amountNumberOptions))
          const thirdIncome = this.missingThirdIncome ? Big(0.0) : Big(asFloat(this.form.thirdIncome, amountNumberOptions))
          const fourthIncome = this.missingFourthIncome ? Big(0.0) : Big(asFloat(this.form.fourthIncome, amountNumberOptions))
          const fifthIncome = this.missingFifthIncome ? Big(0.0) : Big(asFloat(this.form.fifthIncome, amountNumberOptions))
          if (!firstIncome.plus(secondIncome).plus(thirdIncome).plus(fourthIncome).plus(fifthIncome).eq(totalIncome)) {
            return true
          }
        }
        return false
      },
      missingDate: function () {
        return !this.form.date
      },
      atLeastOnePartPosNotSet: function () {
        const firstCombinationNotSet = this.missingFirstPart || this.missingFirstPos || this.missingFirstIncome
        const secondCombinationNotSet = this.missingSecondPart || this.missingSecondPos || this.missingSecondIncome
        const thirdCombinationNotSet = this.missingThirdPart || this.missingThirdPos || this.missingThirdIncome
        const fourthCombinationNotSet = this.missingFourthPart || this.missingFourthPos || this.missingFourthIncome
        const fifthCombinationNotSet = this.missingFifthPart || this.missingFifthPos || this.missingFifthIncome
        return firstCombinationNotSet && secondCombinationNotSet && thirdCombinationNotSet && fourthCombinationNotSet && fifthCombinationNotSet
      },
      validForm: function () {
        if (this.missingIncome ||
            this.missingReason ||
            this.missingDate ||
            this.atLeastOnePartPosNotSet ||
            (!this.missingFirstPart && this.missingFirstIncome) ||
            (!this.missingSecondPart && this.missingSecondIncome) ||
            (!this.missingThirdPart && this.missingThirdIncome) ||
            (!this.missingFourthPart && this.missingFourthIncome) ||
            (!this.missingFifthPart && this.missingFifthIncome) ||
            this.totalIncomeNotValid) {
          return false
        }
        return true
      }
    },
    methods: {
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
        annualReportController.getAnnualReportCommonData().then((res) => {
          if (!res.err) {
            self.form.town = res.data ? res.data.churchTown : null
            self.form.townReceived = res.data ? res.data.churchTown : null
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
        if (!this.defaultPaymentSlipPreview) {
          Mousetrap.bind(['command+p', 'ctrl+p'], function(e) {
           if (!self.disablePrintAndDownload) {
              self.printPaymentSlip()
            }
            return false
          });
          Mousetrap.bind(['command+d', 'ctrl+d'], function(e) {
            if (!self.disablePrintAndDownload) {
              self.downloadPaymentSlip()
            }
            return false
          });
        }
        Mousetrap.bind(['command+e', 'ctrl+e'], function(e) {
          self.clearForm()
          return false
        });
        Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
          self.$refs.paymentSlipSaveBtn.click()
          return false
        });
        Mousetrap.prototype.stopCallback = function () {
          return false
        }
      },
      unbindKeys() {
        if (!this.defaultPaymentSlipPreview) {
          Mousetrap.unbind(['command+p', 'ctrl+p'])
          Mousetrap.unbind(['command+d', 'ctrl+d'])
        }
        Mousetrap.unbind(['command+e', 'ctrl+e'])
        Mousetrap.unbind(['command+s', 'ctrl+s'])
      },
      getInitialPartPosOptions() {
        if (!this.incomeCodes) {
          return []
        }
        var options = []
        options.push({html: '&nbsp;', value: null})
        this.incomeCodes.forEach(ic => {
          options.push({html: '<span class="partPosOptionText">' + asRoman(ic.partition) + '/' + ic.position + '</span><span class="descriptionOptionText">' + (ic.description ? ic.description : '&nbsp;') + '</span>', value: ic.partition + '/' + ic.position})
        })
        return options
      },
      setSelectedFirstPartPos (selectedPartPos) {
        if (selectedPartPos) {
          const partPos = selectedPartPos.split('/')
          this.form.firstPartition = partPos[0]
          this.form.firstPosition = partPos[1]
        } else {
          this.form.firstPartition = null
          this.form.firstPosition = null
          this.form.firstIncome = null
          if (this.firstIncomeInputAutonumeric) {
            this.firstIncomeInputAutonumeric.clear()
          }
        }
      },
      setSelectedSecondPartPos (selectedPartPos) {
        if (selectedPartPos) {
          const partPos = selectedPartPos.split('/')
          this.form.secondPartition = partPos[0]
          this.form.secondPosition = partPos[1]
        } else {
          this.form.secondPartition = null
          this.form.secondPosition = null
          this.form.secondIncome = null
          if (this.secondIncomeInputAutonumeric) {
            this.secondIncomeInputAutonumeric.clear()
          }
        }
      },
      setSelectedThirdPartPos (selectedPartPos) {
        if (selectedPartPos) {
          const partPos = selectedPartPos.split('/')
          this.form.thirdPartition = partPos[0]
          this.form.thirdPosition = partPos[1]
        } else {
          this.form.thirdPartition = null
          this.form.thirdPosition = null
          this.form.thirdIncome = null
          if (this.thirdIncomeInputAutonumeric) {
            this.thirdIncomeInputAutonumeric.clear()
          }
        }
      },
      setSelectedFourthPartPos (selectedPartPos) {
        if (selectedPartPos) {
          const partPos = selectedPartPos.split('/')
          this.form.fourthPartition = partPos[0]
          this.form.fourthPosition = partPos[1]
        } else {
          this.form.fourthPartition = null
          this.form.fourthPosition = null
          this.form.fourthIncome = null
          if (this.fourthIncomeInputAutonumeric) {
            this.fourthIncomeInputAutonumeric.clear()
          }
        }
      },
      setSelectedFifthPartPos (selectedPartPos) {
        if (selectedPartPos) {
          const partPos = selectedPartPos.split('/')
          this.form.fifthPartition = partPos[0]
          this.form.fifthPosition = partPos[1]
        } else {
          this.form.fifthPartition = null
          this.form.fifthPosition = null
          this.form.fifthIncome = null
          if (this.fifthIncomeInputAutonumeric) {
            this.fifthIncomeInputAutonumeric.clear()
          }
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
        if (this.missingIncome) {
          this.showTooltip('incomeInput')
        } else if (this.missingReason) {
          this.showTooltip('reasonInput')
        } else if (this.missingDate) {
          this.showTooltip('dateInput')
        } else if (this.atLeastOnePartPosNotSet) {
          this.showTooltip('firstPartPosSelect')
        } else if (!this.missingFirstPart && this.missingFirstIncome) {
          this.showTooltip('firstIncomeInputWrapper')
        } else if (!this.missingSecondPart && this.missingSecondIncome) {
          this.showTooltip('secondIncomeInputWrapper')
        } else if (!this.missingThirdPart && this.missingThirdIncome) {
          this.showTooltip('thirdIncomeInputWrapper')
        } else if (!this.missingFourthPart && this.missingFourthIncome) {
          this.showTooltip('fourthIncomeInputWrapper')
        } else if (!this.missingFifthPart && this.missingFifthIncome) {
          this.showTooltip('fifthIncomeInputWrapper')
        } else if (this.totalIncomeNotValid) {
          this.showTooltip('totalIncomeInputWrapper')
        }
      },
      showTooltip (elementId) {
        this.$root.$emit('bv::show::tooltip', elementId)
        clearTimeout(this.tooltipTimeouts[elementId])
        const self = this
        this.tooltipTimeouts[elementId] = setTimeout(() => {
          self.hideTooltip(elementId)
          self.tooltipTimeouts[elementId] = null
        }, 2500)
      },
      hideTooltip (elementId) {
        this.$root.$emit('bv::hide::tooltip', elementId)
      },
      onSubmit (evt) {
        evt.preventDefault();
        if (this.alreadyPressed) {
          return
        }
        const self = this;
        if (this.defaultPaymentSlipPreview) {
          this.alreadyPressed = true
          defaultPaymentSlipController.createDefaultPaymentSlip(mapPaymentSlipFormToPaymentSlip(this.form, this.incomeCodes)).then(function (res) {
            if (!res.err) {
              self.$emit('updateDefaultPaymentSlip')
              self.closeModal();
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        } else {
          this.shouldValidate = true;
          if (!this.validForm) {
            this.showInvalidTooltips()
            return
          } 
          if (this.paymentSlipPreview) {
            this.alreadyPressed = true
            paymentSlipController.updatePaymentSlip(mapPaymentSlipFormToPaymentSlip(this.form, this.incomeCodes, true)).then((res) => {
              if (!res.err) {
                self.$emit('updatePaymentSlipTable')
                self.closeModal();
              } else {
                self.alreadyPressed = false
                self.openErrorModal(res.err)
              }
            })
          } else {
            this.alreadyPressed = true
            paymentSlipController.createPaymentSlip(mapPaymentSlipFormToPaymentSlip(this.form, this.incomeCodes, true)).then((res) => {
              if (!res.err) {
                self.$emit('updatePaymentSlipTable')
                self.closeModal();
              } else {
                self.alreadyPressed = false
                self.openErrorModal(res.err)
              }
            })
          }
        }
      },
      clearForm () {
        this.form.ordinal = null;
        this.form.annualReportPage = null;
        this.form.date = null;
        this.form.firstPartition = null;
        this.form.firstPosition = null;
        this.form.firstIncome = null;
        this.firstIncomeInputAutonumeric.clear()
        this.form.secondPartition = null;
        this.form.secondPosition = null;
        this.form.secondIncome = null;
        this.secondIncomeInputAutonumeric.clear()
        this.form.thirdPartition = null;
        this.form.thirdPosition = null;
        this.form.thirdIncome = null;
        this.thirdIncomeInputAutonumeric.clear()
        this.form.fourthPartition = null;
        this.form.fourthPosition = null;
        this.form.fourthIncome = null;
        this.fourthIncomeInputAutonumeric.clear()
        this.form.fifthPartition = null;
        this.form.fifthPosition = null;
        this.form.fifthIncome = null;
        this.fifthIncomeInputAutonumeric.clear()
        this.form.income = null;
        this.incomeInputAutonumeric.clear()
        this.form.incomeAsText = null;
        this.form.town = null;
        this.form.reason = null;
        this.form.payed = null;
        this.totalIncomeInputAutonumeric.clear()
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'payment-slip-preview-error-modal')
      },
      printPaymentSlip () {
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
      async downloadPaymentSlip () {
        if (this.alreadyPressed) {
          return
        }
        const section = this.preparePrintSection()
        document.body.appendChild(section)
        try {
          this.alreadyPressed = true
          const res = await paymentSlipController.createPaymentSlipPdf()
          if (!res.err) {
            const self = this
            const date = new Date(this.form.date)
            saveAs('/payment-slip.pdf', this.phrases.paymentSlipFileName  + '-' + date.getUTCDate()  + '-' + (date.getUTCMonth() +1) + '-' + date.getUTCFullYear() +  '.pdf', err => {
              if (err) {
                if (err.message.toLowerCase().indexOf('permission denied') != -1) {
                  self.openErrorModal(self.phrases.permissionDenied)
                } else {
                  self.openErrorModal(err.message)
                }
              }
            })
          } else {
            this.openErrorModal(res.err)       
          }
        } finally {
          this.alreadyPressed = false
          document.body.removeChild(section)
        }
      },
      preparePrintSection () {
        const modal = document.getElementById('payment-slip-preview-container')
        const cloned = modal.cloneNode(true)
        var section = document.createElement('div')
        section.id = 'print-payment-slip'
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
    /* Immitate the underline in the real payment slip */
    border-bottom: .5pt solid black !important;
    border-radius: 0 !important;
    text-align:center;
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
  #payment-slip-preview-container {
    width: 794px;
    height: 595px;
    position:relative;
  }
  .payment-slip-preview-text {
    white-space: pre;
    width: 670px;
    height: 520px;
    /*border-style: solid;
    border-color: blue;*/
    color: #16264C;
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
    font-family: "Times New Roman";
    letter-spacing: 95%;
    margin: 0px;
    padding: 0px;
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
  #incomeInput {
    width: 140px;
  }
  #incomeAsTextInput {
    width: 410px;
  }
  #incomeAsTextInputPt2 {
    width: 255px;
  }
  #townInput {
    width: 320px;
  }
  #reasonInput {
    width: 290px;
  }
  #payedInput {
    width: 290px;
  }
  #receivedInput {
    width: 290px;
  }
  #townReceivedInput {
    width: 279px;
  }
  #yearInput {
    width:70px;
  }
  #firstPartPosSelect {
    width: 50px;
    height:20px;
  }
  #secondPartPosSelect {
    width: 50px;
    height:20px;
  }
  #thirdPartPosSelect {
    width: 50px;
    height:20px;
  }
  #fourthPartPosSelect {
    width: 50px;
    height:20px;
  }
  #fifthPartPosSelect {
    width: 50px;
    height:20px;
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
  #firstIncomeInput {
    width: 90px;
  }
  #secondIncomeInput {
    width: 90px;
  }
  #thirdIncomeInput {
    width: 90px;
  }
  #fourthIncomeInput {
    width: 90px;
  }
  #fifthIncomeInput {
    width: 90px;
  }
  #totalIncomeInput {
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
    top:93%;
    right: 7.5%;
  }
  #downloadPrintBtnsDiv {
    position: absolute;
    top:93%;
    left: 7.5%;
  }
  .displayNone {
    display:none;
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

  .incomeAsTextDivWrapper {
    display: inline;
    font-weight: bold;
    color: black;
    white-space: nowrap;
    border-bottom: solid;
    border-width: 1px;
    display: inline-block;
    margin: 0;
  }
  #IncomeAsText1 {
    width: 362px;
    white-space: nowrap;
    overflow: hidden;
    display: inline-block;
  }
  #IncomeAsText2 {
    width: 670px;
    white-space: nowrap;
    overflow: hidden;
  }
</style>

<style>
  .paymentSlipDatepickerInput {
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
  .disabledDatepicker .paymentSlipDatepickerInput {
    background-color: rgb(235, 236, 238);
  }
  .is-invalid .paymentSlipDatepickerInput {    
    background-image: url('~@/assets/invalid-red.png');
    background-repeat: no-repeat;
    background-position: center right calc(2.25rem / 4);
    background-size: calc(2.25rem / 2) calc(2.25rem / 2);
  }
  .paymentSlipDatepickerWrapper {
    display: inline;
    white-space: normal;
    height: 20px;
    margin: 0px;
    padding: 0px;
    width: 95px;
  }
  .paymentSlipDatepickerWrapper > div:first-child {
    display: inline;
    width: 95px;
    margin: 0px;
    padding: 0px;
  }
  .paymentSlipDatepickerCalendar {
    font-size: 120%;
    white-space: normal;
    z-index: 100;
    -webkit-transform: scale(0.7, 0.7) translate(-70px, -70px); /* Safari and Chrome */
  }

 .paymentSlipDatepickerCalendar span:hover  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }
  .paymentSlipDatepickerCalendar span.selected  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }

   .paymentSlipDatepickerCalendar div span:hover  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }
     
  .paymentSlipDatepickerCalendar header span:hover  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }

@media screen {
    #print-payment-slip {
      display: none;
    }
  }
  @media print {
    * {
      visibility:hidden;
    }
    #print-payment-slip, #print-payment-slip * {
      visibility:visible;
    }
    #print-payment-slip {
      position: absolute;
      top:0px;
      left:0px;
    }
    #payment-slip-preview-container {
      top:150px;
      left:200px;
      transform: scale(1.5);
    }
    .ignoreInPrint {
      visibility:hidden !important;
    }
    input {
      padding:0px !important;
    }
  }
</style>
