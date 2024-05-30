import React from "react";
import Layout from "../core/Layout";
import Card from "./Card";

const Shop = () => {
  return (
    <Layout
      title="Shop"
      description="Search and find books of your choice"
      className="container-fluid"
    >
      <div className="row">
        <div className="col-4">left sidebar</div>
        <div className="col-8">right sidebar</div>
      </div>
    </Layout>
  );
};
export default Shop;
