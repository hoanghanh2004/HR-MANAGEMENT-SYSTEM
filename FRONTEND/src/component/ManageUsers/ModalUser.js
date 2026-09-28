import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import './Users.scss';
import { fetchGroup, createNewUser, updateCurrentUser } from '../../services/userService';
import { toast } from 'react-toastify';
import _ from 'lodash';
const ModalUser = (props) => {
    const { action, dataModalUser } = props;
    const defaultUserData = {
        email: '',
        phone: '',
        username: '',
        password: '',
        address: '',
        sex: '',
        group: '',
    };
    const validInputDefault = {
        email: true,
        phone: true,
        username: true,
        password: true,
        address: true,
        sex: true,
        group: true,
    };
    const [userData, setUserData] = useState(defaultUserData);
    const [validInput, setValidInput] = useState(validInputDefault);
    const [userGroups, setUserGroups] = useState([]);
    useEffect(() => {
        getGroups();
    }, []);
    useEffect(() => {
        if (action === 'UPDATE') {
            setUserData({ ...dataModalUser, group: dataModalUser.Group ? dataModalUser.Group.id : '' });
        }
    }, [dataModalUser]);
    // nếu [] thì hàm useEffect cái setUserData này chỉ chạy một lần khi component được mount, nếu dataModalUser không thay đổi sau lần đầu tiên component được mount, setUserData sẽ không được chạy và làm chức năng gán giá trị nữa => rỗng ở các ô input

    //nếu không truyền gì thì useEffect sẽ được chạy lại mỗi khi state thay đổi, nên mình nhập thì nó sẽ làm state thay đổi nên nó lại chạy cái setUserData gán lại mấy giá trị cũ
    // nếu [dataModalUser] thì setUserData sẽ chạy theo thay đôi khi dataModalUser thay đổi
    useEffect(() => {
        if (action === 'CREATE' && userGroups.length > 0) {
            setUserData({ ...userData, group: userGroups[0].id }); 
        }
    }, [action, userGroups]);
    const getGroups = async () => {
        let res = await fetchGroup();
        if (res && res.EC === 0) {
            setUserGroups(res.DT);
            if (res.DT && res.DT.length > 0) {
                let groups = res.DT;
                // console.log('groups', groups);
                setUserData({ ...userData, group: groups[0].id });
            }
        } else {
            toast.error(res.EM);
        }
    };
    const handleOnchangeInput = (value, name) => {
        let _userData = _.cloneDeep(userData);
        _userData[name] = value;
        setUserData(_userData);
    };
    const checkValidInput = () => {
        if (action === 'UPDATE') return true;
        //create user
        setValidInput(validInputDefault);
        let arr = ['email', 'phone', 'password', 'group'];
        let check = true;
        for (let i = 0; i < arr.length; i++) {
            //!+biến : là kiểu falsy
            if (!userData[arr[i]]) { //nếu chính xác là true thì sẽ thực hiện logic bên trong
                let _validInputs = _.cloneDeep(validInputDefault);
                _validInputs[[arr[i]]] = false;
                setValidInput(_validInputs);
                toast.error(`Emty input ${arr[i]}`);
                check = false;
                break;
            }
        }
        return check;
    };
    const handleConfirmUser = async () => {
        let check = checkValidInput();
        if (check) {
            let res =
                action === 'CREATE'
                    ? await createNewUser({ ...userData, groupId: userData['group'] }) // thêm trường groupId và lấy giá trị của group trong userData
                    : await updateCurrentUser({ ...userData, groupId: userData['group'] });
            if (res && res.EC === 0) {
                props.onHide();
                setUserData({ ...defaultUserData, group: userGroups && userGroups.length > 0 ? userGroups[0].id : '' });
                toast.success(res.EM);
            }
            if (res && res.EC !== 0) {
                toast.error(res.EM);
                let _validInputs = _.cloneDeep(validInputDefault);
                _validInputs[res.DT] = false;
                setValidInput(_validInputs);
            }
        }
    };
    const handleCloseModalUser = () => {
        props.onHide();
        setUserData(defaultUserData);
        setValidInput(validInputDefault);
    };
    return (
        <>
            <Modal size="lg" show={props.show} className="modal-user" onHide={() => handleCloseModalUser()}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <span style={{ color: '#0B62E0' }}>
                            {action === 'CREATE' ? 'Create new user:' : 'Edit a user:'}
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="content-body row">
                            <div className="col-6 form-group">
                                <label>
                                    Email adress: (<span className="red">*</span>)
                                </label>
                                <input
                                    disabled={action === 'CREATE' ? false : true}
                                    className={validInput.email ? 'form-control' : 'form-control is-invalid'}
                                    type="email"
                                    value={userData.email || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'email')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label>
                                    Phone Number: (<span className="red">*</span>)
                                </label>
                                <input
                                    disabled={action === 'CREATE' ? false : true}
                                    className={validInput.phone ? 'form-control' : 'form-control is-invalid'}
                                    type="text"
                                    value={userData.phone || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'phone')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label>Username:</label>
                                <input
                                    className={validInput.username ? 'form-control' : 'form-control is-invalid'}
                                    type="text"
                                    value={userData.username || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'username')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                {action === 'CREATE' && (
                                    <>
                                        <label>
                                            Password: (<span className="red">*</span>)
                                        </label>
                                        <input
                                            className={validInput.password ? 'form-control' : 'form-control is-invalid'}
                                            type="password"
                                            value={userData.password || ''}
                                            onChange={(event) => handleOnchangeInput(event.target.value, 'password')}
                                        />
                                    </>
                                )}
                            </div>

                            <div className="col-12 form-group">
                                <label>Adress :</label>
                                <input
                                    className={validInput.address ? 'form-control' : 'form-control is-invalid'}
                                    type="text"
                                    value={userData.address || ''}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'address')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label>Gender:</label>
                                <select
                                    className="form-select"
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'sex')}
                                    value={userData.sex}
                                >
                                    <option defaultValue="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-6 form-group">
                                <label>
                                    Group: (<span className="red">*</span>)
                                </label>
                                <select
                                    className={validInput.group ? 'form-select' : 'form-select is-invalid'}
                                    onChange={(event) => handleOnchangeInput(event.target.value, 'group')}
                                    value={userData.group}
                                >
                                    {userGroups.length > 0 &&
                                        userGroups.map((item, index) => {
                                            return (
                                                <option key={`group-${index}`} value={item.id}>
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => handleCloseModalUser()}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => handleConfirmUser()}>
                        {action === 'CREATE' ? 'Save' : 'Update'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default ModalUser;
