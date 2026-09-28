import { useState, useRef, useContext } from 'react';
import './Login.scss';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../../services/userService';
import imglogo from '../../assets/images/reactred.png';
import { UserContext } from '../../context/UserContext';
import { GiReturnArrow } from 'react-icons/gi';
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
            <div className="container">
                <div className="row d-flex justify-content-center px-3">
                    <div className="content-left col-7 d-none d-xxl-block">
                        <div className="brand">
                            <h3>Ứng Dụng Quản Lý Và Phân Quyền Người Dùng!</h3>
                        </div>
                        <div className="detail">
                            <img src={imglogo} alt="" />
                        </div>
                    </div>
                    <div className="content-right col-5 col-xl-12 d-flex flex-column gap-3 py-3">
                        <div className="brand d-xxl-none">
                            <h1></h1>
                        </div>
                        <input
                            ref={valueLoginRef}
                            type="text"
                            placeholder="Email address or phone number"
                            className={objValidInput.isValidValueLogin ? 'form-control' : 'form-control is-invalid'}
                            value={valueLogin}
                            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                            onChange={(event) => setValueLogin(event.target.value)}
                        />
                        <input
                            ref={passwordRef}
                            type="password"
                            placeholder="Password"
                            className={objValidInput.isValidPassword ? 'form-control' : 'form-control is-invalid'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            onKeyDown={(event) => handlePressEnter(event)}
                        />
                        <button className="btn btn-primary" onClick={() => handleLogin()}>
                            Login
                        </button>
                        <span className="text-center">
                            <a className="forgot-pass" href="https">
                                Forgot your password?
                            </a>
                        </span>
                        <hr />
                        <div className="text-center">
                            <button className="btn btn-success" onClick={() => handleCreateNewAccount()}>
                                Create new account
                            </button>
                            <div className="return mt-4">
                                <Link to="/" className="no-underline">
                                    <GiReturnArrow className="back-arrow" />
                                    <h5 className="return-home">Return to HomePage</h5>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
