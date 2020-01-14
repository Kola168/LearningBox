import gql from './graphql_config'

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
  shareAssistance: (sn) => {
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

  /**
   * @param { String } sn 资源sn
   * @param { String } type 收藏类型 course/content
   * @param { String } action 操作类型 create/destroy
   */
  collect: (sn, type, action) => {
    return gql.mutate({
      mutation: `mutation collect($input: ResourceCollectInput!){
        collect(input:$input){
          state
        }
      }`,
      variables: {
        input: {
          sn: sn,
          type: type,
          action: action
        }
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
					isPreschoolMember
			  	isSchoolAgeMember
          phone
          sn
          selectedDevice{
            sn
            name
            model
            onlineState
          }
          selectedKid{
            gender
            name
            birthday
            avatar
            sn
            stageRoot{
              name
              rootName
							sn
							rootKey
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
   * 获取当前用户信息
   *
   * @returns
   */
  getUserMemberInfo: () => {
    return gql.query({
      query: `query{
        currentUser{
					isPreschoolMember
			  	isSchoolAgeMember
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
        currentUser{
          paymentCheck(sn: $sn,type: $type){
            free
          }
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
            amountYuan
          }
        }
      }`,
      variables: {
        input: pms
      }
    })
  },
  /**
   * 创建智能证件照支付订单
   */
  createCertPaymentOrder: (pms) => {
    return gql.mutate({
      mutation: `mutation createPaymentOrder($input: CreatePaymentOrderInput!){
        createPaymentOrder(input: $input){
          paymentOrder{
            sn
            state
            amountYuan
            payable{
            ...on CertService{
                featureKey
                discountInfo
              }
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
  createResourceOrder: (pms) => {
    return gql.mutate({
      mutation: `mutation createResourceOrder($input: CreateResourceOrderInput!) {
        createResourceOrder(input: $input){
          state
          statistic{
            ... on DailyPractice{
              keepDays
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
   * 获取童音录制分类
   * @param {String} 资源标示
   */
  getRecordCategories: (key) => {
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
            iconUrl
            sn
            pageCount
            printerOrdersCount
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
  getRecordList: (sn) => {
    return gql.query({
      query: `query getRecordList($sn: String!){
        category(sn: $sn){
          contents{
            name
            iconUrl
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
  getRecordSource: (sn) => {
    return gql.query({
      query: `query getRecordSource($sn: String!){
        content(sn: $sn){
          name
          iconUrl
          sn
          contentImages{
            nameUrl
          }
          audioContentImage
          audioUrl
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

  /**
   *获取省列表
   *
   * @returns
   */
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

  /**
   *获取市列表
   *
   * @param {*} zipCode
   * @returns
   */
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

  /**
   *获取区列表
   *
   * @param {*} zipCode
   * @returns
   */
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
   * 
   *获取家庭信息
   * @returns
   */
  getFamilyUser: () => {
    return gql.query({
      query: `query{
        currentUser{
          currentGroup{
            currentUserIsCreator
            sn
            kid{
              avatar
              name
              sn
              stage{
                name
              rootName
              sn 
              }
            }
            users{
              avatar
              name
              sn
              userIsCreator
            }
          }
        }
      }`
    })
  },

  /**
   * 获取免费资源库
   * @param { String } key feature_key
   */
  getFreeSources: (key) => {
    return gql.query({
      query: `query ($key: String!){
        feature(key: $key){
          categories{
            name
            children{
              name
              subTitle
              image
              sn
            }
          }
        }
      }`,
      variables: {
        key: key
      }
    })
  },

  /**
   *获取banner图
   * @param {*} type course/home
   * @returns
   */
  getBanners: (type) => {
    return gql.query({
      query: `query($type: BannerTypeEnum!) {
        banners(type:$type){
          imageUrl
          name
          path
        }
      }`,
      variables: {
        type: type
      }
    })
  },

  /**
   * 免费资源库内容类型
   * @param { string } sn 资源sn
   */
  getFreeSourcesContentType: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        category(sn: $sn){
          children{
            name
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
   * 免费资源库内容
   * @param { string } sn 资源sn
   */
  getFreeSourcesContents: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        category(sn: $sn){
          contents {
            iconUrl
            pageCount
            printerOrdersCount
            sn
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
   * 免费资源库详情
   * @param { string } sn 资源sn
   */
  getFreeSourcesDetail: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        content(sn: $sn){
          contentImages{
            nameUrl
          }
          pageCount
          name
          featureKey
        }
      }`,
      variables: {
        sn: sn
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
          audioUrl,
          isOwner,
          kid{
            name
          }
        }
        content(sn: $sn){
          name
          iconUrl
          sn
          contentImages{
            nameUrl
          }
          audioContentImage
          audioUrl
          contentCollected
        }
      }`,
      variables: {
        sn,
        userId
      }
    })
  },
  /**
   * 获取文件夹列表
   *
   * @param {*} isOwner 是否为创建者
   * @param {*} name
   * @returns
   */
  getFolders: (isOwner, name) => {
    return gql.query({
      query: `query($isOwner: Boolean!,$name:String) {
        folders(isOwner:$isOwner,name:$name){
          name
          sn
          created_at:createdDate
          ${isOwner?'users_count:joinedUsersCount':'nickname:ownedUserNickname'}
        }
      }`,
      variables: {
        isOwner,
        name
      }
    })
  },

  /**
   * 获取打印机打印记录
   * @param { String } sn 打印机sn
   * @param { Number } page 页数
   */
  getPrinterRecords: (sn, page) => {
    return gql.query({
      query: `query($sn: String!,$page: Int) {
        currentUser {
          devices(sn:$sn){
            orders(page:$page){
              adminCreate
              createdAt
              creator{
                avatar
                name
                sn
              }
              copies
              name
              sn
              state
            }
          }
        }
      }`,
      variables: {
        sn: sn,
        page: page
      }
    })
  },

  /**
   * 获取打印机打印记录详情
   * @param { String } sn 打印订单sn
   */
  getPrinterRecordDetail: (sn) => {
    return gql.query({
      query: `query($sn: String!) {
        printOrder(sn:$sn){
          name
          createdAt
          designs {
            name
            failedReason
            copies
            previewUrl
            state
            printUrl
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 取消打印订单
   * @param { String } sn 打印订单sn
   */
  cancalPrintOrder: (sn) => {
    return gql.mutate({
      mutation: `mutation destroyOrder($input: DestroyOrderInput!) {
      destroyOrder(input: $input){
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

  //查询模板列表
  searchTemplate: (type) => {
    return gql.query({
      query: `query($key: String!) {
        feature(key: $key) {
          categories {
            name
            sn
            isHorizontal
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

  //查询主模板下详细信息
  searchTemplateType: (sn) => {
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

  //查询姓名贴模板
  searchNameTemplate: (type) => {
    return gql.query({
      query: `query($key: String!) {
        feature(key: $key) {
          categories {
            name
            sn
            isHorizontal
            attrsInfo
            isHidden
            templates {
              previewImage
              name
              imageUrl
              uploadable
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

  //查询台历模板信息
  searchCalendarTemplate: (type) => {
    return gql.query({
      query: `query($key: String!) {
        feature(key: $key) {
          categories {
            name
            sn
            isHorizontal
            templates {
              previewImage
              name
              imageUrl
              sn
              calendarInfos {
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
   * 创建新文件夹
   *
   * @param {*} input
   * @returns
   */
  createFolder: (input) => {
    return gql.mutate({
      mutation: `mutation ($input: CreateFolderInput!){
          createFolder(input:$input){
            folder{
              joinedUsersCount
              name
              sn
            }
            state
          }
        }`,
      variables: {
        input
      }
    })
  },
  /**
   * 共享文件夹协议
   *
   * @returns
   */
  checkProtocol: () => {
    return gql.query({
      query: `query {
          currentUser{
            folderAgreement
          }
        }`
    })
  },
  /**
   * 同意共享文件夹协议
   *
   * @param {*} input
   * @returns
   */
  signFolderAgreement: (input) => {
    return gql.mutate({
      mutation: `mutation ($input: SignFolderAgreementInput!){
          signFolderAgreement (input:$input){
            state
          }
        }`,
      variables: {
        input
      }
    })
  },

  /**
   * 修改文件夹名称
   *
   * @param {*} input
   * @returns
   */
  updateFolder: (input) => {
    return gql.mutate({
      mutation: `mutation ($input: UpdateFolderInput!){
          updateFolder (input:$input){
            state
          }
        }`,
      variables: {
        input
      }
    })
  },
  /**
   * 删除文件夹
   *
   * @param {*} input
   * @returns
   */
  deleteFolder: (input) => {
    return gql.mutate({
      mutation: `mutation ($input: DeleteFolderInput!){
          deleteFolder (input:$input){
            state
          }
        }`,
      variables: {
        input
      }
    })
  },
  /**
   * 获取文件夹文件列表
   *
   * @param {*} sn
   * @returns
   */
  getDocuments: (sn, page) => {
    return gql.query({
      query: `query($sn: String!,$page: Int!) {
          documents(sn:$sn,page:$page){
            file_type:fileType
            name
            sn
            url
            created_at:createdDate
          }
        }`,
      variables: {
        sn: sn,
        page: page
      }
    })
  },

  /**
   * 存储文件到文件夹
   *
   * @param {*} input
   * @input {
   *    sn
   *    documents{
   *      name
   *      url
   *      fileType
   *     }
   *  }
   * @returns
   */
  createDocument: (input) => {
    return gql.mutate({
      mutation: `mutation($input: CreateDocumentInput!) {
          createDocument(input:$input){
            state
          }
        }`,
      variables: {
        input
      }
    })
  },

  /**
   * 删除文件
   *
   * @param {*} input
   * input{
   * }
   * @returns
   */
  deleteDocument: (input) => {
    return gql.mutate({
      mutation: `mutation($input: DeleteDocumentInput!) {
          deleteDocument(input:$input){
            state
          }
        }`,
      variables: {
        input
      }
    })
  },

  /**
   * 百度token校验
   *
   * @returns
   */
  checkBaiduAuth: () => {
    return gql.query({
      query: `query{
          token{
            baiduTokenName
          }
        }`
    })
  },

  /**
   * 上传到百度文件
   *
   * @param {*} input
   * @returns
   */
  uploadBaidu: (input) => {
    return gql.mutate({
      mutation: `mutation($input: UploadDocumentToBaiduInput!) {
          uploadDocumentToBaidu(input:$input){
            state
          }
        }`,
      variables: {
        input
      }
    })
  },
  /**
   * 获取被分享者列表
   *
   * @param {*} sn
   * @param {*} page
   * @returns
   */
  userFolderRelations: (sn) => {
    return gql.query({
      query: `query($sn: String!) {
          userFolderRelations(sn:$sn){
            id
            avatar:userAvatar
            nickname:userName
          }
        }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 删除分享的好友
   *
   * @param {*} input
   * @returns
   */
  deleteUserFolderRelations: (input) => {
    return gql.mutate({
      mutation: `mutation($input:DeleteUserFolderRelationsInput!) {
          deleteUserFolderRelations(input:$input){
           state
          }
        }`,
      variables: {
        input: input
      }
    })
  },
  /**
   * 审核打印
   * @param { String } orderSn 订单sn
   * @param { String } action 审核类型：pass/reject
   */
  verifyOrder: (orderSn, action) => {
    return gql.mutate({
      mutation: `mutation($input: VerifyOrderInput!) {
          verifyOrder(input:$input){
            order{
              state
            }
          }
        }`,
      variables: {
        input: {
          orderSn: orderSn,
          action: action
        }
      }
    })
  },
  /**
   * 加入文件夹
   *
   * @param {*} input
   * @returns
   */
  joinFolder: (input) => {
    return gql.mutate({
      mutation: `mutation($input: JoinFolderInput!) {
          joinFolder(input:$input){
           state
          }
        }`,
      variables: {
        input: input
      }
    })
  },

  /**
   * 注册学科网
   *
   * @returns
   */
  register: () => {
    return gql.mutate({
      mutation: `mutation ($input: RegisterInput!){
          Register{
            state
          }
        }`
    })
  },


  /**
   * 获取学科网学科目录
   */
  getSubject: () => {
    return gql.query({
      query: `query getSubject{
          xuekewang{
            registered
            subjects{
              subjectId
              subjectName
              iconUrl
            }
          }
        }`

    })
  },

  /**
   * 获取学科版本
   */
  getTextbookVersion: (subjectId) => {
    return gql.query({
      query: `query getTextbookVersion($subjectId: Int!){
          xuekewang{
            textbookVersions(subjectId: $subjectId){
              name
              versionId
            }
          }
        }`,
      variables: {
        subjectId
      }
    })
  },
  /**
   * 意见反馈
   */
  createFeedback: (params) => {
    return gql.mutate({
      mutation: `mutation createFeedback($input: CreateFeedbackInput!){
        createFeedback(input:$input){
          state
        }
      }`,
      variables: {
        input: params
      }
    })
  },

  /**
   * 获取学科教材信息
   */
  getTeachBook: (pms) => {
    return gql.query({
      query: `query getTeachBook($subjectId: Int!,$versionId: Int!){
          xuekewang{
            textbooks(subjectId: $subjectId,versionId: $versionId){
              name
              textbookId
              volume
            }
          }
        }`,
      variables: {
        ...pms
      }
    })
  },

  /**
   * 获取选中教材
   */
  getSelectedTextbook: (subjectId) => {
    return gql.query({
      query: `query getSelectedTextbook($subjectId: Int!){
          xuekewang{
            selectedTextbook(subjectId: $subjectId){
                name
                textbookId
                volume
            }
          }
        }`,
      variables: {
        subjectId
      }
    })
  },

  /**
   * 获取选择的学科教材版本
   */
  getSelectedTextbookVersion: (subjectId) => {
    return gql.query({
      query: `query getSelectedTextbookVersion($subjectId: Int!){
          xuekewang{
            selectedTextbookVersion(subjectId: $subjectId){
                versionId
            }
          }
        }`,
      variables: {
        subjectId
      }
    })
  },
  /**
   * 获取章节
   * @param {subjectId} 科目id
   * @param {versionId} 版本id
   * @param {textbookId} 教材id
   */
  getChapter: (pms) => {
    return gql.query({
      query: `query getChapter($subjectId: Int!, $versionId: Int!, $textbookId: Int!){
          xuekewang{
            rootNodes(subjectId: $subjectId, versionId: $versionId, textbookId: $textbookId){
              name
              id
            }
          }
        }`,
      variables: {
        ...pms
      }
    })
  },
  /**
   * 获取章节详情
   * @param {subjectId} 科目id
   * @param {textbookId} 教材id
   * @param {parentId} 章节id
   */
  getChapterDetail: (pms) => {
    return gql.query({
      query: `query getChapterDetail($subjectId: Int!, $textbookId: Int!, $parentId: Int){
          xuekewang{
            childrenNodes(subjectId: $subjectId, textbookId: $textbookId, parentId: $parentId){
              name
              id
              children {
                name
                id
                children{
                  name
                  id
                }
              }
            }
          }
        }`,
      variables: {
        ...pms
      }
    })
  },

  /**
   * 加入/退出家庭组
   *
   * @param {*} input
   * @returns
   */
  joinOrExitGroup: (input) => {
    return gql.mutate({
      mutation: `mutation($input: JoinOrExitGroupInput!) {
        joinOrExitGroup(input:$input){
          state
        }
        }`,
      variables: {
        input: input
      }
    })
  },
  /**
   * 踢出家庭成员
   *
   * @param {*} input
   * @returns
   */
  kickOutGroupUser: (input) => {
    return gql.mutate({
      mutation: `mutation($input: KickOutGroupUserInput!) {
        kickOutGroupUser(input:$input){
          state
        }
        }`,
      variables: {
        input: input
      }
    })
  },
  /**
   * 获取首页学前feature
   *
   * @returns
   */
  customizeFeatures: (featureKey) => {
    return gql.query({
      query: `query{
        customizeFeatures{
          hasCategory
          iconUrl
          key
          name
          }
        }`
    })
  },

  /**
   * 获取学前内容首页大分类
   *
   * @returns
   */
  customizeCategories: (featureKey) => {
    return gql.query({
      query: `query($featureKey:String!) {
        customizeCategories(featureKey:$featureKey){
          depth
          name
          sn
          children{
            depth
            name
            previewUrl
            sn
          }
          }
        }`,
      variables: {
        featureKey: featureKey
      }
    })
  },

  /**
   * 获取内容列表页
   *
   * @returns
   */
  customizeCategory: (sn) => {
    return gql.query({
      query: `query($sn:String!) {
        customizeCategory(sn:$sn){
          depth
          name
          previewUrl
          sn
          children{
            depth
            name
            previewUrl
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
   * 获取学前可订阅列表
   *
   * @returns
   */
  customizeFeaturePlans: (featureKey) => {
    return gql.query({
      query: `query($featureKey:String!){
        customizeFeaturePlans(featureKey:$featureKey){
          categoryName
          iconUrl
          name
          planSize
          sn
          subTitle
          subscription
          }
        }`,
      variables: {
        featureKey
      }
    })
  },
  /**
   * 订阅内容
   *
   * @returns
   */
  joinPlan: (input) => {
    return gql.query({
      query: `mutation($input: JoinPlanInput!){
        joinPlan(input:$input){
          state
          }
        }`,
      variables: {
        input
      }
    })
  },
  /**
   * 获取内容列表
   *
   * @returns
   */
  customizeContents: (sn, page) => {
    return gql.query({
      query: `query($sn:String!,$page:String!) {
        customizeContents(sn:$sn,page:$page){
          sn
          print_count:printerOrdersCount
          title:name
          icon_url:iconUrl
          total_page:pageCount
          }
        }`,
      variables: {
        sn: sn,
        page: page
      }
    })
  },

  /**
   * 内容详情
   *
   * @param {*} sn
   * @returns
   */
  customizeContent: (sn) => {
    return gql.query({
      query: `query($sn:String!) {
        content(sn:$sn){
          sn
          contentCollected
          contentImages{
            id
            nameUrl
          }
          featureKey
          fileUrl
          name
          pageCount
          }
        }`,
      variables: {
        sn: sn
      }
    })
  },
  /**
   * 内容收藏
   *
   * @param {*} input
   * @returns
   */
  collectContent: (input) => {
    return gql.mutate({
      mutation: `mutation($input: ResourceCollectInput!) {
        collect(input:$input){
          state
        }
        }`,
      variables: {
        input: input
      }
    })
  },
  /**
   * 智能证件照去水印
   *
   * @returns
   */
  certService: (redisOrderSn) => {
    return gql.query({
      query: `query($redisOrderSn:String!) {
        certService(redisOrderSn:$redisOrderSn){
          singleUrl
          url
          state
          }
        }`,
      variables: {
        redisOrderSn
      }
    })
  },

}

export default graphqlApi