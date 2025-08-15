// src/app/page.tsx
'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import styles from './page.module.css';
import Link from 'next/link';

// ============================================================================
// INTERFACE - CONTRATO DE DADOS
// ============================================================================
// Esta interface define exatamente como os dados do vídeo devem ser estruturados
// quando vêm da API. Isso garante que o TypeScript entenda o formato dos dados
// e previna erros em tempo de desenvolvimento.
interface VideoResult {
  url_video: string;      // URL do vídeo no Firebase Storage
  mapa: string;           // Nome do mapa (ex: "mirage", "inferno")
  posicao_inicial: string; // Posição inicial do jogador (ex: "base TR", "CT spawn")
  acao: string;           // Ação realizada (ex: "smoke", "flash", "molotov")
  destino: string;        // Local de destino (ex: "janela", "mid", "B site")
}

export default function Home() {
  // ============================================================================
  // ESTADOS DO COMPONENTE
  // ============================================================================
  // useState é um Hook do React que permite componentes funcionais terem estado
  // Cada estado controla uma parte específica da interface:
  
  // searchTerm: armazena o texto que o usuário digita no campo de busca
  const [searchTerm, setSearchTerm] = useState('');
  
  // videoResult: armazena os dados do vídeo encontrado pela busca
  // null significa que ainda não foi feita uma busca ou não foi encontrado nada
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  
  // isLoading: controla quando mostrar a mensagem "Buscando..."
  // true = está carregando, false = não está carregando
  const [isLoading, setIsLoading] = useState(false);
  
  // error: armazena mensagens de erro para mostrar ao usuário
  // null significa que não há erro
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FUNÇÃO PRINCIPAL DE BUSCA
  // ============================================================================
  // Esta função é executada quando o usuário submete o formulário
  // É assíncrona (async) porque faz uma requisição HTTP para a API
  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    // Previne o comportamento padrão do formulário (recarregar a página)
    event.preventDefault();
    
    // Validação: se o termo de busca estiver vazio, não faz nada
    if (!searchTerm.trim()) return;

    // ============================================================================
    // PREPARAÇÃO PARA NOVA BUSCA
    // ============================================================================
    // Limpa os estados anteriores para mostrar uma busca "limpa"
    setIsLoading(true);        // Mostra "Buscando..."
    setVideoResult(null);      // Remove vídeo anterior
    setError(null);            // Remove erros anteriores

    try {
      // ============================================================================
      // CHAMADA PARA A API
      // ============================================================================
      // fetch é uma função nativa do navegador para fazer requisições HTTP
      // POST porque estamos enviando dados (searchTerm) para o servidor
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indica que estamos enviando JSON
        },
        body: JSON.stringify({ searchTerm }), // Converte o objeto para string JSON
      });

      // ============================================================================
      // PROCESSAMENTO DA RESPOSTA
      // ============================================================================
      // response.ok é true para status 200-299 (sucesso)
      // Se não for ok, significa que houve erro (404, 500, etc.)
      if (!response.ok) {
        // Tenta extrair a mensagem de erro da resposta
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro na busca.');
      }

      // Se chegou aqui, a resposta foi bem-sucedida
      // Converte a resposta JSON de volta para objeto JavaScript
      const data: VideoResult = await response.json();
      setVideoResult(data); // Armazena o vídeo encontrado

    } catch (err: any) {
      // ============================================================================
      // TRATAMENTO DE ERROS
      // ============================================================================
      // catch captura qualquer erro que tenha ocorrido no try
      // err.message contém a mensagem de erro que definimos
      setError(err.message || 'Falha ao se comunicar com o servidor.');
    } finally {
      // ============================================================================
      // LIMPEZA FINAL
      // ============================================================================
      // finally sempre executa, independente de sucesso ou erro
      // Garante que o estado de loading seja sempre desativado
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        
        {/* ============================================================================
            CABEÇALHO DA PÁGINA
        ============================================================================ */}
        <h1 className={styles.title}>
          CS2 Pixels
        </h1>
        <p className={styles.subtitle}>
          Digite a jogada que você procura. Nós mostramos o pixel.
        </p>

        {/* ============================================================================
            FORMULÁRIO DE BUSCA
        ============================================================================ */}
        {/* onSubmit={handleSearch} chama nossa função quando o formulário é enviado */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={searchTerm}                    // Valor controlado pelo estado
            onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o estado quando digita
            placeholder="Ex: Mirage base TR smokar janela..."
            className={styles.searchInput}
          />
          <button
            type="submit"
            className={styles.searchButton}
            // Desabilita o botão durante a busca ou se não há texto
            disabled={isLoading || !searchTerm.trim()}
          >
            <MagnifyingGlassIcon className={styles.searchButtonIcon} />
          </button>
        </form>

        {/* ============================================================================
            ÁREA DE RESULTADO - RENDERIZAÇÃO CONDICIONAL
        ============================================================================ */}
        {/* Esta área muda dinamicamente baseada nos estados do componente */}
        <div className={styles.videoPlaceholder}>
          
          {/* CASO 1: Está carregando - mostra "Buscando..." */}
          {isLoading && (
            <p>Buscando...</p>
          )}

          {/* CASO 2: Houve erro - mostra mensagem de erro em vermelho */}
          {!isLoading && error && (
            <p style={{ color: '#ef4444' }}>{error}</p>
          )}

          {/* CASO 3: Sucesso - mostra o player de vídeo */}
          {!isLoading && !error && videoResult && (
            <video
              key={videoResult.url_video}        // key é importante para React re-renderizar
              controls                              // Mostra controles do player
              autoPlay                              // Inicia automaticamente
              className={styles.videoPlayer}
            >
              <source src={videoResult.url_video} type="video/mp4" />
              Seu navegador não suporta o player de vídeo.
            </video>
          )}

          {/* CASO 4: Estado inicial - mostra mensagem padrão */}
          {!isLoading && !error && !videoResult && (
            <p>Seu vídeo aparecerá aqui.</p>
          )}
        </div>

        {/* ============================================================================
            RODAPÉ COM LINK ADMIN
        ============================================================================ */}
        <footer style={{ marginTop: '4rem', opacity: 0.5 }}>
          <Link href="/admin/dashboard">Acesso Restrito</Link>
        </footer>
      </div>
    </main>
  );
}