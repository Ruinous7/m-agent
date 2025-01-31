import Link from "next/link";
import styles from "../register/register.module.scss"

export default function CheckEmail() {
    return (
      <div className={styles.container}>
        <div className={styles.message}>
          <h1>Check Your Email</h1>
          <p>
            We&apos;ve sent you a confirmation email. Please check your inbox and click
            the verification link to complete your registration.
          </p>
          <div className={styles.links}>
            <Link href="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    )
  }