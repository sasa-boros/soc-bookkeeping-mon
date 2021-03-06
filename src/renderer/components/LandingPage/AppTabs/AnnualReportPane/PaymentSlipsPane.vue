<template> 
  <b-container fluid>
     <b-row>
      <b-col cols="6">
        <b-button-group class="float-left">
          <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="addPaymentSlipBtn" v-on:mouseleave="hideTooltip('addPaymentSlipBtn')" v-b-tooltip.hover.top.window="{title: phrases.addPaymentSlip}" @click.stop="openCreatePaymentSlipModal" variant="light" class="btn-xs">
            <img src="~@/assets/add.png">               
          </b-btn>
        </b-button-group> 
        <b-button-group class="float-left">
          <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="deleteSelectedBtn" v-on:mouseleave="hideTooltip('deleteSelectedBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteSelected}" @click.stop="openDeleteCheckedPaymentSlipsModal()" :disabled="noRowChecked" variant="light" class="btn-xs">
            <img src="~@/assets/trash.png">               
          </b-btn>
        </b-button-group>
      </b-col>
      <b-col cols="6">
        <b-form-group class="float-right">
          <label :for="`monthSelect`" style="font-size:100%">{{phrases.filterByMonth}}: </label>
          &nbsp;
          <b-form-select v-model="monthToFilter" id="monthSelect" :options="monthOptions" size="sm" class="my-0"/>
        </b-form-group>
      </b-col>
    </b-row>

    <div class="tableDiv">
      <b-table show-empty hover small id="payment-slips-table" class="mt-3" fixed
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
              @row-dblclicked="rowDblClickHandler" 
              responsive
              head-variant="light"
              :empty-text="phrases.noRecordsToShow"
              :empty-filtered-text="phrases.noRecordsToShow"
              v-on:head-clicked="unsort"
      >
        <template v-slot:head(select)="row">
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox v-b-tooltip.hover.top.window="{title: phrases.selectAll}" v-on:change="toggleCheckAll" v-model="checkAll">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(preview)="row">
          <b-button-group>
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="updatePaymentSlipBtn" v-on:mouseleave="hideTooltip('updatePaymentSlipBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" @click.stop="openUpdatePaymentSlipModal(row.item, row.index)" variant="link" class="btn-xs">
              <img src="~@/assets/see-more.png" class="rowImg">                                           
            </b-button>
          </b-button-group>                
        </template>
        <template v-slot:cell(select)="row">
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox v-b-tooltip.hover.top.window="{title: phrases.select}" :id="row._id" :value="row.item" v-model="checkedPaymentSlips">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(ordinal)="row">{{ row.item.ordinal }}</template>
        <template v-slot:cell(income)="row">{{ row.item.income | formatIncome }}</template>
        <template v-slot:cell(reason)="row">{{ row.item.reason }}</template>
        <template v-slot:cell(formatedDate)="row">{{ row.item.date | formatDate }}</template>
        <template v-slot:cell(delete)="row">
          <b-button-group>
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="deletePaymentSlipBtn" v-on:mouseleave="hideTooltip('deletePaymentSlipBtn')" v-b-tooltip.hover.top.window="{title: phrases.deletePaymentSlip}" @click.stop="openDeletePaymentSlipModal(row.item)" variant="link" class="btn-xs">
              <img src="~@/assets/delete.png" class="rowImg">                                           
            </b-button>     
          </b-button-group>               
          <span v-show="!isValid(row.item)">
            <img v-on:mouseleave="hideTooltip('invalid' + row.item._id)" :id="'invalid' + row.item._id" src="~@/assets/invalid.png" class="invalidIcon">
            <b-tooltip boundary='window' :target="'invalid' + row.item._id" v-on:hide.prevent>
                {{phrases.invalidPaymentSlip}}
            </b-tooltip>
          </span>
        </template>
      </b-table>
    </div>

    <b-row>
      <b-col>
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="center" v-on:input="clearChecked(); clearRowHighlight()"/>
      </b-col>
    </b-row>

    <b-modal no-close-on-backdrop hide-footer hide-header size="a5" id="create-payment-slip-modal">
      <payment-slip-preview :paymentSlip='selectedItem' :paymentSlipPreview='isPreview' :existingPaymentSlips="paymentSlips" parentModal="create-payment-slip-modal" v-on:updatePaymentSlipTable="update(); highlightUpdatedRow()"></payment-slip-preview>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-payment-slip-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deletePaymentSlipModal')">
      <message-confirm-dialog ref="deletePaymentSlipModal" parentModal="delete-payment-slip-modal" type="confirm" :text="phrases.areYouSureToDeletePaymentSlip" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deletePaymentSlip"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-checked-payment-slips-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteCheckedPaymentSlipsModal')">
      <message-confirm-dialog ref="deleteCheckedPaymentSlipsModal" parentModal="delete-checked-payment-slips-modal" type="confirm" :text="phrases.areYouSureToDeleteCheckedPaymentSlips" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteCheckedPaymentSlips"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="payment-slip-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('paymentSlipTableErrorModal')">
      <message-confirm-dialog ref="paymentSlipTableErrorModal" parentModal="payment-slip-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import PaymentSlipPreview from './PaymentSlipsPane/PaymentSlipPreview'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'
  import { EventBus } from '../../../../eventbus/event-bus.js';
  
  const paymentSlipController = require('../../../../controllers/paymentSlipController')
  const i18n = require('../../../../../translations/i18n')
  const { asFormatedString, largeAmountNumberOptions } = require('../../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          addPaymentSlip: i18n.getTranslation('Add payment slip'),
          deletePaymentSlip: i18n.getTranslation('Delete payment slip'),
          deleteSelected: i18n.getTranslation('Delete selected'),
          seeDetails: i18n.getTranslation('See details'),
          town: i18n.getTranslation('Town'),
          income: i18n.getTranslation('Amount'),
          payed: i18n.getTranslation('Payed'),
          received: i18n.getTranslation('Received'),
          reason: i18n.getTranslation('Reason'),
          forDate: i18n.getTranslation('For date'),
          areYouSureToDeletePaymentSlip: i18n.getTranslation('Are you sure you want to delete payment slip?'),
          areYouSureToDeleteCheckedPaymentSlips: i18n.getTranslation('Are you sure you want to delete selected payment slips?'),
          noRecordsToShow: i18n.getTranslation('There are no payment slips to show'),
          filterByMonth: i18n.getTranslation('Filter by month'),
          invalidPaymentSlip: i18n.getTranslation('Invalid payment slip'),
          select: i18n.getTranslation('Select'),
          selectAll: i18n.getTranslation('Select all'),
          ok: i18n.getTranslation('Ok'),
          ordinal: i18n.getTranslation('Ordinal num')
        },
        paymentSlips: [],
        items: [],
        monthToFilter: '',
        currentPage: 1,
        perPage: 10,
        totalRows: null,
        filter: null,
        deletedPaymentSlip: null,
        checkedPaymentSlips: [],
        itemsShownInTable: [],
        checkAll: false,
        selectedItem: null,
        selectedItemIndex: null,
        isPreview: false,
        errorText: "",
        sortBy: null,
        sortDesc: true,
        sortDirection: 'desc',
        sortsPerHeader: null,
        monthOptions: [
          '',
          i18n.getTranslation('January.lokativ'), 
          i18n.getTranslation('February.lokativ'), 
          i18n.getTranslation('March.lokativ'),
          i18n.getTranslation('April.lokativ'), 
          i18n.getTranslation('May.lokativ'), 
          i18n.getTranslation('June.lokativ'),
          i18n.getTranslation('July.lokativ'),
          i18n.getTranslation('August.lokativ'),
          i18n.getTranslation('September.lokativ'),
          i18n.getTranslation('October.lokativ'),
          i18n.getTranslation('November.lokativ'),
          i18n.getTranslation('December.lokativ')
        ]
      }
    },
    created () {
      const self = this
      this.$watch('bookingYear', () => {
        self.update()
      }, {immediate: true})
      EventBus.$on('updatePaymentSlipTable', () => {
        this.update()
      });
    },
    computed: {
      ...mapState(
        {
          bookingYear: state => state.CommonValues.bookingYear
        }
      ),
      noRowChecked () {
        return this.checkedPaymentSlips.length === 0
      },
      fields () {
        return [
          { key: 'select', label: '', thStyle: {outline: 'none', width: '30px'} },
          { key: 'preview', label: '', thStyle: {outline: 'none', width: '70px'}  },
          { key: 'ordinal', label: this.phrases.ordinal, class: 'text-center', sortable:true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'income', label: this.phrases.income, class: 'text-center', sortable:true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'reason', label: this.phrases.reason, class: 'text-center', sortable:true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'formatedDate', label: this.phrases.forDate, class: 'text-center', sortable:true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'delete', label: '', thStyle: {outline: 'none', width: '100px'} }
        ]
      }
    },
    methods: {
      unfocusElementOnNonKeyboardEvent (e) {
        if (!e.relatedTarget) {
          e.target.blur()
        }
      },
      unsort (key, field, e) {
        this.clearRowHighlight();
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
        this.loadPaymentSlips()
        this.$emit('updateInvalidPaymentSlipsInfo')
        this.monthToFilter = ''
        this.clearChecked()
      },
      highlightUpdatedRow () {
        this.clearRowHighlight()
        if (this.sortsPerHeader != null) {
          return
        }

        var rowToHighlight
        if (this.selectedItem) {
          rowToHighlight = document.querySelector('#payment-slips-table tbody tr[aria-rowindex="' + ((this.currentPage - 1 ) * 10 + this.selectedItemIndex + 1) + '"]')
        } else {
          rowToHighlight = document.querySelector('#payment-slips-table tbody tr[aria-rowindex="1"]')
        }
        if (rowToHighlight) {
          rowToHighlight.style.setProperty('box-shadow', '0 1px 1px rgba(128, 147, 168, 0.075) inset, 0 0 8px rgba(128, 147, 168, 0.6)')
          this.highlightedRow = rowToHighlight
          this.highlightedRowTimeout = setTimeout(() => {
            rowToHighlight.style.setProperty('box-shadow', 'none')
          }, 1500)
        }
      },
      clearRowHighlight () {
        if (this.highlightedRow) {
          this.highlightedRow.style.setProperty('box-shadow', 'none')
        }
        if (this.highlightedRowTimeout) {
          window.clearTimeout(this.highlightedRowTimeout)
        }
      },
      clearChecked () {
        this.checkAll = false
        this.checkedPaymentSlips = []
      },
      loadPaymentSlips () {
        const self = this
        paymentSlipController.getPaymentSlips(this.bookingYear).then((res) => {
          if (!res.err) {
            self.paymentSlips = res.data ? res.data : []
            self.items = self.paymentSlips
            self.totalRows = self.paymentSlips.length
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openCreatePaymentSlipModal () {
        this.hideTooltip('addPaymentSlipBtn')
        this.isPreview = false
        this.selectedItem = null
        this.selectedItemIndex = null
        this.$root.$emit('bv::show::modal', 'create-payment-slip-modal')
      },
      toggleCheckAll () {
        /* Before the checkAll changes based on the click, so the logic is reversed in the check */
        this.checkedPaymentSlips = this.checkAll ? [] : this.itemsShownInTable
      },
      rowDblClickHandler (record, index) {
        this.openUpdatePaymentSlipModal(record, index)
      },
      isValid (paymentSlip) {
        return paymentSlip.isValid
      },
      openDeletePaymentSlipModal(paymentSlip) {
        this.hideTooltip('deletePaymentSlipBtn')
        this.deletedPaymentSlip = paymentSlip
        this.$root.$emit('bv::show::modal', 'delete-payment-slip-modal')
      },
      deletePaymentSlip () {
        const self = this
        paymentSlipController.deletePaymentSlip(this.deletedPaymentSlip._id, this.bookingYear).then((res) => {
          if (!res.err) {
            self.clearRowHighlight()
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openDeleteCheckedPaymentSlipsModal() {
        this.hideTooltip('deleteSelectedBtn')
        this.$root.$emit('bv::show::modal', 'delete-checked-payment-slips-modal')
      },
      deleteCheckedPaymentSlips () {
        var checkedPaymentSlipsIds = []
        this.checkedPaymentSlips.forEach(function (paymentSlip) {
          checkedPaymentSlipsIds.push(paymentSlip._id)
        })
        const self = this
        paymentSlipController.deletePaymentSlips(checkedPaymentSlipsIds, this.bookingYear).then((res) => {
          if (!res.err) {
            self.clearRowHighlight()
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openUpdatePaymentSlipModal (item, index) {
        this.hideTooltip('updatePaymentSlipBtn')
        this.selectedItem = item
        this.selectedItemIndex = index
        this.isPreview = true
        this.$root.$emit('bv::show::modal', 'create-payment-slip-modal')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'payment-slip-table-error-modal')
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
        const options = { month: 'long', day: 'numeric'}
        const language = i18n.usedLanguage
        return (new Date(date)).toLocaleDateString(language, options)
      },
      formatIncome (income) {
        return asFormatedString(income, largeAmountNumberOptions) + " дин."
      }
    },
    watch: {
      checkedPaymentSlips (newValue, oldValue) {
        this.checkAll = (this.itemsShownInTable.length !== 0 && this.itemsShownInTable.length === newValue.length)
        if (newValue.length === 0) {
          /* Close delete-selected button tooltip before it gets disabled and stuck */
          this.$root.$emit('bv::hide::tooltip', 'deleteSelectedBtn')
        }
      },
      monthToFilter (newMonthValue) {
        if(newMonthValue == '') {
          this.items = this.paymentSlips;
        } else {
          this.items = this.paymentSlips.filter(value => {
            if(new Date(value.date).getUTCMonth() == (this.monthOptions.indexOf(newMonthValue) - 1)) {
              return true;
            }
            return false;
          })
        }
        this.totalRows = this.items.length
        this.currentPage = 1
        this.checkedPaymentSlips = []
      }
    },
    components: { PaymentSlipPreview, MessageConfirmDialog }
  }
</script>

<style>
  .modal .modal-a5 {
    max-width: 830px;
    width: 830px;
  }
  .is-invalid {
    background: lightcoral;
  }
</style>

<style scoped>
  .tableDiv {
    display: block;
  }
  #monthSelect {
    width: 100px;
  }
</style>
