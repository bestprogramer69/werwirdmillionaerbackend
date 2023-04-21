var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var sql = require("mssql");
const cors = require('cors');
const { check, validationResult } = require('express-validator');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const whitelist = ['https://backendwerwirdmillionaer.azurewebsites.net'];
const corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self' https://backendwerwirdmillionaer.azurewebsites.net");
    next();
});
// config for your database
const config = {
    server: 'werwirdmillionaer.database.windows.net',
    user: 'bigballs',
    password: 'JTGjeFGMe,^:FE2CF6"V',
    database: 'werwirdmillionaer',
    options: {
        encrypt: true
    },
    port: 1433,
    connectionTimeout: 30000,

};


app.get('/', function(req, res) {
    res.status(200).send('Hello, World!');
});

//Kategorien

app.get('/categories', function(req, res) {
    sql.connect(config, function(err) {
        if (err) {

            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        var request = new sql.Request();
        request.query('SELECT * FROM kategorien', function(err, recordset) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            return res.status(200).send(recordset.recordset);

        });
    });
});


app.post('/categories', [
    check('name').notEmpty().withMessage('Name is required')
], function(req, res) {
    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        var request = new sql.Request();
        const name = req.body.name;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        request.input('name', sql.NVarChar, name);

        request.query(`
            INSERT INTO kategorien(name) VALUES(@name)
        `, function(err, recordset) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send(recordset.recordset);
        });
    });
});

// PUT endpoint for updating an existing category
app.put('/categories/:id', [
    check('name').notEmpty().withMessage('Name is required')
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }

        const id = req.params.id;
        const newName = req.body.name;
        const request = new sql.Request();
        request.input('name', sql.NVarChar(255), newName);
        request.input('id', sql.Int, id);

        request.query(`UPDATE kategorien SET name = @name WHERE id = @id`, function(err, recordset) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }

            res.status(200).send(recordset.recordset);
        });
    });
});

app.delete('/categories/:id', function(req, res) {
    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        const categoryId = req.params.id;
        var request = new sql.Request();
        request.input('categoryId', sql.Int, categoryId);
        request.query('DELETE FROM kategorien WHERE id = @categoryId', function(err, recordset) {
            if (err) {
                res.status(500).send(err);
                console.log(err)
                return;
            }
            return res.status(200).send(recordset.recordset);
        })
    })
});



//Kategorien
app.get('/questions', function(req, res) {
    sql.connect(config, function(err) {
        if (err) {

            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        var request = new sql.Request();
        request.query('SELECT * FROM fragen', function(err, recordset) {

            if (err) {
                res.status(500).send(err);
            }

            res.status(200).send(recordset.recordset);

        });
    });
});

app.post('/questions', [
    check('frage').notEmpty().withMessage('Question is required'),
    check('kategorien_id').notEmpty().withMessage('Category ID is required'),
    check('falscheAntwort1').notEmpty().withMessage('Incorrect answer 1 is required'),
    check('falscheAntwort2').notEmpty().withMessage('Incorrect answer 2 is required'),
    check('falscheAntwort3').notEmpty().withMessage('Incorrect answer 3 is required'),
    check('richtigeAntwort').notEmpty().withMessage('Correct answer is required'),
    check('countRight').notEmpty().withMessage('Count of correct answers is required'),
    check('countFalse').notEmpty().withMessage('Count of incorrect answers is required')
], function(req, res) {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        console.log('errrorr')
        return res.status(400).json({ errors: errors.array() });
    }

    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }

        const {
            frage,
            kategorien_id,
            falscheAntwort1,
            falscheAntwort2,
            falscheAntwort3,
            richtigeAntwort,
            countRight,
            countFalse
        } = req.body;

        var request = new sql.Request();

        request.input('frage', sql.NVarChar(255), frage);
        request.input('kategorien_id', sql.Int, kategorien_id);
        request.input('falscheAntwort1', sql.Int, falscheAntwort1);
        request.input('falscheAntwort2', sql.Int, falscheAntwort2);
        request.input('falscheAntwort3', sql.Int, falscheAntwort3);
        request.input('richtigeAntwort', sql.Int, richtigeAntwort);
        request.input('countRight', sql.Int, countRight);
        request.input('countFalse', sql.Int, countFalse);

        request.query(`
            INSERT INTO fragen(kategorien_id, frage, falscheAntwort1, falscheAntwort2, falscheAntwort3, richtigeAntwort, countRight, countFalse) 
            VALUES (@kategorien_id, @frage, @falscheAntwort1, @falscheAntwort2, @falscheAntwort3, @richtigeAntwort, @countRight, @countFalse)
        `, function(err, recordset) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send(recordset.recordset);
        });
    });
});

