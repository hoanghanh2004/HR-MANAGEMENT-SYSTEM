import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaTriangleExclamation } from 'react-icons/fa6';

const ModalDeleteDepartment = ({
    show,
    department,
    isDeleting,
    onHide,
    onConfirm,
}) => (
    <Modal
        show={show}
        onHide={onHide}
        centered
        className="department-modal-custom department-delete-modal"
        backdrop="static"
    >
        <Modal.Header closeButton className="department-modal-header bg-danger-subtle">
            <div className="d-flex align-items-center gap-2">
                <div className="modal-header-icon bg-danger text-white">
                    <FaTriangleExclamation />
                </div>
                <div>
                    <Modal.Title className="fs-5 fw-bold text-danger mb-0">
                        Xác nhận xóa phòng ban
                    </Modal.Title>
                    <p className="modal-subtitle text-muted mb-0">
                        Thao tác loại bỏ đơn vị khỏi cơ cấu tổ chức
                    </p>
                </div>
            </div>
        </Modal.Header>
        <Modal.Body className="py-4">
            <p className="mb-2 text-slate-700">
                Bạn có chắc chắn muốn xóa phòng ban{' '}
                <strong className="text-danger fw-bold">{department?.name || ''}</strong>
                {department?.id && (
                    <span className="text-muted"> (Mã PB: PB-{String(department.id).padStart(3, '0')})</span>
                )}{' '}
                không?
            </p>
            <div className="alert alert-warning py-2 px-3 mb-0 small">
                <strong>Lưu ý:</strong> Hành động này sẽ xóa dữ liệu phòng ban khỏi cơ sở dữ liệu và không thể hoàn tác.
            </div>
        </Modal.Body>
        <Modal.Footer className="department-modal-footer bg-light px-4 py-3">
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
                {isDeleting ? 'Đang xóa...' : 'Xóa phòng ban'}
            </Button>
        </Modal.Footer>
    </Modal>
);

export default ModalDeleteDepartment;
