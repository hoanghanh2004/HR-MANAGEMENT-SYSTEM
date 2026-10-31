import React, { useEffect, useState } from 'react';
import { fetchAllUser, deleteUser, fetchGroup } from '../../services/userService';
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
    FaLocationDot,
    FaEnvelope,
    FaChevronLeft,
    FaChevronRight,
    FaUsers,
    FaCircleExclamation,
} from 'react-icons/fa6';

const Users = () => {
    const [listUsers, setListUsers] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Server-side search and pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Row selection (checkbox)
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal delete
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModal, setDataModal] = useState({});

    // Modal user (create / update)
    const [isShowModalUser, setIsShowModalUser] = useState(false);
    const [actionModalUser, setActionModalUser] = useState('CREATE');
    const [dataModalUser, setDataModalUser] = useState({});

    // Debounce từ khóa tìm kiếm (400ms) để tránh gửi request dồn dập
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchTerm.trim());
        }, 400);
        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    // Tải danh mục nhóm quyền 1 lần khi component mount
    useEffect(() => {
        loadGroups();
    }, []);

    // Tự động tải lại danh sách khi trang, số bản ghi hoặc từ khóa tìm kiếm thay đổi
    useEffect(() => {
        let isCurrent = true;

        const loadData = async () => {
            setIsLoading(true);
            try {
                let response = await fetchAllUser(currentPage, pageSize, debouncedKeyword);
                if (!isCurrent) return; // Bỏ qua nếu effect đã bị hủy (tránh race condition)

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
                    toast.error(response?.EM || 'Không thể tải danh sách người dùng!');
                }
            } catch (error) {
                if (!isCurrent) return;
                console.error('Fetch users error:', error);
                toast.error('Lỗi kết nối khi tải danh sách người dùng!');
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isCurrent = false; // Đánh dấu không cập nhật nếu request cũ về muộn
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
                toast.error(response?.EM || 'Không thể tải danh sách người dùng!');
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            toast.error('Lỗi kết nối khi tải danh sách người dùng!');
        } finally {
            setIsLoading(false);
        }
    };

    const loadGroups = async () => {
        try {
            let res = await fetchGroup();
            if (res && res.EC === 0) {
                setUserGroups(res.DT || []);
            }
        } catch (error) {
            console.error('Fetch groups error:', error);
        }
    };

    // Hành động xóa
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
                toast.success(response.EM || 'Xóa người dùng thành công!');
                setIsShowModalDelete(false);
                setSelectedIds((prev) => prev.filter((id) => id !== dataModal.id));

                // Nếu xóa bản ghi duy nhất trên trang hiện tại và không phải trang 1 -> lùi 1 trang
                if (listUsers.length === 1 && currentPage > 1) {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                } else {
                    await fetchUsers();
                }
            } else {
                toast.error(response?.EM || 'Xóa người dùng thất bại!');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            toast.error('Lỗi khi thực hiện xóa người dùng!');
        }
    };

    // Hành động thêm / sửa
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
        toast.success('Làm mới danh sách người dùng thành công!');
    };

    const handleExportData = () => {
        toast.info('Tính năng xuất dữ liệu Excel đang được phát triển (Chưa có API Backend).');
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setDebouncedKeyword('');
        setSelectedGroup('ALL');
        setCurrentPage(1);
    };

    const handleGroupChange = (e) => {
        const val = e.target.value;
        if (val !== 'ALL') {
            toast.info(
                'Lọc theo nhóm quyền đang chờ Backend hỗ trợ tham số groupId kèm phân trang. Hiện tại đang hiển thị toàn bộ người dùng.'
            );
        }
        setSelectedGroup('ALL');
    };

    // Xử lý chọn hàng loạt checkbox trên trang hiện tại
    const isAllSelected =
        listUsers.length > 0 &&
        listUsers.every((u) => selectedIds.includes(u.id));

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const newIds = Array.from(
                new Set([...selectedIds, ...listUsers.map((u) => u.id)])
            );
            setSelectedIds(newIds);
        } else {
            const pageIds = listUsers.map((u) => u.id);
            setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Thống kê dựa trên dữ liệu thật đã nạp
    const totalLoaded = listUsers.length;
    const devCount = listUsers.filter((u) => u.Group?.name === 'Dev').length;
    const leaderCount = listUsers.filter((u) => u.Group?.name === 'Leader').length;
    const customerGuestCount = listUsers.filter(
        (u) => u.Group?.name === 'Customer' || u.Group?.name === 'Guest'
    ).length;

    // Helper tạo avatar 2 chữ cái viết tắt
    const getInitials = (username) => {
        if (!username) return 'US';
        const parts = username.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Helper gán màu sắc badge theo nhóm
    const getGroupBadgeClass = (groupName) => {
        switch (groupName?.toLowerCase()) {
            case 'dev':
                return 'badge-group-dev';
            case 'leader':
                return 'badge-group-leader';
            case 'customer':
                return 'badge-group-customer';
            case 'guest':
                return 'badge-group-guest';
            default:
                return 'badge-group-default';
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

    return (
        <div className="manage-users-page">
            {/* 1. Header Section */}
            <div className="users-page-header">
                <div className="header-meta">
                    <div className="header-eyebrow">
                        <span className="eyebrow-tag">System Directory</span>
                        <span className="eyebrow-dot" />
                        <span className="eyebrow-text">Dữ liệu thời gian thực</span>
                    </div>
                    <h1 className="header-title">Quản lý Người Dùng</h1>
                    <p className="header-description">
                        Quản lý danh sách tài khoản, vai trò và thông tin cá nhân trong toàn tổ chức.
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        className="btn-action-outline"
                        onClick={handleRefresh}
                        title="Tải lại dữ liệu từ server"
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
                        <span>+ Thêm thành viên</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI Metric Cards Grid */}
            <div className="users-kpi-grid">
                {/* Metric 1: Tổng người dùng (từ Database) */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Tổng người dùng</span>
                        <div className="kpi-icon-wrap icon-primary">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">{totalRows}</span>
                        <span className="kpi-tag tag-success">Toàn bộ DB</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">Tổng số bản ghi từ Database</span>
                    </div>
                </div>

                {/* Metric 2: Nhóm Leader & Dev */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Nhóm Leader / Dev</span>
                        <div className="kpi-icon-wrap icon-indigo">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">{devCount + leaderCount}</span>
                        <span className="kpi-tag tag-indigo">Core Staff</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">
                            Dev: {devCount} • Leader: {leaderCount}
                        </span>
                    </div>
                </div>

                {/* Metric 3: Khách & Customer */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Customer / Guest</span>
                        <div className="kpi-icon-wrap icon-amber">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">{customerGuestCount}</span>
                        <span className="kpi-tag tag-amber">Đối tác & Khách</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">Nhóm tài khoản ngoài phòng kỹ thuật</span>
                    </div>
                </div>

                {/* Metric 4: Trạng thái tài khoản (Status) - Placeholder an toàn */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Trạng thái tài khoản</span>
                        <div className="kpi-icon-wrap icon-muted">
                            <FaCircleExclamation />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">—</span>
                        <span className="kpi-tag tag-muted">Chờ API Status</span>
                    </div>
                    <div className="kpi-footer">
                        <span className="kpi-subtext">Model User DB chưa có trường status</span>
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
                            placeholder="Tìm theo Tên, Email, Số điện thoại, Địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Group Filter */}
                    <div className="select-box">
                        <select
                            className="filter-select"
                            value={selectedGroup}
                            onChange={handleGroupChange}
                        >
                            <option value="ALL">Tất cả nhóm quyền</option>
                            {userGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    Nhóm {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter (Chưa có trường status ở backend) */}
                    <div className="select-box">
                        <select
                            className="filter-select select-disabled"
                            disabled
                            title="Database hiện chưa có trường trạng thái tài khoản"
                        >
                            <option>Trạng thái: Toàn bộ (Chờ API)</option>
                        </select>
                    </div>
                </div>

                <div className="toolbar-actions">
                    {(searchTerm || selectedGroup !== 'ALL') && (
                        <button
                            className="btn-reset-filters"
                            onClick={handleResetFilters}
                            type="button"
                        >
                            <FaFilterCircleXmark />
                            <span>Xóa bộ lọc</span>
                        </button>
                    )}
                    <span className="record-counter">
                        Đang hiển thị {listUsers.length} / {totalRows} bản ghi
                    </span>
                </div>
            </div>

            {/* 4. User Table Section */}
            <div className="users-table-card">
                <div className="table-responsive">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th className="th-checkbox">
                                    <input
                                        type="checkbox"
                                        className="row-checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        title="Chọn tất cả trang này"
                                    />
                                </th>
                                <th className="th-id">ID</th>
                                <th className="th-user">Tài khoản & Người dùng</th>
                                <th className="th-email">Email</th>
                                <th className="th-group">Nhóm quyền</th>
                                <th className="th-address">Địa chỉ</th>
                                <th className="th-status">Trạng thái</th>
                                <th className="th-actions text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="table-loading-cell">
                                        <div className="loading-spinner-wrap">
                                            <FaArrowsRotate className="spin loading-icon" />
                                            <span>Đang tải danh sách người dùng...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : listUsers && listUsers.length > 0 ? (
                                listUsers.map((item) => {
                                    const isChecked = selectedIds.includes(item.id);
                                    return (
                                        <tr
                                            key={`user-row-${item.id}`}
                                            className={isChecked ? 'row-selected' : ''}
                                        >
                                            <td className="td-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="row-checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleSelectOne(item.id)}
                                                />
                                            </td>
                                            <td className="td-id">#{item.id}</td>
                                            <td className="td-user">
                                                <div className="user-profile-meta">
                                                    <div className="user-avatar-badge">
                                                        {getInitials(item.username)}
                                                    </div>
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
                                                <div className="email-meta">
                                                    <FaEnvelope className="email-icon" />
                                                    <span className="email-text">{item.email}</span>
                                                </div>
                                            </td>
                                            <td className="td-group">
                                                <span
                                                    className={`group-pill ${getGroupBadgeClass(
                                                        item.Group?.name
                                                    )}`}
                                                >
                                                    {item.Group ? item.Group.name : 'Chưa phân nhóm'}
                                                </span>
                                            </td>
                                            <td className="td-address">
                                                <div className="address-meta">
                                                    <FaLocationDot className="address-icon" />
                                                    <span className="address-text">
                                                        {item.address || 'Chưa cập nhật'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="td-status">
                                                <span className="status-pill status-untracked" title="Chưa có trường status trong DB">
                                                    <span className="status-dot" />
                                                    <span>Chưa có dữ liệu</span>
                                                </span>
                                            </td>
                                            <td className="td-actions text-right">
                                                <div className="action-buttons-group">
                                                    <button
                                                        className="btn-row-action btn-edit"
                                                        onClick={() => handleEditUser(item)}
                                                        title="Chỉnh sửa thông tin"
                                                        type="button"
                                                    >
                                                        <FaPenToSquare />
                                                    </button>
                                                    <button
                                                        className="btn-row-action btn-delete"
                                                        onClick={() => handleDelete(item)}
                                                        title="Xóa người dùng"
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
                                    <td colSpan={8} className="table-empty-cell">
                                        <div className="empty-state-wrap">
                                            <p className="empty-title">Không tìm thấy người dùng phù hợp</p>
                                            <p className="empty-desc">
                                                {searchTerm
                                                    ? 'Thử thay đổi từ khóa tìm kiếm (tên, email, số điện thoại, địa chỉ).'
                                                    : 'Hệ thống hiện chưa có bản ghi người dùng nào.'}
                                            </p>
                                            {searchTerm && (
                                                <button
                                                    className="btn-reset-filters mt-2"
                                                    onClick={handleResetFilters}
                                                    type="button"
                                                >
                                                    Xóa bộ lọc
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

            {/* Modal Xác nhận xóa người dùng (Tái sử dụng 100% logic hiện có) */}
            <ModalDelete
                show={isShowModalDelete}
                handleClose={handleClose}
                confirmDeleteUser={confirmDeleteUser}
                dataModal={dataModal}
            />

            {/* Modal Thêm / Sửa người dùng (Tái sử dụng 100% logic hiện có) */}
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

