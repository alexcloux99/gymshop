import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import AuthProvider, { useAuth } from "./context/AuthContext.jsx";
import CartProvider, { useCart } from "./context/CartContext.jsx";
import WishlistProvider from "./context/WishlistContext.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { FiSearch, FiHeart, FiUser, FiShoppingBag } from "react-icons/fi";
import Favorites from "./pages/Favorites.jsx";
import Footer from "./components/Footer.jsx";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import SizeGuide from "./pages/SizeGuide";
import ScrollToTop from "./components/ScrollToTop";
import Forgot from "./pages/Forgot";
import ResetPassword from "./pages/ResetPassword";

function Nav() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    color: "#000",
    fontWeight: "800",
    fontSize: "13px",
    letterSpacing: "0.5px",
    borderBottom: isActive ? "2px solid #000" : "2px solid transparent",
    paddingBottom: "5px"
  });

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/?q=${q}`); 
    }
  };

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "15px 40px", backgroundColor: "#fff", borderBottom: "1px solid #eee",
      position: "sticky", top: 0, zIndex: 1000, fontFamily: "Helvetica, Arial, sans-serif"
    }}>
      
      <div style={{ display: "flex", gap: "25px" }}>
        <NavLink to="/category/women" style={linkStyle}>MUJER</NavLink>
        <NavLink to="/category/men" style={linkStyle}>HOMBRE</NavLink>
        <NavLink to="/category/accessories" style={linkStyle}>ACCESORIOS</NavLink>
      </div>

      <Link to="/" style={{ textDecoration: "none", color: "#000", fontSize: "22px", fontWeight: "900", letterSpacing: "-1px" }}>
        GYMSHOP
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '8px 15px', borderRadius: '20px' }}>
            <FiSearch size={18} color="#666" />
            <input 
              placeholder="¿Qué buscas?" 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleSearch}
              style={{ border: 'none', background: 'none', marginLeft: '10px', outline: 'none', fontSize: '13px', width: '150px' }} 
            />
        </div>

        <Link to="/favorites" style={{ color: "#000" }}><FiHeart size={22} /></Link>
        <Link to="/orders" style={{ color: "#000" }}><FiUser size={22} /></Link>
        <Link to="/cart" style={{ color: "#000", position: "relative" }}>
          <FiShoppingBag size={22} />
          {items.length > 0 && (
            <span style={{ position: "absolute", top: -8, right: -8, backgroundColor: "#000", color: "#fff", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "bold" }}>
              {items.length}
            </span>
          )}
        </Link>
        {user && <button onClick={logout} style={{background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'}}>SALIR</button>}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <PayPalScriptProvider options={{ "client-id": "Ae2acUMOWhIEi73CNDtqiWDDUMJZ_6xjl9xSTRp2yb3jRQKZ8jR0dRVaFD_hLhFj-mgIdxagl27fukIx", currency: "EUR","disable-funding": "credit,card" }}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Nav />
              <div style={{ minHeight: "70vh" }}> 
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} /> 
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/category/:cat" element={<Home />} /> 
                  <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/forgot" element={<Forgot />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Routes>
              </div>
              <Footer /> 
            </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}