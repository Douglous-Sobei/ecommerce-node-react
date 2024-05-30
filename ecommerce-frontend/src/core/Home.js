import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { getProducts } from "./ApiCore";

const Home = () => {
  const [productsBySell, setProductsBySell] = useState([]);
  const [productsByArrival, setProductsByArrival] = useState([]);
  const [error, setError] = useState(false);

  const loadProductsBySell = () => {
    getProducts("sold").then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProductsBySell(data);
      }
    });
  };

  const loadProductsByArrival = () => {
    getProducts("createdAt").then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProductsByArrival(data);
      }
    });
  };

  useEffect(() => {
    loadProductsBySell();
    loadProductsByArrival();
  }, []);

  return (
    <Layout title="Home Page" description="Node React E-commerce App">
      {JSON.stringify(productsBySell)}
      <hr />
      {JSON.stringify(productsByArrival)}
    </Layout>
  );
};
export default Home;
