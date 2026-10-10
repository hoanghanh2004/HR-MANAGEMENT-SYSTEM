import axios from '../setup/axios';

const fetchAllDepartments = () => axios.get('/api/v1/department/read');
const createDepartment = (department) =>
    axios.post('/api/v1/department/create', department);
const updateDepartment = (department) =>
    axios.put('/api/v1/department/update', department);
const deleteDepartment = (department) =>
    axios.delete('/api/v1/department/delete', {
        data: { id: department?.id || department },
    });

export {
    fetchAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};
