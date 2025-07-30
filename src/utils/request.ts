import axios from "axios";
import {
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
} from "element-plus";
import { saveAs } from "file-saver";
import { tansParams } from "@/utils/effyic";
import cache from "@/utils/cache";
import { useUserStore } from "@/stores/user";

let downloadLoadingInstance: ReturnType<typeof ElLoading.service>;

// 是否显示重新登录
export const isRelogin = { show: false };

// 创建axios实例
const service = axios.create({
  baseURL: "/api",
  // timeout: 1000 * 60 * 60,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token !== null)
      config.headers.Authorization = `Bearer ${token}`
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    

    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = `${config.url}?${tansParams(config.params)}`;
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (
      !isRepeatSubmit &&
      (config.method === "post" || config.method === "put")
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === "object"
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime(),
      };
      const sessionObj = cache.session.getJSON("sessionObj");
      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ""
      ) {
        cache.session.setJSON("sessionObj", requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (
          s_data === requestObj.data &&
          requestObj.time - s_time < interval &&
          s_url === requestObj.url
        ) {
          const message = "数据正在处理，请勿重复提交";
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON("sessionObj", requestObj);
        }
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 0;
    // 获取错误信息
    const msg = res.data.message;
    // 二进制数据则直接返回
    if (
      res.request.responseType === "blob" ||
      res.request.responseType === "arraybuffer"
    )
      return res.data;

    if (code === 0) {
      return Promise.resolve(res.data);
    } else if (code === 401) {
      localStorage.removeItem('token')
      const userStore = useUserStore()
      userStore.loginDialog = true
      return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
    } 
    else {
      ElNotification.error({
        title: msg,
      });
      return Promise.reject("error");
    }
  },
  (error) => {
    const { message,status } = error;
    // if(status === 401){
    //   ElMessage({
    //     message: '登录状态已过期，请重新登录',
    //     type: "error",
    //     duration: 5 * 1000,
    //   });
    //   localStorage.removeItem('token')
    //   const userStore = useUserStore()
    //   userStore.loginDialog = true
    // }else{
      // const updateStore = useUpdateStore()
      // updateStore.showUpdateDialog({
      //   version:'1.1',
      //   description: '描述',
      //   image: '图片',
      //   date:'2025-10-09'
      // })
      // return Promise.resolve(res.data);
      ElMessage({
        message,
        type: "error",
        duration: 5 * 1000,
      });
    // }
    return Promise.reject(error);
  }
);

// 通用下载方法
export function download(
  url: string,
  method: string,
  params: any = {},
  filename: string
) {
  downloadLoadingInstance = ElLoading.service({
    text: "正在下载数据，请稍候",
    background: "rgba(0, 0, 0, 0.7)",
  });
  return service({ url, method, params, responseType: "blob" })
    .then(async (data: any) => {
      const isBlob = data.type !== "application/json";
      if (isBlob) {
        const blob = new Blob([data]);
        saveAs(blob, filename);
      } else {
        const resText = await data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = rspObj.msg;
        ElMessage.error(errMsg);
      }
      downloadLoadingInstance.close();
    })
    .catch((r) => {
      console.error(r);
      ElMessage.error("下载文件出现错误，请联系管理员！");
      downloadLoadingInstance.close();
    });
}

export default service;
