import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import Card from "./Card";
import { ApiCore, getCategories } from "../core/ApiCore";

const Shop = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const init = async () => {
    try {
      const data = await getCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Layout
      title="Shop Page"
      description="Search and find books of your choice"
      className="container-fluid"
    >
      {error && <div>{error.message}</div>}
      <div className="row">
        <div className="col-4">{JSON.stringify(categories)}</div>
        <div className="col-8">Right sidebar</div>
      </div>
    </Layout>
  );
};
export default Shop;

