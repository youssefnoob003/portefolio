import { defineCollection, z } from 'astro:content';

const ctfEvents = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    challenges: z.array(z.object({
      name: z.string(),
      category: z.string(),
      difficulty: z.string()
    }))
  })
});

export const collections = {
  'ctf-events': ctfEvents
};