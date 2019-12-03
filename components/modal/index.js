Component({
  properties: {
    modal: {
      type: Object,
      value: null
    },
  },
  data: {
  },
  methods: {
    tapModal() {
      return;
    },
    hideModal() {
      this.setData({
        ['modal.isShow']: false
      })
    },
    clickConfirm() {
      this.setData({
        ['modal.isShow']: false
      })
      this.triggerEvent('confirm')
    },
    clickCancel() {
      this.setData({
        ['modal.isShow']: false
      })
      this.triggerEvent('cancel')
    }
  }
})