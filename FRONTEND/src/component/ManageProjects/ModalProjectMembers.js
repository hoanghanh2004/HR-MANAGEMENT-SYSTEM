import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import {
    fetchProjectMembers,
    removeMemberFromProject,
} from '../../services/projectService';
import ModalAssignMember from './ModalAssignMember';
import ModalEditMemberRole from './ModalEditMemberRole';
import ModalConfirmRemoveMember from './ModalConfirmRemoveMember';
import {
    FaUsers,
    FaUserPlus,
    FaUserPen,
    FaUserMinus,
    FaArrowsRotate,
    FaMagnifyingGlass,
    FaXmark,
    FaCircleExclamation,
    FaBriefcase,
} from 'react-icons/fa6';

const ROLE_BADGE_CONFIG = {
    'Project Manager': {
        className: 'badge-pm',
        label: 'Project Manager',
        bg: '#ede9fe',
        color: '#6d28d9',
        border: '#c4b5fd',
    },
    Developer: {
        className: 'badge-dev',
        label: 'Developer',
        bg: '#e0f2fe',
        color: '#0369a1',
        border: '#bae6fd',
    },
    Tester: {
        className: 'badge-tester',
        label: 'Tester',
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
    },
    Designer: {
        className: 'badge-designer',
        label: 'Designer',
        bg: '#fce7f3',
        color: '#be185d',
        border: '#fbcfe8',
    },
    Other: {
        className: 'badge-other',
        label: 'Other',
        bg: '#f1f5f9',
        color: '#475569',
        border: '#cbd5e1',
    },
};

