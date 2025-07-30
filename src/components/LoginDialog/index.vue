<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { LoginPhoneNumber, LoginUserName } from '@/types/user'
import LoginService from '@/api/login'
import { useUserStore } from '@/stores/user'
import { useUpdateStore } from '@/stores/update'
const router = useRouter()


interface user {
  phone: string
  verifyCode: string
  inviteCode: string
  agreement: boolean
}

const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const registerStatus = ref(false)
const loginLoading = ref(false)
const showInvite = ref(false)
const loginForm = reactive<user>({
  phone: '',
  verifyCode: '',
  inviteCode: '',
  agreement: false
})

// 手机号验证规则
const validatePhone = (rule: any, value: string, callback: any) => {
  console.log('validatePhone',value,registerStatus.value)
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else if (registerStatus.value) {
    callback(new Error('该手机号已注册，请返回登录'))
  } else {
    callback()
  }
}
const rules = reactive<FormRules<user>>({
  phone: [
    { required: true, validator: validatePhone, trigger: ['blur', 'submit'] }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
  inviteCode: [
    { required: true, message: '请输入邀请码', trigger: 'blur' }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意用户服务协议和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate((valid) => {
    if (valid) {
      loginLoading.value = true
      const data = {
        mobile: loginForm.phone,
        code: loginForm.verifyCode,
        invitation: showInvite.value ? loginForm.inviteCode : undefined,
      } as any
      if (showInvite.value) {
        LoginService.registry(data).then((res) => {
          if(res.data?.is_register){
            registerStatus.value = true
            formEl.validateField('phone')
          }else{
            registerStatus.value = false
            handleResult(res)
          }
        }).catch(() => {
          loginLoading.value = false
        })
      } else {
        LoginService.login(data).then((res) => {
          handleResult(res)
        }).catch(() => {
          loginLoading.value = false
        })
      }

    }
  })
}
const updateStore = useUpdateStore()

function handleResult(res: any) {
  localStorage.setItem('token', res.data?.token)
  ElMessage.success('登录成功')
  userStore.loginDialog = false
  userStore.token = res.data?.token
  loginForm.phone = ''
  loginForm.verifyCode = ''
  loginForm.inviteCode = ''
  loginForm.agreement = false
  setTimeout(() => {
    loginLoading.value = false
    location.reload()
  }, 300)
  updateStore.startPolling()

}

// function sendReset() {
//   const oldTimer = new Date(Number(userStore.timer)).getTime()
//   let num = Math.floor((oldTimer - new Date().getTime()) / 1000) > 0 ? Math.floor((oldTimer - new Date().getTime()) / 1000) : 60
//   isSend.value = true
//   num--
//   sendText.value = `${num.toString().padStart(2, '0')}s后再次获取`
//   const timer = setInterval(() => {
//     num--
//     sendText.value = `${num.toString().padStart(2, '0')}s后再次获取`
//     if (num < 0) {
//       clearInterval(timer)
//       sendText.value = '获取验证码'
//       isSend.value = false
//     }
//   }, 1000)
// }

// 倒计时相关
const countDown = ref(60)
const isCountingDown = ref(false)
const countDownText = ref('获取验证码')

// 发送验证码
const sendVerifyCode = async () => {
  try {
    await loginFormRef.value?.validateField('phone')
    // 开始倒计时
    isCountingDown.value = true
    countDown.value = 60
    const timer = setInterval(() => {
      if (countDown.value > 0) {
        countDown.value--
        countDownText.value = `${countDown.value}秒后重试`
      } else {
        clearInterval(timer)
        isCountingDown.value = false
        countDownText.value = '获取验证码'
      }
    }, 1000)
    LoginService.sendCode(loginForm.phone).then((res) => {
      console.log(res);
      ElMessage.success('验证码已发送')

    }).catch(() => {
      ElMessage.error('发送失败')
    })
  } catch (error) {
    // 手机号验证失败
  }
}

// 查看协议
const showUserAgreement = (id: number) => {
  router.push({
    path: '/HelpCenter',
    query: {
      id,
      hiddenTitle: 1
    }
  })
}

function handleClose() {
  userStore.loginDialog = false
}

function changeTab() {
  showInvite.value = !showInvite.value
  if (loginFormRef.value) {
    const fields = ['phone', 'verifyCode', 'inviteCode', 'agreement']
    fields.forEach(field => {
      loginFormRef.value?.clearValidate(field)
    })
  }
  // 重置注册状态
  registerStatus.value = false
}
</script>

<template>
  <el-dialog v-model="userStore.loginDialog" style="border-radius: 20px;" title="" width="480px"
    :before-close="handleClose">
    <div class="main">
      <div class="loginBox">
        <div class="loginCont">
          <div class="title">
            <img src="@/assets/images/loginTitle.png" alt="logo" style="width: 136px; height: 64px;">
          </div>
          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="auto">
            <el-form-item prop="phone">
              <el-input v-model="loginForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item prop="verifyCode" style="margin-top: 10px;border: 1px solid #dcdfe6;
    border-radius: 8px;">
              <div class="verify-code-input">
                <el-input v-model="loginForm.verifyCode" placeholder="请输入验证码" style="border:none" />
                <span class="verify-code-text" :class="{ disabled: isCountingDown }" @click="sendVerifyCode">
                  {{ countDownText }}
                </span>
              </div>
            </el-form-item>
            <el-form-item style="margin-top: 10px;" prop="inviteCode" v-if="showInvite">
              <el-input v-model="loginForm.inviteCode" placeholder="请输入邀请码" />
            </el-form-item>
            <el-form-item prop="agreement" style="margin:40px 0 24px 0;">
              <div style="font-size: 12px;display: flex;align-items: center;">
                <el-checkbox v-model="loginForm.agreement">
                </el-checkbox>
                <span style="color:#B3BDC7;margin-right:0px;">我已阅读并同意</span>
                <a @click="showUserAgreement(3)" style="color: #007DFA;">《用户服务协议》</a>
                和
                <a @click="showUserAgreement(4)" style="color: #007DFA;">《隐私政策》</a>
              </div>

            </el-form-item>
            <el-button type="primary" @click="submitForm(loginFormRef)" v-if="showInvite">注册</el-button>
            <el-button type="primary" v-else style="margin-left:0px;"  @click="submitForm(loginFormRef)">登录</el-button>
            <p style="color:#CED0D6;font-size:16px;font-weight: 600;text-align: center;cursor: pointer;margin-top:20px;" @click="changeTab">{{ showInvite ? '返回登录':'注册' }}</p>
          </el-form>
        </div>
      </div>
    </div>
  </el-dialog>

</template>

<style lang="scss" scoped>
:deep(.el-form-item) {
  flex-direction: column;

  .el-form-item__label-wrap {
    margin: 0 !important;
  }
}

.main {
  width: 100%;
  overflow: hidden;
  background: #fff;
  position: relative;
  display: flex;
  justify-content: center;

  .loginBox {
    width: 100%;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 20px;
    margin-bottom: 20px;
    box-sizing: border-box;

    .loginCont {
      max-width: 350px;
      width: 100%;

      .title {
        text-align: center;
        margin-bottom: 32px;

        span {
          background: linear-gradient(90deg, #01ABF5 1.44%, #015AF5 98.56%);
          -webkit-background-clip: text;
          color: transparent;
          font-weight: 600;
        }
      }
    }

    .head {
      color: #3B4960;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 32px;
    }

    .file-tabs {
      display: inline-flex;
      background: #fff;
      border: 1px solid #409dff;
      box-sizing: border-box;
      border-radius: 6px;
      position: relative;
      width: 200px;

      .tab-item {
        cursor: pointer;
        padding: 6px 16px;
        font-size: 14px;
        color: #409dff;
        position: relative;
        border-radius: 4px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        white-space: nowrap;
        z-index: 1;
        flex: 1;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 100px;
        height: 36px;

        &.has-dot {
          &::after {
            content: '';
            position: absolute;
            top: 4px;
            right: 4px;
            width: 6px;
            height: 6px;
            background-color: #ff4d4f;
            border-radius: 50%;
          }
        }

        &:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        &:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        &.active {
          color: #ffffff;
          background-color: #409dff;
          font-weight: 500;
        }

        &:hover:not(.active) {
          color: var(--el-color-primary);
        }
      }
    }

    :deep(.el-form) {
      .el-form-item__label-wrap {
        display: none;
      }

      .el-form-item__content {
        width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;

        .el-input {
          height: 40px;

          .el-input__wrapper {
            border-radius: 8px;
          }
        }

        .el-button {
          width: auto;
          min-width: 88px;
          margin: 0;
          margin-left: 20px;
          height: 40px;
          font-size: 12px;

          &.el-button--info {
            color: #999999;
            background: #e7e8eb;
          }
        }
      }

      .resetPassword {
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
      }

      .el-button {
        width: 100%;
        height: 40px;
        border: none;
        font-size: 16px;
        background: #007DFA;

        &.el-button--info {
          color: #999999;
          background: #e7e8eb;
        }
      }

      // .checkBox {
      //   margin-top: 14px;
      //   font-size: 12px;
      //   font-weight: 400;
      //   display: flex;
      //   //align-items: center;
      //   line-height: 18px !important;
      //   color: #3B4960;

      //   :deep(.el-checkbox) {
      //     margin-right: 6px;
      //     height: 12px;
      //     padding-top: 4px;
      //     .el-checkbox__input.is-checked .el-checkbox__inner{
      //       background-color: #007DFA !important;
      //       border-color: #007DFA !important;
      //     }
      //   }

      //   a {
      //     font-size: 12px;
      //     text-decoration: none;
      //     color: #0059F4;
      //     font-weight: 600;
      //   }

      //   .el-form-item__content {
      //     line-height: 18px !important;
      //     align-items: flex-start;
      //   }
      // }
    }
  }
}

.verify-code-input {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;

  :deep(.el-input) {
    flex: 1;

    .el-input__wrapper {
      box-shadow: none;
    }
  }

  .verify-code-text {
    display: inline-block;
    min-width: 95px;
    padding: 0 12px;
    font-size: 14px;
    color: #B3BDC7;
    cursor: pointer;
    user-select: none;
    position: relative;
    text-align: center;

    &.disabled {
      color: #999;
      cursor: not-allowed;
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 16px;
      background-color: #dcdfe6;
    }
  }
}

:deep(.el-checkbox) {
  font-size: 12px;
  margin-right: 4px;

  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #007DFA;
    border-color: #007DFA;
  }

  .el-link {
    font-weight: normal;
    margin: 0 2px;
  }
}
</style>
