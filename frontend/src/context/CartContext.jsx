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

  // Generar clave única: id + talla
  const getItemKey = (product) => {
    const size = product.size && product.size !== "N/A" ? product.size : "";
    return `${product.id}_${size}`;
  };

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const key = getItemKey(product);
      const i = prev.findIndex((p) => getItemKey(p) === key);
      
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const remove = (id, size) => {
    setItems((prev) => prev.filter((p) => getItemKey(p) !== getItemKey({ id, size })));
  };

  const clear = () => setItems([]);
  
  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  
  const inc = (id, size, step = 1) => {
    setItems(prev => prev.map(p => 
      getItemKey(p) === getItemKey({ id, size }) 
        ? { ...p, qty: p.qty + step } 
        : p
    ));
  };

  const dec = (id, size, step = 1) => {
    setItems(prev => prev.map(p => 
      getItemKey(p) === getItemKey({ id, size }) 
        ? { ...p, qty: Math.max(1, p.qty - step) } 
        : p
    ));
  };

  return (
    <CartCtx.Provider value={{ items, add, remove, clear, total, inc, dec }}>
      {children}
    </CartCtx.Provider>
  );
}