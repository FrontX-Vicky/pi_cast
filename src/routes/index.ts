import { lazy } from 'react';

const Calendar = lazy(() => import('../pages/Calendar'));
const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Details = lazy(() => import('../pages/Details'));
const DevicesPi = lazy(() => import('../pages/DevicesPi'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const pi_cast = lazy(() => import('../pages/Pi_Cast'));
const all_pi = lazy(() => import('../pages/AllPis'));
const timer = lazy(() => import('../pages/TimerFnc'));
const typoGraphy = lazy(() => import('../components/TypoGraphy'));
const storageChart = lazy(() => import('../components/StorageUsageChart'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));

const coreRoutes = [
  // {
  //   path: '/calendar',
  //   title: 'Calender',
  //   component: Calendar,
  // },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/Pi-Details/:id',
    title: 'Pi-Details',
    component: Details,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/chart',
    title: 'Chart',
    component: Chart,
  },
  {
    path: '/Devices',
    title: 'DevicesPi',
    component: DevicesPi,
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
  {
    path: '/Pi-Casting',
    title: 'pi_cast',
    component: pi_cast,
  },
  {
    path: '/All-Pis',
    title: 'All-pi',
    component: all_pi,
  },
  {
    path: '/timer',
    title: 'All-timer',
    component: timer,
  },
  {
    path: '/typoGraphy',
    title: 'Typo-Graphy',
    component: typoGraphy,
  },
  {
    path: '/storageChart',
    title: 'storage-Chart',
    component: storageChart,
  },
];

const routes = [...coreRoutes];
export default routes;
