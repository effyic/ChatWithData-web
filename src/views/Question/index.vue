<script setup name="Question" lang="ts">
import { onMounted, ref, watchEffect, watch } from 'vue';
import { ElMessage, ElMessageBox, type UploadProps } from 'element-plus'
import { useQuestionStore } from '@/stores/question'
import MarkdownIt from 'markdown-it'
import { imgSize } from "@mdit/plugin-img-size";
import useClipboard from 'vue-clipboard3'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import cache from "@/utils/cache";
import SectionItem from './components/SectionItem.vue'
import drawerItem from './components/drawerItem.vue'
import { formatBytes } from "@/utils/effyic";
import dayjs from 'dayjs'
import { useWriterQueue } from "@/hooks/useWriterQueue";
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router'
import voiceInput from "./components/voiceInput.vue";
import { Upload, Document, Delete } from '@element-plus/icons-vue'

const route = useRoute()

onMounted(() => {
  if (route.query.projectId) {
    QuestionStore.questionParames.project_id = Number(route.query.projectId)
  }
})

let abortController: any
const md = new MarkdownIt({ html: true }).use(imgSize)
const { toClipboard } = useClipboard()
const QuestionStore = useQuestionStore()
const disableFlg = ref(false)
const contentTop = ref<any>(null)
const sendInput = ref<any>(null)
const userContext = ref('')
const isSend = ref(false)
const sendLoad = ref(false)
const debounceTimer: any = ref(null)
const debounceDelay = 100
const reportQueue = useWriterQueue()


watchEffect(() => {
  isSend.value = String(userContext.value.trim()).length > 0 && QuestionStore.questionParames.project_id != ''
})
onMounted(() => {
  toScrollBottom() //针对知识库直接跳转对话置底操作
  // if (cache.local.get("token")) {
  QuestionStore.getProjects()
  // }
  QuestionStore.$onAction(({ name, after }) => {
    if (name === 'getHistory' || name === 'NewSession' || name === 'deleteHistory') {
      after(() => {
        toScrollBottom()
        sendLoad.value = false
        visualizerRef.value.setAutoSend(true)
      });
    }
  });
})
//回车规则
function sendUserContext(event: KeyboardEvent) {
  if (String(userContext.value.trim()).length === 0 && event.shiftKey) {
    event.preventDefault()
  }
  if (String(userContext.value.trim()).length !== 0 && !event.shiftKey && event.code === 'Enter') {
    event.preventDefault()
    if (sendLoad.value)
      return
    // 清除之前的定时器
    if (debounceTimer.value)
      clearTimeout(debounceTimer.value)


    debounceTimer.value = setTimeout(() => {
      if (!event.isComposing && event.code === 'Enter' && !event.shiftKey && String(userContext.value.trim()).length > 0)
        sendMessage()
    }, debounceDelay)
  }
}

//  聊天信息置底
function toScrollBottom() {
  setTimeout(() => {
    if (contentTop.value.scrollHeight > contentTop.value.clientHeight) {
      contentTop.value.scrollTo({
        top: contentTop.value.scrollHeight - contentTop.value.clientHeight,
      })
    }
  }, 100)
}

//发送消息
function sendMessage(str?: string) {
  console.log(isSend.value, !!str);

  if (sendLoad.value) {//针对还在回答就点击推荐问题和模版报告
    return ElMessage.warning('当前只能同时回答一个问题！')
  }
  if (isSend.value || !!str) {
    sendLoad.value = true
    visualizerRef.value.setAutoSend(false)
    QuestionStore.questionParames.query = str ? str : userContext.value
    QuestionStore.questionParames.message_id = 0
    QuestionStore.historyList.push({
      user_content: str ? str : userContext.value,
      thinking: '',
      collapse: ['1'],
      edit: false,
      loading: true,
      isCharts: false,
      assistant_content: '',
    })
    userContext.value = ''
    toScrollBottom()
    SendmMsg(QuestionStore.historyList.length - 1)
  }
}

