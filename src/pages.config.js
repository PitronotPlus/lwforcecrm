import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Cases from './pages/Cases';
import Clients from './pages/Clients';
import Marketing from './pages/Marketing';
import AdminDashboard from './pages/AdminDashboard';
import ClientDetails from './pages/ClientDetails';
import Settings from './pages/Settings';
import Finances from './pages/Finances';
import Credits from './pages/Credits';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import PostSignupSurvey from './pages/PostSignupSurvey';
import Support from './pages/Support';
import Appointments from './pages/Appointments';
import TeamManagement from './pages/TeamManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Tasks": Tasks,
    "Cases": Cases,
    "Clients": Clients,
    "Marketing": Marketing,
    "AdminDashboard": AdminDashboard,
    "ClientDetails": ClientDetails,
    "Settings": Settings,
    "Finances": Finances,
    "Credits": Credits,
    "LandingPage": LandingPage,
    "PricingPage": PricingPage,
    "PostSignupSurvey": PostSignupSurvey,
    "Support": Support,
    "Appointments": Appointments,
    "TeamManagement": TeamManagement,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};