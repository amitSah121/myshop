import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Load orders
    fetchMyOrders();
    
    // Real-time updates
    socket.on('order:statusUpdate', (update) => {
      setOrders(prev => prev.map(order => 
        order._id === update.orderId 
          ? { ...order, orderStatus: update.status }
          : order
      ));
    });

    return () => socket.off('order:statusUpdate');
  }, []);

  const fetchMyOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setOrders(data);
  };

  return (
    <div className="my-orders">
      <h1>📦 My Orders ({orders.length})</h1>
      {orders.map(order => (
        <div key={order._id} className="order-card">
          <h3>Order #{order._id.slice(-6)}</h3>
          <p>₹{order.totalAmount} • {order.items.length} items</p>
          <div className={`status ${order.orderStatus}`}>
            {order.orderStatus.toUpperCase()}
          </div>
          <small>{new Date(order.updatedAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};
