import { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const inc = (id, step = 1) => {
  setItems(prev => prev.map(p => p.id === id ? { ...p, qty: p.qty + step } : p));
  };
  const dec = (id, step = 1) => {
  setItems(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, p.qty - step) } : p));
  };


  return (
    <CartCtx.Provider value={{ items, add, remove, clear, total, inc, dec }}>
      {children}
    </CartCtx.Provider>
  );
}
