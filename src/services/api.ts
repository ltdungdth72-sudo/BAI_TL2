/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiscussionSession, GroupAnswers, GroupData, TopicId } from '../types/discussion';

const API_BASE = '/api';

export async function fetchSession(): Promise<DiscussionSession> {
  const res = await fetch(`${API_BASE}/session`);
  if (!res.ok) {
    throw new Error('Không thể tải dữ liệu buổi học');
  }
  return res.json();
}

export async function fetchGroup(groupId: number): Promise<GroupData> {
  const res = await fetch(`${API_BASE}/groups/${groupId}`);
  if (!res.ok) {
    throw new Error(`Không thể tải dữ liệu nhóm ${groupId}`);
  }
  return res.json();
}

export async function saveGroupAnswers(
  groupId: number,
  answers: GroupAnswers,
  members: string,
  isDraft: boolean
): Promise<{ success: boolean; group: GroupData }> {
  const url = `${API_BASE}/groups/${groupId}/save`;
  const payload = JSON.stringify({ answers, members, isDraft });

  // Robust submission with 3 attempts and 12s timeout
  let lastError: any = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Máy chủ phản hồi mã ${res.status}: ${text.slice(0, 100)}`);
      }

      return await res.json();
    } catch (err: any) {
      lastError = err;
      if (attempt < 3) {
        // Wait before retrying (400ms, 800ms)
        await new Promise((r) => setTimeout(r, attempt * 400));
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến máy chủ');
}

export async function updateGroupTopic(
  groupId: number,
  topicId: TopicId
): Promise<{ success: boolean; group: GroupData }> {
  const res = await fetch(`${API_BASE}/groups/${groupId}/topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  });
  if (!res.ok) {
    throw new Error('Lỗi khi cập nhật chủ đề nhóm');
  }
  return res.json();
}

export async function saveTeacherFeedback(
  groupId: number,
  feedback: {
    generalComment: string;
    strengths: string;
    improvements: string;
    isPublished: boolean;
  }
): Promise<{ success: boolean; group: GroupData }> {
  const res = await fetch(`${API_BASE}/groups/${groupId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  if (!res.ok) {
    throw new Error('Lỗi khi lưu nhận xét giáo viên');
  }
  return res.json();
}

export async function resetGroupData(groupId: number): Promise<{ success: boolean; group: GroupData }> {
  const res = await fetch(`${API_BASE}/groups/${groupId}/reset`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Lỗi khi đặt lại dữ liệu nhóm');
  }
  return res.json();
}

export function subscribeToSessionUpdates(
  onUpdate: (session: DiscussionSession) => void,
  onError?: (err: any) => void
): () => void {
  let eventSource: EventSource | null = null;
  let pollingInterval: any = null;
  let isClosed = false;

  // 1. Guaranteed active polling every 2.5 seconds (ensures updates arrive even if SSE is buffered)
  pollingInterval = setInterval(async () => {
    if (isClosed) return;
    try {
      const data = await fetchSession();
      onUpdate(data);
    } catch (pollErr) {
      if (onError) onError(pollErr);
    }
  }, 2500);

  // 2. Immediate push via SSE for instant updates
  try {
    eventSource = new EventSource(`${API_BASE}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.data) {
          onUpdate(payload.data);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    eventSource.onerror = (err) => {
      // Polling continues in background seamlessly
      console.warn('SSE stream disconnected, polling actively every 2.5s:', err);
    };
  } catch (e) {
    console.warn('SSE unsupported, relying on active polling:', e);
  }

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
}

// LocalStorage backup utilities to prevent any accidental input loss on mobile
export function saveLocalDraft(groupId: number, answers: GroupAnswers, members: string) {
  try {
    localStorage.setItem(
      `tin10_group_${groupId}_draft`,
      JSON.stringify({ answers, members, timestamp: Date.now() })
    );
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

export function getLocalDraft(groupId: number): { answers: GroupAnswers; members: string } | null {
  try {
    const raw = localStorage.getItem(`tin10_group_${groupId}_draft`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { answers: parsed.answers, members: parsed.members || '' };
    }
  } catch (e) {
    console.error('LocalStorage read error:', e);
  }
  return null;
}
