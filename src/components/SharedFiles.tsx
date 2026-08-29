import { fileIcon, SHARED_FILES } from '../data/files';
import { useT } from '../i18n';
import { Item, Stagger } from './Reveal';

/**
 * Файлы, выложенные преподавателем вручную (папка `src/materials/`).
 * Список собирается на сборке, поэтому здесь только отрисовка.
 */
export function SharedFiles() {
  const t = useT();

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h3>{t('materials.sharedTitle')}</h3>
      <p className="lede" style={{ fontSize: '0.85rem', margin: '2px 0 14px' }}>
        {t('materials.sharedSub')}
      </p>

      {SHARED_FILES.length === 0 ? (
        <p className="empty-note">{t('materials.sharedEmpty')}</p>
      ) : (
        <Stagger className="file-list">
          {SHARED_FILES.map((f) => (
            <Item key={f.url}>
              {/* download с именем файла: в сборке путь получает хеш, а скачаться
                  должно под тем именем, под каким файл положили в папку. */}
              <a className="file-row" href={f.url} download={f.name}>
                <span className="file-icon" aria-hidden="true">{fileIcon(f.ext)}</span>
                <span className="file-name">{f.name}</span>
                <span className="file-action">{t('common.download')}</span>
              </a>
            </Item>
          ))}
        </Stagger>
      )}
    </div>
  );
}
