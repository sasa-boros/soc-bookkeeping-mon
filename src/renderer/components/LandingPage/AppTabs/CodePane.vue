<template>
  <b-container fluid>
    <br>
    <div class="incomeCodesTable">
      <h3 class="codeHeader">{{phrases.incomeCodes}}</h3>
      <p class="codeSubHeader">{{phrases.addedCodesAutomaticallySortedByPartPos}}</p>
      <income-codes-table v-on:updateDefaultPaymentSlip="updateDefaultPaymentSlip"></income-codes-table>
    </div>
    <br>
    <div>
      <h3 class="codeHeader">{{phrases.outcomeCodes}}</h3>
      <p class="codeSubHeader">{{phrases.addedCodesAutomaticallySortedByPartPos}}</p>
      <outcome-codes-table v-on:updateDefaultReceipt="updateDefaultReceipt"></outcome-codes-table>
    </div>
  </b-container>
</template>

<script>
  import IncomeCodesTable from './CodePane/IncomeCodesTable'
  import OutcomeCodesTable from './CodePane/OutcomeCodesTable'

  const i18n = require('../../../../translations/i18n')

  export default {
    data () {
      return {
        phrases: {
          incomeCodes: i18n.getTranslation('Income codes'),
          outcomeCodes: i18n.getTranslation('Outcome codes'),
          addedCodesAutomaticallySortedByPartPos: i18n.getTranslation('Added codes are being sorted automatically by partition and position')
        }
      }
    },
    methods: {
      updateDefaultPaymentSlip () {
        this.$emit('updateDefaultPaymentSlip')
      },
      updateDefaultReceipt () {
        this.$emit('updateDefaultReceipt')
      },
      hideTooltip (elementId) {
        if (elementId) {
          this.$root.$emit('bv::hide::tooltip', elementId)
        } else {
          this.$root.$emit('bv::hide::tooltip')
        }
      }
    },
    components: { IncomeCodesTable, OutcomeCodesTable }
  }
</script>

<style scoped>
  .incomeCodesTable {
    background-color:#e6f4ff; 
    overflow:auto;
  }
  .codeHeader {
    text-align: center;
  }
  .codeSubHeader {
    text-align: center;
    font-size: 10.0pt;
    color: #8e8e8e;
  }
</style>
