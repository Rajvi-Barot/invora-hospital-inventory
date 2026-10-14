const request = require("supertest");
const app = require("../app");

describe("Orders API", () => {

  test("Create order", async () => {

    const res = await request(app)
      .post("/api/v1/orders")
      .send({
        user: "Test Nurse",
        hospital: "City Hospital",
        department: "ICU",
        items: [{
          name: "Syringe",
          price: 10,
          quantity: 2
        }],
        totalAmount: 20
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("order");

  });

});