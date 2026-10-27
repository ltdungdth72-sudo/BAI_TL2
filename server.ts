/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  DiscussionSession,
  GroupData,
  TOPICS,
  TopicId,
} from './src/types/discussion.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'session_data.json');

const DEFAULT_SESSION: DiscussionSession = {
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
    let topicId: TopicId = 'topic_1';
    if (groupId >= 6 && groupId <= 10) {
      topicId = 'topic_2';
    } else if (groupId === 11) {
      topicId = 'topic_1'; // Cấu hình mặc định cho Nhóm 11
    } else if (groupId === 12) {
      topicId = 'topic_2'; // Cấu hình mặc định cho Nhóm 12
    }

    return {
      id: groupId,
      name: `Nhóm ${groupId}`,
      topicId,
      scenario: TOPICS[topicId].scenario,
      members: '',
      answers: {
        q1: '',
        q2: '',
        q3: '',
        q4: '',
      },
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

function ensureDataFile(): DiscussionSession {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SESSION, null, 2), 'utf-8');
    return DEFAULT_SESSION;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed: DiscussionSession = JSON.parse(raw);
    
    // Ensure all 12 groups are present and updated with current topics & scenarios
    let needsSave = false;
    if (!parsed.groups || parsed.groups.length < 12) {
      parsed.groups = DEFAULT_SESSION.groups;
      needsSave = true;
    } else {
      parsed.groups = parsed.groups.map((group) => {
        // Enforce topics for group 1-5 and 6-10
        let targetTopicId: TopicId = group.topicId;
        if (group.id >= 1 && group.id <= 5) {
          targetTopicId = 'topic_1';
        } else if (group.id >= 6 && group.id <= 10) {
          targetTopicId = 'topic_2';
        } else if (targetTopicId !== 'topic_1' && targetTopicId !== 'topic_2') {
          targetTopicId = group.id === 11 ? 'topic_1' : 'topic_2';
        }

        const freshScenario = TOPICS[targetTopicId].scenario;
        if (group.topicId !== targetTopicId || group.scenario !== freshScenario) {
          needsSave = true;
          return {
            ...group,
            topicId: targetTopicId,
            scenario: freshScenario,
          };
        }
        return group;
      });
    }

    if (needsSave) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (e) {
    console.error('Error reading data file, resetting to default:', e);
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SESSION, null, 2), 'utf-8');
    return DEFAULT_SESSION;
  }
}

function saveData(data: DiscussionSession) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  broadcastUpdate(data);
}

// SSE clients management
type ClientResponse = Response;
const sseClients: Set<ClientResponse> = new Set();

