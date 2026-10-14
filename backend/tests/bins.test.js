const request = require("supertest");
const app = require("../app");

describe("Bins API", () => {

  test("Get all bins", async () => {

    const res = await request(app)
      .get("/api/v1/bins");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.bins)).toBe(true);

  });

  test("Create bin without label should fail", async () => {

    const res = await request(app)
      .post("/api/v1/bins")
      .send({
        contents: "Insulin",
        temperature: 4,
        quantity: 10
      });

    expect(res.statusCode).toBe(400);

  });

});