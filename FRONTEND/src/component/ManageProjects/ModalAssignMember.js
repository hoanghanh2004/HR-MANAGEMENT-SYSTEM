import React, { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import {
    assignUserToProject,
    fetchAssignableUsers,
} from '../../services/projectService';
import { FaUserPlus } from 'react-icons/fa6';

const ROLE_OPTIONS = [
    { value: 'Project Manager', label: 'Project Manager (Quản lý dự án)' },
    { value: 'Developer', label: 'Developer (Lập trình viên)' },
    { value: 'Tester', label: 'Tester (Kiểm thử phần mềm)' },
    { value: 'Designer', label: 'Designer (Thiết kế UI/UX)' },
    { value: 'Other', label: 'Other (Vai trò khác)' },
];

const ModalAssignMember = ({ show, projectId, projectName, onHide, onSuccess }) => {
    const [assignableUsers, setAssignableUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState('Developer');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadAssignableUsers = useCallback(async () => {
        if (!projectId) return;
        setIsLoadingUsers(true);
        try {
            const response = await fetchAssignableUsers(projectId);
            if (response && +response.EC === 0) {
                setAssignableUsers(response.DT || []);
            } else {
                toast.error(response?.EM || 'Không thể tải danh sách nhân sự.');
            }
        } catch (error) {
            console.error('fetchAssignableUsers error:', error);
            toast.error(
                error?.response?.data?.EM || 'Lỗi kết nối khi tải danh sách nhân sự.'
            );
        } finally {
            setIsLoadingUsers(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (show && projectId) {
            setSelectedUserId('');
            setSelectedRole('Developer');
            setErrorMessage('');
            loadAssignableUsers();
        }
    }, [show, projectId, loadAssignableUsers]);

    const handleAssign = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!selectedUserId) {
            setErrorMessage('Vui lòng chọn một nhân viên để phân công.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                projectId: Number(projectId),
                userId: Number(selectedUserId),
                roleInProject: selectedRole,
            };

            const response = await assignUserToProject(payload);
            if (response && +response.EC === 0) {
                toast.success(
                    response.EM || 'Phân công nhân sự vào dự án thành công!'
                );
                if (onSuccess) onSuccess();
                onHide();
            } else {
                setErrorMessage(response?.EM || 'Phân công nhân sự thất bại.');
                toast.error(response?.EM || 'Phân công nhân sự thất bại.');
            }
        } catch (error) {
            console.error('assignUserToProject error:', error);
            const msg =
                error?.response?.data?.EM ||
                'Lỗi kết nối khi phân công nhân sự.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            className="project-modal-custom"
        >
            <Modal.Header closeButton className="project-modal-header bg-light">
                <div className="d-flex align-items-center gap-2">
                    <div className="modal-header-icon">
                        <FaUserPlus />
                    </div>
                    <div>
                        <Modal.Title className="fs-5 fw-bold text-slate-900 mb-0">
                            Phân công nhân sự vào dự án
                        </Modal.Title>
                        <p className="modal-subtitle text-muted mb-0 small">
                            Dự án: <strong className="text-primary">{projectName}</strong> (Mã DA: #{projectId})
                        </p>
                    </div>
                </div>
            </Modal.Header>

            <Form onSubmit={handleAssign}>
                <Modal.Body className="py-4">
                    {errorMessage && (
                        <div className="alert alert-danger py-2 px-3 mb-3 small">
                            {errorMessage}
                        </div>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-slate-700">
                            Chọn nhân sự <span className="text-danger">*</span>
                        </Form.Label>
                        {isLoadingUsers ? (
                            <div className="text-muted small py-2">
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Đang tải danh sách nhân viên khả dụng...
                            </div>
                        ) : assignableUsers.length === 0 ? (
                            <div className="alert alert-warning py-2 px-3 small mb-0">
                                Tất cả nhân viên trong hệ thống đã được phân công vào dự án này hoặc chưa có nhân sự khả dụng.
                            </div>
                        ) : (
                            <Form.Select
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    if (errorMessage) setErrorMessage('');
                                }}
                                isInvalid={!!errorMessage && !selectedUserId}
                            >
                                <option value="">-- Chọn nhân viên từ danh sách --</option>
                                {assignableUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username || 'Không tên'} - {user.email}
                                        {user.jobTitle ? ` (${user.jobTitle})` : ''}
                                        {user.department ? ` [${user.department}]` : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-slate-700">
                            Vai trò trong dự án <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            {ROLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Text className="text-muted small">
                            Vai trò này chỉ áp dụng trong phạm vi dự án hiện tại, không ảnh hưởng đến quyền hạn nhóm hệ thống của nhân viên.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer className="project-modal-footer bg-light px-4 py-3">
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={isSubmitting}
                        className="btn-cancel px-3"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting || isLoadingUsers || assignableUsers.length === 0}
                        className="btn-save px-4"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Đang phân công...
                            </>
                        ) : (
                            'Phân công'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalAssignMember;
