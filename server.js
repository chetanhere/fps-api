const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mysql = require('mysql')
const fs = require('fs')


const db = mysql.createConnection({
    host: 'localhost',
    user:'',
    password:'',
    database: ''
});

let rawdata = fs.readFileSync('village.json');
let villages = JSON.parse(rawdata);

app.get('/villages',(req, res)=>{
res.json(villages)
})

db.connect((err)=>{
    if(err){
        throw err
    }
    else{
        console.log("MySQL connected successfully");
    }

});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

// fetch product prices API

app.get('/products', (req, res)=>{
    //let sql = 'SELECT product_id, price FROM product_price WHERE price_date='+today;
    let sql = 'SELECT * from products';
    db.query(sql, (err, results)=>{
        if(err){
            throw err
        }
        else{
            res.send(results);
        }
    }) 
})

app.put('/products/:id', (req, res)=>{
    product_id = req.params.id;
    console.log(req.params.id, req.body.product_price);
    //res.statusCode(200);
    product_price = req.body.product_price;
    //console.log(product_price);
    //current_price = 0;
    sql = `INSERT INTO price_history (product_id, previous_price) SELECT product_id, product_price FROM products WHERE product_id=${req.params.id}`;
    db.query(sql, (err, results)=>{
        if (err){
            throw err
        }
        else{
            console.log("value updated in history table.");
        }
    });
    //console.log("updated price: ", current_price);
    
    sql = `UPDATE products SET product_price = ${product_price} WHERE product_id = ${product_id}`;
    db.query(sql, (err, results)=>{
        if(err){
            //res.statusCode(500);
            throw err;
        }
        else{
            res.send(results)
        }
    })
})

// add new users API

app.post('/users', (req, res)=>{
    data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        father_name: req.body.father_name,
        village: req.body.village,
        mobile: req.body.mobile,
        village_group: req.body.village_group
    }
    let sql = 'INSERT INTO users SET ?';
    db.query(sql, data, (err, results)=>{
        if(err){
            throw err
        }
        else{
            res.send(results)
        }
    })
})

// login API 
// pass mobile number as parameter
// if null then sign up with other api and then login
// save login id and if login id save in shared preference then directly login to app

app.post('/login/:mobile', (req, res)=>{
    mobile = req.params.mobile;
    sql = `SELECT * FROM users WHERE mobile=${mobile}`;
    db.query(sql, (err, results)=>{
        if(err){
            throw err
        }
        else{
            console.log(results)
            res.send(results);
        }
    })
})

// fetch all users

app.get('/users', (req, res)=>{
    sql = `SELECT * FROM users`;
    db.query(sql, (err, results)=>{
        if(err){
            throw err
        }
        else{
            res.send(results)
        }
    })
})

// orders api

app.get('/orders', (req, res)=>{
    sql = `select order_id, product_name, qty, first_name as Customer, mobile from orders o join products p on o.product_id=p.product_id join users u on o.user_id=u.user_id where order_status=1`;
    db.query(sql, (err, results)=>{
        if(err){
            throw err
        }
        else{
            res.send(results)
        }
    })
})
// to get the orders of a selected user

app.get('/orders/users/:user_id', (req, res)=>{
    user_id = req.params.user_id;
    sql = `SELECT order_id, product_name, qty, product_price, order_status FROM orders o JOIN products p ON o.product_id=p.product_id WHERE user_id=${user_id}`;
    db.query(sql, (err, results)=>{
        if(err){
            throw err
        }
        else{
            res.send(results)
        }
    })
})

app.put('/orders/:order_id/done', (req, res)=>{
    order_id = req.params.order_id;
    sql = `UPDATE orders SET order_status=2 WHERE order_id=${order_id}`
    db.query(sql, (err, results)=>{
        if(err){
            throw err
        }
        else{
            res.send(results)
        }
    }) 
})





app.listen(3000)
