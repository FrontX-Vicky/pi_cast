import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ECommerce from './pages/Dashboard/ECommerce';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Login from './pages/Authentication/Login';
import Loader from './common/Loader';
import routes from './routes';
import { SearchProvider } from './components/SearchContext';

import { useLocation, useNavigate } from 'react-router-dom';
const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  // debugger;
  const navigate = useNavigate();
useEffect(() => {
  const token = localStorage.getItem('token');
  const publicRoutes = ['/auth/signin', '/auth/signup'];
  
  if (!token && !publicRoutes.includes(location.pathname)) {
    navigate('/auth/signin');
  }
}, [location, navigate]);
  return loading ? (
    <Loader />
  ) : (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <SearchProvider>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signin" element={<SignIn />} />
          {/* <Route path="/auth/signup" element={<SignUp />} /> */}
          <Route element={<DefaultLayout />}>
            <Route index element={<ECommerce />} />
            {routes.map((routes, index) => {
              const { path, component: Component } = routes;
              return (
                <Route
                  key={index}
                  path={path}
                  element={
                    <Suspense fallback={<Loader />}>
                      <Component />
                    </Suspense>
                  }
                />
              );
            })}

          </Route>
        </Routes>
      </SearchProvider >
    </>
  );
}

export default App;
