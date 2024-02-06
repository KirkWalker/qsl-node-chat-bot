// import express from 'express';
// const router = express.Router();

// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// router.get('^/$|/index(.html)?', (req, res) => {
//     res.sendFile(join(__dirname, '..', 'views', 'index.html'));
// });

// router.get('/new-page(.html)?', (req, res) => {
//     res.sendFile(join(__dirname, '..', 'views', 'new-page.html'));
// });

// router.get('/old-page(.html)?', (req, res) => {
//     res.redirect(301, '/new-page.html'); //302 by default
// });

// export default router;