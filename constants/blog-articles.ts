import type { Locale } from "@/constants/locales";
import { insightPath } from "@/constants/routes";
import type { Article } from "@/types/article";

function dummyBody(title: string): string[] {
  return [
    `${title} is a topic that matters to founders building technology ventures across Africa. This article outlines practical ideas you can apply while scaling product, team, and market access.`,
    "ASIP shares these insights to help participating ventures and the wider ecosystem learn from real programme experience. The examples here are illustrative and will evolve as cohorts progress.",
    "Founders often face similar questions around prioritisation, customer discovery, and partnership strategy. We focus on patterns that appear repeatedly across markets and sectors.",
    "Use this as a starting point for conversation with mentors, peers, and partners. Programme-specific guidance is always shared directly with selected teams during each cycle.",
  ];
}

function articleHref(locale: Locale, slug: string) {
  return insightPath(locale, slug);
}

/** Resolves href for list/detail links (defaults to English paths in static data). */
export function withInsightHref(article: Article, locale: Locale = "en"): Article {
  return { ...article, href: articleHref(locale, article.slug) };
}

export const FEATURED_ARTICLE: Article = {
  id: "article-001",
  slug: "improve-design-skills",
  category: {
    name: "Design",
    href: "#",
  },
  thumbnailUrl: "https://www.untitledui.com/marketing/blog-featured-post-01.webp",
  title: 'Improve your design skills: Develop an "eye" for design',
  summary:
    'Tools and trends change, but good design is timeless. Learn how to quickly develop an "eye" for design.',
  href: articleHref("en", "improve-design-skills"),
  publishedAt: "10 April 2025",
  readingTime: "8 min read",
  author: {
    name: "Amélie Laurent",
    href: "#",
    avatarUrl:
      "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80",
  },
  tags: [
    { name: "Design", color: "gray", href: "#" },
    { name: "Research", color: "gray", href: "#" },
    { name: "Presentation", color: "gray", href: "#" },
  ],
  body: dummyBody('Improve your design skills: Develop an "eye" for design'),
};

