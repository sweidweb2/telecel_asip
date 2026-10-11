-- Portal upload ceiling is 10 MB. Raises the public media buckets that
-- were created at 2 MB (partners, auther) or 5 MB (blogs, startups).

update storage.buckets
set file_size_limit = 10485760
where id in ('blogs', 'auther', 'startups', 'partners');
