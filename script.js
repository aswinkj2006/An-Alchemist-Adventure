// Get references to all the HTML elements we'll need
const ingredientShelf = document.getElementById('ingredient-shelf');
const cauldron = document.getElementById('cauldron');
const checkButton = document.getElementById('check-potion-btn');
const customerRequest = document.querySelector('#customer-request p');
const mentorDialogue = document.querySelector('#mentor-dialogue p');

// --- GAME DATA ---

// Define the elements that make up our ingredients
const ELEMENTS = {
    H: 'Hydrogen',
    O: 'Oxygen',
    Fe: 'Iron',
    Cl: 'Chlorine'
};

// Define all available ingredients
const INGREDIENTS = {
    'water': { name: 'River Water', elements: { H: 2, O: 1 } },
    'acid': { name: 'Stomach Acid', elements: { H: 1, Cl: 1 } },
    'rust': { name: 'Iron Rust', elements: { Fe: 2, O: 3 } },
    'salt': { name: 'Cave Salt', elements: { Cl: 1 } }
};

// Define the levels (puzzles) for the game
const LEVELS = [
    {
        problem: "My iron sword is rusting! I need something to remove it. It's an emergency!",
        solution: { Fe: 2, Cl: 6 }, // This represents 2 FeCl3, a result of the reaction
        hint: "Rust is made of Iron and Oxygen. To remove it, you need to replace the Oxygen with something more reactive, like Chlorine."
    }
    // Add more levels here later
];

let currentLevel = 0;
let ingredientsInCauldron = [];

// --- GAME SETUP FUNCTIONS ---

// Function to start a level
function startLevel() {
    // Clear the cauldron
    cauldron.innerHTML = '<p>Drag ingredients here</p>';
    ingredientsInCauldron = [];

    // Display the customer's problem
    customerRequest.textContent = LEVELS[currentLevel].problem;
    mentorDialogue.textContent = "A new challenge! What will you brew?";
    
    // Display ingredients on the shelf
    renderIngredients();
}

// Function to draw the ingredients onto the shelf
function renderIngredients() {
    ingredientShelf.innerHTML = ''; // Clear the shelf first
    for (const key in INGREDIENTS) {
        const ingredient = INGREDIENTS[key];
        const ingredientDiv = document.createElement('div');
        ingredientDiv.id = key;
        ingredientDiv.className = 'ingredient';
        ingredientDiv.textContent = ingredient.name;
        ingredientDiv.draggable = true; // Make it draggable
        ingredientShelf.appendChild(ingredientDiv);
    }
}

// --- INITIALIZE THE GAME ---
startLevel();

// Add this to the bottom of script.js

// --- DRAG AND DROP LOGIC ---

// Listen for when a drag starts on the shelf
ingredientShelf.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('ingredient')) {
        e.target.classList.add('dragging'); // Add a class for visual feedback
        e.dataTransfer.setData('text/plain', e.target.id);
    }
});

// Listen for when a drag ends
ingredientShelf.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('ingredient')) {
        e.target.classList.remove('dragging');
    }
});

// When an item is dragged over the cauldron, prevent the default browser behavior
cauldron.addEventListener('dragover', (e) => {
    e.preventDefault();
    cauldron.classList.add('drag-over');
});

// When an item leaves the cauldron area
cauldron.addEventListener('dragleave', () => {
    cauldron.classList.remove('drag-over');
});

// When an item is dropped into the cauldron
cauldron.addEventListener('drop', (e) => {
    e.preventDefault();
    cauldron.classList.remove('drag-over');

    // Get the ID of the dragged ingredient
    const ingredientId = e.dataTransfer.getData('text/plain');
    
    // If the cauldron is empty, remove the "Drag ingredients here" text
    if (cauldron.querySelector('p')) {
        cauldron.innerHTML = '';
    }

    // Add the ingredient to our list and to the cauldron visually
    ingredientsInCauldron.push(ingredientId);
    
    const droppedIngredient = document.createElement('div');
    droppedIngredient.className = 'ingredient';
    droppedIngredient.textContent = INGREDIENTS[ingredientId].name;
    cauldron.appendChild(droppedIngredient);

    mentorDialogue.textContent = `You added ${INGREDIENTS[ingredientId].name}. An interesting choice.`;
});

// Add this to the bottom of script.js

// --- POTION CHECKING LOGIC ---

checkButton.addEventListener('click', () => {
    // 1. Calculate the total elements in the cauldron
    const cauldronElements = {};
    ingredientsInCauldron.forEach(id => {
        const ingredient = INGREDIENTS[id];
        for (const element in ingredient.elements) {
            if (cauldronElements[element]) {
                cauldronElements[element] += ingredient.elements[element];
            } else {
                cauldronElements[element] = ingredient.elements[element];
            }
        }
    });

    // 2. Compare with the level's solution
    const solution = LEVELS[currentLevel].solution;
    let isCorrect = true;

    // Check if all required elements are present and in the correct amount
    for (const element in solution) {
        if (cauldronElements[element] !== solution[element]) {
            isCorrect = false;
        }
    }
    // Check if there are any extra, unnecessary elements
     for (const element in cauldronElements) {
        if (!solution[element]) {
            isCorrect = false;
        }
    }


    // 3. Provide feedback - This is your "AI" Mentor!
    if (isCorrect) {
        mentorDialogue.textContent = "Brilliant! The potion is perfect. The customer will be very pleased.";
        // You could add logic here to move to the next level
    } else {
        // Rule-based hints
        const requiredElements = Object.keys(solution);
        const playerElements = Object.keys(cauldronElements);

        if (playerElements.length === 0) {
             mentorDialogue.textContent = "The cauldron is empty! You must be bold and experiment.";
             return;
        }

        let hint = "";
        for (const element of requiredElements) {
            const requiredAmount = solution[element];
            const playerAmount = cauldronElements[element] || 0;
            if (playerAmount < requiredAmount) {
                hint = `I sense a lack of ${ELEMENTS[element]}... the potion feels weak.`;
                break;
            }
            if (playerAmount > requiredAmount) {
                hint = `There's far too much ${ELEMENTS[element]}! The balance is off.`;
                break;
            }
        }
        
        if (hint) {
            mentorDialogue.textContent = hint;
        } else {
            mentorDialogue.textContent = "So close, yet so far. Re-examine the customer's request and try again.";
        }
    }
});