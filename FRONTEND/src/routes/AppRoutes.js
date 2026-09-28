import { Switch, Route } from 'react-router-dom';
import Login from '../component/Login/Login';
import Register from '../component/Register/Register';
import Users from '../component/ManageUsers/Users';
import PrivateRoutes from './PrivateRoutes';
import roles from '../component/Role/Role';
import GroupRole from '../component/GroupRole/GroupRole';
import HomePage from '../component/HomePage/HomePage';
const AppRoutes = () => {
    return (
        <>
            <Switch>
                {/* <Route path="/project">project</Route> */}
                <PrivateRoutes path="/users" component={Users} />
                <PrivateRoutes path="/roles" component={roles} />
                <PrivateRoutes path="/group-role" component={GroupRole} />
                <Route path="/login">
                    <Login />
                </Route>
                <Route path="/register">
                    <Register />
                </Route>
                <Route path="/" exact>
                    <HomePage />
                </Route>
                <Route path="*">404 NOT FOUND</Route>
            </Switch>
        </>
    );
};
export default AppRoutes;
