import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { updateMemberRole } from '../../services/projectService';
import { FaUserPen } from 'react-icons/fa6';

const ROLE_OPTIONS = [
    { value: 'Project Manager', label: 'Project Manager (Quản lý dự án)' },
    { value: 'Developer', label: 'Developer (Lập trình viên)' },
    { value: 'Tester', label: 'Tester (Kiểm thử phần mềm)' },
    { value: 'Designer', label: 'Designer (Thiết kế UI/UX)' },
    { value: 'Other', label: 'Other (Vai trò khác)' },
];

const ModalEditMemberRole = ({
    show,
    member,
    projectName,
    onHide,
    onSuccess,
}) => {
    const [selectedRole, setSelectedRole] = useState('Developer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (show && member) {
            setSelectedRole(member.roleInProject || 'Developer');
            setErrorMessage('');
        }
    }, [show, member]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!selectedRole) {
            setErrorMessage('Vui lòng chọn vai trò cho nhân viên.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                projectId: member.projectId,
                userId: member.userId,
                projectUserId: member.projectUserId,
                roleInProject: selectedRole,
            };

            const response = await updateMemberRole(payload);
            if (response && +response.EC === 0) {
                toast.success(
                    response.EM || 'Cập nhật vai trò thành viên thành công!'
                );
                if (onSuccess) onSuccess();
                onHide();
            } else {
                setErrorMessage(response?.EM || 'Cập nhật vai trò thất bại.');
                toast.error(response?.EM || 'Cập nhật vai trò thất bại.');
            }
        } catch (error) {
            console.error('updateMemberRole error:', error);
            const msg =
                error?.response?.data?.EM ||
                'Lỗi kết nối khi cập nhật vai trò.';
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
                        <FaUserPen />
                    </div>
                    <div>
                        <Modal.Title className="fs-5 fw-bold text-slate-900 mb-0">
                            Chỉnh sửa vai trò thành viên
                        </Modal.Title>
                        <p className="modal-subtitle text-muted mb-0 small">
                            Dự án: <strong className="text-primary">{projectName}</strong>
                        </p>
                    </div>
                </div>
            </Modal.Header>

            <Form onSubmit={handleUpdate}>
                <Modal.Body className="py-4">
                    {errorMessage && (
                        <div className="alert alert-danger py-2 px-3 mb-3 small">
                            {errorMessage}
                        </div>
                    )}

                    <div className="member-info-preview p-3 mb-3 rounded bg-light border">
                        <div className="row g-2 small">
                            <div className="col-sm-4 text-muted fw-semibold">
                                Nhân viên:
                            </div>
                            <div className="col-sm-8 fw-bold text-slate-900">
                                {member?.username || 'Không tên'}
                            </div>

                            <div className="col-sm-4 text-muted fw-semibold">
                                Email:
                            </div>
                            <div className="col-sm-8 text-slate-700">
                                {member?.email || '-'}
                            </div>

                            <div className="col-sm-4 text-muted fw-semibold">
                                Vai trò hiện tại:
                            </div>
                            <div className="col-sm-8">
                                <span className="badge bg-secondary">
                                    {member?.roleInProject || 'Developer'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-slate-700">
                            Chọn vai trò mới trong dự án <span className="text-danger">*</span>
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
                            Việc thay đổi này chỉ áp dụng cho dự án này, không ảnh hưởng đến quyền hệ thống của nhân viên.
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
                        disabled={isSubmitting}
                        className="btn-save px-4"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Đang lưu...
                            </>
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalEditMemberRole;

