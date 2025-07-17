import Page6 from "./components/Page6";
import Page5 from "./components/Page5";
import Page4 from "./components/Page4";
import Page3 from "./components/Page3";
import Page2 from "./components/Page2";
import Login from "./components/Login/Login";
import Registration from "./components/Registration/Registration";
import Page1 from "./components/Page1";
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Edit from './components/Edit/Edit';
import MainLayout from "./user/layouts/Mainlayout";
import Home from "./user/pages/Home";
import Menu from "./user/pages/Menu";
import WeekMenu from "./user/pages/WeekMenu";
import UserFeedback from "./user/pages/UserFeedback";
import Sickmeal from "./user/pages/SickMeal";
import AdminLayout from "./admin/layouts/AdminLayout";
import WeeklyRatings from "./admin/pages/WeeklyRatings";
import UploadMenu from "./admin/pages/UploadMenu";
import EditMenu from "./admin/pages/EditMenu";
import Feedback from "./admin/pages/Feedback";
import SickMeals from "./admin/pages/SickMeals";
import Page404 from "./admin/pages/Page404";
import UPage404 from "./user/pages/UPage404";



function App() {
  return (
  <Routes>
    {/* User routes */}
    <Route path='/' element={<MainLayout/>}>
      <Route index element={<Home />} />
      <Route path='menu' element={<Menu />} />
      <Route path='weekmenu' element={<WeekMenu />} />
      <Route path='feedback' element={<UserFeedback />} />
      <Route path='sickmeal' element={<Sickmeal />} />
      <Route path='*' element={<UPage404 />} />
    </Route>
      
    {/* Admin routes */}
    <Route path='/admin' element={<AdminLayout />}>
      <Route index element={<WeeklyRatings />} />
      <Route path='upload-menu' element={<UploadMenu />} />
      {/* <Route path='add-feast' element={<AddFeast />} /> */}
      <Route path='edit-menu' element={<EditMenu />} />
      <Route path='feedback' element={<Feedback />} />
      <Route path='sick-meal' element={<SickMeals />} />
      <Route path='*' element={<Page404 />} />
    </Route>

    <Route path='/edit' element={<Edit/>}/>
    <Route path='/page1' element={<Page1 />}/>
    <Route path='/registration' element={<Registration />}/>
    <Route path='/login' element={<Login />}/>
    <Route path='/page2' element={<Page2 />}/>
    <Route path='/page3' element={<Page3 />}/>
    <Route path='/page4' element={<Page4 />}/>
    <Route path='/page5' element={<Page5 />}/>
    <Route path='/page6' element={<Page6 />}/>


  </Routes>
  );
}

export default App;
