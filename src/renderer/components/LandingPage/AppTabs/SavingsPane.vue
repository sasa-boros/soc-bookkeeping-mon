<template>
  <b-container fluid>
    <br>
     <b-row>
      <b-col cols="6">
        <b-button-group class="float-left">
          <b-btn id="addSavingButton" v-on:mouseleave="hideTooltip('addSavingButton')" v-b-tooltip.hover.top.window="{title: phrases.addSaving}" @click.stop="openCreateSavingModal" variant="light" class="btn-xs">
            <img src="~@/assets/add.png">               
          </b-btn>
        </b-button-group> 
        <b-button-group class="float-left">
          <b-btn id="deleteSelectedBtn" v-on:mouseleave="hideTooltip('deleteSelectedBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteSelected}" @click.stop="openDeleteCheckedSavingsModal()" :disabled="noRowChecked" variant="light" class="btn-xs">
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
      <b-table show-empty hover small id="savings-table" class="mt-3"
              stacked="md"
              bordered
              :items="items"
              v-model="itemsShownInTable"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
              :filter="filter"
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
          <span>
            <b-form-checkbox v-on:change="toggleCheckAll" v-model="checkAll">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(preview)="row">
          <b-button-group>
            <b-button id="updateSavingBtn" v-on:mouseleave="hideTooltip('updateSavingBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" @click.stop="openUpdateSavingModal(row.item)" variant="link" class="btn-xs" style="position:relative; bottom:8px;">
              <img src="~@/assets/see-more.png">                                           
            </b-button>
          </b-button-group>                
        </template>
        <template v-slot:cell(select)="row">
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox :id="row._id" v-b-tooltip.hover.top.window="{title: phrases.select}" :value="row.item" v-model="checkedSavings">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(account)="row">{{ row.item.account }}</template>
        <template v-slot:cell(savingEntity)="row">{{ row.item.savingEntity }}</template>
        <template v-slot:cell(amount)="row">{{ row.item.amount | formatAmount }}</template>
        <template v-slot:cell(amountDeposited)="row">{{ row.item.amountDeposited | formatAmount }}</template>
        <template v-slot:cell(amountWithdrawn)="row">{{ row.item.amountWithdrawn | formatAmount }}</template>
        <template v-slot:cell(year)="row">{{ row.item.year }}</template>
        <template v-slot:cell(delete)="row">
          <b-button-group>
            <b-button id="deleteSavingBtn" v-on:mouseleave="hideTooltip('deleteSavingBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteSaving}" @click.stop="openDeleteSavingModal(row.item)" variant="link" class="btn-xs" style="position:relative; bottom:8px;">
              <img src="~@/assets/delete.png">                                           
            </b-button>     
          </b-button-group>                
        </template>
      </b-table>
    </div>

    <b-row>
      <b-col>
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" align="center" v-on:input="clearChecked"/>
      </b-col>
    </b-row>

    <b-modal no-close-on-backdrop hide-footer hide-header size="lg" id="create-saving-modal">
      <saving-preview :saving='selectedItem' :savingPreview='isPreview' parentModal="create-saving-modal" v-on:updateSavingsTable="update"></saving-preview>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-saving-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteSavingModal')">
      <message-confirm-dialog ref="deleteSavingModal" parentModal="delete-saving-modal" type="confirm" :text="phrases.areYouSureToDeleteSaving" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteSaving"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-checked-savings-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteCheckedSavingsModal')">
      <message-confirm-dialog ref="deleteCheckedSavingsModal" parentModal="delete-checked-savings-modal" type="confirm" :text="phrases.areYouSureToDeleteCheckedSavings" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteCheckedSavings"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="saving-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('savingTableErrorModal')">
        <message-confirm-dialog ref="savingTableErrorModal" parentModal="saving-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import SavingPreview from './SavingsPane/SavingPreview'
  import MessageConfirmDialog from '../../MessageConfirmDialog'

  const savingController = require('../../../controllers/savingController')
  const i18n = require('../../../../translations/i18n')
  const { asFormatedString, largeAmountNumberOptions } = require('../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          addSaving: i18n.getTranslation('Add saving'),
          deleteSaving: i18n.getTranslation('Delete saving'),
          deleteSelected: i18n.getTranslation('Delete selected'),
          seeDetails: i18n.getTranslation('See details'),
          filterByYear: i18n.getTranslation('Filter by year'),
          select: i18n.getTranslation('Select'),
          selectAll: i18n.getTranslation('Select all'),
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          ok: i18n.getTranslation('Ok'),
          areYouSureToDeleteSaving: i18n.getTranslation('Are you sure you want to delete saving?'),
          areYouSureToDeleteCheckedSavings: i18n.getTranslation('Are you sure you want to delete selected savings?'),
          noRecordsToShow: i18n.getTranslation('There are no savings to show'),
          year: i18n.getTranslation('Year'),
          account: i18n.getTranslation('Account'),
          savingEntity: i18n.getTranslation('Saving entity'),
          amount: i18n.getTranslation('Amount on year start'),
          amountDeposited: i18n.getTranslation('Amount deposited during the course of the year'),
          amountWithdrawn: i18n.getTranslation('Amount withdrawn during the course of the year')
        },
        savings: [],
        items: [],
        yearToFilter: '',
        currentPage: 1,
        perPage: 10,
        totalRows: null,
        filter: null,
        deletedSavings: null,
        checkedSavings: [],
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
      this.loadSavings()
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
        return this.checkedSavings.length === 0
      },
      fields () {
        return [
          { key: 'select', label: '', thStyle: {outline: 'none'} },
          { key: 'preview', label: '', thStyle: {outline: 'none'}  },
          { key: 'account', label: this.phrases.account, class: 'text-center', thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'savingEntity', label: this.phrases.savingEntity, class: 'text-center', thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'amount', label: this.phrases.amount, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'amountDeposited', label: this.phrases.amountDeposited, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'amountWithdrawn', label: this.phrases.amountWithdrawn, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'year', label: this.phrases.year, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'delete', label: '', thStyle: {outline: 'none'} },
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
        this.loadSavings()
        this.$emit('updateBookedYears')
        this.yearToFilter = ''
        this.clearChecked()
      },
      clearChecked () {
        this.checkAll = false
        this.checkedSavings = []
      },
      loadSavings () {
        const self = this
        savingController.getSavings().then((res) => {
          if (!res.err) {
            self.savings = res.data ? res.data : []
            self.items = self.savings
            self.totalRows = self.savings.length
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openCreateSavingModal () {
        this.hideTooltip('addSavingBtn')
        this.isPreview = false
        this.selectedItem = null
        this.$root.$emit('bv::show::modal', 'create-saving-modal')
      },
      toggleCheckAll () {
        this.checkedSavings = this.checkAll ? [] : this.itemsShownInTable
      },
      rowDblClickHandler (record, index) {
        this.openUpdateSavingModal(record)
      },
      openDeleteSavingModal(saving) {
        this.hideTooltip('deleteSavingBtn')
        this.deletedSaving = saving
        this.$root.$emit('bv::show::modal', 'delete-saving-modal')
      },
      deleteSaving () {
        const self = this
        savingController.deleteSaving(this.deletedSaving._id).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openDeleteCheckedSavingsModal() {
        this.hideTooltip('deleteSelectedBtn')
        this.$root.$emit('bv::show::modal', 'delete-checked-savings-modal')
      },
      deleteCheckedSavings () {
        var checkedSavingsIds = []
        this.checkedSavings.forEach(function (saving) {
          checkedSavingsIds.push(saving._id)
        })
        const self = this
        savingController.deleteSavings(checkedSavingsIds).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openUpdateSavingModal (item) {
        this.hideTooltip('updateSavingBtn')
        this.selectedItem = item
        this.isPreview = true
        this.$root.$emit('bv::show::modal', 'create-saving-modal')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'saving-table-error-modal')
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
      checkedSavings (newValue, oldValue) {
        this.checkAll = (this.itemsShownInTable.length !== 0 && this.itemsShownInTable.length === newValue.length)
        if (newValue.length === 0) {
          /* Close delete-selected button tooltip before it gets disabled and stuck */
          this.$root.$emit('bv::hide::tooltip', 'deleteSelectedBtn')
        }
      },
      yearToFilter (newYearValue) {
        if(newYearValue == '') {
          this.items = this.savings;
        } else {
          this.items = this.savings.filter(value => {
            if(value.year == newYearValue) {
              return true;
            }
            return false;
          })
        }
        this.totalRows = this.items.length
        this.currentPage = 1
        this.checkedSavings = []
      }
    },
    components: { SavingPreview, MessageConfirmDialog }
  }
</script>

<style scoped>
  #yearSelect{
    width: 80px;
    display: inline;
  }
  .tableDiv {
    display: block;
    overflow: auto;
  }
</style>
