import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Dashboard from "./Dashboard";

import Pets from "./Pets";

import Sitters from "./Sitters";

import Bookings from "./Bookings";

import Profile from "./Profile";

import DeveloperAccess from "./DeveloperAccess";

import DeveloperAccessPage from "./developer-access";

import onboarding from "./onboarding";

import AdminLogin from "./AdminLogin";

import Notifications from "./Notifications";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Landing: Landing,
    
    Dashboard: Dashboard,
    
    Pets: Pets,
    
    Sitters: Sitters,
    
    Bookings: Bookings,
    
    Profile: Profile,
    
    DeveloperAccess: DeveloperAccess,
    
    'developer-access': DeveloperAccessPage,
    
    onboarding: onboarding,
    
    AdminLogin: AdminLogin,
    
    Notifications: Notifications,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Pets" element={<Pets />} />
                
                <Route path="/Sitters" element={<Sitters />} />
                
                <Route path="/Bookings" element={<Bookings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/DeveloperAccess" element={<DeveloperAccess />} />
                
                <Route path="/developer-access" element={<DeveloperAccessPage />} />
                
                <Route path="/onboarding" element={<onboarding />} />
                
                <Route path="/AdminLogin" element={<AdminLogin />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}