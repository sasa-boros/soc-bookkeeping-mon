<template>
  <b-container fluid id="annual-report-preview">
    <br>
      <b-row>
        <b-col cols="3">
          <span v-on:mouseleave="hideTooltip('annualReportDownloadDropdown')">
            <b-dropdown id="annualReportDownloadDropdown" variant="link">
              <template v-slot:button-content>
                <img src="~@/assets/download.png">
              </template>
              <b-dropdown-item class="dropdownOption" v-on:click="downloadAnnualReportPage">{{phrases.downloadPage}}</b-dropdown-item>
              <b-dropdown-item class="dropdownOption" v-on:click="downloadTotalReport">{{phrases.downloadTotalReport}}</b-dropdown-item>
              <b-dropdown-item class="dropdownOption" v-on:click="downloadAnnualReport">{{phrases.downloadWholeAnnualReport}}</b-dropdown-item>
            </b-dropdown>
          </span>
          <span v-on:mouseleave="hideTooltip('annualReportPrintDropdown')">
            <b-dropdown id="annualReportPrintDropdown" variant="link">
              <template v-slot:button-content>
                <img src="~@/assets/print.png">
              </template>
              <b-dropdown-item v-on:click="printAnnualReportPage">{{phrases.printPage}}</b-dropdown-item>
              <b-dropdown-item v-on:click="printTotalReport">{{phrases.printTotalReport}}</b-dropdown-item>
              <b-dropdown-item v-on:click="printAnnualReport">{{phrases.printWholeAnnualReport}}</b-dropdown-item>
            </b-dropdown>
          </span>
          &nbsp;
        </b-col>
        <b-col cols="2">
          <div class="float-right pageCount">
            {{currentPage}}/{{annualReportPages.length}}
          </div>
        </b-col>
        <b-col cols="2" class="text-center">
          <b-button id="decrementPageBtn" ref="decrementPageBtn" v-on:mouseleave="hideTooltip('decrementPageBtn')" variant="light" v-on:click='decrementPage'>
            <i class="arrow left"></i>
          </b-button>
          <b-button id="incrementPageBtn" ref="incrementPageBtn" v-on:mouseleave="hideTooltip('incrementPageBtn')" variant="light" v-on:click='incrementPage'>
            <i class="arrow right"></i>
          </b-button>
        </b-col>
        <b-col>
          <div style="text-align:center">Страна дневника:</div>
          <span align="justify">
            <b-button v-for="(value, arpn, index) in annualReportPagesNums" v-bind:key="value" v-on:click="setPage(value)" type="text" variant="light" class="btn-sm">
              {{computePageIndex(index)}}
            </b-button>
          </span>
          <b-button @click.stop="closeModal()" variant="link" id="modalCancelBtn" class="btn-xs float-right">
            <img src="~@/assets/close.png">
          </b-button>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <div v-html="annualReportPages[currentPage-1]" id="page-display" class="headline manualPage incomePage outcomePage sharesPage totalIncomePage totalOutcomePage totalPage totalHeadline">
        </div>
      </b-row>
      <b-tooltip boundary='window' ref="annualReportPrintDropdownTooltip" triggers="hover" target="annualReportPrintDropdown" v-on:hide.prevent>
        {{phrases.print}}
      </b-tooltip>
      <b-tooltip boundary='window' ref="annualReportDownloadDropdownTooltip" triggers="hover" target="annualReportDownloadDropdown" v-on:hide.prevent>
        {{phrases.download}}
      </b-tooltip>
      <b-tooltip boundary='window' ref="decrementPageBtnTooltip" triggers="hover" target="decrementPageBtn" v-on:hide.prevent>
        {{phrases.previousPage}}
      </b-tooltip>
      <b-tooltip boundary='window' ref="incrementPageBtnTooltip" triggers="hover" target="incrementPageBtn" v-on:hide.prevent>
        {{phrases.nextPage}}
      </b-tooltip>
      
      <b-modal no-close-on-backdrop id="annual-report-error-modal" hide-backdrop hide-footer hide-header content-class="shadow" v-on:shown="focusModalCloseButton('annualReportErrorModal')">
        <message-confirm-dialog ref="annualReportErrorModal" parentModal="annual-report-error-modal" type="error" :text="errorText" :cancelOkText="phrases.ok"></message-confirm-dialog>
      </b-modal>
  </b-container>
</template>

