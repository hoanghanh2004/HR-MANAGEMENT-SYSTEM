import React, { useContext } from 'react';
import './Nav.scss';
import { NavLink, Redirect, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Container } from 'react-bootstrap';
import imglogo from '../../assets/images/logo192.png';
import { Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { logoutUser } from '../../services/userService';
import { toast } from 'react-toastify';
const NavHeader = () => {
    const { user, logoutContext } = useContext(UserContext);
    const location = useLocation();
    let history = useHistory();
    const handleLogOutUser = async () => {
        let data = await logoutUser(); //clear cookies
        console.log('data1', data);
        localStorage.removeItem('jwt'); //clear localStorage
        logoutContext(); //clear user in context
        //dấu + convert sang number cho dù dưới db có là string
        if (data && +data.EC === 0) {
            history.push('/login');
            toast.success('Logout succeeds !');
        } else {
            toast.error(data.EM);
        }
    };
    if ((user && user.isAuthenticated === true) || location.pathname === '/') {
        return (
            <>
                {/* <div className="topnav">
                    <NavLink to="/" exact>
                        Home
                    </NavLink>
                    <NavLink to="/users">User</NavLink>
                    <NavLink to="/about">About</NavLink>
                </div> */}
                <div className="nav-header">
                    <Navbar expand="lg" className="bg-body-tertiary bg-header container-navbar">
                        <Container>
                            <img src={imglogo} alt="" width="30" height="30" className="d-inline-block align-top" />
                            <Navbar.Brand className="brand-name" href="#home">
                                Hoang Hanh
                            </Navbar.Brand>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="me-auto">
                                    <NavLink to="/" exact className="nav-link">
                                        Home
                                    </NavLink>
                                    {user && user.isAuthenticated === true && (
                                        <>
                                            <NavLink to="/users" className="nav-link">
                                                User
                                            </NavLink>
                                            <NavLink to="/roles" className="nav-link">
                                                Roles
                                            </NavLink>
                                            <NavLink to="/group-role" className="nav-link">
                                                Group-Roles
                                            </NavLink>
                                        </>
                                    )}
                                </Nav>
                                <Nav className="nav-right">
                                    {user && user.isAuthenticated === true ? (
                                        <>
                                            <Nav.Item className="nav-link">Welcome {user.account.username} !</Nav.Item>
                                            <NavDropdown title="Settings" id="basic-nav-dropdown" drop="down">
                                                <NavDropdown.Item>
                                                    <span className="log-out" onClick={() => handleLogOutUser()}>
                                                        Log Out !
                                                    </span>
                                                </NavDropdown.Item>
                                            </NavDropdown>
                                        </>
                                    ) : (
                                        <>
                                            <Link className="nav-link" to="/login">
                                                Login
                                            </Link>
                                            <Link className="nav-link" to="/register">
                                                Register
                                            </Link>
                                        </>
                                    )}
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </div>
            </>
        );
    } else {
        return <></>;
    }
};
export default NavHeader;
