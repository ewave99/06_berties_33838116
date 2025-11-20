# Berties Books

Code for Dynamic Web Applications module, week 6.

Dependencies: node.js, Express, EJS, MySQL, Dotenv.

## Install the project

1. Ensure Node.js and MySQL are installed on your machine, and ensure that the MySQL server is running.
2. `git clone https://github.com/ewave99/berties-books.git`
3. `cd berties-books`
4. `npm install`
5. From the MySQL shell run:
    1. `source create_db.sql;`
    2. `source insert_test_data.sql;`

## Run the project

1. `node index.js`

## Dotenv

The database modules are secured using Dotenv. 
Rather than hard-coding the database username and password into `index.js`, the credentials are stored in a file called `.env`, using key-value pairs.
These attributes can then be accessed from `index.js` using the format `process.env.KEY`.
The `.env` file is added to the gitignore so it is not visible from GitHub.
The `.env` file cannot be accessed via the web server.

## Audit

There is a table in the database, `logins`, to store attempted logins. For each attempt, the username is stored, along with when the attempt was performed and whether it was successful. 