import { useState, useRef, useContext } from 'react';
import './Login.scss';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../../services/userService';
import { UserContext } from '../../context/UserContext';
import { GiReturnArrow } from 'react-icons/gi';
import { FaUsers } from 'react-icons/fa6';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const Login = (props) => {
    const { user, loginContext } = useContext(UserContext);
    let history = useHistory();
    const [valueLogin, setValueLogin] = useState('');
    const [password, setPassword] = useState('');

    const valueLoginRef = useRef(null);
    const passwordRef = useRef(null);

    const defaultObjValidInput = {
        isValidValueLogin: true,
        isValidPassword: true,
    };
    const [objValidInput, setObjValidInput] = useState(defaultObjValidInput);
    const handleKeyDown = (e, nextRef) => {
        if (e.key === 'Enter') {
            nextRef.current.focus();
        }
    };
    const handleCreateNewAccount = () => {
        history.push('/register');
    };
    const handleLogin = async () => {
        setObjValidInput(defaultObjValidInput);
        if (!valueLogin) {
            setObjValidInput({ ...defaultObjValidInput, isValidValueLogin: false });
            toast.error('Please enter your address email or phone number');
            return;
        }
        if (!password) {
            setObjValidInput({ ...defaultObjValidInput, isValidPassword: false });
            toast.error('Please enter your password');
            return;
        }
        let response = await loginUser(valueLogin, password);
        // console.log('>>>response', response);
        if (response && +response.EC === 0) {
            //success
            let groupWithRoles = response.DT.groupWithRoles;
            let email = response.DT.email;
            let username = response.DT.username;
            let token = response.DT.access_token;
            let data = {
                isAuthenticated: true,
                token,
                account: { groupWithRoles, email, username },
            };
            localStorage.setItem('jwt', token);
            loginContext(data);
            history.push('/users');
            // window.location.reload();
        }
        if (response && +response.EC !== 0) {
            //error
            toast.error(response.EM);
        }
    };
    const handlePressEnter = (event) => {
        if (event.keyCode === 13 && event.code === 'Enter') {
            handleLogin();
        }
    };
    // useEffect(() => {
    //     if (user && user.isAuthenticated) {
    //         history.push('/');
    //     }
    // }, user);
    return (
        <div className="login-container">
            <main className="login-layout">
                <section className="login-brand-panel" aria-label="Giới thiệu hệ thống">
                    <div className="login-brand-lockup">
                        <span className="login-brand-icon" aria-hidden="true">
                            <FaUsers />
                        </span>
                        <div>
                            <p className="login-brand-kicker">HR MANAGEMENT</p>
                            <h1>Hệ thống quản lý nhân sự</h1>
                        </div>
                    </div>
                    <div className="login-brand-copy">
                        <p>Quản lý nhân sự và phân quyền người dùng</p>
                        <span>Một không gian làm việc thống nhất cho đội ngũ của bạn.</span>
                    </div>
                    <div className="login-brand-footer">
                        <span className="login-status-dot" aria-hidden="true" />
                        <span>Cổng thông tin nội bộ</span>
                    </div>
                </section>

                <section className="login-form-panel" aria-labelledby="login-heading">
                    <div className="login-form-content">
                        <div className="login-form-heading">
                            <p className="login-eyebrow">Chào mừng trở lại</p>
                            <h2 id="login-heading">Đăng nhập</h2>
                            <p>Đăng nhập để tiếp tục vào hệ thống</p>
                        </div>
                        <div className="login-fields">
                            <div className="login-field">
                                <label htmlFor="login-identifier">Email hoặc số điện thoại</label>
                                <input
                                    id="login-identifier"
                                    ref={valueLoginRef}
                                    type="text"
                                    placeholder="Nhập email hoặc số điện thoại"
                                    className={objValidInput.isValidValueLogin ? 'form-control' : 'form-control is-invalid'}
                                    value={valueLogin}
                                    onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                                    onChange={(event) => setValueLogin(event.target.value)}
                                />
                            </div>
                            <div className="login-field">
                                <label htmlFor="login-password">Mật khẩu</label>
                                <input
                                    id="login-password"
                                    ref={passwordRef}
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    className={objValidInput.isValidPassword ? 'form-control' : 'form-control is-invalid'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    onKeyDown={(event) => handlePressEnter(event)}
                                />
                            </div>
                        </div>
                        <button className="login-submit" onClick={() => handleLogin()}>
                            Đăng nhập
                        </button>
                        <div className="login-form-links">
                            <a className="forgot-pass" href="https">
                                Quên mật khẩu?
                            </a>
                        </div>
                        <div className="login-register">
                            <span>Chưa có tài khoản?</span>
                            <button className="register-link" onClick={() => handleCreateNewAccount()}>
                                Tạo tài khoản mới
                            </button>
                        </div>
                        <Link to="/" className="login-home-link">
                            <GiReturnArrow aria-hidden="true" />
                            <span>Trở về trang chủ</span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};
export default Login;