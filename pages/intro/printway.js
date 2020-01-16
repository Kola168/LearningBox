Page({
	
	data: {
    type: '',
    images: {
      'preschool': [
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/preschool_learningway1.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/preschool_learningway2.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/preschool_learningway3.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/preschool_learningway4.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/preschool_learningway5.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/preschool_learningway6.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/preschool_learningway7.jpg',
      ],
      'subject': [
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway1.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway2.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway3.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway4.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway5.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway6.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway7.jpg',
				'https://cdn-h.gongfudou.com/LearningBox/main/introduction/subject_learningway8.jpg',
      ]
    }
  },



	onLoad: function (options) {
		console.log('options======',options)
    this.setData({
      type: options.type
    })
  },

})