<script>
import MessageConfirmDialog from '../../../MessageConfirmDialog'

const i18n = require('../../../../../translations/i18n');
const annualReportController = require('../../../../controllers/annualReportController')
const { saveAs } = require('../../../../utils/utils')
const Mousetrap = require('mousetrap');
const AutoNumeric = require('autonumeric')

const printPageStyle = `
<style>
@media screen {
    #print-annual-report {
      display: none;
    }
  }
  @media print {
    #app {
      display:none;
    }
    #print-annual-report, #print-annual-report * {
      visibility:visible;
    }
    #headline {
      position: relative;
      top: 303px;
      left: 147px;
      transform: scale(0.87) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-headline {
      position: relative;
      top: 303px;
      left: 147px;
      transform: scale(0.87) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #manual-page {
      position: relative;
      top: 677px;
      right: 5px;
      transform: scale(0.73) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #income-page {
      position: relative;
      top: 1091px;
      left: 48px;
      transform: scale(1.1) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #outcome-page {
      position: relative;
      top: 1095px;
      left: 48px;
      transform: scale(1.1) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-income-page {
      position: relative;
      top: 737px;
      right: 1px;
      transform: scale(0.71) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-outcome-page {
      position: relative;
      top: 736px;
      right: 1px;
      transform: scale(0.71) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #shares-page {
      position: relative;
      top: 667px;
      left: 18px;
      transform: scale(0.73) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-page {
      position: relative;
      top: 555px;
      left: 28px;
      transform: scale(0.73) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
  }
  </style>
`

const printTotalReportStyle = `
<style>
@media screen {
    #print-annual-report {
      display: none;
    }
  }
  @media print {
    #app {
      display:none;
    }
    #print-annual-report, #print-annual-report * {
      visibility:visible;
    }
    #total-headline {
      position: relative;
      top: 288px;
      left: 137px;
      transform: scale(0.9) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-income-page {
      page-break-before: always;
      position: relative;
      top:738px;
      right: 1px;
      transform: scale(0.71) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-outcome-page {
      page-break-before: always;
      position: relative;
      top:738px;
      right: 1px;
      transform: scale(0.71) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #shares-page {
      page-break-before: always;
      position: relative;
      top: 670px;
      left: 10px;
      transform: scale(0.73) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-page {
      page-break-before: always;
      position: relative;
      top: 555px;
      left: 26px;
      transform: scale(0.73) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
  }
  </style>
`

const printAnnualReportStyle = `
<style>
@media screen {
    #print-annual-report {
      display: none;
    }
  }
  @media print {
    #app {
      display:none;
    }
    #print-annual-report, #print-annual-report * {
      visibility:visible;
    }
    #headline {
      position: relative;
      top: 800px;
      left: 230px;
      transform: scale(1.3) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #manual-page {
      page-break-before: always;
      position: relative;
      top: 1014px;
      right: 5px;
      transform: scale(1.1) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #income-page {
      page-break-before: always;
      position: relative;
      top: 1096px;
      left: 48px;
      transform: scale(1.1) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #outcome-page {
      page-break-before: always;
      position: relative;
      top: 1095px;
      left: 48px;
      transform: scale(1.1) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-income-page {
      page-break-before: always;
      position: relative;
      top: 1110px;
      right: 1px;
      transform: scale(1.08) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-outcome-page {
      page-break-before: always;
      position: relative;
      top: 1109px;
      right: 1px;
      transform: scale(1.08) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #shares-page {
      page-break-before: always;
      position: relative;
      top: 1005px;
      left: 18px;
      transform: scale(1.1) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
    #total-page {
      page-break-before: always;
      position: relative;
      top: 854px;
      left: 38px;
      transform: scale(1.1) rotate(270deg) translate(-276mm, 0);
      transform-origin: 0 0;
    }
  }
  </style>
`