app.put('/questions/:id', [
    check('kategorien_id').optional().notEmpty().withMessage('Category ID is required'),
    check('frage').optional().notEmpty().withMessage('Question is required'),
    check('countRight').optional().notEmpty().withMessage('Count of correct answers is required'),
    check('countFalse').optional().notEmpty().withMessage('Count of incorrect answers is required')
], function(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        const id = req.params.id;
        const { kategorien_id, frage, countRight, countFalse } = req.body;
        let updateFields = [];
        let params = {};
        if (kategorien_id) {
            updateFields.push(`kategorien_id = @kategorien_id`);
            params.kategorien_id = sql.Int;
        }
        if (frage) {
            updateFields.push(`frage = @frage`);
            params.frage = sql.NVarChar(255);
        }
        if (countRight) {
            updateFields.push(`countRight = @countRight`);
            params.countRight = sql.Int;
        }
        if (countFalse) {
            updateFields.push(`countFalse = @countFalse`);
            params.countFalse = sql.Int;
        }
        if (updateFields.length === 0) {
            res.status(400).send('No fields provided for update.');
            return;
        }
        const updateStatement = updateFields.join(', ');
        const request = new sql.Request();

        Object.entries(params).forEach(([key, type]) => {
            request.input(key, type, req.body[key]);
        });
        request.input('id', sql.Int, id);
        request.query(`UPDATE fragen SET ${updateStatement} WHERE id = @id`, function(err, recordset) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            res.status(200).send(recordset);
        });
    });
});

app.delete('/questions/:id', function(req, res) {
    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        const id = req.params.id;
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.query(`DELETE FROM fragen WHERE id = @id`, { id: id }, function(err, recordset) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            res.status(204).send();
        });
    });
});


app.get('/game', function(req, res) {
    res.status(200).send('get request works')
        /* sql.connect(config, function(err) {
            if (err) {

                console.error('Error connecting to database:', err);
                res.status(500).send(err);
                return;
            }
            var request = new sql.Request();
            request.query('SELECT * FROM spiele', function(err, recordset) {

                if (err) {
                    res.status(500).send(err);
                }

                res.status(200).send(recordset.recordset);

            });
        });*/
});

app.post('/game', [
    check('kategorien_id').notEmpty().withMessage('Category ID is required'),
    check('spieler').notEmpty().withMessage('Player name is required'),
    check('start').notEmpty().withMessage('Start time is required'),
    check('ende').notEmpty().withMessage('End time is required'),
    check('punktzahl').notEmpty().withMessage('Score is required')
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }

        const { kategorien_id, spieler, start, ende, punktzahl } = req.body;

        var request = new sql.Request();
        request.input('kategorien_id', sql.Int, kategorien_id);
        request.input('spieler', sql.NVarChar(255), spieler);
        request.input('start', sql.DateTime, start);
        request.input('ende', sql.DateTime, ende);
        request.input('punktzahl', sql.Int, punktzahl);

        request.query('INSERT INTO spiele(kategorien_id, spieler, start, ende, punktzahl) VALUES(@kategorien_id, @spieler, @start, @ende, @punktzahl)', function(err, recordset) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send(recordset.recordset);
        });
    });
});

