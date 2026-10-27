/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  BookOpen,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  MessageSquareQuote,
  Award,
  Sparkles,
  FileCheck2,
  ShieldCheck,
  Edit3,
  QrCode,
} from 'lucide-react';
import {
  DiscussionSession,
  GroupData,
  TOPICS,
  DISCUSSION_QUESTIONS,
  GroupAnswers,
} from '../types/discussion';
import { saveGroupAnswers, saveLocalDraft, getLocalDraft } from '../services/api';

interface StudentViewProps {
  session: DiscussionSession;
  selectedGroupId: number | null;
  onSelectGroup: (groupId: number | null) => void;
  onRefresh: () => void;
  onOpenQR?: (groupId?: number) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  session,
  selectedGroupId,
  onSelectGroup,
  onRefresh,
  onOpenQR,
}) => {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentGroup, setCurrentGroup] = useState<GroupData | null>(null);
  const [answers, setAnswers] = useState<GroupAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });
  const [members, setMembers] = useState<string>('');
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showCheckModal, setShowCheckModal] = useState<boolean>(false);
  const [emptyQuestions, setEmptyQuestions] = useState<number[]>([]);

  // Update currentGroup when session or selectedGroupId changes
  useEffect(() => {
    if (selectedGroupId !== null) {
      const g = session.groups.find((item) => item.id === selectedGroupId);
      if (g) {
        setCurrentGroup(g);
        // Load server data or local draft if newer
        const local = getLocalDraft(selectedGroupId);
        if (
          local &&
          (!g.answers.q1 && !g.answers.q2 && !g.answers.q3 && !g.answers.q4) &&
          (local.answers.q1 || local.answers.q2 || local.answers.q3 || local.answers.q4)
        ) {
          setAnswers(local.answers);
          setMembers(local.members || g.members || '');
        } else {
          setAnswers(g.answers);
          setMembers(g.members || '');
        }
      }
      setHasStarted(true);
    } else {
      setCurrentGroup(null);
    }
  }, [selectedGroupId, session]);

  const handleGroupSelection = (groupId: number) => {
    onSelectGroup(groupId);
    setHasStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswerChange = (qKey: keyof GroupAnswers, val: string) => {
    const updated = { ...answers, [qKey]: val };
    setAnswers(updated);
    if (currentGroup) {
      saveLocalDraft(currentGroup.id, updated, members);
    }
  };

  const handleMembersChange = (val: string) => {
    setMembers(val);
    if (currentGroup) {
      saveLocalDraft(currentGroup.id, answers, val);
    }
  };

  // 1. Save Draft
  const handleSaveDraft = async () => {
    if (!currentGroup) return;
    setIsSavingDraft(true);
    try {
      await saveGroupAnswers(currentGroup.id, answers, members, true);
      saveLocalDraft(currentGroup.id, answers, members);
      setSaveMessage('Đã lưu bản nháp thành công!');
      setTimeout(() => setSaveMessage(null), 3000);
      onRefresh();
    } catch (err: any) {
      setSaveMessage('Lỗi kết nối máy chủ. Bản nháp đã được lưu an toàn trên máy bạn!');
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 2. Check Answers
  const checkCompletion = () => {
    const empty: number[] = [];
    if (!answers.q1.trim()) empty.push(1);
    if (!answers.q2.trim()) empty.push(2);
    if (!answers.q3.trim()) empty.push(3);
    if (!answers.q4.trim()) empty.push(4);
    return empty;
  };

  const handleCheckAnswers = () => {
    const empty = checkCompletion();
    setEmptyQuestions(empty);
    setShowCheckModal(true);
  };

  // 3. Initiate Submit
  const handlePreSubmit = () => {
    const empty = checkCompletion();
    setEmptyQuestions(empty);
    setShowConfirmModal(true);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  // 4. Confirm and Submit
  const handleConfirmSubmit = async () => {
    if (!currentGroup) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);
    setSubmitError(null);

    // Save local draft first so nothing is ever lost
    saveLocalDraft(currentGroup.id, answers, members);

    try {
      await saveGroupAnswers(currentGroup.id, answers, members, false);
      setIsSubmitting(false);
      setShowSuccessModal(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onRefresh();
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(
        err.message || 'Mạng bị gián đoạn. Bài làm đã được lưu an toàn trên máy bạn.'
      );
    }
  };

  // If not started or no group selected: Show Welcome & Group Chooser Screen
  if (!hasStarted || !currentGroup) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl text-center relative overflow-hidden mb-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 text-amber-200">
            <Sparkles className="w-4 h-4" />
            HỆ THỐNG THẢO LUẬN NHÓM TRỰC TUYẾN
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            PHÒNG THẢO LUẬN SỐ – TIN HỌC 10
          </h1>

          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Trường THPT Đinh Tiên Hoàng • Môn Tin học 10
            <br />
            Giáo viên phụ trách: <strong className="text-white">Lê Thị Dung</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left text-xs sm:text-sm mb-6">
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20">
              <span className="font-bold text-cyan-200 block mb-1">Chủ đề 1 (Nhóm 1 – 5):</span>
              <span className="text-white/90">Quyền tác giả đối với áp phích (Tình huống An & Bình)</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20">
              <span className="font-bold text-purple-200 block mb-1">Chủ đề 2 (Nhóm 6 – 10):</span>
              <span className="text-white/90">Bản quyền phần mềm (Phần mềm bẻ khóa / crack)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('group-list-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-7 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Users className="w-5 h-5" />
              THAM GIA THẢO LUẬN
            </button>

            {onOpenQR && (
              <button
                type="button"
                onClick={() => onOpenQR()}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-3 rounded-2xl border border-white/30 shadow-md transition-all text-xs sm:text-sm backdrop-blur-xs"
                title="Hiện mã QR để cả lớp cùng quét"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>MÃ QR PHÒNG</span>
              </button>
            )}
          </div>
        </div>

        {/* Group Selector Section */}
        <div id="group-list-section" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">CHỌN NHÓM CỦA BẠN</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Chọn đúng số thứ tự nhóm được cô Lê Thị Dung phân công (tổng cộng 12 nhóm)
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
              12 Nhóm
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {session.groups.map((group) => {
              const topic = TOPICS[group.topicId];
              const isTopic1 = group.topicId === 'topic_1';
              const isSubmitted = group.status === 'da_gui';
              const isDraft = group.status === 'ban_nhap';

              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelection(group.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between relative group hover:shadow-md hover:-translate-y-1 ${
                    isSubmitted
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : isDraft
                      ? 'border-amber-300 bg-amber-50/40'
                      : isTopic1
                      ? 'border-blue-200 hover:border-blue-400 bg-white'
                      : 'border-purple-200 hover:border-purple-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-700">
                      {group.name}
                    </span>
                    {isSubmitted ? (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã nộp
                      </span>
                    ) : isDraft ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Bản nháp
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Chưa làm
                      </span>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md mb-1.5 ${
                        isTopic1
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {isTopic1 ? 'Chủ đề 1: Áp phích' : 'Chủ đề 2: Bản quyền phần mềm'}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {topic.title}
                    </p>
                  </div>

                  {group.feedback?.isPublished && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Cô Dung đã nhận xét
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Discussion Form for Selected Group
  const topic = TOPICS[currentGroup.topicId];
  const isTopic1 = currentGroup.topicId === 'topic_1';

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            onSelectGroup(null);
            setHasStarted(false);
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Đổi nhóm khác
        </button>

        <div className="flex items-center gap-2">
          {onOpenQR && (
            <button
              type="button"
              onClick={() => onOpenQR(currentGroup.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-all shadow-2xs"
              title="Mở mã QR cho các bạn trong nhóm quét"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mã QR nhóm</span>
            </button>
          )}

          {currentGroup.status === 'da_gui' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã gửi bài {currentGroup.submittedAt && `(${new Date(currentGroup.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`}
            </span>
          ) : currentGroup.status === 'ban_nhap' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              Đang làm bản nháp
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              Chưa gửi bài
            </span>
          )}
        </div>
      </div>

      {/* Main Group Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Môn Tin học 10 • THPT Đinh Tiên Hoàng
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentGroup.name}
            </h2>
          </div>

          <div className="self-start sm:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border ${
                isTopic1
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {isTopic1 ? 'Chủ đề 1: Quyền tác giả đối với áp phích' : 'Chủ đề 2: Bản quyền phần mềm'}
            </span>
          </div>
        </div>

        {/* Members input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Thành viên tham gia thảo luận:
          </label>
          <input
            type="text"
            value={members}
            onChange={(e) => handleMembersChange(e.target.value)}
            placeholder="Nhập họ và tên các bạn trong nhóm (Ví dụ: Nguyễn Văn A, Trần Thị B, Lê Văn C...)"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        {/* TÌNH HUỐNG THẢO LUẬN (Exact content as requested) */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border ${
            isTopic1
              ? 'bg-gradient-to-br from-blue-50 to-cyan-50/50 border-blue-200 text-blue-950'
              : 'bg-gradient-to-br from-purple-50 to-indigo-50/50 border-purple-200 text-purple-950'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-bold text-xs sm:text-sm uppercase tracking-wide">
            <MessageSquareQuote className={`w-4 h-4 ${isTopic1 ? 'text-blue-600' : 'text-purple-600'}`} />
            <span>TÌNH HUỐNG THẢO LUẬN</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed font-medium bg-white/70 p-3.5 rounded-xl border border-white/80 shadow-2xs">
            {currentGroup.scenario}
          </p>
        </div>
      </div>

      {/* Teacher published feedback (if available) */}
      {currentGroup.feedback?.isPublished && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-3xl p-5 mb-6 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base mb-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>NHẬN XÉT CỦA GIÁO VIÊN (CÔ LÊ THỊ DUNG)</span>
          </div>
          {currentGroup.feedback.generalComment && (
            <div className="mb-2">
              <span className="text-xs font-semibold text-amber-800">Nhận xét chung: </span>
              <p className="text-sm text-slate-900 font-medium">{currentGroup.feedback.generalComment}</p>
            </div>
          )}
          {currentGroup.feedback.strengths && (
            <div className="mb-2">
              <span className="text-xs font-semibold text-emerald-800">Điểm mạnh: </span>
              <p className="text-sm text-slate-900">{currentGroup.feedback.strengths}</p>
            </div>
          )}
          {currentGroup.feedback.improvements && (
            <div>
              <span className="text-xs font-semibold text-indigo-800">Cần bổ sung / hướng hoàn thiện: </span>
              <p className="text-sm text-slate-900">{currentGroup.feedback.improvements}</p>
            </div>
          )}
        </div>
      )}

      {/* Save Notification message */}
      {saveMessage && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 4 QUESTIONS LIST */}
      <div className="space-y-6 mb-8">
        {DISCUSSION_QUESTIONS.map((q, idx) => {
          const qKey = q.id as keyof GroupAnswers;
          const currentAnswer = answers[qKey] || '';
          const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-sm shrink-0">
                  {q.number}
                </span>
                <div>
                  <span className="text-xs font-bold text-blue-600 tracking-wider block">
                    {q.title}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>
                </div>
              </div>

              {/* Textarea for this question */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(qKey, e.target.value)}
                  placeholder={`Nhập câu trả lời của nhóm em cho Câu ${q.number}...`}
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white transition-all resize-y min-h-[100px] leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 px-1">
                  <span>
                    {wordCount > 0 ? (
                      <span className="text-emerald-700 font-medium">✓ Đã viết {wordCount} từ</span>
                    ) : (
                      <span className="text-slate-600">Chưa nhập câu trả lời</span>
                    )}
                  </span>
                  <span>{currentAnswer.length} ký tự</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons Row */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{isSavingDraft ? 'Đang lưu...' : 'LƯU BẢN NHÁP'}</span>
          </button>

          <button
            type="button"
            onClick={handleCheckAnswers}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-all active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">KIỂM TRA BÀI</span>
            <span className="sm:hidden">KIỂM TRA</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handlePreSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{currentGroup.status === 'da_gui' ? 'CẬP NHẬT / GỬI LẠI BÀI' : 'GỬI BÀI'}</span>
        </button>
      </div>

      {/* Check Completion Modal */}
      {showCheckModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Kết quả kiểm tra bài làm</h3>
            </div>

            {emptyQuestions.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 mb-4 text-sm">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Tuyệt vời! Nhóm em đã trả lời đủ cả 4 câu hỏi.
                </p>
                <p className="text-xs text-emerald-700">
                  Nhóm em có thể rà soát lại một lượt rồi bấm "GỬI BÀI" để nộp cho cô Lê Thị Dung nhé!
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 mb-4 text-sm">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Còn {emptyQuestions.length} câu hỏi chưa có nội dung:
                </p>
                <ul className="list-disc list-inside text-xs space-y-1 font-medium mt-2">
                  {emptyQuestions.map((qNum) => (
                    <li key={qNum} className="text-amber-800">
                      <strong>Câu hỏi {qNum}:</strong> {DISCUSSION_QUESTIONS[qNum - 1].question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowCheckModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
            >
              Đóng và tiếp tục làm bài
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Xác nhận nộp bài thảo luận</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Nhóm: <strong>{currentGroup.name}</strong> • Chủ đề:{' '}
              <strong>{isTopic1 ? 'Quyền tác giả áp phích' : 'Bản quyền phần mềm'}</strong>
            </p>

            {emptyQuestions.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 mb-4 text-xs text-amber-900">
                <span className="font-bold block mb-1">⚠️ Lưu ý: Các câu sau chưa có nội dung:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {emptyQuestions.map((qNum) => (
                    <li key={qNum}>
                      Câu {qNum}: {DISCUSSION_QUESTIONS[qNum - 1].question}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-amber-800 font-medium">
                  Nhóm em có muốn quay lại bổ sung thêm không?
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all"
              >
                Quay lại chỉnh sửa
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Xác nhận gửi bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              GỬI BÀI THÀNH CÔNG!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Bài thảo luận của <strong>{currentGroup.name}</strong> đã được gửi lên hệ thống của cô Lê Thị Dung.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 mb-6 text-left">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>Thời gian nộp:</span>
                <span className="font-semibold text-slate-900">
                  {new Date().toLocaleTimeString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Trạng thái:</span>
                <span className="font-semibold text-emerald-700">Đã lưu trực tuyến</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              Xem lại bài làm / Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Submit Error & Instant Retry Modal */}
      {submitError && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-center animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
              Chưa thể gửi bài lên máy chủ
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
              Kết nối mạng trên điện thoại bị chập chờn hoặc máy chủ đang khởi động lại. 
              <br />
              <strong className="text-emerald-700">Yên tâm: Bài làm đã được tự động lưu an toàn trong máy bạn, không bị mất chữ nào!</strong>
            </p>

            {submitError && (
              <div className="bg-slate-100 p-2 rounded-xl text-[11px] font-mono text-slate-600 mb-3 text-left border border-slate-200 break-all">
                Chi tiết: {submitError}
              </div>
            )}

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 mb-5 text-left font-medium">
              💡 Hãy kiểm tra lại kết nối Wifi/4G rồi bấm nút <strong>"Thử gửi lại ngay"</strong> bên dưới.
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi lại...' : '🔄 BẤM ĐỂ THỬ GỬI LẠI NGAY'}
              </button>

              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all"
              >
                Đóng để tiếp tục chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
