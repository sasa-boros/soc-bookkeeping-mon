<template>
<b-container fluid class="no-margins-and-pads">
  <div id="wrapper">
    <main>
      <app-tabs></app-tabs>
    </main>
  </div>
  </b-container>
</template>

<script>
  import AppTabs from './LandingPage/AppTabs'

  export default {
    name: 'landing-page',
    components: { AppTabs },
    methods: {
    }
  }
</script>

<style>
  #wrapper {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
</style>
