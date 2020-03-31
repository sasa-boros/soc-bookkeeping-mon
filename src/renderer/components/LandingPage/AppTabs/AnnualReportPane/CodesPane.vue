<template>
  <b-container fluid>
    <b-row>
      <b-col>
        Увези партије и позиције из претходне године:&nbsp;&nbsp;&nbsp;
        <b-button v-on:click="openImportWarningModal" id="importPartitionsAndPositionsBtn" ref="importPartitionsAndPositionsBtn" v-on:mouseleave="hideTooltip('importPartitionsAndPositionsBtn')" variant="light" class="btn-lg text-center">
          <img src="~@/assets/import.png">
        </b-button>
      </b-col> 
    </b-row>
    <br>
    <div class="incomeCodesTable">
      <h4 class="codeHeader">{{phrases.incomeCodes}}</h4>
      <p class="codeSubHeader">{{phrases.addedCodesAutomaticallySortedByPartPos}}</p>
      <income-codes-table ref="incomeCodesTable"></income-codes-table>
    </div>
    <div class="outcomeCodesTable">
      <h4 class="codeHeader">{{phrases.outcomeCodes}}</h4>
      <p class="codeSubHeader">{{phrases.addedCodesAutomaticallySortedByPartPos}}</p>
      <outcome-codes-table ref="outcomeCodesTable"></outcome-codes-table>
    </div>

    <b-tooltip boundary='window' target="importPartitionsAndPositionsBtn" triggers="hover" placement="top" ref="importPartitionsAndPositionsBtnTooltip" v-on:hide.prevent>
      {{phrases.importPartitionsAndPositions}}
    </b-tooltip>

    <b-modal no-close-on-backdrop id="code-pane-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('codePaneErrorModal')">
      <message-confirm-dialog ref="codePaneErrorModal" parentModal="code-pane-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="code-pane-import-confirm-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('codePaneImportConfirmModal')">
      <message-confirm-dialog ref="codePaneImportConfirmModal" parentModal="code-pane-import-confirm-modal" type="confirm" :text="phrases.areYouSureToImportPartitionsAndPositions" :subText="phrases.importConsequences" :cancelOkText="phrases.cancel" :confirmText="phrases.ok" v-on:confirmed="importPartitionsAndPositions"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import IncomeCodesTable from './CodePane/IncomeCodesTable'
  import OutcomeCodesTable from './CodePane/OutcomeCodesTable'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'

  import store from '@/store'
  import { mapState } from 'vuex'
  import { EventBus } from '../../../../eventbus/event-bus.js';

  const incomeCodeController = require('../../../../controllers/incomeCodeController')
  const outcomeCodeController = require('../../../../controllers/outcomeCodeController')

  const i18n = require('../../../../../translations/i18n')

  export default {
    data () {
      return {
        phrases: {
          incomeCodes: i18n.getTranslation('Income codes'),
          outcomeCodes: i18n.getTranslation('Outcome codes'),
          areYouSureToImportPartitionsAndPositions: i18n.getTranslation('Are you sure to import partitions and positions?'),
          importConsequences: i18n.getTranslation('Import partitions and positions consequences'),
          importPartitionsAndPositions: i18n.getTranslation('Import partitions and positions'),
          addedCodesAutomaticallySortedByPartPos: i18n.getTranslation('Added codes are being sorted automatically by partition and position'),
          ok: i18n.getTranslation('Ok'),
          cancel: i18n.getTranslation('Cancel')
        },
        errorText: null,
        alreadyPressed: false
      }
    },
    computed: {
      ...mapState(
        {
          bookingYear: state => state.CommonValues.bookingYear
        }
      ),
    },
    methods: {
      async importPartitionsAndPositions () {
        if (this.alreadyPressed) {
          return
        }
        this.alreadyPressed = true
        var importIncomeCodesRes = await incomeCodeController.importFromPreviousYear(this.bookingYear)
        if (importIncomeCodesRes.err) {
          this.openErrorModal(importIncomeCodesRes.err)
          this.alreadyPressed = false
          return
        }
        var importOutcomeCodesRes = await outcomeCodeController.importFromPreviousYear(this.bookingYear)
        if (importOutcomeCodesRes.err) {
          this.openErrorModal(importOutcomeCodesRes.err)
          this.alreadyPressed = false
          return
        }
        this.alreadyPressed = false
        this.$refs.incomeCodesTable.updateFromCodesPane()
        this.$refs.outcomeCodesTable.updateFromCodesPane()
        EventBus.$emit('updateGeneralPane')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'code-pane-error-modal')
      },
      openImportWarningModal() {
        this.$root.$emit('bv::show::modal', 'code-pane-import-confirm-modal')
      },
      hideTooltip (elementId) {
        if (elementId) {
          this.$root.$emit('bv::hide::tooltip', elementId)
        } else {
          this.$root.$emit('bv::hide::tooltip')
        }
      },
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
      },
    },
    components: { IncomeCodesTable, OutcomeCodesTable, MessageConfirmDialog }
  }
</script>

<style scoped>
  .incomeCodesTable {
    background-color:#e7f3fc; 
    overflow:auto;
    padding:20px;
  }
  .outcomeCodesTable {
    overflow:auto;
    padding:20px;
  }
  .codeHeader {
    text-align: center;
  }
  .codeSubHeader {
    text-align: center;
    font-size: 10.0pt;
    color: #888585;
  }
</style>
