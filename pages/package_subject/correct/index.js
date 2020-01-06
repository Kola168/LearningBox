const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from "../../../utils/common_import"
import api from '../../../network/restful_request'
import subjectGql from '../../../network/graphql/subject'
Page({
  data: {
    isSubjectMember: true,
    areaHeight: 0,
    showSerial: false,
    isFullScreen: false,
    currentTopic: null,
    loadReady: false,
    topicsResult: [], //批改结果
    currentResult: null, //当前题目批改结果
    topicIndex: 0, //当前批改索引,
    currentTopicType: 'single', //single客观小题,multipleObj客观大题,multipleSub主观大题
  },
  onLoad: co.wrap(function* (query) {
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
    this.paperId = scene.split('_')[1]
    this.correctType = scene.split('_')[2] === 'paper' ? 'XuekewangPaper' : 'XuekewangExercise'
    this.getCorrectPaper()
  }),
  unfoldSerial() {
    this.setData({
      showSerial: !this.data.showSerial
    })
  },
  // 获取试卷内容
  getCorrectPaper: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield api.getCorrectPaper(this.paperId, this.correctType)
      if (resp.code != 0) {
        throw (resp)
      }
      let tempData = resp.res
      this.topics = tempData.questions
      let currentTopic = this.topics[0],
        topicsResult = new Array(this.topics.length)
      currentTopic = this.formatOption(currentTopic)
      let currentTopicType = '',
        subjectName = tempData.subject_name
      if (currentTopic.children.length === 0) {
        currentTopicType = 'single'
      } else {
        if (subjectName === '语文' || subjectName === '英语') {
          currentTopicType = 'multipleObj'
        } else {
          currentTopicType = 'multipleSub'
        }
      }
      this.currentTopicId = currentTopic.ques_id
      this.setData({
        loadReady: true,
        title: tempData.title,
        currentTopicType,
        subjectName,
        topicsResult,
        currentTopic
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 切换题目
  changeTopic(e) {
    let index = e.currentTarget.dataset.index,
      tagetResult = this.data.topicsResult[index]
    if (tagetResult != null) {
      let currentTopic = this.formatOption(this.topics[index])
      this.changeTopicIndex = index //切换题目index
      this.changeTopicFlag = true //切换题目nextTopicIndex不增加
      this.currentTopicId = currentTopic.ques_id
      this.setData({
        currentTopic,
        topicIndex: index,
        currentResult: tagetResult.point
      })
    }
  },
  // 选择题目分数
  checkScore(e) {
    let currentResult = Number(e.currentTarget.dataset.point)
    this.setData({
      currentResult
    })
  },
  // 下一题
  nextTopic() {
    let currentResult = this.data.currentResult
    console.log(this.data.topicIndex)
    console.log(this.data.topicIndex + 1)
    if (currentResult != null) {
      let dataKey = `topicsResult[${this.data.topicIndex}]`,
        nextTopicIndex = this.data.topicIndex + 1

      if (this.changeTopicFlag) {
        dataKey = `topicsResult[${this.changeTopicIndex}]`
        nextTopicIndex = this.data.topicIndex + 1
      }
      // let currentTopic = this.formatOption(this.topics[nextTopicIndex])
      let dataObj = {
        [dataKey]: {
          point: this.data.currentResult,
          questionId: this.currentTopicId
        },
        currentResult: null
      }
      if (nextTopicIndex > this.data.topicsResult.length) {
        this.setData(dataObj)
        this.preSubmit()
      } else {
        let currentTopic = this.formatOption(this.topics[nextTopicIndex])
        dataObj.topicIndex = nextTopicIndex
        dataObj.currentTopic = currentTopic
        this.setData(dataObj)
        this.changeTopicFlag = false
        this.currentTopicId = currentTopic.ques_id
      }
    }
  },

  // 提交答案
  preSubmit: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.submitCorrect(this.data.topicsResult, this.correctType, this.paperId)
      console.log(res)
      this.weToast.hide()
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 格式化option
  formatOption(currentTopic) {
    let formatCurrentTopic = Object.assign({}, currentTopic),
      tempArr = [],
      hasChildren = false,
      options = {}
    if (formatCurrentTopic.option != null) {
      options = formatCurrentTopic.option
    } else if (formatCurrentTopic.children && formatCurrentTopic.children.option.length > 0) {
      hasChildren = true
      options = formatCurrentTopic.children.option
    }
    let forObj = Object.keys(options)
    for (let i = 0; i < forObj.length; i++) {
      let itemArr = [forObj[i], options[forObj[i]]]
      tempArr.push(itemArr)
    }
    if (hasChildren) {
      formatCurrentTopic.children.option = tempArr
    } else {
      formatCurrentTopic.option = tempArr
    }
    return formatCurrentTopic
  }
})