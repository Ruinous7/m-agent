'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './register.module.scss'

interface RegisterForm {
  email: string
  password: string
  name: string  // Additional user data
}

// Add password validation
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  return null
}

export default function Register() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
  
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      // 1. Sign up with Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: formData.name,
          }
        }
      })

      console.log('authData', authData)
  
      if (authError) throw authError
  
      // Store registration data in localStorage to be used after email confirmation
      localStorage.setItem('registrationData', JSON.stringify({
        name: formData.name,
        email: formData.email,
      }))

      setFormData({
        email: '',
        password: '',
        name: ''
      })
  
      router.push('/check-email')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={styles.container}>
      <form onSubmit={handleRegister} className={styles.form} autoComplete="off" >
        <h1>Create Account</h1>
        {error && <div className={styles.error}>{error}</div>}
        
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className={styles.links}>
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </form>
    </div>
  )
}