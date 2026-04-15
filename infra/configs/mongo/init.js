db = db.getSiblingDB("ragify");

db.createUser({
  user: "myuser",
  pwd: "mypassword",
  roles: [{ role: "readWrite", db: "ragify" }],
});
