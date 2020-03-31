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
      <h5 align="center">Ставка инвентара</h5>
      <br>
      <b-row>
        <b-col cols="2">
          <label for="nameInput">Назив:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input id="nameInput" type="text" v-model="form.name" v-on:mouseleave="disableNameTooltip ? null : hideTooltip('nameInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingName }" v-on:keypress="limitInputPerSize"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="2">
          <label for="valueInput">Вредност:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input v-on:keypress.enter="adaptAutoNumericAmount('value')" v-on:cut="updateAfterCut" id="valueInput" type="text" v-model="form.value" v-on:mouseleave="disableValueTooltip ? null : hideTooltip('valueInput')" v-bind:class="{ 'is-invalid': shouldValidate && missingValue }"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button-group class="float-right">
            <b-button ref="saveItemBtn" id="saveItemBtn" v-on:mouseleave="hideTooltip('saveItemBtn')" type="submit" variant="light" class="btn-lg">
              <img src="~@/assets/save.png">
            </b-button>
            <b-button ref="clearFormBtn" id="clearFormBtn" v-on:mouseleave="hideTooltip('clearFormBtn')" @click.stop="clearForm()" variant="light" class="btn-lg">
              <img src="~@/assets/clear.png">
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-form>

    <b-tooltip boundary='window' target="nameInput" triggers="hover" placement="top" ref="nameInputTooltip" :disabled.sync="disableNameTooltip" v-on:hide.prevent>
      {{phrases.enterName}}
    </b-tooltip>

    <b-tooltip boundary='window' target="valueInput" triggers="hover" placement="top" ref="valueInputTooltip" :disabled.sync="disableValueTooltip" v-on:hide.prevent>
      {{phrases.enterValue}}
    </b-tooltip>

    <b-tooltip boundary='window' target="saveItemBtn" triggers="hover" placement="top" ref="saveItemBtnTooltip" v-on:hide.prevent>
      {{phrases.save}}
    </b-tooltip>

    <b-tooltip boundary='window' target="clearFormBtn" triggers="hover" placement="top" ref="clearFormBtnTooltip" v-on:hide.prevent>
      {{phrases.clear}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="item-preview-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('itemPreviewErrorModal')">
      <message-confirm-dialog ref="itemPreviewErrorModal" parentModal="item-preview-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import Datepicker from 'vuejs-datepicker'
  import { sr, srCYRL } from 'vuejs-datepicker/dist/locale'
  import MessageConfirmDialog from '../../../../MessageConfirmDialog'
  
  const itemController = require('../../../../../controllers/itemController')
  const { mapItemToItemForm, mapItemFormToItem, largeAmountNumberOptions } = require('../../../../../utils/utils')
  
  const i18n = require('../../../../../../translations/i18n')
  const AutoNumeric = require('autonumeric')
  const Mousetrap = require('mousetrap')

  export default {
    props: {
      item: {
        type: Object,
        default: null
      },
      itemPreview: {
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
          name: null,
          value: null
        },
        shouldValidate: false,
        errorText: "",
        phrases: {
          save: i18n.getTranslation('Save'),
          clear: i18n.getTranslation('Clear'),
          ok: i18n.getTranslation('Ok'),
          enterName: i18n.getTranslation('Enter name'),
          enterValue: i18n.getTranslation('Enter value')
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
      if(this.itemPreview) {
        var item = JSON.parse(JSON.stringify(this.item))
        this.form = mapItemToItemForm(item)
      } 
    },
    mounted () {
      new AutoNumeric('#valueInput', largeAmountNumberOptions)
      this.bindKeys()
    },
    beforeDestroy () {
      this.unbindKeys()
    },
    computed: {
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
      disableValueTooltip: {
        get: function () {
          return !this.missingValue || !this.shouldValidate
        },
        set: function (newValue) {
          /* If tooltip is going to get disabled, make sure it is closed before disabling it, because otherwise it will stay opened until enabled */
          if (newValue) {
            this.hideTooltip('valueInput')
          }
        }
      },
      missingName: function () {
        return !this.form.name || this.form.name.trim() === ''
      },
      missingValue: function () {
        return !this.form.value || this.form.value.toString().trim() === ''
      },
      validForm: function () {
        if (this.missingName ||
            this.missingValue) {
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
          self.$refs.saveItemBtn.click()
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
        if (this.missingName) {
          this.showTooltip('nameInput')
        } else if (this.missingValue) {
          this.showTooltip('valueInput')
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
        this.shouldValidate = true
        if (!this.validForm) {
          this.showInvalidTooltips()
          return
        }
        this.alreadyPressed = true
        if (this.itemPreview) {
          itemController.updateItem(mapItemFormToItem(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateItemsTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        } else {
          itemController.createItem(mapItemFormToItem(this.form)).then((res) => {
            if (!res.err) {
              self.$emit('updateItemsTable')
              self.closeModal()
            } else {
              self.alreadyPressed = false
              self.openErrorModal(res.err)
            }
          })
        }
      },
      clearForm () {
        this.form.name = null
        this.form.value = null
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'item-preview-error-modal')
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
  #nameInput {
    width: 430px;
    border-style: none;
  }
  #valueInput {
    width: 110px;
    border-style: none;
  }
</style>

<style>
  .itemDatepickerInput {
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
  .is-invalid .itemDatepickerInput {    
    background-image: url('~@/assets/invalid-red.png');
    background-repeat: no-repeat;
    background-position: center right calc(2.25rem / 4);
    background-size: calc(2.25rem / 2) calc(2.25rem / 2);
  }
  .itemDatepickerWrapper {
    display: inline;
    white-space: normal;
    height: 20px;
    margin: 0px;
    padding: 0px;
    width: 95px;
  }
  .itemDatepickerWrapper > div:first-child {
    display: inline;
    width: 95px;
    margin: 0px;
    padding: 0px;
  }
  .itemDatepickerCalendar {
    font-size: 120%;
    white-space: normal;
    z-index: 100;
    -webkit-transform: scale(0.7, 0.7) translate(-70px, -70px); /* Safari and Chrome */
  }

   .itemDatepickerCalendar span:hover  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
  .itemDatepickerCalendar span.selected  {
    border: #e7f3fc !important;
    background-color:  #e7f3fc !important;
  }
</style>
