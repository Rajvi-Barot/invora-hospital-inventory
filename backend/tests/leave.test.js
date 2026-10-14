const request = require("supertest");
const app = require("../app");

describe("Leave Request", () => {

  test("should submit leave request", async () => {

    const res = await request(app)
      .post("/api/v1/leave")
      .send({
        nurseId: "123",
        nurseName: "Test Nurse",
        from: "2026-03-20",
        to: "2026-03-22",
        reason: "Medical"
      });
    expect(res.statusCode).toBe(201);

  });

});