const request = require("supertest");
const path = require("path");
const app = require("../app");
const User = require("../models/User");

let token;

beforeAll(async () => {

  await User.create({
    name: "Test User",
    email: "upload@test.com",
    password: "123456",
    role: "admin",
    hospital: "699ddd50c6516b91351ae8b6"
  });

  const res = await request(app)
    .post("/api/v1/login")
    .send({
      email: "upload@test.com",
      password: "123456"
    });

  token = res.body.token;

});

describe("Upload Profile Picture", () => {

  test("should upload image", async () => {

    const res = await request(app)
      .put("/api/v1/upload-profile-pic")
      .set("Authorization", `Bearer ${token}`)
      .attach(
        "image",
        path.join(__dirname, "test.jpg")
      );

    expect(res.statusCode).toBe(200);

  });

});