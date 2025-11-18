import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import AuthProvider, { useAuth } from "./context/AuthContext.jsx";
import CartProvider, { useCart } from "./context/CartContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetail from "./pages/ProductDetail.jsx";
import RequireAuth from "./components/RequireAuth.jsx";


function Nav() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  return (
    <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Home</Link>
      <Link to="/cart">Carrito ({items.length})</Link>
      <Link to="/orders">Mis pedidos</Link>
      <div style={{ marginLeft: "auto" }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>Hola, {user.username}</span>
            <button onClick={logout}>Salir</button>
          </>
        ) : <Link to="/login">Entrar</Link>}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route
              path="/orders"
              element={<RequireAuth><Orders /></RequireAuth>}
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

