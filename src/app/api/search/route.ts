/**
 * API Route: /api/search
 * 
 * Processa requisições de busca de vídeos do CS2 no Firestore.
 * Recebe filtros (mapa, ação, posição inicial) e texto livre para busca por tags.
 * Retorna o primeiro vídeo que corresponda aos critérios.
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  QueryConstraint 
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

// ============================================================================
// TIPOS
// ============================================================================

interface SearchRequest {
  mapa: string;
  acao: string;
  textoBusca?: string;
  posicao_inicial?: string;
}

interface ErrorResponse {
  error: string;
}

interface MessageResponse {
  message: string;
}

// CONSTANTES

const VIDEOS_COLLECTION = 'videos';
const QUERY_LIMIT = 1;
const MIN_KEYWORD_LENGTH = 2;

const ERROR_MESSAGES = {
  MISSING_REQUIRED_FIELDS: 'Mapa e Ação são obrigatórios',
  NO_VIDEOS_FOUND: 'Nenhum vídeo encontrado com esses critérios.',
  INTERNAL_SERVER_ERROR: 'Ocorreu um erro interno no servidor.',
  INVALID_REQUEST_BODY: 'Corpo da requisição inválido ou malformado.'
} as const;

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/** Normaliza string para minúsculas e remove espaços nas extremidades. */
function normalizeString(value: string): string {
  return value.toLowerCase().trim();
}

/** Extrai palavras-chave válidas (3+ caracteres) do texto de busca. */
function extractKeywords(searchText: string): string[] {
  if (!searchText || searchText.trim().length === 0) {
    return [];
  }

  return searchText
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > MIN_KEYWORD_LENGTH);
}

/** Valida se os campos obrigatórios estão presentes e não vazios. */
function validateRequiredFields(mapa: string, acao: string): boolean {
  return Boolean(mapa && acao && mapa.trim().length > 0 && acao.trim().length > 0);
}

/** Constrói os filtros da query do Firestore baseado nos parâmetros de busca. */
function buildQueryConstraints(params: {
  mapa: string;
  acao: string;
  posicao_inicial?: string;
  keywords: string[];
}): QueryConstraint[] {
  const constraints: QueryConstraint[] = [
    where('mapa', '==', normalizeString(params.mapa)),
    where('acao', '==', normalizeString(params.acao)),
  ];

  // Filtro opcional: posição inicial
  if (params.posicao_inicial && params.posicao_inicial.trim().length > 0) {
    constraints.push(
      where('posicao_inicial', '==', normalizeString(params.posicao_inicial))
    );
  }

  // Filtro opcional: busca por tags (array-contains-any)
  if (params.keywords.length > 0) {
    constraints.push(
      where('tags', 'array-contains-any', params.keywords)
    );
  }

  return constraints;
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

/**
 * Handler da rota POST /api/search
 * 
 * Fluxo:
 * 1. Valida dados de entrada (mapa e acao obrigatórios)
 * 2. Processa texto de busca em palavras-chave
 * 3. Constrói query otimizada no Firestore
 * 4. Executa consulta e retorna resultado
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // ETAPA 1: Extração e validação dos dados de entrada
    let requestBody: SearchRequest;
    
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return NextResponse.json<ErrorResponse>(
        { error: ERROR_MESSAGES.INVALID_REQUEST_BODY },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { 
      mapa = '', 
      acao = '', 
      textoBusca = '', 
      posicao_inicial = '' 
    } = requestBody;

    if (!validateRequiredFields(mapa, acao)) {
      return NextResponse.json<ErrorResponse>(
        { error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // ETAPA 2: Processamento do termo de busca
    const keywords = extractKeywords(textoBusca);

    // ETAPA 3: Construção da query no Firestore
    const videosCollection = collection(db, VIDEOS_COLLECTION);
    const queryConstraints = buildQueryConstraints({
      mapa,
      acao,
      posicao_inicial,
      keywords,
    });

    const firestoreQuery = query(
      videosCollection,
      ...queryConstraints,
      limit(QUERY_LIMIT)
    );

    // ETAPA 4: Execução da consulta
    const querySnapshot = await getDocs(firestoreQuery);

    // ETAPA 5: Processamento e retorno dos resultados
    if (querySnapshot.empty) {
      return NextResponse.json<MessageResponse>(
        { message: ERROR_MESSAGES.NO_VIDEOS_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const videoData = querySnapshot.docs[0].data();
    return NextResponse.json(videoData, { status: HTTP_STATUS.OK });

  } catch (error) {
    console.error('Erro na API de busca:', error);
    return NextResponse.json<ErrorResponse>(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
