import gql from '../graphql_config'
const graphqlApi = {
  bindDevice: (deviceInfo) => {
    return gql.mutateCustomize({
      mutation: `mutation bindDevice($input: BindDeviceInput!){
        bindDevice(input:$input){
          device {
						onlineState
						sn
					}
        }
      }`,
      variables: {
        input: deviceInfo
      }
    })
  },

  bindBleDevice: (deviceInfo) => {
    return gql.mutate({
      mutation: `mutation bindDevice($input: BindDeviceInput!){
        bindDevice(input:$input){
          device {
						onlineState
						sn
					}
        }
      }`,
      variables: {
        input: deviceInfo
      }
    })
  },

  /**
   * 更新打印机设置
   * @param { String } sn required 设备编号
   * @param { Object } deviceSetting required 设置信息
   * @param { String } requestKey required 响应字段
   */
  updateDeviceSetting: (sn, deviceSetting, requestKey) => {
    if(requestKey==='connectTo'){
      requestKey = `
        ...on IotDevice {
          connectThrough
        }
      `
    }
    return gql.mutate({
      mutation: `mutation ($input: UpdateDeviceSettingInput!){
        updateDeviceSetting(input:$input){
          device{
            ${requestKey}
          }
        }
      }`,
      variables: {
        input: {
          sn: sn,
          attributes: deviceSetting
        }
      }
    })
  },

  /**
   * 解绑打印机
   * @param { String } sn required 设备编号
   */
  unbindDevice: (sn) => {
    return gql.mutate({
      mutation: `mutation ($input: UnbindDeviceInput!){
        unbindDevice(input:$input){
          user{
            currentToken
          }
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
        currentUser {
          sn,
          devices{
            name,
            selected,
            sn,
            model
          },
          selectedDevice{
            name,
            selected,
            sn,
            isAdmin,
            model,
            onlineState,
            shareQrcode
          }
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
        currentUser{
          pressPrint,
          devices(sn:$sn){
            ...on IotDevice {
              connectThrough
              updateInfo
            }
            name,
            selected,
            sn,
            model,
            autoPressPrint,
            isAdmin,
            auditFree,
            marginFree,
            onlineState,
            quality,
            printOrder,
						shareQrcode,
						serviceSn
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 获取打印机分享用户
   * @param { String } sn required 设备编号
   */
  getDeviceShareUsers: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        currentUser{
          devices(sn: $sn){
            sharers{
              avatar,
              name,
              sn
            }
          }
				}
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 打印机停止分享用户
   * @param { String } sn required 设备编号
   * @param { Array } userSns 停止分享用户的sn
   */
  stopShareDeviceUsers: (sn, userSns) => {
    return gql.mutate({
      mutation: `mutation ($input: UnbindUsersInput!){
        unbindUsers(input: $input){
          device {
            sn
          }
				}
      }`,
      variables: {
        input: {
          sn: sn,
          userSns: userSns
        }
      }
    })
  },
  /**
   * 绑定分享设备
   * @param { String } deviceSn 设备sn
   */
  bindShareDevice: (deviceSn) => {
    return gql.mutate({
      mutation: `mutation ($input: BindSharerInput!) {
        bindSharer(input: $input){
          device {
            name
          }
        }
      }`,
      variables: {
        input: {
          deviceSn: deviceSn
        }
      }
    })
  },

  /**
   * 清空打印队列
   * @param { String } deviceSn 设备sn
   */
  clearJobs: (deviceSn) => {
    return gql.mutate({
      mutation: `mutation ($input: CancelJobInput!) {
        cancelJob(input: $input){
          state
        }
      }`,
      variables: {
        input: {
          deviceSn: deviceSn
        }
      }
    })
  },

  /**
   * 获取长按打印设置
   * @param { String } sn required 设备编号
   */
  getLongPressSetting: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        currentUser{
          devices(sn:$sn){
            autoPressPrint
            pressPrintColor
            pressPrintDuplex
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 设备维护
   * @param { String } sn required 设备编号
   * @param { String } maintenanceAction required 维护类型：nozzleCheck/cleanPrinter/powerInkFlush/updatePrinter
   * @param { String } requestKey required 响应字段
   */
  deviceMaintain: (sn, maintenanceAction, requestKey) => {
    if(maintenanceAction==='updatePrinter'){
      requestKey = `
        ...on IotDevice {
          updateInfo
        }
      `
    }
    return gql.mutate({
      mutation: `mutation ($input: UpdateDeviceSettingInput!){
        updateDeviceSetting(input:$input){
          device{
            ${requestKey}
          }
        }
      }`,
      variables: {
        input: {
          sn: sn,
          maintenanceAction: maintenanceAction
        }
      }
    })
  },

}

export default graphqlApi