const ModalProjectMembers = ({ show, project, onHide }) => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Sub-modal states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditRoleModal, setShowEditRoleModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const loadMembers = useCallback(async () => {
        if (!project || !project.id) return;
        setIsLoading(true);
        setLoadError('');
        try {
            const response = await fetchProjectMembers(project.id);
            if (response && +response.EC === 0) {
                setMembers(response.DT || []);
            } else {
                const msg =
                    response?.EM || 'Không thể tải danh sách thành viên.';
                setLoadError(msg);
                toast.error(msg);
            }
        } catch (error) {
            console.error('fetchProjectMembers error:', error);
            const msg =
                error?.response?.data?.EM ||
                'Lỗi kết nối khi tải danh sách thành viên.';
            setLoadError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [project]);

    useEffect(() => {
        if (show && project?.id) {
            setSearchTerm('');
            loadMembers();
        } else {
            setMembers([]);
            setLoadError('');
        }
    }, [show, project, loadMembers]);

    // Filter members by search keyword
    const filteredMembers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return members;
        return members.filter(
            (m) =>
                (m.username && m.username.toLowerCase().includes(term)) ||
                (m.email && m.email.toLowerCase().includes(term)) ||
                (m.phone && m.phone.toLowerCase().includes(term)) ||
                (m.roleInProject && m.roleInProject.toLowerCase().includes(term)) ||
                (m.department && m.department.toLowerCase().includes(term))
        );
    }, [members, searchTerm]);

    const handleOpenEditRole = (member) => {
        setSelectedMember(member);
        setShowEditRoleModal(true);
    };

    const handleOpenRemove = (member) => {
        setSelectedMember(member);
        setShowRemoveModal(true);
    };

    const handleConfirmRemove = async () => {
        if (!selectedMember || !project) return;
        setIsRemoving(true);
        try {
            const payload = {
                projectId: project.id,
                userId: selectedMember.userId,
                projectUserId: selectedMember.projectUserId,
            };

            const response = await removeMemberFromProject(payload);
            if (response && +response.EC === 0) {
                toast.success(
                    response.EM || 'Xóa thành viên khỏi dự án thành công!'
                );
                setShowRemoveModal(false);
                setSelectedMember(null);
                await loadMembers();
            } else {
                toast.error(
                    response?.EM || 'Không thể xóa thành viên khỏi dự án.'
                );
            }
        } catch (error) {
            console.error('removeMemberFromProject error:', error);
            toast.error(
                error?.response?.data?.EM ||
                    'Lỗi kết nối khi xóa thành viên.'
            );
        } finally {
            setIsRemoving(false);
        }
    };

    const renderRoleBadge = (roleName) => {
        const config = ROLE_BADGE_CONFIG[roleName] || ROLE_BADGE_CONFIG['Other'];
        return (
            <span
                className="role-badge-pill"
                style={{
                    backgroundColor: config.bg,
                    color: config.color,
                    border: `1px solid ${config.border}`,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                }}
            >
                {roleName || 'Developer'}
            </span>
        );
    };

    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                size="xl"
                centered
                className="project-modal-custom project-members-modal"
                backdrop="static"
            >
                <Modal.Header closeButton className="project-modal-header bg-light">
                    <div className="d-flex align-items-center gap-3">
                        <div className="modal-header-icon bg-primary text-white p-2 rounded d-flex align-items-center justify-content-center">
                            <FaUsers />
                        </div>
                        <div>
                            <Modal.Title className="fs-5 fw-bold text-slate-900 mb-0 d-flex align-items-center gap-2">
                                <span>Thành viên dự án:</span>
                                <span className="text-primary">{project?.name || ''}</span>
                                {project?.id && (
                                    <span className="badge bg-secondary fs-7 fw-normal">
                                        #{project.id}
                                    </span>
                                )}
                            </Modal.Title>
                            <p className="modal-subtitle text-muted mb-0 small">
                                Phân công và quản lý vai trò của các nhân sự tham gia trong dự án
                            </p>
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body className="p-4">
                    {/* Top action toolbar */}
                    <div className="members-modal-toolbar d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div className="toolbar-search-box d-flex align-items-center position-relative" style={{ maxWidth: '340px', width: '100%' }}>
                            <FaMagnifyingGlass className="position-absolute ms-3 text-muted" />
                            <Form.Control
                                type="text"
                                placeholder="Tìm theo tên, email, vai trò..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                                size="sm"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    className="btn-clear-search position-absolute end-0 me-2 btn btn-link p-0 text-muted"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <FaXmark />
                                </button>
                            )}
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={loadMembers}
                                disabled={isLoading}
                                className="d-inline-flex align-items-center gap-1"
                                title="Tải lại danh sách thành viên"
                            >
                                <FaArrowsRotate className={isLoading ? 'spin' : ''} />
                                <span>Làm mới</span>
                            </Button>

                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowAssignModal(true)}
                                className="d-inline-flex align-items-center gap-1"
                            >
                                <FaUserPlus />
                                <span>Thêm thành viên</span>
                            </Button>
                        </div>
                    </div>

                    {/* Content Table / States */}
                    <div className="members-table-container border rounded overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="mt-3 text-muted small">Đang tải danh sách thành viên dự án...</p>
                            </div>
                        ) : loadError ? (
                            <div className="text-center py-5">
                                <FaCircleExclamation className="text-danger fs-2 mb-2" />
                                <h6 className="text-danger">Không thể tải danh sách thành viên</h6>
                                <p className="text-muted small">{loadError}</p>
                                <Button variant="outline-primary" size="sm" onClick={loadMembers}>
                                    Thử lại
                                </Button>
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center py-5">
                                <FaUsers className="text-muted fs-1 mb-2 opacity-50" />
                                {members.length === 0 ? (
                                    <>
                                        <h6 className="fw-bold text-slate-800">Chưa có nhân sự nào được phân công</h6>
                                        <p className="text-muted small mb-3">
                                            Dự án này chưa có thành viên. Hãy nhấn nút dưới đây để phân công nhân sự.
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setShowAssignModal(true)}
                                        >
                                            <FaUserPlus className="me-1" />
                                            Phân công nhân viên đầu tiên
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <h6 className="fw-bold text-slate-800">Không tìm thấy thành viên phù hợp</h6>
                                        <p className="text-muted small mb-2">
                                            Không có kết quả nào khớp với từ khóa "{searchTerm}".
                                        </p>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            Xóa tìm kiếm
                                        </Button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="table-responsive mb-0">
                                <Table hover className="align-middle mb-0 text-nowrap">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '60px' }} className="text-center">STT</th>
                                            <th style={{ minWidth: '220px' }}>Tên nhân viên</th>
                                            <th style={{ minWidth: '200px' }}>Email</th>
                                            <th style={{ minWidth: '130px' }} className="text-center">Số điện thoại</th>
                                            <th style={{ minWidth: '160px' }} className="text-center">Vai trò trong dự án</th>
                                            <th style={{ width: '130px' }} className="text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.map((member, index) => (
                                            <tr key={member.projectUserId || member.id || index}>
                                                <td className="text-center text-muted fw-semibold">
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                                                            style={{ width: '34px', height: '34px', fontSize: '13px' }}
                                                        >
                                                            {(member.username || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-slate-900">
                                                                {member.username || 'Chưa đặt tên'}
                                                            </div>
                                                            {member.department && (
                                                                <div className="text-muted small d-flex align-items-center gap-1">
                                                                    <FaBriefcase className="fs-8" />
                                                                    <span>{member.department}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-slate-700">
                                                    {member.email || '-'}
                                                </td>
                                                <td className="text-center text-slate-700">
                                                    {member.phone || '-'}
                                                </td>
                                                <td className="text-center">
                                                    {renderRoleBadge(member.roleInProject)}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-inline-flex align-items-center gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn-table-action btn-edit"
                                                            title="Sửa vai trò"
                                                            onClick={() => handleOpenEditRole(member)}
                                                        >
                                                            <FaUserPen />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-table-action btn-delete"
                                                            title="Xóa khỏi dự án"
                                                            onClick={() => handleOpenRemove(member)}
                                                        >
                                                            <FaUserMinus />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer className="project-modal-footer bg-light px-4 py-3 d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                        Tổng số nhân sự được phân công:{' '}
                        <strong className="text-primary">{members.length}</strong> thành viên
                    </div>
                    <Button variant="secondary" onClick={onHide} className="btn-cancel px-3">
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Sub Modals */}
            <ModalAssignMember
                show={showAssignModal}
                projectId={project?.id}
                projectName={project?.name}
                onHide={() => setShowAssignModal(false)}
                onSuccess={loadMembers}
            />

            <ModalEditMemberRole
                show={showEditRoleModal}
                member={selectedMember}
                projectName={project?.name}
                onHide={() => {
                    setShowEditRoleModal(false);
                    setSelectedMember(null);
                }}
                onSuccess={loadMembers}
            />

            <ModalConfirmRemoveMember
                show={showRemoveModal}
                member={selectedMember}
                projectName={project?.name}
                isRemoving={isRemoving}
                onHide={() => {
                    setShowRemoveModal(false);
                    setSelectedMember(null);
                }}
                onConfirm={handleConfirmRemove}
            />
        </>
    );
};

export default ModalProjectMembers;
