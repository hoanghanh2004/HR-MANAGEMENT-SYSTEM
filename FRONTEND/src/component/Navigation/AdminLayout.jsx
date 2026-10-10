import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link, useLocation, useHistory } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { logoutUser } from '../../services/userService';
import { toast } from 'react-toastify';
import {
    FaUsers,
    FaShieldHalved,
    FaUserShield,
    FaBuilding,
    FaDiagramProject,
    FaCircleUser,
    FaRightFromBracket,
    FaBars,
    FaChevronLeft,
    FaChevronRight,
    FaHouse,
} from 'react-icons/fa6';
import './AdminLayout.scss';

const AdminLayout = ({ children }) => {
    const { user, logoutContext } = useContext(UserContext);
    const location = useLocation();
    const history = useHistory();

    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('hr_sidebar_collapsed') === 'true';
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Tự động đóng sidebar trên mobile khi chuyển trang
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleToggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('hr_sidebar_collapsed', String(next));
            return next;
        });
    };

    const handleToggleMobile = () => {
        setIsMobileOpen((prev) => !prev);
    };

    // Tái sử dụng chính xác cơ chế đăng xuất hiện tại
    const handleLogout = async () => {
        try {
            let data = await logoutUser();
            localStorage.removeItem('jwt');
            logoutContext();
            if (data && +data.EC === 0) {
                history.push('/login');
                toast.success('Logout succeeds !');
            } else {
                toast.error(data?.EM || 'Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('jwt');
            logoutContext();
            history.push('/login');
        }
    };

    // Danh sách menu đã triển khai route thực tế
    const mainNavItems = [
        {
            path: '/users',
            label: 'Quản lý Người dùng',
            shortLabel: 'Người dùng',
            icon: FaUsers,
        },
        {
            path: '/roles',
            label: 'Vai trò & Quyền hạn',
            shortLabel: 'Roles',
            icon: FaShieldHalved,
        },
        {
            path: '/group-role',
            label: 'Phân quyền theo Nhóm',
            shortLabel: 'Group Roles',
            icon: FaUserShield,
        },
        {
            path: '/departments',
            label: 'Quản lý Phòng ban',
            shortLabel: 'Phòng ban',
            icon: FaBuilding,
        },
    ];

    // Danh sách tính năng dự kiến giai đoạn tiếp theo (chưa có route - không tạo route giả)
    const comingSoonItems = [
        {
            label: 'Quản lý Dự án',
            icon: FaDiagramProject,
            badge: 'Chưa triển khai',
        },
        {
            label: 'Hồ sơ cá nhân',
            icon: FaCircleUser,
            badge: 'Chưa triển khai',
        },
    ];

    // Xác định tiêu đề hiển thị trên header theo route hiện tại
    const getPageMeta = (pathname) => {
        switch (pathname) {
            case '/users':
                return {
                    title: 'Quản lý Người Dùng',
                    subtitle: 'Danh sách tài khoản và quyền hạn nhân sự',
                };
            case '/roles':
                return {
                    title: 'Vai trò & Quyền hạn (Roles)',
                    subtitle: 'Cấu hình danh mục quyền và URL bảo vệ',
                };
            case '/group-role':
                return {
                    title: 'Phân quyền theo Nhóm (Group Roles)',
                    subtitle: 'Gán vai trò và quyền truy cập cho từng nhóm người dùng',
                };
            case '/departments':
                return {
                    title: 'Quản lý Phòng ban',
                    subtitle: 'Danh sách và thông tin phòng ban trong hệ thống',
                };
            default:
                return {
                    title: 'Khu vực Quản trị',
                    subtitle: 'Hệ thống quản lý nhân sự HRMaster',
                };
        }
    };

    const currentMeta = getPageMeta(location.pathname);
    const username = user?.account?.username || 'Quản trị viên';
    const userGroup = user?.account?.groupWithRoles?.name || 'Admin';
    const userEmail = user?.account?.email || '';
    const avatarInitials = username.slice(0, 2).toUpperCase();

    return (
        <div className={`admin-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Backdrop làm mờ khi mở sidebar trên màn hình nhỏ */}
            {isMobileOpen && (
                <div
                    className="admin-sidebar-backdrop"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar dọc bên trái */}
            <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Đầu Sidebar: Logo và Thương hiệu */}
                <div className="admin-sidebar-header">
                    <div className="admin-brand">
                        <div className="brand-logo-badge">
                            <span className="brand-logo-text">HR</span>
                        </div>
                        {!isCollapsed && (
                            <div className="brand-info">
                                <span className="brand-name">HRMaster</span>
                                <span className="brand-badge">Enterprise</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="btn-collapse-toggle d-none d-lg-flex"
                        onClick={handleToggleCollapse}
                        title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                        type="button"
                    >
                        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                    </button>
                </div>

                {/* Danh mục điều hướng */}
                <nav className="admin-sidebar-nav">
                    <div className="nav-section-title">
                        {!isCollapsed ? 'QUẢN TRỊ HỆ THỐNG' : '•••'}
                    </div>
                    <ul className="nav-list">
                        {mainNavItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <li key={item.path} className="nav-item">
                                    <NavLink
                                        to={item.path}
                                        className="nav-link-item"
                                        activeClassName="active"
                                        title={item.label}
                                    >
                                        <span className="nav-item-icon">
                                            <IconComponent />
                                        </span>
                                        {!isCollapsed && (
                                            <span className="nav-item-label">{item.label}</span>
                                        )}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="nav-section-title mt-3">
                        {!isCollapsed ? 'TÍNH NĂNG DỰ KIẾN' : '•••'}
                    </div>
                    <ul className="nav-list nav-list-disabled">
                        {comingSoonItems.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <li key={`coming-soon-${index}`} className="nav-item">
                                    <div
                                        className="nav-link-item disabled"
                                        title={`${item.label} (${item.badge})`}
                                    >
                                        <span className="nav-item-icon">
                                            <IconComponent />
                                        </span>
                                        {!isCollapsed && (
                                            <>
                                                <span className="nav-item-label">{item.label}</span>
                                                <span className="badge-coming-soon">{item.badge}</span>
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Cuối Sidebar: Thông tin tài khoản & Nút Đăng xuất */}
                <div className="admin-sidebar-footer">
                    <div className="user-profile-card">
                        <div className="user-avatar" title={username}>
                            {avatarInitials}
                        </div>
                        {!isCollapsed && (
                            <div className="user-details">
                                <span className="user-name" title={username}>
                                    {username}
                                </span>
                                <span className="user-role-badge">
                                    {userGroup}
                                </span>
                                {userEmail && (
                                    <span className="user-email" title={userEmail}>
                                        {userEmail}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        className="btn-admin-logout"
                        onClick={handleLogout}
                        title="Đăng xuất khỏi hệ thống"
                        type="button"
                    >
                        <FaRightFromBracket />
                        {!isCollapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Khu vực nội dung chính bên phải */}
            <div className="admin-main-wrapper">
                {/* Header thanh công cụ trên cùng */}
                <header className="admin-top-header">
                    <div className="header-left">
                        <button
                            className="btn-mobile-menu d-lg-none"
                            onClick={handleToggleMobile}
                            type="button"
                            title="Mở menu quản trị"
                        >
                            <FaBars />
                        </button>
                        <div className="header-breadcrumb">
                            <span className="breadcrumb-root">Hệ thống</span>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-current">{currentMeta.title}</span>
                        </div>
                    </div>

                    <div className="header-right">
                        <Link to="/" className="btn-return-home" title="Xem giao diện trang chủ">
                            <FaHouse />
                            <span className="d-none d-sm-inline">Trang chủ</span>
                        </Link>
                        <div className="user-quick-greeting d-none d-md-flex">
                            <span className="greeting-text">
                                Xin chào, <strong>{username}</strong>
                            </span>
                            <span className="badge-group">{userGroup}</span>
                        </div>
                    </div>
                </header>

                {/* Vùng render nội dung component con (Users, Roles, GroupRole) */}
                <main className="admin-content-body">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
