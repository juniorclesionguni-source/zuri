-- As citações mostradas na app (Home, Reading, cartão de partilha) eram um texto fixo
-- de Mia Couto/Terra Sonâmbula — livro que nem sequer está no catálogo. Passam a vir
-- de um trecho real por livro (curado no admin, opcional), com a sinopse como
-- honesto fallback imediato (é a única que já existe para todos os livros seed).
alter table public.books add column if not exists excerpt text;
