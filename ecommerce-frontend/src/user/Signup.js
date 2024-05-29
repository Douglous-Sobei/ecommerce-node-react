import React, { useState } from "react";
import Layout from "../core/Layout";
import { signup } from "../auth"; // Import the signup function from the auth folder
import { Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    error: "",
    success: false,
  });

  const { name, email, password, error, success } = formData;

  const handleChange = (name) => (event) => {
    setFormData({ ...formData, error: false, [name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormData({ ...formData, error: false });

    // Call the signup function from the auth folder
    signup({ name, email, password })
      .then((data) => {
        if (data.error) {
          setFormData({ ...formData, error: data.error, success: false });
        } else {
          setFormData({
            ...formData,
            name: "",
            email: "",
            password: "",
            error: "",
            success: true,
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

  const showSuccess = () => (
    <div
      className="alert alert-success"
      style={{ display: success ? "" : "none" }}
    >
      New account was created. Please <Link to="/signin">Sign in</Link>.
    </div>
  );

  const signUpForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="text-muted">Name</label>
        <input
          onChange={handleChange("name")}
          type="text"
          className="form-control"
          placeholder="Type your name"
          value={name}
        />
      </div>
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
        Submit
      </button>
    </form>
  );

  return (
    <Layout
      title="Signup Page"
      description="Node React E-commerce App"
      className="container col-md-8 offset-md-2"
    >
      {showSuccess()}
      {showError()}
      {signUpForm()}
    </Layout>
  );
};

export default Signup;
