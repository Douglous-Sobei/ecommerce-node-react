import React from "react";
import { Link, withRouter } from "react-router-dom";
import { signout } from "../auth";

const Menu = ({ history }) => {
  const isActive = (path) => {
    if (history.location.pathname === path) {
      return { color: "#007bff" }; // Change the color to a shade of blue
    } else {
      return { color: "#ffffff" };
    }
  };

  return (
    <div>
      <ul className="nav nav-tabs bg-dark">
        <li className="nav-item">
          <Link className="nav-link" style={isActive(history, "/")} to="/">
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link"
            style={isActive(history, "/signin")}
            to="/signin"
          >
            Signin
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link"
            style={isActive(history, "/signup")}
            to="/signup"
          >
            Signup
          </Link>
        </li>
        <li className="nav-item">
          <span
            className="nav-link"
            style={{ cursor: "pointer", color: "#ffffff" }}
            onClick={() => signout(() => history.push("/"))}
          >
            signout
          </span>
        </li>
      </ul>
    </div>
  );
};

export default withRouter(Menu);
