

import {
  regeneratorRuntime,
  co,
} from '../../../utils/common_import'
import graphql from '../../../network/graphql/subject'
var textbookVersionData, // 全部教材版本数据
    textbookData, //全部教材数据
    selectedTextbookVersionData, //选中的教材版本数据
    selectTextbookData, // 选中的教材数据
    chapterList, //章节列表
    getComponentsChapterData, //获取组件内部的章节的回调
    requestIds //请求所用的ids 集合


var busFactory = function () {
  
  // 获取subject 对应的教材版本信息
  var getTextbookVersionData = co.wrap(function *(subjectSn){
    if (!textbookVersionData) {
      textbookVersionData = {}
    }
    if (!textbookVersionData[subjectSn]) {
      textbookVersionData[subjectSn] = yield graphql.getTextbookVersion(subjectSn)

    } 
    return textbookVersionData[subjectSn]
  })

  // 获取教材数据
  var getTextbookData = co.wrap(function *(versionSn) {
    // if (!textbookData) {
      textbookData = yield graphql.getTeachBook(versionSn)
    // }
    return textbookData
  })

  // 获取选中的教材版本数据
  var getSelectedTextbookVersionData = co.wrap(function *(subjectSn){
    if (!selectedTextbookVersionData) {
      selectedTextbookVersionData = {}
    }
    if (!selectedTextbookVersionData[subjectSn]) {
      selectedTextbookVersionData[subjectSn] = yield graphql.getSelectedTextbookVersion(subjectSn)
    }
    return selectedTextbookVersionData[subjectSn]
  })

  // 获取选中的教材
  var getSelectedTextbookData = co.wrap(function *(subjectSn){
    if (!selectTextbookData) {
      selectTextbookData = {}
    }
    if (!selectTextbookData[subjectSn]) {
      selectTextbookData[subjectSn] = yield graphql.getSelectedTextbook(subjectSn)
    }
    return selectTextbookData[subjectSn]
  })

  /**
   * 获取章节详情
   */
  var getChapterData = co.wrap(function*(subjectSn, textbookSn){
    if (!chapterList) {
      chapterList = {}
    }
    if (!chapterList[subjectSn]) {
      chapterList[subjectSn] = yield graphql.getChapter(textbookSn)
    }
    return chapterList[subjectSn]
  })

  // 设置章节数据
  var getComponentsChapterDataFn = function (data) {
    getComponentsChapterData && getComponentsChapterData(data)
  }

  // 发送获取章节event
  var sendGetChapter = co.wrap(function *(subjectSn, textbookSn) {
    var resp = yield getChapterData(subjectSn, textbookSn)
    getComponentsChapterDataFn(resp.xuekewang.rootNodes)
  })

  // 监听章节列表数据
  var listenChapterData = function(fn) {
    if (typeof fn == 'function') {
      getComponentsChapterData = fn
    }
  }


  // 设置所属key下的id值
  var sendRequestIds = function(key, value) {
    if (!requestIds) {
      requestIds = {}
    }
    requestIds[key] = value
  }
  // 根据key获取指定的id
  var getIds = function (key) {
    if (!requestIds) {
      return null
    }
    return key ? requestIds[key] : requestIds
  }

  // 获取默认筛选索引
  var mappingChooseIndex = co.wrap(function*(subjectSn) {
    var selectedBookVersionIndex = 0, selectedTeachIndex = 0
    try {
      // 筛选教材版本索引
      if (selectedTextbookVersionData) {
        var arrTextbookVersion = yield getTextbookVersionData(subjectSn)
        var selectedTextbookVersion = selectedTextbookVersionData[subjectSn].xuekewang.selectedTextbookVersion

        var textbookVersions = arrTextbookVersion.xuekewang.textbookVersions

        for(var i = 0; i<textbookVersions.length;i++) {

          if (selectedTextbookVersion && textbookVersions[i].sn == selectedTextbookVersion.sn) {
            selectedBookVersionIndex = i
            break
          }
        }

      }
      // 筛选教材索引
      if (selectTextbookData) {
        var selectedTextbook = selectTextbookData[subjectSn] && selectTextbookData[subjectSn].xuekewang.selectedTextbook
        var textbooks = textbookData.xuekewang.textbooks

        for(var j = 0; j<textbooks.length;j++) {
          if (selectedTextbook && textbooks[j].sn == selectedTextbook.sn) {
            selectedTeachIndex = j
            break
          }
        }
      }

      return {
        selectedBookVersionIndex: selectedBookVersionIndex < 0 ? 0 : selectedBookVersionIndex,
        selectedTeachIndex: selectedTeachIndex < 0 ? 0 : selectedTeachIndex
      }
    } catch(err) {
      console.log(err)
    }
    
  })

  //移除教材版本
  var removeTextbookVersionData = function() {
    textbookVersionData = null
  }

    //移除教材
  var removeTextbookData = function() {
    textbookData = null
  }

  // 移除指定选中的教材
  var removeCurrentSelectedTextbookData = function (subjectSn) {
    selectTextbookData[subjectSn] = null
  }

  //移除指定科目的选中数据 
  var removeSelectedCurrentData = function(subjectSn) {
    selectTextbookData[subjectSn] = null
    selectedTextbookVersionData[subjectSn] = null
  }

  // 移除全部选中的数据
  var removeSelectedAllData = function () {
    selectTextbookData = null
    selectedTextbookVersionData = null
  }

  // 移除当前章节列表
  var removeCurrentChapterList = function (subjectSn) {
    chapterList[subjectSn] = null
  }

  var removeAllData = function () {
    textbookVersionData = null
    textbookData = null
    selectTextbookData = null
    selectedTextbookVersionData = null
    chapterList = null
    
  }

  var removeDestoryData = function () {
    getComponentsChapterData = null
    requestIds = null
  }

  return {
    getTextbookVersionData,
    getTextbookData,
    getSelectedTextbookVersionData,
    getSelectedTextbookData,
    mappingChooseIndex,
    sendGetChapter,
    getComponentsChapterDataFn,
    listenChapterData,
    sendRequestIds,
    getIds,
    removeTextbookVersionData,
    removeTextbookData,
    removeAllData,
    removeSelectedCurrentData,
    removeSelectedAllData,
    removeCurrentChapterList,
    removeDestoryData,
    removeCurrentSelectedTextbookData,
  }

}

export default (function() {
  var bus = busFactory()
  return bus
})()





