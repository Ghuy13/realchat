import { BrowserRouter, Route, Routes } from "react-router-dom"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import ChatAppPage from "./pages/ChatAppPage"
import { Toaster } from 'sonner'
import ProtectedRoute from "./components/auth/ProtectedRoute"

function App() {
  return (
    <>
      {/* Thư viện của sonner giúp hiển thị thông báo */}
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes:đường dẫn không cần xác minh danh tính và trong đây có SignIn và SignUp*/}
          <Route
            path='/signin'
            element={<SignInPage />}
          />
          <Route
            path='/signup'
            element={<SignUpPage />}
          />

          {/* protected routes:đường dẫn cần đăng nhập mới có thể vào*/}
          <Route element={<ProtectedRoute />}>
            <Route
              path='/'
              element={<ChatAppPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
