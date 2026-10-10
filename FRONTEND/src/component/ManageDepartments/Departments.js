import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import {
    deleteDepartment,
    fetchAllDepartments,
} from '../../services/departmentService';
import ModalDeleteDepartment from './ModalDeleteDepartment';
import ModalDepartment from './ModalDepartment';
import './Departments.scss';
import {
    FaBuilding,
    FaPlus,
    FaArrowsRotate,
    FaMagnifyingGlass,
    FaXmark,
    FaPenToSquare,
    FaTrashCan,
    FaUsers,
    FaShieldHalved,
    FaChevronLeft,
    FaChevronRight,
    FaDownload,
    FaCircleCheck,
    FaCircleExclamation,
    FaFilterCircleXmark,
} from 'react-icons/fa6';

const PAGE_SIZE = 10;

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [departmentAction, setDepartmentAction] = useState('CREATE');
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadDepartments = useCallback(async () => {
        setIsLoading(true);
        setLoadError('');
        try {
            const response = await fetchAllDepartments();
            if (response && +response.EC === 0) {
                setDepartments(response.DT || []);
            } else {
                const message = response?.EM || 'Không thể tải danh sách phòng ban.';
                setLoadError(message);
                toast.error(message);
            }
        } catch (error) {
            console.error('Fetch departments error:', error);
            const message =
                error?.response?.data?.EM || 'Lỗi kết nối khi tải danh sách phòng ban.';
            setLoadError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadDepartments();
        setTimeout(() => setIsRefreshing(false), 400);
    };

    const handleExportCSV = () => {
        if (!departments || departments.length === 0) {
            toast.info('Không có dữ liệu phòng ban để xuất báo cáo.');
            return;
        }
        const header = ['ID', 'Tên phòng ban', 'Ngày tạo', 'Trạng thái'];
        const rows = departments.map((d) => [
            d.id,
            `"${(d.name || '').replace(/"/g, '""')}"`,
            d.createdAt ? `"${new Date(d.createdAt).toLocaleString('vi-VN')}"` : '""',
            '"Hoạt động"',
        ]);
        const csvContent =
            'data:text/csv;charset=utf-8,\uFEFF' +
            [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `danh_sach_phong_ban_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Xuất báo cáo danh sách phòng ban thành công!');
    };

    const filteredDepartments = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return departments.filter(
            (department) =>
                !term ||
                (department?.name && department.name.toLowerCase().includes(term)) ||
                String(department?.id).includes(term)
        );
    }, [departments, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageDepartments = filteredDepartments.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    const openCreateModal = () => {
        setSelectedDepartment(null);
        setDepartmentAction('CREATE');
        setShowDepartmentModal(true);
    };

    const openEditModal = (department) => {
        setSelectedDepartment(department);
        setDepartmentAction('UPDATE');
        setShowDepartmentModal(true);
    };

    const handleDepartmentSaved = async () => {
        setShowDepartmentModal(false);
        await loadDepartments();
    };

    const handleConfirmDelete = async () => {
        if (!selectedDepartment) return;
        setIsDeleting(true);
        try {
            const response = await deleteDepartment(selectedDepartment);
            if (response && +response.EC === 0) {
                toast.success(response.EM);
                setIsDeleteModalOpen(false);
                setSelectedDepartment(null);
                await loadDepartments();
            } else {
                toast.error(response?.EM || 'Không thể xóa phòng ban.');
            }
        } catch (error) {
            console.error('Delete department error:', error);
            toast.error(
                error?.response?.data?.EM || 'Lỗi kết nối khi xóa phòng ban.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Mặc định';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Mặc định';
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        } catch {
            return 'Mặc định';
        }
    };

    return (
        <section className="manage-departments-page">
            {/* Top Page Header (Stitch AI Layout) */}
            <div className="departments-page-header">
                <div className="header-meta">
                    <div className="header-eyebrow">
                        <span className="eyebrow-tag">Cơ cấu tổ chức</span>
                        <span className="eyebrow-dot"></span>
                        <span className="eyebrow-text">Đồng bộ thời gian thực</span>
                    </div>
                    <h1 className="header-title">Quản lý Phòng Ban</h1>
                    <p className="header-description">
                        Quản lý danh mục phòng ban, cơ cấu tổ chức và phân cấp quản lý trong hệ thống HRMaster Enterprise.
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        type="button"
                        className="btn-action-outline"
                        onClick={handleExportCSV}
                        title="Xuất danh sách phòng ban ra file CSV"
                    >
                        <FaDownload className="action-icon" />
                        <span>Xuất báo cáo</span>
                    </button>
                    <button
                        type="button"
                        className="btn-action-outline"
                        onClick={handleRefresh}
                        disabled={isLoading || isRefreshing}
                        title="Tải lại dữ liệu phòng ban mới nhất"
                    >
                        <FaArrowsRotate
                            className={`action-icon ${isRefreshing || isLoading ? 'spin' : ''}`}
                        />
                        <span>Đồng bộ cơ cấu</span>
                    </button>
                    <Button
                        variant="primary"
                        className="btn-action-primary"
                        onClick={openCreateModal}
                    >
                        <FaPlus className="action-icon" />
                        <span>Thêm phòng ban</span>
                    </Button>
                </div>
            </div>

            {/* Overview KPI Cards (Stitch AI Style - Dữ liệu thực tế và minh họa lộ trình) */}
            <div className="departments-kpi-grid">
                {/* Thẻ 1: Tổng số phòng ban (Dữ liệu thực từ API) */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Tổng số phòng ban</span>
                        <div className="kpi-icon-badge kpi-badge-indigo">
                            <FaBuilding />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {departments.length < 10 ? `0${departments.length}` : departments.length}
                        </span>
                        <span className="kpi-unit">đơn vị cơ sở</span>
                    </div>
                    <div className="kpi-footer text-indigo">
                        <FaCircleCheck className="footer-icon" />
                        <span>Dữ liệu thực tế từ cơ sở dữ liệu</span>
                    </div>
                </div>

                {/* Thẻ 2: Kết quả lọc & tìm kiếm (Dữ liệu thực) */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Kết quả hiển thị</span>
                        <div className="kpi-icon-badge kpi-badge-blue">
                            <FaMagnifyingGlass />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {filteredDepartments.length < 10
                                ? `0${filteredDepartments.length}`
                                : filteredDepartments.length}
                        </span>
                        <span className="kpi-unit">/ {departments.length} phòng ban</span>
                    </div>
                    <div className="kpi-footer text-blue">
                        <span>
                            {searchTerm ? `Lọc theo từ khóa: "${searchTerm}"` : 'Đang hiển thị toàn bộ phòng ban'}
                        </span>
                    </div>
                </div>

                {/* Thẻ 3: Nhân sự trực thuộc (Minh họa lộ trình, không bịa số liệu giả) */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Nhân sự trực thuộc</span>
                        <div className="kpi-icon-badge kpi-badge-cyan">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value-text">Chưa gán</span>
                        <span className="kpi-status-badge badge-pending">Giai đoạn tiếp theo</span>
                    </div>
                    <div className="kpi-footer text-muted">
                        <span>Chờ khảo sát hồ sơ và liên kết tài khoản</span>
                    </div>
                </div>

                {/* Thẻ 4: Bảo mật & Phân quyền */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Bảo mật & Phân quyền</span>
                        <div className="kpi-icon-badge kpi-badge-purple">
                            <FaShieldHalved />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value-text">RBAC Active</span>
                        <span className="kpi-status-badge badge-active">Toàn quyền</span>
                    </div>
                    <div className="kpi-footer text-muted">
                        <span>Bảo vệ bởi phân quyền Group & Roles</span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="departments-toolbar-card">
                <div className="toolbar-search-box">
                    <FaMagnifyingGlass className="search-icon" />
                    <Form.Control
                        type="search"
                        aria-label="Tìm kiếm phòng ban theo tên"
                        placeholder="Tìm theo tên phòng ban..."
                        value={searchTerm}
                        onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="btn-clear-search"
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            title="Xóa tìm kiếm"
                        >
                            <FaXmark />
                        </button>
                    )}
                </div>

                <div className="toolbar-actions">
                    {searchTerm && (
                        <button
                            type="button"
                            className="btn-reset-filter"
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                        >
                            <FaFilterCircleXmark />
                            <span>Xóa bộ lọc</span>
                        </button>
                    )}
                    <span className="toolbar-count-badge">
                        Tổng: <strong>{filteredDepartments.length}</strong> đơn vị
                    </span>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="departments-table-card">
                {isLoading ? (
                    <div className="departments-state-box" role="status">
                        <div className="state-spinner"></div>
                        <p className="loading-text">Đang tải danh sách phòng ban...</p>
                    </div>
                ) : loadError ? (
                    <div className="departments-state-box text-danger" role="alert">
                        <FaCircleExclamation className="state-error-icon" />
                        <p className="state-error-message">{loadError}</p>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={loadDepartments}
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <Table hover className="departments-table mb-0">
                                <thead>
                                    <tr>
                                        <th scope="col" className="col-id">Mã PB</th>
                                        <th scope="col" className="col-name">Tên & Cơ cấu phòng ban</th>
                                        <th scope="col" className="col-status">Trạng thái</th>
                                        <th scope="col" className="col-members">Nhân sự</th>
                                        <th scope="col" className="col-created">Ngày tạo</th>
                                        <th scope="col" className="col-actions text-end">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageDepartments.length ? (
                                        pageDepartments.map((department) => (
                                            <tr key={department.id}>
                                                <td className="col-id">
                                                    <span className="id-code-badge">
                                                        PB-{String(department.id).padStart(3, '0')}
                                                    </span>
                                                </td>
                                                <td className="col-name">
                                                    <div className="department-identity">
                                                        <div className="department-avatar">
                                                            <FaBuilding />
                                                        </div>
                                                        <div className="department-info">
                                                            <span className="department-name">
                                                                {department.name}
                                                            </span>
                                                            <span className="department-subtitle">
                                                                Đơn vị trực thuộc cơ cấu tổ chức HRMaster
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="col-status">
                                                    <span className="status-pill status-active">
                                                        <span className="status-dot"></span>
                                                        Hoạt động
                                                    </span>
                                                </td>
                                                <td className="col-members">
                                                    <span className="members-badge">
                                                        Chưa phân bổ
                                                    </span>
                                                </td>
                                                <td className="col-created">
                                                    <span className="date-text">
                                                        {formatDate(department.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="col-actions text-end">
                                                    <div className="action-buttons-group">
                                                        <button
                                                            type="button"
                                                            className="btn-row-action btn-edit"
                                                            title="Sửa phòng ban"
                                                            onClick={() => openEditModal(department)}
                                                        >
                                                            <FaPenToSquare />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-row-action btn-delete"
                                                            title="Xóa phòng ban"
                                                            onClick={() => {
                                                                setSelectedDepartment(department);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                        >
                                                            <FaTrashCan />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="empty-state-cell">
                                                <div className="empty-state-box">
                                                    <div className="empty-icon-circle">
                                                        <FaBuilding />
                                                    </div>
                                                    <h6>
                                                        {searchTerm
                                                            ? 'Không tìm thấy phòng ban phù hợp.'
                                                            : 'Chưa có phòng ban nào trong hệ thống.'}
                                                    </h6>
                                                    <p>
                                                        {searchTerm
                                                            ? 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem lại toàn bộ.'
                                                            : 'Bắt đầu bằng việc khởi tạo phòng ban đầu tiên vào cơ cấu tổ chức.'}
                                                    </p>
                                                    {searchTerm ? (
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => setSearchTerm('')}
                                                        >
                                                            Xóa tìm kiếm
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={openCreateModal}
                                                        >
                                                            <FaPlus className="me-1" /> Thêm phòng ban mới
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        {/* Pagination Bar */}
                        {filteredDepartments.length > 0 && (
                            <div className="departments-pagination-bar">
                                <div className="pagination-info">
                                    Hiển thị{' '}
                                    <strong>{(safePage - 1) * PAGE_SIZE + 1}</strong>
                                    {' '}–{' '}
                                    <strong>
                                        {Math.min(safePage * PAGE_SIZE, filteredDepartments.length)}
                                    </strong>
                                    {' '}trên tổng số{' '}
                                    <strong>{filteredDepartments.length}</strong> phòng ban
                                </div>
                                <div className="pagination-controls">
                                    <button
                                        type="button"
                                        className="btn-page-nav"
                                        disabled={safePage <= 1}
                                        onClick={() => setCurrentPage(safePage - 1)}
                                        title="Trang trước"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <div className="page-indicator">
                                        Trang <strong>{safePage}</strong> / {totalPages}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-page-nav"
                                        disabled={safePage >= totalPages}
                                        onClick={() => setCurrentPage(safePage + 1)}
                                        title="Trang tiếp theo"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* System Status Footer (Stitch AI Layout) */}
            <div className="departments-status-footer">
                <div className="status-item">
                    <span className="status-indicator-dot"></span>
                    <span>Cơ cấu tổ chức HRMaster: Sẵn sàng hoạt động bình thường.</span>
                </div>
                <div className="status-meta">
                    <span className="api-tag">API: /api/v1/department/*</span>
                    <span className="divider">|</span>
                    <span>Aura HR Design System</span>
                </div>
            </div>

            {/* Modals */}
            <ModalDepartment
                show={showDepartmentModal}
                action={departmentAction}
                department={selectedDepartment}
                onHide={() => setShowDepartmentModal(false)}
                onSaved={handleDepartmentSaved}
            />
            <ModalDeleteDepartment
                show={isDeleteModalOpen}
                department={selectedDepartment}
                isDeleting={isDeleting}
                onHide={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedDepartment(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
};

export default Departments;
