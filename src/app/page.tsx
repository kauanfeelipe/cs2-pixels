// src/app/page.tsx
'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import styles from './page.module.css';
import Link from 'next/link';

interface VideoResult {
  url_video: string;
  mapa: string;
  posicao_inicial: string;
  acao: string;
  destino: string;
}

export default function Home() {
  const [defatultSelectedMap, setDefatultSelectedMap] = useState('mirage');
  const [defatultSelectedAction, setDefatultSelectedAction] = useState('smoke');

  const [searchTerm, setSearchTerm] = useState('');

  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();


    setIsLoading(true);
    setVideoResult(null);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapa: defatultSelectedMap,
          acao: defatultSelectedAction,
          textoBusca: searchTerm,
        }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while searching.');
      }

      const data: VideoResult = await response.json();
      setVideoResult(data);

    } catch (err: any) {
      setError(err.message || 'Failed to communicate with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      { }
      <div className={styles.splitScreen}>

        { }
        <div className={styles.leftPanel}>
          <div className={styles.leftPanelContent}>
            <h1 className={styles.title}>
              CS2 Pixels
            </h1>
            <p className={styles.subtitle}>
              Select the map, the action and refine your search.
            </p>

            <form onSubmit={handleSearch} className={styles.searchHub}>
              <select
                value={defatultSelectedMap}
                onChange={(e) => setDefatultSelectedMap(e.target.value)}
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
                value={defatultSelectedMap}
                onChange={(e) => setDefatultSelectedMap(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="smoke">Smoke</option>
                <option value="flash">Flash</option>
                <option value="molotov">Molotov</option>
                <option value="hegrenade">Grenade</option>
              </select>

              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Position and destination..."
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
              <Link href="/admin/dashboard">Restrict Access</Link>
            </footer>
          </div>
        </div>

        { }
        <div className={styles.rightPanel}>
          <div className={styles.videoPlaceholder}>
            {isLoading && <div className={styles.loader}></div>}
            {!isLoading && error && <p style={{ color: '#ef4444' }}>{error}</p>}
            {!isLoading && !error && videoResult && (
              <video key={videoResult.url_video} controls autoPlay muted loop className={styles.videoPlayer}>
                <source src={videoResult.url_video} type="video/mp4" />
                Your browser does not support the video player.
              </video>
            )}
            {!isLoading && !error && !videoResult && (
              <p>Select filters and find your pixel.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}