import cron from "node-cron";

const Ticket = require("../../../model/ticket");

const updateTicketStatus = () =>{
cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  try {
    const result = await Ticket.updateMany(
      { "event.date": { $lt: now }, status: "valid" },
      { $set: { status: "used" } }
    );

    console.log(`${result.modifiedCount} tickets marked as expired`);
  } catch (error) {
    console.error("Error updating tickets:", error);
  }
})
}
module.exports = updateTicketStatus;
