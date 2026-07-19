-- Os livros seed usavam géneros ad-hoc (Thriller/Drama/Auto-ajuda) que nunca bateram
-- certo com a lista que o onboarding (Genres.tsx) e o admin (Admin.tsx) oferecem
-- (Romance/Ficção/História/Poesia/Ensaio/Suspense/Biografia/Des. Pessoal). Sem esta
-- reconciliação, recomendar por género escolhido no onboarding não encontrava quase
-- nada — a personalização era decorativa. Alinha os valores existentes à lista real.
update public.books set genre = 'Suspense'     where genre = 'Thriller';
update public.books set genre = 'Des. Pessoal' where genre = 'Auto-ajuda';
update public.books set genre = 'Romance'      where genre = 'Drama'; -- "Além da Tempestade" (Cecelia Ahern)
