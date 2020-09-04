import passport from 'passport';
import {Strategy as JwtStrategy, ExtractJwt, StrategyOptions} from 'passport-jwt'
import jwt from 'jsonwebtoken'
import express, {Router as router} from 'express'
import bodyParser from 'body-parser'
import {Pool} from 'pg'
import session from 'express-session'
import { SessionOptions } from 'http2';
import {v4} from 'uuid'
const pgSession = require('connect-pg-simple')

var path = require('path');
var app = express();
const pgPool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'welcome',
    database: 'postgres',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

app.use(session({
    store: new (require('connect-pg-simple')(session))({
        pool: pgPool,
        schemaName: 'payment_user',
        tableName : 'user'
    }),
    genid: function(req){
        return v4()
    },
    secret: '09526a36-beb6-4e16-95c4-998eca04ea8c',
    resave: false,
    cookie: {maxAge: 15 * 60 * 1000, httpOnly: true},
    saveUninitialized: false

}))

app.use(express.static(path.join(__dirname, "client-auth-test", "build")));
app.use(bodyParser.json({limit: '10mb'}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
//const JwtStrategy = require('passport-jwt').Strategy
//const ExtractJwt = require('passport-jwt').ExtractJwt  

//const jwt = require('jsonwebtoken')
const loginSecretKey = 'hhQqDlk/Hp+8d...' //example generation: node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"

const jwtOptionsLoginGen :jwt.SignOptions = {
    issuer: 'magiclinkapp.com',
    audience: 'magiclinkapp.com',
    algorithm: 'HS256',
    expiresIn: '25m',
}

type User = {
    email: string,
    uuid: string
}

const generateLoginJWT = (user: User): Promise<string> => {
    return new Promise((resolve, reject) => {
        return jwt.sign(
            { sub: user.uuid },
            loginSecretKey,
            jwtOptionsLoginGen,
            (err, token) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(token)
                }
            },
            )
        })
    }
    
    
    
    
    const jwtOptions : StrategyOptions = {
        secretOrKey: 'hhQqDlk/Hp+8d...', //the same one we used for token generation
        algorithms: ['HS256'], //the same one we used for token generation
        jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'), //how we want to extract token from the request
    }
    
    let userRepoById : any = {
        '5798ef78-7e55-44c3-a35c-2537693da71c':{email:'test123@gmail.com', uuid:'5798ef78-7e55-44c3-a35c-2537693da71c'},
        'ac6cb513-f492-46d8-a994-5bd676b11aef':{email:'test222@gmail.com', uuid:'ac6cb513-f492-46d8-a994-5bd676b11aef'},
        'bbd731aa-3887-4379-b6e0-5b163c48d2df':{email:'test333@gmail.com', uuid:'bbd731aa-3887-4379-b6e0-5b163c48d2df'},
    }
    
    let userRepoByEmail : any = {
        'test123@gmail.com':{email:'test123@gmail.com', uuid:'5798ef78-7e55-44c3-a35c-2537693da71c'},
        'test222@gmail.com':{email:'test222@gmail.com', uuid:'ac6cb513-f492-46d8-a994-5bd676b11aef'},
        'test333@gmail.com':{email:'test333@gmail.com', uuid:'bbd731aa-3887-4379-b6e0-5b163c48d2df'},
    }
    
    passport.use(
        'jwt',
        new JwtStrategy(jwtOptions, (token, done) => {
            console.log('in jwt')
            console.log(token)
    const uuid = token.sub
    let foundUser:User = userRepoById['uuid']
    
    if (foundUser) {
        done(null, foundUser)
    } else {
        done(null, false)
    }
    
})
)

const sanitizeEmail = require('sanitize-mail');
//app.use(router);
app.post('/apiLogin', (req, res) => {
    console.log(req)
    console.log(req.body)
    const email = sanitizeEmail(req.body.email)
    let foundUser = userRepoByEmail[email]
    if (foundUser) {
        generateLoginJWT(foundUser).then(loginToken => {
            //sendAuthenticationEmail(foundUser, loginToken)
            console.log(`user: ${foundUser}`)
            console.log(`token: ${loginToken}`)
        })
      }
      res.send('test')
    
  })

app.get('/test', (req, res, next)=>{
    console.log(req.sessionID)
    console.log(req.session)
    req.session.regenerate((err)=>{
        console.log(err)
    })
    console.log(req.sessionID)
    res.send(req.sessionID)
})
  
app.get('/apiLogin',
      (req, res, next) => {
          pgPool.connect((err, client, release)=>{
              client.query('select * from payment_user.user').then((result)=>{
                console.log('result')
                console.log(result.rows)
              }).catch((err)=>{
                  console.log('err')
                  console.log(err)
              })
              console.log(err)
          })
          req.session
          /*
        const { incorrectToken, token } = req.query
        console.log(token)
        if (token) {
          next()
        } else {
          res.render('login', {
            incorrectToken: incorrectToken === 'true',
          })
        }
      },
      passport.authenticate('jwt', {
      }, (args)=>{console.log(args)})*/}
    )

    app.get("*", function (req : Express.Response, res : express.Response) {
        res.sendFile(path.join(__dirname + "/client-auth-test/build/index.html"));
      });

    app.listen(3030, ()=>{console.log('3030 running...')})