const database = include('databaseConnection');

async function createTables() {
	let createUserTypeSQL = `
	CREATE TABLE IF NOT EXISTS user_type (
		user_type_id INT NOT NULL AUTO_INCREMENT,
		type VARCHAR(5) NOT NULL,
		PRIMARY KEY (user_type_id));
	`;

	let createUsersSQL = `
	CREATE TABLE IF NOT EXISTS user (
		user_id INT NOT NULL AUTO_INCREMENT,
		username VARCHAR(25) NOT NULL,
		email VARCHAR(255) NOT NULL,
		password VARCHAR(100) NOT NULL,
		user_type_id INT NOT NULL DEFAULT 1,
		PRIMARY KEY (user_id),
		UNIQUE INDEX username (username ASC) VISIBLE,
		FOREIGN KEY (user_type_id) REFERENCES user_type(user_type_id));
	`

	let createTodoSQL = `
	CREATE TABLE IF NOT EXISTS todo (
		todo_id INT NOT NULL AUTO_INCREMENT,
		description VARCHAR(25) NOT NULL,
		user_id INT NOT NULL,
		PRIMARY KEY (todo_id),
		FOREIGN KEY (user_id) REFERENCES user(user_id));
	`
	
	try {
		const resultsUserType = await database.query(createUserTypeSQL);
		const resultsUsers = await database.query(createUsersSQL);
		const resultsTodo = await database.query(createTodoSQL);

        console.log("Successfully created user_type table");
		console.log(resultsUserType[0]);

		console.log("Successfully created user table");
		console.log(resultsUsers[0]);

		console.log("Successfully created Todo table");
		console.log(resultsTodo[0]);
		return true;
	}
	catch(err) {
		console.log("Error Creating tables");
        console.log(err);
		return false;
	}
}

module.exports = {createTables};