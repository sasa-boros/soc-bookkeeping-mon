<template>
  <b-container fluid>
     <b-row>
      <b-col cols="6">
        <b-button-group class="float-left">
          <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="addDebtButton" v-on:mouseleave="hideTooltip('addDebtButton')" v-b-tooltip.hover.top.window="{title: phrases.addDebt}" @click.stop="openCreateDebtModal" variant="light" class="btn-xs">
            <img src="~@/assets/add.png">               
          </b-btn>
        </b-button-group> 
        <b-button-group class="float-left">
          <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="deleteSelectedBtn" v-on:mouseleave="hideTooltip('deleteSelectedBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteSelected}" @click.stop="openDeleteCheckedDebtsModal()" :disabled="noRowChecked" variant="light" class="btn-xs">
            <img src="~@/assets/trash.png">               
          </b-btn>
        </b-button-group>
      </b-col>
    </b-row>

    <div class="tableDiv">
      <b-table show-empty hover small id="debts-table" class="mt-3" fixed
              stacked="md"
              bordered
              :items="items"
              v-model="itemsShownInTable"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
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
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="updateDebtBtn" v-on:mouseleave="hideTooltip('updateDebtBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" @click.stop="openUpdateDebtModal(row.item, row.index)" variant="link" class="btn-xs">
              <img src="~@/assets/see-more.png" class="rowImg">                                           
            </b-button>
          </b-button-group>                
        </template>
        <template v-slot:cell(select)="row">
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox :id="row._id" v-b-tooltip.hover.top.window="{title: phrases.select}" :value="row.item" v-model="checkedDebts">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(description)="row">{{ row.item.description }}</template>
        <template v-slot:cell(amount)="row">{{ row.item.amount | formatAmount }}</template>
        <template v-slot:cell(delete)="row">
          <b-button-group>
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="deleteDebtBtn" v-on:mouseleave="hideTooltip('deleteDebtBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteDebt}" @click.stop="openDeleteDebtModal(row.item)" variant="link" class="btn-xs">
              <img src="~@/assets/delete.png" class="rowImg">                                           
            </b-button>     
          </b-button-group>                
        </template>
      </b-table>
    </div>

    <b-row>
      <b-col>
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="center" v-on:input="clearChecked(); clearRowHighlight()"/>
      </b-col>
    </b-row>

    <b-modal no-close-on-backdrop hide-footer hide-header size="lg" id="create-debt-modal">
      <debt-preview :debt='selectedItem' :debtPreview='isPreview' parentModal="create-debt-modal" v-on:updateDebtsTable="update(); highlightUpdatedRow()"></debt-preview>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-debt-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteDebtModal')">
      <message-confirm-dialog ref="deleteDebtModal" parentModal="delete-debt-modal" type="confirm" :text="phrases.areYouSureToDeleteDebt" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteDebt"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-checked-debts-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteCheckedDebtsModal')">
      <message-confirm-dialog ref="deleteCheckedDebtsModal" parentModal="delete-checked-debts-modal" type="confirm" :text="phrases.areYouSureToDeleteCheckedDebts" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteCheckedDebts"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="debt-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('debtTableErrorModal')">
        <message-confirm-dialog ref="debtTableErrorModal" parentModal="debt-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import DebtPreview from './DebtsPane/DebtPreview'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'

  const debtController = require('../../../../controllers/debtController')
  const i18n = require('../../../../../translations/i18n')
  const { asFormatedString, largeAmountNumberOptions } = require('../../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          addDebt: i18n.getTranslation('Add debt'),
          deleteDebt: i18n.getTranslation('Delete debt'),
          deleteSelected: i18n.getTranslation('Delete selected'),
          seeDetails: i18n.getTranslation('See details'),
          select: i18n.getTranslation('Select'),
          selectAll: i18n.getTranslation('Select all'),
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          ok: i18n.getTranslation('Ok'),
          areYouSureToDeleteDebt: i18n.getTranslation('Are you sure you want to delete debt?'),
          areYouSureToDeleteCheckedDebts: i18n.getTranslation('Are you sure you want to delete selected debts?'),
          noRecordsToShow: i18n.getTranslation('There are no debts to show'),
          description: i18n.getTranslation('Description'),
          amount: i18n.getTranslation('Amount')
        },
        debts: [],
        items: [],
        currentPage: 1,
        perPage: 10,
        totalRows: null,
        checkedDebts: [],
        itemsShownInTable: [],
        checkAll: false,
        selectedItem: null,
        selectedItemIndex: null,
        isPreview: false,
        errorText: "",
        sortBy: null,
        sortDesc: true,
        sortDirection: 'desc',
        sortsPerHeader: null
      }
    },
    created () {
      const self = this
      this.$watch('bookingYear', () => {
        self.loadDebts()
      }, {immediate: true})
    },
    computed: {
      ...mapState(
        {
          bookingYear: state => state.CommonValues.bookingYear
        }
      ),
      noRowChecked () {
        return this.checkedDebts.length === 0
      },
      fields () {
        return [
          { key: 'select', label: '', thStyle: {outline: 'none', width: '30px'} },
          { key: 'preview', label: '', thStyle: {outline: 'none', width: '70px'}  },
          { key: 'description', label: this.phrases.description, class: 'text-center', thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'amount', label: this.phrases.amount, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'delete', label: '', thStyle: {outline: 'none', width: '70px'} },
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
        this.loadDebts()
        this.clearChecked()
      },
      highlightUpdatedRow () {
        this.clearRowHighlight()

        var rowToHighlight
        if (this.selectedItem) {
          rowToHighlight = document.querySelector('#debts-table tbody tr[aria-rowindex="' + ((this.currentPage - 1 ) * 10 + this.selectedItemIndex + 1) + '"]')
        } else {
          rowToHighlight = document.querySelector('#debts-table tbody tr[aria-rowindex="1"]')
        }
        if (rowToHighlight) {
          rowToHighlight.style.setProperty('box-shadow', '0 1px 1px rgba(128, 147, 168, 0.075) inset, 0 0 8px rgba(128, 147, 168, 0.6)')
          this.highlightedRow = rowToHighlight
          this.highlightedRowTimeout = setTimeout(() => {
            rowToHighlight.style.setProperty('box-shadow', 'none')
          }, 2500)
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
        this.checkedDebts = []
      },
      loadDebts () {
        const self = this
        debtController.getDebts(this.bookingYear).then((res) => {
          if (!res.err) {
            self.debts = res.data ? res.data : []
            self.items = self.debts
            self.totalRows = self.debts.length
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openCreateDebtModal () {
        this.hideTooltip('addDebtBtn')
        this.isPreview = false
        this.selectedItem = null
        this.selectedItemIndex = null
        this.$root.$emit('bv::show::modal', 'create-debt-modal')
      },
      toggleCheckAll () {
        this.checkedDebts = this.checkAll ? [] : this.itemsShownInTable
      },
      rowDblClickHandler (record, index) {
        this.openUpdateDebtModal(record, index)
      },
      openDeleteDebtModal(debt) {
        this.hideTooltip('deleteDebtBtn')
        this.deletedDebt = debt
        this.$root.$emit('bv::show::modal', 'delete-debt-modal')
      },
      deleteDebt () {
        const self = this
        debtController.deleteDebt(this.deletedDebt._id).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openDeleteCheckedDebtsModal() {
        this.hideTooltip('deleteSelectedBtn')
        this.$root.$emit('bv::show::modal', 'delete-checked-debts-modal')
      },
      deleteCheckedDebts () {
        var checkedDebtsIds = []
        this.checkedDebts.forEach(function (debt) {
          checkedDebtsIds.push(debt._id)
        })
        const self = this
        debtController.deleteDebts(checkedDebtsIds).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openUpdateDebtModal (item, index) {
        this.hideTooltip('updateDebtBtn')
        this.selectedItem = item
        this.selectedItemIndex = index
        this.isPreview = true
        this.$root.$emit('bv::show::modal', 'create-debt-modal')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'debt-table-error-modal')
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
      }
    },
    filters: {
      formatAmount (amount) {
        return asFormatedString(amount, largeAmountNumberOptions) + " дин."
      }
    },
    watch: {
      checkedDebts (newValue, oldValue) {
        this.checkAll = (this.itemsShownInTable.length !== 0 && this.itemsShownInTable.length === newValue.length)
        if (newValue.length === 0) {
          /* Close delete-selected button tooltip before it gets disabled and stuck */
          this.$root.$emit('bv::hide::tooltip', 'deleteSelectedBtn')
        }
      }
    },
    components: { DebtPreview, MessageConfirmDialog }
  }
</script>

<style scoped>
  .tableDiv {
    display: block;
  }
</style>
