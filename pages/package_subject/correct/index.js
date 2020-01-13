const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util,
  storage
} from "../../../utils/common_import"
const event = require('../../../lib/event/event')
import api from '../../../network/restful_request'
import gql from '../../../network/graphql_request'
import subjectGql from '../../../network/graphql/subject'
Page({
  data: {
    isMember: false,
    areaHeight: 0,
    showSerial: false,
    isFullScreen: false,
    currentTopic: null,
    title: '批改',
    loadReady: false,
    topicsResult: [], //批改结果
    currentResult: null, //当前题目批改结果
    topicIndex: 0, //当前批改索引,
    currentTopicType: 'single', //single客观小题,multipleObj客观大题,multipleSub主观大题
    progress: 0,
    multipleObjResult: [], //multipleObj客观大题大题结果
    showProgessModal: false,
    modalObj: {
      isShow: false,
      hasCancel: true,
      content: '您已批改过次练习，重复批改有可能会导致数据不精准',
      cancelText: '不批改',
      confirmText: '无所谓'
    }
  },
  onLoad: co.wrap(function* (query) {
    event.on('authorize', this, () => {
      this.setData({
        isAuth: app.isScope()
      })
      this.getCorrectPaper()
    })
    let isAuth = yield app.isScope()
    if (!isAuth) {
      return wxNav.navigateTo("/pages/authorize/index")
    }
    let areaHeight = 0
    if (app.navBarInfo) {
      areaHeight = app.sysInfo.screenHeight - app.navBarInfo.topBarHeight
    } else {
      areaHeight = app.sysInfo.screenHeight - app.getNavBarInfo().topBarHeight
    }
    this.setData({
      areaHeight,
      isFullScreen: app.isFullScreen
    })
    this.weToast = new app.weToast()
    let scene = query.scene
    this.correctId = Number(scene.split('_')[1])
    this.correctType = scene.split('_')[2] === 'paper' ? 'XuekewangUserPaper' : 'XuekewangExercise' //批改类型
    this.singleTopicIds = new Set()
    this.getUserMemberInfo()
  }),

  getUserMemberInfo: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gql.getUserMemberInfo()
      let isMember = res.currentUser.isSchoolAgeMember
      this.setData({
        isMember: isMember,
        loadReady: isMember ? false : true
      })
      if (isMember) {
        this.getCorrectPaper()
      } else {
        this.weToast.hide()
      }
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 获取试卷内容
  getCorrectPaper: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield api.getCorrectPaper(this.correctId, this.correctType)
      if (resp.code != 0) {
        throw (resp)
      }
      let tempData = resp.res
      this.paperId = tempData.paper_id
      this.topics = tempData.questions
      let currentTopic = this.topics[0],
        formatResult = this.formatTopic(currentTopic),
        topicsResult = new Array(this.topics.length)
      this.subjectName = tempData.subject_name
      this.currentTopicId = currentTopic.ques_id
      this.setData({
        loadReady: true,
        title: tempData.title,
        currentTopicType: formatResult.topicType,
        topicsResult: topicsResult,
        currentTopic: formatResult.currentTopic,
        ['modalObj.isShow']: tempData.corrected
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  // 推出批改
  exitCorrect() {
    wxNav.switchTab('/pages/index/index')
  },

  // 展开快速选择
  unfoldSerial() {
    this.setData({
      showSerial: !this.data.showSerial
    })
  },

  // 切换题目
  changeTopic(e) {
    let index = e.currentTarget.dataset.index,
      tagetResult = this.data.topicsResult[index]
    if (tagetResult != null) {
      let formatResult = this.formatTopic(this.topics[index])
      this.changeTopicIndex = index //切换题目index
      this.changeTopicFlag = true //切换题目nextTopicIndex不增加
      this.currentTopicId = formatResult.currentTopic.ques_id
      this.setData({
        currentTopic: formatResult.currentTopic,
        currentTopicType: formatResult.topicType,
        topicIndex: index,
        currentResult: tagetResult.point
      })
    }
  },
  // 选择题目分数
  checkScore(e) {
    let currentResult = Number(e.currentTarget.dataset.point)
    if (this.data.currentTopicType === 'multipleObj') {
      if (currentResult === 100) {
        let multipleObjResult = this.data.multipleObjResult
        for (let i = 0; i < multipleObjResult.length; i++) {
          multipleObjResult[i] = 0
        }
        this.setData({
          currentResult,
          multipleObjResult
        })
      } else {
        let index = e.currentTarget.dataset.index,
          setKey = `multipleObjResult[${index}]`,
          multipleObjResult = this.data.multipleObjResult,
          selectCount = 0
        multipleObjResult[index] = multipleObjResult[index] ? 0 : 1
        for (let i = 0; i < multipleObjResult.length; i++) {
          if (multipleObjResult[i]) {
            selectCount = selectCount + 1
          }
        }
        selectCount = multipleObjResult.length - selectCount
        currentResult = Math.ceil((selectCount / multipleObjResult.length) * 100)
        this.setData({
          [setKey]: multipleObjResult[index] ? 1 : 0,
          currentResult: currentResult
        })
      }
    } else {
      this.setData({
        currentResult
      })
    }
  },
  // 下一题
  nextTopic() {
    let currentResult = this.data.currentResult
    if (currentResult != null) {
      let dataKey = `topicsResult[${this.data.topicIndex}]`,
        nextTopicIndex = this.data.topicIndex + 1,
        parent = true

      if (this.data.currentTopicType === 'multipleObj') {
        let multipleObjResult = this.data.multipleObjResult
        let hasSingleTopic = multipleObjResult.some((val) => { //是否选择了小题
          return val == 1
        })
        if (hasSingleTopic) {
          let currentTopic = this.data.currentTopic
          for (let i = 0; i < multipleObjResult.length; i++) {
            if (multipleObjResult[i]) {
              this.singleTopicIds.add(currentTopic.children[i].ques_id)
            } else {
              let reCorrect = this.singleTopicIds.has(currentTopic.children[i].ques_id)
              if (reCorrect) {
                this.singleTopicIds.delete(currentTopic.children[i].ques_id)
              }
            }
          }
        }
      }

      if (this.changeTopicFlag) { //重新批改
        dataKey = `topicsResult[${this.changeTopicIndex}]`
        nextTopicIndex = this.data.topicIndex + 1
      }
      let dataObj = {
        [dataKey]: {
          point: this.data.currentResult,
          questionId: this.currentTopicId,
          parent
        }
      }
      if (nextTopicIndex === this.data.topicsResult.length) { //最后一题
        this.setData(dataObj)
        this.preSubmit()
      } else {
        let formatResult = this.formatTopic(this.topics[nextTopicIndex])
        dataObj.currentResult = null
        dataObj.topicIndex = nextTopicIndex
        dataObj.currentTopic = formatResult.currentTopic
        dataObj.currentTopicType = formatResult.topicType
        this.setData(dataObj)
        this.changeTopicFlag = false
        this.currentTopicId = formatResult.currentTopic.ques_id
      }
    }
  },

  // 提交答案
  preSubmit: co.wrap(function* () {
    this.setData({
      showProgessModal: true,
      progress: 0
    })
    try {
      let topicsResult = this.data.topicsResult,
        singleTopicIds = [...this.singleTopicIds],
        tempSingleTopicIds = []
      for (let i = 0; i < singleTopicIds.length; i++) {
        tempSingleTopicIds.push({
          point: 0,
          questionId: singleTopicIds[i],
          parent: false
        })
      }
      topicsResult = topicsResult.concat(tempSingleTopicIds)
      let res = yield subjectGql.submitCorrect(topicsResult, this.correctType, this.paperId)
      if (res.submitXuekewangWrongQuestion.state) {
        if (this.correctType === 'XuekewangExercise') {
          wxNav.navigateTo()
        } else {
          this.workerId = res.submitXuekewangWrongQuestion.workerSn
          this.setData({
            progress: this.data.progress + 10
          })
          this.getWorkerSn()
        }
      }
    } catch (e) {
      this.setData({
        showProgessModal: false
      })
      util.showError(e)
    }
  }),

  getWorkerSn: co.wrap(function* () {
    try {
      let resp = yield api.synthesisSnResult(this.workerId)
      if (resp.code !== 0) {
        this.setData({
          progress: 0,
          showProgessModal: false
        })
        throw (resp)
      }
      if (resp.res.state === 'send') {
        setTimeout(() => {
          if (this.data.progress < 90) {
            this.setData({
              progress: this.data.progress + 20
            })
          }
          this.getWorkerSn()
        }, 2000)
        return
      } else if (resp.res.state === 'finished') {
        this.setData({
          progress: 100,
          showProgessModal: false
        }, () => {
          wxNav.navigateTo('../report/index', {
            sn: resp.res.sn,
            from: 'correct'
          })
        })
      }
    } catch (e) {
      util.showError(e)
    }
  }),

  // 学科会员介绍
  toMemberIntro(e) {
    if (app.preventMoreTap(e)) return
    wxNav.navigateTo("../member_intro/index")
  },

  // 授权
  toAuth(e) {
    if (app.preventMoreTap(e)) return
    wxNav.navigateTo("/pages/authorize/index")
  },

  // 格式化题目
  formatTopic(currentTopic) {
    let formatCurrentTopic = Object.assign({}, currentTopic),
      tempArr = [],
      topicType = ''
    if ((formatCurrentTopic.option !== '{}' || !formatCurrentTopic.option) && formatCurrentTopic.children.length === 0) {
      let options = formatCurrentTopic.option,
        forObj = Object.keys(options)
      for (let i = 0; i < forObj.length; i++) {
        let itemArr = [forObj[i], options[forObj[i]]]
        tempArr.push(itemArr)
      }
      topicType = 'single'
      formatCurrentTopic.option = tempArr
    } else if (formatCurrentTopic.children && formatCurrentTopic.children.length > 0) {
      let children = formatCurrentTopic.children
      if (this.subjectName === '语文' || this.subjectName === '英语') {
        topicType = 'multipleObj'
        let multipleObjResult = []
        for (let k = 0; k < children.length; k++) {
          multipleObjResult.push(0)
        }
        this.setData({
          multipleObjResult
        })
      } else {
        topicType = 'multipleSub'
      }
      for (let i = 0; i < children.length; i++) {
        tempArr = []
        let forObj = Object.keys(children[i].option)
        for (let j = 0; j < forObj.length; j++) {
          let itemArr = [forObj[j], children[i].option[forObj[j]]]
          tempArr.push(itemArr)
        }
        formatCurrentTopic.children[i].option = tempArr
      }
    }
    return {
      currentTopic: formatCurrentTopic,
      topicType: topicType
    }
  },
  onUnload() {
    event.remove('authorize', this)
  }
})
