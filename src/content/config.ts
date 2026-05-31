import { defineCollection, z } from 'astro:content';

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().default('Board of Directors'),
    tag: z.enum(['Event', 'Infrastructure', 'Governance', 'Community']),
    excerpt: z.string(),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    startTime: z.string(),
    endTime: z.string().optional(),
    location: z.string(),
    type: z.enum(['Volunteer', 'Governance', 'Social']),
    featured: z.boolean().optional().default(false),
    heroImage: z.string().optional(),
    gallery: z.array(z.string()).optional(),
  }),
});

const documents = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    category: z.enum(["Community", "Governance", "Minutes", "Financial", "Landscaping"]),
    date: z.string(),
    file: z.string(),
    size: z.string().optional(),
  }),
});

const board = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email().optional(),
    order: z.number(),
  }),
});

export const collections = { news, events, documents, board };
