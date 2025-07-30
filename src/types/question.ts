export interface types {
  label: string;
  value: number;
}
export interface History {
  /**
   * 回答
   */
  assistant_content: string;
  conversation_id: number;
  created_at: string;
  assistant_files: any;
  /**
   * id
   */
  id: number;
  message_type: string;
  updated_at: string;
  /**
   * 用户问题
   */
  user_content: string;
  loading?: boolean;
  sendFileFlag?: boolean;
}
