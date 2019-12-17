<template>       
  <b-container fluid>
    <b-form ref="form" v-on:submit="onSubmit" novalidate no-validation>
      <b-row>
        <b-col>
          <b-button-group class="float-right">
            <b-button v-on:click="closeModal()" variant="link" class="btn-xs">
              <img src="~@/assets/close.png">
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
      <h5 align="center">Дуговање</h5>
      <br>
      <b-row>
        <b-col cols="3">
          <label for="yearInput">Година:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <span v-on:mouseleave="disableYearTooltip ? null : hideTooltip('yearInput')"><datepicker id="yearInput" minimum-view="year" maximum-view="year" format="yyyy" v-model="form.year" v-bind:class="{ 'is-invalid': shouldValidate && missingYear }" :language="calendarLanguages.srCYRL" input-class="debtDatepickerInput" wrapper-class="debtDatepickerWrapper" calendar-class="debtDatepickerCalendar"></datepicker></span>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="descriptionInput">Опис:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="descriptionInput" type="text" v-model="form.description" v-on:mouseleave="disableNameTooltip ? null : hideTooltip('descriptionInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingName }" v-on:keypress="limitInputPerSize"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="amountInput">Износ:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="amountInput" type="text" v-model="form.amount" v-on:mouseleave="disableValueTooltip ? null : hideTooltip('amountInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingValue }"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button-group class="float-right">
            <b-button ref="saveDebtBtn" id="saveDebtBtn" v-on:mouseleave="hideTooltip('saveDebtBtn')" type="submit" variant="link" class="btn-lg">
              <img src="~@/assets/save.png">
            </b-button>
            <b-button ref="clearFormBtn" id="clearFormBtn" v-on:mouseleave="hideTooltip('clearFormBtn')" @click.stop="clearForm()" variant="link" class="btn-lg">
              <img src="~@/assets/clear.png">
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-form>

    <b-tooltip boundary='window' target="yearInput" triggers="hover" placement="top" ref="yearInputTooltip" :disabled.sync="disableYearTooltip" v-on:hide.prevent>
      {{phrases.pickYear}}
    </b-tooltip>

    <b-tooltip boundary='window' target="descriptionInput" triggers="hover" placement="top" ref="descriptionInputTooltip" :disabled.sync="disableNameTooltip" v-on:hide.prevent>
      {{phrases.enterDescription}}
    </b-tooltip>

    <b-tooltip boundary='window' target="amountInput" triggers="hover" placement="top" ref="amountInputTooltip" :disabled.sync="disableValueTooltip" v-on:hide.prevent>
      {{phrases.enterAmount}}
    </b-tooltip>

    <b-tooltip boundary='window' target="saveDebtBtn" triggers="hover" placement="top" ref="saveDebtBtnTooltip" v-on:hide.prevent>
      {{phrases.save}}
    </b-tooltip>

    <b-tooltip boundary='window' target="clearFormBtn" triggers="hover" placement="top" ref="clearFormBtnTooltip" v-on:hide.prevent>
      {{phrases.clear}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="debt-preview-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('debtPreviewErrorModal')">
      <message-confirm-dialog ref="debtPreviewErrorModal" parentModal="debt-preview-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import Datepicker from 'vuejs-datepicker'
  import { sr, srCYRL } from 'vuejs-datepicker/dist/locale'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'
  
  const debtController = require('../../../../controllers/debtController')
  const { mapDebtToDebtForm, mapDebtFormToDebt, largeAmountNumberOptions } = require('../../../../utils/utils')
  
  const i18n = require('../../../../../translations/i18n')
  const AutoNumeric = require('autonumeric')
  const Mousetrap = require('mousetrap')

  export default {
    props: {
      debt: {
        type: Object,
        default: null
      },
      debtPreview: {
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
        form: {
          year: new Date(),
          description: null,
          amount: null
        },
        shouldValidate: false,
        errorText: "",
        phrases: {
          save: i18n.getTranslation('Save'),
          clear: i18n.getTranslation('Clear'),
          ok: i18n.getTranslation('Ok'),
          pickYear: i18n.getTranslation('Pick a year'),
          enterDescription: i18n.getTranslation('Enter description'),
          enterAmount: i18n.getTranslation('Enter amount')
        },
        calendarLanguages: {
          sr: sr,
          srCYRL: srCYRL
        },
        amountInputAutonumeric: null,
        alreadyPressed: false,
        tooltipTimeouts: []
      }
    },
    created () {
      if(this.debtPreview) {
        var debt = JSON.parse(JSON.stringify(this.debt));
        this.form = mapDebtToDebtForm(debt);
      }
    },
    mounted () {
      this.amountInputAutonumeric = new AutoNumeric('#amountInput', largeAmountNumberOptions)
      this.bindKeys()
    },
    beforeDestroy () {
      this.unbindKeys()
    },
    computed: {
      disableYearTooltip: {
        get: function () {
          return !this.missingYear || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('yearInput')
          }
        }
      },
      disableNameTooltip: {
        get: function () {
          return !this.missingName || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('descriptionInput')
          }
        }
      },
      disableValueTooltip: {
        get: function () {
          return !this.missingValue || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('amountInput')
          }
        }
      },
      missingYear: function () {
        return !this.form.year
      },
      missingName: function () {
        return !this.form.description || this.form.description.trim() === ''
      },
      missingValue: function () {
        return !this.form.amount || this.form.amount.toString().trim() === ''
      },
      validForm: function () {
        if (this.missingYear ||
            this.missingName ||
            this.missingValue) {
          return false
        }
        return true
      }
    },
    methods: {
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
      },
      bindKeys() {
        const self = this
        Mousetrap.bind(['command+e', 'ctrl+e'], function(e) {
          self.clearForm()
          return false
        })
        Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
          self.$refs.saveDebtBtn.click()
          return false
        })
        Mousetrap.prototype.stopCallback = function () {
          return false;
        }
      },
      unbindKeys() {
        Mousetrap.unbind(['command+e', 'ctrl+e'])
        Mousetrap.unbind(['command+s', 'ctrl+s'])
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
        if (this.missingYear) {
          this.showTooltip('yearInput')
        } else if (this.missingName) {
          this.showTooltip('descriptionInput')
        } else if (this.missingValue) {
          this.showTooltip('amountInput')
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
        const self = this
        this.shouldValidate = true;
        if (!this.validForm) {
          this.showInvalidTooltips()
          return
        }
        if (this.debtPreview) {
          this.alreadyPressed = true
          debtController.updateDebt(mapDebtFormToDebt(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateDebtsTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        } else {
          this.alreadyPressed = true
          debtController.createDebt(mapDebtFormToDebt(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateDebtsTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        }
      },
      clearForm () {
        this.form.year = null
        this.form.description = null
        this.form.amount = null
        this.amountInputAutonumeric.clear()
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'debt-preview-error-modal')
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
    font-family: "Times New Roman";
    font-size: 90%;
    letter-spacing: 95%;
    height:20px;
    font-weight: bold;
    border-bottom: .5pt solid black !important;
    border-radius: 0 !important;
  }
  #descriptionInput {
    width: 470px;
    border-style: none;
  }
  #amountInput {
    width: 140px;
    border-style: none;
  }
</style>

<style>
  .debtDatepickerInput {
    display: inline;
    border-style: none;
    border-bottom: .5pt solid black;
    text-align: center;

    white-space: nowrap;
    width:50px;
    max-height: 20px;
    padding: 0px;
    margin: 0px;
    font-weight: bold;
    color: black;
  }
  .is-invalid .debtDatepickerInput {    
    background-image: url('~@/assets/invalid-red.png');
    background-repeat: no-repeat;
    background-position: center right calc(2.25rem / 4);
    background-size: calc(2.25rem / 2) calc(2.25rem / 2);
  }
  .debtDatepickerWrapper {
    display: inline;
    white-space: normal;
    height: 20px;
    margin: 0px;
    padding: 0px;
    width: 95px;
  }
  .debtDatepickerWrapper > div:first-child {
    display: inline;
    width: 95px;
    margin: 0px;
    padding: 0px;
  }
  .debtDatepickerCalendar {
    font-size: 120%;
    white-space: normal;
    z-index: 100;
    -webkit-transform: scale(0.7, 0.7) translate(-70px, -70px); /* Safari and Chrome */
  }

   .debtDatepickerCalendar span:hover  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }
  .debtDatepickerCalendar span.selected  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }
</style>
