// 学前接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 注册学科网
   *
   */
  register: () => {
    return gql.mutate({
      mutation: `mutation ($input: RegisterInput!){
        register(input:$input){
          state
        }
      }`,
      variables: {
        input: {

        }
      }
    })
  },

  /**
   * 获取学科
   *
   */
  getSubjects: () => {
    return gql.query({
      query: `query {
        xuekewang {
          registered
          printPaperCount
          percentage
          subjects {
            iconUrl
            subjectId
            subjectName
            totalNumber
            sn
          }
        }
      }`
    })
  },

  /**
   * 获取学科教材地区
   *
   */
  getSubjectAreasAndGrades: () => {
    return gql.query({
      query: `query {
        xuekewang {
          areas{
            areaId
            areaName
          }
          grades {
            id
            name
          }
          selectedPaperSubject {
            areaId
            paperTypeId
            subjectId
            gradeId
          }
        }
      }`
    })
  },

  /**
   * 获取试卷类型
   * @param { Number } subjectId
   * @param { Number } thematic
   */
  getSubjectPaperTypes: (subjectId,thematic) => {
    return gql.query({
      query: `query ($subjectId: Int!,$thematic: Int!){
        xuekewang {
          paperTypes(subjectId:$subjectId,thematic:$thematic){
            id
            name
          }
        }
      }`,
      variables: {
        subjectId: subjectId,
        thematic: thematic
      }
    })
  },

  /**
   * 获取试卷列表
   * @param { Number } subjectId 学科id
   * @param { Number } paperType 试卷类型
   * @param { Number } areaId 地区id
   * @param { Number } pageIndex 分页
   */
  getSubjectPapers: (subjectId, paperType, gradeId, areaId, pageIndex) => {
    return gql.query({
      query: `query ($subjectId: Int!,$paperType: Int!,$areaId: Int!,$gradeId: Int!,$pageIndex: Int!,$pageSize: Int!){
        xuekewang {
          paperLists(subjectId:$subjectId,paperType:$paperType,areaId:$areaId,gradeId:$gradeId,pageIndex:$pageIndex,pageSize:$pageSize){
            paperId
            isPrint
            isReport
            printCount
            title
            sn
          }
        }
      }`,
      variables: {
        subjectId: subjectId,
        paperType: paperType,
        areaId: areaId,
        gradeId: gradeId,
        pageSize: 20,
        pageIndex: pageIndex
      }
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
            sn
            iconUrl
          }
        }
      }`

    })
  },

  /**
   * 获取学科版本
   * @param {sn} 学科的sn
   */
  getTextbookVersion: (sn) => {
    return gql.query({
      query: `query getTextbookVersion($sn: String!){
        xuekewang{
          textbookVersions(sn: $sn){
            name
            versionId
            sn
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },
  /**
   * 获取学科教材信息
   * @param {sn} 学科教材版本的sn
   */
  getTeachBook: (sn) => {
    return gql.query({
      query: `query getTeachBook($sn: String!){
        xuekewang{
          textbooks(sn: $sn){
            name
            textbookId
            volume
            sn
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 获取选中教材
   * @param {subjectSn} 学科sn
   */
  getSelectedTextbook: (subjectSn) => {
    return gql.query({
      query: `query getSelectedTextbook($subjectSn: String!){
        xuekewang{
          selectedTextbook(subjectSn: $subjectSn){
              name
              textbookId
              volume
              sn
          }
        }
      }`,
      variables: {
        subjectSn
      }
    })
  },

  /**
   * 获取选择的学科教材版本
   * @param {subjectSn} 学科sn
   */
  getSelectedTextbookVersion: (subjectSn) => {
    return gql.query({
      query: `query getSelectedTextbookVersion($subjectSn: String!){
        xuekewang{
          selectedTextbookVersion(subjectSn: $subjectSn){
              versionId
              sn
              name
          }
        }
      }`,
      variables: {
        subjectSn
      }
    })
  },
  /**
   * 获取章节
   * @param {sn} 教材的sn
   */
  getChapter: (sn) => {
    return gql.query({
      query: `query getChapter($sn: String!){
        xuekewang{
          rootNodes(sn: $sn){
            name
            id
            sn
            selected
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },
  /**
   * 获取章节详情
   * @param {sn} 章节的sn
   */
  getChapterDetail: (sn) => {
    return gql.query({
      query: `query getChapterDetail($sn: String!){
        xuekewang{
          childrenNodes(sn: $sn){
            name
            id
            sn
            selected
            children {
              name
              id
              sn
              selected
              children{
                name
                id
                sn
                selected
              }
            }
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 获取练习难度系数
   */
  getDifficulty: () => {
    return gql.query({
      query: `query getDifficulty{
        xuekewang{
          diff{
            name
            id
          }
        }
      }`
    })
  },

  /**
   * 获取默认练习题
   * @param {diff} 难度id
   * @param {nodeSn} 章节的sn
   */
  getDefaultExercise: (diff, nodeSn) => {
    return gql.query({
      query: `query getDefaultExercise($diff:Int!, $nodeSn:String!){
        xuekewang{
          defaultExercise(diff: $diff, nodeSn: $nodeSn){
            images{
              nameUrl
            }
            answerImages{
              nameUrl
            }
            sn
            isPrint
            printCount
            exerciseName
          }
        }
      }`,
      variables: {
        diff,
        nodeSn
      }
    })
  },


  /**
   * 获取练习列表
   * @param {diff} 难度id
   * @param {nodeSn} 章节的sn
   */
  getExercises: (diff, nodeSn) => {
    return gql.query({
      query: `query getExercises($diff:Int!, $nodeSn:String!){
        xuekewang{
          exercises(diff: $diff, nodeSn: $nodeSn){
            images{
              nameUrl
            }
            answerImages{
              nameUrl
            }
            sn
            isPrint
            printCount
            exerciseName
          }
        }
      }`,
      variables: {
        diff,
        nodeSn
      }
    })
  },

  /**
   * 获取练习详情
   * @param {sn} 子章节sn
   */
  getExercisesDetail: (sn) => {
    return gql.query({
      query: `query getExercisesDetail($sn:String!){
        xuekewang{
          exercise(sn: $sn){
            answerImages{
              nameUrl
            }
            answerPdf{
              nameUrl
            }
            pdf{
              nameUrl
            }
            images{
              nameUrl
            }
            exerciseName
            printCount
            sn
            isPrint
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 获取子章节详情
   * @param {sn} 子章节sn
   */
  getNodeDetails: (sn) => {
    return gql.query({
      query: `query getNodeDetails($sn:String!){
        xuekewang{
          node(sn: $sn) {
            id
            sn
            printCount
            name
            root {
              id
              sn
              name
            }
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 创建学科网订单
   * @param {Object} pms
   * attributes  Object {resourceType: String!}
   * featureKey: String!
   */
  createXuekewangOrder: (pms) => {
    return gql.mutate({
      mutation: `mutation ($input: CreateXuekewangOrderInput!){
        createXuekewangOrder(input:$input){
          state
        }
      }`,
      variables: {
        input: pms
      }
    })
  },

  /**
   * 首页学科
   */
  getLastLearn: (stageSn) => {
    return gql.query({
      query: `query Subject($stageSn:String!,$sn: String!, $type: PayableItemTypeEnum!){
        xuekewang {
          registered
          subjects{
            sn
            currentUserNum
            lastNode{
              name
            }
          }
        }
        xuekewangVideoSubject(stageSn: $stageSn){
          previewVideoSum
          subjects{
            currentUserNum
            courseId
            subjectId
            subjectName
            kidVideoCount(sn:$sn,type:$type)
            vidoeTitle
          }
        }
      }`,
      variables: {
        stageSn,
        sn: stageSn,
        type: 'stage'
      }
    })
  },

  /**
   * 获取试卷缓存分类
   */
  getPaperCates: () => {
    return gql.query({
      query: `query getPaperCates{
        mistakeCount{
          misCount
        }
        xuekewang {
          selectedPaperTypes{
            id
            name
          }
          selectedPaperSubject{
            subjectId
            paperTypeId
            areaId
            gradeId
          }
          totalPapers
          printPaperCount
          percentage
          totalErrorBooksNum
          totalSubjectNums: totalReportNum(type:XuekewangSubjectReport)
          totalReportNums: totalReportNum(type:XuekewangSubjectReport)
        }
      }`,
      // variables: {
      //   type:
      // }
    })
  },

  /**
   * 提交批改
   * @param { Array } questions 批改结果
   * @param { String } type 批改类型
   * @param { id } id 批改id
   */
  submitCorrect: (questions, type, id) => {
    return gql.mutate({
      mutation: `mutation ($input: SubmitWrongQuestionInput!){
        submitXuekewangWrongQuestion(input:$input){
          state
          workerSn
        }
      }`,
      variables: {
        input: {
          questions: questions,
          type: type,
          id: id
        }
      }
    })
  },
  /**
   * 获取学科网学习页banner
   */
  getBanners: () => {
    return gql.query({
      query: `query getBanners($type: BannerTypeEnum!){
        banners(type: $type){
          imageUrl
          name
        }
      }`,
      variables: {
        type: 'xuekewang'
      }
    })
  },

  /**
   * 获取教材下用户学习的进度
   */
  getSyncExercisePrecent: (sn) => {
    return gql.query({
      query: `query getSyncExercisePrecent($sn: String!){
       xuekewang{
        textbookPercentage(sn: $sn){
          count
          percentage
        }
       }
      }`,
      variables: {
        sn
      }
    })
  },


  /**
   * 获取学科错题列表
   */
  getSubjectsErrorbook: () => {
    return gql.query({
      query: `query {
        xuekewang {
          subjects {
            iconUrl
            subjectId
            subjectName
            sn
            errorBooksNum
          }
        }
      }`
    })
  },

  /**
   * 获取知识点
   * @param {Object}
      sn 学科的sn
      startTime 开始时间
      endTime 结束时间
   */
  getKnowledges: (pms) => {
    return gql.query({
      query: `query getKnowledges($sn: String!, $startTime: String!, $endTime: String!){
        xuekewangSubject(sn:$sn, startTime: $startTime, endTime:$endTime){
          subject{
            sn
          }
          knowledges{
            errorBookCount
            id
            name
          }
        }
      }`,
      variables: {
        ...pms
      }
    })
  },

  /**
   * 获取练习列表
   */
  getKnowledgeExercises: (subjectSn, isPrint = 0) => {
    return gql.query({
      query: `query getExercises($subjectSn:String, $exerciseType:String, $isPrint: Int){
        xuekewang{
          exercises(subjectSn:$subjectSn, exerciseType: $exerciseType, isPrint: $isPrint){
            sn
            dateTime
            isPrint
            pageSize
            exerciseName
          }
          exerciseCount(subjectSn:$subjectSn, exerciseType: $exerciseType, isPrint: $isPrint)
        }
      }`,
      variables: {
        subjectSn,
        exerciseType: 'kpoint',
        isPrint
      }
    })
  },

  /**
   * 获取学段列表
   */
  getStages: (stageSn) => {
    return gql.query({
      query: `query getStages($stageSn:String!){
        xuekewangVideoSubject(stageSn: $stageSn){
          stages{
            sn
            name
          }
        }
        xuekewang{
          registered
        }
      }`,
      variables: {
        stageSn,
      }
    })
  },
  
  /*
   * 获取学科错题列表
   */
  getSubjectsErrorbook: () => {
    return gql.query({
      query: `query {
        xuekewang {
          subjects {
            iconUrl
            subjectId
            subjectName
            sn
            errorBooksNum
          }
        }
      }`
    })
  },

  /**
   * 获取学科错题筛选项
   * @param { String } sn 科目sn
   * @param { String } startAt 开始时间
   * @param { String } endAt 结束时间
   */
  getErrorbookFilters: (sn, startAt, endAt) => {
    return gql.query({
      query: `query($sn: String!,$startAt: String!,$endAt: String!) {
        xuekewang {
          errorBookKnowledges(sn:$sn,startAt:$startAt,endAt:$endAt) {
            docCount
            key
          }
          errorBookTypeNames(sn:$sn,startAt:$startAt,endAt:$endAt) {
            docCount
            key
          }
        }
      }`,
      variables: {
        sn,
        startAt,
        endAt
      }
    })
  },

  /**
   * 获取学科错题筛选项
   * @param { String } sn 科目sn
   * @param { String } startAt 开始时间
   * @param { String } endAt 结束时间
   */
  getErrorbookFilters: (sn, startAt, endAt) => {
    return gql.query({
      query: `query($sn: String!,$startAt: String!,$endAt: String!) {
        xuekewang {
          errorBookKnowledges(sn:$sn,startAt:$startAt,endAt:$endAt) {
            docCount
            key
          }
          errorBookTypeNames(sn:$sn,startAt:$startAt,endAt:$endAt) {
            docCount
            key
          }
        }
      }`,
      variables: {
        sn,
        startAt,
        endAt
      }
    })
  },

  /**
   * 获取错题列表
   * @param { String } sn 科目sn
   * @param { String } startAt 开始时间
   * @param { String } endAt 结束时间
   * @param { String } knowledge 知识点
   * @param { String } typeName 题型
   * @param { String } state 是否学会
   */
  getErrorbookList: (sn, startAt, endAt, knowledge, typeName, state, page) => {
    return gql.query({
      query: `query($sn: String!,$startAt: String!,$endAt: String!,$knowledge: String!,$typeName: String!,$state: Int!,$page:Int!,$per:Int!){
        xuekewang {
          errorBooks(sn: $sn,startAt: $startAt,endAt: $endAt,knowledge: $knowledge,typeName: $typeName,state: $state,page:$page,per:$per) {
            totalCount
            books{
              deletedAt
              updatedAt
              xuekewangQuestion {
                quesBody
                quesId
                typeName
                xuekewangKnowledges {
                  originalId
                  title
                }
              }
            }
          }
        }
      }`,
      variables: {
        sn,
        startAt,
        endAt,
        knowledge,
        typeName,
        state,
        page,
        per: 5
      }
    })
  },
  /**
   * 标记是否已学会
   * @param { Array } quesIds 题目ids
   * @param { String } action 标记类型 create/destroy
   */
  markErrorbook: (quesIds, action) => {
    return gql.mutate({
      mutation: `mutation ($input:MarkWrongQuestionInput!){
        markXuekewangWrongQuestion(input:$input){
         state
       }
     }`,
      variables: {
        input: {
          quesIds,
          action
        }
      }
    })
  },

  /**
   * 获取学科知识图谱
   */
  getSubjectsAtlas: () => {
    return gql.query({
      query: `query {
        xuekewang {
          subjectRate {
            subjectName
            subjectId
            scoringRate
            questionNum
          }
          totalErrorBooksNum
        }
      }`
    })
  },

  /**
   * 获取知识点列表
   * @param { string } subjectId 科目id
   */
  getKnowledgesAtlas: (subjectId) => {
    return gql.query({
      query: `query($subjectId:Int) {
        xuekewang {
          kpointRate(subjectId:$subjectId) {
            kpName
            tureRate
          }
        }
      }`,
      variables: {
        subjectId
      }
    })
  },

  /**
   * 获取错题详情
   * @param { string } id 题目id
   */
  getErrorbookDetail: (id) => {
    return gql.query({
      query: `query($id:String) {
        xuekewang {
          question(id:$id) {
            children{
              option {
                name
                value
              }
              quesAnswer
              quesBody
              quesParse
            }
            option {
              name
              value
            }
            quesAnswer
            quesBody
            quesParse
          }
        }
      }`,
      variables: {
        id
      }
    })
  },

  /**
   * 获取学科会员信息
   */
  getSubjectMemberInfo: () => {
    return gql.query({
      query: `query {
        currentUser {
          isSchoolAgeMember
          selectedKid{
            schoolAgeMember{
              expiresAt
            }
          }
        }
      }`
    })
  },

  /**
   * 获取试卷详情
   * @param { string } sn
   */
  getPaperDetail: (sn) => {
    return gql.query({
      query: `query($sn:String) {
        xuekewang {
          paper(sn:$sn){
            answerImages{
              nameUrl
            }
            title
            images{
              nameUrl
            }
            answerPdf{
              nameUrl
            }
            pdf{
              nameUrl
            }
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 获取报告详情
   * @param { string } sn
   */
  getReportDetail: (sn) => {
    return gql.query({
      query: `query($sn:String) {
        xuekewang {
          report(sn:$sn){
            images{
              nameUrl
            }
            pdf{
              nameUrl
            }
            name
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

   /**
   * 获取学科网视频学科列表
   * @param {String} stageSn 学段sn
   */
  getvideoSubject: (stageSn) => {
    return gql.query({
      query: `query getvideoSubject($stageSn:String!,$sn: String!, $type: PayableItemTypeEnum!){
        xuekewangVideoSubject(stageSn: $stageSn){
          previewVideoSum
          subjects{
            courseId
            subjectId
            subjectName
            kidVideoCount(sn:$sn,type:$type)
            vidoeTitle
          }
        }
        xuekewang{
          registered
        }
      }`,
      variables: {
        stageSn,
        sn: stageSn,
        type: 'stage'
      }
    })
  },

  /**
   * 获取学科网视频学科列表
   * @param {String} stageSn 学段sn
   * @param {String} courseId 课程id
   */
  getvideoList: (stageSn, courseId) => {
    return gql.query({
      query: `query getvideoSubject($stageSn:String!, $courseId:String!){
        xuekewangVideos(stageSn: $stageSn, courseId: $courseId){
          id
          img
          name
          playCount
          videoCount
        }
      }`,
      variables: {
        stageSn,
        courseId
      }
    })
  },

    /**
   * 获取学科网详情视频学科列表
   * @param {Int} videoId 视频id
   * @param {Int} page 
   * @param {Int} perPage  每页数量
   */
  getvideoDetailList: (videoId, page, perPage) => {
    return gql.query({
      query: `query getvideoDetailList($videoId:Int!, $page:Int!, $perPage: Int!){
        xuekewangVideoList(videoId: $videoId, page: $page, perPage: $perPage){
          id
          img
          name
          isPlay
          likes
          payCount
          videoPath
        }
      }`,
      variables: {
        videoId,
        page,
        perPage
      }
    })
  },

  /**
   * 创建视频点击记录
   * @param {Int} videoId
   * @param {String} videoName
   * @param {String} subjectId
   * @param {Int} stageSn
   */
  createVideoRecord: (input) => {
    return gql.mutate({
      mutation: `mutation createVideoRecord($input:CreateXuekewangVideoRelationInput!){
        createXuekewangVideo(input: $input){
          state
        }
      }`,
      variables: {
        input
      }
    })
  },

  /**
   * 获取报告
   * @param {String} sn 学科sn
   *  @param {String} page 页数
   *  @param {String} startAt 开始时间
   *  @param {String} endAt 结束时间
   *  @param {String} type 报告类型
   */
  getReporter: (sn, page, startAt, endAt, type) => {
    return gql.query({
      query: `query getReporter($sn:String!, $type: ReportTypeEnum!, $page:Int!, $per: Int!, $startAt: String, $endAt: String){
        xuekewang{
          reports(sn: $sn, type: $type, page: $page, per: $per, startAt: $startAt, endAt: $endAt){
            exerciseName:name
            sn
            images{
              id
            }
            dateTime: createdAt
          }
        }
      }`,
      variables: {
        sn,
        type,
        page,
        per: 10,
        startAt,
        endAt
      }
    })
  },

  /**
   * 创建阶段报告
   * @param {String} sn 学科sn
   * @param {String} startAt 开始时间
   * @param {String} endAt 结束时间
   */
  createStageeport: (input) => {
    return gql.mutate({
      mutation: `mutation createStageeport($input:CreateXuekewangReportInput!){
        createXuekewangReport(input: $input){
          state
        }
      }`,
      variables: {
        input
      }
    })
  },

  /**
   * 获取答案
   * @param {String} answeId 
   * @param {String} type 
   */
  getSubjectAnswer: (id, type) => {
    return gql.query({
      query: `query previewAnswer($id: String,$type: ReportTypeEnum!){
        xuekewang {
          previewAnswer(id:$id,type:$type)
        }
      }`,
      variables: {
        id,
        type
      }
    })
  },
}

export default graphqlApi