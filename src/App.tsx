/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DiscussionSession,
  TOPICS,
  GroupData,
} from './types/discussion';
import { fetchSession, subscribeToSessionUpdates } from './services/api';
import { Header } from './components/Header';
import { StudentView } from './components/StudentView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ProjectorView } from './components/ProjectorView';
import { QRCodeModal } from './components/QRCodeModal';
import { Users, BookOpen, ShieldCheck, RefreshCw } from 'lucide-react';

const INITIAL_FALLBACK_SESSION: DiscussionSession = {
  sessionId: 'TIN10-DTH-2026',
  sessionTitle: 'PHÒNG THẢO LUẬN SỐ – TIN HỌC 10',
  teacherName: 'Lê Thị Dung',
  schoolName: 'THPT Đinh Tiên Hoàng',
  subjectName: 'Tin học 10',
  targetGrade: 'Lớp 10',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  groups: Array.from({ length: 12 }, (_, i) => {
    const groupId = i + 1;
    const topicId = groupId >= 6 && groupId <= 10 ? 'topic_2' : 'topic_1';
    return {
      id: groupId,
      name: `Nhóm ${groupId}`,
      topicId,
      scenario: TOPICS[topicId].scenario,
      members: '',
      answers: { q1: '', q2: '', q3: '', q4: '' },
      status: 'chua_lam',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: null,
      feedback: {
        generalComment: '',
        strengths: '',
        improvements: '',
        isEvaluated: false,
        isPublished: false,
        evaluatedAt: null,
      },
    };
  }),
};

export default function App() {
  const [session, setSession] = useState<DiscussionSession>(INITIAL_FALLBACK_SESSION);
  const [currentView, setCurrentView] = useState<'student' | 'teacher' | 'projector'>('student');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [projectorGroupId, setProjectorGroupId] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrTargetGroupId, setQrTargetGroupId] = useState<number | null>(null);

  // Load session from server
  const loadData = useCallback(async () => {
    try {
      const data = await fetchSession();
      setSession(data);
      setIsConnected(true);
    } catch (err) {
      console.error('Error fetching session:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Parse URL search parameters on first load (e.g., student scanned QR for a specific group)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      const g = params.get('group');

      if (v === 'student' || v === 'teacher' || v === 'projector') {
        setCurrentView(v);
      }
      if (g) {
        const parsedG = parseInt(g, 10);
        if (!isNaN(parsedG) && parsedG >= 1 && parsedG <= 12) {
          setSelectedGroupId(parsedG);
          setCurrentView('student');
        }
      }
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to SSE stream for live real-time sync across devices
    const unsubscribe = subscribeToSessionUpdates(
      (updatedSession) => {
        setSession(updatedSession);
        setIsConnected(true);
      },
      (err) => {
        console.warn('Real-time sync notice:', err);
        setIsConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleOpenProjector = (groupId?: number) => {
    if (groupId) {
      setProjectorGroupId(groupId);
    }
    setCurrentView('projector');
  };

  const handleOpenQR = (groupId?: number) => {
    setQrTargetGroupId(groupId || null);
    setShowQRModal(true);
  };

  // If in Projector mode, render ProjectorView full screen
  if (currentView === 'projector') {
    return (
      <>
        <ProjectorView
          session={session}
          initialGroupId={projectorGroupId}
          onExit={() => setCurrentView('teacher')}
          onOpenQR={handleOpenQR}
        />
        {showQRModal && (
          <QRCodeModal
            session={session}
            initialGroupId={qrTargetGroupId}
            onClose={() => setShowQRModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* App Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        isConnected={isConnected}
        selectedGroupId={selectedGroupId}
        onOpenQR={handleOpenQR}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'student' ? (
          <StudentView
            session={session}
            selectedGroupId={selectedGroupId}
            onSelectGroup={(id) => setSelectedGroupId(id)}
            onRefresh={loadData}
            onOpenQR={handleOpenQR}
          />
        ) : (
          <TeacherDashboard
            session={session}
            onRefresh={loadData}
            onOpenProjector={handleOpenProjector}
            onOpenQR={handleOpenQR}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-1.5">
          <p className="font-semibold text-slate-700">
            PHÒNG THẢO LUẬN SỐ – MÔN TIN HỌC 10
          </p>
          <p>
            Giáo viên phụ trách: <strong>Lê Thị Dung</strong> • Trường THPT Đinh Tiên Hoàng
          </p>
          <p className="text-[11px] text-slate-600">
            Hỗ trợ quét mã QR vào nhóm nhanh, đồng bộ thời gian thực giữa điện thoại thông minh và máy chiếu lớp học.
          </p>
        </div>
      </footer>

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          session={session}
          initialGroupId={qrTargetGroupId}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}
