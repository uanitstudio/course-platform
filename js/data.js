// Загрузка данных модулей
async function loadModules() {
    try {
        const response = await fetch('data/modules.json');
        const data = await response.json();
        return data.modules;
    } catch (error) {
        console.error('Ошибка загрузки модулей:', error);
        return [];
    }
}

// Сохранение/загрузка прогресса
function getProgress() {
    const saved = localStorage.getItem('vibe-course-progress');
    return saved ? JSON.parse(saved) : {};
}

function saveProgress(progress) {
    localStorage.setItem('vibe-course-progress', JSON.stringify(progress));
}

// Отметить модуль как завершённый
function completeModule(moduleId) {
    const progress = getProgress();
    progress[moduleId] = true;
    saveProgress(progress);
    return progress;
}

// Проверить, завершён ли модуль
function isModuleCompleted(moduleId, progress) {
    return progress[moduleId] === true;
}

// Рассчитать процент завершения
function calculateProgress(modules, progress) {
    const modulesWithExercises = modules.filter(m => m.exercises > 0);
    const completed = modulesWithExercises.filter(m => isModuleCompleted(m.id, progress));
    return Math.round((completed.length / modulesWithExercises.length) * 100);
}
