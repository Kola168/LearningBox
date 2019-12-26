// pages/package_subject/sync_learn/components/form-textbook/index.js
Component({
  properties: {

  },

  data: {
    selectedGrade: null,
    selectedExam: null, 
    formList: [
      {
        name: '教材',
        isUnfold: false,
        selected: {
          name: '一年级',
          _id: 1
        },
        content: [
          {
            name: '一年级',
            _id: 1
          },
          {
            name: '二年级',
            _id: 2
          },
          {
            name: '三年级',
            _id: 3
          },
        ]
      },
      {
        name: '版本',
        isUnfold: false,
        selected: {
          name: '人教版',
          _id: 100
        },
        content: [
          {
            name: '人教版',
            _id: 100
          },
          {
            name: '苏教版',
            _id: 101
          },
          {
            name: '浙教版',
            _id: 102
          }
        ]
      }
    ]
  },

  methods: {
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
      this.chooseForms({index})
    },
    submit: function() {
      var formInput = []
      this.data.formList.forEach(form=> {
        formInput.push(form.selected)
      })
      console.log(formInput, '===formInput==')
    }
  }
})
