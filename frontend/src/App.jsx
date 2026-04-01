import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from './components/Pages/LandingPage';
import AdminDashboard from './components/Pages/Admin/AdminDashboard';
import BranchDashboard from './components/Pages/Branch/BranchDashboard';
import StudentDashboard from './components/Pages/Student/StudentDashboard';

import LoginRegister from "./components/Pages/LoginRegister"
import ParentDashboard from './components/Pages/Parent/ParentDashboard';
import TeacherDashboard from './components/Pages/Teacher/TeacherDashboard';
import PrincipalDashboard from './components/Pages/Principal/PrincipalDashboard';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path="/auth" element={<LoginRegister />} />
        <Route path='/admin_dashboard/*' element={<AdminDashboard />} />
        <Route path='/branch_dashboard/*' element={<BranchDashboard />}/>
        <Route path='/student_dashboard/*' element={<StudentDashboard />}/>
        <Route path='/parent_dashboard/*' element={<ParentDashboard />}/>
        <Route path='/teacher_dashboard/*' element={<TeacherDashboard />}/>
        <Route path='/principal_dashboard/*' element={<PrincipalDashboard />}/>


      </Routes>
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
    </Router>
  )
}

export default App
