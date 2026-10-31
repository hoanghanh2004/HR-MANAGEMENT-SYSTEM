import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import _ from 'lodash';
import './Users.scss';
import {
    fetchGroup,
    createNewUser,
    updateCurrentUser,
    uploadUserAvatar,
} from '../../services/userService';
import { fetchAllDepartments } from '../../services/departmentService';
import {
    FaCamera,
    FaXmark,
    FaUser,
    FaBriefcase,
    FaShieldHalved,
    FaArrowsRotate,
} from 'react-icons/fa6';

const BACKEND_URL = 'http://localhost:6969';

const defaultUserData = {
    email: '',
    phone: '',
    username: '',
    password: '',
    address: '',
    sex: 'Male',
    group: '',
    departmentId: '',
    jobTitle: '',
    hireDate: '',
    employmentStatus: 'ACTIVE',
    avatar: '',
};

const validInputDefault = {
    email: true,
    phone: true,
    username: true,
    password: true,
    address: true,
    sex: true,
    group: true,
    jobTitle: true,
    hireDate: true,
};

const ModalUser = (props) => {
    const { action, dataModalUser, show, onHide } = props;

    const [userData, setUserData] = useState(defaultUserData);
    const [validInput, setValidInput] = useState(validInputDefault);
    const [userGroups, setUserGroups] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);

    // Avatar upload states
    const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    // Load Group và Department khi component mount
    useEffect(() => {
        loadGroups();
        loadDepartments();
    }, []);

    // Khởi tạo form khi mở modal hoặc thay đổi action / dataModalUser
    useEffect(() => {
        if (!show) return;

        if (action === 'UPDATE' && dataModalUser && dataModalUser.id) {
            setUserData({
                id: dataModalUser.id,
                email: dataModalUser.email || '',
                phone: dataModalUser.phone || '',
                username: dataModalUser.username || '',
                password: '',
                address: dataModalUser.address || '',
                sex: dataModalUser.sex || 'Male',
                group: dataModalUser.Group ? dataModalUser.Group.id : (dataModalUser.groupId || ''),
                departmentId: dataModalUser.Department
                    ? dataModalUser.Department.id
                    : (dataModalUser.departmentId || ''),
                jobTitle: dataModalUser.jobTitle || '',
                hireDate: dataModalUser.hireDate ? String(dataModalUser.hireDate).slice(0, 10) : '',
                employmentStatus: dataModalUser.employmentStatus || 'ACTIVE',
                avatar: dataModalUser.avatar || '',
            });
            setSelectedAvatarFile(null);
            setAvatarPreviewUrl('');
            setValidInput(validInputDefault);
        } else if (action === 'CREATE') {
            setUserData({
                ...defaultUserData,
                group: userGroups.length > 0 ? userGroups[0].id : '',
            });
            setSelectedAvatarFile(null);
            setAvatarPreviewUrl('');
            setValidInput(validInputDefault);
        }
    }, [show, action, dataModalUser, userGroups]);

    const loadGroups = async () => {
        try {
            let res = await fetchGroup();
            if (res && +res.EC === 0) {
                setUserGroups(res.DT || []);
            }
        } catch (error) {
            console.error('Fetch groups error:', error);
        }
    };

    const loadDepartments = async () => {
        try {
            let res = await fetchAllDepartments();
            if (res && +res.EC === 0) {
                setDepartmentsList(res.DT || []);
            }
        } catch (error) {
            console.error('Fetch departments error:', error);
        }
    };

    const handleOnchangeInput = (value, name) => {
        let _userData = _.cloneDeep(userData);
        _userData[name] = value;
        setUserData(_userData);

        // Xóa cảnh báo invalid khi người dùng đang nhập lại
        if (!validInput[name]) {
            setValidInput((prev) => ({ ...prev, [name]: true }));
        }
    };

    // Xử lý chọn file ảnh đại diện
    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // 1. Kiểm tra định dạng đuôi file và MIME type
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!validExtensions.includes(fileExt) || !validMimeTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG hoặc WEBP!');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // 2. Kiểm tra dung lượng (tối đa 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            toast.error('Dung lượng ảnh vượt quá giới hạn 2MB! Vui lòng chọn ảnh nhỏ hơn.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setSelectedAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
    };

    // Hủy bỏ chọn ảnh mới (quay lại ảnh hiện tại)
    const handleCancelAvatar = () => {
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Lấy URL hiển thị ảnh đại diện
    const getAvatarSrc = () => {
        if (avatarPreviewUrl) {
            return avatarPreviewUrl; // Blob URL xem trước
        }
        if (userData.avatar) {
            if (userData.avatar.startsWith('http')) {
                return userData.avatar;
            }
            return `${BACKEND_URL}${userData.avatar}`;
        }
        return '';
    };

    const checkValidInput = () => {
        setValidInput(validInputDefault);

        // Khi Update, chỉ kiểm tra group
        if (action === 'UPDATE') {
            if (!userData.group) {
                setValidInput((prev) => ({ ...prev, group: false }));
                toast.error('Vui lòng chọn Nhóm quyền cho người dùng!');
                return false;
            }
            if (userData.jobTitle && userData.jobTitle.length > 255) {
                setValidInput((prev) => ({ ...prev, jobTitle: false }));
                toast.error('Chức danh công việc không được vượt quá 255 ký tự!');
                return false;
            }
            return true;
        }

        // Khi Create, kiểm tra email, phone, password, group
        let check = true;
        let _valid = _.cloneDeep(validInputDefault);

        if (!userData.email || !userData.email.trim()) {
            _valid.email = false;
            toast.error('Email không được để trống!');
            check = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email.trim())) {
                _valid.email = false;
                toast.error('Địa chỉ email không đúng định dạng!');
                check = false;
            }
        }

        if (check && (!userData.phone || !userData.phone.trim())) {
            _valid.phone = false;
            toast.error('Số điện thoại không được để trống!');
            check = false;
        }

        if (check && (!userData.password || !userData.password.trim())) {
            _valid.password = false;
            toast.error('Mật khẩu không được để trống khi tạo mới!');
            check = false;
        }

        if (check && !userData.group) {
            _valid.group = false;
            toast.error('Vui lòng chọn Nhóm quyền cho người dùng!');
            check = false;
        }

        if (check && userData.jobTitle && userData.jobTitle.length > 255) {
            _valid.jobTitle = false;
            toast.error('Chức danh công việc không được vượt quá 255 ký tự!');
            check = false;
        }

        setValidInput(_valid);
        return check;
    };

    // Xử lý gửi form (Hai bước: Upload avatar trước nếu có, sau đó Create/Update User)
    const handleConfirmUser = async () => {
        const isValid = checkValidInput();
        if (!isValid) return;

        setIsSubmitting(true);
        let uploadedAvatarPath = null;

        try {
            // Bước 1: Upload avatar nếu có chọn ảnh mới
            if (selectedAvatarFile) {
                const formData = new FormData();
                formData.append('avatar', selectedAvatarFile);

                let uploadRes;
                try {
                    uploadRes = await uploadUserAvatar(formData);
                } catch (uploadErr) {
                    console.error('Upload avatar error:', uploadErr);
                    const errMsg =
                        uploadErr?.response?.data?.EM ||
                        'Lỗi khi tải ảnh đại diện lên server!';
                    toast.error(errMsg);
                    setIsSubmitting(false);
                    return;
                }

                if (uploadRes && +uploadRes.EC === 0 && uploadRes.DT?.avatarUrl) {
                    uploadedAvatarPath = uploadRes.DT.avatarUrl;
                } else {
                    toast.error(uploadRes?.EM || 'Không thể tải ảnh đại diện!');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Bước 2: Gọi API Create hoặc Update User
            let res;
            if (action === 'CREATE') {
                const createPayload = {
                    email: (userData.email || '').trim(),
                    phone: (userData.phone || '').trim(),
                    username: (userData.username || '').trim(),
                    password: userData.password,
                    address: (userData.address || '').trim(),
                    sex: userData.sex || 'Male',
                    groupId: userData.group ? Number(userData.group) : '',
                    departmentId: userData.departmentId ? Number(userData.departmentId) : null,
                    jobTitle: userData.jobTitle ? userData.jobTitle.trim() : null,
                    hireDate: userData.hireDate || null,
                    employmentStatus: userData.employmentStatus || 'ACTIVE',
                    avatar: uploadedAvatarPath || null,
                };
                res = await createNewUser(createPayload);
            } else {
                const updatePayload = {
                    id: userData.id,
                    username: (userData.username || '').trim(),
                    address: (userData.address || '').trim(),
                    sex: userData.sex || 'Male',
                    groupId: userData.group ? Number(userData.group) : '',
                    departmentId:
                        userData.departmentId !== ''
                            ? (userData.departmentId ? Number(userData.departmentId) : null)
                            : null,
                    jobTitle:
                        userData.jobTitle !== undefined
                            ? (userData.jobTitle ? userData.jobTitle.trim() : null)
                            : undefined,
                    hireDate:
                        userData.hireDate !== undefined
                            ? (userData.hireDate || null)
                            : undefined,
                    employmentStatus: userData.employmentStatus || 'ACTIVE',
                };
                if (uploadedAvatarPath) {
                    updatePayload.avatar = uploadedAvatarPath;
                }
                res = await updateCurrentUser(updatePayload);
            }

            if (res && +res.EC === 0) {
                toast.success(
                    res.EM ||
                    (action === 'CREATE'
                        ? 'Tạo mới người dùng thành công!'
                        : 'Cập nhật thông tin người dùng thành công!')
                );
                handleCloseModalUser();
            } else {
                toast.error(res?.EM || 'Thao tác lưu thông tin thất bại!');
                if (res?.DT && validInputDefault[res.DT] !== undefined) {
                    setValidInput((prev) => ({ ...prev, [res.DT]: false }));
                }
            }
        } catch (error) {
            console.error('Submit user error:', error);
            const errMsg =
                error?.response?.data?.EM || 'Lỗi khi gửi yêu cầu lên server!';
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModalUser = () => {
        setUserData(defaultUserData);
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl('');
        setValidInput(validInputDefault);
        setIsSubmitting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onHide();
    };

    const avatarSrc = getAvatarSrc();

    return (
        <Modal
            size="lg"
            show={show}
            className="modal-user"
            onHide={handleCloseModalUser}
            backdrop="static"
            keyboard={!isSubmitting}
        >
            <Modal.Header closeButton={!isSubmitting}>
                <Modal.Title id="contained-modal-title-vcenter">
                    <span className="modal-title-accent">
                        {action === 'CREATE'
                            ? 'Thêm mới tài khoản & hồ sơ nhân viên'
                            : 'Chỉnh sửa hồ sơ nhân viên'}
                    </span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-user-body">
                <form onSubmit={(e) => e.preventDefault()}>
                    {/* NHÓM C: ẢNH ĐẠI DIỆN (Đưa lên đầu trực quan) */}
                    <div className="form-section-card avatar-section-card mb-4">
                        <div className="section-title-wrap">
                            <FaCamera className="section-title-icon" />
                            <h6 className="section-title mb-0">ẢNH ĐẠI DIỆN (AVATAR)</h6>
                        </div>

                        <div className="avatar-content-wrap">
                            <div className="avatar-preview-box">
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt="Avatar Preview"
                                        className="avatar-img-preview"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <FaUser className="placeholder-icon" />
                                    </div>
                                )}
                            </div>

                            <div className="avatar-actions-wrap">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    disabled={isSubmitting}
                                />
                                <div className="avatar-btn-row">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                        disabled={isSubmitting}
                                    >
                                        <FaCamera className="me-1" />
                                        {avatarSrc ? 'Thay đổi ảnh' : 'Chọn ảnh đại diện'}
                                    </button>

                                    {selectedAvatarFile && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={handleCancelAvatar}
                                            disabled={isSubmitting}
                                            title="Hủy bỏ ảnh vừa chọn"
                                        >
                                            <FaXmark className="me-1" />
                                            Hủy chọn
                                        </button>
                                    )}
                                </div>

                                <div className="avatar-guide-text">
                                    {selectedAvatarFile ? (
                                        <span className="text-success fw-bold">
                                            Đã chọn: {selectedAvatarFile.name} ({Math.round(selectedAvatarFile.size / 1024)} KB)
                                        </span>
                                    ) : (
                                        <span className="text-muted">
                                            Định dạng: JPG, PNG, WEBP. Dung lượng tối đa: 2MB.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NHÓM A: THÔNG TIN CƠ BẢN */}
                    <div className="form-section-card mb-4">
                        <div className="section-title-wrap">
                            <FaShieldHalved className="section-title-icon" />
                            <h6 className="section-title mb-0">THÔNG TIN TÀI KHOẢN & CƠ BẢN</h6>
                        </div>

                        <div className="row g-3">
                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">
                                    Email đăng nhập: (<span className="red">*</span>)
                                </label>
                                <input
                                    disabled={action === 'UPDATE' || isSubmitting}
                                    className={validInput.email ? 'form-control' : 'form-control is-invalid'}
                                    type="email"
                                    placeholder="example@company.com"
                                    value={userData.email || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'email')}
                                />
                                {action === 'UPDATE' && (
                                    <small className="text-muted form-hint">
                                        Email dùng để xác thực hệ thống, không được sửa đổi.
                                    </small>
                                )}
                            </div>

                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">
                                    Số điện thoại: (<span className="red">*</span>)
                                </label>
                                <input
                                    disabled={action === 'UPDATE' || isSubmitting}
                                    className={validInput.phone ? 'form-control' : 'form-control is-invalid'}
                                    type="text"
                                    placeholder="0901234567"
                                    value={userData.phone || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'phone')}
                                />
                                {action === 'UPDATE' && (
                                    <small className="text-muted form-hint">
                                        Số điện thoại liên kết tài khoản, không được sửa đổi.
                                    </small>
                                )}
                            </div>

                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">Họ và tên nhân viên:</label>
                                <input
                                    disabled={isSubmitting}
                                    className={validInput.username ? 'form-control' : 'form-control is-invalid'}
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    value={userData.username || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'username')}
                                />
                            </div>

                            {action === 'CREATE' && (
                                <div className="col-12 col-md-6 form-group">
                                    <label className="form-label">
                                        Mật khẩu: (<span className="red">*</span>)
                                    </label>
                                    <input
                                        disabled={isSubmitting}
                                        className={validInput.password ? 'form-control' : 'form-control is-invalid'}
                                        type="password"
                                        placeholder="Nhập mật khẩu khởi tạo"
                                        value={userData.password || ''}
                                        onChange={(event) => handleOnchangeInput(event.target.value, 'password')}
                                    />
                                </div>
                            )}

                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">Giới tính:</label>
                                <select
                                    disabled={isSubmitting}
                                    className="form-select"
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'sex')}
                                    value={userData.sex || 'Male'}
                                >
                                    <option value="Male">Nam (Male)</option>
                                    <option value="Female">Nữ (Female)</option>
                                    <option value="Other">Khác (Other)</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">
                                    Nhóm quyền (RBAC): (<span className="red">*</span>)
                                </label>
                                <select
                                    disabled={isSubmitting}
                                    className={validInput.group ? 'form-select' : 'form-select is-invalid'}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'group')}
                                    value={userData.group}
                                >
                                    <option value="">-- Chọn nhóm quyền --</option>
                                    {userGroups.length > 0 &&
                                        userGroups.map((item) => (
                                            <option key={`group-${item.id}`} value={item.id}>
                                                {item.name} {item.description ? `- ${item.description}` : ''}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="col-12 form-group">
                                <label className="form-label">Địa chỉ cư trú:</label>
                                <input
                                    disabled={isSubmitting}
                                    className={validInput.address ? 'form-control' : 'form-control is-invalid'}
                                    type="text"
                                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                                    value={userData.address || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'address')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* NHÓM B: THÔNG TIN CÔNG VIỆC & NHÂN SỰ */}
                    <div className="form-section-card mb-2">
                        <div className="section-title-wrap">
                            <FaBriefcase className="section-title-icon" />
                            <h6 className="section-title mb-0">THÔNG TIN CÔNG VIỆC & CƠ CẤU PHÒNG BAN</h6>
                        </div>

                        <div className="row g-3">
                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">Phòng ban trực thuộc:</label>
                                <select
                                    disabled={isSubmitting}
                                    className="form-select"
                                    value={userData.departmentId || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'departmentId')}
                                >
                                    <option value="">-- Chưa phân bổ phòng ban --</option>
                                    {departmentsList.length > 0 &&
                                        departmentsList.map((dept) => (
                                            <option key={`dept-${dept.id}`} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                </select>
                                <small className="text-muted form-hint">
                                    Để trống nếu nhân viên mới chưa được gán đơn vị cụ thể.
                                </small>
                            </div>

                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">Chức danh công việc:</label>
                                <input
                                    disabled={isSubmitting}
                                    className={validInput.jobTitle ? 'form-control' : 'form-control is-invalid'}
                                    type="text"
                                    placeholder="Ví dụ: Senior Frontend Engineer, Kế toán tổng hợp..."
                                    value={userData.jobTitle || ''}
                                    maxLength={255}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'jobTitle')}
                                />
                            </div>

                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">Ngày vào làm việc:</label>
                                <input
                                    disabled={isSubmitting}
                                    className={validInput.hireDate ? 'form-control' : 'form-control is-invalid'}
                                    type="date"
                                    value={userData.hireDate || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'hireDate')}
                                />
                                <small className="text-muted form-hint">
                                    Định dạng lưu trữ hệ thống: YYYY-MM-DD.
                                </small>
                            </div>

                            <div className="col-12 col-md-6 form-group">
                                <label className="form-label">Trạng thái công tác:</label>
                                <select
                                    disabled={isSubmitting}
                                    className="form-select"
                                    value={userData.employmentStatus || 'ACTIVE'}
                                    onChange={(event) =>
                                        handleOnchangeInput(event.target.value, 'employmentStatus')
                                    }
                                >
                                    <option value="ACTIVE">Đang làm việc (ACTIVE)</option>
                                    <option value="PROBATION">Thử việc (PROBATION)</option>
                                    <option value="RESIGNED">Đã nghỉ việc (RESIGNED)</option>
                                    <option value="LEAVE">Nghỉ phép / Tạm nghỉ (LEAVE)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleCloseModalUser}
                    disabled={isSubmitting}
                >
                    Đóng
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirmUser}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <FaArrowsRotate className="spin me-2" />
                            Đang xử lý...
                        </>
                    ) : action === 'CREATE' ? (
                        'Tạo nhân viên'
                    ) : (
                        'Lưu thay đổi'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalUser;
