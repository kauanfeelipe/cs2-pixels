// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Importa o componente de Link
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Importa o ícone
import styles from './login.module.css'; // Usa o novo arquivo CSS

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Restricted Access</h1>

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.input}
              required
            />
          </div>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          <ArrowLeftIcon className={styles.backIcon} />
          Back to homepage
        </Link>
      </div>
    </main>
  );
}