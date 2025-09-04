'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, deleteDoc, updateDoc, limit as fbLimit, startAfter as fbStartAfter } from 'firebase/firestore';
import styles from './dashboard.module.css';
import Toolbar, { type DashboardFilters } from './components/Toolbar';
import UploadForm from './components/UploadForm';
import VideoTable, { type Video as VideoRow } from './components/VideoTable';
import EditModal from './components/EditModal';
import ConfirmDialog from './components/ConfirmDialog';

// Interface que define a estrutura de um vídeo, incluindo seu ID do Firestore.
interface Video {
  id: string;
  mapa: string;
  acao: string;
  posicao_inicial: string;
  destino: string;
  tags: string[] | string; // Permite string temporariamente durante a edição
  url_video: string;
}

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // Estados para o formulário de ADIÇÃO
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [mapa, setMapa] = useState('mirage');
  const [posicao, setPosicao] = useState('');
  const [acao, setAcao] = useState('smoke');
  const [destino, setDestino] = useState('');
  const [tags, setTags] = useState('');
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);

  // Estados para o processo de UPLOAD/OPERAÇÕES
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados para GERENCIAMENTO de vídeos
  const [videos, setVideos] = useState<Video[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; target: Video | null }>({ open: false, target: null });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastCursor, setLastCursor] = useState<any>(null);
  const PAGE_SIZE = 10;

  // Filtros (Toolbar)
  const [filters, setFilters] = useState<DashboardFilters>({ map: '', action: '', searchText: '' });

  // Função centralizada para buscar vídeos com filtros e paginação.
  const fetchVideos = async (append = false) => {
    if (!auth.currentUser) return; 
    setIsFetching(true);
    try {
      const videosCollection = collection(db, 'videos');
      const constraints: any[] = [orderBy('createdAt', 'desc'), fbLimit(PAGE_SIZE)];
      if (append && lastCursor) {
        constraints.push(fbStartAfter(lastCursor));
      }
      const q = query(videosCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      const videosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Video));
      const filtered = videosData.filter(v => {
        const byMap = !filters.map || v.mapa === filters.map;
        const byAction = !filters.action || v.acao === filters.action;
        const byText = !filters.searchText || [v.posicao_inicial, v.destino, Array.isArray(v.tags) ? v.tags.join(' ') : v.tags].join(' ').includes(filters.searchText.toLowerCase());
        return byMap && byAction && byText;
      });
      setVideos(append ? [...videos, ...filtered] : filtered);
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      setLastCursor(lastDoc);
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      setFeedback({ type: 'error', message: "Failed to load videos." });
    } finally {
      setIsFetching(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      setLastCursor(null);
      fetchVideos(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setLastCursor(null);
      fetchVideos(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push('/admin/login');
    }
  }, [user, loading, isLoggingOut, router]);
  
  const resetForm = () => {
    setVideoFile(null);
    setMapa('mirage');
    setPosicao('');
    setAcao('smoke');
    setDestino('');
    setTags('');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setFeedback({ type: 'error', message: 'User not authenticated. Please log in again.' });
      return;
    }
    if (!videoFile || !mapa || !posicao || !acao || !destino || !tags) {
      setFeedback({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }
    setIsProcessing(true);
    setFeedback(null);
    setProgress(0);
    const storageRef = ref(storage, `videos/${Date.now()}-${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(currentProgress);
      },
      (error) => {
        console.error("Erro no upload: ", error);
        setFeedback({ type: 'error', message: 'Upload failed. Check Storage rules and your connection.' });
        setIsProcessing(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const tagsArray = tags.split(',').map((tag) => tag.trim().toLowerCase());
          const videoData = {
            mapa: mapa.toLowerCase(),
            posicao_inicial: posicao.toLowerCase(),
            acao: acao.toLowerCase(),
            destino: destino.toLowerCase(),
            url_video: downloadURL,
            tags: tagsArray,
            createdAt: serverTimestamp(),
          };
          await addDoc(collection(db, 'videos'), videoData);
          setFeedback({ type: 'success', message: 'Video added successfully!' });
          resetForm();
          fetchVideos();
        } catch (dbError) {
          console.error("Erro ao salvar no Firestore: ", dbError);
          setFeedback({ type: 'error', message: 'Failed to save video data.' });
        } finally {
          setIsProcessing(false);
        }
      }
    );
  };

  const handleDelete = async (video: Video) => {
    if (!auth.currentUser) {
      setFeedback({type: 'error', message: 'Session expired. Please log in again.'});
      return;
    }
    setConfirmState({ open: true, target: video });
  };

  const confirmDelete = async () => {
    const video = confirmState.target;
    if (!video) return setConfirmState({ open: false, target: null });
      setIsProcessing(true);
      setFeedback(null);
      try {
        const fileRef = ref(storage, video.url_video);
        await deleteObject(fileRef);
        await deleteDoc(doc(db, 'videos', video.id));
        fetchVideos();
        setFeedback({ type: 'success', message: 'Video deleted successfully.' });
      } catch (error) {
        console.error("Erro ao excluir: ", error);
        setFeedback({ type: 'error', message: 'Failed to delete the video.' });
      } finally {
        setIsProcessing(false);
      setConfirmState({ open: false, target: null });
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await auth.signOut();
      router.replace('/');
    } finally {
      // noop
    }
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingVideo) {
      const { name, value } = e.target;
      setEditingVideo({ ...editingVideo, [name]: value });
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !auth.currentUser) {
      setFeedback({type: 'error', message: 'Session expired. Please log in again.'});
      return;
    }
    setIsProcessing(true);
    setFeedback(null);
    try {
      const docRef = doc(db, 'videos', editingVideo.id);
      const tagsArray = typeof editingVideo.tags === 'string'
        ? (editingVideo.tags as string).split(',').map(tag => tag.trim().toLowerCase())
        : editingVideo.tags;
      const dataToUpdate = {
        mapa: editingVideo.mapa,
        acao: editingVideo.acao,
        posicao_inicial: editingVideo.posicao_inicial,
        destino: editingVideo.destino,
        tags: tagsArray,
      };
      await updateDoc(docRef, dataToUpdate);
      setEditingVideo(null);
      fetchVideos();
      setFeedback({ type: 'success', message: 'Video updated successfully.' });
    } catch (error) {
      console.error("Erro ao atualizar: ", error);
      setFeedback({ type: 'error', message: 'Failed to update the video.' });
    } finally {
        setIsProcessing(false);
    }
  };

  if (loading) {
    return <main className={styles.main}><p>Checking authentication...</p></main>;
  }
  
  if (!user) {
    return null;
  }

  return (
    <main className={styles.main}>
      <div className={styles.panel}>
        {feedback && (
          <div className={`${styles.banner} ${feedback.type === 'success' ? styles.bannerSuccess : styles.bannerError}`}>
            <span>{feedback.message}</span>
            <button className={styles.bannerClose} onClick={() => setFeedback(null)}>✕</button>
          </div>
        )}
        
        <Toolbar
          filters={filters}
          isFetching={isFetching}
          onFiltersChange={(next) => setFilters(prev => ({ ...prev, ...next }))}
          onSearchSubmit={(e) => { e.preventDefault(); fetchVideos(); }}
          onToggleAddForm={() => setIsAddFormVisible(!isAddFormVisible)}
          isAddFormVisible={isAddFormVisible}
        />

        {isAddFormVisible && (
        <div className={styles.addContainer}>
            <UploadForm
              videoFile={videoFile}
              mapa={mapa}
              posicao={posicao}
              acao={acao}
              destino={destino}
              tags={tags}
              isProcessing={isProcessing}
              progress={progress}
              feedback={feedback}
              onVideoFileChange={(f) => setVideoFile(f)}
              onMapaChange={(v) => setMapa(v)}
              onPosicaoChange={(v) => setPosicao(v)}
              onAcaoChange={(v) => setAcao(v)}
              onDestinoChange={(v) => setDestino(v)}
              onTagsChange={(v) => setTags(v)}
              onSubmit={handleUpload}
            />
               </div>
          )}
        
        <div className={styles.listContainer}>
          <h2 className={styles.listTitle}>Manage videos ({videos.length})</h2>
          <VideoTable
            videos={videos as unknown as VideoRow[]}
            isFetching={isFetching}
            onEdit={(v) => setEditingVideo(v as unknown as Video)}
            onDelete={(v) => handleDelete(v as unknown as Video)}
            onLoadMore={() => fetchVideos(true)}
            hasMore={hasMore}
          />
        </div>
        
        <div className={styles.logoutContainer}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.5"/><path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5"/><path d="M15 12H3" stroke="currentColor" strokeWidth="1.5"/></svg>
            Sign out to Home
          </button>
        </div>
        <div className={styles.logoutHelper}>Sign out and go back to the homepage.</div>
      </div>

      {editingVideo && (
        <EditModal
          video={editingVideo as unknown as VideoRow}
          isProcessing={isProcessing}
          onClose={() => setEditingVideo(null)}
          onChange={handleEditChange}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        isOpen={confirmState.open}
        title="Delete video"
        description="This will remove the file from Storage and the record in the database. Continue?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState({ open: false, target: null })}
      />
    </main>
  );
}