// pages/package_subject/weakness_exercise/index/index.js
var app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  storage,
  wxNav
} from '../../../../utils/common_import'
import graphql from '../../../../network/graphql/subject'
import graphqlAll from '../../../../network/graphql_request'
import getLoopsEvent from '../../../../utils/worker'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modal: {
      isShow: true,
      title: '开通学科会员，专项同步练习',
      slotContent: false,
      content: '专享错题薄弱同类练习题推送',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/weakness_member_banner.png',
      slotBottom: true
    },
    showSubjectForm: false, //是否显示科目状态表单
    showPrintForm: false, //是否显示打印状态表单
    showSubjectCheckbox: false, //是否选择科目
    showTimeCheckbox: false,
    showKnowledgeCheckbox: false, //是否显示选择知识点
    navBarHeight: 0,
    timeRange: {
      appoint: ['today', 'yesterday'],
      dayRange: [7]
    },
    knowledgeList: [],
    subjects: [],
    isSubjectCategory: true, //是否默认是学科展示分类列表
    printStaList: [
      {
       name: '已打印',
       sn: 1
     },
     {
        name: '未打印',
        sn: 0
      }
    ],
    exerciseList: [],
    checkedPrint: null,
    checkedSubject: null,
    isExerciseEmpty: false,
    isSchoolAgeMember: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function *(options) {
    this.longToast = new app.weToast()
    let navBarHeight = app.navBarInfo.topBarHeight
    this.setData({
      navBarHeight,
      checkedPrint: {
        name: '已打印',
        sn: 1
      },
      isFullScreen: app.isFullScreen
    })
    yield this.getMember()
    yield this.getSubject()
    yield this.getExerciseList()
  }),

   /**
   * 获取学科信息
   */
  getSubject: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getSubject()
      if(!resp.xuekewang.registered) {
        return this.registerSubject()
      }
      this.setData({
        subjects: resp.xuekewang.subjects,
        checkedSubject: resp.xuekewang.subjects[0],
      })
      this.longToast.hide()
    } catch(err) {
      this.longToast.hide()
      util.showError(error)
    }
  }),

  /**
   * 注册学科
   */
  registerSubject: co.wrap(function*() {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      let res = yield graphql.register()
      if (res.register.state) {
        this.getSubject()
      } else {
        throw (res)
      }
      this.longToast.hide()
    } catch (error) {
      this.longToast.hide()
      util.showError(error)
    }
  }),

  /**
   * 获取知识点
   */
  getKnowledges: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })

    try {
      var resp = yield graphql.getKnowledges({
        sn: this.data.checkedSubject.sn,
        startTime: this.data.checkedDate.startDate,
        endTime: this.data.checkedDate.endDate
      })
      var knowedges = resp.xuekewangSubject && resp.xuekewangSubject.knowledges
      this.setData({
        knowledgeList: knowedges
      })

      if (knowedges && !knowedges.length) {
        wx.showModal({
          title: '提示',
          content: '暂无知识点，请重新选择',
          showCancel: false,
          success: (res)=>{
            if (res.confirm) {
              this.closeKnowledgesBox()
            }
          }
        })
      }

      this.longToast.hide()
    } catch(err) {
      this.longToast.hide()
      util.showError(err, (res)=>{
        if (res.confirm) {
          this.closeKnowledgesBox()
        }
      })
    }
  }),

  /**
   * 选择知识点 
   * @param {*} param0 
   */
  switchKnowledge: function({currentTarget: {dataset: {index}}}) {
    var knowedges = this.data.knowledgeList
    var checkedKnowledges = knowedges.filter(know=>{
      return know.checked
    })
    // 限制每次最多5个知识点
    if (checkedKnowledges.length >=5 && !knowedges[index].checked) {
      return wx.showModal({
        title: '提示',
        content: '一次最多可选5个',
        showCancel: false
      })
    }

    this.setData({
      [`knowledgeList[${index}].checked`]: !knowedges[index].checked
    })
  },

  /**
   * 选择学科
   * @param {*} e 
   */
  chooseSubject: function({detail}) {
    this.setData({
      showSubjectCheckbox: false,
      showTimeCheckbox: true,
      checkedSubject: detail
    })
  },

  /**
   * 选择日期
   * @param {*} e 
   */
  chooseDate: function({detail}) {
    this.setData({
      showTimeCheckbox: false,
      showKnowledgeCheckbox: true,
      checkedDate: detail
    })
    this.getKnowledges()
  },

  /**
   * 获取练习列表
   */
  getExerciseList: co.wrap(function*(){
    try {
      this.longToast.toast({
        type: 'loading',
        title: '请稍后...'
      })
      var resp = yield graphql.getKnowledgeExercises(this.data.checkedSubject.sn, this.data.checkedPrint.sn)
      this.setData({
        exerciseList: resp.xuekewang.exercises,
        isExerciseEmpty: resp.xuekewang && resp.xuekewang.exercises.length ? false : true
      })
      this.longToast.hide()
    } catch(err) {
      util.showError(err)
      this.longToast.hide()
    }
  }),

   /**
   * 判断是否是会员
   */
  getMember: co.wrap(function*(){
    try {
      var resp = yield graphqlAll.getSubjectMemberInfo()
      if (resp.currentUser && resp.currentUser) {
        var isExpires = resp.currentUser.selectedKid && resp.currentUser.selectedKid.schoolAgeMember.expiresAt
        this.setData({
          isSchoolAgeMember: resp.currentUser.isSchoolAgeMember,
          isExpires: isExpires
        })
      }
    } catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 确认练习
   */
  confirmExercise: function(){
    if (!this.data.isSchoolAgeMember) {
      var member = this.selectComponent('#memberToast')
      return member.showToast()
    }
    this.setData({
      showSubjectCheckbox: true
    })
  },

  /**
   * 生成练习
   */
  createExercise: co.wrap(function * (){
    try {
      var ids = yield this.knowedgeIds()
      if (!ids) return
      
      // api.synthesisWorker({
      //   feature_key: 'xuekewang_exercise',
      //   is_async: false,
      //   exercise_type: 'kpoint',
      //   subject_sn: this.data.checkedSubject.sn,
      //   end_time: this.data.checkedDate.endDate,
      //   start_time: this.data.checkedDate.startDate,
      //   ids: ids
      //   // subject_sn: 2091261782649911,
      //   // end_time: '2020-01-23',
      //   // start_time: '2019-06-17',
      //   // ids: '10418'
      // })
      // return

      this.longToast.toast({
        type: 'loading',
        title: '正在出题...'
      })
      getLoopsEvent({
        feature_key: 'xuekewang_exercise',
        worker_data: {
          exercise_type: 'kpoint',
          subject_sn: this.data.checkedSubject.sn,
          end_time: this.data.checkedDate.endDate,
          start_time: this.data.checkedDate.startDate,
          ids: ids
        }
      }, (resp) => {
        if (resp.status == 'finished') {
          this.longToast.hide()
          this.closeKnowledgesBox()
          this.getExerciseList()
        }
      }, () => {
        this.longToast.hide()
      })

    } catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 关闭知识点选择
   */

  closeKnowledgesBox: function() {
    this.setData({
      showKnowledgeCheckbox: false
    })
  },

  /**
   * 匹配知识点ids
   */
  knowedgeIds: co.wrap(function*() {
    try {
      var knowedges = this.data.knowledgeList.filter(item=>item.checked)
      if (!knowedges.length) {
        wx.showModal({
          title: '提示',
          content: '至少选择一个知识点',
          showCancel: false
        })
        return false
      }
      var ids = knowedges.reduce((pre, cur)=>(pre.concat('' + cur.id)), [])
      return ids.join(',')
    } catch(err) {
      util.showError(err)
    }
  }),

  /**
   * 搜索分类
   */
  searchCategory: co.wrap(function *({currentTarget: {dataset: {key}}}) {
    this.key = key
    this.setData({
      isSubjectCategory: key == 'subject',
      showSubjectForm: true
    }) 
  }),

  /**
   * 选择分类
   */
  chooseCategory: co.wrap(function * ({currentTarget: {dataset: {index}}}) {
    var updateObj = {
      subject: {
        checkKey: 'checkedSubject',
        key: 'subjects'
      },
      print: {
        checkKey: 'checkedPrint',
        key: 'printStaList'
      }
    }
    var refreshData = updateObj[this.key]
    this.setData({
      [`${refreshData.checkKey}`]: this.data[refreshData.key][index], //更新对应的值
      showSubjectForm: false, //关闭弹窗
      isExerciseEmpty: false, //关闭为空状态
    })
    yield this.getExerciseList()
  }),

  /**
   * 去打印
   */
  toPrint: function({currentTarget: {dataset: {sn}}}){
    wxNav.navigateTo('../../sync_learn/preview_subject/index', {
      sn
    })
  },

  /**
   * 关闭分类筛选弹窗
   */
  cancelActionsheet: function() {
    this.setData({
      showSubjectForm: false
    })
  },

  onUnload: function(){
    storage.remove("subjectsData")
  },

  onHide: function(){
    storage.remove("subjectsData")
  },
})