import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import Card from "./Card";
import { ApiCore, getCategories } from "../core/ApiCore";

const Shop = () => {
  return (
    <Layout
      title="Shop Page"
      description="Search and find books of your choice"
    >
      <div className="row">
        <div className="col-4">Left sidebar</div>
        <div className="col-8">Right sidebar</div>
      </div>
    </Layout>
  );
};
export default Shop;
