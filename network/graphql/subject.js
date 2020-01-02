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
          printPaperCount
          percentage
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
}

export default graphqlApi