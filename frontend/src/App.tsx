import { AuthProvider } from "./context/AuthContext";
import AppRoute from "./routes/AppRoute";

function App() {
  return (
    <AuthProvider>
      <AppRoute />
    </AuthProvider>
  );
}

export default App;
