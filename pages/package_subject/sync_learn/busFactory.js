

import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../utils/common_import'
import graphql from '../../../network/graphql_request'
var textbookVersionData, // 全部教材版本数据
    textbookData, //全部教材数据
    selectedTextbookVersionData, //选中的教材版本数据
    selectTextbookData, // 选中的教材数据
    chapterList, //章节列表
    getComponentsChapterData, //获取组件内部的章节的回调
    requestIds //请求所用的ids 集合


var busFactory = function () {
  // 获取subject 对应的教材版本信息
  var getTextbookVersionData = co.wrap(function *(subjectId){
    if (!textbookVersionData) {
      textbookVersionData = {}
    }
    if (!textbookVersionData[subjectId]) {
      textbookVersionData[subjectId] = yield graphql.getTextbookVersion(+subjectId)

    } 
    return textbookVersionData[subjectId]
  })



  // 获取教材数据
  var getTextbookData = co.wrap(function *(subjectId, versionId) {
    if (!textbookData) {
      textbookData = yield graphql.getTeachBook({
        subjectId: +subjectId,
        versionId: +versionId
      })
    }
    return textbookData
  })

  // 获取选中的教材版本数据
  var getSelectedTextbookVersionData = co.wrap(function *(subjectId){
    if (!selectedTextbookVersionData) {
      selectedTextbookVersionData = {}
    }
    if (!selectedTextbookVersionData[subjectId]) {
      selectedTextbookVersionData[subjectId] = yield graphql.getSelectedTextbookVersion(+subjectId)
    }
    return selectedTextbookVersionData[subjectId]
  })

  // 获取选中的教材
  var getSelectedTextbookData = co.wrap(function *(subjectId){
    if (!selectTextbookData) {
      selectTextbookData = {}
    }
    if (!selectTextbookData[subjectId]) {
      selectTextbookData[subjectId] = yield graphql.getSelectedTextbook(+subjectId)
    }
    return selectTextbookData[subjectId]
  })


  /**
   * 获取章节详情
   */
  var getChapterData = co.wrap(function*(subjectId, versionId, textbookId){
    if (!chapterList) {
      chapterList = {}
    }
    if (!chapterList[subjectId]) {
      chapterList[subjectId] = yield graphql.getChapter({
        subjectId: +subjectId,
        versionId: +versionId,
        textbookId: +textbookId
      })
    }
    return chapterList[subjectId]
  })

  // 设置章节数据
  var getComponentsChapterDataFn = function (data) {
    getComponentsChapterData && getComponentsChapterData(data)
  }

  // 发送获取章节event
  var sendGetChapter = co.wrap(function *(subjectId, versionId, textbookId) {
    var resp = yield getChapterData(subjectId, versionId, textbookId)
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
  var mappingChooseIndex = co.wrap(function*(subjectId) {
    var selectedBookVersionIndex = 0, selectedTeachIndex = 0
    try {
      // 筛选教材版本索引
      if (selectedTextbookVersionData) {
        var arrTextbookVersion = yield getTextbookVersionData(subjectId)
        var selectedTextbookVersion = selectedTextbookVersionData[subjectId].xuekewang.selectedTextbookVersion

        var textbookVersions = arrTextbookVersion.xuekewang.textbookVersions

        for(var i = 0; i<textbookVersions.length;i++) {

          if (selectedTextbookVersion && textbookVersions[i].versionId == selectedTextbookVersion.versionId) {
            selectedBookVersionIndex = i
            break
          }
        }

      }

      // 筛选教材索引
      if (selectTextbookData) {
        var selectedTextbook = selectTextbookData[subjectId] && selectTextbookData[subjectId].xuekewang.selectedTextbook
        var textbooks = textbookData.xuekewang.textbooks

        console.log(textbooks,'==textbooks==', selectedTextbook)
        for(var j = 0; j<textbooks.length;j++) {
          if (selectedTextbook && textbooks[j].textbookId == selectedTextbook.textbookId) {
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

  //移除指定科目的选中数据 
  var removeSelectedCurrentData = function(subjectId) {
    selectTextbookData[subjectId] = null
    selectedTextbookVersionData[subjectId] = null
  }

  // 移除全部选中的数据
  var removeSelectedAllData = function () {
    selectTextbookData = null
    selectedTextbookVersionData = null
  }

  // 移除当前章节列表
  var removeCurrentChapterList = function (subjectId) {
    chapterList[subjectId] = null
  }

  var removeAllData = function () {
    textbookVersionData = null
    textbookData = null
    selectTextbookData = null
    selectedTextbookVersionData = null
    getComponentsChapterData = null
    chapterList = null
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
  }

}


export default (function() {
  var bus = busFactory()
  return bus
})()