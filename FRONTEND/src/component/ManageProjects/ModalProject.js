import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { toast } from 'react-toastify';
import { createProject, updateProject } from '../../services/projectService';
import { FaDiagramProject } from 'react-icons/fa6';

const STATUS_OPTIONS = [
    { value: 'PLANNING', label: 'Đang lên kế hoạch' },
    { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
    { value: 'ON_HOLD', label: 'Tạm hoãn' },
    { value: 'COMPLETED', label: 'Đã hoàn thành' },
];

const ModalProject = ({ show, action, project, onHide, onSaved }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('PLANNING');

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (action === 'UPDATE' && project) {
            setName(project.name || '');
            setDescription(project.description || '');
            setStartDate(project.startDate || '');
            setEndDate(project.endDate || '');
            setStatus(project.status || 'PLANNING');
        } else {
            setName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            setStatus('PLANNING');
        }
        setErrors({});
    }, [action, project, show]);

    const validateForm = () => {
        const newErrors = {};
        const trimmedName = name.trim();

        if (!trimmedName) {
            newErrors.name = 'Vui lòng nhập tên dự án.';
        } else if (trimmedName.length > 255) {
            newErrors.name = 'Tên dự án không được vượt quá 255 ký tự.';
        }

        if (startDate && endDate) {
            if (endDate < startDate) {
                newErrors.endDate = 'Ngày kết thúc không được sớm hơn ngày bắt đầu.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const projectData = {
                name: name.trim(),
                description: description.trim(),
                startDate: startDate || null,
                endDate: endDate || null,
                status: status || 'PLANNING',
            };

            const response =
                action === 'CREATE'
                    ? await createProject(projectData)
                    : await updateProject({ id: project.id, ...projectData });

            if (response && +response.EC === 0) {
                toast.success(
                    response.EM ||
                        (action === 'CREATE'
                            ? 'Tạo mới dự án thành công!'
                            : 'Cập nhật dự án thành công!')
                );
                onSaved();
            } else {
                const message = response?.EM || 'Không thể lưu thông tin dự án.';
                toast.error(message);
                if (response?.DT === 'name') {
                    setErrors((prev) => ({ ...prev, name: message }));
                } else if (response?.DT === 'endDate') {
                    setErrors((prev) => ({ ...prev, endDate: message }));
                }
            }
        } catch (error) {
            console.error('Save project error:', error);
            const message =
                error?.response?.data?.EM || 'Lỗi kết nối khi lưu thông tin dự án.';
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
            size="lg"
            className="project-modal-custom"
            backdrop="static"
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton className="project-modal-header">
                    <div className="d-flex align-items-center gap-2">
                        <div className="modal-header-icon">
                            <FaDiagramProject />
                        </div>
                        <div>
                            <Modal.Title className="modal-title fs-5 fw-bold text-slate-900 mb-0">
                                {action === 'CREATE' ? 'Thêm dự án mới' : 'Cập nhật dự án'}
                            </Modal.Title>
                            <p className="modal-subtitle text-muted mb-0 small">
                                {action === 'CREATE'
                                    ? 'Khởi tạo thông tin và kế hoạch thực hiện dự án mới'
                                    : `Chỉnh sửa thông tin dự án #${project?.id || ''}`}
                            </p>
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body className="project-modal-body py-4">
                    {/* Tên dự án */}
                    <Form.Group className="mb-3" controlId="projectName">
                        <Form.Label className="fw-semibold text-slate-700 mb-1">
                            Tên dự án <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            autoFocus
                            type="text"
                            placeholder="VD: Xây dựng Website HR Management System..."
                            value={name}
                            isInvalid={Boolean(errors.name)}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) {
                                    setErrors((prev) => ({ ...prev, name: '' }));
                                }
                            }}
                            maxLength={255}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Mô tả dự án */}
                    <Form.Group className="mb-3" controlId="projectDescription">
                        <Form.Label className="fw-semibold text-slate-700 mb-1">
                            Mô tả dự án
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Nhập mô tả mục tiêu, phạm vi hoặc ghi chú dự án..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                        />
                    </Form.Group>

                    <Row>
                        {/* Ngày bắt đầu */}
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="projectStartDate">
                                <Form.Label className="fw-semibold text-slate-700 mb-1">
                                    Ngày bắt đầu
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    isInvalid={Boolean(errors.startDate)}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        if (errors.endDate) {
                                            setErrors((prev) => ({ ...prev, endDate: '' }));
                                        }
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.startDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        {/* Ngày kết thúc */}
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="projectEndDate">
                                <Form.Label className="fw-semibold text-slate-700 mb-1">
                                    Ngày kết thúc
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    isInvalid={Boolean(errors.endDate)}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        if (errors.endDate) {
                                            setErrors((prev) => ({ ...prev, endDate: '' }));
                                        }
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.endDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Trạng thái dự án */}
                    <Form.Group className="mb-3" controlId="projectStatus">
                        <Form.Label className="fw-semibold text-slate-700 mb-1">
                            Trạng thái dự án
                        </Form.Label>
                        <Form.Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label} ({opt.value})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer className="project-modal-footer bg-light px-4 py-3">
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
                        {isSaving
                            ? 'Đang lưu...'
                            : action === 'CREATE'
                            ? 'Tạo dự án'
                            : 'Lưu thay đổi'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalProject;

