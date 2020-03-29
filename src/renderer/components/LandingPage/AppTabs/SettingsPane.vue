<template>
  <b-container fluid>
    <b-row>
      <b-col cols=4>
        <span class="buttonLeveledText">{{ phrases.setDefaultZoomLevel }}:</span> 
      </b-col>
      <b-col>
        <b-btn id="decreaseZoomLevelButton" v-on:mouseleave="hideTooltip('decreaseZoomLevelButton')" @click.stop="decreaseZoomLevel()" variant="light" class="btn-lg">
          <img src="~@/assets/minus.png">
        </b-btn>
          {{ zoomLevelFormated }}
        <b-btn id="increaseZoomLevelButton" v-on:mouseleave="hideTooltip('increaseZoomLevelButton')" @click.stop="increaseZoomLevel()" variant="light" class="btn-lg">
          <img src="~@/assets/plus.png">
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols=4>
        <span class="buttonLeveledText">{{ phrases.exportBackup }}:</span> 
      </b-col>
      <b-col>
        <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="exportBackupButton" v-on:mouseleave="hideTooltip('exportBackupButton')" @click.stop="exportBackup" variant="light" class="btn-lg">
          <img src="~@/assets/export.png">
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols=4>
        <span class="buttonLeveledText">{{ phrases.importBackup }}:</span> 
      </b-col>
      <b-col>
        <b-btn v-on:focus="unfocusElementOnNonKeyboardEvent" id="importBackupButton" v-on:mouseleave="hideTooltip('importBackupButton')" @click.stop="importBackup" variant="light" class="btn-lg">
          <img src="~@/assets/import.png">
        </b-btn>
      </b-col>
    </b-row>

    <b-modal no-close-on-backdrop id="import-backup-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('importBackupModal')">
      <message-confirm-dialog ref="importBackupModal" parentModal="import-backup-modal" type="confirm" :text="phrases.areYouSureToImportBackup" :subText="phrases.importWillCauseDataLoss" :cancelOkText="phrases.cancel" :confirmText="phrases.ok" v-on:confirmed="importBackupConfirmed"></message-confirm-dialog>
    </b-modal>

    <b-modal no-close-on-backdrop id="settings-pane-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('settingsPaneErrorModal')">
      <message-confirm-dialog ref="settingsPaneErrorModal" parentModal="settings-pane-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
    </b-modal>

    <b-tooltip boundary='window' target="commonSaveBtn" triggers="hover" placement="top" ref="commonSaveBtnTooltip" v-on:hide.prevent>
      {{phrases.save}}
    </b-tooltip>
      
    <b-tooltip boundary='window' target="increaseZoomLevelButton" triggers="hover" placement="top" ref="increaseZoomLevelButtonTooltip" v-on:hide.prevent>
      {{phrases.increase}}
    </b-tooltip>

    <b-tooltip boundary='window' target="decreaseZoomLevelButton" triggers="hover" placement="top" ref="decreaseZoomLevelButtonTooltip" v-on:hide.prevent>
      {{phrases.decrease}}
    </b-tooltip>

    <b-tooltip boundary='window' target="exportBackupButton" triggers="hover" placement="top" ref="exportBackupButtonTooltip" v-on:hide.prevent>
      {{phrases.exportCopy}}
    </b-tooltip>

    <b-tooltip boundary='window' target="importBackupButton" triggers="hover" placement="top" ref="importBackupButtonTooltip" v-on:hide.prevent>
      {{phrases.importCopy}}
    </b-tooltip>

  </b-container>
</template>

