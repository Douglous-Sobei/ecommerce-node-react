import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import Card from "./Card";
import { getCategories } from "./ApiCore";
import Checkbox from "./Checkbox";

const Shop = () => {
  const [myFilters, setMyFilters] = useState({
    filters: { category: [], price: [] },
  });
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

  const handleFilters = (filters, filterBy) => {
    // console.log("SHOP", filters, "category");
    const newFilters = { ...myFilters };
    newFilters.filters[filterBy] = filters;

    setMyFilters(newFilters);
  };

  return (
    <Layout
      title="Shop Page"
      description="Search and find books of your choice"
      className="container-fluid"
    >
      {error && <div>{error.message}</div>}
      <div className="row">
        <div className="col-4">
          <h4>Filter by categories</h4>
          <ul>
            <Checkbox
              categories={categories}
              handleFilters={(filters) => handleFilters(filters, "category")}
            />
          </ul>
        </div>
        <div className="col-8">{JSON.stringify(myFilters)}</div>
      </div>
    </Layout>
  );
};

export default Shop;
