import { defineBookingSuccessScenario } from "../scenarios/booking-success.scenario";

defineBookingSuccessScenario({
  name: "sin depósito",
  roomid: 1,
  depositpaid: false,
});
