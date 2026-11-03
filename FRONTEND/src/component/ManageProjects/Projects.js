import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import {
    deleteProject,
    fetchAllProjects,
} from '../../services/projectService';
import ModalDeleteProject from './ModalDeleteProject';
import ModalProject from './ModalProject';
import './Projects.scss';
import {
    FaDiagramProject,
    FaPlus,
    FaArrowsRotate,
    FaMagnifyingGlass,
    FaXmark,
    FaPenToSquare,
    FaTrashCan,
    FaChevronLeft,
    FaChevronRight,
    FaDownload,
    FaCircleCheck,
    FaClock,
    FaCalendarDays,
    FaCircleExclamation,
    FaFilterCircleXmark,
    FaListCheck,
} from 'react-icons/fa6';

const PAGE_SIZE = 10;

const STATUS_CONFIG = {
    PLANNING: {
        label: 'Đang lên kế hoạch',
        className: 'badge-planning',
    },
    IN_PROGRESS: {
        label: 'Đang thực hiện',
        className: 'badge-in-progress',
    },
    ON_HOLD: {
        label: 'Tạm hoãn',
        className: 'badge-on-hold',
    },
    COMPLETED: {
        label: 'Đã hoàn thành',
        className: 'badge-completed',
    },
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadError, setLoadError] = useState('');

    // Modal state
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectAction, setProjectAction] = useState('CREATE');
    const [selectedProject, setSelectedProject] = useState(null);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        setLoadError('');
        try {
            const response = await fetchAllProjects();
            if (response && +response.EC === 0) {
                setProjects(response.DT || []);
            } else {
                const message = response?.EM || 'Không thể tải danh sách dự án.';
                setLoadError(message);
                toast.error(message);
            }
        } catch (error) {
            console.error('Fetch projects error:', error);
            const message =
                error?.response?.data?.EM || 'Lỗi kết nối khi tải danh sách dự án.';
            setLoadError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadProjects();
        setTimeout(() => setIsRefreshing(false), 400);
    };

    const handleExportCSV = () => {
        if (!projects || projects.length === 0) {
            toast.info('Không có dữ liệu dự án để xuất báo cáo.');
            return;
        }
        const header = [
            'ID',
            'Tên dự án',
            'Mô tả',
            'Ngày bắt đầu',
            'Ngày kết thúc',
            'Trạng thái',
            'Ngày tạo',
        ];
        const rows = projects.map((p) => [
            p.id,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${(p.description || '').replace(/"/g, '""')}"`,
            p.startDate ? `"${p.startDate}"` : '""',
            p.endDate ? `"${p.endDate}"` : '""',
            `"${STATUS_CONFIG[p.status]?.label || p.status || ''}"`,
            p.createdAt ? `"${new Date(p.createdAt).toLocaleDateString('vi-VN')}"` : '""',
        ]);
        const csvContent =
            'data:text/csv;charset=utf-8,\uFEFF' +
            [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `danh_sach_du_an_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Xuất báo cáo danh sách dự án thành công!');
    };

    // Filter projects
    const filteredProjects = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return projects.filter((project) => {
            const matchesSearch =
                !term ||
                (project?.name && project.name.toLowerCase().includes(term)) ||
                (project?.description &&
                    project.description.toLowerCase().includes(term)) ||
                String(project?.id).includes(term);

            const matchesStatus =
                statusFilter === 'ALL' || project?.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [projects, searchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageProjects = filteredProjects.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    // KPI stats
    const stats = useMemo(() => {
        const total = projects.length;
        const inProgress = projects.filter((p) => p.status === 'IN_PROGRESS').length;
        const planning = projects.filter((p) => p.status === 'PLANNING').length;
        const completed = projects.filter((p) => p.status === 'COMPLETED').length;
        return { total, inProgress, planning, completed };
    }, [projects]);

    const openCreateModal = () => {
        setSelectedProject(null);
        setProjectAction('CREATE');
        setShowProjectModal(true);
    };

    const openEditModal = (project) => {
        setSelectedProject(project);
        setProjectAction('UPDATE');
        setShowProjectModal(true);
    };

    const openDeleteModal = (project) => {
        setSelectedProject(project);
        setIsDeleteModalOpen(true);
    };

    const handleProjectSaved = async () => {
        setShowProjectModal(false);
        await loadProjects();
    };

    const handleConfirmDelete = async () => {
        if (!selectedProject) return;
        setIsDeleting(true);
        try {
            const response = await deleteProject(selectedProject);
            if (response && +response.EC === 0) {
                toast.success(response.EM || 'Xóa dự án thành công!');
                setIsDeleteModalOpen(false);
                setSelectedProject(null);
                await loadProjects();
            } else {
                toast.error(response?.EM || 'Không thể xóa dự án.');
            }
        } catch (error) {
            console.error('Delete project error:', error);
            toast.error(
                error?.response?.data?.EM || 'Lỗi kết nối khi xóa dự án.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('vi-VN');
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    const renderStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || {
            label: status || 'Chưa xác định',
            className: 'badge-default',
        };
        return <span className={`status-pill ${config.className}`}>{config.label}</span>;
    };

    return (
        <section className="manage-projects-page">
            {/* Top Page Header */}
            <div className="projects-page-header">
                <div className="header-meta">
                    <div className="header-eyebrow">
                        <span className="eyebrow-tag">Phân hệ Dự án</span>
                        <span className="eyebrow-dot"></span>
                        <span className="eyebrow-text">Đồng bộ cơ sở dữ liệu</span>
                    </div>
                    <h1 className="header-title">Quản lý Dự Án</h1>
                    <p className="header-description">
                        Khởi tạo thông tin, theo dõi tiến độ và quản trị danh mục dự án trong hệ thống HRMaster Enterprise.
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        type="button"
                        className="btn-action-outline"
                        onClick={handleExportCSV}
                        title="Xuất danh sách dự án ra file CSV"
                    >
                        <FaDownload className="action-icon" />
                        <span>Xuất báo cáo</span>
                    </button>
                    <button
                        type="button"
                        className="btn-action-outline"
                        onClick={handleRefresh}
                        disabled={isLoading || isRefreshing}
                        title="Tải lại danh sách dự án"
                    >
                        <FaArrowsRotate
                            className={`action-icon ${isRefreshing || isLoading ? 'spin' : ''}`}
                        />
                        <span>Làm mới</span>
                    </button>
                    <Button
                        variant="primary"
                        className="btn-action-primary"
                        onClick={openCreateModal}
                    >
                        <FaPlus className="action-icon" />
                        <span>Thêm dự án</span>
                    </Button>
                </div>
            </div>

            {/* Overview KPI Cards */}
            <div className="projects-kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Tổng số dự án</span>
                        <div className="kpi-icon-badge kpi-badge-indigo">
                            <FaDiagramProject />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {stats.total < 10 ? `0${stats.total}` : stats.total}
                        </span>
                        <span className="kpi-unit">dự án</span>
                    </div>
                    <div className="kpi-footer text-indigo">
                        <FaCircleCheck className="footer-icon" />
                        <span>Dữ liệu thực từ hệ thống</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Đang thực hiện</span>
                        <div className="kpi-icon-badge kpi-badge-amber">
                            <FaClock />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {stats.inProgress < 10 ? `0${stats.inProgress}` : stats.inProgress}
                        </span>
                        <span className="kpi-unit">dự án</span>
                    </div>
                    <div className="kpi-footer text-amber">
                        <FaClock className="footer-icon" />
                        <span>Đang trong tiến trình</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Lập kế hoạch</span>
                        <div className="kpi-icon-badge kpi-badge-blue">
                            <FaCalendarDays />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {stats.planning < 10 ? `0${stats.planning}` : stats.planning}
                        </span>
                        <span className="kpi-unit">dự án</span>
                    </div>
                    <div className="kpi-footer text-blue">
                        <FaCalendarDays className="footer-icon" />
                        <span>Chuẩn bị triển khai</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Đã hoàn thành</span>
                        <div className="kpi-icon-badge kpi-badge-emerald">
                            <FaListCheck />
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {stats.completed < 10 ? `0${stats.completed}` : stats.completed}
                        </span>
                        <span className="kpi-unit">dự án</span>
                    </div>
                    <div className="kpi-footer text-emerald">
                        <FaCircleCheck className="footer-icon" />
                        <span>Đã nghiệm thu</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="projects-toolbar-card">
                <div className="toolbar-search">
                    <FaMagnifyingGlass className="search-icon" />
                    <Form.Control
                        type="text"
                        placeholder="Tìm theo tên dự án, mô tả hoặc mã DA..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="btn-clear-search"
                            onClick={() => setSearchTerm('')}
                            title="Xóa tìm kiếm"
                        >
                            <FaXmark />
                        </button>
                    )}
                </div>

                <div className="toolbar-filters">
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="status-filter-select"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PLANNING">Đang lên kế hoạch</option>
                        <option value="IN_PROGRESS">Đang thực hiện</option>
                        <option value="ON_HOLD">Tạm hoãn</option>
                        <option value="COMPLETED">Đã hoàn thành</option>
                    </Form.Select>

                    {(searchTerm || statusFilter !== 'ALL') && (
                        <Button
                            variant="outline-secondary"
                            className="btn-reset-filter"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('ALL');
                                setCurrentPage(1);
                            }}
                            title="Đặt lại bộ lọc"
                        >
                            <FaFilterCircleXmark className="me-1" />
                            <span>Xóa lọc</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="projects-table-card">
                {isLoading ? (
                    <div className="state-container state-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-3 text-muted">Đang tải danh sách dự án...</p>
                    </div>
                ) : loadError ? (
                    <div className="state-container state-error">
                        <FaCircleExclamation className="error-icon text-danger fs-1 mb-2" />
                        <h5 className="text-danger">Không thể tải danh sách dự án</h5>
                        <p className="text-muted">{loadError}</p>
                        <Button variant="outline-primary" onClick={loadProjects}>
                            Thử lại
                        </Button>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="state-container state-empty py-5">
                        <FaDiagramProject className="empty-icon text-muted fs-1 mb-3" />
                        {projects.length === 0 ? (
                            <>
                                <h5>Chưa có dự án nào trong hệ thống</h5>
                                <p className="text-muted">
                                    Bắt đầu quản lý bằng cách tạo dự án đầu tiên của doanh nghiệp.
                                </p>
                                <Button
                                    variant="primary"
                                    className="btn-action-primary mt-2"
                                    onClick={openCreateModal}
                                >
                                    <FaPlus className="action-icon me-1" />
                                    <span>Thêm dự án đầu tiên</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <h5>Không tìm thấy dự án phù hợp</h5>
                                <p className="text-muted">
                                    Thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái.
                                </p>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('ALL');
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <Table hover className="projects-table align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }} className="text-center">STT</th>
                                        <th style={{ width: '90px' }} className="text-center">Mã DA</th>
                                        <th style={{ minWidth: '220px' }}>Tên dự án</th>
                                        <th style={{ minWidth: '250px' }}>Mô tả</th>
                                        <th style={{ width: '130px' }} className="text-center">Bắt đầu</th>
                                        <th style={{ width: '130px' }} className="text-center">Kết thúc</th>
                                        <th style={{ width: '170px' }} className="text-center">Trạng thái</th>
                                        <th style={{ width: '120px' }} className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageProjects.map((project, index) => {
                                        const rowNumber =
                                            (safePage - 1) * PAGE_SIZE + index + 1;
                                        return (
                                            <tr key={project.id}>
                                                <td className="text-center text-muted fw-semibold">
                                                    {rowNumber}
                                                </td>
                                                <td className="text-center">
                                                    <span className="project-id-badge">
                                                        #{project.id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="project-name-cell">
                                                        <span className="project-name fw-bold text-slate-900">
                                                            {project.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="project-desc text-muted" title={project.description || ''}>
                                                        {project.description || (
                                                            <em className="text-muted-light">Không có mô tả</em>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="text-center date-cell">
                                                    {formatDate(project.startDate)}
                                                </td>
                                                <td className="text-center date-cell">
                                                    {formatDate(project.endDate)}
                                                </td>
                                                <td className="text-center">
                                                    {renderStatusBadge(project.status)}
                                                </td>
                                                <td className="text-center">
                                                    <div className="action-buttons-group">
                                                        <button
                                                            type="button"
                                                            className="btn-table-action btn-edit"
                                                            title="Sửa dự án"
                                                            onClick={() => openEditModal(project)}
                                                        >
                                                            <FaPenToSquare />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-table-action btn-delete"
                                                            title="Xóa dự án"
                                                            onClick={() => openDeleteModal(project)}
                                                        >
                                                            <FaTrashCan />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="projects-pagination-footer">
                            <div className="pagination-info text-muted small">
                                Hiển thị{' '}
                                <strong>
                                    {(safePage - 1) * PAGE_SIZE + 1} -{' '}
                                    {Math.min(safePage * PAGE_SIZE, filteredProjects.length)}
                                </strong>{' '}
                                trong tổng số <strong>{filteredProjects.length}</strong> dự án
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <button
                                        type="button"
                                        className="btn-page-nav"
                                        disabled={safePage <= 1}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        title="Trang trước"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="page-indicator">
                                        Trang {safePage} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn-page-nav"
                                        disabled={safePage >= totalPages}
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        title="Trang sau"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <ModalProject
                show={showProjectModal}
                action={projectAction}
                project={selectedProject}
                onHide={() => setShowProjectModal(false)}
                onSaved={handleProjectSaved}
            />

            <ModalDeleteProject
                show={isDeleteModalOpen}
                project={selectedProject}
                isDeleting={isDeleting}
                onHide={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
};

export default Projects;

