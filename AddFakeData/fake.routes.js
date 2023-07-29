import express from "express";
import fakecontroller from "./fake.controllers.js";

const router = express.Router();

router.get("/fakeusers", fakecontroller.fakeusers);
router.get("/fakeloan", fakecontroller.fakeloan);
router.get("/fakeinvestment", fakecontroller.fakeinvestment);
router.get("/fakenotification", fakecontroller.fakenotification);
router.get("/faketransaction", fakecontroller.faketransaction);
router.get("/fakeadmintransaction", fakecontroller.fakeadmintransaction);
router.get("/fakecustomersupport", fakecontroller.fakecustomersupport);

export default router;
