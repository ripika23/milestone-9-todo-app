const request = require("supertest");

const { app, sequelize } = require("../app");
const Todo = require("../models/todo");

describe("Todo API", () => {
    beforeAll(async () => {
        await sequelize.authenticate();
        await sequelize.sync();
    });

    afterEach(async () => {
        await Todo.destroy({
            where: {},
            truncate: true,
            restartIdentity: true
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test("should create a Todo", async () => {
        const todo = await Todo.create({
            title: "Test Todo",
            dueDate: "2026-09-26",
            completed: false
        });

        expect(todo.title).toBe("Test Todo");
        expect(todo.completed).toBe(false);
    });

    test("should update Todo completion status", async () => {
        const todo = await Todo.create({
            title: "Update Test",
            dueDate: "2026-09-26",
            completed: false
        });

        await todo.setCompletionStatus(true);

        const updatedTodo = await Todo.findByPk(todo.id);

        expect(updatedTodo.completed).toBe(true);
    });

    test("should delete a Todo", async () => {
        const todo = await Todo.create({
            title: "Delete Test",
            dueDate: "2026-09-26",
            completed: false
        });

        const id = todo.id;

        await todo.destroy();

        const deletedTodo = await Todo.findByPk(id);

        expect(deletedTodo).toBeNull();
    });
});