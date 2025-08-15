// src/lib/firebase.ts

// ============================================================================
// IMPORTS DO FIREBASE
// ============================================================================
// Estes são os módulos principais que vamos usar do Firebase:
import { initializeApp, getApps } from "firebase/app";        // App principal
import { getFirestore } from "firebase/firestore";            // Banco de dados
import { getStorage } from "firebase/storage";                // Armazenamento de arquivos
import { getAuth } from "firebase/auth";                      // Autenticação de usuários

// ============================================================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================================================
// Este objeto contém todas as credenciais necessárias para conectar ao Firebase
// IMPORTANTE: Estas credenciais vêm do arquivo .env.local (não commitar!)
const firebaseConfig = {
  // Chave da API - identifica seu projeto no Firebase
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  
  // Domínio de autenticação - onde os usuários fazem login
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  
  // ID do projeto - identificador único do seu projeto
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  
  // Bucket de storage - onde os vídeos são armazenados
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  
  // ID do remetente de mensagens (usado para notificações push)
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  
  // ID do app - identificador da aplicação
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ============================================================================
// INICIALIZAÇÃO DO APP FIREBASE
// ============================================================================
// getApps() retorna um array com todos os apps Firebase já inicializados
// Se não houver nenhum (length === 0), criamos um novo com initializeApp()
// Se já existir, reutilizamos o primeiro (getApps()[0])
// 
// Isso previne múltiplas inicializações do Firebase, que pode causar erros
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ============================================================================
// SERVIÇOS EXPORTADOS
// ============================================================================
// Exportamos os serviços que vamos usar em outras partes do projeto:

// db: instância do Firestore para operações de banco de dados
const db = getFirestore(app);

// storage: instância do Storage para upload/download de arquivos
const storage = getStorage(app);

// auth: instância do Auth para login/logout de usuários
const auth = getAuth(app);

// Exportamos tudo para ser usado em outros arquivos
export { app, db, storage, auth };