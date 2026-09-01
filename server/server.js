import app from './app.js';
import config from './config/env.js';
import connectDB from './config/db.js';
import { initCollection } from './services/vectorService.js';
import { initPdfCollection } from './services/pdfVectorService.js';

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Initialize Vector DB collections if configured (question bank + PDF chunks)
    await initCollection();
    await initPdfCollection();

    // 3. Start Express server
    app.listen(config.PORT, () => {
      console.log(`Server running in development mode on port ${config.PORT}`);
    });
  } catch (error) {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();