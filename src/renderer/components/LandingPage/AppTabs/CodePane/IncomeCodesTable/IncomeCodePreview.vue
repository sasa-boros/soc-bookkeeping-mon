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
      <h5 align="center">Партија и позиција примања</h5>
      <br>
      <b-row>
        <b-col cols="3">
          <label for="partitionInput">Партија:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input v-on:cut="updateAfterCut" id="partitionInput" v-on:mouseleave="disablePartitionTooltip ? null : hideTooltip('partitionInput')" type="text" v-model="form.partition" class="partPosInput" v-bind:class="{ 'is-invalid': shouldValidate && (missingPartition || notUnique) }" :autofocus="!isUpdate"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="positionInput">Позиција:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input v-on:cut="updateAfterCut" id="positionInput" v-on:mouseleave="disablePositionTooltip ? null : hideTooltip('positionInput')" type="text" v-model="form.position" class="partPosInput" v-bind:class="{ 'is-invalid': shouldValidate && (missingPosition || notUnique) }"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="3">
          <label for="descriptionInput">Опис:</label>
        </b-col>
        <b-col>
          <b-form-group>
            <b-form-input ref="descriptionInput" id="descriptionInput" v-on:mouseleave="hideTooltip('descriptionInput')" type="text" v-model="form.description" v-on:keypress="limitInputPerSize" class="descriptionInput"/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button-group class="float-right">
            <b-button ref="saveIncomeCodeBtn" id="saveIncomeCodeBtn" v-on:mouseleave="hideTooltip('saveIncomeCodeBtn')" type="submit" variant="light" class="btn-lg">
              <img src="~@/assets/save.png">
            </b-button>
            <b-button ref="clearFormBtn" id="clearFormBtn" v-on:mouseleave="hideTooltip('clearFormBtn')" @click.stop="clearForm()" variant="light" class="btn-lg">
              <img src="~@/assets/clear.png">
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-form>

      <b-tooltip boundary='window' target="saveIncomeCodeBtn" triggers="hover" placement="top" ref="saveIncomeCodeBtnTooltip" v-on:hide.prevent>
        {{phrases.save}}
      </b-tooltip>

      <b-tooltip boundary='window' target="clearFormBtn" triggers="hover" placement="top" ref="clearFormBtnTooltip" v-on:hide.prevent>
        {{phrases.clear}}
      </b-tooltip>

      <b-tooltip boundary='window' target="partitionInput" triggers="hover" placement="top" ref="partitionInputTooltip" :disabled.sync="disablePartitionTooltip" v-on:hide.prevent>
        {{partitionTooltipText}}
      </b-tooltip>

      <b-tooltip boundary='window' target="positionInput" triggers="hover" placement="top" ref="positionInputTooltip" :disabled.sync="disablePositionTooltip" v-on:hide.prevent>
        {{positionTooltipText}}
      </b-tooltip>

      <b-modal no-close-on-backdrop id="income-code-preview-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('incomeCodePreviewErrorModal')">
        <message-confirm-dialog ref="incomeCodePreviewErrorModal" parentModal="income-code-preview-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
      </b-modal>
  </b-container>
</template>

<script>
import MessageConfirmDialog from '../../../../MessageConfirmDialog'

const incomeCodeController = require('../../../../../controllers/incomeCodeController')
const i18n = require('../../../../../../translations/i18n')
const { partitionPositionNumberOptions, mapCodeToCodeForm, mapCodeFormToCode } = require('../../../../../utils/utils')
const AutoNumeric = require('autonumeric')
const Mousetrap = require('mousetrap');

