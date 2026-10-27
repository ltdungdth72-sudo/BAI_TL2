/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageSquareQuote,
  Tv,
  Edit,
  Award,
  Users,
} from 'lucide-react';
import {
  GroupData,
  TOPICS,
  DISCUSSION_QUESTIONS,
  GroupAnswers,
} from '../types/discussion';

interface GroupDetailModalProps {
  group: GroupData | null;
  onClose: () => void;
  onOpenFeedback: (group: GroupData) => void;
  onProjectGroup: (groupId: number) => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  onClose,
  onOpenFeedback,
  onProjectGroup,
}) => {
  if (!group) return null;

  const topic = TOPICS[group.topicId];
  const isTopic1 = group.topicId === 'topic_1';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
              {group.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{group.name}</h3>
                {group.status === 'da_gui' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã gửi bài
                  </span>
                ) : group.status === 'ban_nhap' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Bản nháp
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Chưa làm bài
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Môn Tin học 10 • THPT Đinh Tiên Hoàng • GV: Lê Thị Dung
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
            title="Đóng (Quay lại danh sách)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-600 font-semibold block mb-0.5">Chủ đề thảo luận:</span>
              <span
                className={`inline-block font-bold px-2 py-0.5 rounded-md ${
                  isTopic1 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {topic.title}
              </span>
            </div>

            <div>
              <span className="text-slate-600 font-semibold block mb-0.5">Thời gian gửi bài:</span>
              <span className="text-slate-800 font-medium">
                {group.submittedAt
                  ? new Date(group.submittedAt).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'Chưa gửi'}
              </span>
            </div>

            {group.members && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-semibold inline-flex items-center gap-1 mb-0.5">
                  <Users className="w-3.5 h-3.5" />
                  Thành viên nhóm:
                </span>
                <span className="text-slate-900 font-medium ml-1.5">{group.members}</span>
              </div>
            )}
          </div>

          {/* Assigned Scenario */}
          <div
            className={`p-4 rounded-2xl border ${
              isTopic1
                ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                : 'bg-purple-50/70 border-purple-200 text-purple-950'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5">
              <MessageSquareQuote className="w-4 h-4" />
              <span>TÌNH HUỐNG ĐÃ GIAO</span>
            </div>
            <p className="text-sm leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-white">
              {group.scenario}
            </p>
          </div>

          {/* 4 Questions and Actual Answers */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              BÀI LÀM CỦA NHÓM (4 CÂU HỎI)
            </h4>

            {DISCUSSION_QUESTIONS.map((q) => {
              const qKey = q.id as keyof GroupAnswers;
              const ans = group.answers[qKey]?.trim();

              return (
                <div
                  key={q.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {q.number}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h5>
                  </div>

                  <div className="pl-8">
                    {ans ? (
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 font-medium">
                        {ans}
                      </p>
                    ) : (
                      <p className="text-xs italic text-slate-600 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                        Nhóm chưa nhập câu trả lời cho câu hỏi này.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback section if already reviewed */}
          {group.feedback?.isEvaluated && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Nhận xét của giáo viên
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800">
                  {group.feedback.isPublished ? 'Đã công bố cho học sinh' : 'Chưa công bố (Nội bộ)'}
                </span>
              </div>
              {group.feedback.generalComment && (
                <p className="text-xs sm:text-sm text-slate-900 mb-1.5">
                  <strong>Nhận xét chung:</strong> {group.feedback.generalComment}
                </p>
              )}
              {group.feedback.strengths && (
                <p className="text-xs sm:text-sm text-slate-900 mb-1.5">
                  <strong>Điểm mạnh:</strong> {group.feedback.strengths}
                </p>
              )}
              {group.feedback.improvements && (
                <p className="text-xs sm:text-sm text-slate-900">
                  <strong>Cần bổ sung / hướng hoàn thiện:</strong> {group.feedback.improvements}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 font-semibold text-xs sm:text-sm transition-all"
          >
            Quay lại danh sách nhóm
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onProjectGroup(group.id);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Tv className="w-4 h-4" />
              Trình chiếu nhóm này
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenFeedback(group);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Edit className="w-4 h-4" />
              Nhận xét bài làm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