<script>
  import MessageConfirmDialog from '../../MessageConfirmDialog'

  const Big = require('big.js')
  const i18n = require('../../../../translations/i18n')
  const settingsController = require('../../../controllers/settingsController')
  const { saveAs, open, reloadApp } = require('../../../utils/utils')

  export default {
    data () {
      return {
        phrases: {
          setDefaultPaymentSlip: i18n.getTranslation('Default values for payment slips'),
          setDefaultReceipt: i18n.getTranslation('Default values for receipts'),
          setDefaultZoomLevel: i18n.getTranslation('Default zoom level'),
          adaptPaymentSlips: i18n.getTranslation('Adapt payment slips'),
          adaptReceipts: i18n.getTranslation('Adapt receipts'),
          exportBackup: i18n.getTranslation('Export backup'),
          exportCopy: i18n.getTranslation('Export copy'),
          importBackup: i18n.getTranslation('Import backup'),
          importCopy: i18n.getTranslation('Import copy'),
          areYouSureToImportBackup: i18n.getTranslation('Are you sure you want to import backup?'),
          importWillCauseDataLoss: i18n.getTranslation('Import will cause that all data is lost.'),
          increase: i18n.getTranslation('Increase'),
          decrease: i18n.getTranslation('Decrease'),
          save: i18n.getTranslation('Save'),
          ok: i18n.getTranslation('Ok'),
          cancel: i18n.getTranslation('Cancel'),
          backup: i18n.getTranslation('backup'),
          saveError: i18n.getTranslation('Failed saving error'),
          importBackupError: i18n.getTranslation('Import backup error')
        },
        churchMunicipality: null,
        churchTown: null,
        zoomLevel: Big(1.2),
        commonDataSaveTimeout: null,
        alreadyPressed: false,
        disableCommonSaveBtn: true,
        errorText: null,
        backupPath: null
      }
    },
    created () {
      this.loadSettings()
    },
    computed: {
      zoomLevelFormated: function() {
        if(!this.zoomLevel) {
          return null;
        }
        var formatedZoomLevel = this.zoomLevel.times(100).minus(20)
        return formatedZoomLevel.toString() + ' %'
      }
    },
    methods: {
      unfocusElementOnNonKeyboardEvent (e) {
        if (!e.relatedTarget) {
          e.target.blur()
        }
      },
      exportBackup (evt) {
        evt.preventDefault()
        this.hideTooltip('exportBackupButton')
        const self = this
        settingsController.exportBackup().then(function(res) {
          if (!res.err) {
            saveAs('/backup.zip', self.phrases.backup + '_' + Date.now() + '.bak', err => {
              if (err) {
                self.openErrorModal(self.phrases.saveError)
              }
            })
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      importBackup () {
        this.hideTooltip('exportBackupButton')
        const self = this
        const backup = open({ filters: [{ name: 'Backup', extensions: ['bak'] }, { name: 'All Files', extensions: ['*'] }] })
        if (!backup || backup.length == 0) {
          return
        }
        this.backupPath = backup[0]
        this.hideTooltip('importBackupButton')
        this.$root.$emit('bv::show::modal', 'import-backup-modal')
      },
      importBackupConfirmed () {
        const self = this
        settingsController.importBackup(this.backupPath).then(function(res) {
          if (!res.err) {
            reloadApp()
          } else {
            self.openErrorModal(self.phrases.importBackupError)
          }
        })
      },
      focusModalCloseButton (modalRef) {
        this.$refs[modalRef].$refs.closeButton.focus()
      },
      loadSettings () {
        const self = this
        settingsController.getSettings().then(function (res) {
          if (!res.err) {
            self.zoomLevel = Big(res.data && res.data.zoomLevel ? res.data.zoomLevel : 1.2)
            self.$emit('updateZoomLevel', parseFloat(self.zoomLevel))
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      increaseZoomLevel () {
        if(!this.zoomLevel.gte(1.7)) {
          this.zoomLevel = this.zoomLevel.plus(0.1)
          this.updateZoomLevel()
        }
      },
      decreaseZoomLevel () {
        if(!this.zoomLevel.lte(0.7)) {
          this.zoomLevel = this.zoomLevel.minus(0.1)
          this.updateZoomLevel()
        }
      },
      updateZoomLevel () {
        const self = this
        settingsController.createSettings({zoomLevel: parseFloat(self.zoomLevel)}).then(function (res) {
          if (!res.err) {
            self.$emit('updateZoomLevel', parseFloat(self.zoomLevel))
          } else {
            self.openErrorModal(res.err)
          }
        })
      },
      openErrorModal(error) {
        this.errorText = error
        this.$root.$emit('bv::show::modal', 'settings-pane-error-modal')
      },
      hideTooltip (elementId) {
        if (elementId) {
          this.$root.$emit('bv::hide::tooltip', elementId)
        } else {
          this.$root.$emit('bv::hide::tooltip')
        }
      }
    },
    components: { MessageConfirmDialog }
  }
</script>

<style scoped>
  #zoomLevelInput {
    width: 60px;
  }
  .buttonLeveledText {
    position: relative;
    top:13px;
  }
</style>
