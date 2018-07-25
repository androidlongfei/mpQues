<template>
<div class="contain">
    <div v-if="loadError">
        <reload-page :reload="this.againLoad"></reload-page>
    </div>
    <div v-else>
        <div v-if="firstLoadStatus">
            <div class="pageLoad">
                <p>正在加载中...</p>
            </div>
        </div>
        <div v-else>
            <div class="title" v-show="questionnaireData.banner">
                <img :src="questionnaireData.banner" alt="" style="width: 100%">
            </div>
            <div class="content">
                <div class="title">
                    <h4 class="h">{{questionnaireData.remark}}</h4>
                    <p class="des"> {{questionnaireData.attentions}} </p>
                </div>
                <div class="question" v-if="paging.curPage % 2 === 0">
                    <single-topic v-for="(questionItem,index) in surveyQuestionList" :key="index" :questionItem="questionItem"></single-topic>
                </div>
                <div class="question" v-else>
                    <single-topic v-for="(questionItem,index) in surveyQuestionList" :key="index+100" :questionItem="questionItem"></single-topic>
                </div>
            </div>

            <div class="paging">
                <button v-if="paging.hasLast" type="primary" @click="fetchLastPage()" class="op">上一页</button>
                <button v-else type="primary" @click="back()" class="op">返回</button>
                <div class="cur">
                    第{{paging.curPage}}页/共{{paging.totalPage}}页
                </div>
                <button v-if="paging.hasNext" type="primary" @click="fetchNextPage()" class="op">下一页</button>
                <button v-else type="primary" :disabled="useCache" @click="fetchNextPage()" class="op">提交</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import ReloadPage from '@/components/ReloadPage'
