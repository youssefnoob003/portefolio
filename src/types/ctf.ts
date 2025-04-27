import type { MarkdownInstance } from 'astro';

export interface Challenge {
  name: string;
  category: string;
  difficulty: string;
}

export interface EventFrontmatter {
  title: string;
  date: string;
  description: string;
  challenges: Challenge[];
}

export interface TaskFrontmatter {
  title: string;
  eventName: string;
  category: string;
  difficulty: string;
  points: number;
  status: 'solved' | 'unsolved';
  solvedDate?: string;
}

export type EventFile = MarkdownInstance<EventFrontmatter>;
export type TaskFile = MarkdownInstance<TaskFrontmatter>;

export interface StaticPath {
  params: { slug: string };
  props: { 
    isEvent: boolean;
    content: EventFile | TaskFile;
  };
}

// Type guard for frontmatter types
export const isEventFrontmatter = (fm: EventFrontmatter | TaskFrontmatter): fm is EventFrontmatter => {
  return 'challenges' in fm;
};