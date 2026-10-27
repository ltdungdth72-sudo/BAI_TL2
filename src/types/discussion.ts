/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TopicId = 'topic_1' | 'topic_2';

export interface TopicInfo {
  id: TopicId;
  title: string;
  scenario: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
}

export const TOPICS: Record<TopicId, TopicInfo> = {
  topic_1: {
    id: 'topic_1',
    title: 'Quyền tác giả đối với áp phích',
    scenario:
      'Sau khi An hoàn thành áp phích cho cuộc thi, An đã đăng tác phẩm của mình lên trang cá nhân. Bình rất thích áp phích này nên tải về và xóa tên An ở góc ảnh rồi đăng lên trang cá nhân, giới thiệu rằng chính mình là người thiết kế.',
    badgeColor: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      text: 'text-blue-700',
      border: 'border-blue-300',
      accent: 'from-blue-600 to-cyan-600',
    },
  },
  topic_2: {
    id: 'topic_2',
    title: 'Bản quyền phần mềm',
    scenario:
      'Một học sinh muốn sử dụng phần mềm thiết kế đồ họa có bản quyền nhưng không muốn trả phí. Bạn đã tải phần mềm từ một trang web không chính thức, sử dụng công cụ bẻ khóa để vô hiệu hóa cơ chế kiểm tra bản quyền và cài đặt phần mềm trên máy tính cá nhân.',
    badgeColor: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      text: 'text-purple-700',
      border: 'border-purple-300',
      accent: 'from-purple-600 to-indigo-600',
    },
  },
};

export const DISCUSSION_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    title: 'CÂU HỎI 1',
    question: 'Hành vi nào trong mỗi tình huống có vấn đề về bản quyền?',
  },
  {
    id: 'q2',
    number: 2,
    title: 'CÂU HỎI 2',
    question: 'Mỗi tình huống tương ứng với hành vi vi phạm nào?',
  },
  {
    id: 'q3',
    number: 3,
    title: 'CÂU HỎI 3',
    question: 'Quyền và lợi ích của tác giả hoặc chủ sở hữu có thể bị ảnh hưởng như thế nào?',
  },
  {
    id: 'q4',
    number: 4,
    title: 'CÂU HỎI 4',
    question: 'Theo nhóm em, cần làm gì để tránh vi phạm bản quyền trong tình huống trên?',
  },
] as const;

export type SubmissionStatus = 'chua_lam' | 'ban_nhap' | 'da_gui';

export interface GroupAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

export interface TeacherFeedback {
  generalComment: string;
  strengths: string;
  improvements: string;
  isEvaluated: boolean;
  isPublished: boolean;
  evaluatedAt: string | null;
}

export interface GroupData {
  id: number;
  name: string;
  topicId: TopicId;
  scenario: string;
  members: string;
  answers: GroupAnswers;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  feedback: TeacherFeedback;
}

export interface DiscussionSession {
  sessionId: string;
  sessionTitle: string;
  teacherName: string;
  schoolName: string;
  subjectName: string;
  targetGrade: string;
  createdAt: string;
  updatedAt: string;
  groups: GroupData[];
}
