// components/showModal/index.js
Component({

  properties: {

  },

  data: {
    modalInfo:null,
  },

  methods: {
    showModal:function(modal){
      this.setData({
        modalInfo:modal
      })
    },

    bindConfirm:function(){
      this.setData({
        modalInfo:null
      })
      this.triggerEvent('confirmBut')
    },

    bindCalcel:function(){
      this.setData({
        modalInfo:null
      })
      this.triggerEvent('calcelBut')
    }
  },

})
