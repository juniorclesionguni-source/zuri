-- Publica os 14 livros e define os valores reais de pages/mins/rating
-- vindos do catálogo anterior (src/data/catalog.ts).

update public.books set is_published = true, pages = 320, mins = 400, rating = 4.6 where id = 'a-ex';
update public.books set is_published = true, pages = 280, mins = 350, rating = 4.4 where id = 'a-pessoa-certa-e-voce';
update public.books set is_published = true, pages = 340, mins = 430, rating = 4.5 where id = 'alem-da-tempestade';
update public.books set is_published = true, pages = 310, mins = 390, rating = 4.3 where id = 'como-arruinar-um-casamento';
update public.books set is_published = true, pages = 220, mins = 275, rating = 4.2 where id = 'ninguem-nasce-sabendo';
update public.books set is_published = true, pages = 380, mins = 475, rating = 4.5 where id = 'no-rastro-da-mentira';
update public.books set is_published = true, pages = 260, mins = 325, rating = 4.6 where id = 'nao-comecou-com-voce';
update public.books set is_published = true, pages = 290, mins = 365, rating = 4.3 where id = 'nos-ja-moramos-aqui';
update public.books set is_published = true, pages = 300, mins = 375, rating = 4.4 where id = 'o-diabo-veste-cor-de-rosa';
update public.books set is_published = true, pages = 180, mins = 225, rating = 4.0 where id = 'por-que-as-mulheres-amam-homens-fortes';
update public.books set is_published = true, pages = 300, mins = 375, rating = 4.7 where id = 'por-que-ninguem-me-disse-isso-antes';
update public.books set is_published = true, pages = 360, mins = 450, rating = 4.5 where id = 'sem-chance-de-adeus';
update public.books set is_published = true, pages = 340, mins = 425, rating = 4.3 where id = 'um-crush-dos-infernos';
update public.books set is_published = true, pages = 310, mins = 390, rating = 4.4 where id = 'um-namorado-bom-pra-cachorro';
