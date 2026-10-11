-- Cohort headcounts stay off public summaries until Telecel locks the total.
-- Dates and programme facts from the cohort records stay.

update public.cohorts
set summary = 'The third ASIP accelerator cohort, with Final Selection Days in January 2023 and Demo Day at the Museum of Black Civilisations.'
where public_label = 'ASIP Accelerator Cohort 3'
  and summary = 'The third ASIP accelerator cohort selected 11 companies after Final Selection Days in January 2023.';

update public.cohorts
set summary = 'The fourth ASIP accelerator cohort, with Final Selection Days in October 2023. The programme ran from 13 November 2023 to 7 February 2024.'
where public_label = 'ASIP Accelerator Cohort 4'
  and summary = 'The fourth ASIP accelerator cohort selected 10 companies after Final Selection Days in October 2023.';