import SingleTopic from '@/components/singleTopic'
import fetch from '@/service/fetch'
import { setStorage } from '@/utils/wechat'
import { encodeUrlParam, decodeUrlParam } from '@/utils/urlTool'
import { baseUrl } from '@/config/interfaceTool'
import each from 'lodash/each'
export default {
    data() {
        return {
            loadError: false,
            firstLoadStatus: false,
            headerData: {
                headerTitle: '新评估问卷'
            },
            routerParams: {},
            useDefault: false, // 参数不全时，是否使用默认参数
            questionnaireData: {},
            useCache: false,
            paging: {
                curPage: 1, // 当前页
                lastPage: 1, // 上一页
                totalPage: 10, // 总页数
                pageNum: 10, // 每页显示的条数
                hasNext: true, // 是否有下一页
                hasLast: false, // 是否有上一页
                traceId: '' // 批次ID
            },
            param: {
                kv: {}, // 问卷所需参数
                code: '' // 问卷id
            },
            surveyQuestionList: []
        }
    },
    components: {
        ReloadPage,
        SingleTopic
    },
    created() {},
    methods: {
        againLoad() {
            console.log('againLoad...');
            if (!this.routerParams.code) {
                if (this.useDefault) {
                    this.routerParams = {
                        code: 3, // 默认 问卷ID
                        gender: 1 // 默认 性别
                    }
                } else {
                    this.showLoadMsg('问卷code不存在')
                    this.loadError = true
                    return
                }
            }
            if (this.routerParams.gender) {
                this.param.kv.gender = this.routerParams.gender
            }
            if (this.routerParams.birthday) {
                this.param.kv.birthday = this.routerParams.birthday
            }
            if (this.routerParams.height) {
                this.param.kv.height = this.routerParams.height
            }
            if (this.routerParams.weight) {
                this.param.kv.weight = this.routerParams.weight
            }
            if (this.routerParams.code) {
                this.param.code = this.routerParams.code
            }
            let parameterData = {
                data: {
                    traceId: this.paging.traceId,
                    code: this.param.code,
                    kv: this.param.kv,
                    pageIndex: this.paging.curPage,
                    pageSize: this.paging.pageNum,
                    answerList: [],
                    templateCatCode: 'Common_Questionnaire',
                    deviceType: 'MOBILE'
                },
                version: '1.0',
                debug: 'false'
            }
            this.firstLoadStatus = true
            this.loadError = false
            this.pagingFetchQues(parameterData, true)
        },
        fetchLastPage() {
            let answerRecordList = []
            let noselectQue = ''
            // let noselectQueId = ''
            each(this.surveyQuestionList, (question, index) => {
                if (question.types === '1') {
                    // 单选
                    if (question.singelCheckId) {
                        let optionList = []
                        each(question.optionList, (option) => {
                            if (parseInt(question.singelCheckId) === option.optionId) {
                                optionList.push({
                                    optionId: option.optionId,
                                    selected: true
                                })
                            } else {
                                optionList.push({
                                    optionId: option.optionId,
                                    selected: false
                                })
                            }
                        })
                        // optionList.push({
                        //     optionId: question.singelCheckId
                        // })
                        let answerRecordItem = {
                            itemId: question.itemId,
                            optionList: optionList
                        }
                        answerRecordList.push(answerRecordItem)
                    } else {
                        if (!noselectQue) {
                            noselectQue = `${question.seq}、${question.title}`
                            // noselectQueId = question.itemId
                        }
                    }
                } else {
                    // 多选
                }
            })
            if (noselectQue && this.paging.curPage <= this.paging.frontPageCount) {
                // 在前置页内返回上一页时，需要答题
                this.showLoadMsg('请答题:' + noselectQue)
                // let topic = document.getElementById(`_${noselectQueId}`)
                // if (topic) {
                //     topic.scrollIntoView()
                // }
                return
            }
            let curPage = this.paging.curPage - 1
            let parameterData = {
                data: {
                    traceId: this.paging.traceId,
                    code: this.param.code,
                    kv: this.param.kv,
                    pageIndex: curPage,
                    pageSize: this.paging.pageNum,
                    answerList: answerRecordList,
                    templateCatCode: '',
                    deviceType: 'MOBILE'
                },
                version: '1.0',
                debug: 'false'
            }
            this.pagingFetchQues(parameterData)
        },
        fetchNextPage() {
            console.log('this.surveyQuestionList', this.surveyQuestionList);
            let noselectQue = ''
            // let noselectQueId = ''
            let answerRecordList = []
            each(this.surveyQuestionList, (question, index) => {
                // console.log('question', question)
                if (question.types === '1') {
                    // 单选
                    if (question.singelCheckId) {
                        let optionList = []
                        each(question.optionList, (option) => {
                            if (parseInt(question.singelCheckId) === option.optionId) {
                                optionList.push({
                                    optionId: option.optionId,
                                    selected: true
                                })
                            } else {
                                optionList.push({
                                    optionId: option.optionId,
                                    selected: false
                                })
                            }
                        })
                        // optionList.push({
                        //     optionId: question.singelCheckId
                        // })
                        let answerRecordItem = {
                            itemId: question.itemId,
                            optionList: optionList
                        }
                        answerRecordList.push(answerRecordItem)
                    } else {
                        if (!noselectQue) {
                            noselectQue = `${question.seq}、${question.title}`
                            // noselectQueId = question.itemId
                        }
                    }
                } else {
                    // 多选
                }
            })
            if (noselectQue) {
                this.showLoadMsg('请答题:' + noselectQue)
                // let topic = document.getElementById(`_${noselectQueId}`)
                // if (topic) {
                //     topic.scrollIntoView()
                // }
                return
            }
            let curPage = this.paging.curPage + 1
            let parameterData = {
                data: {
                    traceId: this.paging.traceId,
                    code: this.param.code,
                    kv: this.param.kv,
                    pageIndex: curPage,
                    pageSize: this.paging.pageNum,
                    answerList: answerRecordList,
                    // answerList: 'hello',
                    templateCatCode: '',
                    deviceType: 'MOBILE'
                },
                version: '1.0',
                debug: 'false'
            }
            console.log('下一页', curPage, parameterData)
            this.pagingFetchQues(parameterData)
        },
        pagingFetchQues(parameterData, firstResquest) {
            wx.showLoading({
                title: '正在加载中...'
            })
            console.log('getSurveyQuesByJson param', parameterData.data.pageIndex, parameterData)
            // console.log('getSurveyQuesByJson param json', JSON.stringify(parameterData))
            fetch({
                baseUrl: baseUrl,
                api: '/questionnaire/doing',
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                params: parameterData
            }).then(respose => {
                wx.hideLoading()
                this.firstLoadStatus = false
                let res = respose.data
                console.log('getSurveyQuesByJson res', res)
                if (res && res.code === '10000' && res.data) {
                    if (res.data.result) {
                        // 有问卷结果，直接跳转到下一页
                        this.doFinalResult(res.data)
                    } else {
                        // 处理下一页数据
                        this.doResut(res.data)
                    }
                } else {
                    if (firstResquest) {
                        // 首页 显示加载出错，重试
                        this.loadError = true
                    }
                    let failedMsg = res.message ? res.message : '获取数据失败'
                    this.showLoadMsg(failedMsg)
                }
            }).catch((ex) => {
                wx.hideLoading()
                if (firstResquest) {
                    // 首页 显示加载出错，重试
                    this.firstLoadStatus = false
                    this.loadError = true
                }
                console.log('getSurveyQuesByJson error', ex)
                this.showLoadMsg('获取问卷失败,服务器异常')
            })
        },
        doPaging(isScroll) {
            if (this.paging.curPage === this.paging.totalPage) {
                this.paging.hasNext = false
            } else {
                this.paging.hasNext = true
            }
            if (this.paging.curPage > 1) {
                this.paging.hasLast = true
            } else {
                this.paging.hasLast = false
            }
            console.log('doPaging', this.paging.curPage, this.surveyQuestionList)
            if (isScroll) {
                // this.scrollYPosition(200)
            }
        },
        doResut(data) {
            // 处理分页数据
            if (data.questionnaire) {
                this.questionnaireData = data.questionnaire
                if (this.questionnaireData.title) {
                    this.headerData.headerTitle = this.questionnaireData.title
                }
            }
            if (data.currentPageIndex && data.totalPageCount) {
                // console.log('res.data.currentPageIndex', res.data.currentPageIndex, res.data.totalPageCount)
                this.paging.curPage = data.currentPageIndex
                this.paging.totalPage = data.totalPageCount
                this.paging.frontPageCount = data.frontPageCount
            }
            if (data.traceId) {
                this.paging.traceId = data.traceId
            }

            if (data.itemList) {
                this.surveyQuestionList = data.itemList
            }

            // 首页逻辑
            if (this.paging.curPage === 1) {
                this.doPaging(false)
            } else {
                this.doPaging(true)
            }
        },
        doFinalResult(data) {
            // 处理最后一次提交结果
            if (data.result && data.result.master) {
                let queryParam = {}
                if (data.result.master.code) {
                    queryParam.reportCode = data.result.master.code
                    queryParam.name = data.result.master.name
                }
                if (this.routerParams.code) {
                    queryParam.code = this.routerParams.code
                }
                if (data.report) {
                    console.log('报告结果json obj==>', data)
                    // 同步存储
                    // wx.setStorage({
                    //     key: `REPORT_${this.param.code}`,
                    //     data: data
                    // })
                    setStorage(`REPORT_${this.param.code}`, data).then(res => {
                        console.log('将保存存储本地成功...')
                        let queryParam = {
                            code: this.routerParams.code
                        }
                        let url = encodeUrlParam('../report/main', queryParam)
                        console.log('url', url)
                        wx.navigateTo({ url })
                    }).catch(err => {
                        console.log(err)
                    })
                } else {
                    console.log('没返回报告数据...')
                    this.showLoadMsg('无报告数据')
                }
            }
        },
        back() {
            // 返回到上一个页面,采集个人信息页面
            wx.navigateBack({ delta: 1 })
        }
    },
    mounted() {
        this.routerParams = decodeUrlParam(this.$root.$mp.query)
        console.log('this.routerParams', this.routerParams);
        this.againLoad()
    }
}
</script>

<style lang="scss">
.contain {
    height: 100%;
    .pageLoad {
        padding-top: 20rpx;
        text-align: center;
    }
    .content {

        .title {
            text-align: center;
        }
        .title .des,
        .title .h {
            margin: 0;
            // height: 20px;
            line-height: 20px;
        }
        .title .h {
            margin-top: 10px;
        }
        .title .des {
            margin-top: 5px;
            font-size: 14px;
            color: rgb(163,163,163);
            font-weight: bold;
        }
    }

    .paging {
        // margin: 20px auto 0;
        padding: 20px 0;
        display: flex;
        justify-content: space-around;
        // justify-content: space-between;
        align-items: center;
        .op {
            height: 36px;
            width: 80px;
            font-size: 16px;
            line-height: 36px;
        }
        .cur {
            font-size: 16px;
        }
    }
}
</style>
