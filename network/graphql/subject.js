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
        Register(input:$input){
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
          subjects {
            iconUrl
            subjectId
            subjectName
            totalNumber
          }
        }
      }`
    })
  },

  /**
   * 获取学科教材地区
   *
   */
  getSubjectAreas: () => {
    return gql.query({
      query: `query {
        xuekewang {
          areas{
            areaId
            areaName
          }
        }
      }`
    })
  },

  /**
   * 获取试卷类型
   * @param { Number } subjectId
   */
  getSubjectPaperTypes: (subjectId) => {
    return gql.query({
      query: `query ($subjectId: Int!){
        xuekewang {
          paperTypes(subjectId:$subjectId){
            id
            name
          }
        }
      }`,
      variables: {
        subjectId: subjectId
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
  getSubjectPapers: (subjectId, paperType, areaId, pageIndex) => {
    return gql.query({
      query: `query ($subjectId: Int!,$paperType: Int!,$areaId: Int!,$pageIndex: Int!,$pageSize: Int!){
        xuekewang {
          paperLists(subjectId:$subjectId,paperType:$paperType,areaId:$areaId,pageIndex:$pageIndex,pageSize:$pageSize){
            paperId
            isPrint
            isReport
            printCount
            title
          }
        }
      }`,
      variables: {
        subjectId: subjectId,
        paperType: paperType,
        areaId: areaId,
        pageSize: 20,
        pageIndex: pageIndex
      }
    })
  },

  /**
   * 获取学科网学科目录
   */
  getSubject: ()=> {
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
  getTextbookVersion: (sn)=> {
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
  getDefaultExercise:  (diff, nodeSn)=>{
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
  getExercises: (diff, nodeSn)=>{
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
  getExercisesDetail: (sn)=>{
    return gql.query({
      query: `query getExercisesDetail($sn:String!){
        xuekewang{
          exercise(sn: $sn){
            answerImages{
              nameUrl
            }
            images{
              nameUrl
            }
            exerciseName
            printCount
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
  getLastLearn: ()=> {
    return gql.query({
      query: `query Subject{
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
      }`
    })
  },

  /**
   * 获取试卷缓存分类
   */
  getPaperCates: ()=> {
    return gql.query({
      query: `query getPaperCates{
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
          printPaperCount
          percentage
         
        }
      }`
    })
  },


}

export default graphqlApi



