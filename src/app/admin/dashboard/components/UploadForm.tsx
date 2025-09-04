"use client";

import { ChangeEvent, FormEvent } from "react";
import styles from "../dashboard.module.css";

type UploadFormProps = {
  videoFile: File | null;
  mapa: string;
  posicao: string;
  acao: string;
  destino: string;
  tags: string;
  isProcessing: boolean;
  progress: number;
  feedback: { type: "success" | "error"; message: string } | null;
  onVideoFileChange: (file: File | null) => void;
  onMapaChange: (value: string) => void;
  onPosicaoChange: (value: string) => void;
  onAcaoChange: (value: string) => void;
  onDestinoChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export default function UploadForm({
  videoFile,
  mapa,
  posicao,
  acao,
  destino,
  tags,
  isProcessing,
  progress,
  feedback,
  onVideoFileChange,
  onMapaChange,
  onPosicaoChange,
  onAcaoChange,
  onDestinoChange,
  onTagsChange,
  onSubmit,
}: UploadFormProps) {
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    onVideoFileChange(e.target.files ? e.target.files[0] : null);
  };

  return (
    <form onSubmit={onSubmit} className={styles.addForm}>
      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="file-input" className={styles.label}>Video file (.mp4)</label>
          <label htmlFor="file-input" className={styles.fileInputLabel}>
            {videoFile ? `Selected: ${videoFile.name}` : "Click to choose a video"}
          </label>
          <input id="file-input" type="file" accept="video/mp4" onChange={handleFileInput} style={{ display: 'none' }} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="mapa" className={styles.label}>Map</label>
          <select id="mapa" value={mapa} onChange={e => onMapaChange(e.target.value)} className={styles.select}>
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
          <label htmlFor="acao" className={styles.label}>Action</label>
          <select id="acao" value={acao} onChange={e => onAcaoChange(e.target.value)} className={styles.select}>
            <option value="smoke">Smoke</option>
            <option value="flash">Flash</option>
            <option value="molotov">Molotov</option>
            <option value="hegrenade">HE Grenade</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="posicao" className={styles.label}>Start position</label>
          <input id="posicao" type="text" value={posicao} onChange={e => onPosicaoChange(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="destino" className={styles.label}>Target location</label>
          <input id="destino" type="text" value={destino} onChange={e => onDestinoChange(e.target.value)} className={styles.input} />
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="tags" className={styles.label}>Tags (comma-separated)</label>
          <textarea id="tags" value={tags} onChange={e => onTagsChange(e.target.value)} className={styles.textarea} />
        </div>
      </div>
      <div className={styles.progressContainer}>
        {isProcessing && <progress value={progress} max="100" className={styles.progressBar} />}
        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.message}</div>
        )}
      </div>
      <button type="submit" disabled={isProcessing} className={styles.buttonPrimary} style={{marginTop: '1.5rem'}}>
        {isProcessing ? `Uploading... ${Math.round(progress)}%` : 'Add video'}
      </button>
    </form>
  );
}


