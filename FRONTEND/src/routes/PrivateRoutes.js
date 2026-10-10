import { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import AdminLayout from '../component/Navigation/AdminLayout';

const PrivateRoutes = (props) => {
    const { path, component: Component, ...rest } = props;
    const { user } = useContext(UserContext);

    if (user && user.isAuthenticated === true) {
        return (
            <Route
                {...rest}
                path={path}
                render={(routeProps) => (
                    <AdminLayout>
                        <Component {...routeProps} />
                    </AdminLayout>
                )}
            />
        );
    } else {
        return <Redirect to="/login" />;
    }
};

export default PrivateRoutes;
