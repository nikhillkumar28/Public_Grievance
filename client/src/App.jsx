import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import PublicNavbar from "./components/layout/PublicNavbar";
import PublicFooter from "./components/layout/PublicFooter";
import CitizenSidebar from "./components/layout/CitizenSidebar";
import CitizenTopbar from "./components/layout/CitizenTopbar";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import AboutPage from "./pages/public/AboutPage";
import CitizenDashboardPage from "./pages/citizen/CitizenDashboardPage";
import FileComplaintPage from "./pages/citizen/FileComplaintPage";
import MyComplaintsPage from "./pages/citizen/MyComplaintsPage";
import UpvotedIssuesPage from "./pages/citizen/UpvotedIssuesPage";
import ProfileSettingsPage from "./pages/citizen/ProfileSettingsPage";
import ComplaintDetailsPage from "./pages/citizen/ComplaintDetailsPage";
import { useAuth } from "./context/AuthContext";

const PublicLayout = () => (
  <>
    <PublicNavbar />
    <Outlet />
    <PublicFooter />
  </>
);

const CitizenLayout = () => (
  <main className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row">
    <CitizenSidebar />
    <section className="flex-1">
      <CitizenTopbar />
      <Outlet />
    </section>
  </main>
);

const PrivateRoute = ({ roles = [] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PrivateRoute roles={["citizen"]} />}>
        <Route element={<CitizenLayout />}>
          <Route path="/citizen" element={<CitizenDashboardPage />} />
          <Route path="/citizen/file-complaint" element={<FileComplaintPage />} />
          <Route path="/citizen/my-complaints" element={<MyComplaintsPage />} />
          <Route path="/citizen/upvoted-issues" element={<UpvotedIssuesPage />} />
          <Route path="/citizen/profile" element={<ProfileSettingsPage />} />
          <Route path="/citizen/complaints/:id" element={<ComplaintDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
