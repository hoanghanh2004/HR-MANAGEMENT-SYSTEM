import './Role.scss';
import { IoMdAddCircle } from 'react-icons/io';
import { FaTrashCan } from 'react-icons/fa6';
import {  useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { createRoles } from '../../services/rolesService';
import TableRole from './TableRole';

const Roles = () => {
    const dataChildDefault = {
        url: '',
        description: '',
        isValidUrl: true,
    };
    const childRef = useRef();
    const [listChilds, setListChilds] = useState({
        child1: dataChildDefault,
    });

    const handleOnchangeInput = (name, value, key) => {
        let _listChilds = _.cloneDeep(listChilds);
        _listChilds[key][name] = value;
        if (value && name === 'url') {
            _listChilds[key]['isValidUrl'] = true;
        }
        setListChilds(_listChilds);
    };
    const handleAddNewInput = () => {
        let _listChilds = _.cloneDeep(listChilds);
        _listChilds[`child-${uuidv4()}`] = dataChildDefault;
        setListChilds(_listChilds);
    };
    const handleDeleteInput = (key) => {
        let _listChilds = _.cloneDeep(listChilds);
        delete _listChilds[key];
        setListChilds(_listChilds);
    };
    const buildDataToPersist = () => {
        let _listChilds = _.cloneDeep(listChilds);
        let result = [];
        Object.entries(_listChilds).map(([key, child], index) => {
            result.push({
                url: child.url,
                description: child.description,
            });
        });
        return result;
    };
    const handleSave = async () => {
        let _listChilds = _.cloneDeep(listChilds);

        let invalidObj = Object.entries(_listChilds).find(([key, child], index) => {
            return child && !child.url;
        });
        if (!invalidObj) {
            let data = buildDataToPersist();
            let res = await createRoles(data);
            console.log('res', res);
            if (res && +res.EC === 0) {
                toast.success(res.EM);
                childRef.current.fetListRolesAgain();
                // console.log('childRef', childRef);
                // console.log(' childRef.current', childRef.current);
            }
            if (res && +res.EC === -1) {
                toast.warning(res.EM);
            }
        } else {
            toast.error('Input URL Must Not Be Empty...');
            const key = invalidObj[0]; // Lấy key của input không hợp lệ
            _listChilds[key].isValidUrl = false; // Đánh dấu là không hợp lệ
            setListChilds(_listChilds);
        }
    };
    return (
        <div className="role-container">
            <div className="container">
                <div className="adding-roles mt-3">
                    <div className="title-role">
                        <h4>Add a new role ...</h4>
                    </div>
                    <div className="role-parent">
                        {Object.entries(listChilds).map(([key, child], index) => {
                            return (
                                <div className="row col-12 role-child" key={`child-${key}`}>
                                    <div className={`col-5 form-group ${key}`}>
                                        <label>URL:</label>
                                        <input
                                            type="text"
                                            className={child.isValidUrl ? 'form-control' : 'form-control is-invalid'}
                                            value={child.url}
                                            onChange={(event) => handleOnchangeInput('url', event.target.value, key)}
                                        />
                                    </div>
                                    <div className="col-5 form-group">
                                        <label>Description:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={child.description}
                                            onChange={(event) =>
                                                handleOnchangeInput('description', event.target.value, key)
                                            }
                                        />
                                    </div>
                                    <div className="col-2 mt-4 actions">
                                        <div className="btn-add" onClick={() => handleAddNewInput()}>
                                            <IoMdAddCircle />
                                        </div>
                                        <div className="btn-trash" onClick={() => handleDeleteInput(key)}>
                                            {index >= 1 && <FaTrashCan />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div>
                            <button className="btn btn-warning mt-3" onClick={() => handleSave()}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="mt-3">
                    <h4>List Current Roles: </h4>
                    <TableRole ref={childRef} />
                </div>
            </div>
        </div>
    );
};
export default Roles;
