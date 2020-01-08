// pages/package_subject/sync_learn/components/form-textbook/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../../utils/common_import'
import busFactory from '../../busFactory'
Component({
  properties: {
    subjectSn: {
      type: String,
      value: '',
    }
  },

  attached: co.wrap(function* () {
    var subjectSn = busFactory.getIds('subjectSn')
    yield busFactory.getSelectedTextbookVersionData(subjectSn) //获取当前科目下选中教材版本
    yield this.getTextbookVersion(subjectSn) //获取当前学科所有教材版本
    yield this.getTeachBook() //获取学科下所有教材
    yield busFactory.getSelectedTextbookData(subjectSn) //获取当前科目下选中教材

    var {
      selectedBookVersionIndex,
      selectedTeachIndex
    } = yield busFactory.mappingChooseIndex(subjectSn)
    var formList = this.data.formList
    this.setData({
      [`formList[0].selected`]: formList[0].content[selectedBookVersionIndex],
      [`formList[1].selected`]: formList[1].content[selectedTeachIndex]
    })
  }),
  data: {
    selectedBookVersionIndex: 0,
    selectedTeachIndex: 0,
    selectedGrade: null,
    selectedExam: null,
    formList: [{
        name: '版本',
        isUnfold: false,
        selected: {},
        content: []
      },
      {
        name: '教材',
        isUnfold: false,
        selected: {},
        content: []
      }
    ]
  },

  methods: {
    /**
     * 获取教材版本
     */
    getTextbookVersion: co.wrap(function* (subjectSn) {
      try {
        var resp = yield busFactory.getTextbookVersionData(subjectSn)
        this.setData({
          [`formList[0].content`]: resp.xuekewang.textbookVersions
        })
        this.versionSn = resp.xuekewang.textbookVersions[0].sn
        busFactory.sendRequestIds('versionSn', this.versionSn)
      } catch (err) {
        util.showError(err)
      }
    }),

    /**
     * 获取教材信息
     */
    getTeachBook: co.wrap(function* () {
      try {
        console.log(this.versionSn,'==this.versionSn==')
        var resp = yield busFactory.getTextbookData(this.versionSn)
        this.setData({
          [`formList[1].content`]: resp.xuekewang.textbooks
        })
        // busFactory.sendRequestIds('versionId',  resp.xuekewang.textbooks)  
      } catch (err) {
        util.showError(err)
      }
    }),

    chooseForms: function (e) {
      var index = e.currentTarget ? e.currentTarget.dataset.index : e.index
      var newFroms = this.data.formList.map((form, idx) => {
        form.isUnfold = (idx === index ? !form.isUnfold : false)
        return form
      })
      this.setData({
        formList: newFroms
      })
    },

    chooseInput: co.wrap(function *({
      currentTarget: {
        dataset: {
          index,
          itemidx
        }
      }
    }) {
      var subjectSn = busFactory.getIds('subjectSn')
      this.setData({
        [`formList[${index}].selected`]: this.data.formList[index].content[itemidx],
      })
      busFactory.removeTextbookData() //移除教材数据
      busFactory.removeSelectedCurrentData(subjectSn) //移除默认选择的教材版本和教材数据
      this.chooseForms({index})
      if (index <= 0) {
        this.versionSn = this.data.formList[index].selected.sn
        yield this.getTeachBook()
        var formList = this.data.formList
        this.setData({
          [`formList[1].selected`]: formList[1].content[0]
        })
      }
    }),

    submit: co.wrap(function* () {
      var formInput = []
      this.data.formList.forEach(form => {
        formInput.push(form.selected)
      })
      var subjectSn = busFactory.getIds('subjectSn')
      var versionSn = formInput[0].sn
      var textbookSn = formInput[1].sn
      yield busFactory.sendGetChapter(subjectSn, textbookSn)
      busFactory.sendRequestIds('versionSn', versionSn)
      busFactory.sendRequestIds('textbookSn', textbookSn)
      this.triggerEvent('chooseTextbook')
    })
  }
})