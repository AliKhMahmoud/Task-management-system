const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their notification room`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const sendNotification = (userId, type, data) => {
    if (io) {
        console.log(`[SOCKET] Sending ${type} to ${userId}`);
        io.to(userId.toString()).emit("notification", {
            type,
            data,
            timestamp: new Date()
        });
    } else {
        console.log(`[SOCKET] IO not initialized!`);
    }
};

module.exports = { initSocket, getIO, sendNotification };
