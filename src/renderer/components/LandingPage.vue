<template>
<b-container fluid>
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
    margin-top: 20px;
    margin-bottom: 20px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
</style>
