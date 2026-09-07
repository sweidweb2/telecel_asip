export const CMS_PUBLISH_STATUSES = ["draft", "published"] as const;

export type CmsPublishStatus = (typeof CMS_PUBLISH_STATUSES)[number];

export const CMS_PUBLISH_STATUS_LABELS: Record<CmsPublishStatus, string> = {
  draft: "Draft",
  published: "Published",
};
