const express = require('express')
const jwt = require('jsonwebtoken')
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const dataScheme = require('./model/data')
require('dotenv').config()
require('./config/database').connect()

const { API_PORT } = process.env

const app = express()

const swaggerJSDoc = YAML.load('./api.yaml')

app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerJSDoc))

app.post('/',async (req,res) =>{

    const method = req.query.method
    const input = req.query.input.split(',')

    console.log(method,input)

    try{

        const token = jwt.sign(
            { 
               data: method, input 
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2m"
            }
        )

        dataScheme.remove({ method : method, input : input })

        const data = await dataScheme.create({
            method,input,token
        })

        //ok
        res.status(200).send(data)
    }
    catch(err){
        console.log(err)
    }

})

app.get('/get', async (req,res) =>{
    
    //search most recent data base on method
    const filterdata = await dataScheme.findOne({ method : req.query.method }).sort({'_id':-1}).limit(1)

    if(!filterdata) res.status(404).send("error")
    else{
        console.log(filterdata)
        try{
            const checkverify = filterdata.token
            if(jwt.verify(checkverify, process.env.TOKEN_KEY)){
                console.log(filterdata)
                res.status(200).send({
                    data : filterdata.input
                })
            }
           
        }
        catch(err){
            res.send(err)
        }
    }

})

const port = process.env.PORT || API_PORT

app.listen(port, () =>{
    console.log(`server running on port ${port}`)
})