export const BLOG_ARTICLES: Article[] = [
  {
    id: "article-1",
    slug: "ux-review-presentations",
    title: "UX review presentations",
    summary:
      "How do you create compelling presentations that wow your colleagues and impress your managers?",
    href: articleHref("en", "ux-review-presentations"),
    category: { name: "Design", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/marketing/spirals.webp",
    publishedAt: "20 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Olivia Rhye",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80",
    },
    tags: [
      { name: "Design", color: "brand", href: "#" },
      { name: "Research", color: "indigo", href: "#" },
      { name: "Presentation", color: "pink", href: "#" },
    ],
    body: dummyBody("UX review presentations"),
    isFeatured: true,
  },
  {
    id: "article-2",
    slug: "migrating-to-linear-101",
    title: "Migrating to Linear 101",
    summary:
      "Linear helps streamline software projects, sprints, tasks, and bug tracking. Here's how to get started.",
    href: articleHref("en", "migrating-to-linear-101"),
    category: { name: "Product", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/marketing/conversation.webp",
    publishedAt: "19 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Phoenix Baker",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80",
    },
    tags: [
      { name: "Product", color: "blue-light", href: "#" },
      { name: "Tools", color: "pink", href: "#" },
      { name: "SaaS", color: "pink", href: "#" },
    ],
    body: dummyBody("Migrating to Linear 101"),
  },
  {
    id: "article-3",
    slug: "building-your-api-stack",
    title: "Building your API stack",
    summary:
      "The rise of RESTful APIs has been met by a rise in tools for creating, testing, and managing them.",
    href: articleHref("en", "building-your-api-stack"),
    category: { name: "Software Engineering", href: "#" },
    thumbnailUrl:
      "https://www.untitledui.com/blog/two-mobile-shapes-pattern.webp",
    publishedAt: "18 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Lana Steiner",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80",
    },
    tags: [
      { name: "Software Development", color: "success", href: "#" },
      { name: "Tools", color: "pink", href: "#" },
    ],
    body: dummyBody("Building your API stack"),
  },
  {
    id: "article-4",
    slug: "bill-walsh-leadership-lessons",
    title: "Bill Walsh leadership lessons",
    summary:
      "Like to know the secrets of transforming a 2-14 team into a 3x Super Bowl winning Dynasty?",
    href: articleHref("en", "bill-walsh-leadership-lessons"),
    category: { name: "Product", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/blog/two-people.webp",
    publishedAt: "17 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Alec Whitten",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/alec-whitten?fm=webp&q=80",
    },
    tags: [
      { name: "Leadership", color: "brand", href: "#" },
      { name: "Management", color: "gray-blue", href: "#" },
    ],
    body: dummyBody("Bill Walsh leadership lessons"),
  },
  {
    id: "article-5",
    slug: "pm-mental-models",
    title: "PM mental models",
    summary:
      "Mental models are simple expressions of complex processes or relationships.",
    href: articleHref("en", "pm-mental-models"),
    category: { name: "Product", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/marketing/smiling-girl-6.webp",
    publishedAt: "16 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Demi Wilkinson",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80",
    },
    tags: [
      { name: "Product", color: "blue-light", href: "#" },
      { name: "Research", color: "indigo", href: "#" },
      { name: "Frameworks", color: "orange", href: "#" },
    ],
    body: dummyBody("PM mental models"),
  },
  {
    id: "article-6",
    slug: "what-is-wireframing",
    title: "What is wireframing?",
    summary:
      "Introduction to Wireframing and its Principles. Learn from the best in the industry.",
    href: articleHref("en", "what-is-wireframing"),
    category: { name: "Design", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/marketing/wireframing-layout.webp",
    publishedAt: "15 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Candice Wu",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80",
    },
    tags: [
      { name: "Design", color: "brand", href: "#" },
      { name: "Research", color: "indigo", href: "#" },
    ],
    body: dummyBody("What is wireframing?"),
  },
  {
    id: "article-7",
    slug: "collaboration-better-designers",
    title: "How collaboration makes us better designers",
    summary:
      "Collaboration can make our teams stronger, and our individual designs better.",
    href: articleHref("en", "collaboration-better-designers"),
    category: { name: "Design", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/marketing/two-people.webp",
    publishedAt: "14 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Natali Craig",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/natali-craig?fm=webp&q=80",
    },
    tags: [
      { name: "Design", color: "brand", href: "#" },
      { name: "Research", color: "indigo", href: "#" },
    ],
    body: dummyBody("How collaboration makes us better designers"),
  },
  {
    id: "article-8",
    slug: "top-javascript-frameworks",
    title: "Our top 10 Javascript frameworks to use",
    summary:
      "JavaScript frameworks make development easy with extensive features and functionalities.",
    href: articleHref("en", "top-javascript-frameworks"),
    category: { name: "Product", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/marketing/workspace-5.webp",
    publishedAt: "13 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Drew Cano",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80",
    },
    tags: [
      { name: "Software Development", color: "success", href: "#" },
      { name: "Tools", color: "pink", href: "#" },
      { name: "SaaS", color: "pink", href: "#" },
    ],
    body: dummyBody("Our top 10 Javascript frameworks to use"),
  },
  {
    id: "article-9",
    slug: "podcast-cx-community",
    title: "Podcast: Creating a better CX Community",
    summary:
      "Starting a community doesn't need to be complicated, but how do you get started?",
    href: articleHref("en", "podcast-cx-community"),
    category: { name: "Customer Success", href: "#" },
    thumbnailUrl: "https://www.untitledui.com/marketing/sythesize.webp",
    publishedAt: "12 Jan 2025",
    readingTime: "8 min read",
    author: {
      name: "Orlando Diggs",
      href: "#",
      avatarUrl:
        "https://www.untitledui.com/images/avatars/orlando-diggs?fm=webp&q=80",
    },
    tags: [
      { name: "Podcasts", color: "brand", href: "#" },
      { name: "Customer Success", color: "gray-blue", href: "#" },
    ],
    body: dummyBody("Podcast: Creating a better CX Community"),
  },
];

export const BLOG_TAB_IDS = [
  "all",
  "design",
  "product",
  "software-engineering",
  "customer-success",
] as const;

export type BlogTabId = (typeof BLOG_TAB_IDS)[number];

export const BLOG_SORT_IDS = ["recent", "popular", "viewed"] as const;

export type BlogSortId = (typeof BLOG_SORT_IDS)[number];

export function categoryToTabId(name: string): BlogTabId {
  switch (name) {
    case "Design":
      return "design";
    case "Product":
      return "product";
    case "Software Engineering":
      return "software-engineering";
    case "Customer Success":
      return "customer-success";
    default:
      return "all";
  }
}
