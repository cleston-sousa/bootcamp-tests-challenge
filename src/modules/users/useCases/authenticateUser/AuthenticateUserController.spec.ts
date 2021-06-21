import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app"
import createConnection from "../../../../database";

let connection: Connection;


describe("authenticate user controller", () => {
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


  it("givenEmailPassword_withValidValues_whenExecute_thenReturnAuthenticatedInfoAndToken", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@local",
      password: "admin",
    });

    const info = response.body;

    expect(info).toHaveProperty('token');
    expect(info).toHaveProperty('user.email', 'admin@local');

    expect(response.status).toBe(200);
  });


  it("givenEmailPassword_withInvalidEmail_whenExecute_thenReturnAuthenticatedInfoAndToken", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "nonono@local",
      password: "admin",
    });
    expect(response.status).toBe(401);
  });


  it("givenEmailPassword_withInvalidPassword_whenExecute_thenReturnAuthenticatedInfoAndToken", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@local",
      password: "nonono",
    });
    expect(response.status).toBe(401);
  });



});
