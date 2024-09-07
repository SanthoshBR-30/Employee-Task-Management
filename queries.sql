CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  user_id INTEGER REFERENCES users(id) 
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(15) 
);


SELECT *
FROM notes
JOIN users
ON users.id = user_id;