/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (authenticated with Firebase)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 12 Discussion Groups table
export const discussionGroups = pgTable('discussion_groups', {
  id: integer('id').primaryKey(), // 1 to 12
  name: text('name').notNull(),
  topicId: text('topic_id').notNull(),
  scenario: text('scenario').notNull(),
  members: text('members').default(''),
  q1: text('q1').default(''),
  q2: text('q2').default(''),
  q3: text('q3').default(''),
  q4: text('q4').default(''),
  status: text('status').default('chua_lam').notNull(),
  submittedAt: timestamp('submitted_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
  generalComment: text('general_comment').default(''),
  strengths: text('strengths').default(''),
  improvements: text('improvements').default(''),
  isEvaluated: boolean('is_evaluated').default(false).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  evaluatedAt: timestamp('evaluated_at'),
});
