// src/app/api/search/route.ts

import { db } from '@/lib/firebase'; // Nosso arquivo de conexão com o Firebase
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// ============================================================================
// FUNÇÃO PRINCIPAL DA API
// ============================================================================
// Esta função é executada automaticamente pelo Next.js quando recebemos
// uma requisição POST para /api/search
// 
// IMPORTANTE: Em Next.js App Router, o nome da função DEVE ser POST
// para responder a requisições POST. Se fosse GET, seria export async function GET
export async function POST(req: Request) {
  try {
    // ============================================================================
    // ETAPA 1: EXTRAÇÃO E VALIDAÇÃO DOS DADOS DE ENTRADA
    // ============================================================================
    // req.json() converte o corpo da requisição (que vem como JSON) 
    // de volta para um objeto JavaScript
    const body = await req.json();
    
    // Desestruturação: extrai a propriedade searchTerm do objeto body
    // O tipo { searchTerm: string } garante que searchTerm seja uma string
    const { searchTerm }: { searchTerm: string } = body;

    // Validação básica: verifica se o termo de busca foi fornecido
    // Se não foi, retorna erro 400 (Bad Request) com mensagem explicativa
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'Termo de busca é obrigatório' },
        { status: 400 }
      );
    }

    // ============================================================================
    // ETAPA 2: PROCESSAMENTO DO TERMO DE BUSCA
    // ============================================================================
    // Transforma o texto de entrada em palavras-chave para a busca
    const keywords = searchTerm
      .toLowerCase()                    // Converte tudo para minúsculas (case-insensitive)
      .split(/\s+/)                     // Divide por espaços (regex \s+ = um ou mais espaços)
      .filter((word) => word.length > 2); // Remove palavras muito pequenas (ex: "a", "o", "de")

    // Validação: se não sobrou nenhuma palavra-chave válida, retorna erro
    if (keywords.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma palavra-chave válida encontrada' },
        { status: 400 }
      );
    }

    // ============================================================================
    // ETAPA 3: CONSTRUÇÃO DA CONSULTA NO FIRESTORE
    // ============================================================================
    // collection(db, 'videos') cria uma referência para a coleção 'videos' no Firestore
    // É como abrir uma pasta no banco de dados
    const videosCollection = collection(db, 'videos');

    // query() constrói uma consulta complexa no Firestore
    // where('tags', 'array-contains-any', keywords) significa:
    // "encontre documentos onde o campo 'tags' (que é um array) contenha
    // QUALQUER uma das palavras em 'keywords'"
    const q = query(
      videosCollection,
      where('tags', 'array-contains-any', keywords), // Busca por tags
      limit(1)                                       // Limita a 1 resultado (otimização)
    );

    // ============================================================================
    // ETAPA 4: EXECUÇÃO DA CONSULTA
    // ============================================================================
    // getDocs(q) executa a consulta e retorna um "snapshot" com os resultados
    // await é necessário porque getDocs é uma operação assíncrona (demora)
    const querySnapshot = await getDocs(q);

    // ============================================================================
    // ETAPA 5: PROCESSAMENTO DOS RESULTADOS
    // ============================================================================
    // querySnapshot.empty é true se nenhum documento foi encontrado
    if (querySnapshot.empty) {
      // Retorna erro 404 (Not Found) com mensagem amigável
      return NextResponse.json(
        { message: 'Nenhum vídeo encontrado.' },
        { status: 404 }
      );
    }

    // Se chegou aqui, encontrou pelo menos um documento
    // querySnapshot.docs[0] pega o primeiro documento (índice 0)
    // .data() extrai os dados do documento
    const videoData = querySnapshot.docs[0].data();

    // Retorna os dados do vídeo com status 200 (OK)
    return NextResponse.json(videoData, { status: 200 });
    
  } catch (error) {
    // ============================================================================
    // TRATAMENTO DE ERROS GERAIS
    // ============================================================================
    // catch captura qualquer erro que tenha ocorrido no try
    // console.error registra o erro no console do servidor para debug
    console.error('Erro na API de busca:', error);
    
    // Retorna erro 500 (Internal Server Error) com mensagem genérica
    // Não retornamos detalhes do erro para o usuário por segurança
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}