export default {
  props: {
    year: {
      type: Number
    },
    annualReportPages: {
      type: Array,
      default: []
    },
    parentModal: String
  },
  data () {
    return {
      phrases: {
        download: i18n.getTranslation('Download'),
        downloadPage: i18n.getTranslation('Download page'),
        downloadTotalReport: i18n.getTranslation('Download total report'),
        downloadWholeAnnualReport: i18n.getTranslation('Download whole annual report'),
        print: i18n.getTranslation('Print'),
        printPage: i18n.getTranslation('Print page'),
        printTotalReport: i18n.getTranslation('Print total report'),
        printWholeAnnualReport: i18n.getTranslation('Print whole annual report'),
        previousPage: i18n.getTranslation('Previous page'),
        nextPage: i18n.getTranslation('Next page'),
        ok: i18n.getTranslation('Ok'),
        totalReportFileName: i18n.getTranslation('total-report'),
        annualReportFileName: i18n.getTranslation('annual-report'),
        page: i18n.getTranslation('page'),
        saveError: i18n.getTranslation('Failed saving error')
      },
      currentPage: 1,
      annualReportPagesNums: null,
      errorText: "",
      printPageSections: [],
      printTotalReportSection: null,
      printAnnualReportSection: null,
      alreadyPressed: false
    }
  },
  created () {
    const self = this
    this.annualReportPages.forEach((annualReportPage, index) => {
      self.printPageSections.push(self.preparePagePrintSection(printPageStyle, index))
    })
    this.printTotalReportSection = this.prepareTotalReportPrintSection(printTotalReportStyle, null)
    this.printAnnualReportSection = this.prepareAnnualReportPrintSection(printAnnualReportStyle, null)
    this.findAnnualReportPagesNums()
  },
  mounted () {
    this.bindKeys()
  },
  beforeDestroy () {
    this.unbindKeys()
  },
  methods: {
    computePageIndex (index) {
      if (index == 0) {
        return 'Н'
      } else if (index == 15) {
        return 'З'
      } else {
        return index
      }
    },
    setPage (pageNum) {
      this.currentPage = pageNum
    },
    findAnnualReportPagesNums () {
      const annualReportPagesNums = {}
      for (let i=0;i<this.annualReportPages.length;i++) {
        if (!annualReportPagesNums.page0 && this.annualReportPages[i].startsWith('<style accesskey="0">')) {
          annualReportPagesNums.page0 = i + 1
        } else if (i > 1 && !annualReportPagesNums.page1 && this.annualReportPages[i].startsWith('<style accesskey="1">')) {
          annualReportPagesNums.page1 = i + 1
        } else if (i > 3 && !annualReportPagesNums.page2 && this.annualReportPages[i].startsWith('<style accesskey="2">')) {
          annualReportPagesNums.page2 = i + 1
        } else if (i > 5 && !annualReportPagesNums.page3 && this.annualReportPages[i].startsWith('<style accesskey="3">')) {
          annualReportPagesNums.page3 = i + 1
        } else if (i > 7 && !annualReportPagesNums.page4 && this.annualReportPages[i].startsWith('<style accesskey="4">')) {
          annualReportPagesNums.page4 = i + 1
        } else if (i > 9 && !annualReportPagesNums.page5 && this.annualReportPages[i].startsWith('<style accesskey="5">')) {
          annualReportPagesNums.page5 = i + 1
        } else if (i > 11 && !annualReportPagesNums.page6 && this.annualReportPages[i].startsWith('<style accesskey="6">')) {
          annualReportPagesNums.page6 = i + 1
        } else if (i > 13 && !annualReportPagesNums.page7 && this.annualReportPages[i].startsWith('<style accesskey="7">')) {
          annualReportPagesNums.page7 = i + 1
        } else if (i > 15 && !annualReportPagesNums.page8 && this.annualReportPages[i].startsWith('<style accesskey="8">')) {
          annualReportPagesNums.page8 = i + 1
        } else if (i > 17 && !annualReportPagesNums.page9 && this.annualReportPages[i].startsWith('<style accesskey="9">')) {
          annualReportPagesNums.page9 = i + 1
        } else if (i > 19 && !annualReportPagesNums.page10 && this.annualReportPages[i].startsWith('<style accesskey="10">')) {
          annualReportPagesNums.page10 = i + 1
        } else if (i > 21 && !annualReportPagesNums.page11 && this.annualReportPages[i].startsWith('<style accesskey="11">')) {
          annualReportPagesNums.page11 = i + 1
        } else if (i > 23 && !annualReportPagesNums.page12 && this.annualReportPages[i].startsWith('<style accesskey="12">')) {
          annualReportPagesNums.page12 = i + 1
        } else if (i > 25 && !annualReportPagesNums.page13 && this.annualReportPages[i].startsWith('<style accesskey="13">')) {
          annualReportPagesNums.page13 = i + 1
        } else if (i > 27 && !annualReportPagesNums.page14 && this.annualReportPages[i].startsWith('<style accesskey="14">')) {
          annualReportPagesNums.page14 = i + 1
        } else if (i > 29 && !annualReportPagesNums.page15 && this.annualReportPages[i].startsWith('<style accesskey="15">')) {
          annualReportPagesNums.page15 = i + 1
        }
      }
      this.annualReportPagesNums = annualReportPagesNums
    },
    focusModalCloseButton (modalRef) {
      this.$refs[modalRef].$refs.closeButton.focus()
    },
    bindKeys() {
      const self = this
      Mousetrap.bind(['command+p', 'ctrl+p'], function(e) {
        self.printAnnualReportPage()
        return false;
      });
      Mousetrap.bind(['command+d', 'ctrl+d'], function(e) {
        self.downloadAnnualReportPage()
        return false;
      });
      Mousetrap.bind('left', function(e) {
        self.decrementPage()
        return false;
      });
      Mousetrap.bind('right', function(e) {
        self.incrementPage()
        return false;
      });
      Mousetrap.prototype.stopCallback = function () {
        return false;
      }
    },
    unbindKeys() {
      Mousetrap.unbind(['command+p', 'ctrl+p']);
      Mousetrap.unbind(['command+d', 'ctrl+d']);
      Mousetrap.unbind('left');
      Mousetrap.unbind('right');
    },
    decrementPage() {
      if(this.currentPage <= 1) {
        this.currentPage = this.annualReportPages.length;
      } else {
        this.currentPage--;
      }
    },
    incrementPage() {
      if(this.currentPage >= this.annualReportPages.length) {
        this.currentPage = 1;
      } else {
        this.currentPage++;
      }
    },
    printAnnualReportPage () {
      if (this.alreadyPressed) {
        return
      }
      document.body.appendChild(this.printPageSections[this.currentPage-1])
      try {
        this.alreadyPressed = true
        window.print()
      } finally {
        this.alreadyPressed = false
        document.body.removeChild(this.printPageSections[this.currentPage-1])
      }
    },
    printTotalReport () {
      if (this.alreadyPressed) {
        return
      }
      document.body.appendChild(this.printTotalReportSection)
      try {
        this.alreadyPressed = true
        window.print()
      } finally {
        this.alreadyPressed = false
        document.body.removeChild(this.printTotalReportSection)
      }
    },
    printAnnualReport () {
      if (this.alreadyPressed) {
        return
      }
      document.body.appendChild(this.printAnnualReportSection)
      try {
        this.alreadyPressed = true
        window.print()
      } finally {
        this.alreadyPressed = false
        document.body.removeChild(this.printAnnualReportSection)
      }
    },
    async downloadAnnualReportPage () {
      if (this.alreadyPressed) {
        return
      }
      this.hideTooltip('')
      document.body.appendChild(this.printPageSections[this.currentPage-1])
      try {
        this.alreadyPressed = true
        const res = await annualReportController.createAnnualReportPdf()
        if (!res.err) {
            const self = this
            saveAs('/annual-report.pdf', this.phrases.annualReportFileName + '-' + this.year + '-' + this.phrases.page +  '-' + this.currentPage  + '.pdf', err => {
              if (err) {
                self.openErrorModal(self.phrases.saveError)
              }
            })
          } else {
            this.openErrorModal(res.err)       
          }
      } finally {
        this.alreadyPressed = false
        document.body.removeChild(this.printPageSections[this.currentPage-1])
      }
    },
    async downloadTotalReport () {
      if (this.alreadyPressed) {
        return
      }
      document.body.appendChild(this.printTotalReportSection)
      try {
        this.alreadyPressed = true
        const res = await annualReportController.createAnnualReportPdf()
        if (!res.err) {
            const self = this
            saveAs('/annual-report.pdf', this.phrases.totalReportFileName + (this.year ? '-' + this.year : '' ) + '.pdf', err => {
              if (err) {
                self.openErrorModal(self.phrases.saveError)
              }
            })
          } else {
            this.openErrorModal(res.err)       
          }
      } finally {
        this.alreadyPressed = false
        document.body.removeChild(this.printTotalReportSection)
      }
    },
    async downloadAnnualReport () {
      if (this.alreadyPressed) {
        return
      }
      document.body.appendChild(this.printAnnualReportSection)
      try {
        this.alreadyPressed = true
        const res = await annualReportController.createAnnualReportPdf()
        if (!res.err) {
            const self = this
            saveAs('/annual-report.pdf', this.phrases.annualReportFileName + (this.year ? '-' + this.year : '' ) + '.pdf', err => {
              if (err) {
                self.openErrorModal(self.phrases.saveError)
              }
            })
          } else {
            this.openErrorModal(res.err)       
          }
      } finally {
        this.alreadyPressed = false
        document.body.removeChild(this.printAnnualReportSection)
      }
    },
    preparePagePrintSection (style, pageIndex) {
      var section = document.createElement('div')
      section.id = 'print-annual-report'
      section.innerHTML = style
      if (pageIndex != null) {
        var page = document.createElement('div')
        page.innerHTML = this.annualReportPages[pageIndex]
        section.appendChild(page)
      }
      return section
    },
    prepareTotalReportPrintSection (style) {
      var section = document.createElement('div')
      section.id = 'print-annual-report'
      section.innerHTML = style
      var page = document.createElement('div')
      page.innerHTML = this.annualReportPages[this.annualReportPages.length-1]
      section.appendChild(page)
      for (let i = 0; i < this.annualReportPages.length - 1; i++) {
        let annualReportPage = this.annualReportPages[i]
        if (annualReportPage.startsWith('<style accesskey="13">') || annualReportPage.startsWith('<style accesskey="14">')) {
          var page = document.createElement('div')
          page.innerHTML = annualReportPage
          section.appendChild(page)
        }
      }
      return section
    },
    prepareAnnualReportPrintSection (style) {
      var section = document.createElement('div')
      section.id = 'print-annual-report'
      section.innerHTML = style
      for (let i = 0; i < this.annualReportPages.length - 1; i++) {
        if (i == 1) {
          // empty page
          let page = document.createElement('div')
          page.innerHTML = '<div style="page-break-before: always;">&nbsp;</div>'
          section.appendChild(page)
        }
        let annualReportPage = this.annualReportPages[i]
        let page = document.createElement('div')
        page.innerHTML = annualReportPage
        section.appendChild(page)
      }
      return section
    },
    openErrorModal(error) {
      this.errorText = error
      this.$root.$emit('bv::show::modal', 'annual-report-error-modal')
    },
    hideTooltip (elementId) {
      if (elementId) {
        this.$root.$emit('bv::hide::tooltip', elementId)
      } else {
        this.$root.$emit('bv::hide::tooltip')
      }
    },
    closeModal () {
        this.$root.$emit('bv::hide::modal', this.parentModal)
    }
  },
  components: { MessageConfirmDialog }
}
</script>

