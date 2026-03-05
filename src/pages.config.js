/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Admin from './pages/Admin';
import ArtistComplete from './pages/ArtistComplete';
import Artists from './pages/Artists';
import Billetterie from './pages/Billetterie';
import Blog from './pages/Blog';
import Home from './pages/Home';
import Infos from './pages/Infos';
import Legal from './pages/Legal';
import ParticipantFormPage from './pages/ParticipantFormPage';
import Privacy from './pages/Privacy';
import Programme from './pages/Programme';
import Sitemap from './pages/Sitemap';
import Unsubscribe from './pages/Unsubscribe';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "ArtistComplete": ArtistComplete,
    "Artists": Artists,
    "Billetterie": Billetterie,
    "Blog": Blog,
    "Home": Home,
    "Infos": Infos,
    "Legal": Legal,
    "ParticipantFormPage": ParticipantFormPage,
    "Privacy": Privacy,
    "Programme": Programme,
    "Sitemap": Sitemap,
    "Unsubscribe": Unsubscribe,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};