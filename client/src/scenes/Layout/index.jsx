import React from "react";
import Navbar from "scenes/navbar"; // adjust the path if needed
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "4px" }}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
