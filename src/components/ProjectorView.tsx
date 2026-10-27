/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageSquareQuote,
  ZoomIn,
  ZoomOut,
  Users,
  Award,
} from 'lucide-react';
import {
  DiscussionSession,
  GroupData,
  TOPICS,
  DISCUSSION_QUESTIONS,
  GroupAnswers,
} from '../types/discussion';

interface ProjectorViewProps {
  session: DiscussionSession;
  initialGroupId?: number;
  onExit: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({
  session,
  initialGroupId = 1,
  onExit,
}) => {
  const [currentGroupId, setCurrentGroupId] = useState<number>(initialGroupId);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0: Normal, 1: Large, 2: Extra Large
  const [viewMode, setViewMode] = useState<'single' | 'summary'>('single');

  const currentGroup =
    session.groups.find((g) => g.id === currentGroupId) || session.groups[0];

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousGroup();
      } else if (e.key === 'ArrowRight') {
        goToNextGroup();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGroupId]);

  const goToPreviousGroup = () => {
    setCurrentGroupId((prev) => (prev > 1 ? prev - 1 : 12));
  };

  const goToNextGroup = () => {
    setCurrentGroupId((prev) => (prev < 12 ? prev + 1 : 1));
  };

  const topic = TOPICS[currentGroup.topicId];
  const isTopic1 = currentGroup.topicId === 'topic_1';

  // Font size classes
  const fontSizes = {
    scenario: fontSizeLevel === 2 ? 'text-xl' : fontSizeLevel === 1 ? 'text-lg' : 'text-base',
    question: fontSizeLevel === 2 ? 'text-lg' : fontSizeLevel === 1 ? 'text-base' : 'text-sm',
    answer: fontSizeLevel === 2 ? 'text-xl' : fontSizeLevel === 1 ? 'text-lg' : 'text-base',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Projector Control Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm px-3 py-1 rounded-lg">
            MÁY CHIẾU LỚP HỌC
          </span>
          <span className="text-xs sm:text-sm text-slate-300 hidden md:inline">
            Tin học 10 • THPT Đinh Tiên Hoàng • GV: Lê Thị Dung
          </span>
        </div>

        {/* Mode & Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Group Selector Dropdown */}
          <select
            value={currentGroupId}
            onChange={(e) => {
              setCurrentGroupId(Number(e.target.value));
              setViewMode('single');
            }}
            className="bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {session.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} {g.status === 'da_gui' ? '✓ (Đã nộp)' : '(Chưa nộp)'}
              </option>
            ))}
          </select>

          {/* Toggle Summary / Single */}
          <button
            onClick={() => setViewMode(viewMode === 'single' ? 'summary' : 'single')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'summary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Chế độ tổng hợp 12 nhóm"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Tổng hợp 12 nhóm</span>
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => setFontSizeLevel((prev) => Math.max(0, prev - 1))}
              disabled={fontSizeLevel === 0}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg transition-all"
              title="Giảm cỡ chữ (A-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-slate-400 px-1.5">
              {fontSizeLevel === 0 ? 'A' : fontSizeLevel === 1 ? 'A+' : 'A++'}
            </span>
            <button
              onClick={() => setFontSizeLevel((prev) => Math.min(2, prev + 1))}
              disabled={fontSizeLevel === 2}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg transition-all"
              title="Tăng cỡ chữ (A+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="p-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-xl transition-all ml-1"
            title="Thoát trình chiếu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-between">
        {viewMode === 'summary' ? (
          /* SUMMARY OVERVIEW FOR 12 GROUPS */
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                BẢNG TIẾN ĐỘ THẢO LUẬN 12 NHÓM
              </h2>
              <p className="text-sm text-slate-400">
                Môn Tin học 10 • THPT Đinh Tiên Hoàng • Giáo viên Lê Thị Dung
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {session.groups.map((group) => {
                const isGroupTopic1 = group.topicId === 'topic_1';
                const isSubmitted = group.status === 'da_gui';
                const isDraft = group.status === 'ban_nhap';

                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      setCurrentGroupId(group.id);
                      setViewMode('single');
                    }}
                    className={`text-left p-5 rounded-2xl border-2 transition-all hover:scale-102 flex flex-col justify-between ${
                      isSubmitted
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                        : isDraft
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black text-white">{group.name}</span>
                        {isSubmitted ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-700/50">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã nộp
                          </span>
                        ) : isDraft ? (
                          <span className="text-xs font-bold text-amber-400 bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-700/50">
                            Bản nháp
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                            Chưa làm
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mb-2 ${
                          isGroupTopic1
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                            : 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                        }`}
                      >
                        {isGroupTopic1 ? 'Chủ đề 1: Áp phích' : 'Chủ đề 2: Bản quyền phần mềm'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      {group.submittedAt ? (
                        <span>
                          Nộp lúc:{' '}
                          {new Date(group.submittedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span>Bấm để xem chi tiết</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* SINGLE GROUP PRESENTATION MODE */
          <div className="space-y-6 animate-fade-in flex-1">
            {/* Massive Group Title & Topic Badge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  BÁO CÁO KẾT QUẢ THẢO LUẬN NHÓM
                </span>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                  {currentGroup.name}
                </h1>
                {currentGroup.members && (
                  <p className="text-sm sm:text-base text-slate-300 font-medium mt-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Thành viên: {currentGroup.members}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <span
                  className={`px-4 py-2 rounded-2xl text-sm sm:text-base font-black border tracking-wide ${
                    isTopic1
                      ? 'bg-blue-900/40 text-blue-300 border-blue-600/60'
                      : 'bg-purple-900/40 text-purple-300 border-purple-600/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline-block mr-2" />
                  {topic.title}
                </span>

                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  {currentGroup.status === 'da_gui' ? (
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-700/50">
                      <CheckCircle2 className="w-4 h-4" />
                      ĐÃ GỬI BÀI{' '}
                      {currentGroup.submittedAt &&
                        `(${new Date(currentGroup.submittedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })})`}
                    </span>
                  ) : (
                    <span className="text-amber-400 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-700/50 font-bold">
                      <Clock className="w-4 h-4 inline-block mr-1.5" />
                      {currentGroup.status === 'ban_nhap' ? 'BẢN NHÁP' : 'CHƯA GỬI BÀI'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Scenario Display (High contrast, clean border) */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border-2 ${
                isTopic1
                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-100'
                  : 'bg-purple-950/40 border-purple-500/50 text-purple-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-300">
                <MessageSquareQuote className="w-5 h-5 text-amber-400" />
                <span>TÌNH HUỐNG THẢO LUẬN:</span>
              </div>
              <p
                className={`${fontSizes.scenario} font-medium leading-relaxed bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 text-white shadow-inner`}
              >
                {currentGroup.scenario}
              </p>
            </div>

            {/* 4 QUESTIONS & ACTUAL ANSWERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {DISCUSSION_QUESTIONS.map((q) => {
                const qKey = q.id as keyof GroupAnswers;
                const answer = currentGroup.answers[qKey]?.trim();

                return (
                  <div
                    key={q.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                          {q.number}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                            {q.title}
                          </span>
                          <h4 className={`${fontSizes.question} font-bold text-slate-100 leading-snug`}>
                            {q.question}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        {answer ? (
                          <div
                            className={`${fontSizes.answer} text-white font-medium whitespace-pre-wrap leading-relaxed bg-black/40 p-4 rounded-2xl border border-slate-700/80 shadow-inner`}
                          >
                            {answer}
                          </div>
                        ) : (
                          <div className="text-sm italic text-slate-400 bg-slate-950/60 p-4 rounded-2xl border border-dashed border-slate-800 text-center">
                            Nhóm chưa nhập câu trả lời cho câu hỏi này.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Teacher Feedback Note if published */}
            {currentGroup.feedback?.isPublished && (
              <div className="bg-amber-950/50 border-2 border-amber-500/60 rounded-3xl p-5 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
                  <Award className="w-5 h-5" />
                  <span>NHẬN XÉT CỦA GIÁO VIÊN (CÔ LÊ THỊ DUNG)</span>
                </div>
                {currentGroup.feedback.generalComment && (
                  <p className="text-sm sm:text-base text-white mb-2">
                    <strong className="text-amber-200">Nhận xét:</strong>{' '}
                    {currentGroup.feedback.generalComment}
                  </p>
                )}
                {currentGroup.feedback.strengths && (
                  <p className="text-sm sm:text-base text-emerald-300 mb-1">
                    <strong>Điểm mạnh:</strong> {currentGroup.feedback.strengths}
                  </p>
                )}
                {currentGroup.feedback.improvements && (
                  <p className="text-sm sm:text-base text-cyan-300">
                    <strong>Cần bổ sung / hướng hoàn thiện:</strong>{' '}
                    {currentGroup.feedback.improvements}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation Toolbar */}
      <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-6 py-4 sticky bottom-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={goToPreviousGroup}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all active:scale-95 border border-slate-700 shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-blue-400" />
            <span>NHÓM TRƯỚC</span>
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-md hidden sm:flex">
            {session.groups.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setCurrentGroupId(g.id);
                  setViewMode('single');
                }}
                className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                  currentGroupId === g.id && viewMode === 'single'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-110 shadow-md'
                    : g.status === 'da_gui'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {g.id}
              </button>
            ))}
          </div>

          <button
            onClick={goToNextGroup}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-blue-900/40"
          >
            <span>NHÓM TIẾP THEO</span>
            <ChevronRight className="w-5 h-5 text-blue-200" />
          </button>
        </div>
      </footer>
    </div>
  );
};
