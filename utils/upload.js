const app = getApp()
import { regeneratorRuntime, co, storage, util } from './common_import'
const request = util.promisify(wx.request)
const wxUploadFile = util.promisify(wx.uploadFile)
  // 上传权限url
const UPLOAD_AUTH_URL = app.apiServer + `/api/v1/obs/token`
let uploadIndex = 1

/**
 * 获取上传权限
 * @param { Object } params required
 */
const getUploadAuth = co.wrap(function*(params = {}) {
  try {
    let authToken = storage.get('authToken')
    let resp = yield request({
      url: UPLOAD_AUTH_URL,
      header: {
        'G-Auth': app.authAppKey,
        'AUTHORIZATION': `Token token=${authToken}`
      },
      method: 'GET',
      dataType: 'json',
      data: params
    })
    let authInfo = resp.data.res
    if (resp.data.code != 0) {
      throw (authInfo)
    }
    return authInfo
  } catch (error) {
    console.log(error)
  }
})

/**
 * 上传单个文件,包括图片和音频
 * @param { String } path 文件路径path required
 */
let uploadFile = co.wrap(function*(path) {
  try {
    let authInfo = yield getUploadAuth()
    let uploadRes = yield wxUploadFile({
      url: authInfo.host,
      filePath: path,
      name: 'file',
      formData: {
        key: authInfo.key,
        policy: authInfo.policy,
        signature: authInfo.signature,
        AccessKeyId: authInfo.accessid,
        success_action_status: '200',
      }
    })
    let url = authInfo.cdn + authInfo.key
    if (uploadRes.statusCode === 200) {
      return url
    } else {
      throw (uploadRes)
    }
  } catch (e) {
    console.log(e)
  }
})

/**
 * 上传多个文档
 * @param { Array } array required 上传文件数组
 * @param { Function } callIndexBack required 上传回调函数
 */
let uploadDocs = co.wrap(function*(array, callIndexBack) {
  // 获取上传权限
  if (array.length > 0) {
    try {
      let authInfo = yield getUploadAuth({
        'file_name': array[0].name
      })
      let uploadRes = yield wxUploadFile({
        url: authInfo.host,
        filePath: array[0].path,
        name: 'file',
        formData: {
          key: authInfo.key,
          policy: authInfo.policy,
          signature: authInfo.signature,
          AccessKeyId: authInfo.accessid,
          success_action_status: '200',
        }
      })
      const url = authInfo.cdn + authInfo.key
      if (uploadRes.statusCode === 200) {
        callIndexBack(url, array[0].name)
        array.splice(0, 1)
        uploadDocs(array, callIndexBack)
        return url
      } else {
        throw (uploadRes)
      }
    } catch (e) {
      console.log(e)
    }
  }
})

/**
 * 串行上传多个文件
 * @param { Array } array required 上传文件数组
 * @param { Function }  callIndexBack required 上传回调函数
 * @param { Function } callProgressBack required 进度条回调函数
 * @param { Boolean } isFile 是否为文件
 * @param { String } fileSn 文件sn
 *
 */
let uploadFiles = co.wrap(function*(array, callIndexBack, callProgressBack, isFile, fileSn) {
  //已手动结束上传
  if (app.cancelUpload) {
    return
  }
  if (array.length > 0) {
    let data = isFile ? { file_name: array[0].name } : {}
    let dataSn = fileSn ? { sn: fileSn } : {}
    if (dataSn) {
      data = Object.assign(data, dataSn)
    }
    // 获取上传权限
    let authInfo = yield getUploadAuth(data)
    let uploadTask = wx.uploadFile({
      url: authInfo.host,
      filePath: isFile ? array[0].path : array[0],
      name: 'file',
      formData: {
        key: authInfo.key,
        policy: authInfo.policy,
        signature: authInfo.signature,
        AccessKeyId: authInfo.accessid,
        success_action_status: '200',
      },
      success: function(res) {
        if (app.cancelUpload) {
          uploadIndex = 1
          return
        }
        const serialUrl = authInfo.cdn + authInfo.key
        if (res.statusCode == 200) {
          callIndexBack(uploadIndex, serialUrl)
          array.splice(0, 1)
          uploadFiles(array, callIndexBack, callProgressBack)
        } else {
          return callIndexBack(uploadIndex, '')
        }
      },
      fail: function(res) {
        return callIndexBack(uploadIndex, '')
      }
    })
    try {
      uploadTask.onProgressUpdate((res) => {
        if (app.cancelUpload) {
          uploadTask.abort()
        }
        callProgressBack(res.progress)
      })
    } catch (e) {
      uploadTask.abort()
    }
  } else {
    uploadIndex = 1
  }
})

module.exports = {
  uploadFile,
  uploadDocs,
  uploadFiles
}