import axios from '../setup/axios';

const fetchAllProjects = () => axios.get('/api/v1/project/read');

const createProject = (projectData) =>
    axios.post('/api/v1/project/create', projectData);

const updateProject = (projectData) =>
    axios.put('/api/v1/project/update', projectData);

const deleteProject = (project) =>
    axios.delete('/api/v1/project/delete', {
        data: { id: project?.id || project },
    });

export {
    fetchAllProjects,
    createProject,
    updateProject,
    deleteProject,
};

