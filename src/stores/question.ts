import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import QuestionService from '@/api/question'
import { useRouter } from 'vue-router'
import cache from '@/utils/cache';
import { useUserStore } from '@/stores/user';

export const useQuestionStore = defineStore('Question', () => {

  const router = useRouter();
  const historyList = ref<Array<any>>([])
  const sessionsItemList = ref<any>([])
  const option = ref<any>([])
  const idIndex = ref(0)
  const questionParames = reactive<any>({
    session_id: 0, //不填默认创建新会话
    query: '', //问题
    project_id: '', //项目id
  })

  //新会话
  function NewSession() {
    // if (!cache.local.get('token')) {
    //   useUserStore().loginDialog = true
    //   return
    // }
    Object.assign(questionParames, {
      session_id: 0,
      query: '',
      project_id: '', //项目id
    });
    historyList.value = []
    getProjects()

  }
  //会话列表
  function sessionsList() {
    return QuestionService.sessionsList().then((res) => {
      sessionsItemList.value = res.data.sessions
    })
  }

  //创建会话
  function createSession(data: any) {
    return QuestionService.createSession(data).then((res) => {
      return res.data
    })
  }

  //会话详情
  function getHistory(id: number) {
    idIndex.value = id
    Object.assign(questionParames, {
      session_id: 0,
      query: '',
      project_id: '', //项目id
    });
    questionParames.session_id = id
    return QuestionService.sessionsMsg(id).then((res) => {
      //数据知识库
      questionParames.project_id = res.data.project_id
      historyList.value = []
      //内容解析
      res.data.messages.forEach((item: any) => {

        historyList.value.push({
          user_content: item.user_content,
          message_id: item.id,
          assistant_content: JSON.parse(item.assistant_content)?.content || '',
          thinking: JSON.parse(item.assistant_content)?.think || '',
          loading: false,
          created_at: item.created_at,
          collapse: ['1'],
        })
      })
    })
  }

  // 添加 edit 属性的函数
  function addEditProperty(data: any): any {
    if (!data || typeof data !== 'object') return;

    if (Array.isArray(data)) {
      return data.map((item: any) => addEditProperty(item));
    }

    const newData = { ...data };

    if (newData.title !== undefined) {
      newData.edit = false;
      newData.children = false;
    }

    if (newData.sections) {
      newData.sections = addEditProperty(newData.sections);
    }

    return newData;
  }

  //删除会话
  async function deleteHistory(id: number) {
    await QuestionService.deleteSession(id).then(async res => {
      await sessionsList()
      if (sessionsItemList.value.length > 0) {
        if (id == idIndex.value) {
          await getHistory(sessionsItemList.value.at(-1).id)
        }
      } else {
        await NewSession()
      }

    })
  }

  //更新会话
  async function updateSessionFn(id: number, name: string) {
    await QuestionService.updateSession(id, { name }).then(res => {
      sessionsList()
    })
  }

  //知识库列表
  function getProjects() {
    return QuestionService.getProjects().then((res) => {
      option.value = res.data.map((item: any) => {
        return {
          label: item.name,
          value: item.id
        }
      })
    })
  }

  return {
    history,
    historyList,
    questionParames,
    getProjects,
    option,
    sessionsItemList,
    sessionsList,
    getHistory,
    NewSession,
    idIndex,
    deleteHistory,
    addEditProperty,
    createSession,
    updateSessionFn
  }
})
