import { BookCover } from './BookCover'
import type { Book } from '../../data/catalog'

interface BookCardProps {
  book: Book
  onClick?: () => void
  w?: number
  showProgress?: boolean
  progress?: number
}

export function BookCard({ book, onClick, w = 110, showProgress, progress = 0 }: BookCardProps) {
  const h = w * 1.5
  return (
    <div onClick={onClick} style={{ width: w, cursor: 'pointer', flexShrink: 0 }}>
      <BookCover title={book.title} author={book.author.split(' ').slice(-1)[0]} genre={book.genre} coverUrl={book.cover_url} w={w} h={h} />
      <div style={{
        fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: 'var(--text)',
        marginTop: 10, lineHeight: 1.3,
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
      }}>{book.title}</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{book.author}</div>
      {showProgress && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', borderRadius: 1 }} />
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{progress}%</div>
        </div>
      )}
    </div>
  )
}
