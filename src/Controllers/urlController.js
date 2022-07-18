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



const urlShorten = async function (req, res) {
    try {
        let data = req.body


        if (!isvalidRequest(data)) return res.status(400).send({ status: false, meassage: "Request Body should not be empty " })
        if (!data.longUrl) return res.status(400).send({ status: false, meassage: "Url must be present " });
        if (!isValid(data.longUrl)) return res.status(400).send({ status: false, meassage: "Url  must be string & not empty" });
        if (!validUrl.isUri(data.longUrl)) return res.status(400).send({ status: false, message: "LongUrl is not valid" })
        let CheckUrl = await urlModel.findOne({ longUrl: data.longUrl })
        if (!CheckUrl) return res.status(409).send({ status: false, meassage: "Url is already present " });

        let urlCode = shortid.generate(data.longUrl)
        let shortUrl = `http://localhost:3000/${urlCode}`
        data.urlCode = urlCode
        data.shortUrl = shortUrl
        const saveData = await urlModel.create(data)
        res.status(201).send({ status: true, data: saveData })
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

const getUrl = async function (req, res) {

    try {
        let urlCode = req.params.urlCode
        let urlCheck = await urlModel.findOne({ urlCode: urlCode });
 if (!urlCheck) return res.status(404).send({ status: false, message: "Url not found" })


return res.status(302).send({status:true,message:`redirect to ${CheckUrl.longUrl}`})

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }

}


module.exports.urlShorten = urlShorten
module.exports.getUrl =  getUrl