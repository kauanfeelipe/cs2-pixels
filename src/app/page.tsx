'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import styles from './page.module.css';
import Link from 'next/link';

// Interface for the video result data structure
interface VideoResult {
  url_video: string;
  mapa: string;
  posicao_inicial: string;
  acao: string;
  destino: string;
}

// Interface for our unified search form state
interface SearchState {
  map: string;
  action: string;
  searchText: string;
  startPosition: string;
}

export default function Home() {
  // ============================================================================
  // COMPONENT STATE (REFACTORED)
  // ============================================================================
  // All form filters and the text input now live in a single state object.
  const [searchState, setSearchState] = useState<SearchState>({
    map: 'mirage',
    action: 'smoke',
    searchText: '',
    startPosition: '',
  });

  // State for the search result and UI feedback
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Generic handler to update our search state object
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // ============================================================================
  // MAIN SEARCH FUNCTION
  // ============================================================================
  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    
    setIsLoading(true);
    setVideoResult(null);
    setError(null);
    setIsFocused(true);
    setIsCollapsed(false);

    try {
      // We send the unified state object directly to the API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mapa: searchState.map,
            acao: searchState.action,
            textoBusca: searchState.searchText,
            posicao_inicial: searchState.startPosition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred during the search.');
      }

      const data: VideoResult = await response.json();
      setVideoResult(data);

    } catch (err: any) {
      setError(err.message || 'Failed to communicate with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreview = () => setIsCollapsed(prev => !prev);

  return (
    <main className={`${styles.main} ${isFocused ? styles.focused : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.bgCanvas}>
        <div className={styles.bgLayer} />
        <div className={styles.bgLayerMirror} />
        <div className={styles.bgGradientOverlay} />
      </div>
      <div className={styles.splitScreen}>

        {/* LEFT PANEL: Controls and Information */}
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
                name="map" // 'name' property is crucial for the handler
                value={searchState.map}
                onChange={handleFilterChange}
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
                name="action" // Correct 'name' property
                value={searchState.action}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="smoke">Smoke</option>
                <option value="flash">Flash</option>
                <option value="molotov">Molotov</option>
                <option value="hegrenade">HE Grenade</option>
              </select>

              <input
                type="text"
                name="startPosition"
                value={searchState.startPosition}
                onChange={handleFilterChange}
                placeholder="Start position "
                className={styles.searchInput}
              />

              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  name="searchText" // Correct 'name' property
                  value={searchState.searchText}
                  onChange={handleFilterChange}
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
              <p className={styles.use_exemplo}>Exemple: bomb-a,base-ct,base-tr,bomb-b,meio,janelao </p>
            </form>
            
            <footer className={styles.footer}>
              <Link href="/admin/dashboard">Restricted Access</Link>
            </footer>
          </div>
        </div>

        {/* RIGHT PANEL: Video Display Area */}
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
              <p>Select the filters to find your pixel.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}