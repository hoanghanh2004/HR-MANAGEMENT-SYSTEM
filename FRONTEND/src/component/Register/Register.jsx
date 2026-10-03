import './Register.scss';
import { registerNewUser } from '../../services/userService';
import { useHistory } from 'react-router-dom';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { GiReturnArrow } from 'react-icons/gi';
import { FaUsers } from 'react-icons/fa6';

const Register = (props) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [comfirmPassword, setComfirmPassword] = useState('');
    const defaultValidInput = {
        isValidEmail: true,
        isValidPhone: true,
        isValidPassword: true,
        isValidComfirmPassword: true,
    };
    const [objCheckInput, setObjCheckInput] = useState(defaultValidInput);

    let history = useHistory();
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleLogin = () => {
        history.push('/login');
    };

    const isValidInputs = () => {
        setObjCheckInput(defaultValidInput);
        if (!email) {
            toast.error('Email is required!');
            setObjCheckInput({ ...defaultValidInput, isValidEmail: false });
            emailRef.current.focus();
            return false;
        }
        let regx = /\S+@\S+\.\S+/;
        if (!regx.test(email)) {
            setObjCheckInput({ ...defaultValidInput, isValidEmail: false });
            toast.error('Please enter a valid email address!');
            emailRef.current.focus();
            return false;
        }
        if (!phone) {
            setObjCheckInput({ ...defaultValidInput, isValidPhone: false });
            toast.error('Phone is required!');
            phoneRef.current.focus();
            return false;
        }
        if (!password) {
            setObjCheckInput({ ...defaultValidInput, isValidPassword: false });
            toast.error('Password is required!');
            passwordRef.current.focus();
            return false;
        }
        if (password !== comfirmPassword) {
            setObjCheckInput({ ...defaultValidInput, isValidComfirmPassword: false });
            toast.error('Your passwords do not match!');
            confirmPasswordRef.current.focus();
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        let check = isValidInputs();
        if (check === true) {
            let serverData = await registerNewUser(email, phone, username, password);
            if (+serverData.EC === 0) {
                toast.success(serverData.EM);
                history.push('/login');
            } else {
                toast.error(serverData.EM);
            }
        }
    };

    const handleNextEnter = (event, nextRef) => {
        if (event.key === 'Enter') {
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
    };
    const handleEnterRegister = (event) => {
        if (event.keyCode === 13 && event.code === 'Enter') {
            handleRegister();
        }
    };

    return (
        <div className="register-container">
            <main className="register-layout">
                <section className="register-brand-panel" aria-label="Giới thiệu hệ thống">
                    <div className="register-brand-lockup">
                        <span className="register-brand-icon" aria-hidden="true">
                            <FaUsers />
                        </span>
                        <div>
                            <p className="register-brand-kicker">HRMaster</p>
                            <h1>Hệ thống quản lý nhân sự</h1>
                        </div>
                    </div>
                    <div className="register-brand-copy">
                        <p>Tạo tài khoản để bắt đầu công việc</p>
                        <span>Quản lý nhân sự và phân quyền người dùng.</span>
                    </div>
                    <div className="register-brand-footer">
                        <span className="register-status-dot" aria-hidden="true" />
                        <span>Cổng thông tin nội bộ</span>
                    </div>
                </section>

                <section className="register-form-panel" aria-labelledby="register-heading">
                    <div className="register-form-content">
                        <div className="register-form-heading">
                            <p className="register-eyebrow">Khởi tạo tài khoản</p>
                            <h2 id="register-heading">Tạo tài khoản</h2>
                            <p>Đăng ký tài khoản để bắt đầu sử dụng hệ thống.</p>
                        </div>

                        <div className="register-fields">
                            <div className="register-field">
                                <label htmlFor="register-email">Email</label>
                                <input
                                    id="register-email"
                                    type="text"
                                    placeholder="Nhập địa chỉ email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className={objCheckInput.isValidEmail ? 'form-control' : 'form-control is-invalid'}
                                    onKeyDown={(event) => handleNextEnter(event, phoneRef)}
                                    ref={emailRef}
                                />
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-phone">Số điện thoại</label>
                                <input
                                    id="register-phone"
                                    type="text"
                                    placeholder="Nhập số điện thoại"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    className={objCheckInput.isValidPhone ? 'form-control' : 'form-control is-invalid'}
                                    onKeyDown={(event) => handleNextEnter(event, usernameRef)}
                                    ref={phoneRef}
                                />
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-username">Tên người dùng</label>
                                <input
                                    id="register-username"
                                    type="text"
                                    placeholder="Nhập tên người dùng"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    className="form-control"
                                    onKeyDown={(event) => handleNextEnter(event, passwordRef)}
                                    ref={usernameRef}
                                />
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-password">Mật khẩu</label>
                                <input
                                    id="register-password"
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className={objCheckInput.isValidPassword ? 'form-control' : 'form-control is-invalid'}
                                    onKeyDown={(event) => handleNextEnter(event, confirmPasswordRef)}
                                    ref={passwordRef}
                                />
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
                                <input
                                    id="register-confirm-password"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={comfirmPassword}
                                    onChange={(event) => setComfirmPassword(event.target.value)}
                                    className={
                                        objCheckInput.isValidComfirmPassword ? 'form-control' : 'form-control is-invalid'
                                    }
                                    onKeyDown={(event) => handleEnterRegister(event)}
                                    ref={confirmPasswordRef}
                                />
                            </div>
                        </div>

                        <button className="register-submit" onClick={() => handleRegister()}>
                            Đăng ký
                        </button>

                        <div className="register-login">
                            <span>Đã có tài khoản?</span>
                            <button className="login-link" onClick={() => handleLogin()}>
                                Đăng nhập
                            </button>
                        </div>

                        <Link to="/" className="register-home-link">
                            <GiReturnArrow aria-hidden="true" />
                            <span>Trở về trang chủ</span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};
export default Register;
