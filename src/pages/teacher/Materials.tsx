import { useState } from 'react';
import { useStore } from '../../data/store';
import { useI18n } from '../../i18n';
import { formatDate, LOCALE_BY_LANG } from '../../lib/format';
import { useBookText } from '../../lib/label';
import { SharedFiles } from '../../components/SharedFiles';

export default function TeacherMaterials() {
  const { data, addBook } = useStore();
  const { t, lang } = useI18n();
  const { chapters: bookChapters } = useBookText();
  const locale = LOCALE_BY_LANG[lang];
  const [weekId, setWeekId] = useState(data.weeks[0]?.id);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [chapters, setChapters] = useState('');

  const weekBooks = data.books.filter((b) => b.weekId === weekId);
  const week = data.weeks.find((w) => w.id === weekId)!;

  const handleAdd = () => {
    if (!title.trim()) return;
    addBook(weekId, { title, author, description: 'Added manually by the teacher', chapters, dueDate: week.endDate });
    setTitle('');
    setAuthor('');
    setChapters('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('teacher.materialsTitle')}</h1>
          <p className="lede">{t('teacher.materialsSub')}</p>
        </div>
      </div>

      <SharedFiles />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>{t('teacher.selectWeek')}</label>
          <select className="input" value={weekId} onChange={(e) => setWeekId(e.target.value)}>
            {data.weeks.map((w) => {
              const month = data.months.find((m) => m.id === w.monthId)!;
              return (
                <option key={w.id} value={w.id}>
                  {t('common.month')} {month.index}, {t('common.week').toLowerCase()} {w.index} · {formatDate(w.endDate, locale)}
                </option>
              );
            })}
          </select>
        </div>

        <div className="table-wrap" style={{ marginBottom: 14 }}>
          <table>
            <thead><tr><th>{t('teacher.title')}</th><th>{t('teacher.author')}</th><th>{t('teacher.chapters')}</th><th>{t('teacher.dueDate')}</th></tr></thead>
            <tbody>
              {weekBooks.map((b) => (
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{bookChapters(b)}</td>
                  <td>{formatDate(b.dueDate, locale)}</td>
                </tr>
              ))}
              {weekBooks.length === 0 && <tr><td colSpan={4} className="empty-note">{t('teacher.noneThisWeek')}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="grid cols-3">
          <div className="field"><label>{t('teacher.title')}</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grammar in Use" /></div>
          <div className="field"><label>{t('teacher.author')}</label><input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
          <div className="field"><label>{t('teacher.chapters')}</label><input className="input" value={chapters} onChange={(e) => setChapters(e.target.value)} placeholder="4–6" /></div>
        </div>
        <button className="btn primary" style={{ marginTop: 12 }} onClick={handleAdd}>{t('teacher.addBook')}</button>
        <p className="empty-note" style={{ textAlign: 'left', padding: '10px 0 0' }}>{t('teacher.storageNote')}</p>
      </div>
    </div>
  );
}