app.put('/game/:id', [
    check('kategorien_id').optional().isInt().withMessage('Category ID must be an integer'),
    check('punktzahl').optional().isInt().withMessage('Score must be an integer'),
    check('spieler').optional().notEmpty().withMessage('Player name is required'),
    check('start').optional().isISO8601().withMessage('Invalid start date'),
    check('ende').optional().isISO8601().withMessage('Invalid end date')
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    sql.connect(config, function(err) {
        if (err) {

            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        const id = req.params.id;
        const { kategorien_id, punktzahl, spieler, start, ende } = req.body;
        let updateFields = [];
        if (kategorien_id) {
            updateFields.push(`kategorien_id = @kategorien_id`);
        }
        if (punktzahl) {
            updateFields.push(`punktzahl = @punktzahl`);
        }
        if (spieler) {
            updateFields.push(`spieler = @spieler`);
        }
        const isoStart = new Date(Date.parse(start)).toISOString();
        const isoEnde = new Date(Date.parse(ende)).toISOString();
        if (start) {
            updateFields.push(`start = @start`);
        }
        if (ende) {
            updateFields.push(`ende = @ende`);
        }
        if (updateFields.length === 0) {
            res.status(400).send('No fields provided for update.');
            return;
        }
        const updateStatement = updateFields.join(', ');
        const request = new sql.Request();
        request.input('kategorien_id', sql.Int, kategorien_id);
        request.input('punktzahl', sql.Int, punktzahl);
        request.input('spieler', sql.NVarChar(255), spieler);
        request.input('start', sql.DateTime, isoStart);
        request.input('ende', sql.DateTime, isoEnde);
        request.query(`UPDATE spiele SET ${updateStatement} WHERE id = ${id}`, function(err, recordset) {
            if (err) {
                console.log(err)
                res.status(500).send(err);
                return;
            }
            res.status(200).send(recordset);
        });
    });
});

app.delete('/game/:id', function(req, res) {
    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        const id = req.params.id;
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.query('DELETE FROM spiele WHERE id = @id', function(err, recordset) {
            if (err) {
                res.status(500).send(err);
                console.log(err);
                return;
            }
            return res.status(200).send(recordset.recordset);
        })
    })
});

app.get('/answer', function(req, res) {
    sql.connect(config, function(err) {
        if (err) {

            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        var request = new sql.Request();
        request.query('SELECT * FROM antworten', function(err, recordset) {

            if (err) {
                res.status(500).send(err);
            }

            res.status(200).send(recordset.recordset);

        });
    });
});
app.post('/answer', [
    check('antwort').notEmpty().withMessage('Answer is required')
], function(req, res) {
    const errors = validationResult(req)
    console.log(errors)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        var request = new sql.Request();

        const antwort = req.body.antwort;
        request.input('antwort', sql.NVarChar(255), antwort);
        request.query('INSERT INTO antworten (antwort) VALUES (@antwort); SELECT SCOPE_IDENTITY() AS id', function(err, recordset) {
            if (err) {
                console.log(err)
                return res.status(500).send(err);
            }

            const id = recordset.recordset[0].id;
            const insertedRecord = { id, antwort };
            return res.status(200).json(insertedRecord);
        });
    });
});



app.put('/answer/:id', [
    check('antwort').notEmpty().withMessage('Answer is required')
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        const id = req.params.id;
        console.log(id)
        const antwort = req.body.antwort;
        var request = new sql.Request();
        request.input('antwort', sql.NVarChar(255), antwort);
        request.input('id', sql.Int, id);
        request.query('UPDATE antworten SET antwort = @antwort WHERE id = @id', function(err, recordset) {
            if (err) {
                res.status(500).send(err);
                console.log(err)
                return;
            }

            return res.status(200).send(recordset.recordset);
        });
    });
});


app.delete('/answers/:id', function(req, res) {
    console.log('debug1');
    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        console.log('debug2');
        const id = req.params.id;
        console.log(id)
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.query('DELETE FROM antworten WHERE id = @id', function(err, recordset) {
            if (err) {
                console.error('Error deleting from database:', err);
                res.status(500).send(err);
                return;
            }
            return res.status(200).send(recordset.rowsAffected);
        })
    })
});



app.get('/login/:username', function(req, res) {
    sql.connect(config, function(err) {
        if (err) {

            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        const username = req.params.username;
        var request = new sql.Request();
        request.input('username', sql.NVarChar(255), username);
        request.query('SELECT * FROM login WHERE username = @username', function(err, recordset) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            return res.status(200).send(recordset.recordset);

        });
    });
});


app.post('/login', [
    check('username').notEmpty().withMessage('Name is required'),
    check('password').notEmpty().withMessage('Name is required')
], function(req, res) {
    sql.connect(config, function(err) {
        if (err) {
            console.error('Error connecting to database:', err);
            res.status(500).send(err);
            return;
        }
        var request = new sql.Request();
        const username = req.body.username;
        const password = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        request.input('username', sql.NVarChar, username);
        request.input('password', sql.NVarChar, password);

        request.query(`
            INSERT INTO login(username, password) VALUES(@username, @password)
        `, function(err, recordset) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }

            return res.status(200).send(recordset.recordset);
        });
    });
});

var server = app.listen(5000, '0.0.0.0', function() {
    console.log('Server is running..');
});