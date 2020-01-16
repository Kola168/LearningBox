Page({
	
	data: {
    type: '',
    images: {
      'preschool': [
       //url
      ],
      'subjecr': [
        
      ]
    }
  },



	onLoad: function (options) {
    this.setData({
      type: options.type
    })
  },

})