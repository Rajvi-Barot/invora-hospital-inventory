const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

beforeAll(async () => {

  await User.create({
    name: "Test User",
    email: "test@gmail.com",
    password: "123456",
    role: "admin",
    hospital: "699ddd50c6516b91351ae8b6"
  });

});

describe("User Authentication", () => {

  test("should login successfully", async () => {

    const res = await request(app)
      .post("/api/v1/login")
      .send({
        email: "test@gmail.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);

  });

});