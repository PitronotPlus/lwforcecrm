import AdminDashboard from './pages/AdminDashboard';
import Appointments from './pages/Appointments';
import Booking from './pages/Booking';
import Cases from './pages/Cases';
import ClientDetails from './pages/ClientDetails';
import Clients from './pages/Clients';
import Credits from './pages/Credits';
import Dashboard from './pages/Dashboard';
import DigitalSignatures from './pages/DigitalSignatures';
import Finances from './pages/Finances';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Marketing from './pages/Marketing';
import OwnerDashboard from './pages/OwnerDashboard';
import PostSignupSurvey from './pages/PostSignupSurvey';
import PricingPage from './pages/PricingPage';
import Products from './pages/Products';
import PublicBooking from './pages/PublicBooking';
import Services from './pages/Services';
import Settings from './pages/Settings';
import SignDocument from './pages/SignDocument';
import Support from './pages/Support';
import Tasks from './pages/Tasks';
import TeamManagement from './pages/TeamManagement';
import TestSignature from './pages/TestSignature';
import CustomObject from './pages/CustomObject';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "Appointments": Appointments,
    "Booking": Booking,
    "Cases": Cases,
    "ClientDetails": ClientDetails,
    "Clients": Clients,
    "Credits": Credits,
    "Dashboard": Dashboard,
    "DigitalSignatures": DigitalSignatures,
    "Finances": Finances,
    "Home": Home,
    "LandingPage": LandingPage,
    "Marketing": Marketing,
    "OwnerDashboard": OwnerDashboard,
    "PostSignupSurvey": PostSignupSurvey,
    "PricingPage": PricingPage,
    "Products": Products,
    "PublicBooking": PublicBooking,
    "Services": Services,
    "Settings": Settings,
    "SignDocument": SignDocument,
    "Support": Support,
    "Tasks": Tasks,
    "TeamManagement": TeamManagement,
    "TestSignature": TestSignature,
    "CustomObject": CustomObject,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};