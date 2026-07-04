-- Zuri — seed do catálogo (os 10 livros do mock src/data/catalog.ts)
-- epub_path/cover_path ficam null até o upload para R2.

insert into public.books (id, title, author, pages, genre, rating, mins, synopsis) values
  ('terra',      'Terra Sonâmbula',              'Mia Couto',            268, 'Ficção',  4.8, 340, 'Num país devastado pela guerra civil, um velho e um rapaz encontram um diário num autocarro queimado. As páginas do diário tornam-se um reino de memórias e sonhos que se entrelaçam com a realidade.'),
  ('niketche',   'Niketche',                     'Paulina Chiziane',     320, 'Romance', 4.9, 410, 'Rami descobre que o marido tem cinco amantes. Em vez de desespero, decide conhecê-las. Uma história sobre poligamia, sororidade e o corpo das mulheres moçambicanas.'),
  ('ualalapi',   'Ualalapi',                     'Ungulani Ba Ka Khosa', 180, 'História',4.6, 220, 'Cinco episódios do império de Gaza e da figura de Ngungunhane, o último imperador dos vátuas.'),
  ('portagem',   'Portagem',                     'Orlando Mendes',       210, 'Ficção',  4.3, 260, null),
  ('xigubo',     'Xigubo',                       'José Craveirinha',      96, 'Poesia',  4.7,  90, null),
  ('balada',     'Balada de Amor ao Vento',      'Paulina Chiziane',     180, 'Romance', 4.5, 230, null),
  ('vozes',      'Vozes Anoitecidas',            'Mia Couto',            152, 'Ficção',  4.7, 190, null),
  ('godido',     'Godido',                       'João Dias',            140, 'Ficção',  4.2, 170, null),
  ('karingana',  'Karingana ua Karingana',       'José Craveirinha',     120, 'Poesia',  4.6, 130, null),
  ('nos-matamos','Nós Matámos o Cão-Tinhoso',    'Luís B. Honwana',      164, 'Ficção',  4.8, 200, null)
on conflict (id) do nothing;
