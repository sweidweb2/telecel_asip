-- Keep Impact case-study presentation separate from startup directory metadata.
alter table public.founder_stories
  add column story_title text,
  add column cover_image_url text,
  add column headline_stat text;

alter table public.founder_stories
  add constraint founder_stories_story_title_len_chk check (
    story_title is null or char_length(story_title) between 2 and 200
  ),
  add constraint founder_stories_cover_image_url_len_chk check (
    cover_image_url is null or char_length(cover_image_url) <= 2048
  ),
  add constraint founder_stories_headline_stat_len_chk check (
    headline_stat is null or char_length(headline_stat) <= 80
  );
