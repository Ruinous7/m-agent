'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import styles from './login.module.scss'

interface LoginFormState {
  email: string
  password: string
  loading: boolean
  error?: string
}

export default function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    loading: false
  })
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState(prev => ({ ...prev, loading: true, error: undefined }))

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      })

      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    } finally {
      setFormState(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Sign in to your account</h2>
        
        {formState.error && (
          <div className={styles.errorMessage}>
            {formState.error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <input
              type="email"
              placeholder="Email"
              value={formState.email}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <input
              type="password"
              placeholder="Password"
              value={formState.password}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={formState.loading}
            className={styles.submitButton}
          >
            {formState.loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}