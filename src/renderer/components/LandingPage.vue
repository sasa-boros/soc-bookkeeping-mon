<template>
  <b-container fluid class="no-margins-and-pads">
    <main>
      <app-tabs></app-tabs>
    </main>
  </b-container>
</template>

<script>
import AppTabs from './LandingPage/AppTabs'

export default {
  name: 'landing-page',
  components: { AppTabs }
}
</script>