// Selectors
const categoriesContainer = document.querySelector('.categories');
const addCategoryForm = document.querySelector('.category-form');
const categoryInput = document.querySelector('.category-input');
const deleteCategoryBtn = document.querySelector('.delete-category');

const projectsContainer = document.querySelector('.project-container');
const addProjectForm = document.querySelector('.create-project-form');
const projectNameInput = document.querySelector('#project-name-input');
const projectStatusInput = document.querySelector('#important-input');
const projectDescriptionInput = document.querySelector('#project-description-input');

const progressCount = document.querySelector('.progress-count');
const completedCount = document.querySelector('.completed-count');
const importantCount = document.querySelector('.important-count');

const clearCompleted = document.querySelector('.clear-completed');

const modalBtn = document.querySelector('.add-project');

// Local Storage namespaces
const LOCAL_STORAGE_CATEGORY_KEY = 'project_tracker.categories';
const LOCAL_STORAGE_SELECTED_KEY = 'project_tracker.selectedCategory';

// List of project categories
let categoryList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORY_KEY)) || [];
let selectedCategoryId = localStorage.getItem(LOCAL_STORAGE_SELECTED_KEY) || 'none';

// Render dynamic elements to screen
function render() {
    clearElements(categoriesContainer);
    clearElements(projectsContainer);
    renderCategories();

    // Render selected category projects
    if(selectedCategoryId === 'none') {
        modalBtn.style.display = 'none';
        renderStats();
    } else {
        modalBtn.style.display = '';
        const selectedCategory = categoryList.find(category => 
            category.id === selectedCategoryId);
        renderProjects(selectedCategory);
        renderStats(selectedCategory);
    }
};

// Save lists to local storage
function save() {
    localStorage.setItem(LOCAL_STORAGE_CATEGORY_KEY, JSON.stringify(categoryList));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_KEY, selectedCategoryId);
}

// Save elements to local storage and render
function saveAndRender() {
    save();
    render();
}

// Clear the elements of a container
function clearElements(container) {
    while(container.firstChild)
        container.removeChild(container.firstChild);
}

// Render each category to screen
function renderCategories() {
    categoryList.forEach((category) => {
        let newCategory = document.createElement('li');
        newCategory.classList.add('category');
        newCategory.dataset.categoryId = category.id;
        
        let categoryText = document.createElement('span');
        categoryText.classList.add('category-text');
        categoryText.textContent = category.name;
        
        if(category.id === selectedCategoryId)
            newCategory.classList.add('selected');

        newCategory.appendChild(categoryText);
        categoriesContainer.appendChild(newCategory);
    });
}

// Render category's projects to screen
function renderProjects(category) {
    category.projects.forEach(project => {
        let newCard = document.createElement('div');
        newCard.classList.add('project-card');
        newCard.dataset.projectId = project.id;

        if(project.status === 'important') newCard.classList.add('important');
        if(project.status === 'completed') newCard.classList.add('completed');

        // Create project header
        let projectHeader = document.createElement('div');
        projectHeader.classList.add('project-card-header');

        let projectTitle = document.createElement('h3');
        projectTitle.classList.add('project-title');
        projectTitle.textContent = project.name;

        projectHeader.appendChild(projectTitle);

        let toggleCompleted = document.createElement('p');
        toggleCompleted.classList.add('project-toggle');
        toggleCompleted.textContent = 'Mark as completed'

        projectHeader.appendChild(toggleCompleted);

        // Create project body
        let projectDescription = document.createElement('p');
        projectDescription.classList.add('description');
        projectDescription.textContent = project.description;

        let projectCategory = document.createElement('span');
        projectCategory.classList.add('project-category');
        let projectCategoryPar = document.createElement('p');
        projectCategoryPar.textContent = project.category;
        projectCategory.appendChild(projectCategoryPar);

        newCard.appendChild(projectHeader);
        newCard.appendChild(projectDescription);
        newCard.appendChild(projectCategory);

        projectsContainer.appendChild(newCard);
    });
}

// Render status of projects of given categories
function renderStats(category = null) {
    // Count in progress projects
    let inProgressCounter = 0;
    let completedCounter = 0;
    let importantCounter = 0;
    
    if(category) {
        category.projects.forEach(project => {
            if(project.status === "in progress") inProgressCounter++;
            if(project.status === "completed") completedCounter++;
            if(project.status === "important") importantCounter++;
        });
    }

    progressCount.textContent = inProgressCounter;
    completedCount.textContent = completedCounter;
    importantCount.textContent = importantCounter;
}

// Create a new category
function createCategory(name) {
    return { id: Date.now().toString(), name: name, projects: [] };
}

// Create a new project
function createProject(name, description, status, category) {
    return { 
        id: Date.now().toString(),
        name: name,
        description: description,
        status: status,
        category: category 
    }
}

// Use event delegation to select category
categoriesContainer.addEventListener('click', (event) => {
    event.preventDefault();

    if(event.target.matches('span')) {
        let selectedCategory = event.target.closest('li');
        selectedCategoryId = selectedCategory.dataset.categoryId;

        saveAndRender();
    }   
});

// Event listener to create a new category 
addCategoryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = categoryInput.value;
    if(!name) return; // Input validation

    const newCategory = createCategory(name);
    categoryList.push(newCategory);

    categoryInput.value = '';
    saveAndRender();
});

// Event listener to delete selected category
deleteCategoryBtn.addEventListener('click', () => {
    categoryList = categoryList.filter((category) => 
        category.id !== selectedCategoryId);
    selectedCategoryId = 'none';
    saveAndRender();
});

// Event listener to create a new project
addProjectForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = projectNameInput.value;
    const description = projectDescriptionInput.value;
    const status = projectStatusInput.checked ? "important" : "in progress";

    if(!name || !description) return;

    // Get selected category
    const selectedCategory = categoryList.find(category => 
        category.id === selectedCategoryId);

    let newProject = createProject(name, description, status, 
        selectedCategory.name);
    selectedCategory.projects.push(newProject);
    
    // Reset inputs 
    projectNameInput.value = '';
    projectDescriptionInput.value = '';

    // Close form
    const modal = document.querySelector('.project-modal');
    modal.classList.remove('active');
    overlay.classList.remove('active');

    saveAndRender();
});

// Event listener to mark project as completed
projectsContainer.addEventListener('click', (event) => {
    event.preventDefault();

    if(event.target.matches('.project-toggle')){
        let markedProject = event.target.closest('.project-card');
        
        // Get selected project by id
        let selectedCategory = categoryList.find(category => 
            category.id === selectedCategoryId);
        let selectedProject = selectedCategory.projects.find(project => 
            project.id === markedProject.dataset.projectId); 
        
        selectedProject.status = "completed";

        saveAndRender();
    }
});

// Event listener to clear completed projects
clearCompleted.addEventListener('click', event => {
    event.preventDefault();

    let selectedCategory = categoryList.find(category => 
        category.id === selectedCategoryId);

    if(!selectedCategory) return;

    selectedCategory.projects = selectedCategory.projects.filter(project => 
        project.status !== "completed");

    saveAndRender();
});

// Open 'create form' modal
const overlay = document.querySelector('.overlay');
modalBtn.addEventListener('click', (event) => {
    const modal = document.querySelector('.project-modal');
    modal.classList.add('active');
    overlay.classList.add('active');
});

// Close 'create form' modal
const closeBtn = document.querySelector('.close-button');
closeBtn.addEventListener('click', () => {
    const modal = document.querySelector('.project-modal');
    modal.classList.remove('active');
    overlay.classList.remove('active');
});


// Render elements on first load
render();