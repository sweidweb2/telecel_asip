-- Booklet "Impact Achievements" blocks are not cleared for publication.
-- Keep the company description and drop the unverified figures.

update public.startups
set description = trim(regexp_replace(description, '\s*Impact Achievements[\s\S]*$', '', 'i'))
where description ~* 'Impact Achievements'
  and length(trim(regexp_replace(description, '\s*Impact Achievements[\s\S]*$', '', 'i'))) >= 2;
