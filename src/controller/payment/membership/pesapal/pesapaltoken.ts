import axios from "axios";
import dotenv from "dotenv";
import http from "http";

dotenv.config();


const getPesapalToken = async () => {
  // console.log("Using PESAPAL_CONSUMER_KEY:", process.env.PESAPAL_CONSUMER_KEY);
  // console.log("Using PESAPAL_CONSUMER_SECRET:", process.env.PESAPAL_CONSUMER_SECRET);

  try {
    const response = await axios.post(
      "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken",
      {
        consumer_key: process.env.PESAPAL_TEST_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_TEST_CONSUMER_SECRET,
      },
      {
        headers: { "Content-Type": "application/json" },
        httpAgent: new http.Agent({ family: 4 }),
        timeout: 10000,
      }
    );
    console.log("token from getPesapal", response.data);
    return response.data.token;
  } catch (error: any) {
    //console.log("pesapal generate token error", error);
    throw new Error("Failed to authenticate with Pesapal");
  }
};

module.exports = getPesapalToken;
