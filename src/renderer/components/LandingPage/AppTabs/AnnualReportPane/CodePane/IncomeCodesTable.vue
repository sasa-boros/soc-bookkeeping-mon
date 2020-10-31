<template>
  <b-container fluid class="no-margins-and-pads">
     <b-button-group class="float-left" >
      <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" v-on:mouseleave="hideTooltip('addIncomeCodeBtn')" id="addIncomeCodeBtn" v-b-tooltip.hover.top.window="{title: phrases.createIncomeCode}" v-on:click="openCreateIncomeCodeModal()" variant="light" class="btn-xs">
        <img src="~@/assets/add.png">
      </b-button>
     </b-button-group>
    <b-table show-empty fixed id="income-codes-table"
              stacked="md"
              bordered
              class="mt-3"
              :items="incomeCodes"
              responsive
              head-variant="light"
              hover
              small
              :fields="fields"
              @row-dblclicked="rowDblClickHandler" 
              :empty-text="phrases.noRecordsToShow"
              :empty-filtered-text="phrases.noRecordsToShow"
              >
        <template v-slot:cell(preview)="row">
          <b-button-group>
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="updateIncomeCodeBtn" v-on:mouseleave="hideTooltip('updateIncomeCodeBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" v-on:click="openCreateIncomeCodeModal(row.item)" variant="link" class="btn-xs">
              <img src="~@/assets/see-more.png" class="rowImg">                                           
            </b-button>
          </b-button-group>
        </template>
        <template v-slot:cell(partition)="row">
          {{ row.item.partition | formatPartition }}
        </template>
        <template v-slot:cell(position)="row">
          {{ row.item.position }}
        </template>
        <template v-slot:cell(description)="row">
          {{ row.item.description }}
        </template>
        <template v-slot:cell(remove)="row">
           <b-button-group>
              <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="deleteIncomeCodeBtn" v-on:mouseleave="hideTooltip('deleteIncomeCodeBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteIncomeCode}" v-on:click="openDeleteIncomeCodeModal(row.item)" variant="link" class="btn-xs">
                  <img src="~@/assets/delete.png" class="rowImg">
              </b-button>
           </b-button-group>
        </template>
      </b-table>

      <b-modal no-close-on-backdrop hide-footer hide-header size="lg" id="create-income-code-modal">
        <income-code-preview :incomeCode='selectedIncomeCode' :isUpdate='isUpdate' :existingIncomeCodes="incomeCodes" parentModal="create-income-code-modal" v-on:updateIncomeCodes="update"></income-code-preview>
      </b-modal>

      <b-modal no-close-on-backdrop id="delete-income-code-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteIncomeCodeModal')">
        <message-confirm-dialog ref="deleteIncomeCodeModal" parentModal="delete-income-code-modal" type="confirm" :text="phrases.areYouSureToDeleteIncomeCode" :subText="phrases.incomeCodeDeleteConsequences" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteIncomeCode"></message-confirm-dialog>
      </b-modal>

      <b-modal no-close-on-backdrop id="income-code-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('incomeCodeTableErrorModal')">
        <message-confirm-dialog ref="incomeCodeTableErrorModal" parentModal="income-code-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
      </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import IncomeCodePreview from './IncomeCodesTable/IncomeCodePreview';
  import MessageConfirmDialog from '../../../../MessageConfirmDialog';
  import { EventBus } from '../../../../../eventbus/event-bus.js';

  const { dialog } = require('electron').remote
  const incomeCodeController = require('../../../../../controllers/incomeCodeController')
  const i18n = require('../../../../../../translations/i18n')
  const { asRoman } = require('../../../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          noRecordsToShow: i18n.getTranslation('There are no income codes to show'),
          createIncomeCode: i18n.getTranslation('Create income code'),
          deleteIncomeCode: i18n.getTranslation('Delete income code'),
          seeDetails: i18n.getTranslation('See details'),
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          areYouSureToDeleteIncomeCode: i18n.getTranslation('Are you sure you want to delete income code?'),
          incomeCodeDeleteConsequences: i18n.getTranslation('By deleting income code you will possibly make some of payment slips invalid.'),
          ok: i18n.getTranslation('Ok'),
          maxNumberOfIncomeCodesReached: i18n.getTranslation('Maximum number of income codes reached (15).')
        },
        fields: [
          {
            key: 'preview',
            label: '',
            thStyle: {outline: 'none', width: '70px'}
          },
          {
            key: 'partition',
            label: i18n.getTranslation('Partition'),
            class: 'text-center'
          },
          {
            key: 'position',
            label: i18n.getTranslation('Position'),
            class: 'text-center'
          },
          {
            key: 'description',
            label: i18n.getTranslation('Description'),
            class: 'text-center'
          },
          {
            key: 'remove',
            label: '',
            thStyle: {outline: 'none', width: '70px'}
          }
        ],
        incomeCodes: [],
        selectedIncomeCode: null,
        deletedIncomeCode: null,
        isUpdate: false,
        errorText: ""
      }
    },
    created () {
      const self = this
      this.$watch('bookingYear', () => {
        self.loadIncomeCodes()
      }, {immediate: true})
    },
    computed: {
      ...mapState(
        {
          bookingYear: state => state.CommonValues.bookingYear
        }
      ),
    },
    methods: {
      unfocusElementOnNonKeyboardEvent (e) {
        if (!e.relatedTarget) {
          e.target.blur()
        }
      },
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
      },
      loadIncomeCodes (el) {
        const self = this
        incomeCodeController.getIncomeCodes(this.bookingYear).then((res) => {
          if (!res.err) {
            self.incomeCodes = res.data ? res.data : []
            if (el)  {
              self.$nextTick(() => {
                self.highlightUpdatedRow(el)
              })
            }
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openCreateIncomeCodeModal (incomeCode) {
        if(incomeCode) {
          this.hideTooltip('updateIncomeCodeBtn')
          this.selectedIncomeCode = incomeCode
          this.isUpdate = true
        } else {
          this.hideTooltip('addIncomeCodeBtn')
          if(this.incomeCodes.length >= 15) {
            this.openErrorModal(this.phrases.maxNumberOfIncomeCodesReached)
            return
          }
          this.selectedIncomeCode = null
          this.isUpdate = false    
        }
        this.$root.$emit('bv::show::modal', 'create-income-code-modal')
      },
      rowDblClickHandler (record, index) {
        this.openCreateIncomeCodeModal(record)
      },
      openDeleteIncomeCodeModal(incomeCode) {
        this.hideTooltip('deleteIncomeCodeBtn')
        this.deletedIncomeCode = incomeCode
        this.$root.$emit('bv::show::modal', 'delete-income-code-modal')
      },
      deleteIncomeCode () {
        const self = this
        incomeCodeController.deleteIncomeCode(this.deletedIncomeCode._id).then((res) => {
          if (!res.err) {
            self.clearRowHighlight()
            self.update()
          } else {
            self.openErrorModal(res.err)
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
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'income-code-table-error-modal')
      },
      updateFromCodesPane () {
        this.loadIncomeCodes()
        EventBus.$emit('updatePaymentSlipTable')
      },
      update (el) {
        this.loadIncomeCodes(el)
        EventBus.$emit('updateGeneralPane')
        EventBus.$emit('updatePaymentSlipTable')
      },
      highlightUpdatedRow(el) {
        this.clearRowHighlight()
        var updatedRow;
        if (el && this.incomeCodes && this.incomeCodes.length > 1) {
          const updatedRows = document.querySelectorAll('#income-codes-table tbody tr')
          for (let i=0; i < this.incomeCodes.length; i++) {
            if (this.incomeCodes[i].partition == el.partition && this.incomeCodes[i].position == el.position) {
              if (i < updatedRows.length) {
                updatedRow = updatedRows[i]
                break;
              }
            }
          }
        } 
        if (updatedRow) {
          updatedRow.style.setProperty('box-shadow', '0 1px 1px rgba(128, 147, 168, 0.075) inset, 0 0 8px rgba(128, 147, 168, 0.6)')
          this.highlightedRow = updatedRow
          this.highlightedRowTimeout = setTimeout(() => {
            updatedRow.style.setProperty('box-shadow', 'none')
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
    },
    filters: {
      formatPartition (partition) {
        return asRoman(partition)
      }
    },
    components: { IncomeCodePreview, MessageConfirmDialog }
  }
</script>

<style scoped>
  .btn-light {
    background-color:#e7f3fc;
    border: none;
  }
</style>

<style>
  .modal .modal-sm {
    max-width: 500px;
    width: 500px;
  }
</style>