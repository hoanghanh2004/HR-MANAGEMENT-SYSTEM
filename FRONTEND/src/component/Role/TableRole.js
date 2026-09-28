import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { deleteRole, fetchAllRole } from '../../services/rolesService';
import { toast } from 'react-toastify';
import { MdDelete } from 'react-icons/md';
const TableRole = forwardRef((props, ref) => {
    const [listRoles, setListRoles] = useState([]);
    useEffect(() => {
        getAllRoles();
    }, []);

    useImperativeHandle(ref, () => ({
        fetListRolesAgain() {
            getAllRoles();
        },
    }));
    const getAllRoles = async () => {
        let data = await fetchAllRole();
        if (data && +data.EC === 0) {
            setListRoles(data.DT);
        }
    };
    const handleDeleteRole = async (role) => {
        let data = await deleteRole(role);
        if (data && +data.EC === 0) {
            toast.success(data.EM);
            await getAllRoles();
        }
    };
    return (
        <>
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">URL</th>
                        <th scope="col">Description</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {listRoles && listRoles.length > 0 ? (
                        <>
                            {listRoles.map((item, index) => {
                                return (
                                    <tr key={`row-${index}`}>
                                        <td>{item.id}</td>
                                        <td>{item.url}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <button className="m-lg-3" onClick={() => handleDeleteRole(item)}>
                                                <MdDelete
                                                    style={{ color: 'red', fontSize: '24px', cursor: 'pointer' }}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            <tr>
                                <td colSpan={4}>Not Found Roles</td>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>
        </>
    );
});
export default TableRole;
