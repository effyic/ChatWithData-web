import service from '@/utils/request'
import type { LoginPhoneNumber, LoginUserName, UpdataType } from '@/types/user'

class LoginService {

  sendCode(phone: string) {
    return service.post('sms/send', { phone_number: phone })
  }

  registry(data: any) {
    return service.post('users/registry', data)
  }

  userInfo() {
    return service.get('users/current')
  }

  getRouters(){
    return service.get('menus')
  }
  login(data: any) {
    return service.post('users/login', data)
  }

  // 检查手机号是否已注册
  checkPhone(phone: string) {
    return service.post('/api/check_phone', { phone })
  }
}

export default new LoginService()
