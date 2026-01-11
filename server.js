const http = require('http');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const PORT = process.env.PORT || 3000;
const STATIC_DIR = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// HTML wrapper для markdown контента
function wrapMarkdown(content, title) {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Вайб-кодинг</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/markdown.css">
    <style>
        body {
            background: #f8fafc;
            padding: 40px 20px;
        }
        .markdown-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 48px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #6366f1;
            text-decoration: none;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="markdown-container">
        <a href="/" class="back-link">← Назад к курсу</a>
        <div class="markdown-body">
${content}
        </div>
    </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    
    // Отделяем query string от пути
    const [pathOnly] = req.url.split('?');
    
    let filePath = path.join(STATIC_DIR, pathOnly === '/' ? 'index.html' : pathOnly);
    const ext = path.extname(filePath);
    
    // Обработка markdown файлов
    if (ext === '.md') {
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }
            
            // Конвертируем markdown в HTML
            const htmlContent = marked.parse(content);
            
            // Извлекаем заголовок из первого h1
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : 'Материал курса';
            
            const fullHtml = wrapMarkdown(htmlContent, title);
            
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fullHtml);
        });
        return;
    }
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🟣 Вайб-кодинг — Платформа курса             ║
║                                                ║
║   Сервер запущен:                              ║
║   http://localhost:${PORT}                        ║
║                                                ║
║   Ctrl+C для остановки                          ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);
});
