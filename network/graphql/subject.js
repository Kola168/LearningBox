// 学前接口

import gql from '../graphql_config'
const graphqlApi = {
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
            children {
              name
              id
              sn
              children{
                name
                id
                sn
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
   * 获取练习列表
   * @param {diff} 难度id
   * @param {sn} 章节的sn
   */
  getExercises: (diff, nodeSn)=>{
    return gql.query({
      query: `query getExercises($diff:Int!, $nodeSn:String!){
        xuekewang{
          exercises(diff: $diff, nodeSn: $nodeSn){
            exerciseId
            exerciseName
            diff
            stage
            sn
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
      query: `query getExercisesDetail($sn:Int!){
        xuekewang{
          exercise(sn: $sn){
            exerciseId
            exerciseName
            diff
            stage
            sn
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
          node(sn: $sn){
            name
            id
            sn
            children {
              name
              id
              sn
            }
          }
      }`,
      variables: {
        sn
      }
    })
  },

}

export default graphqlApi