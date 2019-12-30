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
    subjectId: {
      type: String,
      value: '',
    }
  },

  attached: co.wrap(function*(){
    console.log('attached')
    yield busFactory.getSelectedTextbookVersionData(this.data.subjectId) //获取当前科目下选中教材版本
    yield this.getTextbookVersion() //获取当前学科所有教材版本
    yield this.getTeachBook() //获取学科下所有教材
    yield busFactory.getSelectedTextbookData(this.data.subjectId) //获取当前科目下选中教材
    
    var {selectedBookVersionIndex, selectedTeachIndex} = yield busFactory.mappingChooseIndex(this.data.subjectId)
    var formList = this.data.formList
    this.setData({
      [`formList[0].selected`]: formList[0].content[selectedBookVersionIndex],
      [`formList[1].selected`]: formList[1].content[selectedTeachIndex]
    })
    console.log(this.data.formList,'component==formList')
  }),
  data: {
    selectedBookVersionIndex: 0,
    selectedTeachIndex: 0,
    selectedGrade: null,
    selectedExam: null, 
    formList: [
      {
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
    getTextbookVersion: co.wrap(function*(){
      try {
        var resp = yield busFactory.getTextbookVersionData(this.data.subjectId)
        this.setData({
          [`formList[0].content`]: resp.xuekewang.textbookVersions
        })
        if (!this.versionId) {
          this.versionId = resp.xuekewang.textbookVersions[0].versionId
          busFactory.sendRequestIds('versionId', this.versionId)   
        }
      } catch(err) {
        util.showError(err)
      }
    }),

    /**
     * 获取教材信息
     */
    getTeachBook: co.wrap(function*(){
      try {
        var resp =yield busFactory.getTextbookData(this.data.subjectId, this.versionId)
        this.setData({
          [`formList[1].content`]: resp.xuekewang.textbooks
        })
        // busFactory.sendRequestIds('versionId',  resp.xuekewang.textbooks)  
      }catch(err) {
        util.showError(err)
      }
    }),

    chooseForms: function(e) {
      var index = e.currentTarget ? e.currentTarget.dataset.index : e.index
      var newFroms = this.data.formList.map((form, idx)=> {
        form.isUnfold = (idx === index ? !form.isUnfold : false)
        return form
      })
      this.setData({
        formList: newFroms
      })
    },
    
    chooseInput: function({currentTarget: {dataset: {index, itemidx}}}) {
      this.setData({
        [`formList[${index}].selected`]: this.data.formList[index].content[itemidx],
      })
      busFactory.removeTextbookData() //移除教材数据
      busFactory.removeSelectedCurrentData(this.data.subjectId) //移除默认选择的教材版本和教材数据
      this.chooseForms({index})
    },

    submit: co.wrap(function*(){
      var formInput = []
      this.data.formList.forEach(form=> {
        formInput.push(form.selected)
      })
      var subjectId = busFactory.getIds('subjectId')
      var versionId = formInput[0].versionId
      var textbookId = formInput[1].textbookId
      yield busFactory.sendGetChapter(subjectId, versionId, textbookId)
      busFactory.sendRequestIds('versionId', versionId)
      busFactory.sendRequestIds('textbookId', textbookId)
      this.triggerEvent('chooseTextbook')
    })
  }
})