<style scoped>
input {
  text-align: center;
  font-family: "Times New Roman";
  font-size: 95%;
  letter-spacing: 95%;
  height:20px;
  border-bottom: .5pt solid black !important;
  border-radius: 0 !important;
}
#modalCancelBtn {
  position: relative;
  bottom: 30px;
}
#currentPageInput {
  width: 38px;
  max-width: 38px;
  border-style: none;
  display: inline;
}

.pageCount {
  position: relative;
  top: 7px;
}

.headline >>> #headline {
	transform: scale(0.6);
	position:relative;
  bottom:50px;
  left:223px;
}

.manualPage >>> #manual-page {
	transform: scale(0.6);
	position:relative;
  bottom:276px;
  right:310px;
}

.incomePage >>> #income-page {
	transform: scale(0.6);
	position:relative;
	bottom: 271px;
	right: 385px;
}
.outcomePage >>> #outcome-page {
	transform: scale(0.6);
	position:relative;
	bottom: 276px;
	right: 383px;
}

.totalIncomePage >>> #total-income-page {
  transform: scale(0.6);
	position:relative;
	bottom: 235px;
	right: 394px;
}

.totalOutcomePage >>> #total-outcome-page {
  transform: scale(0.6);
	position:relative;
	bottom: 291px;
	right: 395px;
}

.sharesPage >>> #shares-page {
  transform: scale(0.6);
  position:relative;
  bottom: 235px;
  right: 297px;
}

.totalPage >>> #total-page {
	transform: scale(0.6);
	position:relative;
	bottom: 226px;
	right: 143px;
}

.totalHeadline >>> #total-headline {
	transform: scale(0.6);
	position:relative;
  bottom:50px;
  left:223px;
}

i {
  border: solid #514A4A;
  border-width: 0 5px 5px 0;
  display: inline-block;
  padding: 3px;
}

.right {
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
}

.left {
  transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
}
</style>
