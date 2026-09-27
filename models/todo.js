const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Todo = sequelize.define(
  "Todo",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title cannot be empty",
        },
      },
    },

    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "todos",
    timestamps: false,
  }
);

// Required method for Milestone 9
Todo.prototype.setCompletionStatus = async function (status) {
  this.completed = status;
  await this.save();
  return this;
};

module.exports = Todo;