import React, { useEffect, useState } from 'react';
import { fetchAllUser, deleteUser } from '../../services/userService';
import { fetchAllDepartments } from '../../services/departmentService';
import { toast } from 'react-toastify';
import ModalDelete from './ModalDelete.js';
import ModalUser from './ModalUser.js';
import './Users.scss';
import {
    FaArrowsRotate,
    FaDownload,
    FaUserPlus,
    FaMagnifyingGlass,
    FaFilterCircleXmark,
    FaPenToSquare,
    FaTrashCan,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaCalendarDays,
    FaChevronLeft,
    FaChevronRight,
    FaUsers,
    FaUserCheck,
    FaUserClock,
    FaUserXmark,
} from 'react-icons/fa6';

// Component hiển thị Avatar an toàn với Fallback khi URL ảnh lỗi hoặc null
const UserAvatar = ({ avatar, username }) => {
    const [imgError, setImgError] = useState(false);

    const getInitials = (name) => {
        if (!name) return 'NV';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getAvatarSrc = (url) => {
        if (!url) return null;
        if (
            url.startsWith('http://') ||
            url.startsWith('https://') ||
            url.startsWith('blob:') ||
            url.startsWith('data:')
        ) {
            return url;
        }
        return `http://localhost:6969${url}`;
    };

    const src = getAvatarSrc(avatar);

    if (!src || imgError) {
        return (
            <div className="user-avatar-badge" title={username || 'Nhân viên'}>
                {getInitials(username)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={username || 'Avatar'}
            className="user-avatar-img"
            onError={() => setImgError(true)}
        />
    );
};

const Users = () => {
    // Dữ liệu người dùng & phòng ban
    const [listUsers, setListUsers] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDepts, setIsLoadingDepts] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Bộ lọc & Tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modal xóa
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModal, setDataModal] = useState({});

    // Modal thêm / sửa hồ sơ nhân viên
    const [isShowModalUser, setIsShowModalUser] = useState(false);
    const [actionModalUser, setActionModalUser] = useState('CREATE');
    const [dataModalUser, setDataModalUser] = useState({});

    // Debounce từ khóa tìm kiếm (400ms) để tối ưu request và tránh race condition
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchTerm.trim());
        }, 400);
        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    // Tải danh sách phòng ban từ API
    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        setIsLoadingDepts(true);
        try {
            let res = await fetchAllDepartments();
            if (res && res.EC === 0) {
                setDepartmentsList(res.DT || []);
            }
        } catch (error) {
            console.error('Fetch departments error:', error);
            toast.error('Lỗi khi tải danh sách phòng ban!');
        } finally {
            setIsLoadingDepts(false);
        }
    };

    // Tự động tải lại danh sách khi trang, số bản ghi hoặc từ khóa tìm kiếm thay đổi
    useEffect(() => {
        let isCurrent = true;

        const loadData = async () => {
            setIsLoading(true);
            try {
                let response = await fetchAllUser(currentPage, pageSize, debouncedKeyword);
                if (!isCurrent) return; // Bỏ qua nếu effect đã bị hủy để tránh race condition

                if (response && response.EC === 0) {
                    if (response.DT && Array.isArray(response.DT.users)) {
                        setListUsers(response.DT.users);
                        setTotalRows(response.DT.totalRows || 0);
                        setTotalPages(response.DT.totalPages || 1);
                    } else if (Array.isArray(response.DT)) {
                        // Tương thích ngược nếu API trả về mảng cũ
                        setListUsers(response.DT);
                        setTotalRows(response.DT.length);
                        setTotalPages(Math.ceil(response.DT.length / pageSize) || 1);
                    } else {
                        setListUsers([]);
                        setTotalRows(0);
                        setTotalPages(1);
                    }
                } else {
                    toast.error(response?.EM || 'Không thể tải danh sách nhân viên!');
                }
            } catch (error) {
                if (!isCurrent) return;
                console.error('Fetch users error:', error);
                toast.error('Lỗi kết nối khi tải danh sách nhân viên!');
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isCurrent = false; // Ngăn chặn request cũ về muộn ghi đè dữ liệu mới
        };
    }, [currentPage, pageSize, debouncedKeyword]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let response = await fetchAllUser(currentPage, pageSize, debouncedKeyword);
            if (response && response.EC === 0) {
                if (response.DT && Array.isArray(response.DT.users)) {
                    setListUsers(response.DT.users);
                    setTotalRows(response.DT.totalRows || 0);
                    setTotalPages(response.DT.totalPages || 1);
                } else if (Array.isArray(response.DT)) {
                    setListUsers(response.DT);
                    setTotalRows(response.DT.length);
                    setTotalPages(Math.ceil(response.DT.length / pageSize) || 1);
                }
            } else {
                toast.error(response?.EM || 'Không thể tải danh sách nhân viên!');
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            toast.error('Lỗi kết nối khi tải danh sách nhân viên!');
        } finally {
            setIsLoading(false);
        }
    };

    // Xóa nhân viên
    const handleDelete = (user) => {
        setDataModal(user);
        setIsShowModalDelete(true);
    };

    const handleClose = () => {
        setIsShowModalDelete(false);
        setDataModal({});
    };

    const confirmDeleteUser = async () => {
        try {
            let response = await deleteUser(dataModal);
            if (response && response.EC === 0) {
                toast.success(response.EM || 'Xóa nhân viên thành công!');
                setIsShowModalDelete(false);

                // Nếu xóa bản ghi duy nhất trên trang hiện tại và không phải trang 1 -> lùi 1 trang
                if (listUsers.length === 1 && currentPage > 1) {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                } else {
                    await fetchUsers();
                }
            } else {
                toast.error(response?.EM || 'Xóa nhân viên thất bại!');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            toast.error('Lỗi khi thực hiện xóa nhân viên!');
        }
    };

    // Thêm / Sửa nhân viên (kết nối ModalUser từ T5-04)
    const onHideModalUser = async () => {
        setIsShowModalUser(false);
        setDataModalUser({});
        await fetchUsers();
    };

    const handleEditUser = (user) => {
        setActionModalUser('UPDATE');
        setDataModalUser(user);
        setIsShowModalUser(true);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUsers();
        setTimeout(() => setIsRefreshing(false), 500);
        toast.success('Làm mới danh sách nhân viên thành công!');
    };

    const handleExportData = () => {
        toast.info('Tính năng xuất dữ liệu Excel đang được phát triển (Chờ API Backend).');
    };

    // Xử lý bộ lọc
    const handleDepartmentChange = (e) => {
        const val = e.target.value;
        setSelectedDepartment(val);
        if (val !== 'ALL') {
            toast.info(
                'Lọc theo phòng ban đang chờ Backend hỗ trợ query departmentId. Hiện đang hiển thị tất cả nhân viên.'
            );
        }
    };

    const handleStatusChange = (e) => {
        const val = e.target.value;
        setSelectedStatus(val);
        if (val !== 'ALL') {
            toast.info(
                'Lọc theo trạng thái đang chờ Backend hỗ trợ query employmentStatus. Hiện đang hiển thị tất cả nhân viên.'
            );
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDebouncedKeyword('');
        setSelectedDepartment('ALL');
        setSelectedStatus('ALL');
        setCurrentPage(1);
        toast.success('Đã đặt lại toàn bộ điều kiện tìm kiếm và bộ lọc!');
    };

    // Định dạng ngày vào làm (an toàn múi giờ)
    const formatHireDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const cleanDateStr = String(dateStr).split('T')[0];
            const parts = cleanDateStr.split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                const [year, month, day] = parts;
                return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
            }
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '—';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return '—';
        }
    };

    // Helper render Badge trạng thái tiếng Việt
    const renderStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return (
                    <span className="badge-status badge-status-active" title="Nhân viên đang làm việc chính thức">
                        <span className="status-dot" />
                        <span>Đang làm việc</span>
                    </span>
                );
            case 'PROBATION':
                return (
                    <span className="badge-status badge-status-probation" title="Nhân viên đang trong thời gian thử việc">
                        <span className="status-dot" />
                        <span>Đang thử việc</span>
                    </span>
                );
            case 'RESIGNED':
                return (
                    <span className="badge-status badge-status-resigned" title="Nhân viên đã nghỉ việc">
                        <span className="status-dot" />
                        <span>Đã nghỉ việc</span>
                    </span>
                );
            case 'LEAVE':
                return (
                    <span className="badge-status badge-status-leave" title="Nhân viên đang nghỉ phép / thai sản">
                        <span className="status-dot" />
                        <span>Nghỉ phép</span>
                    </span>
                );
            default:
                return (
                    <span className="badge-status badge-status-default" title="Chưa cập nhật trạng thái làm việc">
                        <span className="status-dot" />
                        <span>Chưa cập nhật</span>
                    </span>
                );
        }
    };

    // Helper tạo danh sách số trang hiển thị
    const getPageNumbers = () => {
        if (totalPages <= 1) return [1];
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages = [];
        if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    // Thống kê dựa trên dữ liệu thực tế (Minh bạch tuyệt đối theo yêu cầu Phương án C)
    const totalLoaded = listUsers.length;
    const activeCount = listUsers.filter((u) => u.employmentStatus === 'ACTIVE').length;
    const probationCount = listUsers.filter((u) => u.employmentStatus === 'PROBATION').length;
    const resignedCount = listUsers.filter((u) => u.employmentStatus === 'RESIGNED').length;
    const leaveCount = listUsers.filter((u) => u.employmentStatus === 'LEAVE').length;
    const inactiveTotal = resignedCount + leaveCount;

    return (
        <div className="manage-users-page">
            {/* 1. Header Section */}
            <div className="users-page-header">
                <div className="header-meta">
                    <div className="header-eyebrow">
                        <span className="eyebrow-tag">HR Directory</span>
                        <span className="eyebrow-dot" />
                        <span className="eyebrow-text">Dữ liệu thời gian thực</span>
                    </div>
                    <h1 className="header-title">Quản lý nhân viên</h1>
                    <p className="header-description">
                        Quản lý thông tin, phòng ban, chức vụ và tình trạng làm việc của nhân viên trong hệ thống.
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        className="btn-action-outline"
                        onClick={handleRefresh}
                        title="Tải lại dữ liệu từ máy chủ"
                        type="button"
                    >
                        <FaArrowsRotate className={`action-icon ${isRefreshing ? 'spin' : ''}`} />
                        <span>Làm mới</span>
                    </button>

                    <button
                        className="btn-action-outline"
                        onClick={handleExportData}
                        title="Xuất danh sách ra file Excel"
                        type="button"
                    >
                        <FaDownload className="action-icon icon-tertiary" />
                        <span>Xuất dữ liệu</span>
                    </button>

                    <button
                        className="btn-action-primary"
                        onClick={() => {
                            setIsShowModalUser(true);
                            setActionModalUser('CREATE');
                        }}
                        type="button"
                    >
                        <FaUserPlus className="action-icon" />
                        <span>+ Thêm nhân viên</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI Metric Cards Grid (Phương án C - Dashboard Thống Kê Tổng Quan) */}
            <div className="users-kpi-grid">
                {/* Metric 1: Tổng nhân viên (Từ Database count) */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Tổng nhân viên</span>
                        <div className="kpi-icon-wrap icon-primary">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">{totalRows}</span>
                        <span className="kpi-tag tag-success">Toàn hệ thống</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">Tổng số nhân sự trong cơ sở dữ liệu</span>
                    </div>
                </div>

                {/* Metric 2: Đang làm việc */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Đang làm việc</span>
                        <div className="kpi-icon-wrap icon-success">
                            <FaUserCheck />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">{activeCount}</span>
                        <span className="kpi-tag tag-success">ACTIVE</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">
                            Hiển thị trên trang: {activeCount} / {totalLoaded}
                        </span>
                    </div>
                </div>

                {/* Metric 3: Đang thử việc */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Đang thử việc</span>
                        <div className="kpi-icon-wrap icon-amber">
                            <FaUserClock />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">{probationCount}</span>
                        <span className="kpi-tag tag-amber">PROBATION</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">
                            Hiển thị trên trang: {probationCount} / {totalLoaded}
                        </span>
                    </div>
                </div>

                {/* Metric 4: Đã nghỉ việc & Nghỉ phép */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Đã nghỉ / Nghỉ phép</span>
                        <div className="kpi-icon-wrap icon-muted">
                            <FaUserXmark />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">{inactiveTotal}</span>
                        <span className="kpi-tag tag-muted">RESIGNED / LEAVE</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">
                            Nghỉ việc: {resignedCount} • Nghỉ phép: {leaveCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Filter & Search Toolbar */}
            <div className="users-toolbar">
                <div className="toolbar-filters">
                    {/* Search Input */}
                    <div className="search-box">
                        <FaMagnifyingGlass className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm theo tên, email hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Department Filter */}
                    <div className="select-box">
                        <select
                            className="filter-select"
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            disabled={isLoadingDepts}
                        >
                            <option value="ALL">
                                {isLoadingDepts ? 'Đang tải phòng ban...' : 'Tất cả phòng ban'}
                            </option>
                            {departmentsList &&
                                departmentsList.length > 0 &&
                                departmentsList.map((dept) => (
                                    <option key={`dept-${dept.id}`} value={dept.id}>
                                        Phòng {dept.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Employment Status Filter */}
                    <div className="select-box">
                        <select
                            className="filter-select"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang làm việc (ACTIVE)</option>
                            <option value="PROBATION">Đang thử việc (PROBATION)</option>
                            <option value="RESIGNED">Đã nghỉ việc (RESIGNED)</option>
                            <option value="LEAVE">Nghỉ phép (LEAVE)</option>
                        </select>
                    </div>
                </div>

                <div className="toolbar-actions">
                    {(searchTerm || selectedDepartment !== 'ALL' || selectedStatus !== 'ALL') && (
                        <button
                            className="btn-reset-filters"
                            onClick={handleResetFilters}
                            type="button"
                            title="Đặt lại toàn bộ điều kiện tìm kiếm và bộ lọc"
                        >
                            <FaFilterCircleXmark />
                            <span>Đặt lại bộ lọc</span>
                        </button>
                    )}
                    <span className="record-counter">
                        Đang hiển thị {listUsers.length} / {totalRows} bản ghi
                    </span>
                </div>
            </div>

            {/* 4. Employee Table Section (Bảng Quản lý Nhân sự Chuyên nghiệp) */}
            <div className="users-table-card">
                <div className="table-responsive">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th className="th-stt">STT</th>
                                <th className="th-employee">Nhân viên</th>
                                <th className="th-email">Email</th>
                                <th className="th-phone">Số điện thoại</th>
                                <th className="th-dept">Phòng ban</th>
                                <th className="th-title">Chức vụ</th>
                                <th className="th-hiredate">Ngày vào làm</th>
                                <th className="th-status">Trạng thái</th>
                                <th className="th-actions text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="table-loading-cell">
                                        <div className="loading-spinner-wrap">
                                            <FaArrowsRotate className="spin loading-icon" />
                                            <span>Đang tải danh sách nhân viên...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : listUsers && listUsers.length > 0 ? (
                                listUsers.map((item, index) => {
                                    const stt = (currentPage - 1) * pageSize + index + 1;
                                    return (
                                        <tr key={`user-row-${item.id}`}>
                                            <td className="td-stt">{stt}</td>
                                            <td className="td-employee">
                                                <div className="user-profile-meta">
                                                    <UserAvatar
                                                        avatar={item.avatar}
                                                        username={item.username}
                                                    />
                                                    <div className="user-name-box">
                                                        <span className="user-name-text">
                                                            {item.username || 'Chưa đặt tên'}
                                                        </span>
                                                        <span className="user-id-sub">
                                                            Mã NV: #{item.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="td-email">
                                                {item.email ? (
                                                    <div className="email-meta">
                                                        <FaEnvelope className="email-icon" />
                                                        <span className="email-text">{item.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="td-phone">
                                                {item.phone ? (
                                                    <div className="phone-meta">
                                                        <FaPhone className="phone-icon" />
                                                        <span className="phone-text">{item.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="td-dept">
                                                {item.Department && item.Department.name ? (
                                                    <span
                                                        className="dept-pill"
                                                        title={`Phòng ban: ${item.Department.name}`}
                                                    >
                                                        <FaBuilding className="dept-icon" />
                                                        <span>{item.Department.name}</span>
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="dept-pill dept-unassigned"
                                                        title="Chưa phân công phòng ban"
                                                    >
                                                        <FaBuilding className="dept-icon" />
                                                        <span>Chưa phân công</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="td-title">
                                                {item.jobTitle ? (
                                                    <span className="job-title-text" title={item.jobTitle}>
                                                        {item.jobTitle}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">Chưa cập nhật</span>
                                                )}
                                            </td>
                                            <td className="td-hiredate">
                                                {item.hireDate ? (
                                                    <div
                                                        className="date-meta"
                                                        title={`Ngày vào làm: ${formatHireDate(item.hireDate)}`}
                                                    >
                                                        <FaCalendarDays className="date-icon" />
                                                        <span>{formatHireDate(item.hireDate)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="td-status">
                                                {renderStatusBadge(item.employmentStatus)}
                                            </td>
                                            <td className="td-actions text-right">
                                                <div className="action-buttons-group">
                                                    <button
                                                        className="btn-row-action btn-edit"
                                                        onClick={() => handleEditUser(item)}
                                                        title="Chỉnh sửa hồ sơ nhân viên"
                                                        type="button"
                                                    >
                                                        <FaPenToSquare />
                                                    </button>
                                                    <button
                                                        className="btn-row-action btn-delete"
                                                        onClick={() => handleDelete(item)}
                                                        title="Xóa nhân viên"
                                                        type="button"
                                                    >
                                                        <FaTrashCan />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="table-empty-cell">
                                        <div className="empty-state-wrap">
                                            <p className="empty-title">
                                                {searchTerm
                                                    ? 'Không tìm thấy nhân viên phù hợp'
                                                    : 'Chưa có nhân viên nào trong hệ thống'}
                                            </p>
                                            <p className="empty-desc">
                                                {searchTerm
                                                    ? 'Thử thay đổi hoặc đặt lại từ khóa tìm kiếm (tên, email, số điện thoại).'
                                                    : 'Bấm nút "+ Thêm nhân viên" ở góc trên để tạo hồ sơ nhân viên đầu tiên.'}
                                            </p>
                                            {searchTerm && (
                                                <button
                                                    className="btn-reset-filters mt-2"
                                                    onClick={handleResetFilters}
                                                    type="button"
                                                >
                                                    Đặt lại bộ lọc
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 5. Pagination Footer */}
                <div className="table-pagination-footer">
                    <div className="pagination-info">
                        <span>
                            Hiển thị{' '}
                            <strong className="text-highlight">
                                {totalRows > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                                {' '}-{' '}
                                {Math.min(currentPage * pageSize, totalRows)}
                            </strong>{' '}
                            trên tổng số{' '}
                            <strong className="text-highlight">{totalRows}</strong> bản ghi
                        </span>
                        <span style={{ marginLeft: '12px' }}>
                            Số dòng/trang:{' '}
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                disabled={isLoading}
                                style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1',
                                    background: '#ffffff',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </span>
                    </div>

                    <div className="pagination-controls">
                        <button
                            className="btn-page-nav"
                            disabled={currentPage <= 1 || isLoading}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            title="Trang trước"
                            type="button"
                        >
                            <FaChevronLeft />
                        </button>

                        {getPageNumbers().map((pageItem, index) => {
                            if (pageItem === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="btn-page-num"
                                        style={{
                                            cursor: 'default',
                                            border: 'none',
                                            background: 'transparent',
                                        }}
                                    >
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={`page-btn-${pageItem}`}
                                    className={`btn-page-num ${
                                        pageItem === currentPage ? 'active' : ''
                                    }`}
                                    disabled={isLoading}
                                    onClick={() => setCurrentPage(pageItem)}
                                    type="button"
                                >
                                    {pageItem}
                                </button>
                            );
                        })}

                        <button
                            className="btn-page-nav"
                            disabled={currentPage >= totalPages || isLoading}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            title="Trang tiếp"
                            type="button"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Xác nhận xóa nhân viên (Tái sử dụng 100% logic hiện có) */}
            <ModalDelete
                show={isShowModalDelete}
                handleClose={handleClose}
                confirmDeleteUser={confirmDeleteUser}
                dataModal={dataModal}
            />

            {/* Modal Thêm / Sửa hồ sơ nhân viên (Nâng cấp từ T5-04) */}
            <ModalUser
                onHide={onHideModalUser}
                show={isShowModalUser}
                action={actionModalUser}
                dataModalUser={dataModalUser}
            />
        </div>
    );
};

export default Users;
