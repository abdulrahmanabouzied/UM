const handleScoket = (io) => {
  // socket connection middleware
  io.use(async (socket, next) => {
    const { token } = socket.handshake.auth;
    const { token: t_token } = socket.handshake.query;

    next();
  });

  // socket connection handler
  io.on("connection", async (socket) => {
    console.log(`${socket.id} connected`);

    socket.on("disconnect", async (cause) => {
      console.log(`${socket.id} disconnected with ${cause}`);
    });
  });
};

export default handleScoket;
