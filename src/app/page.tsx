import Link from 'next/link'

export default async function Home() {

    // Show landing page for unauthenticated users
    return (
      <main >
        <h1>Welcome to M-AGENT</h1>
        <div className="cta-buttons">
          <Link 
            href="/login" 
            className="button primary"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="button secondary"
          >
            Register
          </Link>
        </div>
      </main>
    )
}