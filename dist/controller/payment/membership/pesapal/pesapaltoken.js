"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const getPesapalToken = async () => {
    // console.log("Using PESAPAL_CONSUMER_KEY:", process.env.PESAPAL_CONSUMER_KEY);
    // console.log("Using PESAPAL_CONSUMER_SECRET:", process.env.PESAPAL_CONSUMER_SECRET);
    try {
        const response = await axios_1.default.post("https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken", {
            consumer_key: process.env.PESAPAL_TEST_CONSUMER_KEY,
            consumer_secret: process.env.PESAPAL_TEST_CONSUMER_SECRET,
        }, {
            headers: { "Content-Type": "application/json" },
            httpAgent: new http_1.default.Agent({ family: 4 }),
            timeout: 10000,
        });
        console.log("token from getPesapal", response.data);
        return response.data.token;
    }
    catch (error) {
        //console.log("pesapal generate token error", error);
        throw new Error("Failed to authenticate with Pesapal");
    }
};
module.exports = getPesapalToken;
//# sourceMappingURL=pesapaltoken.js.map