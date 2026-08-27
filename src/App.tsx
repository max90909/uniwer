import { Navigate, Route, Routes } from 'react-router-dom';
import { useSession } from './lib/session';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';

import StudentDashboard from './pages/student/Dashboard';
import StudentMaterials from './pages/student/Materials';
import StudentResults from './pages/student/Results';
import StudentProgress from './pages/student/Progress';
import StudentRanking from './pages/student/Ranking';
import StudentAttendance from './pages/student/Attendance';
import StudentProfile from './pages/student/Profile';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherGroups from './pages/teacher/Groups';
import TeacherEnterGrades from './pages/teacher/EnterGrades';
import TeacherMaterials from './pages/teacher/Materials';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherBehavior from './pages/teacher/Behavior';
import TeacherRankings from './pages/teacher/Rankings';
import TeacherStatistics from './pages/teacher/Statistics';

import AdminUsers from './pages/admin/Users';
import AdminGroupsCourses from './pages/admin/GroupsCourses';
import AdminSchedule from './pages/admin/Schedule';
import AdminSettings from './pages/admin/Settings';
import AdminRankings from './pages/admin/Rankings';

function RoleGate({ role, children }: { role: 'student' | 'teacher' | 'admin'; children: React.ReactNode }) {
  const { user } = useSession();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function Root() {
  const { user } = useSession();
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return <Login />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />

      <Route
        path="/student"
        element={
          <RoleGate role="student">
            <Layout role="student" />
          </RoleGate>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="materials" element={<StudentMaterials />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="ranking" element={<StudentRanking />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <RoleGate role="teacher">
            <Layout role="teacher" />
          </RoleGate>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="groups" element={<TeacherGroups />} />
        <Route path="grades" element={<TeacherEnterGrades />} />
        <Route path="materials" element={<TeacherMaterials />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="behavior" element={<TeacherBehavior />} />
        <Route path="rankings" element={<TeacherRankings />} />
        <Route path="statistics" element={<TeacherStatistics />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RoleGate role="admin">
            <Layout role="admin" />
          </RoleGate>
        }
      >
        <Route index element={<AdminUsers />} />
        <Route path="groups" element={<AdminGroupsCourses />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="rankings" element={<AdminRankings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
