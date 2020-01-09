<template> 
  <b-container fluid>
     <br>
     <b-row>
      <b-col cols="6">
        <b-button-group class="float-left">
          <b-btn id="addReceiptBtn" v-on:mouseleave="hideTooltip('addReceiptBtn')" v-b-tooltip.hover.top.window="{title: phrases.addReceipt}" @click.stop="openCreateReceiptModal" variant="light" class="btn-xs">
            <img src="~@/assets/add.png">               
          </b-btn>
        </b-button-group>
        <b-button-group class="float-left">
          <b-btn id="deleteSelectedBtn" v-on:mouseleave="hideTooltip('deleteSelectedBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteSelected}" @click.stop="openDeleteCheckedReceiptsModal" :disabled="noRowChecked" :class="{disabledBtn : noRowChecked}" variant="light" class="btn-xs">
            <img src="~@/assets/trash.png">               
          </b-btn>
        </b-button-group> 
      </b-col>
      <b-col cols="6">
        <b-form-group class="float-right">
          <label :for="`yearSelect`">{{phrases.filterByYear}}: </label>
          &nbsp;
          <b-form-select v-model="yearToFilter" id="yearSelect" :options="yearOptions" size="sm" class="my-0"/>
        </b-form-group>
      </b-col>
    </b-row>

    <div class="tableDiv">
      <b-table show-empty hover small id="receipts-table" class="mt-3"
              stacked="md"
              bordered
              :items="items"
              v-model="itemsShownInTable"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
              :filter="filter"
              :sort-compare="sortCompare"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              :sort-direction="sortDirection"
              :no-provider-sorting="true"
              :no-provider-filtering="true"
              :no-provider-paging="true"
                head-variant="light"
              @row-dblclicked="rowDblClickHandler" 
              responsive
              :empty-text="phrases.noRecordsToShow"
              :empty-filtered-text="phrases.noRecordsToShow"
              v-on:head-clicked="unsort"
      >
        <template v-slot:head(select)="row">
          <span>
            <b-form-checkbox v-on:change="toggleCheckAll" v-model="checkAll">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(preview)="row">
          <b-button-group>
            <b-button id="updateReceiptBtn" v-on:mouseleave="hideTooltip('updateReceiptBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" @click.stop="openUpdateReceiptModal(row.item)" variant="link" class="btn-xs" style="position:relative; bottom:8px;">
              <img src="~@/assets/see-more.png">                                           
            </b-button>
          </b-button-group>                
        </template>
        <template v-slot:cell(select)="row">
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox :id="row._id" v-b-tooltip.hover.top.window="{title: phrases.select}" :value="row.item" v-model="checkedReceipts">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(outcome)="row">{{ row.item.outcome | formatOutcome }}</template>
        <template v-slot:cell(reason)="row">{{ row.item.reason }}</template>
        <template v-slot:cell(formatedDate)="row">{{ row.item.date | formatDate }}</template>
        <template v-slot:cell(delete)="row">
          <b-button-group>
            <b-button id="deleteReceiptBtn" v-on:mouseleave="hideTooltip('deleteReceiptBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteReceipt}" @click.stop="openDeleteReceiptModal(row.item)" variant="link" class="btn-xs" style="position:relative; bottom:8px;">
              <img src="~@/assets/delete.png">                                           
            </b-button>     
          </b-button-group>                
          <span v-show="!isValid(row.item)">
            <img v-on:mouseleave="hideTooltip('invalid' + row.item._id)" :id="'invalid' + row.item._id" src="~@/assets/invalid.png" class="invalidIcon">
            <b-tooltip boundary='window' :target="'invalid' + row.item._id" v-on:hide.prevent>
                {{phrases.invalidReceipt}}
            </b-tooltip>
          </span>
        </template>
      </b-table>
    </div>

    <b-row>
      <b-col>
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="center" v-on:input="clearChecked"/>
      </b-col>
    </b-row>

    <b-modal no-close-on-backdrop hide-footer hide-header size="a5" id="create-receipt-modal">
      <receipt-preview :receipt='selectedItem' :receiptPreview='isPreview' parentModal="create-receipt-modal" v-on:updateReceiptTable="update"></receipt-preview>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-receipt-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteReceiptModal')">
      <message-confirm-dialog ref="deleteReceiptModal" parentModal="delete-receipt-modal" type="confirm" :text="phrases.areYouSureToDeleteReceipt" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteReceipt"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-checked-receipts-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteCheckedReceiptsModal')">
      <message-confirm-dialog ref="deleteCheckedReceiptsModal" parentModal="delete-checked-receipts-modal" type="confirm" :text="phrases.areYouSureToDeleteCheckedReceipts" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteCheckedReceipts"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="receipt-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('receiptTableErrorModal')">
        <message-confirm-dialog ref="receiptTableErrorModal" parentModal="receipt-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import ReceiptPreview from './ReceiptsPane/ReceiptPreview'
  import MessageConfirmDialog from '../../MessageConfirmDialog'
  import { EventBus } from '../../../eventbus/event-bus.js';
  
  const receiptController = require('../../../controllers/receiptController')
  const i18n = require('../../../../translations/i18n')
  const { asFormatedString, largeAmountNumberOptions } = require('../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          addReceipt: i18n.getTranslation('Add receipt'),
          deleteReceipt: i18n.getTranslation('Delete receipt'),
          deleteSelected: i18n.getTranslation('Delete selected'),
          seeDetails: i18n.getTranslation('See details'),
          town: i18n.getTranslation('Town'),
          outcome: i18n.getTranslation('Amount'),
          payed: i18n.getTranslation('Payed'),
          received: i18n.getTranslation('Received'),
          reason: i18n.getTranslation('Reason'),
          forDate: i18n.getTranslation('For date'),
          areYouSureToDeleteReceipt: i18n.getTranslation('Are you sure you want to delete receipt?'),
          areYouSureToDeleteCheckedReceipts: i18n.getTranslation('Are you sure you want to delete selected receipts?'),
          noRecordsToShow: i18n.getTranslation('There are no receipts to show'),
          filterByYear: i18n.getTranslation('Filter by year'),
          invalidReceipt: i18n.getTranslation('Invalid receipt'),
          select: i18n.getTranslation('Select'),
          selectAll: i18n.getTranslation('Select all'),
          ok: i18n.getTranslation('Ok')
        },
        receipts: [],
        items: [],
        yearToFilter: '',
        currentPage: 1,
        perPage: 10,
        totalRows: null,
        filter: null,
        deletedReceipt: null,
        checkedReceipts: [],
        itemsShownInTable: [],
        checkAll: false,
        selectedItem: null,
        isPreview: false,
        errorText: "",
        sortBy: null,
        sortDesc: true,
        sortDirection: 'desc',
        sortsPerHeader: null
      }
    },
    created () {
      this.loadReceipts()
      EventBus.$on('updateReceiptTable', () => {
        this.update()
        this.$emit('updateInvalidReceiptsInfo')
      });
    },
    computed: {
      ...mapState(
        {
          yearOptions: function (state) {
            var yearOptions = JSON.parse(JSON.stringify(state.CommonValues.bookedYears))
            yearOptions.unshift('')
            var yearToFilter = this.yearToFilter
            if (yearToFilter != '') {
              var yearFiltered = yearOptions.find(yo => {
                return yo == yearToFilter
              })
              if (!yearFiltered) {
                this.yearToFilter = ''
              }
            }
            return yearOptions
          }
        }
      ),
      noRowChecked () {
        return this.checkedReceipts.length === 0
      },
      fields () {
        return [
          { key: 'select', label: '', thStyle: {outline: 'none'} },
          { key: 'preview', label: '', thStyle: {outline: 'none'} },
          { key: 'outcome', label: this.phrases.outcome, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'reason', label: this.phrases.reason, class: 'text-center', thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'formatedDate', label: this.phrases.forDate, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'delete', label: '', thStyle: {outline: 'none'} }
        ]
      }
    },
    methods: {
      unsort (key, field, e) {
        e.stopPropagation()
        if (!field.sortable) {
          this.sortsPerHeader = null
          return
        }
        if (this.sortsPerHeader && this.sortsPerHeader.key == key) {
          if (this.sortsPerHeader.value >= 2) {
            this.sortsPerHeader = null
            this.sortBy = null
          } else {
            this.sortsPerHeader.value += 1
          }
        } else {
          this.sortsPerHeader = {key: key, value: 1}
        }
      },
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
      },
      update() {
        this.loadReceipts()
        this.$emit('updateBookedYears')
        this.$emit('updateInvalidReceiptsInfo')
        this.yearToFilter = ''
        this.clearChecked()
      },
      clearChecked () {
        this.checkAll = false
        this.checkedReceipts = []
      },
      loadReceipts () {
        const self = this
        receiptController.getReceipts().then((res) => {
          if (!res.err) {
            self.receipts = res.data ? res.data : []
            self.items = self.receipts
            self.totalRows = self.receipts.length
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openCreateReceiptModal () {
        this.hideTooltip('addReceiptBtn')
        this.isPreview = false;
        this.selectedItem = null;
        this.$root.$emit('bv::show::modal', 'create-receipt-modal')
      },
      toggleCheckAll () {
        /* Before the checkAll changes based on the click, so the logic is reversed in the check */
        this.checkedReceipts = this.checkAll ? [] : this.itemsShownInTable
      },
      rowDblClickHandler (record, index) {
        this.openUpdateReceiptModal(record)
      },
      isValid (receipt) {
        return receipt.isValid
      },
      openDeleteReceiptModal(receipt) {
        this.hideTooltip('deleteReceiptBtn')
        this.deletedReceipt = receipt
        this.$root.$emit('bv::show::modal', 'delete-receipt-modal')
      },
      deleteReceipt () {
        const self = this
        receiptController.deleteReceipt(this.deletedReceipt._id).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openDeleteCheckedReceiptsModal() {
        this.hideTooltip('deleteSelectedBtn')
        this.$root.$emit('bv::show::modal', 'delete-checked-receipts-modal')
      },
      deleteCheckedReceipts () {
        var checkedReceiptsIds = []
        this.checkedReceipts.forEach(function (receipt) {
          checkedReceiptsIds.push(receipt._id)
        })
        const self = this
        receiptController.deleteReceipts(checkedReceiptsIds).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openUpdateReceiptModal (item) {
        this.hideTooltip('updateReceiptBtn')
        this.isPreview = true
        this.selectedItem = item
        this.$root.$emit('bv::show::modal', 'create-receipt-modal')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'receipt-table-error-modal')
      },
      hideTooltip (elementId) {
        if (elementId) {
          this.$root.$emit('bv::hide::tooltip', elementId)
        } else {
          this.$root.$emit('bv::hide::tooltip')
        }
      },
      resetSelectedItem () {
        this.selectedItem = null
      },
      sortCompare(aRow, bRow, key, sortDesc, formatter, compareOptions, compareLocale) {
        var a,b
        if(key == 'formatedDate') {
          a = Date.parse(aRow['date'])
          b = Date.parse(bRow['date'])
        } else {
          a = aRow[key]
          b = bRow[key]
        }
        if (
          (typeof a === 'number' && typeof b === 'number') ||
          (a instanceof Date && b instanceof Date)
        ) {
          // If both compared fields are native numbers or both are native dates
          return a < b ? -1 : a > b ? 1 : 0
        } else {
          return this.toString(a).localeCompare(this.toString(b))
        }
      },
      toString(value) {
        if (value === null || typeof value === 'undefined') {
          return ''
        } else if (value instanceof Object) {
          return Object.keys(value)
            .sort()
            .map(key => toString(value[key]))
            .join(' ')
        } else {
          return String(value)
        }
      }
    },
    filters: {
      formatDate (date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        const language = i18n.usedLanguage
        return (new Date(date)).toLocaleDateString(language, options)
      },
      formatOutcome (outcome) {
        return asFormatedString(outcome, largeAmountNumberOptions) + " дин."
      }
    },
    watch: {
      checkedReceipts (newValue, oldValue) {
        this.checkAll = (this.itemsShownInTable.length !== 0 && this.itemsShownInTable.length === newValue.length)
        if (newValue.length === 0) {
          /* Close delete-selected button tooltip before it gets disabled and stuck */
          this.$root.$emit('bv::hide::tooltip', 'deleteSelectedBtn')
        }
      },
      yearToFilter (newYearValue) {
        if(newYearValue == '') {
          this.items = this.receipts;
        } else {
          this.items = this.receipts.filter(value => {
            if(new Date(value.date).getUTCFullYear() == newYearValue) {
              return true;
            }
            return false;
          })
        }
        this.totalRows = this.items.length
        this.currentPage = 1
        this.checkedReceipts = []
      }
    },
    components: { ReceiptPreview, MessageConfirmDialog }
  }
</script>

<style>
  .modal .modal-a5 {
    max-width: 830px;
    width: 830px;
  }
</style>

<style scoped>
  .disabledBtn {
    background-color: gray;
  }
  .tableDiv {
    display: block;
    overflow: auto;
  }
  #perPageSelect{
    width: 60px;
  }
  #yearSelect{
    width: 80px;
    display: inline;
  }
  #filterInputFormGroup{
    width: 200px;
    display: inline;
  }
</style>
