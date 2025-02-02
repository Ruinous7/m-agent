// generate a layout for the auth pages
import styles from "@/styles/auth.module.scss";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.formContainer}>{children}</div>
    </div>
  );
}
