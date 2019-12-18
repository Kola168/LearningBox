var app = getApp()
var gqwxappGraphql = require('./wxgql')
var GraphQL = gqwxappGraphql.GraphQL
import storage from '../utils/storage.js'
// 初始化对象
let gql = GraphQL({
  url: `${app.apiServer}/graphql`,
  header: function () {
    if (app.authToken) {
      return {
        "AUTHORIZATION": `Token token=${app.authToken}`
      }
    } else {
      try {
        var authToken = storage.get('authToken')
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
		console.log('graphql全局错误拦截',res)
		//如果auth
		if(1){

			}
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
   */
  updateDeviceSetting: (sn, deviceSetting, requestKey) => {
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
        devices {
          name,
          selected,
          sn,
          model,
          onlineState
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
					printOrder
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
        device(sn: $sn){
          sharers{
            avatar,
            name,
            sn
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
    return gql.query({
      query: `query ($sn: String!,$userSns: [String!]){
        unbindUsers(sn: $sn,userSns: $userSns){
          sn
				}
      }`,
      variables: {
        sn: sn,
        userSns: userSns
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

  /**
   * 获取模版分类
   * @param { String } key required 模版feature key
   */
  getCategory: (key) => {
    return gql.query({
      query: `query ($key: String!){
        feature(key: $key){
          categories {
            image,
            name,
            sn
          }
        }
      }`,
      variables: {
        key: key
      }
    })
  },

  /**
   * 获取模版列表
   * @param { String } sn required 分类sn
   */
  getTemplates: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        category(sn: $sn){
          templates {
            previewImage,
            sn,
            name
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 获取模版详情
   * @param { String } sn required 模版sn
   */
  getTemplateDetail: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        template(sn: $sn){
          defaultImage,
          imageUrl,
          sn,
          name,
          positionInfo {
            areaX,
            areaY,
            areaHeight,
            areaWidth,
            height,
            width
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 创建订单
   * @param { Object } orderParams 订单参数
   */
  createOrder: (orderParams) => {
    return gql.mutate({
      mutation: `mutation ($input: CreateOrderInput!){
        createOrder(input:$input){
          state
        }
      }`,
      variables: {
        input: orderParams
      }
    })
	},
	 /**
   * 课程列表
   * *@param { CategoryEnum } type 请求类型
   */
  getCourses: (type) => {
    return gql.query({
      query: `query getCourses($type: String!){
        courses(type:$type){
          banners
          desc
          code
          introduction
          name
          studyUsers
          totalLessons
          mainImageUrl
          priceYuan
          recommendationImageUrl
          sn
          payed
        }
      }`,
      variables: {
        type: type
      }
    })
  },

  /**
   * 获取课程详情
   */
  getCourseDetail: (sn) => {
    return gql.query({
      query: `query getCourses($sn: String!, $type: ConsumableTypeEnum!, $period: String!){
        course(sn: $sn){
          banners
          desc
          code
          shareSn
          introduction
          name
          studyUsers
          courseCollected
          courseChapters {
            name
            shareToTrial
            sn
            state
            trial
            courseLessons{
              courseName
              locked
              sn
              name
              shareToTrial
            }
          }
          finishedLessons
          totalLessons
          mainImageUrl
          userCanShareToTrial
          priceYuan
          promotion
          promotionNum
          recommendationImageUrl
          sn
          payed
        }
        consumables (type: $type, sn: $sn, period: $period) {
          appid
          url
          imageUrl
          name
        }
      }`,
      variables: {
        sn: sn,
        type: 'course',
        period: 'before'
      }
    })
  },

  /**
   * 获取分享助力信息
   */
  getAssistanceInfo: (sn) => {
    return gql.query({
      query: `query getAssistanceInfo($sn: String!){
        courseShare(sn: $sn){
          assistanceSucceed
          assistanceUsers{
            avatar
            name
            phone
          }
          canAssistance
          course{
            desc
            studyUsers
            introduction
            mainImageUrl
            totalLessons
            name
            sn
            priceYuan
            promotion
            promotionNum
          }
          endAtTimestamp
          owner
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  // 获取最后一次学些的信息
  getLastCourseInfo: () => {
    return gql.query({
      query: `query {
        currentUser{
          lastCourse{
            finished
            name
            sn
            total
          }
        }
      }`
    })
  },

  // 获取课程首页banner
  getCourseBanner: (type) => {
    return gql.query({
      query: `query getCourseBanner($type:  BannerTypeEnum!){
        banners (type: $type){
          url: imageUrl
          name
        }
      }`,
      variables: {
        type: type
      }
    })
  },

  // 分享助力
  shareAssistance: (sn)=> {
    return gql.mutate({
      mutation: `mutation shareAssistance($input: CoursePromotionInput!){
        courseShare(input:$input){
          state
        }
      }`,
      variables: {
        input: {
          sn
        }
      }
    })
  },

  // 发起助力
  sendCourseAssistance: (sn) => {
    return gql.mutate({
      mutation: `mutation shareAssistance($input: CourseAssistanceInput!){
        courseAssistance(input:$input){
          state
        }
      }`,
      variables: {
        input: {
          sn
        }
      }
    })
  },

  // 发起收藏
  collect: (input) => {
    return gql.mutate({
      mutation: `mutation collect($input: ResourceCollectInput!){
        collect(input:$input){
          state
        }
      }`,
      variables: {
        input: input
      }
    })
  },

  getMyFavorList: (type) => {
    return gql.query({
      query: `query getMyFavorList($type: CollectionTypeEnum!){
       collections(type: $type) {
        ...on Course{
          name
          sn
          mainImageUrl
          desc
          payed
          priceYuan
          purchasedAt
          totalLessons
          studyUsers
          finishedLessons
          introduction
          lastCourseChapterSn
        }
       }
      }`,
      variables: {
        type
      }
    })
  },

  // 获取课时详情
  getCourseLesson: (sn) => {
    return gql.query({
      query: `query getCourseLesson($sn: String!){
        courseLesson(sn: $sn) {
          courseName
          featureKey
          contents{
            id
            nameUrl
          }
          name
          shareToTrial
          videoUrl
        }
      }`,
      variables: {
        sn
      }
    })
  },

  // 获取课程专题
  getCourseSubject: (key) => {
    return gql.query({
      query: `query getCourseSubject($key: String!){
        feature(key: $key) {
          categories {
            courseIntroductionImage
            name
            sn
          }

        }
      }`,
      variables: {
        key
      }
    })
  },

  getSubjectContent: (sn) => {
    return gql.query({
      query: `query getSubjectContent($sn: String!){
        category(sn: $sn) {
          image
          courses{
            sn
            mainImageUrl
            desc
            payed
            priceYuan
            totalLessons
            studyUsers
          }
        }
      }`,
      variables: {
        sn
      }
    })
	},

	/**
   * 获取所有学段
   * @returns
   */
  getAllstages: () => {
    return gql.query({
      query: `query{
        stages{
            name
            rootName
            sn
            children{
              name
              rootName
              sn
              children{
                name
                rootName
                sn
                children{
                  name
                  rootName
                  sn
                }
              }
            }
        }
      }`
    })
  },

  /**
   * 获取当前用户信息
   *
   * @returns
   */
  getUser: () => {
    return gql.query({
      query: `query{
        currentUser{
          sn
          phone
          selectedDevice{
            sn
            name
            model
            onlineState
          }
          selectedKid{
            gender
            name
            sn
            birthday
            avatar
            stageRoot{
              name
              rootName
              sn
            }
            stage{
              name
              rootName
              sn
            }
            province{
              name
            }
            district{
              name
            }
            city{
              name
            }
            }
        }
      }`
    })
  },

  /**
   * 设置小孩信息
   *
   * @param {*} params
   * @returns
   */
  changeStage: (params) => {
    return gql.mutate({
      mutation: `mutation ($input: UpdateKidInput!){
        updateKid(input:$input){
          kid{
            name
            gender
            sn
            birthday
            avatar
            stage{
              rootName
              name
              sn
            }
            province{
              name
            }
            district{
              name
            }
            city{
              name
            }
          }
        }
      }`,
      variables: {
        input: params
      }
    })
  },

  /**
   * 获取商品是否免费
   */
  getPaymentCheck: (pms) => {
    return gql.query({
      query: `query getPaymentCheck($sn: String!, $type: PayableItemTypeEnum!){
        paymentCheck(sn: $sn,type: $type){
          free
        }
      }`,
      variables: {
        sn: pms.sn,
        type: pms.type
      }
    })
  },

  /**
   * 创建资源
   */
  createResource: (pms) => {
    return gql.mutate({
      mutation: `mutation createResource($input: CreateResourceInput!){
        createResource(input:$input){
          state
        }
      }`,
      variables: {
        input: pms
      }
    })
  },

  /**
   * 创建支付订单
   */
  createPaymentOrder: (pms) => {
    return gql.mutate({
      mutation: `mutation createPaymentOrder($input: CreatePaymentOrderInput!){
        createPaymentOrder(input: $input){
          paymentOrder{
            sn
            state
          }
        }
      }`,
      variables: {
        input: pms
      }
    })
  },

    /**
   * 获取支付信息
   */
  createPayment: (pms) => {
    return gql.mutate({
      mutation: `mutation createPayment($input: CreatePaymentInput!){
        createPayment(input: $input){
          payParams{
            ...on WxpayParams{
              nonceStr
              package
              paySign
              signType
              timeStamp
            }
          }

        }
      }`,
      variables: {
        input: pms
      }
    })
  },

  /**
   * 创建资源订单
   */
  createResourceOrder: (pms)=> {
    return gql.mutate({
      mutation: `mutation createResourceOrder($input: CreateResourceOrderInput!) {
        createResourceOrder(input: $input){
          state
        }
      }`,
      variables: {
        input: pms
      }
    })
  },

  /**
   * 获取童音录制分类
   * @param {String} 资源标示
   */
  getRecordCategories: (key)=>{
    return gql.query({
      query: `query ($key: String!){
        feature(key: $key){
          categories {
            image
            name
            sn
          }
          contents{
            name
            icon
            sn
            pageCount
          }
        }
      }`,
      variables: {
        key: key
      }
    })
  },

  /**
   * 获取童音录制资源列表
   * @param {String} 内容分类sn
   */
  getRecordList: (sn)=> {
    return gql.query({
      query: `query getRecordList($sn: String!){
        category(sn: $sn){
          contents{
            name
            icon
            sn
            printerOrdersCount  
            pageCount
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 获取录音资源详情
   */
  getRecordSource: (sn)=> {
    return gql.query({
      query: `query getRecordSource($sn: String!){
        content(sn: $sn){
          name
          icon
          sn
          contentImages{
            nameUrl
          }
          audioContentImage
          audio
          contentCollected
          userAudio{
            audioUrl
            qrCodeUrl
          }
          pageCount
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

	getProvinces: () => {
    return gql.query({
      query: `query{
        provinces{
           name
           zipCode
        }
      }`
    })
  },

	getProvince: (zipCode) => {
    return gql.query({
      query: `query ($zipCode: String!){
        province(zipCode:$zipCode){
           name
           zipCode
           children{
            name
            zipCode
           }
        }
      }`,
      variables: {
        zipCode: zipCode
      }
    })
  },

	getCity: (zipCode) => {
    return gql.query({
      query: `query ($zipCode: String!){
        city(zipCode:$zipCode){
           name
           zipCode
           children{
            name
            zipCode
           }
        }
      }`,
      variables: {
        zipCode: zipCode
      }
    })
	},

	getProvince1: (zipCode) => {
    return gql.query({
      query: `query ($zipCode: String!){
        province(zipCode:$zipCode){
           name
           zipCode
           children{
            name
            zipCode
           }
        }
      }`,
      variables: {
        zipCode: zipCode
      }
    })
	},

	//查询模板列表
  searchTemplate:(type)=>{
    return gql.query({
      query: `query($key: String!) {
        feature(key: $key) {
          categories {
            templates {
              previewImage
              name
              imageUrl
              sn
              positionInfo {
                width
                areaHeight
                areaWidth
                areaX
                areaY
                height
                width
              }
            }
          }
        }
      }`,
      variables: {
        key: type
      }
    })
  },

  searchTemplateType:(sn)=>{
    return gql.query({
      query: `query($sn: String!) {
        category(sn: $sn) {
          name
          sn
          templates {
            previewImage
            name
            imageUrl
            sn
            positionInfo {
              width
              areaHeight
              areaWidth
              areaX
              areaY
              height
              width
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
   * 获取耗材
   */
  getConsumables: (type, sn, period) => {
    return gql.query({
      query: `query ($type: ConsumableTypeEnum!, $sn: String!, $period: String!){
        consumables(type:$type, sn: $sn, period: $period){
          appid
          url
          imageUrl
          name
        }
      }`,
      variables: {
        type,
        sn,
        period
      }
    })
  },

  /**
   * 上传录音音频
   */
  createAudio: (pms) => {
    return gql.mutate({
      mutation: `mutation createAudio($input: CreateAudioInput!) {
        createAudio(input: $input){
          qrCodeUrl
        }
      }`,
      variables: {
        input: pms
      }
    })
  },
  
  /**
   * 获取用户录制信息
   */
  getRecordInfo: (sn, userId) => {
    return gql.query({
      query: `query getRecordInfo($sn: String!, $userId: Int!){
        userContentAudio(sn: $sn, userId: $userId){
          audioUrl
        }
        content(sn: $sn){
          name
          icon
          sn
          contentImages{
            nameUrl
          }
          audioContentImage
          audio
          contentCollected
        }
      }`,
      variables: {
        sn,
        userId
      }
    })
  }
}

export default graphqlApi
