<template>
  <b-container fluid>
    <br>
     <b-row>
      <b-col cols="6">
        <b-button-group class="float-left">
          <b-btn id="addItemButton" v-on:mouseleave="hideTooltip('addItemButton')" v-b-tooltip.hover.top.window="{title: phrases.addItem}" @click.stop="openCreateItemModal" variant="light" class="btn-xs">
            <img src="~@/assets/add.png">               
          </b-btn>
        </b-button-group> 
        <b-button-group class="float-left">
          <b-btn id="deleteSelectedBtn" v-on:mouseleave="hideTooltip('deleteSelectedBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteSelected}" @click.stop="openDeleteCheckedItemsModal()" :disabled="noRowChecked" variant="light" class="btn-xs">
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
      <b-table show-empty hover small id="items-table" class="mt-3" fixed
              stacked="md"
              bordered
              :items="tableItems"
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
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox v-b-tooltip.hover.top.window="{title: phrases.selectAll}" v-on:change="toggleCheckAll" v-model="checkAll">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(preview)="row">
          <b-button-group>
            <b-button id="updateItemBtn" v-on:mouseleave="hideTooltip('updateItemBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" @click.stop="openUpdateItemModal(row.item)" variant="link" class="btn-xs">
              <img src="~@/assets/see-more.png" class="rowImg">                                           
            </b-button>
          </b-button-group>                
        </template>
        <template v-slot:cell(select)="row">
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox :id="row._id" v-b-tooltip.hover.top.window="{title: phrases.select}" :value="row.item" v-model="checkedItems">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(name)="row">{{ row.item.name }}</template>
        <template v-slot:cell(value)="row">{{ row.item.value | formatValue }}</template>
        <template v-slot:cell(year)="row">{{ row.item.year }}</template>
        <template v-slot:cell(delete)="row">
          <b-button-group>
            <b-button id="deleteItemBtn" v-on:mouseleave="hideTooltip('deleteItemBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteItem}" @click.stop="openDeleteItemModal(row.item)" variant="link" class="btn-xs">
              <img src="~@/assets/delete.png" class="rowImg">                                           
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

    <b-modal no-close-on-backdrop hide-footer hide-header size="lg" id="create-item-modal">
      <item-preview :item='selectedItem' :itemPreview='isPreview' parentModal="create-item-modal" v-on:updateItemsTable="update"></item-preview>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-item-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteItemModal')">
      <message-confirm-dialog ref="deleteItemModal" parentModal="delete-item-modal" type="confirm" :text="phrases.areYouSureToDeleteItem" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteItem"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-checked-items-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteCheckedItemsModal')">
      <message-confirm-dialog ref="deleteCheckedItemsModal" parentModal="delete-checked-items-modal" type="confirm" :text="phrases.areYouSureToDeleteCheckedItems" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteCheckedItems"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="item-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('itemTableErrorModal')">
        <message-confirm-dialog ref="itemTableErrorModal" parentModal="item-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import ItemPreview from './ItemsPane/ItemPreview'
  import MessageConfirmDialog from '../../MessageConfirmDialog'

  const itemController = require('../../../controllers/itemController')
  const i18n = require('../../../../translations/i18n')
  const { asFormatedString, largeAmountNumberOptions } = require('../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          addItem: i18n.getTranslation('Add item'),
          deleteItem: i18n.getTranslation('Delete item'),
          deleteSelected: i18n.getTranslation('Delete selected'),
          seeDetails: i18n.getTranslation('See details'),
          filterByYear: i18n.getTranslation('Filter by year'),
          select: i18n.getTranslation('Select'),
          selectAll: i18n.getTranslation('Select all'),
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          ok: i18n.getTranslation('Ok'),
          areYouSureToDeleteItem: i18n.getTranslation('Are you sure you want to delete item?'),
          areYouSureToDeleteCheckedItems: i18n.getTranslation('Are you sure you want to delete selected items?'),
          noRecordsToShow: i18n.getTranslation('There are no items to show'),
          year: i18n.getTranslation('Year'),
          name: i18n.getTranslation('Name'),
          value: i18n.getTranslation('Value')
        },
        items: [],
        tableItems: [],
        yearToFilter: '',
        currentPage: 1,
        perPage: 10,
        totalRows: null,
        filter: null,
        deletedItems: null,
        checkedItems: [],
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
      this.loadItems()
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
        return this.checkedItems.length === 0
      },
      fields () {
        return [
          { key: 'select', label: '', thStyle: {outline: 'none', width: '30px'} },
          { key: 'preview', label: '', thStyle: {outline: 'none', width: '70px'}  },
          { key: 'name', label: this.phrases.name, class: 'text-center', thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'value', label: this.phrases.value, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'year', label: this.phrases.year, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'delete', label: '', thStyle: {outline: 'none', width: '70px'} },
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
        this.loadItems()
        this.$emit('updateBookedYears')
        this.yearToFilter = ''
        this.clearChecked()
      },
      clearChecked () {
        this.checkAll = false
        this.checkedItems = []
      },
      loadItems () {
        const self = this
        itemController.getItems().then((res) => {
          if (!res.err) {
            self.items = res.data ? res.data : []
            self.tableItems = self.items
            self.totalRows = self.items.length
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openCreateItemModal () {
        this.hideTooltip('addItemBtn')
        this.isPreview = false
        this.selectedItem = null
        this.$root.$emit('bv::show::modal', 'create-item-modal')
      },
      toggleCheckAll () {
        this.checkedItems = this.checkAll ? [] : this.itemsShownInTable
      },
      rowDblClickHandler (record, index) {
        this.openUpdateItemModal(record)
      },
      openDeleteItemModal(item) {
        this.hideTooltip('deleteItemBtn')
        this.deletedItem = item
        this.$root.$emit('bv::show::modal', 'delete-item-modal')
      },
      deleteItem () {
        const self = this
        itemController.deleteItem(this.deletedItem._id).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openDeleteCheckedItemsModal() {
        this.hideTooltip('deleteSelectedBtn')
        this.$root.$emit('bv::show::modal', 'delete-checked-items-modal')
      },
      deleteCheckedItems () {
        var checkedItemsIds = []
        this.checkedItems.forEach(function (item) {
          checkedItemsIds.push(item._id)
        })
        const self = this
        itemController.deleteItems(checkedItemsIds).then((res) => {
          if (!res.err) {
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openUpdateItemModal (item) {
        this.hideTooltip('updateItemBtn')
        this.selectedItem = item
        this.isPreview = true
        this.$root.$emit('bv::show::modal', 'create-item-modal')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'item-table-error-modal')
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
      formatValue (value) {
        return asFormatedString(value, largeAmountNumberOptions) + " дин."
      }
    },
    watch: {
      checkedItems (newValue, oldValue) {
        this.checkAll = (this.itemsShownInTable.length !== 0 && this.itemsShownInTable.length === newValue.length)
        if (newValue.length === 0) {
          /* Close delete-selected button tooltip before it gets disabled and stuck */
          this.$root.$emit('bv::hide::tooltip', 'deleteSelectedBtn')
        }
      },
      yearToFilter (newYearValue) {
        if(newYearValue == '') {
          this.tableItems = this.items;
        } else {
          this.tableItems = this.items.filter(value => {
            if(value.year == newYearValue) {
              return true;
            }
            return false;
          })
        }
        this.totalRows = this.tableItems.length
        this.currentPage = 1
        this.checkedItems = []
      }
    },
    components: { ItemPreview, MessageConfirmDialog }
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
