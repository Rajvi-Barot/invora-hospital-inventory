const request = require("supertest");
const app = require("../app");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const mongoose = require("mongoose");

jest.setTimeout(30000);

describe("Hospital API", () => {
  let token;

  beforeAll(async () => {
    await User.deleteMany({});
    await Hospital.deleteMany({});

    await request(app).post("/api/v1/register").send({
      name: "deepanshu",
      email: "deepanshu@gmail.com",
      password: "123456",
    });

    const loginRes = await request(app).post("/api/v1/login").send({
      email: "deepanshu@gmail.com",
      password: "123456",
    });

    token = loginRes.body.token;
  });

  test("Should add a new hospital", async () => {
    const res = await request(app)
      .post("/api/v1/hospitals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Max Hospital",
        location: "Delhi",
        beds: 100,
        contact: "9999999999",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("hospital");
    expect(res.body.hospital.name).toBe("Max Hospital");
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Hospital.deleteMany({});
  });
});