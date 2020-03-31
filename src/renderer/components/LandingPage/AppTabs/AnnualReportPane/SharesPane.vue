<template>
  <b-container fluid>
     <b-row>
      <b-col cols="6">
        <b-button-group class="float-left">
          <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="addShareButton" v-on:mouseleave="hideTooltip('addShareButton')" v-b-tooltip.hover.top.window="{title: phrases.addShare}" @click.stop="openCreateShareModal" variant="light" class="btn-xs">
            <img src="~@/assets/add.png">               
          </b-btn>
        </b-button-group> 
        <b-button-group class="float-left">
          <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="deleteSelectedBtn" v-on:mouseleave="hideTooltip('deleteSelectedBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteSelected}" @click.stop="openDeleteCheckedSharesModal()" :disabled="noRowChecked" variant="light" class="btn-xs">
            <img src="~@/assets/trash.png">               
          </b-btn>
        </b-button-group>
      </b-col>
    </b-row>

    <div class="tableDiv">
      <b-table show-empty hover small id="shares-table" class="mt-3" fixed
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
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="updateShareBtn" v-on:mouseleave="hideTooltip('updateShareBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" @click.stop="openUpdateShareModal(row.item, row.index)" variant="link" class="btn-xs">
              <img src="~@/assets/see-more.png" class="rowImg">                                           
            </b-button>
          </b-button-group>                
        </template>
        <template v-slot:cell(select)="row">
          <span v-on:mouseleave="hideTooltip()">
            <b-form-checkbox :id="row._id" v-b-tooltip.hover.top.window="{title: phrases.select}" :value="row.item" v-model="checkedShares">
            </b-form-checkbox>
          </span>
        </template>
        <template v-slot:cell(series)="row">{{ row.item.series }}</template>
        <template v-slot:cell(ordinal)="row">{{ row.item.ordinal }}</template>
        <template v-slot:cell(name)="row">{{ row.item.name }}</template>
        <template v-slot:cell(nominalValue)="row">{{ row.item.nominalValue | formatNominalValue }}</template>
        <template v-slot:cell(delete)="row">
          <b-button-group>
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="deleteShareBtn" v-on:mouseleave="hideTooltip('deleteShareBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteShare}" @click.stop="openDeleteShareModal(row.item)" variant="link" class="btn-xs">
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

    <b-modal no-close-on-backdrop hide-footer hide-header size="lg" id="create-share-modal">
      <share-preview :share='selectedItem' :sharePreview='isPreview' parentModal="create-share-modal" v-on:updateSharesTable="update(); highlightUpdatedRow()"></share-preview>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-share-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteShareModal')">
      <message-confirm-dialog ref="deleteShareModal" parentModal="delete-share-modal" type="confirm" :text="phrases.areYouSureToDeleteShare" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteShare"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="delete-checked-shares-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteCheckedSharesModal')">
      <message-confirm-dialog ref="deleteCheckedSharesModal" parentModal="delete-checked-shares-modal" type="confirm" :text="phrases.areYouSureToDeleteCheckedShares" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteCheckedShares"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="share-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('shareTableErrorModal')">
        <message-confirm-dialog ref="shareTableErrorModal" parentModal="share-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import SharePreview from './SharesPane/SharePreview'
  import MessageConfirmDialog from '../../../MessageConfirmDialog'

  const shareController = require('../../../../controllers/shareController')
  const i18n = require('../../../../../translations/i18n')
  const { asFormatedString, largeAmountNumberOptions } = require('../../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          addShare: i18n.getTranslation('Add share'),
          deleteShare: i18n.getTranslation('Delete share'),
          deleteSelected: i18n.getTranslation('Delete selected'),
          seeDetails: i18n.getTranslation('See details'),
          select: i18n.getTranslation('Select'),
          selectAll: i18n.getTranslation('Select all'),
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          ok: i18n.getTranslation('Ok'),
          areYouSureToDeleteShare: i18n.getTranslation('Are you sure you want to delete share?'),
          areYouSureToDeleteCheckedShares: i18n.getTranslation('Are you sure you want to delete selected shares?'),
          noRecordsToShow: i18n.getTranslation('There are no shares to show'),
          series: i18n.getTranslation('Series'),
          ordinal: i18n.getTranslation('Ordinal'),
          name: i18n.getTranslation('Name'),
          nominalValue: i18n.getTranslation('Nominal value')
        },
        shares: [],
        items: [],
        currentPage: 1,
        perPage: 10,
        totalRows: null,
        deletedShares: null,
        checkedShares: [],
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
        self.loadShares()
      }, {immediate: true})
    },
    computed: {
      ...mapState(
        {
          bookingYear: state => state.CommonValues.bookingYear
        }
      ),
      noRowChecked () {
        return this.checkedShares.length === 0
      },
      fields () {
        return [
          { key: 'select', label: '', thStyle: {outline: 'none', width: '30px'} },
          { key: 'preview', label: '', thStyle: {outline: 'none', width: '70px'}  },
          { key: 'series', label: this.phrases.series, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'ordinal', label: this.phrases.ordinal, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'name', label: this.phrases.name, class: 'text-center', sortable:true, thStyle: {'outline': 'none', 'user-select': 'none'} },
          { key: 'nominalValue', label: this.phrases.nominalValue, class: 'text-center', sortable: true, thStyle: {'outline': 'none', 'user-select': 'none'} },
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
        this.loadShares()
        this.clearChecked()
      },
      clearChecked () {
        this.checkAll = false
        this.checkedShares = []
      },
      highlightUpdatedRow () {
        this.clearRowHighlight()

        var rowToHighlight
        if (this.selectedItem) {
          rowToHighlight = document.querySelector('#shares-table tbody tr[aria-rowindex="' + ((this.currentPage - 1 ) * 10 + this.selectedItemIndex + 1) + '"]')
        } else {
          rowToHighlight = document.querySelector('#shares-table tbody tr[aria-rowindex="1"]')
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
      loadShares () {
        const self = this
        shareController.getShares(this.bookingYear).then((res) => {
          if (!res.err) {
            self.shares = res.data ? res.data : []
            self.items = self.shares
            self.totalRows = self.shares.length
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openCreateShareModal () {
        this.hideTooltip('addShareBtn')
        this.isPreview = false
        this.selectedItem = null
        this.selectedItemIndex = null
        this.$root.$emit('bv::show::modal', 'create-share-modal')
      },
      toggleCheckAll () {
        this.checkedShares = this.checkAll ? [] : this.itemsShownInTable
      },
      rowDblClickHandler (record, index) {
        this.openUpdateShareModal(record, index)
      },
      openDeleteShareModal(share) {
        this.hideTooltip('deleteShareBtn')
        this.deletedShare = share
        this.$root.$emit('bv::show::modal', 'delete-share-modal')
      },
      deleteShare () {
        const self = this
        shareController.deleteShare(this.deletedShare._id).then((res) => {
          if (!res.err) {
            self.clearRowHighlight()
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openDeleteCheckedSharesModal() {
        this.hideTooltip('deleteSelectedBtn')
        this.$root.$emit('bv::show::modal', 'delete-checked-shares-modal')
      },
      deleteCheckedShares () {
        var checkedSharesIds = []
        this.checkedShares.forEach(function (share) {
          checkedSharesIds.push(share._id)
        })
        const self = this
        shareController.deleteShares(checkedSharesIds).then((res) => {
          if (!res.err) {
            self.clearRowHighlight()
            self.update()
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openUpdateShareModal (item, index) {
        this.hideTooltip('updateShareBtn')
        this.selectedItem = item
        this.selectedItemIndex = index
        this.isPreview = true
        this.$root.$emit('bv::show::modal', 'create-share-modal')
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'share-table-error-modal')
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
      formatNominalValue (nominalValue) {
        return asFormatedString(nominalValue, largeAmountNumberOptions) + " дин."
      }
    },
    watch: {
      checkedShares (newValue, oldValue) {
        this.checkAll = (this.itemsShownInTable.length !== 0 && this.itemsShownInTable.length === newValue.length)
        if (newValue.length === 0) {
          /* Close delete-selected button tooltip before it gets disabled and stuck */
          this.$root.$emit('bv::hide::tooltip', 'deleteSelectedBtn')
        }
      },
    },
    components: { SharePreview, MessageConfirmDialog }
  }
</script>

<style scoped>
  .tableDiv {
    display: block;
  }
</style>
