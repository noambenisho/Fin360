// server/testCrudRoutes.js
import express from "express";

// NOTE: your models are in the server root (User.js, Profile.js, etc.)
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Investment from "../models/Investment.js";
import Tax from "../models/Tax.js";
import Mortgage from "../models/Mortgage.js";

const router = express.Router();

// small helpers
const ok = (res, data) => res.json({ ok: true, data });
const created = (res, data) => res.status(201).json({ ok: true, data });
const notFound = (res, what = "Resource") => res.status(404).json({ ok: false, msg: `${what} not found` });
const handle = (res, what) => (e) => res.status(500).json({ ok: false, msg: `${what} failed`, detail: e.message });

// generic CRUD factory
const crud = (Model, name) => {
  const r = express.Router();

  r.get("/", async (req, res) => {
    try {
      const q = {};
      if (req.query.userId) q.userId = req.query.userId;
      const docs = await Model.find(q).sort({ createdAt: -1 });
      ok(res, docs);
    } catch (e) { handle(res, `${name}.list`)(e); }
  });

  r.post("/", async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      created(res, doc);
    } catch (e) { handle(res, `${name}.create`)(e); }
  });

  r.get("/:id", async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return notFound(res, name);
      ok(res, doc);
    } catch (e) { handle(res, `${name}.read`)(e); }
  });

  r.put("/:id", async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!doc) return notFound(res, name);
      ok(res, doc);
    } catch (e) { handle(res, `${name}.update`)(e); }
  });

  r.delete("/:id", async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return notFound(res, name);
      ok(res, { _id: req.params.id, deleted: true });
    } catch (e) { handle(res, `${name}.delete`)(e); }
  });

  return r;
};

// mount per collection
router.use("/users", crud(User, "User"));
router.use("/profiles", crud(Profile, "Profile"));
router.use("/investments", crud(Investment, "Investment"));
router.use("/taxes", crud(Tax, "Tax"));
router.use("/mortgages", crud(Mortgage, "Mortgage"));

// quick smoke test that creates one of each and returns them
router.post("/smoketest", async (_req, res) => {
  try {
    const stamp = Date.now();
    const user = await User.create({
      email: `demo${stamp}@example.com`,
      password: "test-only",
      name: "Demo User"
    });

    const profile = await Profile.create({
      userId: user._id,
      monthlyIncome: 12000,
      monthlyExpenses: 7000,
      savings: 30000,
      monthlyInvestment: 1500,
      otherAssets: 10000,
      liabilities: 5000
    });

    const investment = await Investment.create({
      userId: user._id,
      title: "S&P 500 ETF",
      amount: 2500,
      category: "ETF"
    });

    const tax = await Tax.create({
      userId: user._id,
      taxType: "Income",
      amount: 1200,
      year: new Date().getFullYear()
    });

    const mortgage = await Mortgage.create({
      userId: user._id,
      totalAmount: 900000,
      interestRate: 4.1,
      termYears: 25,
      monthlyPayment: 4800
    });

    created(res, { user, profile, investment, tax, mortgage });
  } catch (e) {
    handle(res, "smoketest")(e);
  }
});

// wipe everything (careful!)
router.delete("/wipe", async (_req, res) => {
  try {
    const [u, p, i, t, m] = await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Investment.deleteMany({}),
      Tax.deleteMany({}),
      Mortgage.deleteMany({}),
    ]);
    res.json({
      ok: true,
      deleted: {
        users: u.deletedCount,
        profiles: p.deletedCount,
        investments: i.deletedCount,
        taxes: t.deletedCount,
        mortgages: m.deletedCount,
      },
    });
  } catch (e) {
    handle(res, "wipe")(e);
  }
});

// counts for quick visibility
router.get("/counts", async (_req, res) => {
  try {
    const [users, profiles, investments, taxes, mortgages] = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments(),
      Investment.countDocuments(),
      Tax.countDocuments(),
      Mortgage.countDocuments(),
    ]);
    ok(res, { users, profiles, investments, taxes, mortgages });
  } catch (e) {
    handle(res, "counts")(e);
  }
});


// simple ping
router.get("/ping", (_req, res) => ok(res, "pong"));

export default router;
