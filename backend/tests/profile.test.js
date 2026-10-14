const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

let token;

beforeAll(async () => {

  await User.create({
    name: "Test User",
    email: "test@gmail.com",
    password: "123456",
    role: "admin",
    hospital: "699ddd50c6516b91351ae8b6"
  });

  const res = await request(app)
    .post("/api/v1/login")
    .send({
      email: "test@gmail.com",
      password: "123456"
    });

  token = res.body.token;

});

describe("Profile Update", () => {

  test("should update profile", async () => {

    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phone: "1234567890",
        address: "Toronto"
      });

    expect(res.statusCode).toBe(200);

  });

});