export interface CreateBookingRequest {
  roomid: number;
  firstname: string;
  lastname: string;
  depositpaid: boolean;
  email: string;
  phone: string;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
}
