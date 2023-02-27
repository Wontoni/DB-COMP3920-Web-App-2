const database = include('databaseConnection');

async function createUser(postData) {
	let createUserSQL = `
		INSERT INTO user
		(username, email, password)
		VALUES
		(:user, :email, :passwordHash);
	`;

	let params = {
		user: postData.user,
		email: postData.email,
		passwordHash: postData.hashedPassword
	}
	
	try {
		const results = await database.query(createUserSQL, params);

		return true;
	}
	catch(err) {
		console.log("Error inserting user");
        console.log(err);
		return false;
	}
}

async function getTodos(postData) {
	let getUsersSQL = `
		SELECT description
		FROM todo
		JOIN user USING (user_id)
		WHERE user_id = :user_id;
	`;

	let params = {
		user_id: postData.user_id,
	}
	
	try {
		const results = await database.query(getUsersSQL, params);
		return results[0];
	}
	catch(err) {
		console.log("Error getting users");
        console.log(err);
		return false;
	}
}

async function getUser(postData) {
	let getUserSQL = `
		SELECT user_id, username, password, user_type_id, type
		FROM user
		JOIN user_type USING(user_type_id)
		WHERE username = :user;
	`;

	let params = {
		user: postData.user
	}
	
	try {
		const results = await database.query(getUserSQL, params);

		return results[0];
	}
	catch(err) {
		console.log("Error trying to find user");
        console.log(err);
		return false;
	}
}


async function createTodo(postData) {
	let createTodoSQL = `
		INSERT INTO todo
		(description, user_id)
		VALUES
		(:description, :user_id);
	`;

	let params = {
		description: postData.description,
		user_id: postData.user_id,
	}
	
	try {
		const results = await database.query(createTodoSQL, params);
		return true;
	}
	catch(err) {
		console.log("Error inserting user");
        console.log(err);
		return false;
	}
}

async function getUsersAdmin(postData) {
	let getUserSQL = `
		SELECT user_id, username
		FROM user
		JOIN user_type USING(user_type_id)
		WHERE type != 'admin';
	`;
	
	try {
		const results = await database.query(getUserSQL);
		return results[0];
	}
	catch(err) {
		console.log("Error trying to find user");
        console.log(err);
		return false;
	}
}

async function getUsersAdminID(postData) {
	let getUserSQL = `
		SELECT username
		FROM user
		WHERE user_id = :user_id;
	`;

	let params = {
		user_id: postData.user_id,
	}
	
	try {
		const results = await database.query(getUserSQL, params);
		return results[0];
	}
	catch(err) {
		console.log("Error trying to find user");
        console.log(err);
		return false;
	}
}

module.exports = {createUser, getUser, getTodos, createTodo, getUsersAdmin, getUsersAdminID};