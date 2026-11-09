import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaTriangleExclamation, FaUserMinus } from 'react-icons/fa6';

const ModalConfirmRemoveMember = ({
    show,
    member,
    projectName,
    isRemoving,
    onHide,
    onConfirm,
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            className="project-modal-custom project-delete-modal"
        >
            <Modal.Header closeButton className="project-modal-header bg-danger-subtle">
                <div className="d-flex align-items-center gap-2">
                    <div className="modal-header-icon bg-danger text-white p-2 rounded-circle d-flex align-items-center justify-content-center">
                        <FaTriangleExclamation />
                    </div>
                    <div>
                        <Modal.Title className="fs-5 fw-bold text-danger mb-0">
                            Xác nhận xóa thành viên khỏi dự án
                        </Modal.Title>
                        <p className="modal-subtitle text-muted mb-0 small">
                            Thao tác hủy phân công nhân sự trong dự án
                        </p>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="py-4">
                <p className="mb-2 text-slate-700">
                    Bạn có chắc chắn muốn xóa nhân viên{' '}
                    <strong className="text-danger fw-bold">
                        {member?.username || member?.email || 'N/A'}
                    </strong>{' '}
                    {member?.roleInProject && (
                        <span className="text-muted">
                            (Vai trò: {member.roleInProject})
                        </span>
                    )}{' '}
                    khỏi dự án <strong className="text-primary">{projectName}</strong> không?
                </p>

                <div className="alert alert-warning py-2 px-3 mb-0 small">
                    <strong>Lưu ý:</strong> Hành động này chỉ xóa liên kết phân công của nhân viên trong dự án này. Tài khoản người dùng và dữ liệu nhân sự trên hệ thống vẫn được giữ nguyên vẹn.
                </div>
            </Modal.Body>

            <Modal.Footer className="project-modal-footer bg-light px-4 py-3">
                <Button
                    variant="secondary"
                    onClick={onHide}
                    disabled={isRemoving}
                    className="btn-cancel px-3"
                >
                    Hủy
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    disabled={isRemoving}
                    className="btn-delete px-4"
                >
                    {isRemoving ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            Đang xóa...
                        </>
                    ) : (
                        <>
                            <FaUserMinus className="me-1" />
                            Xác nhận xóa
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalConfirmRemoveMember;

