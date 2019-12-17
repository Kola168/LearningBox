// pages/package_feature/print_ calendar/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: [],
    diy_calendar: [
      'https://cdn-h.gongfudou.com/LearningBox/feature/diy/calendar_diy_1.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/diy/calendar_diy_2.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/diy/calendar_diy_3.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/diy/calendar_diy_4.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/diy/calendar_diy_5.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/diy/calendar_diy_6.png',
    ],
    wood_calendar: [
      'https://cdn-h.gongfudou.com/LearningBox/feature/wood/calendar_solid_wood_1.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/wood/calendar_solid_wood_2.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/wood/calendar_solid_wood_3.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/wood/calendar_solid_wood_4.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/wood/calendar_solid_wood_5.png',
      'https://cdn-h.gongfudou.com/LearningBox/feature/wood/calendar_solid_wood_6.png',
    ],
    titleName:'',
  },
  name:{
    diy_calendar:'DIY生活台历',
    wood_calendar:'实木相框台历',
  },
  onLoad: function(options) {
    this.type=options.type
    this.setData({
      urls:this.data[this.type],
      titleName:this.name[this.type]
    })
  },
  buysth: function() {

  },
  toedit: function(e) {
    try {
      wxNav.navigateTo('/pages/package_feature/print_calendar/edit',{
        type:this.type
      })
    } catch (e) {
      console.log(e)
    }

  },
})
