<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <img v-show="type=='warning'" src="~@/assets/warning.png">
        <img v-show="type=='error'" src="~@/assets/error.png">
      </b-col>
      <b-col>
        <b-button ref="closeButton" @click.stop="closeDialog()" variant="link" class="btn-xs float-right">
          <img src="~@/assets/close.png">
        </b-button>
      </b-col>
    </b-row>
    <b-row v-show="text">
      <b-col>
        <div> 
          {{text}} 
        </div>
      </b-col>
    </b-row>
    <br>
    <b-row v-show="subText">
      <b-col>
        <div class="subText"> 
          {{subText}} 
        </div>
      </b-col>
    </b-row>
    <hr>
    <b-row>
      <b-col>
        <b-button ref="confirmButton" v-show="type=='confirm'" @click.stop="confirm()" variant="secondary" class="btn-xs">
          {{confirmText}}
        </b-button>
        &nbsp;
        <b-button ref="cancelOkButton" @click.stop="closeDialog()" variant="light" class="btn-xs">
          {{cancelOkText}}
        </b-button>
      </b-col>
     </b-row>
  </b-container>
</template>

<script>

export default {
  props: {
    parentModal: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info'
    },
    text: {
      type: String,
      default: ''
    },
    subText: {
      type: String,
      default: ''
    },
    cancelOkText: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: ''
    }
  },
  methods: {
    closeDialog () {
      this.$root.$emit('bv::hide::modal', this.parentModal)
    },
    confirm () {
      this.$emit('confirmed')
      this.closeDialog()
    }
  }
}
</script>

<style scoped>
.subText {
  color: #8e8e8e;
  font-size:10.0pt;
}
</style>