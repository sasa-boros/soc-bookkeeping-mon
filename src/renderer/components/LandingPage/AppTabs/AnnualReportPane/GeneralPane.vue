<template>
  <b-container fluid>
    <b-form v-if="form" ref="annualReportDataForm" @submit="createAnnualReportData" novalidate no-validation>
      <b-row class="text-center">
        <b-col>
          <b-button id="annualReportDataSaveBtn" ref="annualReportDataSaveBtn" v-on:mouseleave="hideTooltip('annualReportDataSaveBtn')" :disabled="disableAnnualReportDataSaveBtn" type="submit" variant="light" class="btn-lg text-center">
            <img src="~@/assets/save.png">
          </b-button>
        </b-col> 
      </b-row>
      <br>
      <div class="predictedAllowedDiv">
        <h4 style="text-align:center">Буџетом предвиђено</h4>
        <div v-for="(ipcp, index) in form.totalIncomePerCodePredicted" v-bind:key="'ic' + index">
          <br>
          <b-row>
            <b-col cols='6'>
              <b>{{ asRomanNumber(ipcp.incomeCode.partition) + "/" + ipcp.incomeCode.position }}</b>&nbsp;&nbsp;&nbsp;{{ (ipcp.incomeCode.description ? ipcp.incomeCode.description : '') }} 
            </b-col>
            <b-col>
              <b-form-input v-on:cut="updateAfterCut" :id="'ic' + index" type="text" v-model="ipcp.income" class="predictedAllowedCodeAmountInput"/>
            </b-col>
          </b-row>
        </div>
      </div>
      <br>
      <div class="predictedAllowedDiv">
        <h4 style="text-align:center">Буџетом одобрено</h4>
        <div v-for="(opca, index) in form.totalOutcomePerCodeAllowed" v-bind:key="'oc' + index">
          <br>
          <b-row>
            <b-col cols='6'>
              <b>{{ asRomanNumber(opca.outcomeCode.partition) + "/" + opca.outcomeCode.position }}</b>&nbsp;&nbsp;&nbsp;{{ (opca.outcomeCode.description ? opca.outcomeCode.description : '') }} 
            </b-col>
            <b-col>
              <b-form-input v-on:cut="updateAfterCut" :id="'oc' + index" type="text" v-model="opca.outcome" class="predictedAllowedCodeAmountInput"/>
            </b-col>
          </b-row>
        </div>
      </div>
      <br>
      <br>
      <b-row>
        <b-col cols="6">
          Пренос готовине из претходне године (рез. фонд):
        </b-col>
        <b-col>
          <b-form-input v-on:cut="updateAfterCut" id="transferFromPreviousYearInput" type="text" v-model="form.transferFromPreviousYear"/>
        </b-col>
      </b-row>
      <br>
      <b-row>
        <b-col cols="6">
          Хартије од вредности - у току године отуђено (амортизовано):
        </b-col>
        <b-col>
          <b-form-input v-on:cut="updateAfterCut" id="shareValueDepreciatedDuringYearInput" type="text" v-model="form.shareValueDepreciatedDuringYear"/>
        </b-col>
      </b-row>
      <br>
      <b-row>
        <b-col cols="6">
          Некретнине: земљиште - вредност:
        </b-col>
        <b-col>
          <b-form-input v-on:cut="updateAfterCut" id="realEstateLandValueInput" type="text" v-model="form.realEstateLandValue"/>
        </b-col>
      </b-row>
      <br>
      <b-row>
        <b-col cols="6">
          Некретнине: зграде - вредност:
        </b-col>
        <b-col>
        <b-form-input v-on:cut="updateAfterCut" id="realEstateBuildingsValueInput" type="text" v-model="form.realEstateBuildingsValue"/>
        </b-col>
      </b-row>
        <br>
      <b-row>
        <b-col cols="6">
          Некретнине: земљиште - површина:
        </b-col>
        <b-col>
          <b-form-input id="realEstateLandSurfaceInput" type="text" v-model="form.realEstateLandSurface" v-on:keypress="limitInputPerSize"/>
        </b-col>
      </b-row>
        <br>
      <b-row>
        <b-col cols="6">
          Некретнине: зграде - површина:
        </b-col>
        <b-col>
          <b-form-input id="realEstateBuildingsSurfaceInput" type="text" v-model="form.realEstateBuildingsSurface" v-on:keypress="limitInputPerSize"/>
        </b-col>
      </b-row>
      <br>

      <b-tooltip boundary='window' target="annualReportDataSaveBtn" triggers="hover" placement="top" ref="annualReportDataSaveBtnTooltip" v-on:hide.prevent>
        {{phrases.save}}
      </b-tooltip>
    </b-form>

    <b-modal no-close-on-backdrop id="annual-report-pane-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('annualReportPaneErrorModal')">
      <message-confirm-dialog ref="annualReportPaneErrorModal" parentModal="annual-report-pane-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'
  import { EventBus } from '../../../../eventbus/event-bus.js';
  
  const annualReportController = require('../../../../controllers/annualReportController')
  const incomeCodeController = require('../../../../controllers/incomeCodeController')
  const outcomeCodeController = require('../../../../controllers/outcomeCodeController')
  const i18n = require('../../../../../translations/i18n')
  const AutoNumeric = require('autonumeric')
  const { largeAmountNumberOptions, asRoman, mapAnnualReportDataToAnnualReportDataForm, mapAnnualReportDataFormToAnnualReportData } = require('../../../../utils/utils')
  const _ = require('lodash')

  export default {
    data () {
      return {
        phrases: {
          save: i18n.getTranslation('Save')
        },
        form: null,
        formUnwatch: null,
        errorText: "",
        alreadyPressed: false,
        disableAnnualReportDataSaveBtn: true,
        updating: []
      }
    },
    created () {
      const self = this
      EventBus.$on('updateGeneralPane', () => {
        self.loadGeneralForm()
      })
      this.$watch('bookingYear', () => {
        self.loadGeneralForm()
      }, {immediate: true})
    },
    computed: {
      ...mapState(
        {
          bookingYear: state => state.CommonValues.bookingYear
        }
      ),
      computedForm() {
       return _.cloneDeep(this.form);
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
      asRomanNumber(num) {
        return asRoman(num)
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
      async loadGeneralForm () {
        const self = this
        this.updating.push(1)
        this.disableAnnualReportDataSaveBtn = true
        if (this.formUnwatch) {
          this.formUnwatch()
          this.formUnwatch = null
        }
        const annualReportData = await this.loadAnnualReportData()
        const incomeCodes = await this.loadIncomeCodes()
        const outcomeCodes = await this.loadOutcomeCodes()
        this.form = JSON.parse(JSON.stringify(mapAnnualReportDataToAnnualReportDataForm(annualReportData, incomeCodes, outcomeCodes)))
        this.formUnwatch = this.$watch('computedForm', (newForm, oldForm) => {
          if(!_.isEqual(newForm, oldForm) && this.updating.length == 0) {
            self.disableAnnualReportDataSaveBtn = false
          }
        }, {deep: true})
        this.$nextTick(() => {
          if (AutoNumeric.getAutoNumericElement('#transferFromPreviousYearInput') === null) {
            new AutoNumeric('#transferFromPreviousYearInput', largeAmountNumberOptions)
          }
          if (AutoNumeric.getAutoNumericElement('#shareValueDepreciatedDuringYearInput') === null) {
            new AutoNumeric('#shareValueDepreciatedDuringYearInput', largeAmountNumberOptions)
          }
          if (AutoNumeric.getAutoNumericElement('#realEstateLandValueInput') === null) {
            new AutoNumeric('#realEstateLandValueInput', largeAmountNumberOptions)
          }
          if (AutoNumeric.getAutoNumericElement('#realEstateBuildingsValueInput') === null) {
            new AutoNumeric('#realEstateBuildingsValueInput', largeAmountNumberOptions)
          }
          for (let i=0; i<self.form.totalIncomePerCodePredicted.length; i++) {
            if (AutoNumeric.getAutoNumericElement('#ic' + i) === null) {
              new AutoNumeric('#ic' + i, largeAmountNumberOptions)
            }
          }
          for (let i=0; i<self.form.totalOutcomePerCodeAllowed.length; i++) {
            if (AutoNumeric.getAutoNumericElement('#oc' + i) === null) {
              new AutoNumeric('#oc' + i, largeAmountNumberOptions)
            }
          }
        })
        this.updating.pop()
      },
      async loadAnnualReportData() {
        const self = this
        const annualReportDataRes = await annualReportController.getAnnualReportData(this.bookingYear)
        if (!annualReportDataRes.err) {
          return annualReportDataRes.data
        }
        self.openErrorModal(annualReportDataRes.err)
      },
      async loadIncomeCodes() {
        const self = this
        const incomeCodesRes = await incomeCodeController.getIncomeCodes(this.bookingYear)
        if (!incomeCodesRes.err) {
          return incomeCodesRes.data ? incomeCodesRes.data : []
        } 
        self.openErrorModal(incomeCodesRes.err)
      },
      async loadOutcomeCodes() {
        const self = this
        const outcomeCodesRes = await outcomeCodeController.getOutcomeCodes(this.bookingYear)
        if (!outcomeCodesRes.err) {
          return outcomeCodesRes.data ? outcomeCodesRes.data : []
        } 
        self.openErrorModal(outcomeCodesRes.err)
      },
      createAnnualReportData (evt) {
        evt.preventDefault()
        if (this.alreadyPressed) {
          return
        }
        const self = this
        this.alreadyPressed = true
        self.hideTooltip('annualReportDataSaveBtn')
        annualReportController.createAnnualReportData(mapAnnualReportDataFormToAnnualReportData(this.form)).then(function(res) {
          self.alreadyPressed = false
          if (!res.err) {
           self.disableAnnualReportDataSaveBtn = true
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
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
        this.$root.$emit('bv::show::modal', 'annual-report-pane-error-modal')
      },
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

#transferFromPreviousYearInput {
  width: 110px;
  max-width: 110px;
  border-style: none;
}

#shareValueDepreciatedDuringYearInput {
  width: 110px;
  max-width: 110px;
  border-style: none;
}

#realEstateBuildingsValueInput {
  width: 110px;
  max-width: 110px;
  border-style: none;
}

#realEstateBuildingsSurfaceInput {
  width: 200px;
  max-width: 200px;
  border-style: none;
}

#realEstateLandValueInput {
  width: 110px;
  max-width: 110px;
  border-style: none;
}

#realEstateLandSurfaceInput {
  width: 200px;
  max-width: 200px;
  border-style: none;
}

.predictedAllowedDiv {
  border-collapse:collapse;
  padding:20px;
  background-color:#e7f3fc;
}

.predictedAllowedCodeAmountInput {
  width: 110px;
  max-width: 110px;
  border-style: none;
  background-color:#e7f3fc;
}
.predictedAllowedCodeAmountInput:focus {
  background-color:#e7f3fc;
}
</style>