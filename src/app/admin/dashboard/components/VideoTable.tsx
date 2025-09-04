"use client";

import styles from "../dashboard.module.css";

export type Video = {
  id: string;
  mapa: string;
  acao: string;
  posicao_inicial: string;
  destino: string;
  tags: string[] | string;
  url_video: string;
};

type VideoTableProps = {
  videos: Video[];
  isFetching: boolean;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export default function VideoTable({ videos, isFetching, onEdit, onDelete, onLoadMore, hasMore }: VideoTableProps) {
  const renderSkeletonRows = (count: number) => {
    return Array.from({ length: count }).map((_, idx) => (
      <tr className={styles.tr} key={`skeleton-${idx}`}>
        <td className={styles.td}><div className={`${styles.skeleton} ${styles.skeletonVideo}`} /></td>
        <td className={styles.td}><div className={`${styles.skeleton} ${styles.skeletonText}`} /></td>
        <td className={styles.td}><div className={`${styles.skeleton} ${styles.skeletonText}`} /></td>
        <td className={styles.td}><div className={`${styles.skeleton} ${styles.skeletonText}`} /></td>
        <td className={styles.td}><div className={`${styles.skeleton} ${styles.skeletonText}`} /></td>
        <td className={styles.td}><div className={`${styles.skeleton} ${styles.skeletonText}`} /></td>
        <td className={styles.td}><div className={`${styles.skeleton} ${styles.skeletonText}`} /></td>
      </tr>
    ));
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Preview</th>
            <th className={styles.th}>Map</th>
            <th className={styles.th}>Action</th>
            <th className={styles.th}>Start position</th>
            <th className={styles.th}>Target</th>
            <th className={styles.th}>Tags</th>
            <th className={styles.th} style={{ width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isFetching && videos.length === 0 && renderSkeletonRows(5)}
          {videos.map((video) => (
            <tr key={video.id} className={styles.tr}>
              <td className={styles.td}>
                <video className={styles.previewVideo} src={video.url_video} muted loop playsInline preload="metadata" />
              </td>
              <td className={styles.td}><span className={`${styles.badge} ${styles.badgeMap}`}>{video.mapa}</span></td>
              <td className={styles.td}>
                <span className={`${styles.badge} ${video.acao === 'smoke' ? styles.badgeActionSmoke : video.acao === 'flash' ? styles.badgeActionFlash : video.acao === 'molotov' ? styles.badgeActionMolotov : styles.badgeActionHE}`}>
                  {video.acao}
                </span>
              </td>
              <td className={styles.td}>{video.posicao_inicial}</td>
              <td className={styles.td}>{video.destino}</td>
              <td className={styles.td}>
                <div className={styles.tagsRow}>
                  {(Array.isArray(video.tags) ? video.tags : (video.tags || "").split(",").map(t => t.trim())).filter(Boolean).slice(0, 6).map((tag, idx) => (
                    <span className={styles.chip} key={`${video.id}-tag-${idx}`}>{tag}</span>
                  ))}
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.tableActions}>
                  <button className={`${styles.actionButton} ${styles.actionEdit}`} onClick={() => onEdit(video)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" stroke="currentColor" strokeWidth="1.5"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" stroke="currentColor" strokeWidth="1.5"/></svg>
                    Edit
                  </button>
                  <button className={`${styles.actionButton} ${styles.actionDelete}`} onClick={() => onDelete(video)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7h12" stroke="currentColor" strokeWidth="1.5"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.5"/></svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {videos.length === 0 && !isFetching && (
            <tr>
              <td className={styles.td} colSpan={7}>
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v2H3V7Z" stroke="currentColor" strokeWidth="1.5"/><path d="M3 11v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6H3Z" stroke="currentColor" strokeWidth="1.5"/></svg>
                  <div className={styles.emptyTitle}>No videos found</div>
                  <div className={styles.emptySubtitle}>Adjust filters or add a new video.</div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.buttonSecondary} onClick={onLoadMore} disabled={isFetching}>
            {isFetching ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}


