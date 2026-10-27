/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { GroupData } from '../types/discussion';
import { saveTeacherFeedback } from '../services/api';

interface FeedbackModalProps {
  group: GroupData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  group,
  onClose,
  onSuccess,
}) => {
  if (!group) return null;

  const [generalComment, setGeneralComment] = useState(
    group.feedback?.generalComment || ''
  );
  const [strengths, setStrengths] = useState(group.feedback?.strengths || '');
  const [improvements, setImprovements] = useState(
    group.feedback?.improvements || ''
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    Boolean(group.feedback?.isPublished)
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTeacherFeedback(group.id, {
        generalComment,
        strengths,
        improvements,
        isPublished,
      });
      setIsSaving(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      alert('Không thể lưu nhận xét: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Nhận xét bài làm – {group.name}
              </h3>
              <p className="text-xs text-slate-500">
                Giáo viên: Lê Thị Dung • Môn Tin học 10
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              1. Nhận xét chung về bài làm của nhóm:
            </label>
            <textarea
              rows={3}
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              placeholder="Ví dụ: Nhóm phân tích rất rõ tình huống, các thành viên hợp tác tốt..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              2. Điểm mạnh / Ưu điểm nổi bật:
            </label>
            <textarea
              rows={2}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Ví dụ: Nêu đúng căn cứ hành vi sao chép tác phẩm khi chưa xin phép..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-800 mb-1">
              3. Nội dung cần bổ sung / Hướng hoàn thiện:
            </label>
            <textarea
              rows={2}
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Ví dụ: Cần phân tích sâu hơn hậu quả đối với tác quyền nhân thân và tác quyền tài sản..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          {/* Publish Toggle */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isPublished ? (
                <Eye className="w-5 h-5 text-emerald-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-600" />
              )}
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  Công bố nhận xét cho học sinh
                </span>
                <span className="text-[11px] text-slate-500">
                  {isPublished
                    ? 'Học sinh thuộc nhóm này có thể xem nhận xét trên điện thoại'
                    : 'Chỉ lưu nội bộ cho giáo viên, học sinh chưa nhìn thấy'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu nhận xét'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
