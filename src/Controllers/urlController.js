const urlModel = require("../models/urlModels");
const validUrl = require("valid-url")
const shortid = require("shortid")
const isValid = function (value) {
    if (typeof (value) === "undefined" || typeof (value) === null) return false;
    if (typeof (value) === "string" && value.trim().length === 0) return false;
    if (typeof (value) == "number") return false;
    return true
}

const isvalidRequest = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    18171,
    "redis-18171.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("UgM3OP8inn2gZAP0gZBaViLVsUVv9QcL", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);




const urlShorten = async function (req, res) {
    try {
        let data = req.body
        let longUrl = data.longUrl


        if (!isvalidRequest(data)) return res.status(400).send({ status: false, meassage: "Request Body should not be empty " })
        if (!longUrl) return res.status(400).send({ status: false, meassage: "Url must be present " });
        if (!isValid(longUrl)) return res.status(400).send({ status: false, meassage: "Url  must be string & not empty" });
        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: "LongUrl is not valid" })

        let cachedProfileData = await GET_ASYNC(`${longUrl}`)
        let parsedcatch = JSON.parse(cachedProfileData)
        if (parsedcatch) {
            return res.status(200).send({ status: true, data: parsedcatch })
        } else {
            let CheckUrl = await urlModel.findOne({ longUrl: longUrl })
            await SET_ASYNC(`${longUrl}`, JSON.stringify(CheckUrl))
            if (CheckUrl) return res.status(200).send({ status: true, data: CheckUrl });
        }

        let urlCode = shortid.generate()
        let shortUrl = `http://localhost:3000/${urlCode}`
        data.urlCode = urlCode
        data.shortUrl = shortUrl
        const saveData = await urlModel.create(data)
        await SET_ASYNC(`${longUrl}`, JSON.stringify(saveData))
        res.status(201).send({ status: true, data: saveData })
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}

const getUrl = async function (req, res) {

    try {
        let urlCode = req.params.urlCode
        let cachedProfileData = await GET_ASYNC(`${urlCode}`)
        let parsedcatch = JSON.parse(cachedProfileData)
        if (cachedProfileData) {
            return res.status(302).redirect(`${parsedcatch.longUrl}`)
            //res.send(cahcedProfileData)

        } else {
            let urlCheck = await urlModel.findOne({ urlCode: urlCode });
            if (!urlCheck) return res.status(404).send({ status: false, message: "Url not found" })
            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlCheck))
            return res.status(302).redirect(`${urlCheck.longUrl}`)
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message })
    }

}


module.exports.urlShorten = urlShorten
module.exports.getUrl = getUrl