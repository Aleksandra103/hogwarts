const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config()
let taskCounter = 0

const {Pool} = require('pg')
//Строку ниже после = должна содержать вашь URI
const connectionString = process.env.URI

const pool = new Pool(
    {
	    connectionString: connectionString,
	    ssl: { rejectUnauthorized: false},
    })

const sql1 = `drop table if exists characters;
            create table characters(id serial primary key,
            fname text, lname text, houses text);`

pool.query(sql1, (err, res) =>
{
    if(err)
    {
        console.log(err)
        process.exit(1)
    }
    csvToDb()
})

function csvToDb()
{
    const fStream = fs.createReadStream('characters.csv')
    const csvStream = csv()
    csvStream.on('data', addRow)
    fStream.pipe(csvStream)
}

function addRow(data)
{
    const row = [data['имя'], data['фамилия'], data['факультет']]
    const sql2 = `insert into characters (fname, lname, houses)
    values ($1, $2, $3);`
    ++taskCounter
    pool.query(sql2, row, (err, res) =>
    {
        if(err)
        {
            console.log(err)
            process.exit(2)
        }
        --taskCounter
        if(taskCounter == 0)
            pool.end()
    })
}