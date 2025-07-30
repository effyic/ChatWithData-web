export interface LoginUserName {
  username: string
  password: string
  login_type: string
}

export interface LoginPhoneNumber {
  login_type: string
  phone_number: string
  code: string
}
export interface UserInfo {
  id: number
  Mobile: string,//账号
  State: string,
  Nickname: string,
  Password: string,//角色
}

export interface UpdataType {
  username?: string
  password?: string
  confirm_password?: string
  old_password?: string
  avatar?: string
  gender?: string
}
