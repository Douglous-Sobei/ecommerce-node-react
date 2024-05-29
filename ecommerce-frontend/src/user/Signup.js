import React, { useState } from "react";
import Layout from "../core/Layout";
import axios from "axios";

import { API } from "../Config";

const Signup = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    error: "",
    success: false,
  });

  const { name, email, password, success, error } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const signup = (user) => {
    // console.log({ name, email, password });
    axios
      .post(`${API}/signup`, { name, email, password })
      .then((response) => {
        if (response.data.error) {
          setValues({ ...values, error: response.data.error, success: false });
        } else {
          setValues({
            ...values,
            name: "",
            email: "",
            password: "",
            error: "",
            success: true,
          });
        }
      })
      .catch((error) => console.log(error));
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    signup({ name, email, password });
  };

  const signUpForm = () => {
    return (
      <form>
        <div className="form-group">
          <label className="text-muted">Name</label>
          <input
            onChange={handleChange("name")}
            type="text"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="text-muted">Email</label>
          <input
            onChange={handleChange("email")}
            type="email"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="text-muted">Password</label>
          <input
            onChange={handleChange("password")}
            type="password"
            className="form-control"
          />
        </div>
        <button onClick={clickSubmit} className="btn btn-primary">
          Submit
        </button>
      </form>
    );
  };
  return (
    <Layout
      title="Signup Page"
      description="Node React E-commerce App"
      className="container col-md-8 offset-md-2"
    >
      {signUpForm()}

      {JSON.stringify(values)}
    </Layout>
  );
};

export default Signup;
