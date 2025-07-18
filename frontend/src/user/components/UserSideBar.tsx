import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./UserSideBar.css";

const UserSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
     {isOpen ? null : <div className="toggle-column"></div>}

      {/* Toggle Button */}
     <button
        className={`sidebar-toggle btn btn-outline-primary m-3 ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      >
        ☰
      </button>


      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="text-center p-3">
          <img
            src="/IIITB_logo.png"
            alt="IIITB Logo"
            className="logo mb-2 mt-4"
            style={{ width: "60px", height: "60px" }}
          />
          <h6 className="mb-0 mt-4 fw-bold">International Institute of</h6>
          <h6 className="mb-3 fw-bold">Information Technology Bangalore</h6>
        </div>
        <nav className="nav flex-column px-3">
          <NavLink
            to="/"
            className="nav-link"
            onClick={toggleSidebar}
            end
          >
            Dashboard
          </NavLink>
          <NavLink to="/menu" className="nav-link" onClick={toggleSidebar}>
            Today's Menu
          </NavLink>

          <NavLink
            to="/weekmenu"
            className="nav-link"
            onClick={toggleSidebar}
          >
            Week's Menu
          </NavLink>
          <NavLink
            to="/sickmeal"
            className="nav-link"
            onClick={toggleSidebar}
          >
            Sick Meal
          </NavLink>

        </nav>
      </div>

    </>
  );
};

export default UserSidebar;