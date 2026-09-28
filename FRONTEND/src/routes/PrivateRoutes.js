import { useContext, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
const PrivateRoutes = (props) => {
    const { path, component } = props;
    // let history = useHistory();
    const { user } = useContext(UserContext);
    if (user && user.isAuthenticated === true) {
        return (
            <>
                <Route path={path} component={component} />
            </>
        );
    } else {
        return <Redirect to='/login'></Redirect>;
    }
};
export default PrivateRoutes;
