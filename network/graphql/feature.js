// 功能性接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 获取默写分类
   * @param { string } key featureKey
   */
  getCategory: (key) => {
    return gql.query({
      query: `query ($key: String!){
        feature(key: $key){
          categories {
            image,
            name,
            sn,
            writeType
          }
        }
      }`,
      variables: {
        key: key
      }
    })
  },

  getStages: (sn) => {
    return gql.query({
      query: `query($sn: String!) {
        userStages {
          currentStage{
            sn
            name
            guessWriteCategories(sn:$sn){
              sn
              name
            }
          }
          siblings{
            sn
            name
            guessWriteCategories(sn:$sn){
              sn
              name
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
   * 获取默写列表
   * @param { string } sn
   */
  getWriteList: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        category(sn:$sn) {
          sn
          name
          children{
            sn
            name
            printCount
            questions{
              answer
              title
            }
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
	},

	 //获取年级以及对应教材接口
	 getGradeList:()=>{
    return gql.query({
      query:`query{
        userStages{
          currentStage{
             name
             sn
          }
          siblings{
           name
           sn
           rootName
           sn
           kousuanCategories{
             name
             sn
           }
          }
        }
      }`
    })
  },

  //获取年级下对应的口算类型接口
  getKousuanType:(sn)=>{
    return gql.query({
      query:`query($sn: String!){
        category(sn:$sn){
          children{
            name
            image
            sn
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  //获取口算类型具体题目接口
  getKnowledgePoints:(sn)=>{
    return gql.query({
      query:`query($sn: String!){
        category(sn:$sn){
          children{
            name
            image
            sn
            quesionNumber
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  //口算打印接口
  createKousunOrder:(input)=>{
    return gql.mutate({
      mutation: `mutation ($input: CreateResourceOrderInput!){
        createResourceOrder(input:$input){
          state
        }
      }`,
      variables: {
        input: input
      }
    })
  },
  /**
   * 获取错题科目列表
   *
   * @returns
   */
  getErrorSubjects: () => {
    return gql.query({
      query: `query{
        mistakes{
          count
          object:course
        }
        }`
    })
  },

  /**
   * 获取错题列表
   *
   */
  getMistakes: (params) => {
    return gql.query({
      query: `query($course: String,$printCount: Int,$startAt: String,$endAt: String,$answer: MistakeAnswerEnum) {
        mistakeCourse(course:$course,printCount:$printCount,startAt:$startAt,endAt:$endAt,answer:$answer){
          created_at:createDay
          content:mistakes{
            answer_urls:answerUrls
            course
            level
            print_count:printerOrdersCount
            reason
            urls
            id
            sn
            }
          }
        }`,
      variables: {
        ...params
      }
    })
  },
  /**
   * 保存错题
   *
   */
  saveMistakes: (input) => {
    return gql.mutate({
      mutation: `mutation($input:CreateMistakeInput!) {
        createMistake(input:$input){
          state
          mistake
        }
        }`,
      variables: {
        input: input
      }
    })
  },
  /**
   * 删除错题
   *
   * @param {*} input
   * @returns
   */
  deleteMistakes: (input) => {
    return gql.mutate({
      mutation: `mutation($input:DeleteMistakeInput!) {
        deleteMistake(input:$input){
         code
        }
        }`,
      variables: {
        input: input
      }
    })
  },
  /**
   * 获取错题模板
   *
   * @returns
   */
  mistakeTemplates: () => {
    return gql.query({
      query: `query{
        mistakeTemplates{
          cateType
          id
          imageUrl
          name
          }
        }`
    })
  },
  /**
   * 拍照搜题
   *
   * @returns
   */
  getPhotoAnswer: (input) => {
    return gql.mutate({
      mutation: `mutation($input:MistakeSearchInput!) {
        mistakeSearch(input:$input){
          answerUrls
          questionUrl
        } 
        }`,
      variables: {
        input: input
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

}

export default graphqlApi
