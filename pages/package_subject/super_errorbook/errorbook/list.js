import { wxNav } from "../../../../utils/common_import"

const app = getApp()
Page({
  data: {
    isMember: true,
    navBarHeight: 0,
    showFilter: true,
    modalObj: {
      isShow: false,
      slotBottom: true,
      title: '开通学科会员 小白帮你消灭错题',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/toast_super_errorbook.png'
    },
    learnCases: [{
      id: '',
      name: '学会情况'
    }, {
      id: '',
      name: '已学会'
    }, {
      id: '',
      name: '未学会'
    }],
    activeFilter: {},
    activeFilterList: []
  },
  onLoad() {
    this.setData({
      navBarHeight: app.navBarInfo ? app.navBarInfo.topBarHeight : app.getNavBarInfo().topBarHeight
    })
  },
  showFilter(e) {
    let id = e.currentTarget.id,
      dataObj = {
        showFilter: true
      }
    this.showFilterType = id ? id : this.showFilterType
    if (id === 'knowledge') {
      // dataObj.activeFilter = this.data.activeArea
      dataObj.activeFilterList = this.data.areas
    } else if (id === 'type') {
      // dataObj.activeFilter = this.data.activeGrade
      dataObj.activeFilterList = this.data.grades
    } else if (id === 'learnCase') {
      // dataObj.activeFilter = this.data.activeGrade
      dataObj.activeFilterList = this.data.learnCases
    } else {
      return wxNav.navigateTo()
    }
    this.setData(dataObj)
  },
  hideFilter() {
    this.setData({
      showFilter: false
    })
  },
  checkFilter() {

  },
  hideFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    })
  }
})