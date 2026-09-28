import './Register.scss';
import { registerNewUser } from '../../services/userService';
import { useHistory } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imglogo from '../../assets/images/reactred.png';
// import { UserContext } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import { GiReturnArrow } from 'react-icons/gi';

const Register = (props) => {
    // const { user, loginContext } = UserContext(UserContext);
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

    // useEffect(() => {
    //     // axios.get('http://localhost:6969/api/v1/test-api').then((data) => {
    //     //     console.log('>>>>>>>>>>>>>>>>>>>Check Data', data);
    //     // });
    // }, []);

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
    // useEffect(() => {
    //     if (user && user.isAuthenticated) {
    //         history.push('/');
    //     }
    // }, [user]);
    return (
        <div className="register-container">
            <div className="container">
                <div className="row px-3 px-sm-0">
                    <div className="content-left d-none col-xl-7 d-xl-block">
                        <div className="brand">
                            <h3>Ứng Dụng Quản Lý Và Phân Quyền Người Dùng!</h3>
                        </div>
                        <div className="detail">
                            <img src={imglogo} alt="" />
                            <h3>Hoang Hanh</h3>
                        </div>
                    </div>
                    <div className="content-right col-12 col-xl-5 d-flex flex-column gap-3 py-3">
                        <div className="brand d-sm-none">
                            <h3>Ứng Dụng Quản Lý Và Phân Quyền Người Dùng!</h3>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="text"
                                placeholder="Email address"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className={objCheckInput.isValidEmail ? 'form-control' : 'form-control is-invalid'}
                                onKeyDown={(event) => handleNextEnter(event, phoneRef)}
                                ref={emailRef}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="Phone number"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                className={objCheckInput.isValidPhone ? 'form-control' : 'form-control is-invalid'}
                                onKeyDown={(event) => handleNextEnter(event, usernameRef)}
                                ref={phoneRef}
                            />
                        </div>
                        <div className="form-group">
                            <label>User Name</label>
                            <input
                                type="text"
                                placeholder="User Name"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                className="form-control"
                                onKeyDown={(event) => handleNextEnter(event, passwordRef)}
                                ref={usernameRef}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className={objCheckInput.isValidPassword ? 'form-control' : 'form-control is-invalid'}
                                onKeyDown={(event) => handleNextEnter(event, confirmPasswordRef)}
                                ref={passwordRef}
                            />
                        </div>
                        <div className="form-group">
                            <label>Re-enter Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter password"
                                value={comfirmPassword}
                                onChange={(event) => setComfirmPassword(event.target.value)}
                                className={
                                    objCheckInput.isValidComfirmPassword ? 'form-control' : 'form-control is-invalid'
                                }
                                onKeyDown={(event) => handleEnterRegister(event)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={() => handleRegister()}>
                            Register
                        </button>
                        <hr />
                        <div className="text-center">
                            <button className="btn btn-success" onClick={() => handleLogin()}>
                                Already have an account? Login
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
export default Register;
