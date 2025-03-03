const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Project = sequelize.define("Project", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    start_date: { type: DataTypes.DATE },
    deadline: { type: DataTypes.DATE },
    assigned_members: { type: DataTypes.ARRAY(DataTypes.STRING) },
    project_owner: { type: DataTypes.STRING },
    status: {
        type: DataTypes.ENUM("Not Started", "In Progress", "Completed", "On Hold"),
        defaultValue: "Not Started"
    },
    priority: {
        type: DataTypes.ENUM("Low", "Medium", "High", "Urgent"),
        defaultValue: "Medium"
    },
    completion_percentage: { type: DataTypes.INTEGER, validate: { min: 0, max: 100 } },
    budget: { type: DataTypes.DECIMAL(10, 2) },
    attachments: { type: DataTypes.ARRAY(DataTypes.STRING) },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
    timestamps: false
});

module.exports = Project;
