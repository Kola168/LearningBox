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
    progress: 0,
    multipleObjResult: [], //multipleObj客观大题大题结果
    modalObj: {
      isShow: false,
      hasCancel: true,
      content: '您已批改过次练习，重复批改有可能会导致数据不精准',
      cancelText: '不批改',
      confirmText: '无所谓'
    }
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
    this.paperId = Number(scene.split('_')[1])
    this.correctType = scene.split('_')[2] === 'paper' ? 'XuekewangPaper' : 'XuekewangExercise' //批改类型
    this.singleTopicIds = new Set()
    this.getCorrectPaper()
    // setInterval(() => {
    //   if (this.data.progress < 100) {
    //     this.setData({
    //       progress: this.data.progress + 5
    //     })
    //   }
    // }, 500)
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
        formatResult = this.formatTopic(currentTopic),
        topicsResult = new Array(this.topics.length)
      this.subjectName = tempData.subject_name
      this.currentTopicId = currentTopic.ques_id
      this.setData({
        loadReady: true,
        title: tempData.title,
        currentTopicType: formatResult.topicType,
        topicsResult,
        currentTopic: formatResult.currentTopic,
        ['modalObj.isShow']: false //是否已批改
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  exitCorrect() {
    wxNav.switchTab('/pages/index/index')
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
        parent = false //是否包含小题

      if (this.data.currentTopicType === 'multipleObj') {
        parent = true
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
        },
        currentResult: null
      }
      if (nextTopicIndex === this.data.topicsResult.length) { //最后一题
        this.setData(dataObj)
        this.preSubmit()
      } else {
        let formatResult = this.formatTopic(this.topics[nextTopicIndex])
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
    this.weToast.toast({
      type: 'loading'
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
      this.weToast.hide()
      wxNav.navigateTo('../report/index/index', {
        from: 'correct',
        sn: ''
      })
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

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
  }
})