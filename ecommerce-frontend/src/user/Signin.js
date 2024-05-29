// Signin.js

import React, { useState } from "react";
import Layout from "../core/Layout";
import { signin, authenticate, isAuthenticated } from "../auth";
import { Redirect } from "react-router-dom";

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    error: "",
    loading: false,
    redirectToReferrer: false,
  });

  const { email, password, loading, error, redirectToReferrer } = formData;

  const { user } = isAuthenticated();

  const handleChange = (name) => (event) => {
    setFormData({ ...formData, error: false, [name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormData({ ...formData, error: false, loading: true });

    signin({ email, password })
      .then((data) => {
        if (data.error) {
          setFormData({ ...formData, error: data.error, loading: false });
        } else {
          // Authenticate user and redirect
          authenticate(data, () => {
            setFormData({
              ...formData,
              redirectToReferrer: true,
            });
          });
        }
      })
      .catch((err) => console.error(err));
  };

  const showError = () => (
    <div
      className="alert alert-danger"
      style={{ display: error ? "" : "none" }}
    >
      {error}
    </div>
  );

  const showLoading = () =>
    loading && (
      <div className="alert alert-info">
        <h2>Loading...</h2>
      </div>
    );

  const redirectUser = () => {
    if (redirectToReferrer) {
      if (user && user.role === 1) {
        return <Redirect to="/admin/dashboard" />;
      } else {
        return <Redirect to="/user/dashboard" />;
      }
    }
  };

  const signInForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="text-muted">Email</label>
        <input
          onChange={handleChange("email")}
          type="email"
          className="form-control"
          placeholder="Type your email"
          value={email}
        />
      </div>
      <div className="form-group">
        <label className="text-muted">Password</label>
        <input
          onChange={handleChange("password")}
          type="password"
          className="form-control"
          placeholder="Type your password"
          value={password}
        />
      </div>
      <button type="submit" className="btn btn-block btn-primary">
        Sign In
      </button>
    </form>
  );

  return (
    <Layout
      title="Signin Page"
      description="Node React E-commerce App"
      className="container col-md-8 offset-md-2"
    >
      {showLoading()}
      {showError()}
      {signInForm()}
      {redirectUser()}
    </Layout>
  );
};

export default Signin;
