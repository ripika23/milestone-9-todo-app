const express = require("express");
const session = require("express-session");
const { csrfSync } = require("csrf-sync");

const sequelize = require("./models");
const Todo = require("./models/todo");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "milestone-9-secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

const {
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => {
        return (
            req.body?._csrf ||
            req.headers["x-csrf-token"]
        );
    }
});

app.get("/", async (req, res) => {
    try {
        const todos = await Todo.findAll({
            order: [["id", "ASC"]]
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue = [];
        const dueToday = [];
        const dueLater = [];
        const completed = [];

        todos.forEach((todo) => {
            if (todo.completed) {
                completed.push(todo);
                return;
            }

            if (!todo.dueDate) {
                dueLater.push(todo);
                return;
            }

            const dueDate = new Date(todo.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                overdue.push(todo);
            } else if (dueDate.getTime() === today.getTime()) {
                dueToday.push(todo);
            } else {
                dueLater.push(todo);
            }
        });

        const csrfToken = generateToken(req);

        res.render("index", {
            overdue,
            dueToday,
            dueLater,
            completed,
            csrfToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post(
    "/todos",
    csrfSynchronisedProtection,
    async (req, res) => {
        try {
            const title = req.body.title
                ? req.body.title.trim()
                : "";

            const dueDate = req.body.dueDate;

            if (!title) {
                return res
                    .status(400)
                    .send("Todo title cannot be empty.");
            }

            if (!dueDate) {
                return res
                    .status(400)
                    .send("Due date cannot be empty.");
            }

            await Todo.create({
                title: title,
                dueDate: dueDate,
                completed: false
            });

            res.redirect("/");
        } catch (error) {
            console.error(error);
            res.status(500).send("Failed to create Todo.");
        }
    }
);

app.put(
    "/todos/:id",
    csrfSynchronisedProtection,
    async (req, res) => {
        try {
            const todo = await Todo.findByPk(req.params.id);

            if (!todo) {
                return res.status(404).json({
                    error: "Todo not found"
                });
            }

            const completed = req.body.completed;

            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    error: "completed must be true or false"
                });
            }

            await todo.setCompletionStatus(completed);

            res.json({
                success: true,
                todo: todo
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                error: "Failed to update Todo"
            });
        }
    }
);

app.delete(
    "/todos/:id",
    csrfSynchronisedProtection,
    async (req, res) => {
        try {
            const todo = await Todo.findByPk(req.params.id);

            if (!todo) {
                return res.status(404).send("Todo not found.");
            }

            await todo.destroy();

            res.redirect("/");
        } catch (error) {
            console.error(error);
            res.status(500).send("Failed to delete Todo.");
        }
    }
);

module.exports = {
    app,
    sequelize
};