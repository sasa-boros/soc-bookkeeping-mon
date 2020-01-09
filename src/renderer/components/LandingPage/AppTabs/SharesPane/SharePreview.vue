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
      <h5 align="center">Хартија од вредности</h5>
      <br>
      <b-row>
        <b-col cols="3">
          <label for="yearInput">Година:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <span v-on:mouseleave="disableYearTooltip ? null : hideTooltip('yearInput')"><datepicker id="yearInput" minimum-view="year" maximum-view="year" format="yyyy" v-model="form.year" v-bind:class="{ 'is-invalid': shouldValidate && missingYear }" :language="calendarLanguages.srCYRL" input-class="shareDatepickerInput" wrapper-class="shareDatepickerWrapper" calendar-class="shareDatepickerCalendar"></datepicker></span>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="seriesInput">Серија:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="seriesInput" type="text" v-model="form.series" v-on:keypress="limitInputPerSize"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="ordinalInput">Број:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="ordinalInput" type="text" v-model="form.ordinal" v-on:keypress="limitInputPerSize"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="nameInput">Назив:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="nameInput" type="text" v-model="form.name" v-on:mouseleave="disableNameTooltip ? null : hideTooltip('nameInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingName }" v-on:keypress="limitInputPerSize"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="nominalValueInput">Ном. вредност:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="nominalValueInput" type="text" v-model="form.nominalValue" v-on:mouseleave="disableNominalValueTooltip ? null : hideTooltip('nominalValueInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingNominalValue }"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button-group class="float-right">
            <b-button ref="saveShareBtn" id="saveShareBtn" v-on:mouseleave="hideTooltip('saveShareBtn')" type="submit" variant="light" class="btn-lg">
              <img src="~@/assets/save.png">
            </b-button>
            <b-button ref="clearFormBtn" id="clearFormBtn" v-on:mouseleave="hideTooltip('clearFormBtn')" @click.stop="clearForm()" variant="light" class="btn-lg">
              <img src="~@/assets/clear.png">
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-form>

    <b-tooltip boundary='window' target="yearInput" triggers="hover" placement="top" ref="yearInputTooltip" :disabled.sync="disableYearTooltip" v-on:hide.prevent>
      {{phrases.pickYear}}
    </b-tooltip>

    <b-tooltip boundary='window' target="nameInput" triggers="hover" placement="top" ref="nameInputTooltip" :disabled.sync="disableNameTooltip" v-on:hide.prevent>
      {{phrases.enterName}}
    </b-tooltip>

    <b-tooltip boundary='window' target="nominalValueInput" triggers="hover" placement="top" ref="nominalValueInputTooltip" :disabled.sync="disableNominalValueTooltip" v-on:hide.prevent>
      {{phrases.enterValue}}
    </b-tooltip>

    <b-tooltip boundary='window' target="saveShareBtn" triggers="hover" placement="top" ref="saveShareBtnTooltip" v-on:hide.prevent>
      {{phrases.save}}
    </b-tooltip>

    <b-tooltip boundary='window' target="clearFormBtn" triggers="hover" placement="top" ref="clearFormBtnTooltip" v-on:hide.prevent>
      {{phrases.clear}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="share-preview-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('sharePreviewErrorModal')">
      <message-confirm-dialog ref="sharePreviewErrorModal" parentModal="share-preview-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import Datepicker from 'vuejs-datepicker'
  import { sr, srCYRL } from 'vuejs-datepicker/dist/locale'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'
  
  const shareController = require('../../../../controllers/shareController')
  const { mapShareToShareForm, mapShareFormToShare, largeAmountNumberOptions } = require('../../../../utils/utils')
  
  const i18n = require('../../../../../translations/i18n')
  const AutoNumeric = require('autonumeric')
  const Mousetrap = require('mousetrap')

  export default {
    props: {
      share: {
        type: Object,
        default: null
      },
      sharePreview: {
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
          series: null,
          ordinal: null,
          name: null,
          nominalValue: null
        },
        shouldValidate: false,
        errorText: "",
        phrases: {
          save: i18n.getTranslation('Save'),
          clear: i18n.getTranslation('Clear'),
          ok: i18n.getTranslation('Ok'),
          pickYear: i18n.getTranslation('Pick a year'),
          enterName: i18n.getTranslation('Enter name'),
          enterValue: i18n.getTranslation('Enter value')
        },
        calendarLanguages: {
          sr: sr,
          srCYRL: srCYRL
        },
        nominalValueInputAutonumeric: null,
        alreadyPressed: false,
        tooltipTimeouts: []
      }
    },
    created () {
      if(this.sharePreview) {
        var share = JSON.parse(JSON.stringify(this.share));
        this.form = mapShareToShareForm(share);
      }
    },
    mounted () {
      this.nominalValueInputAutonumeric = new AutoNumeric('#nominalValueInput', largeAmountNumberOptions)
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
            this.hideTooltip('nameInput')
          }
        }
      },
      disableNominalValueTooltip: {
        get: function () {
          return !this.missingNominalValue || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('nominalValueInput')
          }
        }
      },
      missingYear: function () {
        return !this.form.year
      },
      missingName: function () {
        return !this.form.name || this.form.name.trim() === ''
      },
      missingNominalValue: function () {
        return !this.form.nominalValue || this.form.nominalValue.toString().trim() === ''
      },
      validForm: function () {
        if (this.missingYear ||
            this.missingName ||
            this.missingNominalValue) {
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
          self.$refs.saveShareBtn.click()
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
          this.showTooltip('nameInput')
        } else if (this.missingNominalValue) {
          this.showTooltip('nominalValueInput')
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
        if (this.sharePreview) {
          this.alreadyPressed = true
          shareController.updateShare(mapShareFormToShare(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateSharesTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        } else {
          this.alreadyPressed = true
          shareController.createShare(mapShareFormToShare(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateSharesTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        }
      },
      clearForm () {
        this.form.year = new Date()
        this.form.series = null
        this.form.ordinal = null
        this.form.name = null
        this.form.nominalValue = null
        this.nominalValueInputAutonumeric.clear()
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'share-preview-error-modal')
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
  #seriesInput {
    width: 85px;
    border-style: none;
  }
  #ordinalInput {
    width: 85px;
    border-style: none;
  }
  #nameInput {
    width: 315px;
    border-style: none;
  }
  #nominalValueInput {
    width: 130px;
    border-style: none;
  }
</style>

<style>
  .shareDatepickerInput {
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
  .is-invalid .shareDatepickerInput {    
    background-image: url('~@/assets/invalid-red.png');
    background-repeat: no-repeat;
    background-position: center right calc(2.25rem / 4);
    background-size: calc(2.25rem / 2) calc(2.25rem / 2);
  }
  .shareDatepickerWrapper {
    display: inline;
    white-space: normal;
    height: 20px;
    margin: 0px;
    padding: 0px;
    width: 95px;
  }
  .shareDatepickerWrapper > div:first-child {
    display: inline;
    width: 95px;
    margin: 0px;
    padding: 0px;
  }
  .shareDatepickerCalendar {
    font-size: 120%;
    white-space: normal;
    z-index: 100;
    -webkit-transform: scale(0.7, 0.7) translate(-70px, -70px); /* Safari and Chrome */
  }

   .shareDatepickerCalendar span:hover  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }
  .shareDatepickerCalendar span.selected  {
    border: rgb(208, 226, 247) !important;
    background-color:  rgb(208, 226, 247) !important;
  }
</style>
