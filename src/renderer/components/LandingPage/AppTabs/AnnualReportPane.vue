<template>
  <b-container fluid>
      <b-form ref="annualReportDataForm" @submit="createAnnualReportData" novalidate no-validation>
      <b-row class="text-center" v-show="year">
        <b-col>
          Дневник благајне за годину:&nbsp;
          <b-form-select v-model="year" id="yearSelect" ref="yearSelect" :options="yearOptions" size="sm" class="my-0"/>
        </b-col> 
        <b-col>
            <b-button id="annualReportDataSaveBtn" ref="annualReportDataSaveBtn" :disabled="disableAnnualReportDataSaveBtn" v-on:mouseleave="hideTooltip('annualReportDataSaveBtn')" type="submit" variant="light" class="btn-lg text-center">
              <img src="~@/assets/save.png">
            </b-button>
            <b-button id="annualReportBtn" ref="annualReportBtn" v-on:mouseleave="hideTooltip('annualReportBtn')" v-on:click="createAnnualReport" :disabled="!disableAnnualReportDataSaveBtn" variant="light" class="btn-lg">
              <img src="~@/assets/annual-report.png">
            </b-button>
          </b-col> 
      </b-row>
        <hr>
        <br>
        <b-row>
          <b-col cols="5">
            Пренос готовине из претходне године (рез. фонд):
          </b-col>
          <b-col>
            <b-form-input v-on:cut="updateAfterCut" id="transferFromPreviousYearInput" type="text" v-model="form.transferFromPreviousYear"/>
          </b-col>
        </b-row>
        <br>
        <b-row>
          <b-col cols="5">
            Хартије од вредности - у току године отуђено (амортизовано):
          </b-col>
          <b-col>
            <b-form-input v-on:cut="updateAfterCut" id="shareValueDepreciatedDuringYearInput" type="text" v-model="form.shareValueDepreciatedDuringYear"/>
          </b-col>
        </b-row>
        <br>
        <b-row>
          <b-col cols="5">
            Некретнине: земљиште - вредност:
          </b-col>
          <b-col>
            <b-form-input v-on:cut="updateAfterCut" id="realEstateLandValueInput" type="text" v-model="form.realEstateLandValue"/>
          </b-col>
        </b-row>
        <br>
        <b-row>
          <b-col cols="5">
            Некретнине: зграде - вредност:
          </b-col>
          <b-col>
          <b-form-input v-on:cut="updateAfterCut" id="realEstateBuildingsValueInput" type="text" v-model="form.realEstateBuildingsValue"/>
          </b-col>
        </b-row>
         <br>
        <b-row>
          <b-col cols="5">
            Некретнине: земљиште - површина:
          </b-col>
          <b-col>
            <b-form-input id="realEstateLandSurfaceInput" type="text" v-model="form.realEstateLandSurface" v-on:keypress="limitInputPerSize"/>
          </b-col>
        </b-row>
         <br>
        <b-row>
          <b-col cols="5">
            Некретнине: зграде - површина:
          </b-col>
          <b-col>
            <b-form-input id="realEstateBuildingsSurfaceInput" type="text" v-model="form.realEstateBuildingsSurface" v-on:keypress="limitInputPerSize"/>
          </b-col>
        </b-row>
        <br>
        <br>
        <b-row>
          <b-col>
            <div class="predictedAllowedDivWrapper" style="padding-right:30px">
              Буџетом предвиђено - приходи:
              <br>
              <br>
              <div class="predictedAllowedDiv" v-for="(ipcp, index) in form.totalIncomePerCodePredicted" v-bind:key="'ic' + index">
                <div class="predictedAllowedLabelDiv">{{ asRomanNumber(ipcp.incomeCode.partition) + "/" + ipcp.incomeCode.position + "\n\n" + (ipcp.incomeCode.description ? ipcp.incomeCode.description : '')}}</div>
                <b-form-input v-on:cut="updateAfterCut" :id="'ic' + index" type="text" v-model="ipcp.income" class="codeAmountInput"/>
              </div>
            </div>
            <div class="predictedAllowedDivWrapper">
              Буџетом предвиђено - расходи:
              <br>
              <br>
              <div class="predictedAllowedDiv" v-for="(opcp, index) in form.totalOutcomePerCodeAllowed" v-bind:key="'oc' + index">
                <div class="predictedAllowedLabelDiv">{{ asRomanNumber(opcp.outcomeCode.partition) + "/" + opcp.outcomeCode.position + "\n\n" + (opcp.outcomeCode.description ? opcp.outcomeCode.description : '')}}</div>
                <b-form-input v-on:cut="updateAfterCut" :id="'oc' + index" type="text" v-model="opcp.outcome" class="codeAmountInput"/>
              </div>
            </div>
          </b-col>
        </b-row>
        <br>             
      </b-form>
      <!-- Annual report preview modal -->
      <b-modal no-close-on-backdrop hide-footer hide-header id="annual-report-preview-modal" size="ar">
        <annual-report-preview :year="year" :annualReportPages='annualReportPages' parentModal="annual-report-preview-modal"></annual-report-preview>
      </b-modal>

      <b-tooltip boundary='window' target="annualReportBtn" triggers="hover" placement="top" ref="annualReportBtnTooltip" v-on:hide.prevent>
        {{phrases.showAnnualReport}}
      </b-tooltip>

      <b-tooltip boundary='window' target="annualReportDataSaveBtn" triggers="hover" placement="top" ref="annualReportDataSaveBtnTooltip" v-on:hide.prevent>
        {{phrases.save}}
      </b-tooltip>

      <b-modal no-close-on-backdrop id="annual-report-preview-failed-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('annualReportPreviewFailedModal')">
        <message-confirm-dialog ref="annualReportPreviewFailedModal" parentModal="annual-report-preview-failed-modal" type="warning" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
      </b-modal>

      <b-modal no-close-on-backdrop id="annual-report-pane-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('annualReportPaneErrorModal')">
        <message-confirm-dialog ref="annualReportPaneErrorModal" parentModal="annual-report-pane-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
      </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import AnnualReportPreview from './AnnualReportPane/AnnualReportPreview'
  import MessageConfirmDialog from '../../MessageConfirmDialog'
  import { EventBus } from '../../../eventbus/event-bus.js';
  
  const annualReportController = require('../../../controllers/annualReportController')
  const incomeCodeController = require('../../../controllers/incomeCodeController')
  const outcomeCodeController = require('../../../controllers/outcomeCodeController')
  const i18n = require('../../../../translations/i18n')
  const { ipcRenderer } = require('electron')
  const AutoNumeric = require('autonumeric')
  const Mousetrap = require('mousetrap')
  const { largeAmountNumberOptions, asRoman, mapAnnualReportDataToAnnualReportDataForm, mapAnnualReportDataFormToAnnualReportData } = require('../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          showAnnualReport: i18n.getTranslation('Show annual report'),
          invalidPaymentSlipsOrReceiptsFound: i18n.getTranslation('Invalid payment slips or receipts found'),
          ok: i18n.getTranslation('Ok'),
          save: i18n.getTranslation('Save')
        },
        year: null,
        churchMunicipality: null,
        form: {
          totalIncomePerCodePredicted: [],
          totalOutcomePerCodePredicted: []
        },
        annualReportPages: [],
        errorText: "",
        alreadyPressed: false,
        formUnwatch: null,
        disableAnnualReportDataSaveBtn: true
      }
    },
    created () {
      const self = this
      EventBus.$on('updateAnnualReportPane', () => {
        self.loadAnnualReportDataForm()
      })
      this.$watch('year', () => {
        self.loadAnnualReportDataForm()
      })
      if (this.yearOptions && this.yearOptions.length > 0) {
        this.year = this.yearOptions[0]
      } else {
        this.year = new Date().getFullYear()
      }
      
    },
    computed: {
      ...mapState(
        {
          yearOptions: state => state.CommonValues.bookedYears
        }
      )
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
      async loadAnnualReportDataForm () {
        const self = this
        this.disableAnnualReportDataSaveBtn = true
          if (this.formUnwatch) {
            this.formUnwatch()
          }
          const annualReportData = JSON.parse(JSON.stringify(await this.loadAnnualReportData()))
          const incomeCodes = await this.loadIncomeCodes()
          const outcomeCodes = await this.loadOutcomeCodes()
          this.form = mapAnnualReportDataToAnnualReportDataForm(annualReportData, incomeCodes, outcomeCodes)
          self.formUnwatch = self.$watch('form', () => {
            self.disableAnnualReportDataSaveBtn = false
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
      },
      async loadAnnualReportData() {
        const self = this
        const annualReportDataRes = await annualReportController.getAnnualReportData(this.year)
        if (!annualReportDataRes.err) {
          return annualReportDataRes.data
        }
        self.openErrorModal(annualReportDataRes.err)
      },
      async loadIncomeCodes() {
        const self = this
        const incomeCodesRes = await incomeCodeController.getIncomeCodes()
        if (!incomeCodesRes.err) {
          return incomeCodesRes.data ? incomeCodesRes.data : []
        } 
        self.openErrorModal(incomeCodesRes.err)
      },
      async loadOutcomeCodes() {
        const self = this
        const outcomeCodesRes = await outcomeCodeController.getOutcomeCodes()
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
        annualReportController.createAnnualReportData(mapAnnualReportDataFormToAnnualReportData(this.form, this.year)).then(function(res) {
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
      createAnnualReport: function () {
         if (this.alreadyPressed) {
          return
        }
        const self = this
        annualReportController.getAnnualReport(this.year).then(function (res) {
          if (!res.err) {
             annualReportController.getAnnualReportPages(res.data).then(function (res) {
               self.alreadyPressed = false
               if (!res.err) {
                 self.annualReportPages = res.data ? res.data : []
                 self.hideTooltip('annualReportBtn')
                 self.openAnnualReportPreviewModal()
               } else {
                 self.openErrorModal(res.err)
                }
             })
          } else {
            self.alreadyPressed = false
            if (res.err == 'Invalid payment slips or receipts found') {
              self.openAnnualReportPreviewFailedModal(self.phrases.invalidPaymentSlipsOrReceiptsFound)
            } else {
              self.openErrorModal(res.err)
            }
          }
        })
      },
      hideTooltip (elementId) {
        if (elementId) {
          this.$root.$emit('bv::hide::tooltip', elementId)
        } else {
          this.$root.$emit('bv::hide::tooltip')
        }
      },
      openAnnualReportPreviewFailedModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'annual-report-preview-failed-modal')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'annual-report-pane-error-modal')
      },
      openAnnualReportPreviewModal() {
        this.$root.$emit('bv::show::modal', 'annual-report-preview-modal')
      }
    },
    components: { AnnualReportPreview, MessageConfirmDialog }
  }
</script>

<style>
  .modal .modal-ar {
    max-width: 1280px;
    width: 1280px;
    max-height:985px;
    height:985px;
    overflow: hidden;
  }
</style>

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

.predictedAllowedDivWrapper {
  width: 50%;
  float: left;
}

.predictedAllowedDiv {
  display:inline-block;
  border-collapse:collapse;
  margin-bottom:10px;
}

.predictedAllowedLabelDiv {
  width: 110px; 
  max-width: 110px;
  height: 145px; 
  max-height: 145px;
  white-space:pre-wrap; 
  word-wrap:break-word;
  hyphens:auto;
  text-align: center;
  vertical-align: top;
  overflow: hidden;
  box-shadow: 
  .5pt 0 0 0 #514A4A, 
  0 .5pt 0 0 #514A4A, 
  .5pt .5pt 0 0 #514A4A,
  .5pt 0 0 0 #514A4A inset, 
  0 .5pt 0 0 #514A4A inset;
}

.codeAmountInput {
  width: 110px;
  max-width: 110px;
  border-style: none;
  box-shadow: 
  .5pt 0 0 0 #514A4A, 
  0 .5pt 0 0 #514A4A, 
  .5pt .5pt 0 0 #514A4A,
  .5pt 0 0 0 #514A4A inset, 
  0 .5pt 0 0 #514A4A inset;
  text-align: center;
  font-family: "Times New Roman";
  font-size: 90%;
  letter-spacing: 95%;
  font-weight: bold;
  border-bottom:none !important;
  border-radius: 0 !important;
  height:30px !important;
}

#yearSelect {
  width: 95px;
  padding-left:5px;
  margin-bottom: 8px;
}
</style>