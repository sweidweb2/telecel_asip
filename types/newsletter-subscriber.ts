import type { Tables } from "@/types/database";

export type NewsletterSubscriber = Tables<"newsletter_subscribers">;

export type NewsletterSubscriberListResult = {
  subscribers: NewsletterSubscriber[];
  total: number;
  totalPages: number;
};
