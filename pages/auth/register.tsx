import { getCsrfToken, signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import styles from "../../styles/Register.module.css";
import { FormEvent } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export default function register({ csrfToken }: { csrfToken: string }) {
  const cmpPasswords = () => {
    const password = getInputValue("password");
    const confirmPassword = getInputValue("password-confirm");
    if (password === confirmPassword) {
      return password;
    } else alert("Passwords don't match");
  };

  const getInputValue = (id: string) => {
    return (document.getElementById(id) as HTMLInputElement).value;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const password = cmpPasswords();
    if (password) {
      const email = getInputValue("email");
      const csrf = getInputValue("csrfToken");
      const response = await axios.post("/api/auth/register", {
        email,
        password,
        csrfToken: csrf,
      });
      if (response.status == 200) {
        if (response.data.success) {
          await signIn("credentials", { email, password });
        } else alert(response.data.message);
      } else alert(response.data);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Register</h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <form method="post" action="/api/auth/register" onSubmit={handleSubmit}>
          <input
            name="csrfToken"
            type="hidden"
            id="csrfToken"
            defaultValue={csrfToken}
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className={styles.form_input}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            required
            className={styles.form_input}
          />
          <label htmlFor="password-confirm">Confirm Password</label>
          <input
            type="password"
            id="password-confirm"
            required
            className={styles.form_input}
          />
          <div style={{ textAlign: "center" }}>
            <button type="submit">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
};
