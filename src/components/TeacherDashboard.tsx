/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Award,
  Filter,
  Download,
  Tv,
  Settings,
  Eye,
  Edit3,
  RefreshCw,
  Search,
  Check,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { DiscussionSession, GroupData, TOPICS } from '../types/discussion';
import { GroupDetailModal } from './GroupDetailModal';
import { FeedbackModal } from './FeedbackModal';
import { TopicConfigModal } from './TopicConfigModal';

interface TeacherDashboardProps {
  session: DiscussionSession;
  onRefresh: () => void;
  onOpenProjector: (groupId?: number) => void;
  onOpenQR: (groupId?: number) => void;
}

type FilterType =
  | 'all'
  | 'topic_1'
  | 'topic_2'
  | 'submitted'
  | 'unsubmitted'
  | 'evaluated'
  | 'unevaluated';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  onRefresh,
  onOpenProjector,
  onOpenQR,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupForView, setSelectedGroupForView] = useState<GroupData | null>(null);
  const [selectedGroupForFeedback, setSelectedGroupForFeedback] = useState<GroupData | null>(null);
  const [showTopicConfigModal, setShowTopicConfigModal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compute stats
  const totalGroups = session.groups.length;
  const submittedCount = session.groups.filter((g) => g.status === 'da_gui').length;
  const unsubmittedCount = totalGroups - submittedCount;
  const evaluatedCount = session.groups.filter((g) => g.feedback?.isEvaluated).length;

  // Filter groups
  const filteredGroups = session.groups.filter((group) => {
    // Topic & status filter
    if (filter === 'topic_1' && group.topicId !== 'topic_1') return false;
    if (filter === 'topic_2' && group.topicId !== 'topic_2') return false;
    if (filter === 'submitted' && group.status !== 'da_gui') return false;
    if (filter === 'unsubmitted' && group.status === 'da_gui') return false;
    if (filter === 'evaluated' && !group.feedback?.isEvaluated) return false;
    if (filter === 'unevaluated' && group.feedback?.isEvaluated) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = group.name.toLowerCase().includes(q);
      const matchMembers = (group.members || '').toLowerCase().includes(q);
      const matchTopic = TOPICS[group.topicId]?.title.toLowerCase().includes(q);
      return matchName || matchMembers || matchTopic;
    }

    return true;
  });

  const handleExportCsv = () => {
    setIsExporting(true);
    window.location.href = '/api/export/csv';
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Bảng quản trị giáo viên
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              PHÒNG THẢO LUẬN SỐ
            </h1>
            <p className="text-sm text-slate-300">
              Giáo viên: <strong className="text-amber-300">Lê Thị Dung</strong> • Trường:{' '}
              <strong className="text-white">THPT Đinh Tiên Hoàng</strong> • Môn học:{' '}
              <strong className="text-white">Tin học 10</strong>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenQR()}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              title="Tạo mã QR cho học sinh quét vào thảo luận"
            >
              <QrCode className="w-4 h-4" />
              Mã QR Vào phòng
            </button>

            <button
              onClick={() => onOpenProjector()}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Tv className="w-4 h-4" />
              Màn chiếu lớp học
            </button>

            <button
              onClick={() => setShowTopicConfigModal(true)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              Cấu hình Nhóm 11 & 12
            </button>

            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất Excel (CSV)
            </button>

            <button
              onClick={onRefresh}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng số nhóm</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalGroups}</span>
            <span className="text-xs text-slate-500 font-medium">nhóm thảo luận</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đã gửi bài</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{submittedCount}</span>
            <span className="text-xs text-slate-500">/ {totalGroups} nhóm</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(submittedCount / totalGroups) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Chưa gửi bài</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{unsubmittedCount}</span>
            <span className="text-xs text-slate-500">nhóm đang làm</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đã nhận xét</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">{evaluatedCount}</span>
            <span className="text-xs text-slate-500">/ {totalGroups} nhóm</span>
          </div>
        </div>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
            <span className="text-slate-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Lọc theo:
            </span>

            {[
              { id: 'all', label: 'Tất cả 12 nhóm' },
              { id: 'topic_1', label: 'Chủ đề 1: Áp phích' },
              { id: 'topic_2', label: 'Chủ đề 2: Phần mềm' },
              { id: 'submitted', label: 'Đã gửi bài' },
              { id: 'unsubmitted', label: 'Chưa gửi bài' },
              { id: 'evaluated', label: 'Đã nhận xét' },
              { id: 'unevaluated', label: 'Chưa nhận xét' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as FilterType)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === f.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nhóm, thành viên..."
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* 12 GROUP CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => {
          const topic = TOPICS[group.topicId];
          const isTopic1 = group.topicId === 'topic_1';
          const isSubmitted = group.status === 'da_gui';
          const isDraft = group.status === 'ban_nhap';

          // Count answered questions
          const answeredCount = [
            group.answers.q1,
            group.answers.q2,
            group.answers.q3,
            group.answers.q4,
          ].filter((a) => a && a.trim()).length;

          return (
            <div
              key={group.id}
              className={`bg-white rounded-2xl border-2 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isSubmitted
                  ? 'border-emerald-200'
                  : isDraft
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header row of card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                      {group.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-base">{group.name}</h3>
                        <button
                          type="button"
                          onClick={() => onOpenQR(group.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title={`Tạo mã QR cho ${group.name}`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {group.id >= 11 && (
                        <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded">
                          Giáo viên cấu hình
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isSubmitted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã gửi bài
                    </span>
                  ) : isDraft ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Bản nháp ({answeredCount}/4)
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Chưa nộp bài
                    </span>
                  )}
                </div>

                {/* Topic badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isTopic1
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {isTopic1 ? 'Chủ đề 1: Áp phích' : 'Chủ đề 2: Bản quyền phần mềm'}
                  </span>
                </div>

                {/* Submission time & Members */}
                <div className="text-xs text-slate-500 space-y-1 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span>Thời gian nộp:</span>
                    <span className="font-medium text-slate-700">
                      {group.submittedAt
                        ? new Date(group.submittedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })
                        : 'Chưa nộp'}
                    </span>
                  </div>

                  {group.members && (
                    <div className="truncate">
                      <span className="text-slate-600">Thành viên: </span>
                      <span className="font-medium text-slate-800">{group.members}</span>
                    </div>
                  )}

                  {/* Feedback summary badge */}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span>Nhận xét GV:</span>
                    {group.feedback?.isEvaluated ? (
                      <span className="font-semibold text-purple-700 inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        {group.feedback.isPublished ? 'Đã công bố' : 'Nội bộ'}
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Chưa nhận xét</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: XEM BÀI, TRÌNH CHIẾU, NHẬN XÉT */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedGroupForView(group)}
                  className="inline-flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>XEM BÀI</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenProjector(group.id)}
                  className="inline-flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition-all active:scale-95"
                >
                  <Tv className="w-3.5 h-3.5 text-purple-600" />
                  <span>CHIẾU</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGroupForFeedback(group)}
                  className="inline-flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>NHẬN XÉT</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-medium text-sm">
            Không tìm thấy nhóm nào phù hợp với bộ lọc đã chọn.
          </p>
        </div>
      )}

      {/* Modal: View Full Submission */}
      {selectedGroupForView && (
        <GroupDetailModal
          group={selectedGroupForView}
          onClose={() => setSelectedGroupForView(null)}
          onOpenFeedback={(g) => setSelectedGroupForFeedback(g)}
          onProjectGroup={(groupId) => onOpenProjector(groupId)}
        />
      )}

      {/* Modal: Feedback Form */}
      {selectedGroupForFeedback && (
        <FeedbackModal
          group={selectedGroupForFeedback}
          onClose={() => setSelectedGroupForFeedback(null)}
          onSuccess={onRefresh}
        />
      )}

      {/* Modal: Topic Configuration for Groups 11 & 12 */}
      {showTopicConfigModal && (
        <TopicConfigModal
          groups={session.groups}
          onClose={() => setShowTopicConfigModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
