-- Supplied partner marks do not yet have written usage permission.
-- Hide every logo until an editor sets logo_permission in the CMS.

update public.partners
set logo_permission = false
where logo_permission = true;
