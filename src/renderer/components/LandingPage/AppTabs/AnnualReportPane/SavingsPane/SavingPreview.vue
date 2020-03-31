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
      <h5 align="center">Улог на штедњи</h5>
      <br>
      <b-row>
        <b-col cols="3">
          <label for="accountInput">Број рачуна:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="accountInput" type="text" v-model="form.account" v-on:mouseleave="disableAccountTooltip ? null : hideTooltip('accountInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingAccount }" v-on:keypress="limitInputPerSize"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="savingEntityInput">Новчани завод:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="savingEntityInput" type="text" v-model="form.savingEntity" v-on:mouseleave="disableSavingEntityTooltip ? null : hideTooltip('savingEntityInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingSavingEntity }" v-on:keypress="limitInputPerSize"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="amountInput">Стање на почетку године:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input v-on:keypress.enter="adaptAutoNumericAmount('amount')" v-on:cut="updateAfterCut" id="amountInput" type="text" v-model="form.amount" v-on:mouseleave="disableAmountTooltip ? null : hideTooltip('amountInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingAmount }"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="amountDepositedInput">У току године уложено:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input v-on:keypress.enter="adaptAutoNumericAmount('amountDeposited')" v-on:cut="updateAfterCut" id="amountDepositedInput" type="text" v-model="form.amountDeposited" v-on:mouseleave="disableAmountDepositedTooltip ? null : hideTooltip('amountDepositedInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingAmountDeposited }"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="amountWithdrawnInput">У току године изузето:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input v-on:keypress.enter="adaptAutoNumericAmount('amountWithdrawn')" v-on:cut="updateAfterCut" id="amountWithdrawnInput" type="text" v-model="form.amountWithdrawn" v-on:mouseleave="disableAmountWithdrawnTooltip ? null : hideTooltip('amountWithdrawnInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingAmountWithdrawn }"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button-group class="float-right">
            <b-button ref="saveSavingBtn" id="saveSavingBtn" v-on:mouseleave="hideTooltip('saveSavingBtn')" type="submit" variant="light" class="btn-lg">
              <img src="~@/assets/save.png">
            </b-button>
            <b-button ref="clearFormBtn" id="clearFormBtn" v-on:mouseleave="hideTooltip('clearFormBtn')" @click.stop="clearForm()" variant="light" class="btn-lg">
              <img src="~@/assets/clear.png">
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-form>

    <b-tooltip boundary='window' target="accountInput" triggers="hover" placement="top" ref="accountInputTooltip" :disabled.sync="disableAccountTooltip" v-on:hide.prevent>
      {{phrases.enterAccount}}
    </b-tooltip>

    <b-tooltip boundary='window' target="savingEntityInput" triggers="hover" placement="top" ref="savingEntityInputTooltip" :disabled.sync="disableSavingEntityTooltip" v-on:hide.prevent>
      {{phrases.enterSavingEntity}}
    </b-tooltip>

    <b-tooltip boundary='window' target="amountInput" triggers="hover" placement="top" ref="amountInputTooltip" :disabled.sync="disableAmountTooltip" v-on:hide.prevent>
      {{phrases.enterAmount}}
    </b-tooltip>

    <b-tooltip boundary='window' target="amountDepositedInput" triggers="hover" placement="top" ref="amountDepositedInputTooltip" :disabled.sync="disableAmountDepositedTooltip" v-on:hide.prevent>
      {{phrases.enterAmount}}
    </b-tooltip>

    <b-tooltip boundary='window' target="amountWithdrawnInput" triggers="hover" placement="top" ref="amountWithdrawnInputTooltip" :disabled.sync="disableAmountWithdrawnTooltip" v-on:hide.prevent>
      {{phrases.enterAmount}}
    </b-tooltip>

    <b-tooltip boundary='window' target="saveSavingBtn" triggers="hover" placement="top" ref="saveSavingBtnTooltip" v-on:hide.prevent>
      {{phrases.save}}
    </b-tooltip>

    <b-tooltip boundary='window' target="clearFormBtn" triggers="hover" placement="top" ref="clearFormBtnTooltip" v-on:hide.prevent>
      {{phrases.clear}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="saving-preview-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('savingPreviewErrorModal')">
      <message-confirm-dialog ref="savingPreviewErrorModal" parentModal="saving-preview-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import Datepicker from 'vuejs-datepicker'
  import { sr, srCYRL } from 'vuejs-datepicker/dist/locale'
  import MessageConfirmDialog from '../../../../MessageConfirmDialog'
  
  const savingController = require('../../../../../controllers/savingController')
  const { mapSavingToSavingForm, mapSavingFormToSaving, largeAmountNumberOptions } = require('../../../../../utils/utils')
  
  const i18n = require('../../../../../../translations/i18n')
  const AutoNumeric = require('autonumeric')
  const Mousetrap = require('mousetrap')

  export default {
    props: {
      saving: {
        type: Object,
        default: null
      },
      savingPreview: {
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
          account: null,
          savingEntity: null,
          amount: null,
          amountDeposited: null,
          amountWithdrawn: null
        },
        shouldValidate: false,
        errorText: "",
        phrases: {
          save: i18n.getTranslation('Save'),
          clear: i18n.getTranslation('Clear'),
          ok: i18n.getTranslation('Ok'),
          enterAccount: i18n.getTranslation('Enter account'),
          enterSavingEntity: i18n.getTranslation('Enter saving entity'),
          enterAmount: i18n.getTranslation('Enter amount')
        },
        calendarLanguages: {
          sr: sr,
          srCYRL: srCYRL
        },
        alreadyPressed: false,
        tooltipTimeouts: []
      }
    },
    created () {
      if(this.savingPreview) {
        var saving = JSON.parse(JSON.stringify(this.saving));
        this.form = mapSavingToSavingForm(saving);
      }
    },
    mounted () {
      new AutoNumeric('#amountInput', largeAmountNumberOptions)
      new AutoNumeric('#amountDepositedInput', largeAmountNumberOptions)
      new AutoNumeric('#amountWithdrawnInput', largeAmountNumberOptions)
      this.bindKeys()
    },
    beforeDestroy () {
      this.unbindKeys()
    },
    computed: {
      disableAccountTooltip: {
        get: function () {
          return !this.missingAccount || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('accountInput')
          }
        }
      },
      disableSavingEntityTooltip: {
        get: function () {
          return !this.missingSavingEntity || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('savingEntityInput')
          }
        }
      },
      disableAmountTooltip: {
        get: function () {
          return !this.missingAmount || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('amountInput')
          }
        }
      },
      disableAmountDepositedTooltip: {
        get: function () {
          return !this.missingAmountDeposited || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('amountDepositedInput')
          }
        }
      },
      disableAmountWithdrawnTooltip: {
        get: function () {
          return !this.missingAmountWithdrawn || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('amountWithdrawnInput')
          }
        }
      },
      missingAccount: function () {
        return !this.form.account || this.form.account.trim() === ''
      },
      missingSavingEntity: function () {
        return !this.form.savingEntity || this.form.savingEntity.trim() === ''
      },
      missingAmount: function () {
        return !this.form.amount || this.form.amount.toString().trim() === ''
      },
      missingAmountDeposited: function () {
        return !this.form.amountDeposited || this.form.amountDeposited.toString().trim() === ''
      },
      missingAmountWithdrawn: function () {
        return !this.form.amountWithdrawn || this.form.amountWithdrawn.toString().trim() === ''
      },
      validForm: function () {
        if (this.missingAccount ||
            this.missingSavingEntity ||
            this.missingAmount ||
            this.missingAmountDeposited ||
            this.missingAmountWithdrawn) {
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
          self.$refs.saveSavingBtn.click()
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
        if (this.missingAccount) {
          this.showTooltip('accountInput')
        } else if (this.missingSavingEntity) {
          this.showTooltip('savingEntityInput')
        } else if (this.missingAmount) {
          this.showTooltip('amountInput')
        } else if (this.missingAmountDeposited) {
          this.showTooltip('amountDepositedInput')
        } else if (this.missingAmountWithdrawn) {
          this.showTooltip('amountWithdrawnInput')
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
        if (this.savingPreview) {
          this.alreadyPressed = true
          savingController.updateSaving(mapSavingFormToSaving(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateSavingsTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        } else {
          this.alreadyPressed = true
          savingController.createSaving(mapSavingFormToSaving(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateSavingsTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        }
      },
      clearForm () {
        this.form.account = null
        this.form.savingEntity = null
        this.form.amount = null
        this.form.amountDeposited = null
        this.form.amountWithdrawn = null
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'saving-preview-error-modal')
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
  #accountInput {
    width: 200px;
    border-style: none;
  }
  #savingEntityInput {
    width: 300px;
    border-style: none;
  }
  #amountInput {
    width: 110px;
    border-style: none;
  }
  #amountWithdrawnInput {
    width: 110px;
    border-style: none;
  }
  #amountDepositedInput {
    width: 110px;
    border-style: none;
  }
</style>

<style>
  .savingDatepickerInput {
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
  .is-invalid .savingDatepickerInput {    
    background-image: url('~@/assets/invalid-red.png');
    background-repeat: no-repeat;
    background-position: center right calc(2.25rem / 4);
    background-size: calc(2.25rem / 2) calc(2.25rem / 2);
  }
  .savingDatepickerWrapper {
    display: inline;
    white-space: normal;
    height: 20px;
    margin: 0px;
    padding: 0px;
    width: 95px;
  }
  .savingDatepickerWrapper > div:first-child {
    display: inline;
    width: 95px;
    margin: 0px;
    padding: 0px;
  }
  .savingDatepickerCalendar {
    font-size: 120%;
    white-space: normal;
    z-index: 100;
    -webkit-transform: scale(0.7, 0.7) translate(-70px, -70px); /* Safari and Chrome */
  }

   .savingDatepickerCalendar span:hover  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
  .savingDatepickerCalendar span.selected  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
</style>
