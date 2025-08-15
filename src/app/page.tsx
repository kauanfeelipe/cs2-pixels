// src/app/page.tsx
'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import styles from './page.module.css';
import Link from 'next/link';

// ============================================================================
// INTERFACE - CONTRATO DE DADOS
// ============================================================================
// A interface continua a mesma, pois o resultado final que esperamos é um vídeo.
interface VideoResult {
  url_video: string;
  mapa: string;
  posicao_inicial: string;
  acao: string;
  destino: string;
}

export default function Home() {
  // ============================================================================
  // ESTADOS DO COMPONENTE
  // ============================================================================
  // MUDANÇA: Adicionamos estados para controlar os novos filtros de mapa e ação.
  const [selectedMap, setSelectedMap] = useState('mirage'); // Mapa selecionado no dropdown
  const [selectedAction, setSelectedAction] = useState('smoke'); // Ação selecionada

  // searchTerm agora armazena apenas o texto livre (posição, destino, etc.)
  const [searchTerm, setSearchTerm] = useState('');
  
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FUNÇÃO PRINCIPAL DE BUSCA
  // ============================================================================
  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validação: agora a busca pode ser feita mesmo sem texto, apenas com os filtros.
    // A validação de "preencha tudo" pode ser feita no botão se desejado.
    
    setIsLoading(true);
    setVideoResult(null);
    setError(null);

    try {
      // ============================================================================
      // CHAMADA PARA A API (ATUALIZADA)
      // ============================================================================
      // MUDANÇA: O corpo (body) da requisição agora envia um objeto estruturado
      // com os valores dos filtros e o texto da busca.
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapa: selectedMap,
          acao: selectedAction,
          textoBusca: searchTerm, // O antigo searchTerm agora é textoBusca
        }),
      });

      // ============================================================================
      // PROCESSAMENTO DA RESPOSTA (Lógica inalterada)
      // ============================================================================
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro na busca.');
      }

      const data: VideoResult = await response.json();
      setVideoResult(data);

    } catch (err: any) {
      setError(err.message || 'Falha ao se comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

return (
  <main className={styles.main}>
    {/* O novo contêiner principal que divide a tela */}
    <div className={styles.splitScreen}>

      {/* PAINEL ESQUERDO (30%): Controles e Informações */}
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelContent}>
          <h1 className={styles.title}>
            CS2 Pixels
          </h1>
          <p className={styles.subtitle}>
            Selecione o mapa, a ação e refine sua busca.
          </p>

          <form onSubmit={handleSearch} className={styles.searchHub}>
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="mirage">Mirage</option>
              <option value="inferno">Inferno</option>
              <option value="dust2">Dust 2</option>
              <option value="nuke">Nuke</option>
              <option value="overpass">Overpass</option>
              <option value="vertigo">Vertigo</option>
              <option value="ancient">Ancient</option>
            </select>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="smoke">Smoke</option>
              <option value="flash">Flash</option>
              <option value="molotov">Molotov</option>
              <option value="hegrenade">HE Grenade</option>
            </select>

            <div className={styles.searchInputContainer}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Posição e destino..."
                className={styles.searchInput}
              />
              <button
                type="submit"
                className={styles.searchButton}
                disabled={isLoading}
              >
                <MagnifyingGlassIcon className={styles.searchButtonIcon} />
              </button>
            </div>
          </form>
          
          <footer className={styles.footer}>
            <Link href="/admin/dashboard">Acesso Restrito</Link>
          </footer>
        </div>
      </div>

      {/* PAINEL DIREITO (70%): Área de Visualização do Vídeo */}
      <div className={styles.rightPanel}>
        <div className={styles.videoPlaceholder}>
          {isLoading && <div className={styles.loader}></div>}
          {!isLoading && error && <p style={{ color: '#ef4444' }}>{error}</p>}
          {!isLoading && !error && videoResult && (
            <video key={videoResult.url_video} controls autoPlay muted loop className={styles.videoPlayer}>
              <source src={videoResult.url_video} type="video/mp4" />
              Seu navegador não suporta o player de vídeo.
            </video>
          )}
          {!isLoading && !error && !videoResult && (
            <p>Selecione os filtros e encontre seu pixel.</p>
          )}
        </div>
      </div>

    </div>
  </main>
);
}