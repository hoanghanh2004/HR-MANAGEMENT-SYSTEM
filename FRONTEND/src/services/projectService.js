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

const fetchProjectMembers = (projectId) =>
    axios.get(`/api/v1/project/members?projectId=${projectId}`);

const fetchAssignableUsers = (projectId) =>
    axios.get(`/api/v1/project/assignable-users?projectId=${projectId}`);

const assignUserToProject = (data) =>
    axios.post('/api/v1/project/assign-user', data);

const updateMemberRole = (data) =>
    axios.put('/api/v1/project/update-user-role', data);

const removeMemberFromProject = (data) =>
    axios.delete('/api/v1/project/remove-user', { data });

export {
    fetchAllProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectMembers,
    fetchAssignableUsers,
    assignUserToProject,
    updateMemberRole,
    removeMemberFromProject,
};

