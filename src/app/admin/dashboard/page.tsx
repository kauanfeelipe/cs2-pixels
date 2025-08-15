// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import styles from './dashboard.module.css'; // Usa o novo CSS do dashboard

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [mapa, setMapa] = useState('mirage');
  const [posicao, setPosicao] = useState('');
  const [acao, setAcao] = useState('smoke');
  const [destino, setDestino] = useState('');
  const [tags, setTags] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const resetForm = () => {
    setVideoFile(null);
    setPosicao('');
    setDestino('');
    setTags('');
    // Reseta o input de arquivo visualmente
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!videoFile || !mapa || !posicao || !acao || !destino || !tags) {
      setFeedback({ type: 'error', message: 'Por favor, preencha todos os campos.' });
      return;
    }

    setIsUploading(true);
    setFeedback(null);
    setProgress(0);

    const storageRef = ref(storage, `videos/${Date.now()}-${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(currentProgress);
      },
      (error) => {
        console.error("Erro no upload: ", error);
        setFeedback({ type: 'error', message: 'Falha no upload do vídeo.' });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        const videoData = {
          mapa: mapa.toLowerCase(),
          posicao_inicial: posicao.toLowerCase(),
          acao: acao.toLowerCase(),
          destino: destino.toLowerCase(),
          url_video: downloadURL,
          tags: tagsArray,
          createdAt: serverTimestamp(),
        };

        try {
          await addDoc(collection(db, 'videos'), videoData);
          setFeedback({ type: 'success', message: 'Vídeo adicionado com sucesso!' });
          resetForm();
        } catch (dbError) {
          console.error("Erro ao salvar no Firestore: ", dbError);
          setFeedback({ type: 'error', message: 'Erro ao salvar os dados do vídeo.' });
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  if (loading) {
    return <main className={styles.main}><p>Verificando autenticação...</p></main>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h1 className={styles.title}>Painel de Administração</h1>
          <p className={styles.subtitle}>Adicionar novo Pixel para {user?.email}</p>
        </header>

        <form onSubmit={handleUpload}>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="file-input" className={styles.label}>Arquivo de Vídeo (.mp4)</label>
              <label htmlFor="file-input" className={styles.fileInputLabel}>
                {videoFile ? 'Arquivo selecionado' : 'Clique para selecionar um vídeo'}
              </label>
              <input id="file-input" type="file" accept="video/mp4" onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoFile(e.target.files ? e.target.files[0] : null)} style={{ display: 'none' }} />
              {videoFile && <span className={styles.fileName}>{videoFile.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="mapa" className={styles.label}>Mapa</label>
              <input id="mapa" type="text" value={mapa} onChange={e => setMapa(e.target.value)} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="acao" className={styles.label}>Ação</label>
              <input id="acao" type="text" value={acao} onChange={e => setAcao(e.target.value)} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="posicao" className={styles.label}>Posição Inicial</label>
              <input id="posicao" type="text" value={posicao} onChange={e => setPosicao(e.target.value)} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="destino" className={styles.label}>Local de Destino</label>
              <input id="destino" type="text" value={destino} onChange={e => setDestino(e.target.value)} className={styles.input} />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="tags" className={styles.label}>Tags (separadas por vírgula)</label>
              <textarea id="tags" value={tags} onChange={e => setTags(e.target.value)} className={styles.textarea} />
            </div>
          </div>

          <div className={styles.progressContainer}>
            {isUploading && <progress value={progress} max="100" className={styles.progressBar} />}
            {feedback && (
              <div className={`${styles.feedback} ${styles[feedback.type]}`}>
                {feedback.message}
              </div>
            )}
          </div>

          <button type="submit" disabled={isUploading} className={styles.buttonPrimary} style={{marginTop: '1.5rem'}}>
            {isUploading ? `Enviando... ${Math.round(progress)}%` : 'Adicionar Vídeo'}
          </button>
        </form>

        <button onClick={() => auth.signOut()} className={styles.buttonSecondary}>
          Sair
        </button>
      </div>
    </main>
  );
}