<template>
  <b-container fluid>
    <b-row>
      <b-col cols=11>
        <img v-show="type=='warning'" src="~@/assets/warning.png">
        <img v-show="type=='error'" src="~@/assets/error.png">
      </b-col>
      <b-col>
        <b-button id="closeButton" ref="closeButton" @click.stop="closeDialog()" variant="link" class="btn-xs float-right">
          <img src="~@/assets/close.png">
        </b-button>
      </b-col>
    </b-row>
    <b-row v-show="text">
      <b-col>
        <pre class="mainText">{{text}}</pre>
      </b-col>
    </b-row>
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
      this.$emit('closed')
    },
    confirm () {
      this.$emit('confirmed')
      this.closeDialog()
    }
  }
}
</script>

<style scoped>
.mainText {
  font-family:'Times New Roman'; 
  word-wrap: break-word; 
  white-space: pre-wrap;
  font-size:100%;
}
.subText {
  font-size: 95%;
  color: #888585;
}
</style>