/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq } from 'drizzle-orm';
import { getDb } from './index.ts';
import { discussionGroups } from './schema.ts';
import { GroupData, TopicId } from '../types/discussion.ts';

export async function fetchGroupsFromDb(): Promise<GroupData[] | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const rows = await db.select().from(discussionGroups).orderBy(discussionGroups.id);
    if (!rows || rows.length === 0) {
      return null;
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      topicId: row.topicId as TopicId,
      scenario: row.scenario,
      members: row.members || '',
      answers: {
        q1: row.q1 || '',
        q2: row.q2 || '',
        q3: row.q3 || '',
        q4: row.q4 || '',
      },
      status: (row.status as 'chua_lam' | 'ban_nhap' | 'da_gui') || 'chua_lam',
      createdAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
      submittedAt: row.submittedAt ? new Date(row.submittedAt).toISOString() : null,
      feedback: {
        generalComment: row.generalComment || '',
        strengths: row.strengths || '',
        improvements: row.improvements || '',
        isEvaluated: Boolean(row.isEvaluated),
        isPublished: Boolean(row.isPublished),
        evaluatedAt: row.evaluatedAt ? new Date(row.evaluatedAt).toISOString() : null,
      },
    }));
  } catch (err) {
    console.warn('[Cloud SQL] fetchGroupsFromDb warning:', err);
    return null;
  }
}

export async function saveGroupToDb(group: GroupData): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    const payload = {
      id: group.id,
      name: group.name,
      topicId: group.topicId,
      scenario: group.scenario,
      members: group.members || '',
      q1: group.answers?.q1 || '',
      q2: group.answers?.q2 || '',
      q3: group.answers?.q3 || '',
      q4: group.answers?.q4 || '',
      status: group.status || 'chua_lam',
      submittedAt: group.submittedAt ? new Date(group.submittedAt) : null,
      updatedAt: new Date(group.updatedAt || Date.now()),
      generalComment: group.feedback?.generalComment || '',
      strengths: group.feedback?.strengths || '',
      improvements: group.feedback?.improvements || '',
      isEvaluated: Boolean(group.feedback?.isEvaluated),
      isPublished: Boolean(group.feedback?.isPublished),
      evaluatedAt: group.feedback?.evaluatedAt ? new Date(group.feedback.evaluatedAt) : null,
    };

    // Upsert using drizzle
    await db
      .insert(discussionGroups)
      .values(payload)
      .onConflictDoUpdate({
        target: discussionGroups.id,
        set: {
          name: payload.name,
          topicId: payload.topicId,
          scenario: payload.scenario,
          members: payload.members,
          q1: payload.q1,
          q2: payload.q2,
          q3: payload.q3,
          q4: payload.q4,
          status: payload.status,
          submittedAt: payload.submittedAt,
          updatedAt: payload.updatedAt,
          generalComment: payload.generalComment,
          strengths: payload.strengths,
          improvements: payload.improvements,
          isEvaluated: payload.isEvaluated,
          isPublished: payload.isPublished,
          evaluatedAt: payload.evaluatedAt,
        },
      });

    return true;
  } catch (err) {
    console.warn('[Cloud SQL] saveGroupToDb warning:', err);
    return false;
  }
}
