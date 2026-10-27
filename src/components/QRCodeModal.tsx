/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  Share2,
  Tv,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';
import { DiscussionSession, TOPICS } from '../types/discussion';

interface QRCodeModalProps {
  session: DiscussionSession;
  initialGroupId?: number | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  session,
  initialGroupId = null,
  onClose,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>(
    initialGroupId || 'all'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isBigDisplay, setIsBigDisplay] = useState<boolean>(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Compute join URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const joinUrl =
    selectedGroup === 'all'
      ? `${baseUrl}?view=student`
      : `${baseUrl}?view=student&group=${selectedGroup}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = joinUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);

        // Add label text at bottom
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        const label =
          selectedGroup === 'all'
            ? 'PHÒNG THẢO LUẬN SỐ - TIN HỌC 10'
            : `PHÒNG THẢO LUẬN - NHÓM ${selectedGroup}`;
        ctx.fillText(label, 500, 940);

        const a = document.createElement('a');
        a.download = `QR_Thao_luan_${selectedGroup === 'all' ? 'Chung' : `Nhom_${selectedGroup}`}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBigDisplay) {
          setIsBigDisplay(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBigDisplay, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className={`bg-white rounded-3xl w-full shadow-2xl animate-scale-up transition-all ${
          isBigDisplay ? 'max-w-4xl p-6 sm:p-10' : 'max-w-xl p-5 sm:p-7'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                MÃ QR THAM GIA THẢO LUẬN
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Môn Tin học 10 • THPT Đinh Tiên Hoàng • GV: Lê Thị Dung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBigDisplay(!isBigDisplay)}
              className={`p-2 rounded-xl border transition-all ${
                isBigDisplay
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={isBigDisplay ? 'Thu nhỏ cửa sổ' : 'Phóng to cho máy chiếu'}
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Group Selector Pills */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Tùy chọn tạo mã QR:
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGroup === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Trang chung (Học sinh tự chọn nhóm)
            </button>

            <div className="flex items-center gap-1 flex-wrap">
              {session.groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroup(g.id)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    selectedGroup === g.id
                      ? 'bg-blue-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`Vào thẳng ${g.name}`}
                >
                  {g.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main QR Code Container */}
        <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 p-6 sm:p-8 rounded-3xl border border-blue-100 flex flex-col items-center justify-center text-center mb-5">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              {selectedGroup === 'all'
                ? 'Quét mã để vào phòng và chọn nhóm'
                : `Quét mã để vào thẳng Nhóm ${selectedGroup} (${
                    TOPICS[session.groups.find((g) => g.id === selectedGroup)?.topicId || 'topic_1'].title
                  })`}
            </span>
          </div>

          {/* QR Code SVG Element */}
          <div
            ref={qrRef}
            className={`bg-white p-4 sm:p-6 rounded-3xl shadow-xl border-4 border-white transition-all ${
              isBigDisplay ? 'scale-110 sm:scale-125 my-6' : ''
            }`}
          >
            <QRCodeSVG
              value={joinUrl}
              size={isBigDisplay ? 320 : 220}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
                x: undefined,
                y: undefined,
                height: 34,
                width: 34,
                excavate: true,
              }}
            />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-4 max-w-md">
            Học sinh mở ứng dụng <strong>Camera</strong> trên điện thoại hoặc chức năng{' '}
            <strong>Quét mã QR của Zalo</strong> để tham gia ngay.
          </p>

          {/* Quick link display */}
          <div className="mt-3 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-200 max-w-full text-slate-600 text-xs">
            <span className="truncate max-w-[280px] sm:max-w-md font-mono text-[11px]">
              {joinUrl}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Đã sao chép link!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Sao chép đường link</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Tải ảnh mã QR</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
