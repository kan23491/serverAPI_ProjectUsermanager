let express = require('express');
let bodyParser =  require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
let cors = require('cors');
const PORT = 3001;

let pool = new pg.Pool({
    user: 'postgres',
    database: 'UserManager',
    password: 'admin', 
    host: 'localhost',
    port: 5432

});

// pool.connect(function(err, db, done) {
//     if(err) {
//         // return response.status(400).send(err)
//         console.log(err)
//     }
//     else{
//         db.query('SELECT * FROM public."user"',function(err, table) {
//             done();
//             if(err) {
//                 // return response.status(400).send(err)
//                 console.log(err)
//             }
//             else{
//                 // return response.status(200).send(table.rows)
//                 console.log(table.rows)
//             }
//         })
//     }
// })

let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

app.delete('/api/delete/:user_id', function(request, response) {
    var id = request.params.user_id;
    console.log(id);
    pool.connect(function(err, db ,done) {
        if(err) {
            return response.status(400).send(err)
        }
        else {
            db.query('DELETE FROM public."user" WHERE user_id = $1', [Number(id)], function(err, resule) {
                if(err){
                    console.log(err);
                    return response.status(400).send(err)
                }
                else {
                    return response.status(200).send({message: 'success in deleting record'})
                }
            })
        }
    })

});

app.get('/api/user', function(request, response) {
    pool.connect(function(err, db, done) {
        if(err) {
            return response.status(400).send(err)
        }
        else{
            db.query('SELECT * FROM public."user"',function(err, table) {
                done();
                if(err) {
                    return response.status(400).send(err)
                }
                else{
                    return response.status(200).send(table.rows)
                }
            })
        }
    })
});

app.post('/api/login', (request, response) =>{
    var email = request.body.email;
    var password = request.body.password;
    pool.connect((err, db, done) => {
        if(err) {
            return response.status(400).send(err);
        }
        else {
            db.query('SELECT  email, password FROM public."user" WHERE email = $1 and password= $2',[email,password],(err, table) =>{
               done();
                if(err) {
                    return response.status(400).send(err)
                    // console.log(err)
                }
                else {
                    return response.status(200).send(table.rows)
                }
            })
        }
    });
})


app.post('/api/new-user', function(request, response) {
    // console.log(request.body);
   var name = request.body.name;
   var email = request.body.email;
   var department = request.body.department;
   var job = request.body.job;
   var password = request.body.password;
   var role = request.body.role;
   var user_id = request.body.user_id;
   let values = [user_id,name, email, password, department, job, role]
   pool.connect((err, db, done) => {
        if(err) {
           return response.status(400).send(err);
            // return console.log(err);
        }
        else {
            db.query('INSERT INTO public."user"(user_id, name, email, password, department, job, role) VALUES ($1,$2,$3,$4,$5,$6,$7)',[...values], (err, table) => {
                done();
                if(err) {
                    return response.status(400).send(err);
                    // return console.log(err);
                }
                else{
                    console.log('Data insert');
                    db.end();
                    response.status(201).send({message: 'data insert!'});
                }
            })
        }
    })

});

app.put('/api/editUser/:user_id', function(request, response) {
    var name = request.body.name;
    var email = request.body.email;
    var department = request.body.department;
    var job = request.body.job;
    var password = request.body.password;
    var role = request.body.role;
    var user_id = require.params.user_id;
    let values = [user_id,name, email, password, department, job, role]

   pool.connect((err, db, done) => {
       if(err){
            return response.status(400).send(err);
       }
       else {
           db.query('UPDATE public."user" SET user_id=$1, name=$2, email=$3, department=$4, password=$5, job=$6, role=$7'
           ,[...values], (err, table) => {
               done();
               if(err) {
                    return response.status(400).send(err);
               }
               else {
                    console.log('update data');
                    db.end();
               }
           })
       }
   })
});


app.listen(PORT, () => console.log('Listening on port' + PORT));