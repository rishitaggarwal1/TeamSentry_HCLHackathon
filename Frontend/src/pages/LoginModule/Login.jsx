import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import emailIcon from "../../assets/img/email.svg";
import passwordIcon from "../../assets/img/password.svg";
import styles from "./SignUp.module.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notify } from "../../utils/toast";
import { authService } from "../../auth/auth.service";

export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      notify("Logged in successfully", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Invalid credentials";
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.formLogin} onSubmit={submitHandler} autoComplete="off">
        <h2>Sign In</h2>

        <div>
          <div>
            <input
              type="text"
              name="email"
              value={data.email}
              placeholder="E-mail"
              onChange={changeHandler}
              autoComplete="off"
            />
            <img src={emailIcon} alt="" />
          </div>
        </div>

        <div>
          <div>
            <input
              type="password"
              name="password"
              value={data.password}
              placeholder="Password"
              onChange={changeHandler}
              autoComplete="off"
            />
            <img src={passwordIcon} alt="" />
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <span style={{ color: "#a29494", textAlign: "center", display: "inline-block", width: "100%" }}>
            Don't have an account? <Link to="/signup">Create account</Link>
          </span>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
