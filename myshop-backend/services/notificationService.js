module.exports = {
    notifyWarehouse: (io, order) => {
      console.log('🏭 Warehouse:', order._id);
      io.emit('warehouse:newOrder', {orderId: order._id});
      return true;
    },
    notifyRider: (io, order) => {
      console.log('🏍️ Rider:', order._id);
      io.emit('rider:newDelivery', {orderId: order._id});
      return true;
    },
    notifyCustomer: (io, order, status) => {
      console.log('👤 Customer:', order._id, status);
      io.emit('order-update', {orderId: order._id, status});
      return true;
    },
    notifyAdmin: (io, order) => {
      console.log('👨‍💼 Admin:', order._id);
      io.emit('admin:newOrder', {orderId: order._id});
      return true;
    }
  };
  