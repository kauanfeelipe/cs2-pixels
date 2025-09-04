"use client";

import { ChangeEvent, FormEvent } from "react";
import styles from "../dashboard.module.css";
import type { Video } from "./VideoTable";

type EditModalProps = {
  video: Video;
  isProcessing: boolean;
  onClose: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: FormEvent) => void;
};

export default function EditModal({ video, isProcessing, onClose, onChange, onSubmit }: EditModalProps) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>Editing video</h3>
        <form onSubmit={onSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="edit-mapa" className={styles.label}>Map</label>
              <select id="edit-mapa" name="mapa" value={video.mapa} onChange={onChange} className={styles.select}>
                <option value="mirage">Mirage</option>
                <option value="inferno">Inferno</option>
                <option value="dust2">Dust 2</option>
                <option value="nuke">Nuke</option>
                <option value="overpass">Overpass</option>
                <option value="vertigo">Vertigo</option>
                <option value="ancient">Ancient</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="edit-acao" className={styles.label}>Action</label>
              <select id="edit-acao" name="acao" value={video.acao} onChange={onChange} className={styles.select}>
                <option value="smoke">Smoke</option>
                <option value="flash">Flash</option>
                <option value="molotov">Molotov</option>
                <option value="hegrenade">HE Grenade</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="edit-posicao" className={styles.label}>Start position</label>
              <input id="edit-posicao" name="posicao_inicial" value={video.posicao_inicial} onChange={onChange} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="edit-destino" className={styles.label}>Target</label>
              <input id="edit-destino" name="destino" value={video.destino} onChange={onChange} className={styles.input} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="edit-tags" className={styles.label}>Tags (comma-separated)</label>
              <textarea id="edit-tags" name="tags" value={Array.isArray(video.tags) ? video.tags.join(", ") : video.tags} onChange={onChange} className={styles.textarea} />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.buttonSecondary}>Cancel</button>
            <button type="submit" className={styles.buttonPrimary} disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


