import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaTriangleExclamation } from 'react-icons/fa6';

const ModalDeleteProject = ({
    show,
    project,
    isDeleting,
    onHide,
    onConfirm,
}) => (
    <Modal
        show={show}
        onHide={onHide}
        centered
        className="project-modal-custom project-delete-modal"
        backdrop="static"
    >
        <Modal.Header closeButton className="project-modal-header bg-danger-subtle">
            <div className="d-flex align-items-center gap-2">
                <div className="modal-header-icon bg-danger text-white p-2 rounded-circle d-flex align-items-center justify-content-center">
                    <FaTriangleExclamation />
                </div>
                <div>
                    <Modal.Title className="fs-5 fw-bold text-danger mb-0">
                        Xác nhận xóa dự án
                    </Modal.Title>
                    <p className="modal-subtitle text-muted mb-0 small">
                        Thao tác loại bỏ dự án khỏi hệ thống quản lý
                    </p>
                </div>
            </div>
        </Modal.Header>
        <Modal.Body className="py-4">
            <p className="mb-2 text-slate-700">
                Bạn có chắc chắn muốn xóa dự án{' '}
                <strong className="text-danger fw-bold">{project?.name || ''}</strong>
                {project?.id && (
                    <span className="text-muted"> (Mã DA: #{project.id})</span>
                )}{' '}
                không?
            </p>
            <div className="alert alert-warning py-2 px-3 mb-0 small">
                <strong>Lưu ý:</strong> Hành động này sẽ xóa dữ liệu dự án khỏi cơ sở dữ liệu và không thể hoàn tác. Dự án có nhân sự được phân công sẽ không thể xóa.
            </div>
        </Modal.Body>
        <Modal.Footer className="project-modal-footer bg-light px-4 py-3">
            <Button
                variant="secondary"
                onClick={onHide}
                disabled={isDeleting}
                className="btn-cancel px-3"
            >
                Hủy
            </Button>
            <Button
                variant="danger"
                onClick={onConfirm}
                disabled={isDeleting}
                className="btn-delete px-4"
            >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
        </Modal.Footer>
    </Modal>
);

export default ModalDeleteProject;

