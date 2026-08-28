import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { formatDate, LOCALE_BY_LANG } from '../../lib/format';
import { useBookText, useLabel, useTitle } from '../../lib/label';

function downloadPlaceholder(title: string, body: string) {
  const blob = new Blob([`${title}\n\n${body}\n\n— demo file, will be a real PDF from Supabase Storage.`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StudentMaterials() {
  const { data } = useStore();
  const { user } = useSession();
  const { t, lang } = useI18n();
  const label = useLabel();
  const title = useTitle();
  const { chapters, description } = useBookText();
  if (!user) return null;
  const student = data.students.find((s) => s.userId === user.id)!;
  const group = data.groups.find((g) => g.id === student.groupId)!;
  const locale = LOCALE_BY_LANG[lang];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('student.materialsTitle')}</h1>
          <p className="lede">{t('student.materialsSub', { group: label(group) })}</p>
        </div>
      </div>

      {data.months.map((month) => {
        const monthWeeks = data.weeks.filter((w) => w.monthId === month.id);
        return (
          <div key={month.id} style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', margin: '18px 0 10px' }}>
              {t('common.month')} {month.index} · {label(month)}
            </h2>
            <div className="grid cols-2">
              {monthWeeks.map((week) => {
                const weekBooks = data.books.filter((b) => b.weekId === week.id);
                const weekMaterials = data.materials.filter((m) => m.weekId === week.id);
                return (
                  <div className="card" key={week.id}>
                    <h3>
                      {t('common.week')} {week.index} <span style={{ color: 'var(--faint)', fontWeight: 400 }}>· {formatDate(week.endDate, locale)}</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {weekBooks.map((b) => (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{b.author} · {chapters(b)}</div>
                          </div>
                          <button className="btn" onClick={() => downloadPlaceholder(b.title, `${b.author}\n${b.description}\n${b.chapters}`)}>
                            {t('common.download')}
                          </button>
                        </div>
                      ))}
                      {weekMaterials.map((m) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title(m)}</div>
                          <button className="btn" onClick={() => downloadPlaceholder(title(m), 'Additional weekly material.')}>
                            {t('common.open')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
