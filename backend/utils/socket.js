const { Server } = require("socket.io");

let io;
const userSockets = new Map();

module.exports = {
    init: (server, allowedOrigins) => {
        io = new Server(server, {
            cors: {
                origin: allowedOrigins,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                credentials: true,
            },
        });

        io.on("connection", (socket) => {
            console.log("New client connected", socket.id);

            // Expect client to pass userId on connect via query
            const userId = socket.handshake.query.userId;
            if (userId && userId !== "undefined") {
                userSockets.set(userId, socket.id);
                console.log(`User ${userId} mapped to socket ${socket.id}`);
            }

            socket.on("disconnect", () => {
                console.log("Client disconnected", socket.id);
                if (userId && userSockets.get(userId) === socket.id) {
                    userSockets.delete(userId);
                }
            });
        });

        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
    getUserSocket: (userId) => {
        return userSockets.get(userId.toString());
    }
};