function broadcastUpdate(data: DiscussionSession) {
  const payload = `data: ${JSON.stringify({ type: 'UPDATE', data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // CORS support for mobile devices and webviews
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Initialize data store
  let sessionData = ensureDataFile();

  // SSE Stream for real-time updates
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial data
    res.write(`data: ${JSON.stringify({ type: 'INIT', data: sessionData })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Get session info
  app.get('/api/session', (_req: Request, res: Response) => {
    sessionData = ensureDataFile();
    res.json(sessionData);
  });

  // Get group data
  app.get('/api/groups/:id', (req: Request, res: Response) => {
    sessionData = ensureDataFile();
    const id = parseInt(req.params.id, 10);
    const group = sessionData.groups.find((g) => g.id === id);
    if (!group) {
      res.status(404).json({ error: 'Nhóm không tồn tại' });
      return;
    }
    res.json(group);
  });

  // Save draft or submit answers
  app.post('/api/groups/:id/save', (req: Request, res: Response) => {
    sessionData = ensureDataFile();
    const id = parseInt(req.params.id, 10);
    const groupIndex = sessionData.groups.findIndex((g) => g.id === id);

    if (groupIndex === -1) {
      res.status(404).json({ error: 'Nhóm không tồn tại' });
      return;
    }

    const { answers, members, isDraft } = req.body;
    const now = new Date().toISOString();
    const currentGroup = sessionData.groups[groupIndex];

    const updatedGroup: GroupData = {
      ...currentGroup,
      members: members !== undefined ? String(members).trim() : currentGroup.members,
      answers: {
        q1: answers?.q1 !== undefined ? String(answers.q1) : currentGroup.answers.q1,
        q2: answers?.q2 !== undefined ? String(answers.q2) : currentGroup.answers.q2,
        q3: answers?.q3 !== undefined ? String(answers.q3) : currentGroup.answers.q3,
        q4: answers?.q4 !== undefined ? String(answers.q4) : currentGroup.answers.q4,
      },
      updatedAt: now,
      status: isDraft ? 'ban_nhap' : 'da_gui',
      submittedAt: isDraft ? currentGroup.submittedAt : now,
    };

    sessionData.groups[groupIndex] = updatedGroup;
    saveData(sessionData);

    res.json({ success: true, group: updatedGroup });
  });

  // Teacher configures topic for Group 11 or 12
  app.post('/api/groups/:id/topic', (req: Request, res: Response) => {
    sessionData = ensureDataFile();
    const id = parseInt(req.params.id, 10);
    if (id !== 11 && id !== 12) {
      res.status(400).json({ error: 'Chỉ Nhóm 11 và Nhóm 12 được phép thay đổi chủ đề theo cấu hình giáo viên' });
      return;
    }

    const groupIndex = sessionData.groups.findIndex((g) => g.id === id);
    if (groupIndex === -1) {
      res.status(404).json({ error: 'Nhóm không tồn tại' });
      return;
    }

    const { topicId } = req.body as { topicId: TopicId };
    if (topicId !== 'topic_1' && topicId !== 'topic_2') {
      res.status(400).json({ error: 'Chủ đề không hợp lệ' });
      return;
    }

    sessionData.groups[groupIndex].topicId = topicId;
    sessionData.groups[groupIndex].scenario = TOPICS[topicId].scenario;
    sessionData.groups[groupIndex].updatedAt = new Date().toISOString();

    saveData(sessionData);
    res.json({ success: true, group: sessionData.groups[groupIndex] });
  });

  // Teacher provides feedback
  app.post('/api/groups/:id/feedback', (req: Request, res: Response) => {
    sessionData = ensureDataFile();
    const id = parseInt(req.params.id, 10);
    const groupIndex = sessionData.groups.findIndex((g) => g.id === id);

    if (groupIndex === -1) {
      res.status(404).json({ error: 'Nhóm không tồn tại' });
      return;
    }

    const { generalComment, strengths, improvements, isPublished } = req.body;
    const now = new Date().toISOString();

    sessionData.groups[groupIndex].feedback = {
      generalComment: generalComment !== undefined ? String(generalComment) : '',
      strengths: strengths !== undefined ? String(strengths) : '',
      improvements: improvements !== undefined ? String(improvements) : '',
      isEvaluated: true,
      isPublished: Boolean(isPublished),
      evaluatedAt: now,
    };

    saveData(sessionData);
    res.json({ success: true, group: sessionData.groups[groupIndex] });
  });

  // Reset a group's answers
  app.post('/api/groups/:id/reset', (req: Request, res: Response) => {
    sessionData = ensureDataFile();
    const id = parseInt(req.params.id, 10);
    const groupIndex = sessionData.groups.findIndex((g) => g.id === id);

    if (groupIndex === -1) {
      res.status(404).json({ error: 'Nhóm không tồn tại' });
      return;
    }

    sessionData.groups[groupIndex].answers = { q1: '', q2: '', q3: '', q4: '' };
    sessionData.groups[groupIndex].status = 'chua_lam';
    sessionData.groups[groupIndex].submittedAt = null;
    sessionData.groups[groupIndex].members = '';
    sessionData.groups[groupIndex].feedback = {
      generalComment: '',
      strengths: '',
      improvements: '',
      isEvaluated: false,
      isPublished: false,
      evaluatedAt: null,
    };

    saveData(sessionData);
    res.json({ success: true, group: sessionData.groups[groupIndex] });
  });

  // Export CSV (Excel compatible with UTF-8 BOM)
  app.get('/api/export/csv', (_req: Request, res: Response) => {
    sessionData = ensureDataFile();
    
    // Headers as specified in requirements:
    // Tên buổi học, Tên nhóm, Chủ đề, Tình huống, Câu trả lời câu 1, Câu trả lời câu 2, Câu trả lời câu 3, Câu trả lời câu 4, Thời gian gửi bài, Trạng thái bài làm, Trạng thái nhận xét, Nhận xét của giáo viên
    const headers = [
      'Tên buổi học',
      'Tên nhóm',
      'Thành viên',
      'Chủ đề',
      'Tình huống',
      'Câu trả lời câu 1',
      'Câu trả lời câu 2',
      'Câu trả lời câu 3',
      'Câu trả lời câu 4',
      'Thời gian gửi bài',
      'Trạng thái bài làm',
      'Trạng thái nhận xét',
      'Nhận xét chung của giáo viên',
      'Điểm mạnh',
      'Nội dung cần bổ sung / hướng hoàn thiện',
    ];

    const escapeCsv = (val: string | null | undefined) => {
      if (!val) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sessionData.groups.map((g) => {
      const topicName = TOPICS[g.topicId]?.title || g.topicId;
      const statusText =
        g.status === 'da_gui'
          ? 'Đã gửi bài'
          : g.status === 'ban_nhap'
          ? 'Bản nháp'
          : 'Chưa làm';
      const evalStatus = g.feedback?.isEvaluated
        ? g.feedback.isPublished
          ? 'Đã nhận xét (Đã công bố)'
          : 'Đã nhận xét (Nội bộ)'
        : 'Chưa nhận xét';

      const submittedTime = g.submittedAt
        ? new Date(g.submittedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        : 'Chưa nộp';

      return [
        escapeCsv(sessionData.sessionTitle),
        escapeCsv(g.name),
        escapeCsv(g.members || 'Chưa ghi tên'),
        escapeCsv(topicName),
        escapeCsv(g.scenario),
        escapeCsv(g.answers.q1 || 'Chưa trả lời'),
        escapeCsv(g.answers.q2 || 'Chưa trả lời'),
        escapeCsv(g.answers.q3 || 'Chưa trả lời'),
        escapeCsv(g.answers.q4 || 'Chưa trả lời'),
        escapeCsv(submittedTime),
        escapeCsv(statusText),
        escapeCsv(evalStatus),
        escapeCsv(g.feedback?.generalComment || ''),
        escapeCsv(g.feedback?.strengths || ''),
        escapeCsv(g.feedback?.improvements || ''),
      ].join(',');
    });

    // UTF-8 BOM (\uFEFF) ensures Excel displays Vietnamese accents properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    const fileName = `Ket_qua_thao_luan_Tin_hoc_10_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(csvContent);
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
