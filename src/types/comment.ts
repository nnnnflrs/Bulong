export interface Comment {
  id: string;
  recording_id: string;
  user_id: string;
  anonymous_name: string;
  content: string;
  created_at: string;
}

export interface CommentInsert {
  content: string;
  anonymous_name: string;
}
