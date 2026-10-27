/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Settings,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { GroupData, TOPICS, TopicId } from '../types/discussion';
import { updateGroupTopic } from '../services/api';

interface TopicConfigModalProps {
  groups: GroupData[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TopicConfigModal: React.FC<TopicConfigModalProps> = ({
  groups,
  onClose,
  onSuccess,
}) => {
  const group11 = groups.find((g) => g.id === 11);
  const group12 = groups.find((g) => g.id === 12);

  const [topic11, setTopic11] = useState<TopicId>(group11?.topicId || 'topic_1');
  const [topic12, setTopic12] = useState<TopicId>(group12?.topicId || 'topic_2');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (group11 && topic11 !== group11.topicId) {
        await updateGroupTopic(11, topic11);
      }
      if (group12 && topic12 !== group12.topicId) {
        await updateGroupTopic(12, topic12);
      }
      setIsSaving(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      alert('Không thể cập nhật cấu hình: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Phân công chủ đề Nhóm 11 & Nhóm 12
              </h3>
              <p className="text-xs text-slate-500">
                Dành cho giáo viên Lê Thị Dung cấu hình chủ đề thảo luận
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 mb-5 text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Quy định phân chia 12 nhóm:
          </div>
          <p>• <strong>Nhóm 1 – 5:</strong> Cố định Chủ đề 1 (Quyền tác giả áp phích)</p>
          <p>• <strong>Nhóm 6 – 10:</strong> Cố định Chủ đề 2 (Bản quyền phần mềm)</p>
          <p>• <strong>Nhóm 11 & 12:</strong> Giáo viên linh hoạt chọn 1 trong 2 chủ đề dưới đây.</p>
        </div>

        {/* Group 11 Config */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Chủ đề cho NHÓM 11:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTopic11('topic_1')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                topic11 === 'topic_1'
                  ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-xs block text-blue-700 font-semibold mb-0.5">Chủ đề 1</span>
              <span className="text-xs sm:text-sm">Quyền tác giả áp phích</span>
            </button>

            <button
              type="button"
              onClick={() => setTopic11('topic_2')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                topic11 === 'topic_2'
                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-xs block text-purple-700 font-semibold mb-0.5">Chủ đề 2</span>
              <span className="text-xs sm:text-sm">Bản quyền phần mềm</span>
            </button>
          </div>
        </div>

        {/* Group 12 Config */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Chủ đề cho NHÓM 12:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTopic12('topic_1')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                topic12 === 'topic_1'
                  ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-xs block text-blue-700 font-semibold mb-0.5">Chủ đề 1</span>
              <span className="text-xs sm:text-sm">Quyền tác giả áp phích</span>
            </button>

            <button
              type="button"
              onClick={() => setTopic12('topic_2')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                topic12 === 'topic_2'
                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-xs block text-purple-700 font-semibold mb-0.5">Chủ đề 2</span>
              <span className="text-xs sm:text-sm">Bản quyền phần mềm</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu cấu hình chủ đề'}
          </button>
        </div>
      </div>
    </div>
  );
};
