import React from "react";
import { Link, withRouter } from "react-router-dom";

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
          <Link className="nav-link" style={isActive("/")} to="/">
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" style={isActive("/signin")} to="/signin">
            Signin
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" style={isActive("/signup")} to="/signup">
            Signup
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default withRouter(Menu);
