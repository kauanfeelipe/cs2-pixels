// src/app/api/search/route.ts

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, Query, DocumentData } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // ============================================================================
    // ETAPA 1: EXTRAÇÃO E VALIDAÇÃO DOS DADOS DE ENTRADA (ATUALIZADA)
    // ============================================================================
    const body = await req.json();
    
    // MUDANÇA: Desestruturamos o novo objeto com mapa, acao e textoBusca
    const { mapa, acao, textoBusca }: { mapa: string; acao: string; textoBusca: string } = body;

    // Validação dos filtros obrigatórios
    if (!mapa || !acao) {
      return NextResponse.json(
        { error: 'Mapa e Ação são obrigatórios' },
        { status: 400 }
      );
    }

    // ============================================================================
    // ETAPA 2: PROCESSAMENTO DO TERMO DE BUSCA (TEXTO LIVRE)
    // ============================================================================
    // MUDANÇA: O processamento de keywords agora é aplicado apenas ao textoBusca
    const textKeywords = textoBusca
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // ============================================================================
    // ETAPA 3: CONSTRUÇÃO DA CONSULTA OTIMIZADA NO FIRESTORE
    // ============================================================================
    const videosCollection = collection(db, 'videos');

    // MUDANÇA: A consulta agora é construída em etapas.
    // Começamos com uma lista de filtros que sempre serão aplicados.
    const queryConstraints = [
      where('mapa', '==', mapa.toLowerCase()),
      where('acao', '==', acao.toLowerCase()),
    ];

    // Se o usuário digitou algo no campo de texto, adicionamos o filtro de tags.
    // Isso torna a busca por tags opcional, mas refina o resultado se presente.
    if (textKeywords.length > 0) {
      queryConstraints.push(where('tags', 'array-contains-any', textKeywords));
    }

    // Montamos a query final com todos os filtros + o limite de 1 resultado
    const q = query(videosCollection, ...queryConstraints, limit(1));

    // ============================================================================
    // ETAPA 4 E 5: EXECUÇÃO E PROCESSAMENTO (Lógica inalterada)
    // ============================================================================
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: 'Nenhum vídeo encontrado com esses critérios.' },
        { status: 404 }
      );
    }

    const videoData = querySnapshot.docs[0].data();

    return NextResponse.json(videoData, { status: 200 });
    
  } catch (error) {
    console.error('Erro na API de busca:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}