export default {
  props: {
    existingIncomeCodes: {
      type: Array,
      default: []
    },
    incomeCode: Object,
    isUpdate: {
      type: Boolean,
      default: false
    },
    parentModal: String
  },
  data () {
    return {
      phrases: {
        save: i18n.getTranslation('Save'),
        clear: i18n.getTranslation('Clear'),
        enterPartition: i18n.getTranslation('Enter partition'),
        enterPosition: i18n.getTranslation('Enter position'),
        notUnique: i18n.getTranslation('Income code partition and position not unique'),
        ok: i18n.getTranslation('Ok')
      },
      form: { 
        partition: null, 
        position: null, 
        description: null
      },
      shouldValidate: false,
      errorText: "",
      partitionInputAutonumeric: null,
      positionInputAutonumeric: null,
      alreadySubmited: false,
      tooltipTimeouts: []
    }
  },
  created () {
    if (this.isUpdate) {
      this.form = mapCodeToCodeForm(JSON.parse(JSON.stringify(this.incomeCode)))
    }
  },
  mounted () {
    this.partitionInputAutonumeric = new AutoNumeric('#partitionInput', partitionPositionNumberOptions)
    this.positionInputAutonumeric = new AutoNumeric('#positionInput', partitionPositionNumberOptions)
    this.bindKeys()
  },
  beforeDestroy () {
    this.unbindKeys()
  },
  computed: {
    disablePartitionTooltip: {
      get: function () {
        return (!this.missingPartition && !this.notUnique) || !this.shouldValidate
      },
      set: function (newValue) {
        if (newValue) {
          this.hideTooltip('partitionInput')
        }
      }
    },
    disablePositionTooltip: {
      get: function () {
        return (!this.missingPosition && !this.notUnique) || !this.shouldValidate
      },
      set: function (newValue) {
        if (newValue) {
          this.hideTooltip('positionInput')
        }
      }
    },
    partitionTooltipText: function () {
        if (this.missingPartition) {
          return this.phrases.enterPartition
        } else if (this.notUnique) {
          return this.phrases.notUnique
        }
    },
    positionTooltipText: function () {
        if (this.missingPosition) {
          return this.phrases.enterPosition
        } else if (this.notUnique) {
          return this.phrases.notUnique
        }
    },
    missingPartition: function () {
      return !this.form.partition || this.form.partition.trim() === ''
    },
    missingPosition: function () {
      return !this.form.position || this.form.position.trim() === ''
    },
    notUnique: function () {
      const self = this
      var euqivalentInstance = this.existingIncomeCodes.filter(incomeCode => {
        return incomeCode.partition == self.form.partition && incomeCode.position == self.form.position && incomeCode._id != self.form._id
      })

      if (euqivalentInstance && euqivalentInstance.length > 0) {
        return true
      }
      return false
    }
  },
  methods: {
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
      Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
        self.$refs.saveIncomeCodeBtn.click()
        return false
      });
      Mousetrap.prototype.stopCallback = function () {
        return false
      }
    },
    unbindKeys() {
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
    onSubmit (evt) {
      evt.preventDefault();
      if (this.alreadySubmited) {
        return
      }
      this.shouldValidate = true;
      if (!this.isFormValid()) {
        this.showInvalidTooltips()
        return
      }
      const self = this;
      if (this.isUpdate) {
        this.alreadySubmited = true
        incomeCodeController.updateIncomeCode(mapCodeFormToCode(this.form)).then((res) => {
            if (!res.err) {
              this.shouldValidate = false;
              self.$emit('updateIncomeCodes')
              self.closeModal();
            } else {
              self.alreadySubmited = false
              self.openErrorModal(res.err)
            }
        })
      } else {
        this.alreadySubmited = true
        incomeCodeController.createIncomeCode(mapCodeFormToCode(this.form)).then((res) => {
            if (!res.err) {
              this.shouldValidate = false;
              self.$emit('updateIncomeCodes')
              self.closeModal();
            } else {
              self.alreadySubmited = false
              self.openErrorModal(res.err)
            }
        })
      }
    },
    isFormValid() {
      if(!this.missingPartition && !this.missingPosition && !this.notUnique) {
        return true
      }
      return false
    },
    clearForm () {
      this.form.partition = null;
      this.partitionInputAutonumeric.clear()
      this.form.position = null;
      this.positionInputAutonumeric.clear()
      this.form.description = null;
    },
    showInvalidTooltips () {
      if (this.missingPartition || this.notUnique) {
        this.showTooltip('partitionInput')
      } else if (this.missingPosition) {
        this.showTooltip('positionInput')
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
    openErrorModal(error) {
      this.errorText = error
      this.$root.$emit('bv::show::modal', 'income-code-preview-error-modal')
    },
    closeModal () {
        this.$root.$emit('bv::hide::modal', this.parentModal)
    }
  },
  components: { MessageConfirmDialog }
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
.partPosInput {
  width: 70px;
  max-width: 70px;
  border-style: none;
}
.descriptionInput {
  width: 340px;
  max-width: 340px;
  border-style: none;
}
</style>