<template>
  <div class="navbar">
    <div class="logo">
      <img src="@/assets/images/logo.png" alt="">
      中铁十四局集团大盾构工程有限公司
    </div>
    <div class="right-menu">
      <div v-if="token" class="avatar-container">
        <el-dropdown class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <!-- <el-tooltip effect="light" content="帮助中心" placement="bottom">
              <svg-icon width="24px" height="24px" name="helpCenter" @click="router.push({ path: '/helpCenter' })"
                style="margin-right: 10px;" />
            </el-tooltip> -->
            <svg-icon width="24px" height="24px" name="usericon" />
            <span class="Number">{{ name }}</span>
            <!-- <el-icon><caret-bottom /></el-icon> -->
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- <el-dropdown-item @click="showFeedback">
                <div class="join-us">
                  <img src="@/assets/images/feedback.png" alt="反馈" style="width: 18px; height: 18px;">
                  <span>意见反馈</span>
                </div>
              </el-dropdown-item> -->
              <el-dropdown-item>
                <el-popover :width="200" placement="left"
                  popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;">
                  <template #reference>
                    <div class="join-us">
                      <img src="@/assets/images/join.png" alt="加入我们" style="width: 18px; height: 18px;">
                      <span>加入我们</span>
                    </div>
                  </template>
                  <template #default>
                    <img src="@/assets/images/welcome.jpg" alt="logo" style="width: 160px; height: 240px;">
                  </template>
                </el-popover>

              </el-dropdown-item>
              <el-dropdown-item @click="logout">
                <div class="join-us">
                  <img src="@/assets/images/logout.png" alt="退出登录" style="width: 18px; height: 18px;">
                  <span>退出登录</span>
                </div>

              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <!-- <el-button class="login-btn" @click="userStore.loginDialog = true" v-else style="margin-right: 20px;"
        type="primary">请先登录</el-button> -->
    </div>
    <LoginDialog />
    <FeedbackDialog ref="feedbackDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { onMounted, ref, computed } from 'vue';
import LoginDialog from '@/components/LoginDialog/index.vue'
import FeedbackDialog from '@/components/FeedbackDialog/index.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const feedbackDialogRef = ref()

const userStore = useUserStore();
const token = computed(() => userStore.token);
const name = computed(() => (userStore.currentUser.Mobile)?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));
onMounted(() => {
  const localToken = localStorage.getItem('token')
  if (localToken) {
    userStore.token = localToken
  }
})

function showFeedback() {
  feedbackDialogRef.value?.open()
}

function logout() {
  ElMessageBox.confirm('是否确认退出登录，退出登录后您的账号各项操作数据会留存，您可在下次登录后进行查看', '确认退出登录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      localStorage.clear()
      window.location.reload()
    })
}
</script>

<style lang="scss" scoped>
.el-popper.el-dropdown__popper .el-dropdown-menu {
  padding: 10px 0 !important;


}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px !important;

  height: 32px !important;

  line-height: 32px !important;

  font-size: 12px !important;

}




.navbar {
  height: 48px;
  overflow: hidden;
  position: relative;
  margin-bottom: 16px;

  .logo {
    display: flex;
    align-items: center;
    font-size: 22px;
    color: #E6EBF4;

    img {
      height: 48px;
      margin-right: 8px;
    }
  }

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: transparent;
        }
      }
    }

    .avatar-container {
      margin-right: 20px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;

        .Number {
          font-size: 13px;
          color: #000;
          font-weight: bold;
          margin-left: 10px;
        }

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }

    .login-btn {
      background: #007DFA;
    }
  }
}

.el-popper.el-dropdown__popper .el-dropdown-menu__item span {
  color: #292C2E;
}

.join-us {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
</style>
