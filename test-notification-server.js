// // Simple notification test without database
// const express = require("express");
// const http = require("http");
// const { initSocket } = require("./src/utils/socket");

// const app = express();
// const server = http.createServer(app);
// initSocket(server);

// // Serve static files
// app.use(express.static('public'));

// // Simple test route
// app.get('/test', (req, res) => {
//     res.json({ message: 'Notification server is running!' });
// });

// const PORT = 5000;
// server.listen(PORT, () => {
//     console.log(`🚀 Notification test server running on: http://localhost:${PORT}`);
//     console.log(`📱 Demo available at: http://localhost:${PORT}/notifications-demo.html`);
// });

// // Test notification function
// const testNotification = () => {
//     const { sendNotification } = require('./src/utils/socket');
//     sendNotification('test-user', 'NEW_TASK_ASSIGNED', {
//         message: 'Test notification: New task assigned!',
//         taskId: 'test-123',
//         taskTitle: 'Test Task',
//         timestamp: new Date()
//     });
//     console.log('✅ Test notification sent!');
// };

// // Send test notification every 10 seconds
// setInterval(testNotification, 10000);
