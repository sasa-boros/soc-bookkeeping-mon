<template>
  <b-container fluid class="no-margins-and-pads">
    <b-card no-body class="fullHeight">
      <b-tabs class="fullHeight" card active fill no-fade vertical pills>
        <b-tab class="appTab no-margins-and-pads" v-on:click="scrollToTop">
          <template slot="title">
            <img src="~@/assets/annual-report.png" class="appTabsIcon">&nbsp;  
            <span class="navText">{{phrases.annualReport}}</span>
          </template>
          <annual-report-pane></annual-report-pane>
        </b-tab>
        <b-tab disabled>
          <template slot="title">
            <hr>
          </template>
        </b-tab>
        <b-tab class="appTab" v-on:click="scrollToTop">
          <template slot="title">
            <img src="~@/assets/about.png" class="appTabsIcon">&nbsp;
            <span class="navText">{{phrases.about}}</span>
          </template>
          <about-pane></about-pane>
        </b-tab>
        <b-tab class="appTab" v-on:click="scrollToTop" >
          <template slot="title">
            <img src="~@/assets/settings.png" class="appTabsIcon">&nbsp; 
            <span class="navText">{{phrases.settings}}</span> 
          </template>
          <settings-pane v-on:updateZoomLevel="updateZoomLevel"></settings-pane>
        </b-tab>
      </b-tabs>
    </b-card>
  </b-container>
</template>

<script>
  import AnnualReportPane from './AppTabs/AnnualReportPane'
  import AboutPane from './AppTabs/AboutPane'
  import SettingsPane from './AppTabs/SettingsPane'

  const {webFrame} = require('electron')
  const Big = require('big.js')
  const i18n = require('../../../translations/i18n')

  export default {
    data () {
      return {
        phrases: {
          annualReport: i18n.getTranslation('Annual report'),
          about: i18n.getTranslation('About'),
          settings: i18n.getTranslation('Settings')
        },
        zoomLevel: Big(1.2)
      }
    },
    mounted () {
      this.bindKeys()
    },
    beforeDestroy () {
      this.unbindKeys()
    },
    methods: {
      scrollToTop () {
        window.scrollTo({ top: 0});
      },
      bindKeys() {
        const self = this
        Mousetrap.bind(['command+=', 'ctrl+='], function(e) {
          e.preventDefault()
          self.increaseZoomLevel()
          return false
        });
        Mousetrap.bind(['command+-', 'ctrl+-'], function(e) {
          e.preventDefault()
          self.decreaseZoomLevel()
          return false
        });
        Mousetrap.prototype.stopCallback = function () {
          return false
        }
      },
      unbindKeys() {
        Mousetrap.unbind(['command+=', 'ctrl+='])
        Mousetrap.unbind(['command+-', 'ctrl+-'])
      },
      increaseZoomLevel () {
        if(!this.zoomLevel.gte(1.7)) {
          this.zoomLevel = this.zoomLevel.plus(0.1)
          webFrame.setZoomFactor(parseFloat(this.zoomLevel))
        }
      },
      decreaseZoomLevel () {
        if(!this.zoomLevel.lte(0.7)) {
          this.zoomLevel = this.zoomLevel.minus(0.1)
          webFrame.setZoomFactor(parseFloat(this.zoomLevel))
        }
      },
      updateZoomLevel (zoomLevel) {
        this.zoomLevel = Big(zoomLevel)
        const newZoomLevel = parseFloat(this.zoomLevel)
        if (webFrame.getZoomFactor() != newZoomLevel) {
          webFrame.setZoomFactor(newZoomLevel)
        }
      }
    },
    components: { AnnualReportPane, AboutPane, SettingsPane }
  }
</script>

<style scoped>
  .hidden {
    visibility:hidden;
  }
  .fullHeight {
    min-height: 99vh;
  }
</style>