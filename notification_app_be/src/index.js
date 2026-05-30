require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const notificationRoutes = require('./routes/notification.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AffordMed Backend Running'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;