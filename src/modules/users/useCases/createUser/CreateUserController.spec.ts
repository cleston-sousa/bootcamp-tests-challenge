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

  it("givenNameEmailPassword_withValidValues_whenExecute_thenReturnCreated", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Second User",
      email: "secodn@local",
      password: "123456"
    });

    expect(response.status).toBe(201);
  });

  it("givenNameEmailPassword_withInvalidName_whenExecute_thenReturnBadRequest", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "",
      email: "secodn@local",
      password: "123456"
    });

    expect(response.status).toBe(400);
  });

  it("givenNameEmailPassword_withInvalidPassword_whenExecute_thenReturnBadRequest", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Second User",
      email: "secodn@local",
      password: ""
    });

    expect(response.status).toBe(400);
  });

  it("givenNameEmailPassword_withEmailDuplicated_whenExecute_thenReturnBadRequest", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Second User",
      email: "admin@local",
      password: "123456"
    });

    expect(response.status).toBe(400);
  });



});
