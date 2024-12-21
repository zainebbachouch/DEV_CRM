import React, { useState } from 'react';
import crmIcon from "../../images/crm.png";
import './sidebar.css';
import { FaHome, FaUserAlt, FaRegChartBar, FaCommentAlt } from "react-icons/fa";
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../views/context/authContext';
import { GiHamburgerMenu } from "react-icons/gi";
import { CiAlignTop } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";

import { MdKeyboardCommandKey, MdOutlineAdminPanelSettings } from "react-icons/md";
import { TbFileInvoice } from "react-icons/tb";
import { CiChat1, CiLogin, CiCalendar } from "react-icons/ci";
import { FaTasks } from "react-icons/fa";
import { SiPrivateinternetaccess } from "react-icons/si";
import { BiSolidCategory } from "react-icons/bi";
function SideBar() {
  const [isOpen, setIsOpen] = useState(true);
  const role = localStorage.getItem("role");
  const menuItem = [
    {
      path: "/Products",
      name: " Mangement Products",
      icon: <CiAlignTop />
    },
    {
      path: "/commands",
      name: "commands",
      icon: <MdKeyboardCommandKey />
    },
    {
      path: "/invoices",
      name: "invoices",
      icon: <TbFileInvoice />
    },
    {
      path: "/messenger",
      name: "messenger",
      icon: <CiChat1 />
    }

  ];  // Admin-specific menu items (including Task)
  const adminItems = [
    { path: "/Categories", name: "Categories", icon: <BiSolidCategory /> },
    { path: "/adminstration", name: "Adminstration", icon: <MdOutlineAdminPanelSettings /> },
    { path: "/authorization", name: "Authorization", icon: <SiPrivateinternetaccess /> },
    { path: "/task", name: "Task", icon: <FaTasks /> }, // Task added here
  ];

  const menuItem2 = [
    {
      path: "/login",
      name: "Authentification",
      icon: <CiLogin />
    },
    {
      path: "/login",
      name: "logout",
      icon: <CiLogout />
    },
    {
      path: "/calendar",
      name: "Calendar",
      icon: <CiCalendar />,
      notification: true
    }
  ];
  const { currentUser } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`Sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="menu d-flex justify-content-between mb-3" >
        <img src={crmIcon} alt="" className="logo" />
        <GiHamburgerMenu onClick={toggleSidebar} />
      </div>
      {role !== 'client' && (
        <div className="dashboard d-flex justify-content-between align-items-center mb-3">
          <FaHome className='navIcon' />
          <Link to="/Dashboard" className="navLink" style={{ color: 'white' }}> <span>Dashboard</span></Link>
          <div className="dashNotifcation">6</div>
        </div>
      )}
      <div className="center p-0 ">
        <span style={{ color: 'white' }} className='navLink'>Management</span>
        {menuItem.map((item, index) => (
          <NavLink style={{ color: 'white' }} to={item.path} key={index} className="link d-flex navLink mt-2 p-2 activeNavLink column-gap-3">
            <div className="navItemIcon">{item.icon}</div>
            <div className="link_text">{item.name}</div>

          </NavLink>
        ))}
        {/* Admin Section (conditional on role) */}
        {role !== 'client' && (
          <div className="center p-0">
            <span style={{ color: 'white' }} className='navLink'>Admin Features</span>
            {adminItems.map((item, index) => (
              <NavLink
                style={{ color: 'white' }}
                to={item.path}
                key={index}
                className="link d-flex navLink mt-2 p-2 activeNavLink column-gap-3"
              >
                <div className="navItemIcon">{item.icon}</div>
                <div className="link_text">{item.name}</div>
              </NavLink>
            ))}

          </div>
        )}

      </div>
      <div className="center p-0">
        <span style={{ color: 'white' }} className='navLink'>Pages</span>
        {menuItem2.map((item, index) => (
          <NavLink style={{ color: 'white' }} to={item.path} key={index} className="link d-flex align-items-center navLink mt-2 p-2 activeNavLink column-gap-3">
            <div className="navItemIcon">{item.icon}</div>
            <div className="link_text">{item.name}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
