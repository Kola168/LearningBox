const app = getApp()
import {
  regeneratorRuntime,
  wxNav,
  co,
  util
} from "../../../../utils/common_import"
import computedTime from '../../components/choose-time-range/computedTime'
import graphql from '../../../../network/graphql/subject'
import getLoopsEvent from '../../../../utils/worker'
Page({
  data: {
    loadReady: false,
    isMember: true,
    memberExpired: true,
    navBarHeight: 0,
    noticeHeight: 0,
    showFilter: false,
    filterType: '',
    modalType: '',
    totalCount: 0,
    modalObj: {
      isShow: false,
      slotBottom: false,
      slotContent: false,
      title: '开通学科会员 小白帮你消灭错题',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/toast_super_errorbook.png'
    },
    timeRange: {
      appoint: ['today', 'yesterday'],
      dayRange: [7]
    },
    learnCaseList: [{
      id: 0,
      key: '全部'
    }, {
      id: 1,
      key: '已学会'
    }, {
      id: 2,
      key: '未学会'
    }],
    errorbookList: [],
    showDatePicker: false, //日期选择
    dateRange: {},
    activeFilterList: [],
    activeLearnCase: '',
    knowledgeList: [],
    typeList: [],
    activeKnowledge: '',
    activeType: '',
    hasChooseDate: false,
    showHandleBar: false,
    checkSomeone: false,
    modalKnowledgeList: [],
    markLearnFlag: false //是否已学会
  },
  onLoad: co.wrap(function* (query) {
    this.page = 1
    this.pageEnd = false
    this.weToast = new app.weToast()
    this.subjectSn = query.sn
    this.markIndexs = new Set()
    this.setData({
      navBarHeight: app.navBarInfo ? app.navBarInfo.topBarHeight : app.getNavBarInfo().topBarHeight,
      areaHeight: app.sysInfo.screenHeight,
      dateRange: computedTime.getCurrentDayToDayFn(7),
      noticeHeight: this.data.memberExpired ? 20 : 0,
      isMember: Boolean(Number(query.isMember)),
      expiresAt: query.expiresAt
    })
    yield this.getErrorbookFilters()
  }),

  // 获取过滤选项
  getErrorbookFilters: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getErrorbookFilters(this.subjectSn, this.data.dateRange.startDate, this.data.dateRange.endDate)
      this.setData({
        knowledgeList: res.xuekewang.errorBookKnowledges,
        typeList: res.xuekewang.errorBookTypeNames
      })
      this.getErrorbookList()
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 获取列表
  getErrorbookList: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let learnCase = this.data.activeLearnCase
      learnCase = this.formatLearnCase(learnCase)
      let res = yield graphql.getErrorbookList(this.subjectSn, this.data.dateRange.startDate, this.data.dateRange.endDate, this.data.activeKnowledge, this.data.activeType, learnCase, this.page++)
      let tempData = res.xuekewang.errorBooks,
        errorBookList = this.data.errorbookList
      if (tempData.books.length < 5) {
        this.pageEnd = true
      }
      for (let i = 0; i < tempData.books.length; i++) {
        tempData.books[i].isCheck = false
      }
      this.setData({
        loadReady: true,
        totalCount: tempData.totalCount,
        errorbookList: errorBookList.concat(tempData.books)
      })
      this.weToast.hide()
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 选择题目
  checkItem(e) {
    if ([...this.markIndexs].length === 10) {
      return wx.showToast({
        title: '一次最多选择 10 道题'
      })
    } else {
      let index = e.currentTarget.dataset.index,
        setKey = `errorbookList[${index}].isCheck`
      if (this.markIndexs.has(index)) {
        this.markIndexs.delete(index)
      } else {
        this.markIndexs.add(index)
      }
      this.setData({
        [setKey]: !this.data.errorbookList[index].isCheck
      })
      this.hasCheckSomeone()
    }
  },

  // 显示选择列表
  showFilter(e) {
    let id = e.currentTarget.id
    if (id === 'date') {
      this.setData({
        showDatePicker: true
      })
    } else {
      this.setData({
        showFilter: true,
        filterType: id,
        activeFilterList: this.data[id + 'List']
      })
    }
  },

  // 隐藏过滤列表
  hideFilter() {
    this.setData({
      showFilter: false,
      filterType: ''
    })
  },

  // 选择过滤选项
  checkFilter(e) {
    let key = e.currentTarget.dataset.key,
      filterType = this.data.filterType.slice(0, 1).toUpperCase() + this.data.filterType.slice(1),
      dataKey = `active${filterType}`,
      markLearnFlag = this.data.markLearnFlag
    this.page = 1
    this.pageEnd = false

    if (filterType === 'learnCase') {
      let formatLearnCase = this.formatLearnCase(key)
      if (formatLearnCase < 2) {
        markLearnFlag = false
      } else {
        true
      }
    }
    this.setData({
      [dataKey]: key,
      activeFilter: key,
      errorbookList: [],
      markLearnFlag,
      showHandleBar: false
    })
    this.getErrorbookList()
    this.hideFilter()
    this.hasCheckSomeone()
  },

  // 显示操作栏
  showHandleBar() {
    this.setData({
      showHandleBar: !this.data.showHandleBar
    })
    this.hasCheckSomeone()
  },

  // 是否有选中
  hasCheckSomeone() {
    let errorbookList = this.data.errorbookList,
      markLearnFlag = this.data.markLearnFlag,
      checkSomeone = errorbookList.some((item) => {
        return item.isCheck
      })
    if (checkSomeone) {
      for (let i = 0; i < errorbookList.length; i++) { // 如果选中题目有已学会和未学会
        if (errorbookList[i].isCheck) {
          if (!errorbookList[i].deletedAt) {
            markLearnFlag = false
          } else {
            markLearnFlag = true
          }
        }
      }
    }
    this.setData({
      checkSomeone,
      markLearnFlag
    })
  },

  // 显示知识点
  showKnowledgeModal(e) {
    let index = e.currentTarget.dataset.index,
      modalKnowledgeList = this.data.errorbookList[index].xuekewangQuestion.xuekewangKnowledges
    this.setData({
      modalKnowledgeList
    })
    this.showModal({
      currentTarget: {
        dataset: {
          type: 'knowledge'
        }
      }
    })
  },

  // 显示模态框
  showModal(e) {
    let type = e.currentTarget.dataset.type,
      dataObj = {
        modalType: type,
        modalObj: {
          isShow: true
        }
      }
    if (type === 'knowledge') {
      dataObj.modalObj.slotBottom = false
      dataObj.modalObj.slotContent = true
      dataObj.modalObj.title = "本题所含知识点"
    } else {
      dataObj.modalObj.slotBottom = true
      dataObj.modalObj.slotContent = false
      dataObj.modalObj.image = 'https://cdn-h.gongfudou.com/LearningBox/subject/toast_super_errorbook.png'
      dataObj.modalObj.title = "开通学科会员 小白帮你消灭错题"
    }
    this.setData(dataObj)
  },

  // 按钮事件 
  handleBtnClick(e) {
    if (!this.data.checkSomeone) return
    if (app.preventMoreTap(e)) return
    if (!this.data.isMember && this.data.expiresAt) {
      this.showModal({
        currentTarget: {
          dataset: {
            type: 'member'
          }
        }
      })
      return
    }
    let type = e.currentTarget.id,
      errorbookList = this.data.errorbookList,
      ids = [],
      markIndexs = [...this.markIndexs]
    for (let i = 0; i < markIndexs.length; i++) {
      ids.push(errorbookList[markIndexs[i]].xuekewangQuestion.quesId)
    }
    this.quesIds = ids
    switch (type) {
      case "mark":
        this.markTopics()
        break
      case "parallel":
        this.createTopics('similarity')
        break
      case "origin":
        this.createTopics('error')
        break
    }
  },

  // 标记已学会/未学会
  markTopics: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let markType = this.data.markLearnFlag ? 'create' : 'destroy',
        markIndexs = [...this.markIndexs]
      let res = yield graphql.markErrorbook(this.quesIds, markType)
      if (res.markXuekewangWrongQuestion.state) {
        for (let i = 0; i < markIndexs.length; i++) {
          let setKey = `errorbookList[${markIndexs[i]}].deletedAt`
          this.setData({
            [setKey]: !this.data.markLearnFlag
          })
        }
        this.hasCheckSomeone()
        this.weToast.hide()
      }
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 打印错题/平行题
  createTopics: co.wrap(function* (type) {
    this.weToast.toast({
      type: 'loading'
    })
    getLoopsEvent({
      feature_key: 'xuekewang_exercise',
      worker_data: {
        exercise_type: type,
        subject_sn: this.subjectSn,
        ques_ids: this.quesIds
      }
    }, (res) => {
      if (res.status === 'finished') {
        wxNav.navigateTo('../../sync_learn/preview_subject/index', {
          sn: res.data.sn
        })
        this.weToast.hide()
      }
    }, (error) => {
      this.weToast.hide()
      util.showError(error)
    })
  }),

  // 时间选择回调
  chooseDate(res) {
    this.setData({
      hasChooseDate: true,
      showDatePicker: false,
      dateRange: {
        startDate: res.detail.startDate,
        endDate: res.detail.endDate,
        displayStartAt: res.detail.startDate.slice(5).replace('-', '/'),
        displayEndAt: res.detail.startDate.slice(5).replace('-', '/')
      }
    })
    this.getErrorbookList()
  },
  buyMember(e) {
    if (app.preventMoreTap(e)) return
    wxNav.navigateTo("/pages/package_member/member/index")
  },
  toDetail(e) {
    if (app.preventMoreTap(e)) return
    let id = e.currentTarget.dataset.id
    wxNav.navigateTo('../errorbook/detail', {
      id
    })
  },
  // 格式化学会情况
  formatLearnCase(text) {
    switch (text) {
      case "未学会":
        return 2
        break
      case "已学会":
        return 1
        break
      default:
        return 0
        break
    }
  },
  onReachBottom() {
    if (this.pageEnd) return
    this.getErrorbookList()
  }
})