//生成
async function SendmMsg(i: number) {
  if (QuestionStore.questionParames.session_id == 0) {
    let res = await QuestionStore.createSession({
      name: QuestionStore.questionParames.query,
    })
    console.log(res);

    QuestionStore.questionParames.session_id = res.id
  }

  abortController = new AbortController();
  fetchEventSource('/api/analysis/stream',
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${cache.local.get("token")}`,
      },
      body: JSON.stringify({
        query: QuestionStore.questionParames.query,
        session_id: QuestionStore.questionParames.session_id,
        project_id: QuestionStore.questionParames.project_id,
      }),
      signal: abortController.signal,
      openWhenHidden: true,
      onmessage(e: any) {
        let dataMessage = JSON.parse(e.data)
        console.log(dataMessage);

        if (dataMessage.type === 'done') {
          abortController.abort() // 关闭流
          sendLoad.value = false
          visualizerRef.value.setAutoSend(true)
          QuestionStore.historyList[i].loading = false
          QuestionStore.sessionsList() //会话列表
          QuestionStore.idIndex = QuestionStore.questionParames.session_id
          toScrollBottom()
        } else {
          const type = dataMessage.type
          if (type === 'text') {
            reportQueue.enqueue(reportQueue.createWriterTask(dataMessage.message, QuestionStore.historyList[i], 'assistant_content', 30))
          }
          if (type === 'thinking') {
            reportQueue.enqueue(reportQueue.createWriterTask(dataMessage.message, QuestionStore.historyList[i], 'thinking', 30))
          }
          if (type === 'report') {
            reportQueue.enqueue(reportQueue.createWriterTask(dataMessage.message, QuestionStore.historyList[i], 'assistant_content', 30))
          }
          if (type === 'generate_charts') {
            QuestionStore.historyList[i].isCharts = true
          }
          toScrollBottom()
        }

      },
      onclose() {
        abortController.abort()

      },
      onerror(error) {
        ElMessage.error('非法参数')
        abortController.abort()
        QuestionStore.historyList[i].loading = false
        sendLoad.value = false
        visualizerRef.value.setAutoSend(true)
        throw error
      },
    })
}


//重新生成+编辑
function handleReset(id: number, i: number) {
  QuestionStore.historyList[i].loading = true
  QuestionStore.historyList[i].edit = false
  QuestionStore.historyList[i].assistant_content = ''
  QuestionStore.questionParames.query = QuestionStore.historyList[i].user_content
  QuestionStore.questionParames.message_id = id
  QuestionStore.historyList.length = i + 1
  SendmMsg(i)
}

async function copyText(content: string) {
  try {
    // 复制
    await toClipboard(content)
    ElMessage.success('复制成功')
    // 复制成功
  }
  catch (e) {
    ElMessage.error('复制失败')
  }
}

function renderMarkdown(content: any) {
  const html = md.render(content || '');
  // 用 div 包裹所有 table
  return html.replace(/<table([^>]*)>([\s\S]*?)<\/table>/g,
    '<div style="overflow-x: auto; margin: 1em 0;"><table $1>$2</table></div>'
  );
}

const stopAnswer = () => {
  abortController.abort()
  reportQueue.clearTaskQueue()
  sendLoad.value = false
  QuestionStore.historyList[QuestionStore.historyList.length - 1].loading = false
  visualizerRef.value.setAutoSend(true)
}

const visualizerRef = ref();
const isVoice = ref(false)

const handleStart = () => {
  isVoice.value = true
  visualizerRef.value.start();
  visualizerRef.value.setAutoSend(true)
};

const handleStop = () => {
  visualizerRef.value.stop();
  isVoice.value = false
};

const onTranscript = (text: string) => {
  sendMessage(text)
  // if (QuestionStore.questionParames.project_id != '') {

  //   sendMessage(text)
  // } else {
  //   ElMessage.error('请先选择系统')
  // }
};

const fileInfo = ref<{ name: string } | null>(null)

const handleSuccess = (uploadFile: any) => {
  fileInfo.value = {
    name: uploadFile.raw.name
  }
  ElMessage.success('上传成功')
}

const handleDelete = () => {
  fileInfo.value = null
}
</script>

<template>
  <div class="app-container">
    <div class="content">
      <div class="content-top"
        :style="`height: ${QuestionStore.historyList.length > 0 ? 'calc(100% - 184px)' : '0px'};margin-top:${QuestionStore.historyList.length > 0 ? 0 : -200}px`"
        ref="contentTop">
        <div v-show="QuestionStore.historyList.length === 0">
          <h2 style="text-align: center;">有什么可以帮你的</h2>
        </div>
        <div v-for="(message, index) of QuestionStore.historyList" :key="index" class="messageItem">
          <div class="Msgtime" v-if="message?.created_at"> {{ dayjs(message.created_at).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
          <div class="user" v-if="message.user_content">
            <div class="userCont" style="justify-content: flex-end;">
              <div class="infoCont" style="max-width: calc(100% - 34px);">
                <div class="textCont">
                  <!-- <div class="operate">
                    <el-tooltip effect="light" placement="top" content="复制" enterable>
                      <svg-icon style="cursor: pointer;margin-right:10px" name="copy" width="24px" height="24px"
                        @click="copyText(message.user_content)" />
                    </el-tooltip>
                    <el-tooltip v-if="!message.loading" effect="light" placement="top" content="编辑" enterable>
                      <svg-icon style="cursor: pointer;margin-right:20px" name="edit" width="24px" height="24px"
                        @click="message.edit = true" />
                    </el-tooltip>
                  </div> -->
                  <div class="chatTxt" style="text-align:left" v-if="!message.edit" v-text="message.user_content" />
                  <div class="textArea" v-else>
                    <el-input v-model="message.user_content" type="textarea" resize="none" :rows="2" />
                    <div class="btnBox">
                      <el-button round @click="message.edit = false">取消</el-button>
                      <el-button type="primary" @click="handleReset(message.message_id, index)" round>确认</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="chat">
            <div class="chatCont" style="padding: 0 16px;">
              <div class="infoCont" style="max-width: calc(100% - 2px)">
                <div class="textCont" style="width: 100%">
                  <div class="chatTxt" style="width: 100%">
                    <div style="border-bottom: 1px solid #999;margin-bottom: 20px;" v-if="message.thinking != ''">
                      <el-collapse v-model="message.collapse" style="border: none;margin-bottom: 20px;">
                        <el-collapse-item title="思考过程" :key="index" name="1">
                          <div v-html="renderMarkdown(message.thinking)"></div>
                        </el-collapse-item>
                      </el-collapse>
                    </div>
                    <!--模型回答-->
                    <div v-html="renderMarkdown(message.assistant_content)">
                    </div>
                    <div class="fileLoading" v-if="message.loading">
                      <svg-icon style="margin-right: 5px" :class="message.loading ? 'spinner' : ''"
                        :name="message.loading ? 'load' : 'fileOk'" />
                      {{ !message.isCharts ? '正在分析数据...可能需要一些时间' : '正在生成数据可视化报表...' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content-bottom">
        <div class="sendInputCont">
          <div class="inputBox">
            <el-input v-show="!isVoice" ref="sendInput" v-model="userContext" :disabled="disableFlg"
              placeholder="询问任何盾构方面问题（按Enter键发送）" type="textarea" resize="none" :autosize="{ minRows: 1 }"
              @keydown.enter.stop="sendUserContext($event)" />
            <voiceInput style="margin-bottom: 10px;" @transcript="onTranscript" v-show="isVoice" ref="visualizerRef">
            </voiceInput>
            <div class="uploadBtn">
              <!-- <el-select-v2 v-model="QuestionStore.questionParames.project_id" :options="QuestionStore.option"
                placeholder="选择系统" style="width: 190px;  vertical-align: middle" collapse-tags collapse-tags-tooltip>
                <template #default="{ item }">
                  <el-tooltip effect="light" placement="left" :content="item.label" enterable>
                    {{ item.label }}
                  </el-tooltip>
                </template>
              </el-select-v2> -->

              <div class="UploadFile">
                <el-upload
                  class="upload-file"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleSuccess"
                >
                  <div class="upload-trigger" v-if="!fileInfo">
                    <el-icon class="upload-icon"><Upload /></el-icon>
                    <div class="upload-text">点击上传文件</div>
                  </div>
                  <div v-else class="file-info">
                    <el-icon class="file-icon"><Document /></el-icon>
                    <span class="file-name">{{ fileInfo.name }}</span>
                    <el-icon class="delete-icon" @click.stop="handleDelete"><Delete /></el-icon>
                  </div>
                </el-upload>
              </div>

              <div v-if="isVoice" @click="handleStop" style="display: flex;align-items: center;">
                <span v-if="sendLoad" style="color: #999; font-size: 12px;margin-right: 4px;">正在回答中</span>
                <img style="width: 24px;margin-right: 8px;cursor: pointer;" src="@/assets/images/voiceStop.png" alt="">
              </div>
              <div v-else>
                <div class="stopAnswer" v-if='sendLoad' @click="stopAnswer">
                </div>
                <div v-else style="display: flex;align-items: center;">
                  <img @click="handleStart" style="width: 24px;margin-right: 8px;cursor: pointer;"
                    src="@/assets/images/voiceStart.png" alt="">
                  <el-button type="primary" :class="!isSend || sendLoad ? '' : 'enable'" :disabled="!isSend || sendLoad"
                    @click="sendMessage()">
                    <svg-icon name="send" width="24px" height="24px" />
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="prompt">
            说明：人工智能语言语言模型，无法保证输出内容的准确性和完整性。其回答内容不代表我们的态度、观点或立场。请您在使用时自行评估信息的可靠性，并参考其他来源做出决策。
            基于 一叶轻舟大语言模型 (Skiff-LLMs)，生成式人工智能服务备案号：Beijing-YiYeQingZhou-20240102
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixin.scss' as *;
@use '@/assets/styles/variables.module.scss' as *;

$primary-color: #3962A5;

:deep(ul) {
  word-break: break-word;
}

:deep(pre) {
  overflow: auto;
  padding: 20px 0;
}

.app-container {
  width: 100%;
  height: calc(100% - 20px);
  background: url('@/assets/images/mainbg.png');
  background-size: auto 100%;
  /* 宽固定，高自适应 */
  background-repeat: no-repeat;
  background-position: center center;

  :deep(.preview) {

    .el-dialog {
      padding: 16px 0;
    }

    .el-dialog__header {
      padding: 0 16px;
    }

    .el-dialog__body {
      margin-top: 10px;
      padding: 16px 24px !important;
      background-color: #F2F3F5;
    }

    .drawerTitle {
      font-size: 18px;
      font-weight: bold;
      color: #292C2E;
      padding-bottom: 8px;
    }
  }

  :deep(.el-overlay+.el-overlay) {
    //第二个遮罩层透明
    background-color: transparent
  }

  :deep(.el-collapse-item) {
    border: none;

    button {
      border: none;
    }

    .el-collapse-item__wrap {
      border: none;
    }
  }

  :deep(.el-drawer.rtl) {
    width: 25% !important;
    top: 7%;
    height: 85%;
    border-radius: 20px;
    right: 20px;

  }

  :deep(.el-drawer__header) {
    margin-bottom: 10px
  }

  :deep(.el-drawer__title) {
    color: #000;
    font-weight: bold;
    font-size: 20px;
  }

  :deep(.el-dialog) {
    border-radius: 10px;

    .el-dialog__body {
      padding-top: 0;

      .template-Box {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin: 36px 0 24px;

        .Box {
          height: 186px;
          width: 208px;
          border: 1px solid #e6e6e6;
          border-radius: 10px;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          padding: 16px;
          display: flex;
          flex-direction: column;

          .title {
            flex: 1;
            color: #000;
            font-size: 16px;
            font-weight: 500;
          }

          img {
            width: 100%;
            margin: 10px 0;
          }

          .boxBom {
            color: $primary-color;
            display: flex;
            align-items: center;

            div {
              cursor: pointer;
              margin-right: 10px;
              padding: 3px 12px;
              border-radius: 4px;
              border: 1px solid $primary-color;
              font-size: 12px;

              &:hover {
                background-color: #CCE5FE;
              }
            }
          }
        }
      }
    }
  }

  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .content-top {
      overflow-y: auto;
      transition: height 0.2s ease;
      width: 100%;
      padding: 0 0px;
      margin-bottom: 20px;

      h2 {
        padding: 30px 0 10px 0;
        margin: 0;
      }

      .top-title {
        font-size: 14px;
        color: #292C2E;
      }

      .top-mag {
        margin-top: 20px;
        font-size: 11px;
        background: #fff;
        text-indent: 2em;
        padding: 10px;
        border-radius: 10px;

        span {
          color: $primary-color;
        }
      }

      .messageItem {
        .Msgtime {
          color: #B3BDC7;
          font-size: 12px;
          text-align: center;
          padding: 20px 0;
        }

        .user {
          width: 100%;
          padding: 5px 0;


          .chatFileBox {
            display: flex;
            //max-width: 790px;
            width: 70%;
            padding: 8px 16px 0;
            margin: 0 auto;
            flex-wrap: wrap;
            overflow: auto;
            padding-top: 8px;

            &::-webkit-scrollbar {
              width: 0;
            }

            .fileInfo {
              border: 1px #f0f9eb solid;
              cursor: pointer;
              width: 181px;
              height: 48px;
              display: flex;

              margin-right: 4px;
              margin-bottom: 4px;
              position: relative;

              //&:nth-child(4n){
              //  margin-right: 0;
              //}
              .right {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 12px;
                color: #0a1629;
                padding: 10px 8px;
              }

              .fileClose {
                position: absolute;
                top: -6px;
                right: -6px;
                cursor: pointer;
              }
            }
          }

          .userCont {
            width: 100%;
            text-align: right;
            margin: 0 auto;
            padding: 0 16px;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-start;

            .avatar {
              width: 24px;
              min-width: 24px;
              height: 24px;
              margin-top: 5px;
              margin-right: 10px;
            }

            .infoCont {
              flex: 1;

              .textCont {
                font-size: 14px;
                font-weight: 600;
                padding-top: 2px;
                display: flex;
                align-items: center;
                justify-content: flex-end;

                .operate {
                  display: flex;
                  align-items: center;
                }

                .chatTxt {
                  display: inline-block;
                  padding: 10px 16px;
                  font-size: 14px;
                  border-radius: 6px;
                  background: #CCE5FE;
                  min-height: 30px;
                  color: #292C2E;
                  white-space: pre-wrap;
                }

                .textArea {
                  width: 378px;
                  padding: 16px;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  background-color: #fff;
                  border-radius: 12px;

                  :deep(.el-textarea) {
                    width: 100%;

                    .el-textarea__inner {
                      cursor: text;
                      box-shadow: none !important;
                      outline: none !important;
                      padding: 0;
                      margin-bottom: 10px;
                      /* 为按钮留出空间 */
                      overflow-y: auto !important;

                      input {
                        transition: opacity .3s ease;
                        height: 36px;
                        color: #000;
                        cursor: text;
                      }
                    }
                  }
                }

              }
            }
          }
        }

        .chat {
          width: 100%;
          padding: 5px 0;

          overflow: hidden;

          ::v-deep(table) {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;

            th,
            td {
              border: 1px solid #DCDFE6;
              padding: 12px;
              text-align: center;
              font-size: 14px;
              line-height: 1.5;
            }

            th {
              background-color: #F5F7FA;
              color: #303133;
              font-weight: 500;
              text-align: center; // 添加表头居中对齐
            }

            td {
              color: #606266;
            }
          }

          .chatCont {
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            position: relative;

            .avatar {
              width: 24px;
              min-width: 24px;
              height: 24px;
              margin-top: 5px;
              margin-right: 10px;
            }



            .infoCont {
              flex: 1;


              .textCont {
                font-size: 14px;
                position: relative;
                color: var(--chat-content-text-color);
                display: inline-block;

                .bg {
                  position: absolute;
                  right: 0;
                  top: 37px;
                }


                .chatTxt {
                  display: inline-block;
                  border-radius: 6px;
                  background: #FFFFFF;
                  padding: 10px 16px;
                  font-size: 14px;
                  min-height: 30px;

                  .fileLoading {
                    display: flex;
                    font-size: 10px;
                    align-items: center;
                    padding-bottom: 10px;
                  }

                  .stepBox {
                    background: #F2F3F5;
                    padding: 10px;
                    border-radius: 6px;
                  }

                  .operate {
                    display: flex;
                    align-items: center;
                  }

                  .reportoperate {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 10px;

                    .Box {
                      display: flex;
                      align-items: center;
                      cursor: pointer;
                      border: 1px solid #CED0D6;
                      font-size: 11px;
                      padding: 3px 5px;
                      border-radius: 4px;
                      cursor: pointer
                    }
                  }

                  .step {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;



                    .step-content {
                      font-size: 12px;
                      font-weight: bold;
                    }
                  }
                }

                .queItem {
                  color: #292C2E;
                  padding-top: 20px;
                  font-size: 12px;
                  cursor: pointer;

                  span {
                    background: #fff;
                    padding: 5px 10px;
                    border-radius: 10px;
                  }
                }

                :deep(code) {
                  border-radius: 8px;
                  margin: 10px 0;
                }
              }
            }
          }
        }
      }
    }

    .spinner {
      animation: rotate 2s linear infinite;
    }

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    .content-top::-webkit-scrollbar {
      display: none;
    }

    .content-bottom {

      padding: 0 10px;

      .sendInputCont {
        width: 100%;
        height: 164px;
        box-sizing: border-box;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .options {
          display: flex;
          width: 100%;
          height: 32px;
          margin: 0 auto;

          .tab {
            margin-right: 20px;
            height: 32px;
            padding: 0 18px;
            border: 1px #D8E0F0 solid;
            border-radius: 15px;
            font-size: 12px;
            cursor: pointer;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              border: 1px #2F82FF solid;
              color: #2F82FF;
            }

            &.bg {
              border: 1px #2F82FF solid;
              color: #2F82FF;
            }
          }
        }

        .inputBox {
          width: 100%;
          height: calc(100% - 26px);
          border: 1px #CED0D6 solid;
          background: #fff;
          border-radius: 14px;
          padding: 10px;
          box-sizing: border-box;
          position: relative;

          display: flex;
          flex-direction: column;
          margin: 10px auto;

          .reportStyle {
            font-size: 16px;
            color: $primary-color;
            font-weight: bold;
          }

          .uploadBtn {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .UploadFile {
              width: 200px;
              margin-right: 10px;
              
              .upload-file {
                width: 100%;
                
                :deep(.el-upload) {
                  width: 100%;
                }
              }
              
              .upload-trigger {
                width: 100%;
                height: 32px;
                border: 1px solid #CED0D6;
                border-radius: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                background: #fff;
                 border-color: $primary-color;
                  background: #F6F9FE;
                
                &:hover {
                  border-color: $primary-color;
                  background: #F6F9FE;
                  
                  .upload-icon {
                    color: $primary-color;
                  }
                  
                  .upload-text {
                    color: $primary-color;
                  }
                }
                
                .upload-icon {
                  font-size: 16px;
                  color: $primary-color;
                  margin-right: 4px;
                  transition: all 0.3s;
                }
                
                .upload-text {
                  font-size: 12px;
                 color: $primary-color;
                  transition: all 0.3s;
                }
              }
              
              .file-info {
                width: 100%;
                height: 32px;
                background: #F6F9FE;
                border: 1px solid #CED0D6;
                border-radius: 16px;
                padding: 0 12px;
                display: flex;
                align-items: center;
                position: relative;
                transition: all 0.3s;
                 border-color: $primary-color;
                
                &:hover {
                  border-color: $primary-color;
                  background: #F6F9FE;
                  
                  .file-icon {
                    color: $primary-color;
                  }
                  
                  .file-name {
                    color: $primary-color;
                  }
                }
                
                .file-icon {
                  font-size: 16px;
                  color: $primary-color;
                  margin-right: 6px;
                  transition: all 0.3s;
                }
                
                .file-name {
                  flex: 1;
                  font-size: 12px;
                  color: #606266;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  transition: all 0.3s;
                }
                
                .delete-icon {
                  font-size: 19px;
                  cursor: pointer;
                  padding: 4px;
                  border-radius: 50%;
                  transition: all 0.3s;
                  margin-left: 4px;
                  background: #f56c6c;
                   color: #fff;
                 
                }
              }
            }

            :deep(.el-select-v2__wrapper) {
              border-radius: 40px;
            }

            :deep(.el-select-v2__placeholder) {
              font-size: 12px;
              color: #000;
            }

            :deep(.el-select-v2__tags-text) {
              max-width: 90px !important;
            }

            .stopAnswer {
              cursor: pointer;
              width: 64px;
              height: 32px;
              border: 2px solid #777777;
              border-radius: 32px;
              display: flex;
              align-items: center;
              justify-content: center;

              &::after {
                content: '';
                width: 12px;
                height: 12px;
                background-color: #777777;
              }
            }
          }

          .downloadBtn {
            margin-right: 10px;
            border: 1px solid #D5D8DE;
            border-radius: 50%;
            cursor: pointer;
            padding: 7px;

          }

          .fileListBox {
            display: flex;
            padding: 10px 0;
            max-height: 80px;
            flex-wrap: wrap;
            overflow: auto;

            &::-webkit-scrollbar {
              width: 0;
            }

            .fileInfo {
              width: 181px;
              height: 48px;
              display: flex;
              border: 1px solid #DCDFE5;
              border-radius: 6px;
              margin-right: 8px;
              margin-bottom: 8px;
              position: relative;

              .right {
                width: 140px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 10px;
                color: #0a1629;
                padding: 6px 7px;
              }

              .fileClose {
                position: absolute;
                top: -8px;
                right: -8px;
                cursor: pointer;
              }

            }

          }

          .upload-demo {
            width: 120px;
            height: 28px;
            margin-top: 20px;
            margin-bottom: 10px;

            :deep(.el-upload) {
              width: 88px;

              .el-upload-dragger {
                padding: 0;
                border-color: transparent !important;
                background: transparent !important;

                &:hover {
                  border-color: transparent !important;
                  background: transparent !important;
                }

                .el-button {
                  border: 1px #D8E0F0 solid !important;
                  border-radius: 14px !important;
                  color: #000000 !important;
                  width: 100%;
                  opacity: 1;
                  font-size: 12px;
                  height: 28px !important;
                  background: #fff;
                  position: unset !important;
                }
              }
            }
          }

          :deep(.el-button) {
            border: none;
          }



          &.focus {
            box-shadow: none;

            .label {
              left: 6px;
              top: 0;
              transform: scale(.8) translateY(-70%);
            }
          }


          :deep(.el-textarea) {
            width: 100%;


            .el-textarea__inner {
              cursor: text;
              box-shadow: none !important;
              outline: none !important;
              padding: 0;
              min-height: 80px !important;
              max-height: 270px;
              margin-bottom: 10px;
              /* 为按钮留出空间 */
              overflow-y: auto !important;

              input {
                transition: opacity .3s ease;
                height: 36px;
                color: #000;
                cursor: text;
              }
            }
          }

          .el-button {
            opacity: .4;
            width: 64px;
            height: 32px;

            &.enable {
              opacity: 1
            }

            &.el-button--primary {
              background: $primary-color;
              border-radius: 20px;
            }
          }
        }

        .prompt {
          width: 100%;
          color: #7D8592;
          font-weight: 400;
          font-size: 10px;
          height: 28px
        }
      }
    }
  }
}
</style>
