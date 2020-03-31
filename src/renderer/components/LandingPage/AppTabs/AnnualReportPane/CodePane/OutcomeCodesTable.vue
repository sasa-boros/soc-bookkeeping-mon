<template>
  <b-container fluid class="no-margins-and-pads">
    <b-button-group class="float-left">
      <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="createOutcomeCodeBtn" v-on:mouseleave="hideTooltip('createOutcomeCodeBtn')" v-b-tooltip.hover.top.window="{title: phrases.createOutcomeCode}" v-on:click="openCreateOutcomeCodeModal()" variant="light" class="btn-xs">
        <img src="~@/assets/add.png">
      </b-button>
    </b-button-group>
    <b-table show-empty fixed id="outcome-codes-table"
              stacked="md"
              bordered
              class="mt-3"
              :items="outcomeCodes"
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
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="updateOutcomeCodeBtn" v-on:mouseleave="hideTooltip('updateOutcomeCodeBtn')" v-b-tooltip.hover.top.window="{title: phrases.seeDetails}" v-on:click="openCreateOutcomeCodeModal(row.item)" variant="link" class="btn-xs">
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
          <b-button-group v-show="!row.item.tax">
            <b-button v-on:focus="unfocusElementOnNonKeyboardEvent" id="deleteOutcomeCodeBtn" v-on:mouseleave="hideTooltip('deleteOutcomeCodeBtn')" v-b-tooltip.hover.top.window="{title: phrases.deleteOutcomeCode}" v-on:click="openDeleteOutcomeCodeModal(row.item)" variant="link" class="btn-xs">
                <img src="~@/assets/delete.png" class="rowImg">
            </b-button>
          </b-button-group>
        </template>
      </b-table>

      <b-modal no-close-on-backdrop hide-footer hide-header size="lg" id="create-outcome-code-modal">
        <outcome-code-preview :outcomeCode='selectedOutcomeCode' :isUpdate='isUpdate' :existingOutcomeCodes="outcomeCodes" parentModal="create-outcome-code-modal" v-on:updateOutcomeCodes="update"></outcome-code-preview>
      </b-modal>

      <b-modal no-close-on-backdrop id="delete-outcome-code-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('deleteOutcomeCodeModal')">
        <message-confirm-dialog ref="deleteOutcomeCodeModal" parentModal="delete-outcome-code-modal" type="confirm" :text="phrases.areYouSureToDeleteOutcomeCode" :subText="phrases.outcomeCodeDeleteConsequences" :cancelOkText="phrases.cancel" :confirmText="phrases.delete" v-on:confirmed="deleteOutcomeCode"></message-confirm-dialog>
      </b-modal>

      <b-modal no-close-on-backdrop id="outcome-code-table-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('outcomeCodeTableErrorModal')">
        <message-confirm-dialog ref="outcomeCodeTableErrorModal" parentModal="outcome-code-table-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
      </b-modal>
  </b-container>
</template>

<script>
  import store from '@/store'
  import { mapState } from 'vuex'
  import OutcomeCodePreview from './OutcomeCodesTable/OutcomeCodePreview';
  import MessageConfirmDialog from '../../../../MessageConfirmDialog'
  import { EventBus } from '../../../../../eventbus/event-bus.js';

  const { dialog } = require('electron').remote
  const outcomeCodeController = require('../../../../../controllers/outcomeCodeController')
  const i18n = require('../../../../../../translations/i18n')
  const { asRoman } = require('../../../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          noRecordsToShow: i18n.getTranslation('There are no outcome codes to show'),
          createOutcomeCode: i18n.getTranslation('Create outcome code'),
          deleteOutcomeCode: i18n.getTranslation('Delete outcome code'),
          seeDetails: i18n.getTranslation('See details'),
          cancel: i18n.getTranslation('Cancel'),
          delete: i18n.getTranslation('Delete'),
          areYouSureToDeleteOutcomeCode: i18n.getTranslation('Are you sure you want to delete outcome code?'),
          outcomeCodeDeleteConsequences: i18n.getTranslation('By deleting outcome code you will possibly make some of receipts invalid.'),
          ok: i18n.getTranslation('Ok'),
          maxNumberOfOutcomeCodesReached: i18n.getTranslation('Maximum number of outcome codes reached (16).')
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
        outcomeCodes: [],
        selectedOutcomeCode: null,
        deletedOutcomeCode: null,
        isUpdate: false,
        errorText: ""
      }
    },
    created () {
      const self = this
      this.$watch('bookingYear', () => {
        self.loadOutcomeCodes()
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
      loadOutcomeCodes (el) {
        const self = this
        outcomeCodeController.getOutcomeCodes(this.bookingYear).then((res) => {
          if (!res.err) {
            self.outcomeCodes = res.data ? res.data : []
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
      openCreateOutcomeCodeModal (outcomeCode) {
        if (outcomeCode) {
          this.hideTooltip('updateOutcomeCodeBtn')
          this.selectedOutcomeCode = outcomeCode
          this.isUpdate = true
        } else {
          this.hideTooltip('createOutcomeCodeBtn')
          if(this.outcomeCodes.length >= 16) {
            this.openErrorModal(this.phrases.maxNumberOfOutcomeCodesReached)
            return
          }
          this.selectedOutcomeCode = null
          this.isUpdate = false    
        }
        this.$root.$emit('bv::show::modal', 'create-outcome-code-modal')
      },
      rowDblClickHandler (record, index) {
        this.openCreateOutcomeCodeModal(record)
      },
      openDeleteOutcomeCodeModal(outcomeCode) {
        this.hideTooltip('deleteOutcomeCodeBtn')
        this.deletedOutcomeCode = outcomeCode
        this.$root.$emit('bv::show::modal', 'delete-outcome-code-modal')
      },
      deleteOutcomeCode () {
        const self = this
        outcomeCodeController.deleteOutcomeCode(this.deletedOutcomeCode._id).then((res) => {
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
        this.$root.$emit('bv::show::modal', 'outcome-code-table-error-modal')
      },
      updateFromCodesPane () {
        this.loadOutcomeCodes()
        EventBus.$emit('updateReceiptTable')
      },
      update (el) {
        this.loadOutcomeCodes(el)
        EventBus.$emit('updateGeneralPane')
        EventBus.$emit('updateReceiptTable');
      },
      highlightUpdatedRow(el) {
        this.clearRowHighlight()
        var updatedRow;
        if (el && this.outcomeCodes && this.outcomeCodes.length > 1) {
          const updatedRows = document.querySelectorAll('#outcome-codes-table tbody tr')
          for (let i=0; i < this.outcomeCodes.length; i++) {
            if (this.outcomeCodes[i].partition == el.partition && this.outcomeCodes[i].position == el.position) {
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
      }
    },
    filters: {
      formatPartition (partition) {
        return asRoman(partition)
      }
    },
    components: { OutcomeCodePreview, MessageConfirmDialog }
  }
</script>

<style>
  .modal .modal-sm {
    max-width: 500px;
    width: 500px;
  }
</style>