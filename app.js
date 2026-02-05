require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());

let nextId = 4; // Initialize nextId to 4 since we have 3 initial todos
let todos = [
    { id: 1, task: 'Buy groceries', completed: false},
    { id: 2, task: 'Walk the dog', completed: false },
    { id: 3, task: 'Read a book', completed: false }
];

// Get all todos
app.get('/todos', (req, res) => {
    res.status(200).json(todos); //send array as json response
});

// POST new - create a new todo
app.post('/todos', (req, res) => {
    // Validate FIRST before creating
    if (!req.body.task) {
        return res.status(400).json({ error: 'Task field is required' });  
    }
    
    if (typeof req.body.task !== 'string') {
        return res.status(400).json({ error: 'Task must be a string' });
    }
    
    // Check for duplicates BEFORE adding up
    if (todos.some(t => t.task === req.body.task)) {
        return res.status(400).json({error: 'Task already exists'});
    }
    
    const newTodo = { 
        id: nextId++, 
        task: req.body.task,
        completed: req.body.completed || false 
    };
    
    todos.push(newTodo);
    res.status(201).json(newTodo);
});


// PATCH Update- partial update of a todo
app.patch('/todos/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));  // find todo by id
    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }
    Object.assign(todo, req.body); //update todo with request body e.g. {completed: true}
    res.status(200).json(todo); //send updated todo as json response
});

//Move the completed todos route before the :id route to avoid confusion
app.get('/todos/completed', (req, res) => {
    const completed = todos.filter(t => t.completed === true);
    res.status(200).json(completed); //custom read
}); //get all completed todos

// DELETE a todo
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = todos.length;
    todos = todos.filter(t => t.id !== id); //filter out the todo to delete
    if (todos.length === initialLength) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send(); //send no content status
});


app.get('/todos/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id)); //find todo by id
    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json(todo);
}); // Get a specific todo by id

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
