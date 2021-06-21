import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app"
import createConnection from "../../../../database";

let connection: Connection;


describe("show user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.query("CREATE SCHEMA IF NOT EXISTS public;");
    await connection.runMigrations();

    const id = uuidv4();
    const pass = await hash("admin", 8);

    await connection.query(
      `insert into users (id,name,email,password,created_at) values ('${id}', 'admin', 'admin@local','${pass}','now()' )`
    );
  });
  afterAll(async () => {
    await connection.query("DROP SCHEMA public CASCADE;");
    await connection.close();
  });


  it("givenToken_withValidValues_whenExecute_thenReturnAuthenticatedInfo", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@local",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile").set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'admin@local');
  });


  it("givenToken_withInvalidValues_whenExecute_thenReturnAuthenticatedInfo", async () => {

    const response = await request(app).get("/api/v1/profile").set({ Authorization: `Bearer nononono` });

    expect(response.status).toBe(401);
  });

});
