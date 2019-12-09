/*
 * @Author: your name
 * @Date: 2019-11-19 14:39:00
 * @LastEditTime: 2019-12-04 16:32:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/network/graphql_request.js
 */
var app = getApp()
var gqwxappGraphql = require('./wxgql')
var GraphQL = gqwxappGraphql.GraphQL

// 初始化对象
let gql = GraphQL({
  url: `${app.apiServer}/graphql`,
  header: function() {
    if (app.authToken) {
      return {
        "AUTHORIZATION": `Token token=${app.authToken}`
      }
    } else {
      try {
        var authToken = wx.getStorageSync('authToken')
        if (authToken) {
          return {
            "AUTHORIZATION": `Token token=${authToken}`
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
  },
  //全局错误拦截
  errorHandler: function(res) {

  }
}, true);

const graphqlApi = {
  /**
   * 搜索
   * @param { String } keyword 关键词
   * @param { Array } keys 请求数据分类
   */
  getSearchResult: (keyword, keys) => {
    return gql.query({
      query: `query searchResult($keyword: String!,$keys: [String!]){
        searchResult:searchUnion(keyword: $keyword,keys: $keys){
						name
						resources{
              ...on Course{
                sn
                name
                desc
                iconUrl
                studyUsers
              }
              ...on Content{
                name
                iconUrl
                printCount
                totalPage
                categorySn
                sn
                categories
              }
              ...on Feature{
                sn
                name
                iconUrl
                miniappPath
              }
              ...on KfbCategory{
                categorySn
                sn
                name
                iconUrl
                path
                pathTypeKey
                subTitle
              }
            }
  			}
  		}`,
      variables: {
        keyword: keyword,
        keys: keys
      }
    })
  },

  bindDevice: (deviceInfo) => {
    return gql.mutate({
      mutation: `mutation bindDevice($input: BindDeviceInput!){
        bindDevice(input:$input){
          state
        }
      }`,
      variables: {
        input: deviceInfo
      }
    })
  },

  /**
   * 解绑打印机
   * @param { String } sn required 设备编号
   */
  unbindDevice: (sn) => {
    return gql.mutate({
      mutation: `mutation ($input: UpdateDeviceSettingInput!){
        updateDeviceSetting(input:$input){
          state
        }
      }`,
      variables: {
        input: {
          sn: sn
        }
      }
    })
  },

  /**
   * 获取打印机列表
   */
  getDeviceList: () => {
    return gql.query({
      query: `query {
        devices {
          name,
          selected,
          sn,
          model
        }
      }`
    })
  },

  /**
   * 获取打印机详情
   * @param { String } sn required 设备编号
   */
  getDeviceDetail: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        device(sn: $sn){
          name,
          selected,
          sn,
          model,
          auditFree,
          marginFree,
          onlineState,
          quality,
          printOrder,
          pressPrint
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 获取百度网盘是否授权
   */
  getBaiduNetAuth: () => {
    return gql.query({
      query: `query {
        token {
          baiduTokenName
        }
      }`
    })
  },

  /**
   * 获取百度网盘列表
   * @param { String } path required 关键词
   * @param { String } type required 请求数据类型：img/doc
   * @param { String } key 搜索关键词
   */
  getBaiduNetList: (path, type, key = '') => {
    return gql.query({
      query: `query ($path: String!,$type: String!,$key: String){
        fileList:baidu(path: $path,type: $type,key: $key){
          filename,
          fsId,
          isdir,
          path,
          size,
          thumb,
          time
        }
      }`,
      variables: {
        path: path,
        type: type,
        key: key
      }
    })
  },
}

export default graphqlApi