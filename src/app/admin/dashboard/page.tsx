'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import styles from './dashboard.module.css';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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

  // Função centralizada para buscar todos os vídeos e atualizar a lista.
  const fetchVideos = async () => {
    if (!auth.currentUser) return; 
    setIsFetching(true);
    try {
      const videosCollection = collection(db, 'videos');
      const q = query(videosCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const videosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Video));
      setVideos(videosData);
    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      setFeedback({ type: 'error', message: "Não foi possível carregar os vídeos." });
    } finally {
      setIsFetching(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);
  
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
      setFeedback({ type: 'error', message: 'Usuário não autenticado. Faça o login novamente.' });
      return;
    }
    if (!videoFile || !mapa || !posicao || !acao || !destino || !tags) {
      setFeedback({ type: 'error', message: 'Por favor, preencha todos os campos.' });
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
        setFeedback({ type: 'error', message: 'Falha no upload. Verifique as regras de segurança do Storage e sua conexão.' });
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
          setFeedback({ type: 'success', message: 'Vídeo adicionado com sucesso!' });
          resetForm();
          fetchVideos();
        } catch (dbError) {
          console.error("Erro ao salvar no Firestore: ", dbError);
          setFeedback({ type: 'error', message: 'Erro ao salvar os dados do vídeo.' });
        } finally {
          setIsProcessing(false);
        }
      }
    );
  };

  const handleDelete = async (video: Video) => {
    if (!auth.currentUser) {
      setFeedback({type: 'error', message: 'Sessão expirada. Faça login novamente.'});
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este vídeo? Esta ação removerá o arquivo e o registro permanentemente.")) {
      setIsProcessing(true);
      setFeedback(null);
      try {
        // Deleta o arquivo do Storage primeiro
        const fileRef = ref(storage, video.url_video);
        await deleteObject(fileRef);

        // Em seguida, deleta o documento do Firestore
        await deleteDoc(doc(db, 'videos', video.id));
        
        fetchVideos();
        setFeedback({ type: 'success', message: 'Vídeo excluído com sucesso!' });
      } catch (error) {
        console.error("Erro ao excluir: ", error);
        setFeedback({ type: 'error', message: 'Falha ao excluir o vídeo.' });
      } finally {
        setIsProcessing(false);
      }
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
      setFeedback({type: 'error', message: 'Sessão expirada. Faça login novamente.'});
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
      setFeedback({ type: 'success', message: 'Vídeo atualizado com sucesso!' });
    } catch (error) {
      console.error("Erro ao atualizar: ", error);
      setFeedback({ type: 'error', message: 'Falha ao atualizar o vídeo.' });
    } finally {
        setIsProcessing(false);
    }
  };

  if (loading) {
    return <main className={styles.main}><p>Verificando autenticação...</p></main>;
  }
  
  if (!user) {
    return null;
  }

  return (
    <main className={styles.main}>
      <div className={styles.panel}>
        
        <div className={styles.addContainer}>
          <button onClick={() => setIsAddFormVisible(!isAddFormVisible)} className={styles.toggleButton}>
            {isAddFormVisible ? 'Fechar Formulário' : '➕ Adicionar Novo Pixel'}
          </button>
          {isAddFormVisible && (
            <form onSubmit={handleUpload} className={styles.addForm}>
               <div className={styles.formGrid}>
                 <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="file-input" className={styles.label}>Arquivo de Vídeo (.mp4)</label><label htmlFor="file-input" className={styles.fileInputLabel}>{videoFile ? `Selecionado: ${videoFile.name}` : 'Clique para selecionar um vídeo'}</label><input id="file-input" type="file" accept="video/mp4" onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)} style={{ display: 'none' }} /></div>
                 <div className={styles.formGroup}><label htmlFor="mapa" className={styles.label}>Mapa</label><select id="mapa" value={mapa} onChange={e => setMapa(e.target.value)} className={styles.select}><option value="mirage">Mirage</option><option value="inferno">Inferno</option><option value="dust2">Dust 2</option><option value="nuke">Nuke</option><option value="overpass">Overpass</option><option value="vertigo">Vertigo</option><option value="ancient">Ancient</option></select></div>
                 <div className={styles.formGroup}><label htmlFor="acao" className={styles.label}>Ação</label><select id="acao" value={acao} onChange={e => setAcao(e.target.value)} className={styles.select}><option value="smoke">Smoke</option><option value="flash">Flash</option><option value="molotov">Molotov</option><option value="hegrenade">HE Grenade</option></select></div>
                 <div className={styles.formGroup}><label htmlFor="posicao" className={styles.label}>Posição Inicial</label><input id="posicao" type="text" value={posicao} onChange={e => setPosicao(e.target.value)} className={styles.input} /></div>
                 <div className={styles.formGroup}><label htmlFor="destino" className={styles.label}>Local de Destino</label><input id="destino" type="text" value={destino} onChange={e => setDestino(e.target.value)} className={styles.input} /></div>
                 <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="tags" className={styles.label}>Tags (separadas por vírgula)</label><textarea id="tags" value={tags} onChange={e => setTags(e.target.value)} className={styles.textarea} /></div>
               </div>
               <div className={styles.progressContainer}>
                 {isProcessing && <progress value={progress} max="100" className={styles.progressBar} />}
                 {feedback && (<div className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.message}</div>)}
               </div>
               <button type="submit" disabled={isProcessing} className={styles.buttonPrimary} style={{marginTop: '1.5rem'}}>{isProcessing ? `Enviando... ${Math.round(progress)}%` : 'Adicionar Vídeo'}</button>
            </form>
          )}
        </div>
        
        <div className={styles.listContainer}>
          <h2 className={styles.listTitle}>Gerenciar Vídeos Cadastrados ({videos.length})</h2>
          {isFetching ? <p>Carregando vídeos...</p> : (
            <ul className={styles.videoList}>
              {videos.length === 0 ? <p>Nenhum vídeo cadastrado.</p> :
                videos.map(video => (
                  <li key={video.id} className={styles.videoListItem}>
                    <div className={styles.videoInfo}><strong>{video.mapa.toUpperCase()}</strong> - {video.acao} para {video.destino}<span>(de {video.posicao_inicial})</span></div>
                    <div className={styles.videoActions}><button onClick={() => setEditingVideo(video)} className={styles.iconButton}><PencilSquareIcon className={styles.icon} /></button><button onClick={() => handleDelete(video)} className={`${styles.iconButton} ${styles.deleteButton}`}><TrashIcon className={styles.icon} /></button></div>
                  </li>
                ))
              }
            </ul>
          )}
        </div>
        
        <button onClick={() => auth.signOut()} className={styles.buttonSecondary} style={{alignSelf: 'flex-start', marginTop: '2rem'}}>Sair</button>
      </div>

      {editingVideo && (
        <div className={styles.modalBackdrop} onClick={() => setEditingVideo(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Editando Vídeo</h3>
            <form onSubmit={handleUpdate}>
              <div className={styles.formGrid}>
                 <div className={styles.formGroup}><label htmlFor="edit-mapa" className={styles.label}>Mapa</label><select id="edit-mapa" name="mapa" value={editingVideo.mapa} onChange={handleEditChange} className={styles.select}><option value="mirage">Mirage</option><option value="inferno">Inferno</option><option value="dust2">Dust 2</option><option value="nuke">Nuke</option><option value="overpass">Overpass</option><option value="vertigo">Vertigo</option><option value="ancient">Ancient</option></select></div>
                 <div className={styles.formGroup}><label htmlFor="edit-acao" className={styles.label}>Ação</label><select id="edit-acao" name="acao" value={editingVideo.acao} onChange={handleEditChange} className={styles.select}><option value="smoke">Smoke</option><option value="flash">Flash</option><option value="molotov">Molotov</option><option value="hegrenade">HE Grenade</option></select></div>
                 <div className={styles.formGroup}><label htmlFor="edit-posicao" className={styles.label}>Posição Inicial</label><input id="edit-posicao" name="posicao_inicial" value={editingVideo.posicao_inicial} onChange={handleEditChange} className={styles.input} /></div>
                 <div className={styles.formGroup}><label htmlFor="edit-destino" className={styles.label}>Local de Destino</label><input id="edit-destino" name="destino" value={editingVideo.destino} onChange={handleEditChange} className={styles.input} /></div>
                 <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="edit-tags" className={styles.label}>Tags (separadas por vírgula)</label><textarea id="edit-tags" name="tags" value={Array.isArray(editingVideo.tags) ? editingVideo.tags.join(', ') : editingVideo.tags} onChange={handleEditChange} className={styles.textarea} /></div>
              </div>
              <div className={styles.modalActions}><button type="button" onClick={() => setEditingVideo(null)} className={styles.buttonSecondary}>Cancelar</button><button type="submit" className={styles.buttonPrimary} disabled={isProcessing}>{isProcessing ? 'Salvando...' : 'Salvar Alterações'}</button></div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}