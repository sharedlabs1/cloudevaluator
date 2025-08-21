import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres', // Change to your database dialect (e.g., 'postgres', 'sqlite', 'mssql')
});

export default sequelize;

