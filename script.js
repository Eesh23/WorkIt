document.getElementById('fetch-exercises').addEventListener('click', fetchExercises);
document.getElementById('save-workout').addEventListener('click', saveWorkout);
document.getElementById('view-workouts').addEventListener('click', viewWorkouts);
document.getElementById('add-set').addEventListener('click', addSet);

let currentExercise = null;

function fetchExercises() {
    const name = document.getElementById('exercise-name').value;
    const type = document.getElementById('exercise-type').value;
    const muscle = document.getElementById('exercise-muscle').value;
    const difficulty = document.getElementById('exercise-difficulty').value;

    const query = new URLSearchParams();
    if (name) query.append('name', name);
    if (type) query.append('type', type);
    if (muscle) query.append('muscle', muscle);
    if (difficulty) query.append('difficulty', difficulty);

    fetchExercisesWithPagination(query.toString(), 0);
}

function fetchExercisesWithPagination(query, offset) {
    fetch(`https://api.api-ninjas.com/v1/exercises?${query}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'X-Api-Key': 'uVKzRlsEdwSN4aJ4ItSYzQ==Zk1BZk4sldrb88gi'
        }
    })
    .then(response => response.json())
    .then(data => {
        const exerciseList = document.getElementById('exercise-list');
        if (offset === 0) {
            exerciseList.innerHTML = ''; // Clear the list only if it's the first batch
        }
        data.forEach(exercise => {
            const li = document.createElement('li');
            li.innerHTML = `${exercise.name}: ${exercise.type}<span class="tooltip">${exercise.instructions}</span>`;
            li.addEventListener('mouseover', showTooltip);
            li.addEventListener('mouseout', hideTooltip);
            li.addEventListener('click', () => addToWorkout(exercise));
            exerciseList.appendChild(li);
        });

        // Fetch next set of exercises if there are more
        if (data.length === 10) {  // Assuming API returns 10 results per call
            fetchExercisesWithPagination(query, offset + 10);
        }
    })
    .catch(error => console.error('Error fetching exercises:', error));
}

function showTooltip(event) {
    const tooltip = document.querySelector('.tooltip');
    const currentTooltip = event.currentTarget.querySelector('.tooltip');
    tooltip.innerHTML = currentTooltip.innerHTML;
    tooltip.style.display = 'block';
    tooltip.style.opacity = 1;
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    tooltip.style.display = 'none';
    tooltip.style.opacity = 0;
}

function addToWorkout(exercise) {
    const workoutList = document.getElementById('workout-list');
    const existingExercises = Array.from(workoutList.querySelectorAll('li')).map(li => li.textContent.split(':')[0]);

    if (existingExercises.includes(exercise.name)) {
        displayFeedback('This exercise is already in your workout.', 'error');
        return;
    }

    const li = document.createElement('li');
    li.innerHTML = `${exercise.name}: ${exercise.type} <button class="remove-exercise">Remove</button> <button class="add-set">Add Set</button>`;
    li.querySelector('.remove-exercise').addEventListener('click', () => {
        li.remove();
    });
    li.querySelector('.add-set').addEventListener('click', () => {
        currentExercise = exercise.name;
        openModal();
    });
    workoutList.appendChild(li);
}

function openModal() {
    const modal = document.getElementById("set-modal");
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("set-modal");
    modal.style.display = "none";
}

document.querySelector('.close').addEventListener('click', closeModal);

window.onclick = function(event) {
    const modal = document.getElementById("set-modal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function addSet() {
    const weight = document.getElementById('set-weight').value;
    const reps = document.getElementById('set-reps').value;

    if (!weight || !reps) {
        displayFeedback('Please enter both weight and reps.', 'error');
        return;
    }

    const workoutList = document.getElementById('workout-list');
    const exerciseItems = Array.from(workoutList.querySelectorAll('li'));
    const exerciseItem = exerciseItems.find(li => li.textContent.split(':')[0] === currentExercise);

    if (exerciseItem) {
        const setsUl = exerciseItem.querySelector('ul') || document.createElement('ul');
        const setNumber = setsUl.children.length + 1;
        const setLi = document.createElement('li');
        setLi.textContent = `Set ${setNumber} - Weight: ${weight} lbs, Reps: ${reps}`;
        setsUl.appendChild(setLi);

        if (!exerciseItem.querySelector('ul')) {
            exerciseItem.appendChild(setsUl);
        }
    }

    closeModal();
    displayFeedback('Set added successfully.', 'success');
}

function saveWorkout() {
    const workoutName = document.getElementById('workout-name').value.trim();
    const workoutList = document.getElementById('workout-list');
    const exercises = [];
    workoutList.querySelectorAll('li').forEach(li => {
        const exercise = {
            name: li.textContent.replace(' Remove Add Set', ''),
            sets: Array.from(li.querySelectorAll('ul li')).map(setLi => setLi.textContent)
        };
        exercises.push(exercise);
    });

    if (!workoutName) {
        displayFeedback('Please enter a workout name.', 'error');
        return;
    }

    if (exercises.length > 0) {
        const savedWorkouts = JSON.parse(localStorage.getItem('savedWorkouts')) || [];
        savedWorkouts.push({ name: workoutName, exercises: exercises });
        localStorage.setItem('savedWorkouts', JSON.stringify(savedWorkouts));
        displayFeedback('Workout saved successfully.', 'success');
    } else {
        displayFeedback('No exercises selected.', 'error');
    }
}

function viewWorkouts() {
    window.location.href = 'savedworkouts.html';
}

function displayFeedback(message, type) {
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.textContent = message;
    feedbackDiv.className = type;
}
