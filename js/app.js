// Главное приложение
const app = document.getElementById('app');
let modules = [];

// Инициализация
async function init() {
    modules = await loadModules();
    const progress = getProgress();
    
    updateProgressBar(progress);
    
    // Определяем, какую страницу показывать
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module');
    
    if (moduleId) {
        showModulePage(moduleId);
    } else {
        showHomePage();
    }
}

// Обновление прогресс-бара
function updateProgressBar(progress) {
    const percent = calculateProgress(modules, progress);
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = percent + '% завершено';
}

// Главная страница
function showHomePage() {
    const progress = getProgress();
    
    app.innerHTML = `
        <section class="hero">
            <div class="container">
                <h1>Вайб-кодинг</h1>
                <p>С нуля до своего первого проекта</p>
            </div>
        </section>
        
        <div class="container">
            <div class="modules-grid" id="modulesGrid">
                ${modules.map(module => renderModuleCard(module, progress)).join('')}
            </div>
        </div>
    `;
}

// Карточка модуля
function renderModuleCard(module, progress) {
    const completed = isModuleCompleted(module.id, progress);
    const completedClass = completed ? 'completed' : '';
    
    return `
        <a href="?module=${module.id}" class="module-card ${completedClass}">
            <span class="module-number">Модуль ${module.id}</span>
            <h3>${module.title}</h3>
            <p>${module.description}</p>
            <div class="module-meta">
                <span>${module.duration}</span>
                <span>${module.exercises > 0 ? module.exercises + ' упражнений' : 'Обзор'}</span>
            </div>
        </a>
    `;
}

// Страница модуля
async function showModulePage(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    
    if (!module) {
        app.innerHTML = '<div class="container"><p>Модуль не найден</p></div>';
        return;
    }
    
    // Загружаем материал из markdown файла
    let content = '';
    try {
        const response = await fetch(`course-materials/module-${moduleId}-${getModuleFileName(moduleId)}.md`);
        if (response.ok) {
            content = await response.text();
        }
    } catch (error) {
        console.error('Ошибка загрузки контента:', error);
    }
    
    const progress = getProgress();
    const completed = isModuleCompleted(moduleId, progress);
    
    app.innerHTML = `
        <div class="container">
            <div class="module-header">
                <a href="index.html" class="back-link">← Назад к курсу</a>
                <h1>Модуль ${module.id}: ${module.title}</h1>
                <p>${module.description} · ${module.duration}</p>
            </div>
            
            <div class="content-section">
                <h2>Теория</h2>
                <div class="markdown-content">
                    ${content || '<p>Материал загружается...</p>'}
                </div>
            </div>
            
            ${module.exercises > 0 ? `
                <div class="content-section">
                    <h2>Упражнения</h2>
                    <p>Выполните упражнения для закрепления материала.</p>
                    <a href="exercises.html?module=${moduleId}" 
                       class="btn" target="_blank">
                        Открыть упражнения →
                    </a>
                </div>
                
                <div class="content-section">
                    <h2>Отметить как завершённый</h2>
                    <p>После выполнения упражнений отметьте модуль как завершённый:</p>
                    <button class="btn btn-success" id="completeBtn">
                        ${completed ? '✓ Модуль завершён' : 'Отметить завершённым'}
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Обработчик кнопки завершения
    if (module.exercises > 0) {
        document.getElementById('completeBtn').addEventListener('click', () => {
            const newProgress = completeModule(moduleId);
            updateProgressBar(newProgress);
            showModulePage(moduleId);
        });
    }
}

// Получить имя файла модуля
function getModuleFileName(moduleId) {
    const names = {
        '01': 'environment',
        '02': 'ai-prompts',
        '03': 'git',
        '04': 'web-basics',
        '05': 'todo-project',
        '06': 'api',
        '07': 'advanced'
    };
    return names[moduleId] || 'module';
}

// Запуск приложения
init();
