import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { createDepartment, updateDepartment } from '../../services/departmentService';
import { FaBuilding } from 'react-icons/fa6';

const ModalDepartment = ({ show, action, department, onHide, onSaved }) => {
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(action === 'UPDATE' && department ? department.name : '');
        setErrorMessage('');
    }, [action, department, show]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const normalizedName = name.trim();
        if (!normalizedName) {
            setErrorMessage('Vui lòng nhập tên phòng ban.');
            return;
        }

        setIsSaving(true);
        setErrorMessage('');
        try {
            const response =
                action === 'CREATE'
                    ? await createDepartment({ name: normalizedName })
                    : await updateDepartment({ id: department.id, name: normalizedName });

            if (response && +response.EC === 0) {
                toast.success(response.EM);
                onSaved();
            } else {
                const message = response?.EM || 'Không thể lưu phòng ban.';
                setErrorMessage(message);
                toast.error(message);
            }
        } catch (error) {
            const message =
                error?.response?.data?.EM || 'Lỗi kết nối khi lưu phòng ban.';
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="department-modal-custom"
            backdrop="static"
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton className="department-modal-header">
                    <div className="d-flex align-items-center gap-2">
                        <div className="modal-header-icon">
                            <FaBuilding />
                        </div>
                        <div>
                            <Modal.Title className="modal-title fs-5 fw-bold text-slate-900 mb-0">
                                {action === 'CREATE' ? 'Thêm phòng ban' : 'Sửa phòng ban'}
                            </Modal.Title>
                            <p className="modal-subtitle text-muted mb-0">
                                {action === 'CREATE'
                                    ? 'Khởi tạo thực thể đơn vị vào sơ đồ cơ cấu tổ chức'
                                    : 'Cập nhật tên và thông tin nhận diện của phòng ban'}
                            </p>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="department-modal-body py-4">
                    <Form.Group controlId="departmentName">
                        <Form.Label className="fw-semibold text-slate-700 mb-1">
                            Tên phòng ban <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            autoFocus
                            type="text"
                            placeholder="VD: Phòng Kỹ thuật & Công nghệ, Phòng Nhân sự..."
                            value={name}
                            isInvalid={Boolean(errorMessage)}
                            onChange={(event) => {
                                setName(event.target.value);
                                setErrorMessage('');
                            }}
                            maxLength={255}
                            required
                            className="department-input py-2"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessage}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted d-block mt-2">
                            Tên phòng ban phải là duy nhất và không được trùng lặp trong hệ thống.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="department-modal-footer bg-light px-4 py-3">
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={isSaving}
                        className="btn-cancel px-3"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSaving}
                        className="btn-save px-4"
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalDepartment;
