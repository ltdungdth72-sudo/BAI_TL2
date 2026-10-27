/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  LayoutDashboard,
  Tv,
  Wifi,
  Sparkles,
  QrCode,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'student' | 'teacher' | 'projector';
  onViewChange: (view: 'student' | 'teacher' | 'projector') => void;
  isConnected: boolean;
  selectedGroupId: number | null;
  onOpenQR: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  isConnected,
  selectedGroupId,
  onOpenQR,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Teacher and School info */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-semibold">
              Môn Tin học 10
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Trường THPT Đinh Tiên Hoàng</span>
            <span className="hidden sm:inline">•</span>
            <span>GV: <strong className="text-amber-200 font-semibold">Lê Thị Dung</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="text-white/90">
                {isConnected ? 'Đồng bộ trực tuyến' : 'Đang kết nối lại...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onViewChange('student')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
              PHÒNG THẢO LUẬN SỐ
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Chủ đề Quyền tác giả & Bản quyền phần mềm • 12 Nhóm
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onViewChange('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'student'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Học sinh</span>
            {selectedGroupId && currentView === 'student' && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded text-[10px] font-bold">
                N{selectedGroupId}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'teacher'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Giáo viên</span>
          </button>

          <button
            onClick={() => onViewChange('projector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'projector'
                ? 'bg-purple-700 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Trình chiếu</span>
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          <button
            onClick={onOpenQR}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all shadow-2xs"
            title="Mở mã QR cho học sinh quét vào thảo luận"
          >
            <QrCode className="w-4 h-4" />
            <span>Mã QR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
